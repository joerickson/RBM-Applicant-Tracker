'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Applicant, DropdownOption, Manager, HrRep, STATUS_COLORS } from '@/lib/types'
import { formatDate, isExpiringSoon, isExpired, cn } from '@/lib/utils'
import { Plus, Download, Search, Filter } from 'lucide-react'
import AddApplicantModal from './AddApplicantModal'
import * as XLSX from 'xlsx'

interface State { id: string; name: string }
interface Props {
  states: State[]
  dropdownOptions: DropdownOption[]
  managers: (Manager & { states?: { name: string } })[]
  hrReps: (HrRep & { states?: { name: string } })[]
}

export default function ApplicantTracker({ states, dropdownOptions, managers, hrReps }: Props) {
  const [activeStateId, setActiveStateId] = useState<string>(states[0]?.id || '')
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterManager, setFilterManager] = useState('')
  const [filterHrRep, setFilterHrRep] = useState('')
  const [filterReferral, setFilterReferral] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const supabase = createClient()
  const activeState = states.find(s => s.id === activeStateId)

  const stateManagers = managers.filter(m => m.state_id === activeStateId)
  const stateHrReps = hrReps.filter(h => h.state_id === activeStateId)
  const statusOptions = dropdownOptions.filter(o => o.category === 'status')
  const referralOptions = dropdownOptions.filter(o => o.category === 'referral_source')

  const fetchApplicants = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('applicants')
      .select('*, states(name)')
      .eq('state_id', activeStateId)
      .order('application_date', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filterStatus) query = query.eq('status', filterStatus)
    if (filterManager) query = query.eq('manager', filterManager)
    if (filterHrRep) query = query.eq('hr_rep', filterHrRep)
    if (filterReferral) query = query.eq('referral_source', filterReferral)
    if (search) query = query.or(`full_name.ilike.%${search}%,country_of_origin.ilike.%${search}%`)

    const { data } = await query
    setApplicants(data || [])
    setLoading(false)
  }, [activeStateId, filterStatus, filterManager, filterHrRep, filterReferral, search, page])

  useEffect(() => {
    if (activeStateId) fetchApplicants()
  }, [fetchApplicants, activeStateId])

  function exportToExcel() {
    const rows = applicants.map(a => ({
      Date: a.application_date,
      Name: a.full_name,
      'Document Type': a.document_type,
      'Doc Expiration': a.document_expiration_date || '',
      Country: a.country_of_origin || '',
      Status: a.status,
      Referral: a.referral_source || '',
      Manager: a.manager || '',
      'HR Rep': a.hr_rep || '',
      Notes: a.notes || '',
      Source: a.source,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, activeState?.name || 'Applicants')
    XLSX.writeFile(wb, `RBM_Applicants_${activeState?.name}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  function getExpiryClass(dateStr: string | null) {
    if (isExpired(dateStr)) return 'bg-red-50'
    if (isExpiringSoon(dateStr)) return 'bg-amber-50'
    return ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Applicant Tracker</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download size={14} /> Export Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rbm-blue text-white rounded-lg text-sm hover:bg-rbm-blue-dark"
          >
            <Plus size={14} /> Add Applicant
          </button>
        </div>
      </div>

      {/* State tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {states.map(state => (
          <button
            key={state.id}
            onClick={() => { setActiveStateId(state.id); setPage(0) }}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeStateId === state.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {state.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search name or country..."
            className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-52"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label_en}</option>)}
        </select>
        <select
          value={filterManager}
          onChange={e => { setFilterManager(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Managers</option>
          {stateManagers.map(m => <option key={m.id} value={m.full_name}>{m.full_name}</option>)}
        </select>
        <select
          value={filterHrRep}
          onChange={e => { setFilterHrRep(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All HR Reps</option>
          {stateHrReps.map(h => <option key={h.id} value={h.full_name}>{h.full_name}</option>)}
        </select>
        <select
          value={filterReferral}
          onChange={e => { setFilterReferral(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Referrals</option>
          {referralOptions.map(o => <option key={o.value} value={o.value}>{o.label_en}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Date','Name','Document','Expiration','Country','Status','Referral','Manager','HR Rep','Notes','Source'].map(h => (
                  <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={11} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : applicants.length === 0 ? (
                <tr><td colSpan={11} className="py-8 text-center text-gray-400">No applicants found</td></tr>
              ) : applicants.map(applicant => (
                <tr key={applicant.id} className={cn('hover:bg-gray-50', getExpiryClass(applicant.document_expiration_date))}>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(applicant.application_date)}</td>
                  <td className="px-3 py-2 font-medium">{applicant.full_name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{applicant.document_type.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={cn(
                      isExpired(applicant.document_expiration_date) ? 'text-red-600 font-medium' :
                      isExpiringSoon(applicant.document_expiration_date) ? 'text-amber-600 font-medium' : ''
                    )}>
                      {formatDate(applicant.document_expiration_date)}
                    </span>
                  </td>
                  <td className="px-3 py-2">{applicant.country_of_origin || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[applicant.status] || 'bg-gray-100 text-gray-800')}>
                      {applicant.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2">{applicant.referral_source?.replace(/_/g, ' ') || '—'}</td>
                  <td className="px-3 py-2">{applicant.manager || '—'}</td>
                  <td className="px-3 py-2">{applicant.hr_rep || '—'}</td>
                  <td className="px-3 py-2 max-w-xs truncate" title={applicant.notes || ''}>{applicant.notes || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs', applicant.source === 'portal' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600')}>
                      {applicant.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {page * PAGE_SIZE + 1}–{page * PAGE_SIZE + applicants.length}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 border rounded-lg disabled:opacity-40">
              Previous
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={applicants.length < PAGE_SIZE} className="px-3 py-1 border rounded-lg disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddApplicantModal
          states={states}
          activeStateId={activeStateId}
          dropdownOptions={dropdownOptions}
          managers={stateManagers}
          hrReps={stateHrReps}
          onClose={() => setShowAddModal(false)}
          onSaved={fetchApplicants}
        />
      )}
    </div>
  )
}
