'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
} as const

type GalleryImage = {
  id: string
  src: string
  alt: string
}

export default function GalleryPage() {
  const prefersReducedMotion = useReducedMotion()
  const t = useTranslations()
  const locale = useClientLocale()
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Состояния для свайпа
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false)
  const minSwipeDistance = 50

  // Загрузка изображений галереи
  useEffect(() => {
    const loadGallery = async () => {
      try {
        console.log('[Gallery Page] Начало загрузки галереи...')
        const res = await fetch('/api/gallery', { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (!res.ok) {
          console.error('[Gallery Page] Ошибка ответа API:', res.status, res.statusText)
          const errorText = await res.text()
          console.error('[Gallery Page] Текст ошибки:', errorText)
          setGalleryImages([])
          setLoading(false)
          return
        }
        
        const data = await res.json()
        console.log('[Gallery Page] Получены данные:', {
          hasImages: !!data.images,
          imagesCount: data.images?.length || 0,
          data: data
        })
        
        if (data.images && Array.isArray(data.images)) {
          setGalleryImages(data.images)
          console.log('[Gallery Page] Установлено изображений:', data.images.length)
        } else {
          console.warn('[Gallery Page] Некорректный формат данных:', data)
          setGalleryImages([])
        }
      } catch (error) {
        console.error('[Gallery Page] Ошибка при загрузке галереи:', error)
        setGalleryImages([])
      } finally {
        setLoading(false)
      }
    }
    loadGallery()
  }, [])


  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  // Обработчики свайпа для мобильных устройств
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
    setSwipeOffset(0)
    setIsHorizontalSwipe(false)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return
    
    const currentX = e.targetTouches[0].clientX
    const currentY = e.targetTouches[0].clientY
    const deltaX = Math.abs(currentX - touchStartX)
    const deltaY = Math.abs(currentY - touchStartY)
    
    // Определяем направление свайпа: горизонтальный или вертикальный
    // Используем больший порог (20px) и более строгое условие для точного определения
    if (deltaX > deltaY && deltaX > 20 && deltaX > deltaY * 1.5) {
      // Горизонтальный свайп - блокируем скролл страницы только после уверенного определения
      if (!isHorizontalSwipe) {
        setIsHorizontalSwipe(true)
      }
      e.preventDefault()
      setTouchEndX(currentX)
      const offset = currentX - touchStartX
      setSwipeOffset(offset)
    } else if (deltaY > deltaX && deltaY > 20) {
      // Вертикальный свайп - разрешаем скролл страницы
      // Не вызываем preventDefault, чтобы страница могла скроллиться
      setTouchStartX(null)
      setTouchStartY(null)
      setTouchEndX(null)
      setSwipeOffset(0)
      setIsHorizontalSwipe(false)
    }
  }

  const onTouchEnd = () => {
    if (!touchStartX || touchEndX === null || !isHorizontalSwipe) {
      setTouchStartX(null)
      setTouchStartY(null)
      setTouchEndX(null)
      setSwipeOffset(0)
      setIsHorizontalSwipe(false)
      return
    }
    
    const distance = touchStartX - touchEndX
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
    
    setTouchStartX(null)
    setTouchStartY(null)
    setTouchEndX(null)
    setSwipeOffset(0)
    setIsHorizontalSwipe(false)
  }

  // Обработка клавиатуры
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [galleryImages.length])

  // Если галерея пуста или загружается
  if (loading) {
    return (
      <div className="bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-2 border-fintage-graphite/30 dark:border-fintage-graphite/50 border-t-accent dark:border-t-accent rounded-sm mx-auto mb-6"
          />
          <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.2em]">Загрузка галереи...</p>
        </div>
      </div>
    )
  }

  if (galleryImages.length === 0) {
    return (
      <div className="bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas min-h-screen">
        <section className="relative py-16 md:py-20 lg:py-24 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6 md:px-8 lg:px-12 text-center relative z-10"
          >
            {/* Заголовок в стиле технического каталога */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-baseline justify-center gap-3 md:gap-4 mb-6">
                <div className="flex-shrink-0">
                  <span
                    className="inline-block text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-mono font-bold text-fintage-graphite/40 dark:text-fintage-graphite/30 leading-none tracking-tighter"
                    aria-hidden="true"
                  >
                    03
                  </span>
                </div>
                <div>
                  <h1 className="text-title-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase">
                    {t('gallery.title')}
                  </h1>
                  <p className="mt-1.5 text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
                    {locale === 'ru' ? 'ГАЛЕРЕЯ' : 'GALLERY'}
                  </p>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30" aria-hidden="true" />
            </div>
            <p className="text-fintage-charcoal/80 dark:text-fintage-offwhite/80 leading-relaxed text-sm md:text-base max-w-2xl mx-auto font-light">
              {t('gallery.description')}
            </p>
          </motion.div>
        </section>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-8 lg:px-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-sm bg-fintage-graphite/10 dark:bg-fintage-graphite/20 border border-fintage-graphite/20 dark:border-fintage-graphite/30 mb-4">
              <Sparkles className="w-8 h-8 text-fintage-graphite/40 dark:text-fintage-graphite/50" />
            </div>
            <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.2em]">Галерея пуста</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas h-screen overflow-hidden flex items-start justify-center">
      <section className="w-full h-full flex items-start justify-center pt-2 pb-1 md:py-4 lg:py-6">
        <div className="w-full md:container md:mx-auto px-0 md:px-6 lg:px-8 h-full flex items-start justify-center">
          <div className="relative w-full md:max-w-7xl mx-auto">
            {/* Стрелки навигации - технический стиль */}
            <div className="absolute left-1 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-10 flex items-center">
              <motion.button
                type="button"
                onClick={goToPrevious}
                aria-label="Предыдущий слайд"
                whileTap={{ scale: 0.95 }}
                className="w-8 h-10 md:w-10 md:h-12 lg:w-12 lg:h-14 rounded-sm bg-fintage-graphite/80 dark:bg-fintage-graphite/70 hover:bg-fintage-graphite dark:hover:bg-fintage-graphite/90 transition-fintage flex items-center justify-center shadow-fintage-md border border-fintage-graphite/30 dark:border-fintage-graphite/40"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-fintage-offwhite dark:text-fintage-offwhite" strokeWidth={2.5} />
              </motion.button>
            </div>

            <div className="absolute right-1 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-10 flex items-center">
              <motion.button
                type="button"
                onClick={goToNext}
                aria-label="Следующий слайд"
                whileTap={{ scale: 0.95 }}
                className="w-8 h-10 md:w-10 md:h-12 lg:w-12 lg:h-14 rounded-sm bg-fintage-graphite/80 dark:bg-fintage-graphite/70 hover:bg-fintage-graphite dark:hover:bg-fintage-graphite/90 transition-fintage flex items-center justify-center shadow-fintage-md border border-fintage-graphite/30 dark:border-fintage-graphite/40"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-fintage-offwhite dark:text-fintage-offwhite" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Контейнер изображения - технический стиль */}
            <motion.div 
              className="relative overflow-hidden mx-3 md:mx-14 lg:mx-16 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative h-[70vh] md:aspect-[16/10] lg:aspect-[16/9] bg-fintage-graphite/5 dark:bg-fintage-graphite/10 w-full">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: swipeOffset !== 0 ? swipeOffset : 30 }}
                    animate={{ 
                      opacity: 1, 
                      x: swipeOffset * 0.2,
                    }}
                    exit={{ opacity: 0, x: swipeOffset !== 0 ? -swipeOffset : -30 }}
                    transition={{ 
                      duration: swipeOffset !== 0 ? 0 : 0.4,
                      ease: swipeOffset !== 0 ? 'linear' : 'easeInOut'
                    }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={galleryImages[currentIndex].src}
                      alt={galleryImages[currentIndex].alt}
                      fill
                      className="object-contain"
                      priority={currentIndex === 0}
                      loading={currentIndex === 0 ? 'eager' : 'lazy'}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 95vw, (max-width: 1280px) 90vw, 1400px"
                      unoptimized={galleryImages[currentIndex].src.includes('blob.vercel-storage.com')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder/about_main_placeholder.svg'
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Точки навигации - технический стиль (остаются круглыми для удобства) */}
            <div className="flex justify-center gap-2 md:gap-2.5 mt-0.5 md:mt-4 lg:mt-5">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Перейти к слайду ${index + 1}`}
                  aria-current={currentIndex === index ? 'true' : undefined}
                  className={`rounded-full transition-fintage ${
                    currentIndex === index
                      ? 'bg-fintage-charcoal dark:bg-fintage-offwhite w-2.5 h-2.5 md:w-3 md:h-3 shadow-fintage-sm'
                      : 'bg-fintage-graphite/40 dark:bg-fintage-graphite/50 w-2 h-2 md:w-2.5 md:h-2.5 hover:bg-fintage-graphite/60 dark:hover:bg-fintage-graphite/60'
                  }`}
                />
              ))}
            </div>

            {/* Кнопка МАГАЗИН - технический стиль */}
            <div className="flex flex-col items-center gap-4 mt-3 md:mt-8 lg:mt-10">
              {/* Разделительная линия перед кнопкой */}
              <div className="w-16 h-px bg-fintage-graphite/30 dark:bg-fintage-graphite/40" aria-hidden="true" />
              <Link
                href="/catalog"
                className="px-8 py-2.5 md:px-10 md:py-3 lg:px-12 lg:py-3.5 border border-fintage-charcoal dark:border-fintage-offwhite bg-fintage-charcoal dark:bg-fintage-offwhite text-fintage-offwhite dark:text-fintage-charcoal font-mono text-xs md:text-sm lg:text-base tracking-[0.15em] uppercase hover:brightness-90 dark:hover:brightness-90 transition-fintage shadow-fintage-sm"
              >
                {locale === 'ru' ? 'МАГАЗИН' : 'SHOP'}
              </Link>
              {/* Техническая подпись под кнопкой */}
              <p className="text-[9px] md:text-[10px] font-mono text-fintage-graphite/40 dark:text-fintage-graphite/50 uppercase tracking-[0.2em]">
                {locale === 'ru' ? `${galleryImages.length} ИЗОБРАЖЕНИЙ` : `${galleryImages.length} IMAGES`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
