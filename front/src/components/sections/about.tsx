'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarFieldMedium } from '@/components/visuals/StarFieldMedium'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { AnimatePresence, motion } from 'framer-motion'

// Локальный компонент звезд для заголовка
function LocalStarField() {
  const largeStarsRef = useRef<HTMLDivElement>(null)
  const mediumStarsRef = useRef<HTMLDivElement>(null)
  const smallStarsRef = useRef<HTMLDivElement>(null)
  const tinyStarsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Генерируем звезды с промежуточной яркостью для локального элемента
    const generateLargeStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.25 + 0.35,
        size: Math.random() * 0.3 + 1.2,
        twinkleDelay: Math.random() * 20,
      }))
    }

    const generateMediumStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.2 + 0.25,
        size: Math.random() * 0.2 + 1,
        twinkleDelay: Math.random() * 20,
      }))
    }

    const generateSmallStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.15 + 0.2,
        size: Math.random() * 0.2 + 0.8,
        twinkleDelay: Math.random() * 20,
      }))
    }

    const generateTinyStars = (count: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.1 + 0.12,
        size: Math.random() * 0.2 + 0.5,
        twinkleDelay: Math.random() * 20,
      }))
    }

    const largeStars = generateLargeStars(8)
    const mediumStars = generateMediumStars(15)
    const smallStars = generateSmallStars(25)
    const tinyStars = generateTinyStars(35)

    const applyStars = (
      ref: React.RefObject<HTMLDivElement | null>,
      stars: Array<{ x: number; y: number; opacity: number; size: number; twinkleDelay: number }>
    ) => {
      if (ref.current) {
        const boxShadow = stars
          .map(
            (s) =>
              `${s.x}% ${s.y}% 0 0 hsl(35 15% 89% / ${s.opacity})`
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
  }, [])

  return (
    <div className="absolute inset-0 stars-container pointer-events-none overflow-hidden rounded-sm" aria-hidden="true">
      <div ref={largeStarsRef} className="stars stars-large" />
      <div ref={mediumStarsRef} className="stars stars-medium" />
      <div ref={smallStarsRef} className="stars stars-small" />
      <div ref={tinyStarsRef} className="stars stars-tiny" />
    </div>
  )
}

