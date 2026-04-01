/**
 * Excel Data Migration Script
 * Usage: npx ts-node --project tsconfig.scripts.json scripts/import-excel.ts ./Applicant_Tracking_2026.xlsx
 *
 * Each sheet in the Excel file maps to a state: Utah, Nevada, Arizona, Texas
 */

import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Map from Excel column headers to DB fields (adjust as needed)
const COLUMN_MAP: Record<string, string> = {
  'date': 'application_date',
  'application date': 'application_date',
  'name': 'full_name',
  'full name': 'full_name',
  'document': 'document_type',
  'document type': 'document_type',
  'doc type': 'document_type',
  'expiration': 'document_expiration_date',
  'doc expiration': 'document_expiration_date',
  'expiration date': 'document_expiration_date',
  'country': 'country_of_origin',
  'country of origin': 'country_of_origin',
  'status': 'status',
  'referral': 'referral_source',
  'referral source': 'referral_source',
  'how heard': 'referral_source',
  'manager': 'manager',
  'hr rep': 'hr_rep',
  'hr': 'hr_rep',
  'notes': 'notes',
}

// Normalize document type values from Excel to DB values
const DOC_TYPE_MAP: Record<string, string> = {
  'us citizen': 'us_citizen',
  'us-citizen': 'us_citizen',
  'citizen': 'us_citizen',
  'permanent resident': 'permanent_resident',
  'permanent residen': 'permanent_resident',
  'perm resident': 'permanent_resident',
  'employment authorization': 'employment_authorization',
  'employment auth': 'employment_authorization',
  'work permit': 'employment_authorization',
  'ead': 'employment_authorization',
}

// Normalize status values
const STATUS_MAP: Record<string, string> = {
  'hired': 'hired',
  'hire': 'hired',
  'rehire': 'rehire',
  're-hire': 'rehire',
  're hire': 'rehire',
  'record': 'record',
  'on process': 'on_process',
  'on process still': 'on_process',
  'in process': 'on_process',
  'declined': 'declined',
  'declined position': 'declined',
  'ssn': 'ssn',
  'c11': 'c11',
  'ids': 'ids',
  "id's": 'ids',
  'other': 'other',
  'minor': 'minor',
  'minor candidate': 'minor',
  'transfer': 'transfer',
  'transferred': 'transfer',
}

const REFERRAL_MAP: Record<string, string> = {
  'referral': 'referral',
  'walk in': 'walk_in',
  'walk-in': 'walk_in',
  'walkin': 'walk_in',
  'indeed': 'indeed',
  'qr code': 'qr_code',
  'qr': 'qr_code',
  'rbm website': 'rbm_website',
  'rbm web': 'rbm_website',
  'lds website': 'lds_website',
  'lds web': 'lds_website',
  'phone call': 'phone_call',
  'phone': 'phone_call',
  'job fair': 'job_fair',
  'facebook': 'facebook',
  'fb': 'facebook',
}

function normalize(map: Record<string, string>, value: string): string | null {
  const lower = value.toLowerCase().trim()
  return map[lower] || null
}

function excelDateToIso(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'number') {
    // Excel serial date
    const date = new Date((value - 25569) * 86400 * 1000)
    return date.toISOString().slice(0, 10)
  }
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  }
  return null
}

interface ImportRow {
  [key: string]: unknown
}

interface MappedRow {
  state_id: string
  application_date: string
  full_name: string
  document_type: string
  document_expiration_date: string | null
  country_of_origin: string | null
  status: string
  referral_source: string | null
  manager: string | null
  hr_rep: string | null
  notes: string | null
  source: 'manual'
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: ts-node scripts/import-excel.ts <path-to-excel-file>')
    process.exit(1)
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  console.log(`Reading ${path.basename(filePath)}...`)
  const workbook = XLSX.readFile(filePath)

