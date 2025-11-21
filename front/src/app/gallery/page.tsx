'use client'

import Image from 'next/image'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { ChevronLeft, ChevronRight, X, Maximize2, Sparkles } from 'lucide-react'

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
      <div className="bg-gradient-to-b from-roseBeige/30 via-white to-white dark:from-background dark:via-background dark:to-background text-inkSoft dark:text-foreground min-h-screen flex items-center justify-center">
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
      <div className="bg-gradient-to-b from-roseBeige/30 via-white to-white dark:from-background dark:via-background dark:to-background text-inkSoft dark:text-foreground min-h-screen">
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
    <>
      <div className="bg-gradient-to-b from-roseBeige/30 via-white to-white dark:from-background dark:via-background dark:to-background text-inkSoft dark:text-foreground min-h-screen">
        {/* Hero section */}
        <section className="relative py-16 md:py-20 border-b border-mistGray/10 dark:border-border/50 overflow-hidden">
          {/* Декоративный фон */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-roseBeige/5 to-transparent dark:via-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sageTint/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-roseBeige/20 rounded-full blur-3xl -z-10" />
          
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-sageTint/10 to-roseBeige/20 dark:from-primary/10 dark:to-primary/5 border border-mistGray/20 dark:border-border/50 mb-6"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-sageTint dark:text-primary" />
            </motion.div>
            <h1 className="text-title-1 md:text-display-1 font-display font-light text-inkSoft dark:text-foreground leading-tight tracking-wide mb-4">
              {t('gallery.title')}
            </h1>
            <p className="text-body sm:text-body-lg font-normal text-inkSoft/70 dark:text-foreground/70 max-w-2xl mx-auto">
              {t('gallery.description')}
            </p>
          </motion.div>
        </section>

        {/* Carousel Gallery */}
        <section className="py-12 md:py-20 lg:py-24">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fade}
            className="container mx-auto px-6 md:px-12 lg:px-24"
          >
            <div className="relative max-w-6xl mx-auto">
              {/* Стрелки навигации - десктоп */}
              <div className="absolute -left-6 md:-left-10 lg:-left-14 xl:-left-16 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center">
                <motion.button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Предыдущий слайд"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 dark:bg-card/80 backdrop-blur-md border-2 border-mistGray/20 dark:border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                  <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-inkSoft dark:text-foreground group-hover:text-sageTint dark:group-hover:text-primary transition-colors" strokeWidth={2.5} />
                </motion.button>
              </div>

              <div className="absolute -right-6 md:-right-10 lg:-right-14 xl:-right-16 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center">
                <motion.button
                  type="button"
                  onClick={goToNext}
                  aria-label="Следующий слайд"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 dark:bg-card/80 backdrop-blur-md border-2 border-mistGray/20 dark:border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                >
                  <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-inkSoft dark:text-foreground group-hover:text-sageTint dark:group-hover:text-primary transition-colors" strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Контейнер слайдера */}
              <motion.div 
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mistGray/5 via-white to-roseBeige/10 dark:from-muted/10 dark:via-card dark:to-muted/5 shadow-2xl border border-mistGray/20 dark:border-border/50"
                style={{ touchAction: 'pan-x' }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                whileHover={{ boxShadow: '0 20px 40px rgba(174, 182, 175, 0.15)' }}
              >
                <div className="relative aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9]">
                  {/* Градиент overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent z-10 pointer-events-none" />
                  
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
                        duration: swipeOffset !== 0 ? 0 : 0.5,
                        ease: swipeOffset !== 0 ? 'linear' : [0.22, 1, 0.36, 1]
                      }}
                      className="absolute inset-0 cursor-pointer group/image"
                      onClick={() => setIsFullscreen(true)}
                    >
                      <Image
                        src={galleryImages[currentIndex].src}
                        alt={galleryImages[currentIndex].alt}
                        fill
                        className="object-contain transition-transform duration-700 group-hover/image:scale-[1.02]"
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
                  <motion.button
                    type="button"
                    onClick={() => setIsFullscreen(true)}
                    aria-label="Открыть в полноэкранном режиме"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 md:w-12 md:h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center group shadow-lg z-20"
                  >
                    <Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
                  </motion.button>

                  {/* Стрелки для мобильных */}
                  <div className="md:hidden absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        goToPrevious()
                      }}
                      aria-label="Предыдущий слайд"
                      whileTap={{ scale: 0.9 }}
                      className="pointer-events-auto w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center shadow-xl"
                    >
                      <ChevronLeft className="w-7 h-7 text-white" />
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        goToNext()
                      }}
                      aria-label="Следующий слайд"
                      whileTap={{ scale: 0.9 }}
                      className="pointer-events-auto w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 transition-all duration-300 flex items-center justify-center shadow-xl"
                    >
                      <ChevronRight className="w-7 h-7 text-white" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Миниатюры (только для десктопа) */}
              {galleryImages.length > 1 && (
                <div className="hidden md:flex gap-3 mt-8 overflow-x-auto pb-3 scrollbar-hide px-2">
                  {galleryImages.map((img, index) => (
                    <motion.button
                      key={img.id}
                      type="button"
                      onClick={() => goToSlide(index)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md ${
                        currentIndex === index
                          ? 'border-sageTint dark:border-primary shadow-lg scale-105 ring-2 ring-sageTint/20 dark:ring-primary/20'
                          : 'border-transparent hover:border-mistGray/40 dark:hover:border-border/60 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={img.src.includes('blob.vercel-storage.com')}
                      />
                      {currentIndex === index && (
                        <div className="absolute inset-0 bg-gradient-to-t from-sageTint/20 to-transparent dark:from-primary/20" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Точки навигации (bullets) */}
              <ul className="flex justify-center gap-2.5 mt-6 md:mt-8 list-none p-0">
                {galleryImages.map((_, index) => (
                  <li key={index}>
                    <motion.button
                      type="button"
                      onClick={() => goToSlide(index)}
                      aria-label={`Перейти к слайду ${index + 1}`}
                      aria-current={currentIndex === index ? 'true' : undefined}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`rounded-full transition-all duration-300 ${
                        currentIndex === index
                          ? 'bg-sageTint dark:bg-primary w-10 h-2.5 shadow-md'
                          : 'bg-mistGray/40 dark:bg-border/60 hover:bg-mistGray/60 dark:hover:bg-border w-2.5 h-2.5'
                      }`}
                    />
                  </li>
                ))}
              </ul>

              {/* Счетчик слайдов и описание */}
              <motion.div 
                className="text-center mt-6 space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-card/60 backdrop-blur-sm border border-mistGray/20 dark:border-border/50 shadow-sm">
                  <span className="text-sm font-medium text-inkSoft dark:text-foreground font-display">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs text-inkSoft/50 dark:text-muted-foreground">/</span>
                  <span className="text-sm font-medium text-inkSoft/60 dark:text-muted-foreground">
                    {galleryImages.length}
                  </span>
                </div>
                {galleryImages[currentIndex].alt && (
                  <p className="text-sm text-inkSoft/70 dark:text-foreground/70 max-w-2xl mx-auto font-light italic">
                    {galleryImages[currentIndex].alt}
                  </p>
                )}
              </motion.div>
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setIsFullscreen(false)}
            style={{ touchAction: 'pan-x' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Декоративные элементы */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sageTint/20 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-roseBeige/10 rounded-full blur-3xl" />
            </div>

            {/* Кнопка закрытия */}
            <motion.button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Закрыть"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/20 transition-all duration-300 flex items-center justify-center group shadow-xl z-10"
            >
              <X className="w-7 h-7 text-white" />
            </motion.button>

            {/* Стрелки навигации */}
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              aria-label="Предыдущий слайд"
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/20 transition-all duration-300 flex items-center justify-center group shadow-xl z-10"
            >
              <ChevronLeft className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </motion.button>

            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              aria-label="Следующий слайд"
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-white/20 transition-all duration-300 flex items-center justify-center group shadow-xl z-10"
            >
              <ChevronRight className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </motion.button>

            {/* Изображение */}
            <div 
              className="relative w-full h-full max-w-7xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95, x: swipeOffset !== 0 ? swipeOffset : 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    x: swipeOffset * 0.3
                  }}
                  exit={{ opacity: 0, scale: 0.95, x: swipeOffset !== 0 ? -swipeOffset : 0 }}
                  transition={{ 
                    duration: swipeOffset !== 0 ? 0 : 0.4,
                    ease: swipeOffset !== 0 ? 'linear' : [0.22, 1, 0.36, 1]
                  }}
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
            <motion.div 
              className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 text-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/10 shadow-2xl">
                <div className="text-white text-base font-medium font-display mb-1">
                  {currentIndex + 1} / {galleryImages.length}
                </div>
                {galleryImages[currentIndex].alt && (
                  <div className="text-white/90 text-sm font-light italic max-w-md">
                    {galleryImages[currentIndex].alt}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