export function About() {
  const t = useTranslations()
  const locale = useClientLocale()
  
  // Массив изображений для ротации (вертикальные изображения)
  // ВАЖНО: Файлы должны быть конвертированы из HEIC в JPG/PNG/WebP
  const rotatingImages = [
    `/images/about_v1.png`,
    `/images/about_v2.png`,
  ]
  
  // Состояние для текущего индекса ротирующегося изображения
  const [currentRotatingIndex, setCurrentRotatingIndex] = useState(0)
  
  // Автоматическая ротация каждые 7 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRotatingIndex((prev) => (prev + 1) % rotatingImages.length)
    }, 7000) // 7 секунд между сменами
    
    return () => clearInterval(interval)
  }, [rotatingImages.length])
  
  return (
    <section
      className="relative py-12 md:py-16 lg:py-20 bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas border-b border-fintage-graphite/20 dark:border-fintage-graphite/30"
      aria-labelledby="about-heading"
    >
      {/* Промежуточные звезды для плавного перехода - только в темной теме */}
      <StarFieldMedium />
      {/* Градиентное появление звезд сверху для плавного перехода */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-fintage-offwhite dark:from-fintage-charcoal to-transparent pointer-events-none z-[5]" aria-hidden="true" />
      <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        {/* Wrap grid in relative to position connector */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
          
          {/* Content - много воздуха */}
          <div className="space-y-8 relative text-center md:text-left">
            {/* Заголовок в стиле технического каталога - Nike/Stone Island */}
            <div className="mb-8 md:mb-12">
              <div className="relative flex items-baseline gap-3 md:gap-4 mb-4">
                {/* Звездное небо в фоне - только в темной теме */}
                <LocalStarField />
                {/* Утилитарный номер секции в стиле каталога */}
                <div className="flex-shrink-0">
                  <span 
                    className="inline-block text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-mono font-bold text-fintage-graphite/40 dark:text-fintage-graphite/30 leading-none tracking-tighter"
                    aria-hidden="true"
                  >
                    00
                  </span>
                </div>
                <div>
                  <h2
                    id="about-heading"
                    className="text-title-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase"
                  >
                    {t('home.brand.title')}
                  </h2>
                  {/* Техническая подпись в стиле Stone Island */}
                  <p className="mt-1.5 text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
                    {t('home.brand.subtitleLabel')}
                  </p>
                </div>
              </div>
              
              {/* Разделительная линия в стиле технических каталогов */}
              <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30" aria-hidden="true" />
            </div>
              
            <div className="flex flex-col items-center md:items-start gap-8 min-h-[60px]">
              <p className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] leading-relaxed max-w-lg">
                {t('home.brand.description')}
              </p>
              
              {/* CTA в стиле минималистичного Nike */}
              <div className="flex flex-col items-center md:items-start gap-4 w-full">
                {/* Разделительная линия перед кнопкой */}
                <div className="w-16 h-px bg-fintage-graphite/30 dark:bg-fintage-graphite/40" aria-hidden="true" />
                
                <Button 
                  variant="primary"
                  size="lg"
                  asChild
                  className="group font-mono tracking-[0.15em]"
                >
                  <Link 
                    href="/brand" 
                    aria-label={t('home.brand.readMore') + ' rosebotanique'}
                    className="flex items-center gap-2"
                  >
                    <span suppressHydrationWarning className="uppercase text-xs md:text-sm tracking-[0.15em]">
                      {t('home.brand.readMore')}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:translate-x-0.5 transition-fintage" />
                  </Link>
                </Button>

                {/* Техническая подпись под кнопкой */}
                <p className="text-[9px] md:text-[10px] font-mono text-fintage-graphite/40 dark:text-fintage-graphite/50 uppercase tracking-[0.2em]">
                  {t('home.brand.learnMore')}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile layout: hero + horizontal swipeable strip */}
          <div className="md:hidden space-y-6">
            {/* Hero image — ротация c1, c2, c3, c4 (более вытянутое для длинных изображений) */}
            <figure className="relative w-full aspect-[3/5] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRotatingIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={rotatingImages[currentRotatingIndex]}
                    alt={t('home.brand.alt.stormScene') || 'Storm scene — bag with Iceland mountains, storm mood'}
                    fill
                    priority={currentRotatingIndex === 0}
                    loading={currentRotatingIndex === 0 ? 'eager' : 'lazy'}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center motion-safe:transition-fintage group-hover:scale-[1.01]"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder/about_main_placeholder.svg'
                    }}
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Индикаторы ротации — технический стиль */}
              <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5" aria-hidden="true">
                {rotatingImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-sm transition-fintage ${
                      index === currentRotatingIndex
                        ? 'w-5 bg-fintage-charcoal dark:bg-fintage-offwhite'
                        : 'w-1.5 bg-fintage-graphite/40 dark:bg-fintage-graphite/50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Youth badge / sticker — storm edition */}
              <div className="absolute top-3 left-3 z-20" aria-hidden="true">
                <div className="px-2.5 py-1 rounded-sm border border-fintage-graphite/40 dark:border-fintage-graphite/50 bg-surface dark:bg-surface-alt backdrop-blur-sm shadow-fintage-sm">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-charcoal dark:text-fintage-offwhite">
                    {t('home.brand.badge.stormEdition') || 'STORM EDITION'}
                  </span>
                </div>
              </div>
              
              {/* Stormy overlay — green/storm mood */}
              <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black_60%,transparent_70%)] bg-accent/10 dark:bg-accent/8 pointer-events-none" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-fintage pointer-events-none" aria-hidden="true" />
              
              {/* Retro catalog caption */}
              <figcaption className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60">
                  {t('home.brand.caption.storm') || 'STORM'}
                </span>
              </figcaption>
            </figure>

            {/* Horizontal scroll strip — статичные изображения sc и scw */}
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 md:-mx-8 md:px-8">
              {/* Горизонтальное изображение 1 */}
              <figure className="relative min-w-[80%] aspect-[4/3] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30 snap-center flex-shrink-0">
                <Image
                  src="/images/about_h1.png"
                  alt={t('home.brand.alt.accessories') || 'Accessories flatlay — bag on concrete with headphones, camera, keys'}
                  fill
                  loading="lazy"
                  sizes="75vw"
                  className="object-cover motion-safe:transition-fintage group-hover:scale-[1.01]"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.svg'
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)] bg-accent/5 dark:bg-accent/5 pointer-events-none" aria-hidden="true" />
                
                {/* Retro catalog caption */}
                <figcaption className="absolute bottom-2 left-2 z-10 pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60">
                    {t('home.brand.caption.accessories') || 'ACCESSORIES'}
                  </span>
                </figcaption>
              </figure>

              {/* Горизонтальное изображение 2 */}
              <figure className="relative min-w-[80%] aspect-[4/3] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30 snap-center flex-shrink-0">
                <Image
                  src="/images/about_h2.png"
                  alt={t('home.brand.alt.movement') || 'In motion — person walking with bag, cropped focus on bag and movement'}
                  fill
                  loading="lazy"
                  sizes="75vw"
                  className="object-cover motion-safe:transition-fintage group-hover:scale-[1.01]"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.svg'
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_75%)] bg-accent/5 dark:bg-accent/5 pointer-events-none" aria-hidden="true" />
                
                {/* Retro catalog caption */}
                <figcaption className="absolute bottom-2 left-2 z-10 pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60">
                    {t('home.brand.caption.movement') || 'IN MOTION'}
                  </span>
                </figcaption>
              </figure>

              {/* Горизонтальное изображение 3 */}
              <figure className="relative min-w-[80%] aspect-[4/3] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30 snap-center flex-shrink-0">
                <Image
                  src="/images/about_h3.png"
                  alt={t('home.brand.alt.details') || 'Details — close-up of bag details and craftsmanship'}
                  fill
                  loading="lazy"
                  sizes="75vw"
                  className="object-cover motion-safe:transition-fintage group-hover:scale-[1.01]"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.svg'
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)] bg-accent/5 dark:bg-accent/5 pointer-events-none" aria-hidden="true" />
                
                {/* Retro catalog caption */}
                <figcaption className="absolute bottom-2 left-2 z-10 pointer-events-none">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60">
                    {t('home.brand.caption.details') || 'DETAILS'}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Desktop layout: асимметричная композиция в стиле Nike/North Face/Urban */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-[2.5fr_1.5fr] gap-6 md:gap-8 lg:gap-10 items-start">
            {/* Left part — ротация c1, c2, c3, c4 (более вытянутое для длинных изображений) */}
            <figure className="relative aspect-[2/3] md:aspect-[3/4] lg:aspect-[2/3] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRotatingIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <Image
                    src={rotatingImages[currentRotatingIndex]}
                    alt={t('home.brand.alt.stormScene') || 'Storm scene — bag with Iceland mountains, storm mood'}
                    fill
                    priority={currentRotatingIndex === 0}
                    loading={currentRotatingIndex === 0 ? 'eager' : 'lazy'}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center motion-safe:transition-fintage group-hover:scale-[1.01]"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder/about_main_placeholder.svg'
                    }}
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Индикаторы ротации — технический стиль */}
              <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex items-center gap-1.5" aria-hidden="true">
                {rotatingImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 md:h-2 rounded-sm transition-fintage ${
                      index === currentRotatingIndex
                        ? 'w-5 md:w-6 bg-fintage-charcoal dark:bg-fintage-offwhite'
                        : 'w-1.5 md:w-2 bg-fintage-graphite/40 dark:bg-fintage-graphite/50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Youth badge / sticker — storm edition */}
              <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20" aria-hidden="true">
                <div className="px-2.5 py-1 md:px-3 md:py-1.5 rounded-sm border border-fintage-graphite/40 dark:border-fintage-graphite/50 bg-surface dark:bg-surface-alt backdrop-blur-sm shadow-fintage-sm">
                  <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.15em] text-fintage-charcoal dark:text-fintage-offwhite">
                    {t('home.brand.badge.stormEdition') || 'STORM EDITION'}
                  </span>
                </div>
              </div>
              
              {/* Stormy overlay — green/storm mood */}
              <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black_60%,transparent_70%)] bg-accent/10 dark:bg-accent/8 pointer-events-none" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-fintage pointer-events-none" aria-hidden="true" />
              
              {/* Retro catalog caption — wide line under hero on desktop */}
              <figcaption className="absolute bottom-3 left-3 md:bottom-4 md:left-4 lg:static lg:mt-2 lg:px-0 z-20 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60 block text-center lg:text-left">
                    {t('home.brand.caption.storm') || 'STORM'}
                  </span>
                  {/* Техническая подпись о ротации */}
                  <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] text-fintage-graphite/50 dark:text-fintage-graphite/40 hidden lg:block">
                    {currentRotatingIndex + 1}/{rotatingImages.length}
                  </span>
                </div>
              </figcaption>
            </figure>

            {/* Right part — вертикальная колонка со статичными изображениями sc и scw (Urban style) */}
            <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
              {/* Top horizontal image — горизонтальное изображение 1 */}
              <figure className="relative aspect-[4/3] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30">
                <Image
                  src="/images/about_h1.png"
                  alt={t('home.brand.alt.accessories') || 'Accessories flatlay — bag on concrete with headphones, camera, keys'}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover motion-safe:transition-fintage group-hover:scale-[1.01]"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.svg'
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)] bg-accent/5 dark:bg-accent/5 pointer-events-none" aria-hidden="true" />
                
                {/* Retro catalog caption */}
                <figcaption className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10 pointer-events-none">
                  <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60">
                    {t('home.brand.caption.accessories') || 'ACCESSORIES'}
                  </span>
                </figcaption>
              </figure>

              {/* Bottom horizontal image — горизонтальное изображение 2 */}
              <figure className="relative aspect-[4/3] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30">
                <Image
                  src="/images/about_h2.png"
                  alt={t('home.brand.alt.movement') || 'In motion — person walking with bag, cropped focus on bag and movement'}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover motion-safe:transition-fintage group-hover:scale-[1.01]"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.svg'
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_75%)] bg-accent/5 dark:bg-accent/5 pointer-events-none" aria-hidden="true" />
                
                {/* Retro catalog caption */}
                <figcaption className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10 pointer-events-none">
                  <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60">
                    {t('home.brand.caption.movement') || 'IN MOTION'}
                  </span>
                </figcaption>
              </figure>

              {/* Third horizontal image — горизонтальное изображение 3 */}
              <figure className="relative aspect-[4/3] rounded-sm overflow-hidden group border border-fintage-graphite/20 dark:border-fintage-graphite/30">
                <Image
                  src="/images/about_h3.png"
                  alt={t('home.brand.alt.details') || 'Details — close-up of bag details and craftsmanship'}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover motion-safe:transition-fintage group-hover:scale-[1.01]"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.svg'
                  }}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)] bg-accent/5 dark:bg-accent/5 pointer-events-none" aria-hidden="true" />
                
                {/* Retro catalog caption */}
                <figcaption className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10 pointer-events-none">
                  <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.15em] text-fintage-graphite/80 dark:text-fintage-graphite/60">
                    {t('home.brand.caption.details') || 'DETAILS'}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}
