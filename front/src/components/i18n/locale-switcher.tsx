'use client'

import { useLocaleStore } from '@/store/locale-store'
import { useClientLocale } from '@/hooks/useClientLocale'
import { localeConfigs } from '@/i18n/config'
import { Button } from '@/components/ui/button'
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
    <Button
      variant="ghost"
      size="icon"
      onClick={mounted ? toggleLocale : undefined}
      className="rounded-lg border border-mistGray/30 dark:border-border bg-white/80 dark:bg-card/80 hover:bg-white dark:hover:bg-card transition-all duration-500 ease-out shadow-sm relative group"
      aria-label={mounted ? `Переключить язык на ${nextConfig.label}` : 'Переключить язык'}
      title={mounted ? `Текущий язык: ${currentConfig.label}. Нажмите для переключения на ${nextConfig.label}` : undefined}
      suppressHydrationWarning
    >
      {/* Текущий флаг - всегда рендерится с suppressHydrationWarning */}
      <span 
        className="text-lg transition-opacity duration-300 group-hover:opacity-0" 
        role="img" 
        aria-hidden="true"
        suppressHydrationWarning
      >
        {currentConfig.flag}
      </span>
      {/* Следующий флаг при hover - всегда рендерится */}
      <span 
        className="absolute text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
        role="img" 
        aria-hidden="true"
        suppressHydrationWarning
      >
        {nextConfig.flag}
      </span>
      <span className="sr-only">Switch language</span>
    </Button>
  )
}

