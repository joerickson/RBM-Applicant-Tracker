'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface FilterValues {
  search: string
  status: string
  manager: string
  hrRep: string
  referralSource: string
  dateFrom: string
  dateTo: string
}

interface FilterBarProps {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  statusOptions: { value: string; label: string }[]
  managerOptions: { value: string; label: string }[]
  hrRepOptions: { value: string; label: string }[]
  referralSourceOptions: { value: string; label: string }[]
}

export function FilterBar({
  filters,
  onFiltersChange,
  statusOptions,
  managerOptions,
  hrRepOptions,
  referralSourceOptions,
}: FilterBarProps) {
  const t = useTranslations('applicants')

  const update = (key: keyof FilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAll = () => {
    onFiltersChange({
      search: '',
      status: '',
      manager: '',
      hrRep: '',
      referralSource: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.manager ||
    filters.hrRep ||
    filters.referralSource ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder={t('search')}
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => update('status', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('filters.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.manager || 'all'}
            onValueChange={(v) => update('manager', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('filters.allManagers')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allManagers')}</SelectItem>
              {managerOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.hrRep || 'all'}
            onValueChange={(v) => update('hrRep', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('filters.allHrReps')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allHrReps')}</SelectItem>
              {hrRepOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.referralSource || 'all'}
            onValueChange={(v) =>
              update('referralSource', v === 'all' ? '' : v)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('filters.allSources')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allSources')}</SelectItem>
              {referralSourceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <label className="text-sm text-muted-foreground">
          {t('filters.dateFrom')}:
        </label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update('dateFrom', e.target.value)}
          className="w-[160px]"
        />
        <label className="text-sm text-muted-foreground">
          {t('filters.dateTo')}:
        </label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update('dateTo', e.target.value)}
          className="w-[160px]"
        />
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            {t('filters.clearFilters')}
          </Button>
        )}
      </div>
    </div>
  )
}
