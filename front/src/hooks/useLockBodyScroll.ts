'use client'

import { useLayoutEffect } from 'react'

/**
 * Hook to lock body scroll when component is mounted or when flag is true.
 * Uses useLayoutEffect to prevent flash of content with wrong scroll behavior.
 */
export function useLockBodyScroll(lock: boolean) {
  useLayoutEffect(() => {
    if (!lock) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [lock])
}