  // Fetch state records
  const { data: states, error: statesError } = await supabase.from('states').select('*')
  if (statesError || !states) {
    console.error('Failed to fetch states:', statesError?.message)
    process.exit(1)
  }
  const stateMap = Object.fromEntries(states.map(s => [s.name.toLowerCase(), s.id]))

  const unmappable: Array<{ sheet: string; row: number; issue: string; data: ImportRow }> = []
  let totalInserted = 0

  for (const sheetName of workbook.SheetNames) {
    // Match sheet name to state
    const stateName = Object.keys(stateMap).find(s => sheetName.toLowerCase().includes(s))
    if (!stateName) {
      console.warn(`Skipping sheet "${sheetName}" — no matching state`)
      continue
    }
    const stateId = stateMap[stateName]
    console.log(`\nProcessing sheet: ${sheetName} → ${stateName}`)

    const sheet = workbook.Sheets[sheetName]
    const rows: ImportRow[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    const toInsert: MappedRow[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const mapped: Partial<MappedRow> & { state_id: string; source: 'manual' } = {
        state_id: stateId,
        source: 'manual',
      }

      // Map columns
      for (const [excelCol, value] of Object.entries(row)) {
        const dbField = COLUMN_MAP[excelCol.toLowerCase().trim()]
        if (!dbField || !value) continue

        if (dbField === 'application_date' || dbField === 'document_expiration_date') {
          mapped[dbField as keyof MappedRow] = excelDateToIso(value) as never
        } else if (dbField === 'document_type') {
          const norm = normalize(DOC_TYPE_MAP, String(value))
          if (norm) {
            (mapped as Record<string, unknown>)[dbField] = norm
          } else {
            unmappable.push({ sheet: sheetName, row: i + 2, issue: `Unknown document_type: "${value}"`, data: row })
            ;(mapped as Record<string, unknown>)[dbField] = String(value).toLowerCase().replace(/\s+/g, '_')
          }
        } else if (dbField === 'status') {
          const norm = normalize(STATUS_MAP, String(value))
          if (norm) {
            (mapped as Record<string, unknown>)[dbField] = norm
          } else {
            unmappable.push({ sheet: sheetName, row: i + 2, issue: `Unknown status: "${value}"`, data: row })
            ;(mapped as Record<string, unknown>)[dbField] = String(value).toLowerCase().replace(/\s+/g, '_')
          }
        } else if (dbField === 'referral_source') {
          const norm = normalize(REFERRAL_MAP, String(value))
          ;(mapped as Record<string, unknown>)[dbField] = norm || String(value)
        } else {
          ;(mapped as Record<string, unknown>)[dbField] = String(value) || null
        }
      }

      // Validate required fields
      if (!mapped.full_name || !mapped.application_date || !mapped.document_type || !mapped.status) {
        unmappable.push({ sheet: sheetName, row: i + 2, issue: 'Missing required fields', data: row })
        continue
      }

      toInsert.push(mapped as MappedRow)
    }

    // Batch insert
    if (toInsert.length > 0) {
      const BATCH = 100
      for (let b = 0; b < toInsert.length; b += BATCH) {
        const batch = toInsert.slice(b, b + BATCH)
        const { error } = await supabase.from('applicants').insert(batch)
        if (error) {
          console.error(`  Error inserting batch starting at row ${b + 2}:`, error.message)
        } else {
          totalInserted += batch.length
          console.log(`  Inserted rows ${b + 1}–${Math.min(b + BATCH, toInsert.length)}`)
        }
      }
    }
  }

  console.log(`\n✅ Done. Inserted ${totalInserted} applicants.`)

  if (unmappable.length > 0) {
    console.log(`\n⚠️  ${unmappable.length} rows need manual review:`)
    const logPath = path.join(path.dirname(filePath), 'import-errors.json')
    fs.writeFileSync(logPath, JSON.stringify(unmappable, null, 2))
    console.log(`   Logged to: ${logPath}`)
  }
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
