import { createClient } from '@/lib/supabase/server'
import ApplicantTracker from '@/components/tracker/ApplicantTracker'

export default async function ApplicantsPage() {
  const supabase = createClient()

  const [
    { data: states },
    { data: dropdownOptions },
    { data: managers },
    { data: hrReps },
  ] = await Promise.all([
    supabase.from('states').select('*').order('name'),
    supabase.from('dropdown_options').select('*').eq('active', true).order('display_order'),
    supabase.from('managers').select('*, states(name)').eq('active', true),
    supabase.from('hr_reps').select('*, states(name)').eq('active', true),
  ])

  return (
    <ApplicantTracker
      states={states || []}
      dropdownOptions={dropdownOptions || []}
      managers={managers || []}
      hrReps={hrReps || []}
    />
  )
}
