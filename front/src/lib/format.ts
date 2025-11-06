import { useLocale } from 'next-intl'

export type Currency = 'RUB' | 'USD' | 'EUR'

/**
 * Format number according to locale
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

/**
 * Format currency according to locale
 * Client-side hook version
 */
export function useFormatCurrency() {
  const locale = useLocale()
  
  return (amount: number, currency: Currency = 'RUB') => {
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
    }

    // Override default currency symbols for better UX
    if (currency === 'RUB') {
      if (locale === 'ru') {
        return `${formatNumber(amount)} ₽`
      }
      // English: use RUB code
      return new Intl.NumberFormat('en-US', options).format(amount)
    }

    return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', options).format(amount)
  }
}

/**
 * Server-side currency formatter (no hook, takes locale as param)
 */
export function formatCurrency(amount: number, locale: string, currency: Currency = 'RUB'): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
  }

  if (currency === 'RUB') {
    if (locale === 'ru') {
      return `${formatNumber(amount)} ₽`
    }
    return new Intl.NumberFormat('en-US', options).format(amount)
  }

  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', options).format(amount)
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : 'en-US', options).format(dateObj)
}

