'use client'

import { useLocaleStore } from '@/store/locale-store'
import { useClientLocale } from '@/hooks/useClientLocale'
import { localeConfigs } from '@/i18n/config'
import { useEffect, useState } from 'react'

export function LocaleSwitcher() {
  const locale = useClientLocale()
  const setLocale = useLocaleStore((state) => state.setLocale)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleLocale = () => {
    const nextLocale = locale === 'ru' ? 'en' : 'ru'
    setLocale(nextLocale)
  }

  // Всегда используем locale напрямую, но с fallback на 'ru' для SSR
  const currentConfig = localeConfigs[locale as keyof typeof localeConfigs] || localeConfigs.ru
  const nextConfig = localeConfigs[locale === 'ru' ? 'en' : 'ru']

  return (
    <button
      type="button"
      onClick={mounted ? toggleLocale : undefined}
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80 relative group"
      aria-label={mounted ? `Переключить язык на ${nextConfig.label}` : 'Переключить язык'}
      title={mounted ? `Текущий язык: ${currentConfig.label}. Нажмите для переключения на ${nextConfig.label}` : undefined}
      suppressHydrationWarning
    >
      {/* Текущий флаг - всегда рендерится с suppressHydrationWarning */}
      <span 
        className="text-lg transition-opacity duration-300 group-hover:opacity-0 drop-shadow-sm" 
        role="img" 
        aria-hidden="true"
        suppressHydrationWarning
      >
        {currentConfig.flag}
      </span>
      {/* Следующий флаг при hover - всегда рендерится */}
      <span 
        className="absolute text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 drop-shadow-sm" 
        role="img" 
        aria-hidden="true"
        suppressHydrationWarning
      >
        {nextConfig.flag}
      </span>
      <span className="sr-only">Switch language</span>
    </button>
  )
}

