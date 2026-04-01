import QRCodesClient from '@/components/tracker/QRCodesClient'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://careers.rbmservicesinc.com'

const STATE_QR_CONFIGS = [
  { state: 'Utah', slug: 'utah', color: '#1a4fa0' },
  { state: 'Nevada', slug: 'nevada', color: '#7c3aed' },
  { state: 'Arizona', slug: 'arizona', color: '#b45309' },
  { state: 'Texas', slug: 'texas', color: '#15803d' },
]

export default function QRCodesPage() {
  const configs = STATE_QR_CONFIGS.map(c => ({
    ...c,
    url: `${BASE_URL}/apply?state=${c.slug}`,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">State QR Codes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Download QR codes for each state&apos;s application portal. Print and hand to managers for field recruiting.
          Scanning the QR code pre-selects the state and automatically sets the referral source to &quot;QR Code&quot;.
        </p>
      </div>

      <QRCodesClient configs={configs} />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h2 className="font-semibold text-blue-900 mb-2">WordPress Integration</h2>
        <p className="text-sm text-blue-800 mb-3">
          These QR codes link directly to the bilingual application portal with the state pre-selected.
          For WordPress embedding options, see the implementation guide below.
        </p>
        <div className="space-y-2">
          <details className="bg-white rounded-lg border border-blue-200">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer">
              Option A — Dedicated Subdomain Link (Recommended)
            </summary>
            <div className="px-4 pb-4 text-xs text-gray-600 space-y-2">
              <p>1. In your DNS registrar, create a CNAME: <code className="bg-gray-100 px-1 rounded">careers → cname.vercel-dns.com</code></p>
              <p>2. In Vercel → Settings → Domains, add <code className="bg-gray-100 px-1 rounded">careers.rbmservicesinc.com</code></p>
              <p>3. In WordPress, add a &quot;Careers&quot; page with a button linking to <code className="bg-gray-100 px-1 rounded">https://careers.rbmservicesinc.com/apply</code></p>
            </div>
          </details>
          <details className="bg-white rounded-lg border border-blue-200">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer">
              Option B — Embedded iframe on WordPress Page
            </summary>
            <div className="px-4 pb-4">
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{`<iframe
  src="https://careers.rbmservicesinc.com/apply"
  title="RBM Services Job Application"
  width="100%" height="900"
  style="border:none;border-radius:8px"
  loading="lazy"
  allow="forms">
</iframe>`}</pre>
              <p className="text-xs text-gray-500 mt-2">The app&apos;s CSP headers already allow rbmservicesinc.com to embed this page.</p>
            </div>
          </details>
          <details className="bg-white rounded-lg border border-blue-200">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer">
              Option C — Floating Apply Now Button (All Pages)
            </summary>
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-600 mb-2">Add to WordPress Customizer → Additional CSS:</p>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{`.rbm-apply-fab {
  position: fixed; bottom: 28px; right: 28px;
  z-index: 9999; background: #1a4fa0; color: #fff;
  padding: 14px 22px; border-radius: 50px;
  font-weight: 700; font-size: 15px;
  cursor: pointer; border: none;
}`}</pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
