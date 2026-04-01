import { FormData, Lang } from './ApplicationPortal'

interface Props {
  form: FormData
  update: (fields: Partial<FormData>) => void
  lang: Lang
  onNext: () => void
}

const STATES = ['Utah', 'Nevada', 'Arizona', 'Texas']

const t = {
  en: {
    title: 'Personal Information',
    firstName: 'First Name', lastName: 'Last Name',
    phone: 'Phone Number', email: 'Email Address',
    address: 'Street Address', city: 'City',
    state: 'State / Location Applying To', selectState: 'Select a state...',
    next: 'Next →',
  },
  es: {
    title: 'Información Personal',
    firstName: 'Nombre', lastName: 'Apellido',
    phone: 'Número de Teléfono', email: 'Correo Electrónico',
    address: 'Dirección', city: 'Ciudad',
    state: 'Estado / Ubicación donde Aplica', selectState: 'Selecciona un estado...',
    next: 'Siguiente →',
  },
}

export default function StepPersonal({ form, update, lang, onNext }: Props) {
  const tx = t[lang]

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleNext} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{tx.title}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tx.firstName} *</label>
          <input required value={form.first_name} onChange={e => update({ first_name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tx.lastName} *</label>
          <input required value={form.last_name} onChange={e => update({ last_name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tx.phone}</label>
          <input type="tel" value={form.phone} onChange={e => update({ phone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tx.email}</label>
          <input type="email" value={form.email} onChange={e => update({ email: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{tx.address}</label>
        <input value={form.address} onChange={e => update({ address: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tx.city}</label>
          <input value={form.city} onChange={e => update({ city: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{tx.state} *</label>
          <select required value={form.state_applying} onChange={e => update({ state_applying: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rbm-blue focus:outline-none">
            <option value="">{tx.selectState}</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="px-6 py-2.5 bg-rbm-blue text-white rounded-lg text-sm font-medium hover:bg-rbm-blue-dark">
          {tx.next}
        </button>
      </div>
    </form>
  )
}
