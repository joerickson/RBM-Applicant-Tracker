export type UserRole = 'super_admin' | 'state_admin' | 'hr_rep' | 'read_only'

export interface State {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  state_ids: string[]
  created_at: string
  updated_at: string
}

export interface Applicant {
  id: string
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
  source: 'manual' | 'portal'
  portal_application_id: string | null
  created_at: string
  updated_at: string
  states?: State
}

export interface Application {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state_applying: string
  document_type: string
  document_expiration_date: string | null
  country_of_origin: string | null
  referral_source: string | null
  referral_name: string | null
  position_interest: string | null
  available_start_date: string | null
  authorized_to_work: boolean
  consent_given: boolean
  language: 'en' | 'es'
  reviewed: boolean
  converted_to_applicant: boolean
  submitted_at: string
}

export interface DropdownOption {
  id: string
  category: string
  state_id: string | null
  value: string
  label_en: string
  label_es: string
  display_order: number
  active: boolean
}

export interface Manager {
  id: string
  state_id: string
  full_name: string
  active: boolean
}

export interface HrRep {
  id: string
  state_id: string
  full_name: string
  email: string | null
  active: boolean
}

export const STATES = ['Utah', 'Nevada', 'Arizona', 'Texas'] as const
export type StateName = typeof STATES[number]

export const STATE_SLUGS: Record<string, StateName> = {
  utah: 'Utah',
  nevada: 'Nevada',
  arizona: 'Arizona',
  texas: 'Texas',
}

export const STATUS_COLORS: Record<string, string> = {
  hired: 'bg-green-100 text-green-800',
  rehire: 'bg-green-100 text-green-800',
  on_process: 'bg-yellow-100 text-yellow-800',
  record: 'bg-gray-100 text-gray-800',
  declined: 'bg-red-100 text-red-800',
  ssn: 'bg-orange-100 text-orange-800',
  c11: 'bg-orange-100 text-orange-800',
  ids: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
  minor: 'bg-purple-100 text-purple-800',
  transfer: 'bg-blue-100 text-blue-800',
}
