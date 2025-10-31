'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useParallaxTilt() {
  const ref = useRef<HTMLDivElement>(null)
  const [styleVars, setStyleVars] = useState<Record<string, string>>({
    '--tiltX': '0deg',
    '--tiltY': '0deg',
    '--tx': '0px',
    '--ty': '0px'
  })

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) / rect.width
    const deltaY = (e.clientY - centerY) / rect.height
    
    const tiltX = deltaY * 2
    const tiltY = deltaX * 2
    const tx = deltaX * 6
    const ty = deltaY * 6

    setStyleVars({
      '--tiltX': `${tiltX}deg`,
      '--tiltY': `${tiltY}deg`,
      '--tx': `${tx}px`,
      '--ty': `${ty}px`
    })
  }, [])

  const handlePointerLeave = useCallback(() => {
    setStyleVars({
      '--tiltX': '0deg',
      '--tiltY': '0deg',
      '--tx': '0px',
      '--ty': '0px'
    })
  }, [])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }
  }, [])

  return {
    ref,
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave
    },
    style: styleVars
  }
}
