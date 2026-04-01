import { Lang } from './ApplicationPortal'
import { CheckCircle } from 'lucide-react'

const t = {
  en: {
    title: 'Application Submitted!',
    message: 'Thank you for applying to RBM Services Inc. Our HR team will review your application and contact you soon.',
    reference: 'Your reference number',
    applyAgain: 'Submit another application',
  },
  es: {
    title: '¡Solicitud Enviada!',
    message: 'Gracias por aplicar a RBM Services Inc. Nuestro equipo de Recursos Humanos revisará su solicitud y se pondrá en contacto pronto.',
    reference: 'Su número de referencia',
    applyAgain: 'Enviar otra solicitud',
  },
}

export default function SuccessScreen({ lang, referenceId }: { lang: Lang; referenceId: string }) {
  const tx = t[lang]
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full border border-gray-200">
        <div className="flex justify-center mb-4">
          <CheckCircle size={56} className="text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">{tx.title}</h1>
        <p className="text-gray-600 text-sm mb-5">{tx.message}</p>
        {referenceId && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-5">
            <p className="text-xs text-gray-500 mb-1">{tx.reference}</p>
            <p className="font-mono font-bold text-gray-900 text-lg">{referenceId}</p>
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-rbm-blue underline"
        >
          {tx.applyAgain}
        </button>
      </div>
    </div>
  )
}
