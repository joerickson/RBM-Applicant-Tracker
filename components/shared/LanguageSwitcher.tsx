'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'es' : 'en'
    // Strip current locale prefix if present and add new one
    const pathWithoutLocale = pathname.replace(/^\/(en|es)/, '') || '/'
    const newPath =
      nextLocale === 'en' ? pathWithoutLocale : `/${nextLocale}${pathWithoutLocale}`
    router.push(newPath)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className="min-w-[48px] font-medium"
      title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      {locale === 'en' ? 'ES' : 'EN'}
    </Button>
  )
}
