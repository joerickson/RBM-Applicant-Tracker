import { createClient } from '@/lib/supabase/server'
import SettingsClient from '@/components/tracker/SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()

  const [
    { data: states },
    { data: dropdownOptions },
    { data: managers },
    { data: hrReps },
  ] = await Promise.all([
    supabase.from('states').select('*').order('name'),
    supabase.from('dropdown_options').select('*').order('category').order('display_order'),
    supabase.from('managers').select('*, states(name)').order('full_name'),
    supabase.from('hr_reps').select('*, states(name)').order('full_name'),
  ])

  return (
    <SettingsClient
      states={states || []}
      dropdownOptions={dropdownOptions || []}
      managers={managers || []}
      hrReps={hrReps || []}
    />
  )
}
