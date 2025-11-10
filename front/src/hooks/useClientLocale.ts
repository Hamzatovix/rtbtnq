'use client'

import { useEffect, useState } from 'react'
import { useLocaleStore } from '@/store/locale-store'

export function useClientLocale() {
  const locale = useLocaleStore((state) => state.locale)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    if (!useLocaleStore.persist.hasHydrated()) {
      Promise.resolve(useLocaleStore.persist.rehydrate()).finally(() => {
        setHasHydrated(true)
      })
      return
    }

    setHasHydrated(true)
  }, [])

  return hasHydrated ? locale : useLocaleStore.getState().locale
}

