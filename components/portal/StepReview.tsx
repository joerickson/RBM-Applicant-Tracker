import { DropdownOption } from '@/lib/types'
import { FormData, Lang } from './ApplicationPortal'
import { formatDate } from '@/lib/utils'

interface Props {
  form: FormData
  update: (fields: Partial<FormData>) => void
  lang: Lang
  dropdownOptions: DropdownOption[]
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
}

const t = {
  en: {
    title: 'Review & Submit',
    personal: 'Personal Information', workAuth: 'Work Authorization', details: 'Application Details',
    consent: 'I consent to the collection and use of my information for employment purposes. I certify that the information provided is accurate and complete.',
    submit: 'Submit Application', back: '← Back',
    name: 'Name', phone: 'Phone', email: 'Email', address: 'Address',
    state: 'State', docType: 'Document Type', docExpiry: 'Doc Expiration',
    country: 'Country', authorized: 'Authorized to Work',
    referral: 'Referral Source', referralName: 'Referred By',
    position: 'Position', startDate: 'Available Start',
    yes: 'Yes', no: 'No',
  },
  es: {
    title: 'Revisar y Enviar',
    personal: 'Información Personal', workAuth: 'Autorización de Trabajo', details: 'Detalles de la Solicitud',
    consent: 'Doy mi consentimiento para la recopilación y uso de mi información con fines laborales. Certifico que la información proporcionada es correcta y completa.',
    submit: 'Enviar Solicitud', back: '← Atrás',
    name: 'Nombre', phone: 'Teléfono', email: 'Correo', address: 'Dirección',
    state: 'Estado', docType: 'Tipo de Documento', docExpiry: 'Vencimiento',
    country: 'País', authorized: 'Autorizado para Trabajar',
    referral: 'Fuente de Referencia', referralName: 'Referido Por',
    position: 'Puesto', startDate: 'Inicio Disponible',
    yes: 'Sí', no: 'No',
  },
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export default function StepReview({ form, update, lang, dropdownOptions, onBack, onSubmit, submitting }: Props) {
  const tx = t[lang]
  const labelKey = lang === 'es' ? 'label_es' : 'label_en'

  function getLabel(category: string, value: string) {
    return dropdownOptions.find(o => o.category === category && o.value === value)?.[labelKey] || value
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">{tx.title}</h2>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tx.personal}</h3>
        <div className="bg-gray-50 rounded-lg px-4 py-2">
          <Row label={tx.name} value={`${form.first_name} ${form.last_name}`} />
          <Row label={tx.phone} value={form.phone} />
          <Row label={tx.email} value={form.email} />
          <Row label={tx.address} value={[form.address, form.city].filter(Boolean).join(', ')} />
          <Row label={tx.state} value={form.state_applying} />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tx.workAuth}</h3>
        <div className="bg-gray-50 rounded-lg px-4 py-2">
          <Row label={tx.docType} value={getLabel('document_type', form.document_type)} />
          <Row label={tx.docExpiry} value={formatDate(form.document_expiration_date)} />
          <Row label={tx.country} value={form.country_of_origin} />
          <Row label={tx.authorized} value={form.authorized_to_work ? tx.yes : tx.no} />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{tx.details}</h3>
        <div className="bg-gray-50 rounded-lg px-4 py-2">
          <Row label={tx.referral} value={getLabel('referral_source', form.referral_source)} />
          <Row label={tx.referralName} value={form.referral_name} />
          <Row label={tx.position} value={form.position_interest} />
          <Row label={tx.startDate} value={formatDate(form.available_start_date)} />
        </div>
      </section>

      <label className="flex items-start gap-3 cursor-pointer bg-blue-50 rounded-lg p-3">
        <input
          type="checkbox"
          required
          checked={form.consent_given}
          onChange={e => update({ consent_given: e.target.checked })}
          className="mt-0.5 w-4 h-4 text-rbm-blue"
        />
        <span className="text-sm text-gray-700">{tx.consent}</span>
      </label>

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          {tx.back}
        </button>
        <button
          onClick={onSubmit}
          disabled={!form.consent_given || submitting}
          className="px-6 py-2.5 bg-rbm-blue text-white rounded-lg text-sm font-medium hover:bg-rbm-blue-dark disabled:opacity-60"
        >
          {submitting ? '...' : tx.submit}
        </button>
      </div>
    </div>
  )
}
