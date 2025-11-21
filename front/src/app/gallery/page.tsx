'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
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
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Состояния для свайпа
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
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
    setSwipeOffset(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    e.preventDefault()
    const currentX = e.targetTouches[0].clientX
    setTouchEndX(currentX)
    const offset = currentX - touchStartX
    setSwipeOffset(offset)
  }

  const onTouchEnd = () => {
    if (!touchStartX || touchEndX === null) {
      setTouchStartX(null)
      setTouchEndX(null)
      setSwipeOffset(0)
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
    setTouchEndX(null)
    setSwipeOffset(0)
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
      <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-3 border-sageTint/30 border-t-sageTint dark:border-primary/30 dark:border-t-primary rounded-full mx-auto mb-6"
          />
          <p className="text-inkSoft/60 dark:text-muted-foreground font-display text-lg">Загрузка галереи...</p>
        </div>
      </div>
    )
  }

  if (galleryImages.length === 0) {
    return (
      <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground min-h-screen">
        <section className="relative py-16 md:py-20 border-b border-mistGray/10 dark:border-border/50">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-roseBeige/5 to-transparent dark:via-transparent" />
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10"
          >
            <h1 className="text-title-1 md:text-display-1 font-display font-light text-inkSoft dark:text-foreground leading-tight tracking-wide mb-4">
              {t('gallery.title')}
            </h1>
            <p className="text-body sm:text-body-lg font-normal text-inkSoft/70 dark:text-foreground/70 max-w-2xl mx-auto">
              {t('gallery.description')}
            </p>
          </motion.div>
        </section>
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mistGray/10 dark:bg-muted/20 mb-4">
              <Sparkles className="w-8 h-8 text-mistGray/40 dark:text-muted-foreground/40" />
            </div>
            <p className="text-inkSoft/60 dark:text-muted-foreground font-display">Галерея пуста</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground h-screen overflow-hidden flex items-start justify-center">
      <section className="w-full h-full flex items-start justify-center pt-4 pb-2 md:py-4 lg:py-6">
        <div className="container mx-auto px-0 md:px-6 lg:px-8 h-full flex items-start justify-center w-full">
          <div className="relative w-full md:max-w-7xl mx-auto">
            {/* Стрелки навигации - прямоугольные серые кнопки */}
            <div className="absolute left-1 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-10 flex items-center">
              <motion.button
                type="button"
                onClick={goToPrevious}
                aria-label="Предыдущий слайд"
                whileTap={{ scale: 0.95 }}
                className="w-8 h-10 md:w-10 md:h-12 lg:w-12 lg:h-14 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center justify-center shadow-md"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2.5} />
              </motion.button>
            </div>

            <div className="absolute right-1 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-10 flex items-center">
              <motion.button
                type="button"
                onClick={goToNext}
                aria-label="Следующий слайд"
                whileTap={{ scale: 0.95 }}
                className="w-8 h-10 md:w-10 md:h-12 lg:w-12 lg:h-14 rounded-lg bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors flex items-center justify-center shadow-md"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Контейнер изображения - простой, без сложных границ */}
            <motion.div 
              className="relative overflow-hidden w-full md:mx-14 lg:mx-16"
              style={{ touchAction: 'pan-x' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9] bg-white dark:bg-background w-full">
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
                        target.src = '/placeholder/about_main_placeholder.webp'
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Точки навигации - маленькие серые точки, одна активная черная */}
            <div className="flex justify-center gap-2 md:gap-2.5 mt-1 md:mt-4 lg:mt-5">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  aria-label={`Перейти к слайду ${index + 1}`}
                  aria-current={currentIndex === index ? 'true' : undefined}
                  className={`rounded-full transition-all duration-300 ${
                    currentIndex === index
                      ? 'bg-black dark:bg-white w-2.5 h-2.5 md:w-3 md:h-3'
                      : 'bg-gray-300 dark:bg-gray-600 w-2 h-2 md:w-2.5 md:h-2.5'
                  }`}
                />
              ))}
            </div>

            {/* Кнопка МАГАЗИН */}
            <div className="flex justify-center mt-2 md:mt-8 lg:mt-10">
              <Link
                href="/catalog"
                className="px-8 py-2.5 md:px-10 md:py-3 lg:px-12 lg:py-3.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-background text-inkSoft dark:text-foreground font-display text-base md:text-lg lg:text-xl tracking-wide hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                МАГАЗИН
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
