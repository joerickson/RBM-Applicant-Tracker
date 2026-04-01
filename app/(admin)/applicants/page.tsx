'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { ApplicantTable, ApplicantRow } from '@/components/tracker/ApplicantTable'
import { ApplicantModal, Applicant } from '@/components/tracker/ApplicantModal'
import { FilterBar, FilterValues } from '@/components/tracker/FilterBar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface State {
  id: string
  name: string
  abbreviation: string
}

interface DropdownOption {
  value: string
  label: string
}

interface Manager {
  id: string
  name: string
  state_id: string
}

interface HrRep {
  id: string
  name: string
  state_id: string
}

export default function ApplicantsPage() {
  const t = useTranslations('applicants')
  const supabase = createClient()

  const [states, setStates] = useState<State[]>([])
  const [applicants, setApplicants] = useState<ApplicantRow[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [hrReps, setHrReps] = useState<HrRep[]>([])
  const [statusOptions, setStatusOptions] = useState<DropdownOption[]>([])
  const [documentTypeOptions, setDocumentTypeOptions] = useState<DropdownOption[]>([])
  const [referralSourceOptions, setReferralSourceOptions] = useState<DropdownOption[]>([])
  const [loading, setLoading] = useState(true)
  const [activeState, setActiveState] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null)
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: '',
    manager: '',
    hrRep: '',
    referralSource: '',
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [
        { data: statesData },
        { data: applicantsData },
        { data: managersData },
        { data: hrRepsData },
        { data: dropdownData },
      ] = await Promise.all([
        supabase.from('states').select('*').order('name'),
        supabase
          .from('applicants')
          .select('*, states(name), managers(name), hr_reps(name)')
          .order('application_date', { ascending: false }),
        supabase.from('managers').select('*'),
        supabase.from('hr_reps').select('*'),
        supabase.from('dropdown_options').select('*').order('sort_order'),
      ])

      setStates(statesData || [])
      setApplicants(
        (applicantsData || []).map((a: any) => ({
          ...a,
          state_name: a.states?.name,
          manager_name: a.managers?.name,
          hr_rep_name: a.hr_reps?.name,
        }))
      )
      setManagers(managersData || [])
      setHrReps(hrRepsData || [])

      const dropdowns = dropdownData || []
      setStatusOptions(
        dropdowns
          .filter((d: any) => d.category === 'status')
          .map((d: any) => ({ value: d.value, label: d.label_en }))
      )
      setDocumentTypeOptions(
        dropdowns
          .filter((d: any) => d.category === 'document_type')
          .map((d: any) => ({ value: d.value, label: d.label_en }))
      )
      setReferralSourceOptions(
        dropdowns
          .filter((d: any) => d.category === 'referral_source')
          .map((d: any) => ({ value: d.value, label: d.label_en }))
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredApplicants = useMemo(() => {
    let result = applicants

    // Filter by state tab
    if (activeState !== 'all') {
      result = result.filter((a) => a.state_id === activeState)
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (a) =>
          `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
          a.phone?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.position?.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (filters.status) {
      result = result.filter((a) => a.status === filters.status)
    }

    // Manager filter
    if (filters.manager) {
      result = result.filter((a) => a.manager_id === filters.manager)
    }

    // HR rep filter
    if (filters.hrRep) {
      result = result.filter((a) => a.hr_rep_id === filters.hrRep)
    }

    // Referral source filter
    if (filters.referralSource) {
      result = result.filter((a) => a.referral_source === filters.referralSource)
    }

    // Date range filter
    if (filters.dateFrom) {
      result = result.filter(
        (a) => a.application_date && a.application_date >= filters.dateFrom
      )
    }
    if (filters.dateTo) {
      result = result.filter(
        (a) => a.application_date && a.application_date <= filters.dateTo
      )
    }

    return result
  }, [applicants, activeState, filters])

  const statusLabels = useMemo(() => {
    const map: Record<string, string> = {}
    statusOptions.forEach((opt) => {
      map[opt.value] = opt.label
    })
    return map
  }, [statusOptions])

  const managerDropdownOptions = useMemo(
    () => managers.map((m) => ({ value: m.id, label: m.name })),
    [managers]
  )

  const hrRepDropdownOptions = useMemo(
    () => hrReps.map((h) => ({ value: h.id, label: h.name })),
    [hrReps]
  )

  const stateDropdownOptions = useMemo(
    () => states.map((s) => ({ value: s.id, label: s.name })),
    [states]
  )

  const handleSave = async (data: any) => {
    if (editingApplicant?.id) {
      await supabase
        .from('applicants')
        .update(data)
        .eq('id', editingApplicant.id)
    } else {
      await supabase.from('applicants').insert(data)
    }
    await loadData()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this applicant?')) {
      await supabase.from('applicants').delete().eq('id', id)
      await loadData()
    }
  }

  const handleEdit = (applicant: ApplicantRow) => {
    setEditingApplicant(applicant as Applicant)
    setModalOpen(true)
  }

  const handleExport = () => {
    const exportData = filteredApplicants.map((a) => ({
      'First Name': a.first_name,
      'Last Name': a.last_name,
      Phone: a.phone,
      Email: a.email || '',
      State: a.state_name || '',
      Status: statusLabels[a.status] || a.status,
      Manager: a.manager_name || '',
      'HR Rep': a.hr_rep_name || '',
      Position: a.position || '',
      'Referral Source': a.referral_source || '',
      'Application Date': a.application_date || '',
      'Start Date': a.start_date || '',
      'Document Type': a.document_type || '',
      'Document Expiration': a.document_expiration || '',
      Notes: a.notes || '',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Applicants')
    XLSX.writeFile(
      wb,
      `applicants-${new Date().toISOString().split('T')[0]}.xlsx`
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('export')}
          </Button>
          <Button
            onClick={() => {
              setEditingApplicant(null)
              setModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('addNew')}
          </Button>
        </div>
      </div>

      {/* State Tabs */}
      <Tabs value={activeState} onValueChange={setActiveState}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All States</TabsTrigger>
          {states.map((state) => (
            <TabsTrigger key={state.id} value={state.id}>
              {state.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeState} className="mt-4 space-y-4">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            statusOptions={statusOptions}
            managerOptions={managerDropdownOptions}
            hrRepOptions={hrRepDropdownOptions}
            referralSourceOptions={referralSourceOptions}
          />

          <ApplicantTable
            applicants={filteredApplicants}
            onEdit={handleEdit}
            onDelete={handleDelete}
            statusLabels={statusLabels}
          />
        </TabsContent>
      </Tabs>

      <ApplicantModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingApplicant(null)
        }}
        onSave={handleSave}
        applicant={editingApplicant}
        states={stateDropdownOptions}
        statusOptions={statusOptions}
        documentTypeOptions={documentTypeOptions}
        referralSourceOptions={referralSourceOptions}
        managerOptions={managerDropdownOptions}
        hrRepOptions={hrRepDropdownOptions}
      />
    </div>
  )
}
