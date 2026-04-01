import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import StatsCards from '@/components/tracker/StatsCards'
import ApplicantCharts from '@/components/tracker/ApplicantCharts'

export default async function DashboardPage() {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { data: stateStats },
    { count: inProcess },
    { count: portalPending },
    { data: monthlyData },
    { data: referralData },
    { data: statusData },
  ] = await Promise.all([
    supabase.rpc('get_state_stats', { since: startOfMonth }),
    supabase
      .from('applicants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'on_process'),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('reviewed', false)
      .eq('converted_to_applicant', false),
    supabase.rpc('get_monthly_applicants'),
    supabase
      .from('applicants')
      .select('referral_source')
      .not('referral_source', 'is', null),
    supabase
      .from('applicants')
      .select('status'),
  ])

  // Compute referral breakdown
  const referralCounts: Record<string, number> = {}
  for (const row of referralData || []) {
    if (row.referral_source) {
      referralCounts[row.referral_source] = (referralCounts[row.referral_source] || 0) + 1
    }
  }
  const referralChartData = Object.entries(referralCounts).map(([name, value]) => ({ name, value }))

  // Compute status breakdown
  const statusCounts: Record<string, number> = {}
  for (const row of statusData || []) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1
  }
  const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview for {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      <StatsCards
        stateStats={stateStats || []}
        inProcess={inProcess || 0}
        portalPending={portalPending || 0}
      />

      <ApplicantCharts
        monthlyData={monthlyData || []}
        referralData={referralChartData}
        statusData={statusChartData}
      />
    </div>
  )
}
