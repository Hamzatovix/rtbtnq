export type Locale = 'en' | 'ru'

export const locales: Locale[] = ['ru', 'en']
export const defaultLocale: Locale = 'ru'

export type LocaleConfig = {
  locale: Locale
  label: string
  flag: string
}

export const localeConfigs: Record<Locale, LocaleConfig> = {
  en: {
    locale: 'en',
    label: 'English',
    flag: '🇬🇧',
  },
  ru: {
    locale: 'ru',
    label: 'Русский',
    flag: '🇷🇺',
  },
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

