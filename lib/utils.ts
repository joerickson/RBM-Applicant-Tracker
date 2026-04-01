import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function isExpired(date: string | null | undefined): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function isExpiringSoon(
  date: string | null | undefined,
  days = 30
): boolean {
  if (!date) return false
  const expDate = new Date(date)
  const now = new Date()
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return expDate > now && expDate <= threshold
}

export function getExpirationStatus(
  date: string | null | undefined
): 'expired' | 'soon' | 'ok' | 'none' {
  if (!date) return 'none'
  if (isExpired(date)) return 'expired'
  if (isExpiringSoon(date)) return 'soon'
  return 'ok'
}
