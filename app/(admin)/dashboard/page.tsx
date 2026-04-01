import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, TrendingUp, Clock, FileText } from 'lucide-react'
import { startOfMonth, endOfMonth } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

async function getDashboardStats() {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd = endOfMonth(now).toISOString()

  // Total applicants this month by state
  const { data: applicantsThisMonth } = await supabase
    .from('applicants')
    .select('id, state_id, states(name)')
    .gte('application_date', monthStart)
    .lte('application_date', monthEnd)

  // Hired this month
  const { data: hiredThisMonth } = await supabase
    .from('applicants')
    .select('id')
    .eq('status', 'hired')
    .gte('start_date', monthStart)
    .lte('start_date', monthEnd)

  // In process count
  const { data: inProcess } = await supabase
    .from('applicants')
    .select('id')
    .in('status', ['screening', 'interview', 'offer', 'in_process', 'pending_docs'])

  // Portal pending
  const { data: portalPending } = await supabase
    .from('applications')
    .select('id')
    .eq('status', 'portal_submitted')

  // Status breakdown for chart
  const { data: allApplicants } = await supabase
    .from('applicants')
    .select('status, state_id, states(name)')

  const totalThisMonth = applicantsThisMonth?.length || 0
  const totalHired = hiredThisMonth?.length || 0
  const hireRate =
    totalThisMonth > 0 ? ((totalHired / totalThisMonth) * 100).toFixed(1) : '0'

  // Applicants by state
  const byState: Record<string, number> = {}
  applicantsThisMonth?.forEach((a: any) => {
    const stateName = a.states?.name || 'Unknown'
    byState[stateName] = (byState[stateName] || 0) + 1
  })
  const stateChartData = Object.entries(byState).map(([name, count]) => ({
    name,
    count,
  }))

  // Status breakdown
  const byStatus: Record<string, number> = {}
  allApplicants?.forEach((a: any) => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1
  })
  const statusChartData = Object.entries(byStatus).map(([name, value]) => ({
    name,
    value,
  }))

  return {
    totalThisMonth,
    totalHired,
    hireRate,
    inProcess: inProcess?.length || 0,
    portalPending: portalPending?.length || 0,
    stateChartData,
    statusChartData,
  }
}

const STATUS_COLORS: Record<string, string> = {
  applied: '#3b82f6',
  screening: '#8b5cf6',
  interview: '#eab308',
  offer: '#f97316',
  hired: '#22c55e',
  rejected: '#ef4444',
  withdrawn: '#6b7280',
  in_process: '#6366f1',
  pending_docs: '#f59e0b',
  portal_submitted: '#14b8a6',
}

const PIE_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#eab308',
  '#f97316',
  '#22c55e',
  '#ef4444',
  '#6b7280',
  '#6366f1',
  '#f59e0b',
  '#14b8a6',
]

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Total Applicants This Month',
      value: stats.totalThisMonth,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Hired This Month',
      value: stats.totalHired,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Hire Rate',
      value: `${stats.hireRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'In Process',
      value: stats.inProcess,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Portal Pending Review',
      value: stats.portalPending,
      icon: FileText,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of applicant activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {card.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applicants by State (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.stateChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.stateChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No data available for this month
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Breakdown (All Time)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.name] ||
                          PIE_COLORS[index % PIE_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs capitalize">
                        {value.replace(/_/g, ' ')}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No applicant data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
