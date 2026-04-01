import type { Metadata } from 'next'
import ApplicationPortal from '@/components/portal/ApplicationPortal'
import { createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Apply for a Job at RBM Services Inc. | Solicitar Empleo en RBM Services Inc.',
  description:
    'Apply online for cleaning and janitorial positions at RBM Services Inc. in Utah, Nevada, Arizona, and Texas. ' +
    'Bilingual application available in English and Spanish. — ' +
    'Aplique en línea para puestos de limpieza y conserjería en RBM Services Inc. en Utah, Nevada, Arizona y Texas. ' +
    'Solicitud bilingüe disponible en inglés y español.',
  openGraph: {
    title: 'Apply for a Job at RBM Services Inc.',
    description:
      'Online bilingual job application for cleaning positions in Utah, Nevada, Arizona & Texas.',
    url: 'https://careers.rbmservicesinc.com/apply',
    siteName: 'RBM Services Inc.',
    locale: 'en_US',
    alternateLocale: 'es_MX',
    type: 'website',
  },
}

interface Props {
  searchParams: { state?: string; lang?: string }
}

export default async function ApplyPage({ searchParams }: Props) {
  const supabase = createServiceClient()
  const { data: dropdownOptions } = await supabase
    .from('dropdown_options')
    .select('*')
    .eq('active', true)
    .order('display_order')

  // Phase 9.2: pre-select state from ?state= param (QR code integration)
  const preselectedState = searchParams.state?.toLowerCase() || null
  const initialLang = (searchParams.lang === 'es' ? 'es' : 'en') as 'en' | 'es'

  return (
    <ApplicationPortal
      dropdownOptions={dropdownOptions || []}
      preselectedState={preselectedState}
      initialLang={initialLang}
    />
  )
}
