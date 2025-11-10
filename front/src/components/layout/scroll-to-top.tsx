'use client'

import { useEffect, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const { scrollRestoration } = window.history
    window.history.scrollRestoration = 'manual'

    return () => {
      window.history.scrollRestoration = scrollRestoration || 'auto'
    }
  }, [])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      })
    }

    // Выполняем в двух шагах, чтобы перебить задержанные восстановления скролла
    requestAnimationFrame(scrollToTop)
    const timeoutId = window.setTimeout(scrollToTop, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      })
    })

    return () => cancelAnimationFrame(rafId)
  }, [pathname])

  return null
}

