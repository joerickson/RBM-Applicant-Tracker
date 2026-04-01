import { DropdownOption } from '@/lib/types'
import { FormData, Lang } from './ApplicationPortal'

interface Props {
  form: FormData
  update: (fields: Partial<FormData>) => void
  lang: Lang
  dropdownOptions: DropdownOption[]
  onBack: () => void
  onNext: () => void
}

const t = {
  en: {
    title: 'Work Authorization',
    docType: 'Document Type', selectDoc: 'Select...',
    docExpiry: 'Document Expiration Date',
    country: 'Country of Origin',
    authorized: 'I am authorized to work in the United States',
    mustAuthorize: 'You must be authorized to work to apply.',
    back: '← Back', next: 'Next →',
  },
  es: {
    title: 'Autorización de Trabajo',
    docType: 'Tipo de Documento', selectDoc: 'Seleccionar...',
    docExpiry: 'Fecha de Vencimiento del Documento',
    country: 'País de Origen',
    authorized: 'Estoy autorizado para trabajar en los Estados Unidos',
    mustAuthorize: 'Debe estar autorizado para trabajar para aplicar.',
    back: '← Atrás', next: 'Siguiente →',
  },
}

export default function StepWorkAuth({ form, update, lang, dropdownOptions, onBack, onNext }: Props) {
  const tx = t[lang]
  const docTypes = dropdownOptions.filter(o => o.category === 'document_type')
  const labelKey = lang === 'es' ? 'label_es' : 'label_en'

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (!form.authorized_to_work) return
    onNext()
  }

  return (
    <form onSubmit={handleNext} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{tx.title}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{tx.docType} *</label>
        <select required value={form.document_type} onChange={e => update({ document_type: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none">
          <option value="">{tx.selectDoc}</option>
          {docTypes.map(o => <option key={o.value} value={o.value}>{o[labelKey]}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{tx.docExpiry}</label>
        <input type="date" value={form.document_expiration_date} onChange={e => update({ document_expiration_date: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{tx.country}</label>
        <input value={form.country_of_origin} onChange={e => update({ country_of_origin: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={form.authorized_to_work}
          onChange={e => update({ authorized_to_work: e.target.checked })}
          className="mt-0.5 w-4 h-4 text-rbm-blue"
        />
        <span className="text-sm text-gray-700">{tx.authorized} *</span>
      </label>

      {!form.authorized_to_work && (
        <p className="text-xs text-red-600">{tx.mustAuthorize}</p>
      )}

      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          {tx.back}
        </button>
        <button type="submit" className="px-6 py-2.5 bg-rbm-blue text-white rounded-lg text-sm font-medium hover:bg-rbm-blue-dark">
          {tx.next}
        </button>
      </div>
    </form>
  )
}
