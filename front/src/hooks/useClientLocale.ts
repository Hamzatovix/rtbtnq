'use client'

import { useEffect, useState } from 'react'
import { useLocaleStore } from '@/store/locale-store'

// Дефолтное значение локали для SSR (должно совпадать с дефолтом в store)
const DEFAULT_LOCALE: 'ru' | 'en' = 'ru'

export function useClientLocale() {
  // На сервере и при первом рендере всегда используем дефолтное значение
  const [locale, setLocale] = useState<'ru' | 'en'>(DEFAULT_LOCALE)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    // Только на клиенте после монтирования
    if (typeof window === 'undefined') return

    // Гидратируем store
    const initLocale = async () => {
      if (!useLocaleStore.persist.hasHydrated()) {
        await useLocaleStore.persist.rehydrate()
      }
      
      // Берем значение из store после гидратации
      const storeLocale = useLocaleStore.getState().locale
      setLocale(storeLocale)
      setHasHydrated(true)
    }

    initLocale()

    // Подписываемся на изменения локали в store
    const unsubscribe = useLocaleStore.subscribe((state) => {
      if (hasHydrated) {
        setLocale(state.locale)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [hasHydrated])

  // Всегда возвращаем одно и то же значение до гидратации
  return locale
}

