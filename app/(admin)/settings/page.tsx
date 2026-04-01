'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Save } from 'lucide-react'

interface DropdownOption {
  id: string
  category: string
  value: string
  label_en: string
  label_es: string
  sort_order: number
}

interface Manager {
  id: string
  name: string
  state_id: string
  email: string | null
  phone: string | null
  state?: { name: string }
}

interface HrRep {
  id: string
  name: string
  state_id: string
  email: string | null
  state?: { name: string }
}

interface State {
  id: string
  name: string
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const supabase = createClient()

  const [states, setStates] = useState<State[]>([])
  const [dropdowns, setDropdowns] = useState<DropdownOption[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [hrReps, setHrReps] = useState<HrRep[]>([])
  const [loading, setLoading] = useState(true)

  // New item forms
  const [newDropdown, setNewDropdown] = useState({
    category: 'status',
    value: '',
    label_en: '',
    label_es: '',
  })
  const [newManager, setNewManager] = useState({
    name: '',
    state_id: '',
    email: '',
    phone: '',
  })
  const [newHrRep, setNewHrRep] = useState({
    name: '',
    state_id: '',
    email: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [
      { data: statesData },
      { data: dropdownsData },
      { data: managersData },
      { data: hrRepsData },
    ] = await Promise.all([
      supabase.from('states').select('*').order('name'),
      supabase.from('dropdown_options').select('*').order('category, sort_order'),
      supabase.from('managers').select('*, states(name)').order('name'),
      supabase.from('hr_reps').select('*, states(name)').order('name'),
    ])

    setStates(statesData || [])
    setDropdowns(dropdownsData || [])
    setManagers(managersData || [])
    setHrReps(hrRepsData || [])
    setLoading(false)
  }

  const addDropdown = async () => {
    if (!newDropdown.value || !newDropdown.label_en) return
    await supabase.from('dropdown_options').insert({
      ...newDropdown,
      sort_order: dropdowns.filter((d) => d.category === newDropdown.category).length,
    })
    setNewDropdown({ category: 'status', value: '', label_en: '', label_es: '' })
    await loadData()
  }

  const deleteDropdown = async (id: string) => {
    if (confirm('Delete this option?')) {
      await supabase.from('dropdown_options').delete().eq('id', id)
      await loadData()
    }
  }

  const addManager = async () => {
    if (!newManager.name || !newManager.state_id) return
    await supabase.from('managers').insert(newManager)
    setNewManager({ name: '', state_id: '', email: '', phone: '' })
    await loadData()
  }

  const deleteManager = async (id: string) => {
    if (confirm('Delete this manager?')) {
      await supabase.from('managers').delete().eq('id', id)
      await loadData()
    }
  }

  const addHrRep = async () => {
    if (!newHrRep.name || !newHrRep.state_id) return
    await supabase.from('hr_reps').insert(newHrRep)
    setNewHrRep({ name: '', state_id: '', email: '' })
    await loadData()
  }

  const deleteHrRep = async (id: string) => {
    if (confirm('Delete this HR rep?')) {
      await supabase.from('hr_reps').delete().eq('id', id)
      await loadData()
    }
  }

  const DROPDOWN_CATEGORIES = [
    { value: 'status', label: t('dropdowns.categories.status') },
    { value: 'document_type', label: t('dropdowns.categories.document_type') },
    { value: 'referral_source', label: t('dropdowns.categories.referral_source') },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <Tabs defaultValue="dropdowns">
        <TabsList>
          <TabsTrigger value="dropdowns">{t('tabs.dropdowns')}</TabsTrigger>
          <TabsTrigger value="managers">{t('tabs.managers')}</TabsTrigger>
          <TabsTrigger value="hrReps">{t('tabs.hrReps')}</TabsTrigger>
          <TabsTrigger value="users">{t('tabs.users')}</TabsTrigger>
        </TabsList>

        {/* Dropdowns Tab */}
        <TabsContent value="dropdowns" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('dropdowns.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new dropdown */}
              <div className="flex gap-2 flex-wrap items-end p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('dropdowns.category')}</label>
                  <Select
                    value={newDropdown.category}
                    onValueChange={(v) =>
                      setNewDropdown({ ...newDropdown, category: v })
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DROPDOWN_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('dropdowns.value')}</label>
                  <Input
                    placeholder="value_key"
                    value={newDropdown.value}
                    onChange={(e) =>
                      setNewDropdown({ ...newDropdown, value: e.target.value })
                    }
                    className="w-[140px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('dropdowns.labelEn')}</label>
                  <Input
                    placeholder="English label"
                    value={newDropdown.label_en}
                    onChange={(e) =>
                      setNewDropdown({ ...newDropdown, label_en: e.target.value })
                    }
                    className="w-[160px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('dropdowns.labelEs')}</label>
                  <Input
                    placeholder="Etiqueta en español"
                    value={newDropdown.label_es}
                    onChange={(e) =>
                      setNewDropdown({ ...newDropdown, label_es: e.target.value })
                    }
                    className="w-[160px]"
                  />
                </div>
                <Button onClick={addDropdown} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('dropdowns.addOption')}
                </Button>
              </div>

              {/* Dropdown options table */}
              {DROPDOWN_CATEGORIES.map((cat) => (
                <div key={cat.value}>
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
                    {cat.label}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('dropdowns.value')}</TableHead>
                        <TableHead>{t('dropdowns.labelEn')}</TableHead>
                        <TableHead>{t('dropdowns.labelEs')}</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dropdowns
                        .filter((d) => d.category === cat.value)
                        .map((option) => (
                          <TableRow key={option.id}>
                            <TableCell className="font-mono text-xs">
                              {option.value}
                            </TableCell>
                            <TableCell>{option.label_en}</TableCell>
                            <TableCell>{option.label_es}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDropdown(option.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Managers Tab */}
        <TabsContent value="managers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('managers.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap items-end p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('managers.name')}</label>
                  <Input
                    value={newManager.name}
                    onChange={(e) =>
                      setNewManager({ ...newManager, name: e.target.value })
                    }
                    className="w-[180px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('managers.state')}</label>
                  <Select
                    value={newManager.state_id}
                    onValueChange={(v) =>
                      setNewManager({ ...newManager, state_id: v })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('managers.email')}</label>
                  <Input
                    type="email"
                    value={newManager.email}
                    onChange={(e) =>
                      setNewManager({ ...newManager, email: e.target.value })
                    }
                    className="w-[200px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('managers.phone')}</label>
                  <Input
                    value={newManager.phone}
                    onChange={(e) =>
                      setNewManager({ ...newManager, phone: e.target.value })
                    }
                    className="w-[140px]"
                  />
                </div>
                <Button onClick={addManager} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('managers.addManager')}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('managers.name')}</TableHead>
                    <TableHead>{t('managers.state')}</TableHead>
                    <TableHead>{t('managers.email')}</TableHead>
                    <TableHead>{t('managers.phone')}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        {t('managers.noManagers')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    managers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell className="font-medium">
                          {manager.name}
                        </TableCell>
                        <TableCell>
                          {(manager as any).states?.name || '—'}
                        </TableCell>
                        <TableCell>{manager.email || '—'}</TableCell>
                        <TableCell>{manager.phone || '—'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteManager(manager.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HR Reps Tab */}
        <TabsContent value="hrReps" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('hrReps.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap items-end p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('hrReps.name')}</label>
                  <Input
                    value={newHrRep.name}
                    onChange={(e) =>
                      setNewHrRep({ ...newHrRep, name: e.target.value })
                    }
                    className="w-[180px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('hrReps.state')}</label>
                  <Select
                    value={newHrRep.state_id}
                    onValueChange={(v) =>
                      setNewHrRep({ ...newHrRep, state_id: v })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">{t('hrReps.email')}</label>
                  <Input
                    type="email"
                    value={newHrRep.email}
                    onChange={(e) =>
                      setNewHrRep({ ...newHrRep, email: e.target.value })
                    }
                    className="w-[200px]"
                  />
                </div>
                <Button onClick={addHrRep} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('hrReps.addHrRep')}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('hrReps.name')}</TableHead>
                    <TableHead>{t('hrReps.state')}</TableHead>
                    <TableHead>{t('hrReps.email')}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hrReps.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        {t('hrReps.noHrReps')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    hrReps.map((rep) => (
                      <TableRow key={rep.id}>
                        <TableCell className="font-medium">{rep.name}</TableCell>
                        <TableCell>
                          {(rep as any).states?.name || '—'}
                        </TableCell>
                        <TableCell>{rep.email || '—'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteHrRep(rep.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('users.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Manage user accounts and roles. Users are managed through Supabase Auth.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('users.email')}</TableHead>
                    <TableHead>{t('users.role')}</TableHead>
                    <TableHead>{t('users.state')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      User management is handled through Supabase Auth dashboard.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
