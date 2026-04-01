'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const applicantSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  state_id: z.string().min(1, 'State is required'),
  position: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  manager_id: z.string().optional(),
  hr_rep_id: z.string().optional(),
  referral_source: z.string().optional(),
  application_date: z.string().optional(),
  start_date: z.string().optional(),
  document_type: z.string().optional(),
  document_expiration: z.string().optional(),
  notes: z.string().optional(),
})

type ApplicantFormData = z.infer<typeof applicantSchema>

export interface Applicant extends ApplicantFormData {
  id?: string
}

interface DropdownOption {
  value: string
  label: string
}

interface ApplicantModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: ApplicantFormData) => Promise<void>
  applicant?: Applicant | null
  states: DropdownOption[]
  statusOptions: DropdownOption[]
  documentTypeOptions: DropdownOption[]
  referralSourceOptions: DropdownOption[]
  managerOptions: DropdownOption[]
  hrRepOptions: DropdownOption[]
}

export function ApplicantModal({
  open,
  onClose,
  onSave,
  applicant,
  states,
  statusOptions,
  documentTypeOptions,
  referralSourceOptions,
  managerOptions,
  hrRepOptions,
}: ApplicantModalProps) {
  const t = useTranslations('applicants.modal')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplicantFormData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      state_id: '',
      position: '',
      status: 'applied',
      manager_id: '',
      hr_rep_id: '',
      referral_source: '',
      application_date: new Date().toISOString().split('T')[0],
      start_date: '',
      document_type: '',
      document_expiration: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (applicant) {
      reset({
        first_name: applicant.first_name || '',
        last_name: applicant.last_name || '',
        phone: applicant.phone || '',
        email: applicant.email || '',
        state_id: applicant.state_id || '',
        position: applicant.position || '',
        status: applicant.status || 'applied',
        manager_id: applicant.manager_id || '',
        hr_rep_id: applicant.hr_rep_id || '',
        referral_source: applicant.referral_source || '',
        application_date: applicant.application_date || '',
        start_date: applicant.start_date || '',
        document_type: applicant.document_type || '',
        document_expiration: applicant.document_expiration || '',
        notes: applicant.notes || '',
      })
    } else {
      reset({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        state_id: '',
        position: '',
        status: 'applied',
        manager_id: '',
        hr_rep_id: '',
        referral_source: '',
        application_date: new Date().toISOString().split('T')[0],
        start_date: '',
        document_type: '',
        document_expiration: '',
        notes: '',
      })
    }
  }, [applicant, reset, open])

  const onSubmit = async (data: ApplicantFormData) => {
    await onSave(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {applicant ? t('editTitle') : t('addTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('firstName')}</label>
              <Input {...register('first_name')} />
              {errors.first_name && (
                <p className="text-xs text-destructive">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('lastName')}</label>
              <Input {...register('last_name')} />
              {errors.last_name && (
                <p className="text-xs text-destructive">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('phone')}</label>
              <Input {...register('phone')} type="tel" />
              {errors.phone && (
                <p className="text-xs text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('email')}</label>
              <Input {...register('email')} type="email" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('state')}</label>
              <Controller
                name="state_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state_id && (
                <p className="text-xs text-destructive">
                  {errors.state_id.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('position')}</label>
              <Input {...register('position')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('status')}</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t('referralSource')}
              </label>
              <Controller
                name="referral_source"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) =>
                      field.onChange(v === 'none' ? '' : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {referralSourceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('manager')}</label>
              <Controller
                name="manager_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) =>
                      field.onChange(v === 'none' ? '' : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {managerOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('hrRep')}</label>
              <Controller
                name="hr_rep_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) =>
                      field.onChange(v === 'none' ? '' : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select HR rep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {hrRepOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t('applicationDate')}
              </label>
              <Input {...register('application_date')} type="date" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('startDate')}</label>
              <Input {...register('start_date')} type="date" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('documentType')}</label>
              <Controller
                name="document_type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) =>
                      field.onChange(v === 'none' ? '' : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {documentTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t('documentExpiration')}
              </label>
              <Input {...register('document_expiration')} type="date" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">{t('notes')}</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
