'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DropdownOption, STATE_SLUGS } from '@/lib/types'
import LanguageSelect from './LanguageSelect'
import StepPersonal from './StepPersonal'
import StepWorkAuth from './StepWorkAuth'
import StepDetails from './StepDetails'
import StepReview from './StepReview'
import SuccessScreen from './SuccessScreen'

interface Props {
  dropdownOptions: DropdownOption[]
  preselectedState: string | null
  initialLang: 'en' | 'es'
}

export type FormData = {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  state_applying: string
  document_type: string
  document_expiration_date: string
  country_of_origin: string
  authorized_to_work: boolean
  referral_source: string
  referral_name: string
  position_interest: string
  available_start_date: string
  consent_given: boolean
}

const initialForm: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state_applying: '',
  document_type: '',
  document_expiration_date: '',
  country_of_origin: '',
  authorized_to_work: false,
  referral_source: '',
  referral_name: '',
  position_interest: '',
  available_start_date: '',
  consent_given: false,
}

export type Lang = 'en' | 'es'

export default function ApplicationPortal({ dropdownOptions, preselectedState, initialLang }: Props) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const [showLanguageSelect, setShowLanguageSelect] = useState(!preselectedState && initialLang === 'en')
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [referenceId, setReferenceId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Pre-populate state from QR code param (Phase 9.2)
  const preselectedStateName = preselectedState ? STATE_SLUGS[preselectedState] || '' : ''
  const [form, setForm] = useState<FormData>({
    ...initialForm,
    state_applying: preselectedStateName,
    // Phase 9.2: auto-set referral_source to qr_code when state param present
    referral_source: preselectedState ? 'qr_code' : '',
  })

  function update(fields: Partial<FormData>) {
    setForm(f => ({ ...f, ...fields }))
  }

  function selectLanguage(l: Lang) {
    setLang(l)
    setShowLanguageSelect(false)
  }

  async function handleSubmit() {
    setSubmitting(true)
    const supabase = createClient()

    const payload = {
      ...form,
      document_expiration_date: form.document_expiration_date || null,
      available_start_date: form.available_start_date || null,
      country_of_origin: form.country_of_origin || null,
      referral_name: form.referral_name || null,
      position_interest: form.position_interest || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      language: lang,
    }

    const { data, error } = await supabase
      .from('applications')
      .insert(payload)
      .select('id')
      .single()

    if (!error && data) {
      setReferenceId(data.id.slice(0, 8).toUpperCase())
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  const t = translations[lang]

  if (submitted) {
    return <SuccessScreen lang={lang} referenceId={referenceId} />
  }

  if (showLanguageSelect) {
    return <LanguageSelect onSelect={selectLanguage} />
  }

  const STEPS = [t.steps.personal, t.steps.workAuth, t.steps.details, t.steps.review]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rbm-blue rounded-full mb-4">
            <span className="text-white font-bold text-lg">RBM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 text-sm mt-2">{t.subtitle}</p>
          {/* Language toggle */}
          <button
            onClick={() => setShowLanguageSelect(true)}
            className="mt-3 text-xs text-rbm-blue underline"
          >
            {lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1
                  ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-rbm-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs text-gray-500 text-center hidden sm:block">{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-rbm-blue rounded-full transition-all"
              style={{ width: `${((step) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          {step === 0 && (
            <StepPersonal form={form} update={update} lang={lang} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <StepWorkAuth
              form={form}
              update={update}
              lang={lang}
              dropdownOptions={dropdownOptions}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepDetails
              form={form}
              update={update}
              lang={lang}
              dropdownOptions={dropdownOptions}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepReview
              form={form}
              update={update}
              lang={lang}
              dropdownOptions={dropdownOptions}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const translations = {
  en: {
    title: 'Apply Now — RBM Services Inc.',
    subtitle: 'Join our team. Hiring in Utah, Nevada, Arizona & Texas.',
    steps: {
      personal: 'Personal Info',
      workAuth: 'Work Auth',
      details: 'Details',
      review: 'Review',
    },
  },
  es: {
    title: 'Solicitar Empleo — RBM Services Inc.',
    subtitle: 'Únete a nuestro equipo. Contratando en Utah, Nevada, Arizona y Texas.',
    steps: {
      personal: 'Info Personal',
      workAuth: 'Autorización',
      details: 'Detalles',
      review: 'Revisar',
    },
  },
}
