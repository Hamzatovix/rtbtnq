'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * StarFieldMedium - Промежуточный вариант звездного неба
 * Используется для плавного перехода между Hero и остальными секциями
 * На мобильных устройствах звезды менее яркие
 */
export function StarFieldMedium() {
  const containerRef = useRef<HTMLDivElement>(null)
  const largeStarsRef = useRef<HTMLDivElement>(null)
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

    // Генерируем звезды с промежуточной яркостью
    // Большие звезды
    const generateLargeStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.25 + 0.35) * mobileBrightnessMultiplier, // 35-60% яркости (на мобильных: 21-36%)
        size: Math.random() * 0.3 + 1.2, // 1.2-1.5px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Средние звезды
    const generateMediumStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.2 + 0.25) * mobileBrightnessMultiplier, // 25-45% яркости (на мобильных: 15-27%)
        size: Math.random() * 0.2 + 1, // 1-1.2px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Маленькие звезды
    const generateSmallStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.15 + 0.2) * mobileBrightnessMultiplier, // 20-35% яркости (на мобильных: 12-21%)
        size: Math.random() * 0.2 + 0.8, // 0.8-1px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Очень маленькие звезды (фон)
    const generateTinyStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.1 + 0.12) * mobileBrightnessMultiplier, // 12-22% яркости (на мобильных: 7-13%)
        size: Math.random() * 0.2 + 0.5, // 0.5-0.7px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Промежуточное количество звезд между Hero и остальными секциями
    const largeStars = generateLargeStars(15) // промежуточное между Hero (20) и Subtle (0)
    const mediumStars = generateMediumStars(35) // промежуточное между Hero (40) и Subtle (20)
    const smallStars = generateSmallStars(70) // промежуточное между Hero (80) и Subtle (40)
    const tinyStars = generateTinyStars(100) // промежуточное между Hero (120) и Subtle (60)

    // Применяем через inline style box-shadow
    const applyStars = (
      ref: React.RefObject<HTMLDivElement | null>,
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

    applyStars(largeStarsRef, largeStars)
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
      {/* Большие звезды */}
      <div ref={largeStarsRef} className="stars stars-large" />
      {/* Средние звезды */}
      <div ref={mediumStarsRef} className="stars stars-medium" />
      {/* Маленькие звезды */}
      <div ref={smallStarsRef} className="stars stars-small" />
      {/* Очень маленькие звезды */}
      <div ref={tinyStarsRef} className="stars stars-tiny" />
    </div>
  )
}

