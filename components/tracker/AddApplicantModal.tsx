'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DropdownOption, Manager, HrRep } from '@/lib/types'
import { X } from 'lucide-react'

interface State { id: string; name: string }
interface Props {
  states: State[]
  activeStateId: string
  dropdownOptions: DropdownOption[]
  managers: Manager[]
  hrReps: HrRep[]
  onClose: () => void
  onSaved: () => void
}

export default function AddApplicantModal({ states, activeStateId, dropdownOptions, managers, hrReps, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    state_id: activeStateId,
    application_date: new Date().toISOString().slice(0, 10),
    full_name: '',
    document_type: '',
    document_expiration_date: '',
    country_of_origin: '',
    status: '',
    referral_source: '',
    manager: '',
    hr_rep: '',
    notes: '',
    source: 'manual' as const,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const docTypes = dropdownOptions.filter(o => o.category === 'document_type')
  const statuses = dropdownOptions.filter(o => o.category === 'status')
  const referrals = dropdownOptions.filter(o => o.category === 'referral_source')

  const stateManagers = managers.filter(m => m.state_id === form.state_id)
  const stateHrReps = hrReps.filter(h => h.state_id === form.state_id)

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...form,
      document_expiration_date: form.document_expiration_date || null,
      country_of_origin: form.country_of_origin || null,
      referral_source: form.referral_source || null,
      manager: form.manager || null,
      hr_rep: form.hr_rep || null,
      notes: form.notes || null,
    }

    const { error } = await supabase.from('applicants').insert(payload)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">Add New Applicant</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select required value={form.state_id} onChange={e => set('state_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Date *</label>
              <input type="date" required value={form.application_date} onChange={e => set('application_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" required value={form.full_name} onChange={e => set('full_name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
              <select required value={form.document_type} onChange={e => set('document_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {docTypes.map(o => <option key={o.value} value={o.value}>{o.label_en}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doc Expiration</label>
              <input type="date" value={form.document_expiration_date} onChange={e => set('document_expiration_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
              <input type="text" value={form.country_of_origin} onChange={e => set('country_of_origin', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select required value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {statuses.map(o => <option key={o.value} value={o.value}>{o.label_en}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referral Source</label>
              <select value={form.referral_source} onChange={e => set('referral_source', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {referrals.map(o => <option key={o.value} value={o.value}>{o.label_en}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <select value={form.manager} onChange={e => set('manager', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {stateManagers.map(m => <option key={m.id} value={m.full_name}>{m.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HR Rep</label>
              <select value={form.hr_rep} onChange={e => set('hr_rep', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {stateHrReps.map(h => <option key={h.id} value={h.full_name}>{h.full_name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-rbm-blue text-white rounded-lg text-sm hover:bg-rbm-blue-dark disabled:opacity-60">
              {loading ? 'Saving...' : 'Add Applicant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
