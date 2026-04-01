import { Lang } from './ApplicationPortal'

export default function LanguageSelect({ onSelect }: { onSelect: (lang: Lang) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full border border-gray-200">
        <div className="w-16 h-16 bg-rbm-blue rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-white font-bold text-xl">RBM</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">RBM Services Inc.</h1>
        <p className="text-gray-500 text-sm mb-6">Select your language / Selecciona tu idioma</p>

        <div className="space-y-3">
          <button
            onClick={() => onSelect('en')}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:border-rbm-blue hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">🇺🇸</span>
            <div className="text-left">
              <div className="font-semibold text-gray-900">English</div>
              <div className="text-xs text-gray-500">Apply in English</div>
            </div>
          </button>

          <button
            onClick={() => onSelect('es')}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl hover:border-rbm-blue hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">🇲🇽</span>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Español</div>
              <div className="text-xs text-gray-500">Solicitar en Español</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
