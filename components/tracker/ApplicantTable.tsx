'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, getExpirationStatus } from '@/lib/utils'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

export interface ApplicantRow {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  state_id: string
  state_name?: string
  position: string | null
  status: string
  manager_id: string | null
  manager_name?: string | null
  hr_rep_id: string | null
  hr_rep_name?: string | null
  referral_source: string | null
  application_date: string | null
  start_date: string | null
  document_type: string | null
  document_expiration: string | null
  notes: string | null
}

interface ApplicantTableProps {
  applicants: ApplicantRow[]
  onEdit: (applicant: ApplicantRow) => void
  onDelete: (id: string) => void
  statusLabels: Record<string, string>
}

const PAGE_SIZE = 50

const STATUS_VARIANTS: Record<
  string,
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'
  | 'in_process'
  | 'pending_docs'
  | 'portal_submitted'
  | 'default'
> = {
  applied: 'applied',
  screening: 'screening',
  interview: 'interview',
  offer: 'offer',
  hired: 'hired',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
  in_process: 'in_process',
  pending_docs: 'pending_docs',
  portal_submitted: 'portal_submitted',
}

export function ApplicantTable({
  applicants,
  onEdit,
  onDelete,
  statusLabels,
}: ApplicantTableProps) {
  const t = useTranslations('applicants')
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(applicants.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  const pageData = applicants.slice(start, start + PAGE_SIZE)

  const getRowClassName = (applicant: ApplicantRow) => {
    const expStatus = getExpirationStatus(applicant.document_expiration)
    if (expStatus === 'expired') return 'doc-expired'
    if (expStatus === 'soon') return 'doc-expiring-soon'
    return ''
  }

  const getExpirationBadge = (date: string | null) => {
    const status = getExpirationStatus(date)
    if (status === 'none') return <span className="text-muted-foreground">—</span>
    if (status === 'expired')
      return (
        <span className="text-red-600 font-semibold text-xs">
          {formatDate(date)} (Expired)
        </span>
      )
    if (status === 'soon')
      return (
        <span className="text-amber-600 font-semibold text-xs">
          {formatDate(date)} (&lt;30d)
        </span>
      )
    return <span className="text-xs">{formatDate(date)}</span>
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[140px]">{t('columns.name')}</TableHead>
              <TableHead>{t('columns.phone')}</TableHead>
              <TableHead>{t('columns.state')}</TableHead>
              <TableHead>{t('columns.status')}</TableHead>
              <TableHead>{t('columns.manager')}</TableHead>
              <TableHead>{t('columns.hrRep')}</TableHead>
              <TableHead>{t('columns.referralSource')}</TableHead>
              <TableHead>{t('columns.position')}</TableHead>
              <TableHead>{t('columns.applicationDate')}</TableHead>
              <TableHead>{t('columns.startDate')}</TableHead>
              <TableHead>{t('columns.documentType')}</TableHead>
              <TableHead className="min-w-[130px]">{t('columns.documentExpiration')}</TableHead>
              <TableHead className="text-right">{t('columns.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((applicant) => (
                <TableRow
                  key={applicant.id}
                  className={getRowClassName(applicant)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {applicant.first_name} {applicant.last_name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {applicant.phone}
                  </TableCell>
                  <TableCell className="text-sm">
                    {applicant.state_name || applicant.state_id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        STATUS_VARIANTS[applicant.status] || 'default'
                      }
                    >
                      {statusLabels[applicant.status] || applicant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {applicant.manager_name || '—'}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {applicant.hr_rep_name || '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {applicant.referral_source || '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {applicant.position || '—'}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(applicant.application_date)}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(applicant.start_date)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {applicant.document_type || '—'}
                  </TableCell>
                  <TableCell>
                    {getExpirationBadge(applicant.document_expiration)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(applicant)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(applicant.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {t('pagination.showing')} {Math.min(start + 1, applicants.length)}–
          {Math.min(start + PAGE_SIZE, applicants.length)} {t('pagination.of')}{' '}
          {applicants.length} {t('pagination.results')}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('pagination.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t('pagination.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
