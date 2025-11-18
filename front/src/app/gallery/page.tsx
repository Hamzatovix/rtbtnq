'use client'

import Image from 'next/image'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
        const res = await fetch('/api/gallery', { cache: 'no-store' })
        const data = await res.json()
        setGalleryImages(data.images || [])
      } catch (error) {
        console.error('Ошибка при загрузке галереи:', error)
        // Fallback на пустой массив
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
        // Свайп влево - следующее изображение
        goToNext()
      } else {
        // Свайп вправо - предыдущее изображение
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
  }, [])

  // Если галерея пуста или загружается
  if (loading) {
    return (
      <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sageTint dark:border-primary mx-auto mb-4"></div>
          <p className="text-inkSoft/60 dark:text-muted-foreground">Загрузка галереи...</p>
        </div>
      </div>
    )
  }

  if (galleryImages.length === 0) {
    return (
      <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground min-h-screen">
        <section className="relative py-10 md:py-12 border-b border-mistGray/20 dark:border-border">
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6 md:px-12 lg:px-24 text-center"
          >
            <h1 className="text-title-1 md:text-display-1 font-normal text-inkSoft dark:text-foreground leading-tight tracking-wide mb-2">
              {t('gallery.title')}
            </h1>
            <p className="text-body sm:text-body-lg font-normal text-inkSoft/80 dark:text-foreground/80 max-w-2xl mx-auto">
              {t('gallery.description')}
            </p>
          </motion.div>
        </section>
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center">
            <p className="text-inkSoft/60 dark:text-muted-foreground">Галерея пуста</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground min-h-screen">
      {/* Hero section */}
      <section className="relative py-10 md:py-12 border-b border-mistGray/20 dark:border-border">
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-6 md:px-12 lg:px-24 text-center"
        >
          <h1 className="text-title-1 md:text-display-1 font-normal text-inkSoft dark:text-foreground leading-tight tracking-wide mb-2">
            {t('gallery.title')}
          </h1>
          <p className="text-body sm:text-body-lg font-normal text-inkSoft/80 dark:text-foreground/80 max-w-2xl mx-auto">
            {t('gallery.description')}
          </p>
        </motion.div>
      </section>

      {/* Carousel Gallery */}
      <section className="py-12 md:py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="container mx-auto px-6 md:px-12 lg:px-24"
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Стрелки навигации - снаружи контейнера (как в примере) */}
            <div className="absolute -left-12 md:-left-16 lg:-left-20 top-0 bottom-0 z-10 hidden md:flex items-center">
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Предыдущий слайд"
                aria-disabled={false}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mistGray/90 dark:bg-muted/90 hover:bg-mistGray dark:hover:bg-muted transition-all duration-300 flex items-center justify-center group shadow-sm"
                style={{ 
                  backgroundColor: 'rgb(232, 232, 232)',
                  marginTop: '0px'
                }}
              >
                <div className="w-2 h-2 flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-inkSoft dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
              </button>
            </div>

            <div className="absolute -right-12 md:-right-16 lg:-right-20 top-0 bottom-0 z-10 hidden md:flex items-center">
              <button
                type="button"
                onClick={goToNext}
                aria-label="Следующий слайд"
                aria-disabled={false}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mistGray/90 dark:bg-muted/90 hover:bg-mistGray dark:hover:bg-muted transition-all duration-300 flex items-center justify-center group shadow-sm"
                style={{ 
                  backgroundColor: 'rgb(232, 232, 232)',
                  marginTop: '0px'
                }}
              >
                <div className="w-2 h-2 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-inkSoft dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors" strokeWidth={1.5} />
                </div>
              </button>
            </div>

            {/* Контейнер слайдера */}
            <div 
              className="relative overflow-hidden rounded-lg bg-mistGray/5 dark:bg-muted/5"
              style={{ touchAction: 'pan-x' }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="relative aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: swipeOffset !== 0 ? swipeOffset : 50 }}
                    animate={{ 
                      opacity: 1, 
                      x: swipeOffset * 0.3,
                    }}
                    exit={{ opacity: 0, x: swipeOffset !== 0 ? -swipeOffset : -50 }}
                    transition={{ 
                      duration: swipeOffset !== 0 ? 0 : 0.3,
                      ease: swipeOffset !== 0 ? 'linear' : [0.22, 1, 0.36, 1]
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder/about_main_placeholder.webp'
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Стрелки для мобильных - внутри контейнера */}
                <div className="md:hidden absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToPrevious()
                    }}
                    aria-label="Предыдущий слайд"
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToNext()
                    }}
                    aria-label="Следующий слайд"
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 transition-colors flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Точки навигации (bullets) - как в примере */}
            <ul className="flex justify-center gap-2 mt-6 md:mt-8 list-none p-0">
              {galleryImages.map((_, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Перейти к слайду ${index + 1}`}
                    aria-current={currentIndex === index ? 'true' : undefined}
                    className={`rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'bg-inkSoft dark:bg-foreground w-8 h-2'
                        : 'bg-mistGray/40 dark:bg-border/60 hover:bg-mistGray/60 dark:hover:bg-border w-2 h-2'
                    }`}
                    style={{
                      backgroundColor: currentIndex === index 
                        ? undefined 
                        : 'rgb(199, 199, 199)'
                    }}
                  />
                </li>
              ))}
            </ul>

            {/* Счетчик слайдов */}
            <div className="text-center mt-4 text-sm text-inkSoft/60 dark:text-muted-foreground">
              {currentIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
