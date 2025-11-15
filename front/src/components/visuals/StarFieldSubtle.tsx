'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * StarFieldSubtle - Компонент для менее ярких звезд на других секциях
 * Меньше звезд и менее яркие, чем основной StarField
 * На мобильных устройствах звезды менее яркие
 */
export function StarFieldSubtle() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mediumStarsRef = useRef<HTMLDivElement>(null)
  const smallStarsRef = useRef<HTMLDivElement>(null)
  const tinyStarsRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Определяем мобильное устройство
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Коэффициент яркости для мобильных устройств (уменьшаем яркость на 40%)
    const mobileBrightnessMultiplier = isMobile ? 0.6 : 1

    // Генерируем звезды с меньшей яркостью и количеством
    // Средние звезды - немного ярче для плавного перехода
    const generateMediumStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.2 + 0.25) * mobileBrightnessMultiplier, // 25-45% яркости (на мобильных: 15-27%)
        size: Math.random() * 0.2 + 1, // 1-1.2px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Маленькие звезды - немного ярче для плавного перехода
    const generateSmallStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.15 + 0.18) * mobileBrightnessMultiplier, // 18-33% яркости (на мобильных: 11-20%)
        size: Math.random() * 0.2 + 0.8, // 0.8-1px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Очень маленькие звезды (фон) - немного ярче для плавного перехода
    const generateTinyStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.1 + 0.12) * mobileBrightnessMultiplier, // 12-22% яркости (на мобильных: 7-13%)
        size: Math.random() * 0.2 + 0.5, // 0.5-0.7px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Меньше звезд чем в основном StarField
    const mediumStars = generateMediumStars(20) // было 60
    const smallStars = generateSmallStars(40) // было 120
    const tinyStars = generateTinyStars(60) // было 200

    // Применяем через inline style box-shadow
    const applyStars = (
      ref: React.RefObject<HTMLDivElement>,
      stars: Array<{ x: number; y: number; opacity: number; size: number; twinkleDelay: number }>
    ) => {
      if (ref.current) {
        const boxShadow = stars
          .map(
            (s) =>
              `${s.x}vw ${s.y}vh 0 0 hsl(35 15% 89% / ${s.opacity})`
          )
          .join(', ')
        ref.current.style.boxShadow = boxShadow
        ref.current.style.setProperty('--twinkle-delay', `${stars[0]?.twinkleDelay || 0}s`)
      }
    }

    applyStars(mediumStarsRef, mediumStars)
    applyStars(smallStarsRef, smallStars)
    applyStars(tinyStarsRef, tinyStars)
  }, [isMobile])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 stars-container pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Средние звезды */}
      <div ref={mediumStarsRef} className="stars stars-medium" />
      {/* Маленькие звезды */}
      <div ref={smallStarsRef} className="stars stars-small" />
      {/* Очень маленькие звезды */}
      <div ref={tinyStarsRef} className="stars stars-tiny" />
    </div>
  )
}

