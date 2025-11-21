'use client'

import Image from 'next/image'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  
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
        setGalleryImages([])
      } finally {
        setLoading(false)
      }
    }
    loadGallery()
  }, [])

  // Блокировка скролла при полноэкранном режиме
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

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
      if (isFullscreen) {
        if (e.key === 'Escape') {
          setIsFullscreen(false)
        } else if (e.key === 'ArrowLeft') {
          goToPrevious()
        } else if (e.key === 'ArrowRight') {
          goToNext()
        }
      } else {
        if (e.key === 'ArrowLeft') {
          goToPrevious()
        } else if (e.key === 'ArrowRight') {
          goToNext()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, galleryImages.length])

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
    <>
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
            <div className="relative max-w-5xl mx-auto">
              {/* Стрелки навигации - десктоп */}
              <div className="absolute -left-8 md:-left-12 lg:-left-16 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center">
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Предыдущий слайд"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-mistGray/30 dark:border-border shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-inkSoft dark:text-foreground group-hover:text-sageTint dark:group-hover:text-primary transition-colors" strokeWidth={2} />
                </button>
              </div>

              <div className="absolute -right-8 md:-right-12 lg:-right-16 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center">
                <button
                  type="button"
                  onClick={goToNext}
                  aria-label="Следующий слайд"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm border border-mistGray/30 dark:border-border shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-inkSoft dark:text-foreground group-hover:text-sageTint dark:group-hover:text-primary transition-colors" strokeWidth={2} />
                </button>
              </div>

              {/* Контейнер слайдера */}
              <div 
                className="relative overflow-hidden rounded-2xl bg-mistGray/5 dark:bg-muted/5 shadow-lg hover:shadow-xl transition-shadow duration-300"
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
                        duration: swipeOffset !== 0 ? 0 : 0.4,
                        ease: swipeOffset !== 0 ? 'linear' : [0.22, 1, 0.36, 1]
                      }}
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => setIsFullscreen(true)}
                    >
                      <Image
                        src={galleryImages[currentIndex].src}
                        alt={galleryImages[currentIndex].alt}
                        fill
                        className="object-contain"
                        priority={currentIndex === 0}
                        loading={currentIndex === 0 ? 'eager' : 'lazy'}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
                        unoptimized={galleryImages[currentIndex].src.includes('blob.vercel-storage.com')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder/about_main_placeholder.webp'
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Кнопка полноэкранного режима */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    aria-label="Открыть в полноэкранном режиме"
                    className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm transition-all duration-300 flex items-center justify-center group hover:scale-110 z-20"
                  >
                    <Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </button>

                  {/* Стрелки для мобильных */}
                  <div className="md:hidden absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        goToPrevious()
                      }}
                      aria-label="Предыдущий слайд"
                      className="pointer-events-auto w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all duration-300 flex items-center justify-center active:scale-95"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        goToNext()
                      }}
                      aria-label="Следующий слайд"
                      className="pointer-events-auto w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all duration-300 flex items-center justify-center active:scale-95"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Миниатюры (только для десктопа) */}
              {galleryImages.length > 1 && (
                <div className="hidden md:flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                  {galleryImages.map((img, index) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => goToSlide(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        currentIndex === index
                          ? 'border-sageTint dark:border-primary shadow-lg scale-105'
                          : 'border-transparent hover:border-mistGray/50 dark:hover:border-border opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={img.src.includes('blob.vercel-storage.com')}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Точки навигации (bullets) */}
              <ul className="flex justify-center gap-2 mt-4 md:mt-6 list-none p-0">
                {galleryImages.map((_, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => goToSlide(index)}
                      aria-label={`Перейти к слайду ${index + 1}`}
                      aria-current={currentIndex === index ? 'true' : undefined}
                      className={`rounded-full transition-all duration-300 ${
                        currentIndex === index
                          ? 'bg-sageTint dark:bg-primary w-8 h-2 shadow-md'
                          : 'bg-mistGray/40 dark:bg-border/60 hover:bg-mistGray/60 dark:hover:bg-border w-2 h-2'
                      }`}
                    />
                  </li>
                ))}
              </ul>

              {/* Счетчик слайдов и описание */}
              <div className="text-center mt-4 space-y-1">
                <div className="text-sm font-medium text-inkSoft dark:text-foreground">
                  {currentIndex + 1} / {galleryImages.length}
                </div>
                {galleryImages[currentIndex].alt && (
                  <p className="text-xs text-inkSoft/60 dark:text-muted-foreground max-w-2xl mx-auto">
                    {galleryImages[currentIndex].alt}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Полноэкранный режим (Lightbox) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Кнопка закрытия */}
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Закрыть"
              className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center justify-center group hover:scale-110 z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Стрелки навигации */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              aria-label="Предыдущий слайд"
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center justify-center group hover:scale-110 z-10"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              aria-label="Следующий слайд"
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300 flex items-center justify-center group hover:scale-110 z-10"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </button>

            {/* Изображение */}
            <div 
              className="relative w-full h-full max-w-7xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={galleryImages[currentIndex].src}
                    alt={galleryImages[currentIndex].alt}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    unoptimized={galleryImages[currentIndex].src.includes('blob.vercel-storage.com')}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Информация внизу */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 text-center z-10">
              <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
                <div className="text-white text-sm font-medium">
                  {currentIndex + 1} / {galleryImages.length}
                </div>
                {galleryImages[currentIndex].alt && (
                  <div className="text-white/80 text-xs mt-1">
                    {galleryImages[currentIndex].alt}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
