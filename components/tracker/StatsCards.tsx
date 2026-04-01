import { Users, UserCheck, TrendingUp, Clock, Inbox } from 'lucide-react'

interface StateStatRow {
  state_name: string
  total: number
  hired: number
}

interface Props {
  stateStats: StateStatRow[]
  inProcess: number
  portalPending: number
}

export default function StatsCards({ stateStats, inProcess, portalPending }: Props) {
  const totalApplicants = stateStats.reduce((sum, s) => sum + s.total, 0)
  const totalHired = stateStats.reduce((sum, s) => sum + s.hired, 0)
  const hireRate = totalApplicants > 0 ? Math.round((totalHired / totalApplicants) * 100) : 0

  const cards = [
    {
      label: 'Total Applicants This Month',
      value: totalApplicants,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Hired This Month',
      value: totalHired,
      icon: UserCheck,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Hire Rate',
      value: `${hireRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'In Process',
      value: inProcess,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Portal Submissions Pending',
      value: portalPending,
      icon: Inbox,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
            <Icon size={18} />
          </div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}
