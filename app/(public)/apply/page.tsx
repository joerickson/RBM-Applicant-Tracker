'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, ChevronRight, ChevronLeft, Globe } from 'lucide-react'

type Locale = 'en' | 'es'

const translations = {
  en: {
    title: 'Apply Now',
    subtitle: 'Complete this form to apply. Fields marked with * are required.',
    selectLanguage: 'Select Your Language',
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    submit: 'Submit Application',
    submitting: 'Submitting...',
    steps: ['Language', 'Personal Info', 'Work Authorization', 'App Details', 'Review & Submit'],
    personalInfo: {
      title: 'Personal Information',
      firstName: 'First Name *',
      lastName: 'Last Name *',
      phone: 'Phone Number *',
      email: 'Email Address',
      address: 'Street Address',
      city: 'City',
      state: 'State',
      zip: 'ZIP Code',
    },
    workAuth: {
      title: 'Work Authorization',
      authorized: 'Are you authorized to work in the United States? *',
      yes: 'Yes',
      no: 'No',
      documentType: 'Document Type',
      documentNumber: 'Document Number',
      expirationDate: 'Expiration Date',
    },
    appDetails: {
      title: 'Application Details',
      position: 'Position Applying For *',
      stateApplying: 'Location / State *',
      referralSource: 'How did you hear about us? *',
      referredBy: 'Referred By (name)',
      availableDate: 'Available Start Date',
      notes: 'Additional Notes',
    },
    review: {
      title: 'Review Your Application',
      subtitle: 'Please review your information before submitting.',
      personalInfo: 'Personal Information',
      workAuth: 'Work Authorization',
      appDetails: 'Application Details',
      consent: 'By submitting this form, I certify that the information provided is accurate and complete. *',
    },
    success: {
      title: 'Application Submitted!',
      message: 'Thank you for applying. We will review your application and contact you soon.',
      reference: 'Your reference number:',
      applyAgain: 'Submit Another Application',
    },
    errors: {
      required: 'This field is required',
      invalidPhone: 'Please enter a valid phone number',
      submitFailed: 'Submission failed. Please try again.',
    },
    documentTypes: [
      { value: 'ssn', label: 'Social Security Card' },
      { value: 'ead', label: 'Employment Authorization Document (EAD)' },
      { value: 'greencard', label: 'Permanent Resident Card (Green Card)' },
      { value: 'passport', label: 'US Passport' },
      { value: 'visa', label: 'Work Visa' },
      { value: 'other', label: 'Other' },
    ],
    referralSources: [
      { value: 'friend', label: 'Friend / Referral' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'indeed', label: 'Indeed' },
      { value: 'craigslist', label: 'Craigslist' },
      { value: 'sign', label: 'Road Sign' },
      { value: 'other', label: 'Other' },
    ],
    states: [
      { value: 'Utah', label: 'Utah' },
      { value: 'Nevada', label: 'Nevada' },
      { value: 'Arizona', label: 'Arizona' },
      { value: 'Texas', label: 'Texas' },
    ],
  },
  es: {
    title: 'Aplicar Ahora',
    subtitle: 'Complete este formulario para aplicar. Los campos marcados con * son obligatorios.',
    selectLanguage: 'Seleccione su Idioma',
    continue: 'Continuar',
    back: 'Atrás',
    next: 'Siguiente',
    submit: 'Enviar Solicitud',
    submitting: 'Enviando...',
    steps: ['Idioma', 'Info Personal', 'Autorización de Trabajo', 'Detalles', 'Revisar y Enviar'],
    personalInfo: {
      title: 'Información Personal',
      firstName: 'Nombre *',
      lastName: 'Apellido *',
      phone: 'Número de Teléfono *',
      email: 'Correo Electrónico',
      address: 'Dirección',
      city: 'Ciudad',
      state: 'Estado',
      zip: 'Código Postal',
    },
    workAuth: {
      title: 'Autorización de Trabajo',
      authorized: '¿Está autorizado para trabajar en los Estados Unidos? *',
      yes: 'Sí',
      no: 'No',
      documentType: 'Tipo de Documento',
      documentNumber: 'Número de Documento',
      expirationDate: 'Fecha de Vencimiento',
    },
    appDetails: {
      title: 'Detalles de la Solicitud',
      position: 'Puesto al que Aplica *',
      stateApplying: 'Ubicación / Estado *',
      referralSource: '¿Cómo se enteró de nosotros? *',
      referredBy: 'Referido por (nombre)',
      availableDate: 'Fecha de Disponibilidad',
      notes: 'Notas Adicionales',
    },
    review: {
      title: 'Revise su Solicitud',
      subtitle: 'Por favor revise su información antes de enviar.',
      personalInfo: 'Información Personal',
      workAuth: 'Autorización de Trabajo',
      appDetails: 'Detalles de la Solicitud',
      consent: 'Al enviar este formulario, certifico que la información proporcionada es precisa y completa. *',
    },
    success: {
      title: '¡Solicitud Enviada!',
      message: 'Gracias por aplicar. Revisaremos su solicitud y nos pondremos en contacto pronto.',
      reference: 'Su número de referencia:',
      applyAgain: 'Enviar Otra Solicitud',
    },
    errors: {
      required: 'Este campo es obligatorio',
      invalidPhone: 'Por favor ingrese un número de teléfono válido',
      submitFailed: 'Error al enviar. Por favor intente de nuevo.',
    },
    documentTypes: [
      { value: 'ssn', label: 'Tarjeta de Seguro Social' },
      { value: 'ead', label: 'Documento de Autorización de Empleo (EAD)' },
      { value: 'greencard', label: 'Tarjeta de Residente Permanente (Green Card)' },
      { value: 'passport', label: 'Pasaporte Americano' },
      { value: 'visa', label: 'Visa de Trabajo' },
      { value: 'other', label: 'Otro' },
    ],
    referralSources: [
      { value: 'friend', label: 'Amigo / Referido' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'indeed', label: 'Indeed' },
      { value: 'craigslist', label: 'Craigslist' },
      { value: 'sign', label: 'Letrero en la Calle' },
      { value: 'other', label: 'Otro' },
    ],
    states: [
      { value: 'Utah', label: 'Utah' },
      { value: 'Nevada', label: 'Nevada' },
      { value: 'Arizona', label: 'Arizona' },
      { value: 'Texas', label: 'Texas' },
    ],
  },
}

const formSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  work_authorized: z.boolean(),
  document_type: z.string().optional(),
  document_number: z.string().optional(),
  document_expiration: z.string().optional(),
  position: z.string().min(1),
  state_applying: z.string().min(1),
  referral_source: z.string().min(1),
  referred_by: z.string().optional(),
  available_date: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine((v) => v === true),
})

type FormData = z.infer<typeof formSchema>

// Step 0: language selection, Steps 1-4: form steps
const TOTAL_STEPS = 5

export default function ApplyPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [workAuthorized, setWorkAuthorized] = useState<boolean | null>(null)
  const [consent, setConsent] = useState(false)

  const t = translations[locale]

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        ...formData,
        work_authorized: workAuthorized ?? false,
        consent,
        locale,
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setReferenceId(data.referenceId || '')
        setSubmitted(true)
      } else {
        setSubmitError(t.errors.submitFailed)
      }
    } catch {
      setSubmitError(t.errors.submitFailed)
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep(0)
    setFormData({})
    setWorkAuthorized(null)
    setConsent(false)
    setSubmitted(false)
    setReferenceId('')
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">{t.success.title}</h1>
            <p className="text-muted-foreground">{t.success.message}</p>
            {referenceId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t.success.reference}</p>
                <p className="font-mono font-semibold text-sm">{referenceId}</p>
              </div>
            )}
            <Button onClick={reset} variant="outline">
              {t.success.applyAgain}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>

        {/* Progress steps */}
        {step > 0 && (
          <div className="flex items-center mb-6 overflow-x-auto pb-2">
            {t.steps.map((stepLabel, idx) => (
              <div key={idx} className="flex items-center flex-shrink-0">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                    idx + 1 <= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`ml-1 text-xs hidden sm:block ${
                    idx + 1 === step ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {stepLabel}
                </span>
                {idx < t.steps.length - 1 && (
                  <div className="h-px w-6 bg-border mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="pt-6 pb-6">
            {/* Step 0: Language Selection */}
            {step === 0 && (
              <div className="space-y-6 text-center">
                <Globe className="h-12 w-12 text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Select Language / Seleccione su Idioma</h2>
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    variant={locale === 'en' ? 'default' : 'outline'}
                    onClick={() => setLocale('en')}
                    className="min-w-[120px]"
                  >
                    English
                  </Button>
                  <Button
                    size="lg"
                    variant={locale === 'es' ? 'default' : 'outline'}
                    onClick={() => setLocale('es')}
                    className="min-w-[120px]"
                  >
                    Español
                  </Button>
                </div>
                <Button size="lg" onClick={() => setStep(1)} className="w-full">
                  {t.continue}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t.personalInfo.title}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t.personalInfo.firstName}</label>
                    <Input
                      value={formData.first_name || ''}
                      onChange={(e) => updateForm({ first_name: e.target.value })}
                      placeholder="Juan"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t.personalInfo.lastName}</label>
                    <Input
                      value={formData.last_name || ''}
                      onChange={(e) => updateForm({ last_name: e.target.value })}
                      placeholder="García"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.personalInfo.phone}</label>
                  <Input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateForm({ phone: e.target.value })}
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.personalInfo.email}</label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.personalInfo.address}</label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => updateForm({ address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-sm font-medium">{t.personalInfo.city}</label>
                    <Input
                      value={formData.city || ''}
                      onChange={(e) => updateForm({ city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t.personalInfo.state}</label>
                    <Input
                      value={formData.state || ''}
                      onChange={(e) => updateForm({ state: e.target.value })}
                      placeholder="UT"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t.personalInfo.zip}</label>
                    <Input
                      value={formData.zip || ''}
                      onChange={(e) => updateForm({ zip: e.target.value })}
                      placeholder="84101"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Work Authorization */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t.workAuth.title}</h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.workAuth.authorized}</label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={workAuthorized === true ? 'default' : 'outline'}
                      onClick={() => setWorkAuthorized(true)}
                      className="flex-1"
                    >
                      {t.workAuth.yes}
                    </Button>
                    <Button
                      type="button"
                      variant={workAuthorized === false ? 'destructive' : 'outline'}
                      onClick={() => setWorkAuthorized(false)}
                      className="flex-1"
                    >
                      {t.workAuth.no}
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.workAuth.documentType}</label>
                  <Select
                    value={formData.document_type || ''}
                    onValueChange={(v) => updateForm({ document_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {t.documentTypes.map((dt) => (
                        <SelectItem key={dt.value} value={dt.value}>
                          {dt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.workAuth.documentNumber}</label>
                  <Input
                    value={formData.document_number || ''}
                    onChange={(e) => updateForm({ document_number: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.workAuth.expirationDate}</label>
                  <Input
                    type="date"
                    value={formData.document_expiration || ''}
                    onChange={(e) => updateForm({ document_expiration: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Application Details */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t.appDetails.title}</h2>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.appDetails.position}</label>
                  <Input
                    value={formData.position || ''}
                    onChange={(e) => updateForm({ position: e.target.value })}
                    placeholder={locale === 'en' ? 'e.g. Landscaper, Laborer...' : 'ej. Jardinero, Obrero...'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.appDetails.stateApplying}</label>
                  <Select
                    value={formData.state_applying || ''}
                    onValueChange={(v) => updateForm({ state_applying: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {t.states.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.appDetails.referralSource}</label>
                  <Select
                    value={formData.referral_source || ''}
                    onValueChange={(v) => updateForm({ referral_source: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {t.referralSources.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.appDetails.referredBy}</label>
                  <Input
                    value={formData.referred_by || ''}
                    onChange={(e) => updateForm({ referred_by: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.appDetails.availableDate}</label>
                  <Input
                    type="date"
                    value={formData.available_date || ''}
                    onChange={(e) => updateForm({ available_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t.appDetails.notes}</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateForm({ notes: e.target.value })}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t.review.title}</h2>
                <p className="text-muted-foreground text-sm">{t.review.subtitle}</p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <h3 className="font-semibold text-sm">{t.review.personalInfo}</h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt className="text-muted-foreground">{t.personalInfo.firstName.replace(' *', '')}</dt>
                      <dd>{formData.first_name}</dd>
                      <dt className="text-muted-foreground">{t.personalInfo.lastName.replace(' *', '')}</dt>
                      <dd>{formData.last_name}</dd>
                      <dt className="text-muted-foreground">{t.personalInfo.phone.replace(' *', '')}</dt>
                      <dd>{formData.phone}</dd>
                      {formData.email && (
                        <>
                          <dt className="text-muted-foreground">{t.personalInfo.email}</dt>
                          <dd>{formData.email}</dd>
                        </>
                      )}
                    </dl>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <h3 className="font-semibold text-sm">{t.review.workAuth}</h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt className="text-muted-foreground">{t.workAuth.authorized.replace(' *', '')}</dt>
                      <dd>{workAuthorized ? t.workAuth.yes : t.workAuth.no}</dd>
                      {formData.document_type && (
                        <>
                          <dt className="text-muted-foreground">{t.workAuth.documentType}</dt>
                          <dd>{t.documentTypes.find((d) => d.value === formData.document_type)?.label}</dd>
                        </>
                      )}
                      {formData.document_expiration && (
                        <>
                          <dt className="text-muted-foreground">{t.workAuth.expirationDate}</dt>
                          <dd>{formData.document_expiration}</dd>
                        </>
                      )}
                    </dl>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <h3 className="font-semibold text-sm">{t.review.appDetails}</h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt className="text-muted-foreground">{t.appDetails.position.replace(' *', '')}</dt>
                      <dd>{formData.position}</dd>
                      <dt className="text-muted-foreground">{t.appDetails.stateApplying.replace(' *', '')}</dt>
                      <dd>{formData.state_applying}</dd>
                      <dt className="text-muted-foreground">{t.appDetails.referralSource.replace(' *', '')}</dt>
                      <dd>{t.referralSources.find((s) => s.value === formData.referral_source)?.label}</dd>
                    </dl>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="consent" className="text-sm cursor-pointer">
                    {t.review.consent}
                  </label>
                </div>

                {submitError && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                    {submitError}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            {step > 0 && (
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t.back}
                </Button>

                {step < 4 ? (
                  <Button
                    onClick={() => {
                      // Basic validation for required fields
                      if (step === 1 && (!formData.first_name || !formData.last_name || !formData.phone)) {
                        alert(t.errors.required)
                        return
                      }
                      if (step === 3 && (!formData.position || !formData.state_applying || !formData.referral_source)) {
                        alert(t.errors.required)
                        return
                      }
                      setStep((s) => s + 1)
                    }}
                  >
                    {t.next}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !consent}
                  >
                    {submitting ? t.submitting : t.submit}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
