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
      className="h-9 w-9 rounded-sm border-2 border-fintage-graphite/40 dark:border-fintage-graphite/70 bg-fintage-offwhite dark:bg-fintage-graphite/30 hover:bg-hover-bg dark:hover:bg-hover-bg hover:border-hover-border dark:hover:border-accent transition-fintage relative group active:scale-95"
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
    </Button>
  )
}

