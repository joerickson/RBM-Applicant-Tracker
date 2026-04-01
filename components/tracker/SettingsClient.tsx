'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DropdownOption, Manager, HrRep } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

interface State { id: string; name: string }
interface Props {
  states: State[]
  dropdownOptions: DropdownOption[]
  managers: (Manager & { states?: { name: string } })[]
  hrReps: (HrRep & { states?: { name: string } })[]
}

type Tab = 'dropdowns' | 'managers' | 'hr_reps'

export default function SettingsClient({ states, dropdownOptions: initialOptions, managers: initialManagers, hrReps: initialHrReps }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('dropdowns')
  const [options, setOptions] = useState(initialOptions)
  const [managers, setManagers] = useState(initialManagers)
  const [hrReps, setHrReps] = useState(initialHrReps)
  const [selectedState, setSelectedState] = useState<string>('all')
  const supabase = createClient()

  const tabs = [
    { id: 'dropdowns' as Tab, label: 'Dropdown Options' },
    { id: 'managers' as Tab, label: 'Managers' },
    { id: 'hr_reps' as Tab, label: 'HR Reps' },
  ]

  const CATEGORIES = ['document_type', 'status', 'referral_source']

  async function toggleOption(option: DropdownOption) {
    const { error } = await supabase
      .from('dropdown_options')
      .update({ active: !option.active })
      .eq('id', option.id)
    if (!error) {
      setOptions(opts => opts.map(o => o.id === option.id ? { ...o, active: !o.active } : o))
    }
  }

  async function toggleManager(manager: Manager) {
    const { error } = await supabase
      .from('managers')
      .update({ active: !manager.active })
      .eq('id', manager.id)
    if (!error) {
      setManagers(ms => ms.map(m => m.id === manager.id ? { ...m, active: !m.active } : m))
    }
  }

  async function toggleHrRep(rep: HrRep) {
    const { error } = await supabase
      .from('hr_reps')
      .update({ active: !rep.active })
      .eq('id', rep.id)
    if (!error) {
      setHrReps(rs => rs.map(r => r.id === rep.id ? { ...r, active: !r.active } : r))
    }
  }

  const filteredManagers = selectedState === 'all'
    ? managers
    : managers.filter(m => m.state_id === selectedState)

  const filteredHrReps = selectedState === 'all'
    ? hrReps
    : hrReps.filter(h => h.state_id === selectedState)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage dropdown options, managers, and HR representatives</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dropdowns' && (
        <div className="space-y-6">
          {CATEGORIES.map(category => (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900 capitalize">{category.replace(/_/g, ' ')}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {options.filter(o => o.category === category).map(option => (
                  <div key={option.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{option.label_en}</p>
                      <p className="text-xs text-gray-500">{option.label_es} · <code className="text-xs bg-gray-100 px-1 rounded">{option.value}</code></p>
                    </div>
                    <button onClick={() => toggleOption(option)} className="text-gray-400 hover:text-gray-600">
                      {option.active
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(activeTab === 'managers' || activeTab === 'hr_reps') && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All States</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {(activeTab === 'managers' ? filteredManagers : filteredHrReps).map(person => (
                <div key={person.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{person.full_name}</p>
                    <p className="text-xs text-gray-400">{'states' in person && person.states ? (person.states as { name: string }).name : ''}</p>
                  </div>
                  <button
                    onClick={() => activeTab === 'managers' ? toggleManager(person as Manager) : toggleHrRep(person as HrRep)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {person.active
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} />}
                  </button>
                </div>
              ))}
              {(activeTab === 'managers' ? filteredManagers : filteredHrReps).length === 0 && (
                <p className="px-5 py-8 text-center text-gray-400 text-sm">No records found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
