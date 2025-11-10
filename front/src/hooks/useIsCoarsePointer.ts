'use client'

import { useEffect, useState } from 'react'

export function useIsCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)')

    const update = () => setIsCoarse(mediaQuery.matches)

    update()
    mediaQuery.addEventListener('change', update)

    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return isCoarse
}


