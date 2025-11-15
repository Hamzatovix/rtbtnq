'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * StarField - Компонент звездного неба для темной темы
 * Статичное звездное небо для Hero секции (яркие звезды)
 * На мобильных устройствах звезды менее яркие
 */
export function StarField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const brightStarsRef = useRef<HTMLDivElement>(null)
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

    // Генерируем звезды с реалистичным распределением
    // Яркие звезды (самые заметные)
    const generateBrightStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.3 + 0.7) * mobileBrightnessMultiplier, // 70-100% яркости (на мобильных: 42-60%)
        size: Math.random() * 0.5 + 1.5, // 1.5-2px
        twinkleDelay: Math.random() * 20, // Задержка для мерцания
      }))
    }

    // Большие звезды
    const generateLargeStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.3 + 0.5) * mobileBrightnessMultiplier, // 50-80% яркости (на мобильных: 30-48%)
        size: Math.random() * 0.3 + 1.2, // 1.2-1.5px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Средние звезды
    const generateMediumStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.3 + 0.4) * mobileBrightnessMultiplier, // 40-70% яркости (на мобильных: 24-42%)
        size: Math.random() * 0.2 + 1, // 1-1.2px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Маленькие звезды (большинство)
    const generateSmallStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.25 + 0.25) * mobileBrightnessMultiplier, // 25-50% яркости (на мобильных: 15-30%)
        size: Math.random() * 0.2 + 0.8, // 0.8-1px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Очень маленькие звезды (фон)
    const generateTinyStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: (Math.random() * 0.2 + 0.15) * mobileBrightnessMultiplier, // 15-35% яркости (на мобильных: 9-21%)
        size: Math.random() * 0.2 + 0.5, // 0.5-0.7px
        twinkleDelay: Math.random() * 20,
      }))
    }

    // Уменьшено количество звезд для плавного перехода к другим секциям
    const brightStars = generateBrightStars(10) // было 15
    const largeStars = generateLargeStars(20) // было 30
    const mediumStars = generateMediumStars(40) // было 60
    const smallStars = generateSmallStars(80) // было 120
    const tinyStars = generateTinyStars(120) // было 200

    // Применяем через inline style box-shadow с тонким мерцанием
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
        // Добавляем тонкое мерцание через CSS переменную
        ref.current.style.setProperty('--twinkle-delay', `${stars[0]?.twinkleDelay || 0}s`)
      }
    }

    applyStars(brightStarsRef, brightStars)
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
      {/* Яркие звезды */}
      <div ref={brightStarsRef} className="stars stars-bright" />
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

