/**
 * Import Excel data into the RBM Applicant Tracker Supabase database.
 *
 * Usage:
 *   npx ts-node --project tsconfig.scripts.json scripts/import-excel.ts --file path/to/file.xlsx
 *
 * The script expects each sheet to correspond to a state (Utah, Nevada, Arizona, Texas).
 * Columns expected (case-insensitive):
 *   First Name, Last Name, Phone, Email, Position, Status, Manager,
 *   Referral Source, Application Date, Start Date, Document Type,
 *   Document Expiration, Notes
 */

import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as fs from 'fs'

// --- Configuration ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Map sheet names to state abbreviations
const STATE_SHEET_MAP: Record<string, string> = {
  utah: 'UT',
  nevada: 'NV',
  arizona: 'AZ',
  texas: 'TX',
  ut: 'UT',
  nv: 'NV',
  az: 'AZ',
  tx: 'TX',
}

// Normalize status values
const STATUS_MAP: Record<string, string> = {
  applied: 'applied',
  applying: 'applied',
  screening: 'screening',
  screen: 'screening',
  interview: 'interview',
  'in interview': 'interview',
  offer: 'offer',
  offered: 'offer',
  hired: 'hired',
  'in process': 'in_process',
  'in-process': 'in_process',
  inprocess: 'in_process',
  'pending docs': 'pending_docs',
  'pending documents': 'pending_docs',
  rejected: 'rejected',
  'not hired': 'rejected',
  withdrawn: 'withdrawn',
  withdrew: 'withdrawn',
}

// Normalize document type values
const DOCUMENT_MAP: Record<string, string> = {
  'social security': 'ssn',
  ssn: 'ssn',
  'social security card': 'ssn',
  ead: 'ead',
  'employment authorization': 'ead',
  'green card': 'greencard',
  greencard: 'greencard',
  'permanent resident': 'greencard',
  passport: 'passport',
  'us passport': 'passport',
  'work visa': 'visa',
  visa: 'visa',
  "driver's license": 'dl',
  'drivers license': 'dl',
  dl: 'dl',
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, '_')
}

function parseDate(value: any): string | null {
  if (!value) return null
  if (typeof value === 'number') {
    // Excel date serial
    const date = XLSX.SSF.parse_date_code(value)
    if (!date) return null
    const y = date.y
    const m = String(date.m).padStart(2, '0')
    const d = String(date.d).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const str = String(value).trim()
  if (!str) return null
  const d = new Date(str)
  if (isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

function normalizeStatus(raw: string | null | undefined): string {
  if (!raw) return 'applied'
  const key = raw.toLowerCase().trim()
  return STATUS_MAP[key] || 'applied'
}

function normalizeDocumentType(raw: string | null | undefined): string | null {
  if (!raw) return null
  const key = raw.toLowerCase().trim()
  return DOCUMENT_MAP[key] || raw.toLowerCase().replace(/\s+/g, '_')
}

interface ExcelRow {
  [key: string]: any
}

async function getStates(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('states').select('id, abbreviation')
  if (error) throw new Error(`Failed to fetch states: ${error.message}`)
  const map: Record<string, string> = {}
  for (const s of data || []) {
    map[s.abbreviation] = s.id
  }
  return map
}

async function getManagers(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('managers').select('id, name')
  if (error) throw new Error(`Failed to fetch managers: ${error.message}`)
  const map: Record<string, string> = {}
  for (const m of data || []) {
    map[m.name.toLowerCase().trim()] = m.id
  }
  return map
}

async function processSheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string,
  stateMap: Record<string, string>,
  managerMap: Record<string, string>
): Promise<number> {
  const abbrev = STATE_SHEET_MAP[sheetName.toLowerCase()]
  if (!abbrev) {
    console.warn(`  Skipping sheet "${sheetName}" - no matching state found`)
    return 0
  }

  const stateId = stateMap[abbrev]
  if (!stateId) {
    console.warn(`  Skipping sheet "${sheetName}" - state ${abbrev} not in database`)
    return 0
  }

  const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
    raw: false,
    defval: null,
  })

  if (jsonData.length === 0) {
    console.log(`  Sheet "${sheetName}": no data rows`)
    return 0
  }

  // Normalize headers
  const normalizedRows = jsonData.map((row) => {
    const normalized: Record<string, any> = {}
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeHeader(key)] = value
    }
    return normalized
  })

  const records = normalizedRows.map((row) => {
    const firstName = String(row['first_name'] || row['firstname'] || '').trim()
    const lastName = String(row['last_name'] || row['lastname'] || '').trim()
    const phone = String(row['phone'] || row['phone_number'] || '').trim()

    if (!firstName || !lastName || !phone) return null

    const managerRaw = String(row['manager'] || '').toLowerCase().trim()
    const managerId = managerMap[managerRaw] || null

    return {
      first_name: firstName,
      last_name: lastName,
      phone,
      email: row['email'] ? String(row['email']).trim() : null,
      state_id: stateId,
      position: row['position'] ? String(row['position']).trim() : null,
      status: normalizeStatus(row['status']),
      manager_id: managerId,
      referral_source: row['referral_source'] || row['referral'] || null,
      application_date: parseDate(row['application_date'] || row['date']),
      start_date: parseDate(row['start_date']),
      document_type: normalizeDocumentType(row['document_type'] || row['doc_type']),
      document_expiration: parseDate(
        row['document_expiration'] || row['doc_expiration'] || row['expiration_date']
      ),
      notes: row['notes'] ? String(row['notes']).trim() : null,
    }
  }).filter(Boolean)

  if (records.length === 0) {
    console.log(`  Sheet "${sheetName}": no valid records`)
    return 0
  }

  // Insert in batches of 100
  let inserted = 0
  const batchSize = 100
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const { error } = await supabase.from('applicants').insert(batch)
    if (error) {
      console.error(`  Error inserting batch starting at row ${i}: ${error.message}`)
    } else {
      inserted += batch.length
    }
  }

  return inserted
}

async function importExcel(filePath: string): Promise<void> {
  console.log(`\nImporting: ${filePath}`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const workbook = XLSX.readFile(filePath)
  console.log(`Found ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}`)

  const [stateMap, managerMap] = await Promise.all([getStates(), getManagers()])
  console.log(`Loaded ${Object.keys(stateMap).length} states, ${Object.keys(managerMap).length} managers`)

  let totalInserted = 0

  for (const sheetName of workbook.SheetNames) {
    console.log(`\nProcessing sheet: "${sheetName}"`)
    const worksheet = workbook.Sheets[sheetName]
    const count = await processSheet(worksheet, sheetName, stateMap, managerMap)
    console.log(`  Inserted ${count} records`)
    totalInserted += count
  }

  console.log(`\nImport complete. Total records inserted: ${totalInserted}`)
}

// Parse command line arguments
const args = process.argv.slice(2)
const fileArgIndex = args.indexOf('--file')
if (fileArgIndex === -1 || !args[fileArgIndex + 1]) {
  console.error('Usage: ts-node scripts/import-excel.ts --file <path-to-xlsx>')
  process.exit(1)
}

const filePath = path.resolve(args[fileArgIndex + 1])

importExcel(filePath)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Import failed:', err)
    process.exit(1)
  })
