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
    title: 'Application Details',
    referral: 'How did you hear about us?', selectReferral: 'Select...',
    referralName: 'Referral Name (if referred by someone)',
    position: 'Position of Interest',
    startDate: 'Available Start Date',
    back: '← Back', next: 'Next →',
  },
  es: {
    title: 'Detalles de la Solicitud',
    referral: '¿Cómo se enteró de nosotros?', selectReferral: 'Seleccionar...',
    referralName: 'Nombre del Referente (si alguien lo recomendó)',
    position: 'Puesto de Interés',
    startDate: 'Fecha de Disponibilidad',
    back: '← Atrás', next: 'Siguiente →',
  },
}

export default function StepDetails({ form, update, lang, dropdownOptions, onBack, onNext }: Props) {
  const tx = t[lang]
  const referrals = dropdownOptions.filter(o => o.category === 'referral_source')
  const labelKey = lang === 'es' ? 'label_es' : 'label_en'

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleNext} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{tx.title}</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{tx.referral}</label>
        <select value={form.referral_source} onChange={e => update({ referral_source: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none">
          <option value="">{tx.selectReferral}</option>
          {referrals.map(o => <option key={o.value} value={o.value}>{o[labelKey]}</option>)}
        </select>
      </div>

      {form.referral_source === 'referral' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tx.referralName}</label>
          <input value={form.referral_name} onChange={e => update({ referral_name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{tx.position}</label>
        <input value={form.position_interest} onChange={e => update({ position_interest: e.target.value })}
          placeholder={lang === 'es' ? 'Limpieza, Conserjería...' : 'Cleaning, Janitorial...'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{tx.startDate}</label>
        <input type="date" value={form.available_start_date} onChange={e => update({ available_start_date: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
      </div>

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
