'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
} as const

// Галерея изображений
const galleryImages = [
  { src: '/images/about_c1.jpg', alt: 'Процесс создания' },
  { src: '/images/about_c2.jpg', alt: 'Детали' },
  { src: '/images/about_c3.jpg', alt: 'Ручная работа' },
  { src: '/images/about-m.png', alt: 'Мастерская' },
]

export default function BrandPage() {
  const prefersReducedMotion = useReducedMotion()
  const t = useTranslations()
  const locale = useClientLocale()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Состояния для мобильной карусели
  const [mobileCurrentIndex, setMobileCurrentIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const minSwipeDistance = 50

  // Обработчики swipe для мобильных
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
    setSwipeOffset(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return
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
        // Swipe left - next
        setMobileCurrentIndex((prev) => (prev + 1) % galleryImages.length)
      } else {
        // Swipe right - previous
        setMobileCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
      }
    }
    
    setTouchStartX(null)
    setTouchEndX(null)
    setSwipeOffset(0)
  }

  const goToMobileSlide = (index: number) => {
    setMobileCurrentIndex(index)
  }

  const goToMobilePrevious = () => {
    setMobileCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const goToMobileNext = () => {
    setMobileCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  // Обработка клавиатуры для модального окна
  useEffect(() => {
    if (!selectedImage) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null)
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = galleryImages.findIndex(img => img.src === selectedImage)
        const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
        setSelectedImage(galleryImages[prevIndex].src)
      } else if (e.key === 'ArrowRight') {
        const currentIndex = galleryImages.findIndex(img => img.src === selectedImage)
        const nextIndex = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1
        setSelectedImage(galleryImages[nextIndex].src)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, galleryImages])

  return (
    <div className="bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas text-fintage-charcoal dark:text-fintage-offwhite">
      {/* Hero section */}
      <section
        aria-label={t('home.brand.title')}
        className="relative h-[58vh] min-h-[320px] w-full overflow-hidden"
      >
        <Image
          src="/images/about-m.png"
          alt={t('brandPage.heroAlt') || 'atelier'}
          fill
          priority={false}
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />

        {/* универсальный overlay для читаемости */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
        />

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
          className="relative z-10 mx-auto max-w-4xl container px-4 md:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center"
        >
          <h1 className="text-title-1 md:text-[2.5rem] lg:text-[3rem] font-display-vintage font-black text-white leading-[0.95] tracking-tighter uppercase">
            {t('home.brand.title')}
          </h1>
          <p className="mt-3 text-[10px] md:text-xs font-mono text-white/80 uppercase tracking-[0.2em]">
            {t('brandPage.heroSubtitle')}
          </p>
        </motion.div>
      </section>

      {/* Story section */}
      <section className="py-16 md:py-20 lg:py-24 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="container mx-auto px-6 md:px-8 lg:px-12 max-w-4xl"
          role="region"
          aria-labelledby="brand-title"
        >
          {/* Заголовок в стиле технического каталога - Nike/Stone Island */}
          <div className="mb-12 md:mb-16 lg:mb-20">
            <div className="flex items-baseline gap-3 md:gap-4 mb-6">
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
                  id="brand-title"
                  className="text-title-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase"
                >
                  {t('brandPage.storyTitle')}
                </h2>
                {/* Техническая подпись в стиле Stone Island */}
                <p className="mt-1.5 text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
                  {locale === 'ru' ? 'НАША ИСТОРИЯ' : 'OUR STORY'}
                </p>
              </div>
            </div>

            {/* Разделительная линия в стиле технических каталогов */}
            <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30" aria-hidden="true" />
          </div>

          {/* Основной текст */}
          <div className="space-y-6 md:space-y-7 text-base md:text-lg lg:text-xl font-light leading-relaxed md:leading-loose text-fintage-charcoal dark:text-fintage-offwhite">
            <p className="text-fintage-charcoal/90 dark:text-fintage-offwhite/90">
              {t('brandPage.paragraph1')}
            </p>
            <p className="text-fintage-charcoal/90 dark:text-fintage-offwhite/90">
              {t('brandPage.paragraph2')}
            </p>
          </div>

          {/* Теги ценностей - технический стиль */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30">
            <div className="mb-4">
              <span className="text-[9px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/40 uppercase tracking-[0.2em]">
                {locale === 'ru' ? 'ЦЕННОСТИ' : 'VALUES'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {[t('brandPage.tagQuality'), t('brandPage.tagTraditions'), t('brandPage.tagSimplicity')].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-mono text-fintage-charcoal dark:text-fintage-offwhite tracking-[0.2em] uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Подпись - технический стиль */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30">
            <p className="text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase text-fintage-graphite/60 dark:text-fintage-graphite/50">
              made in daymohk
            </p>
          </div>
        </motion.div>
      </section>

      {/* Gallery section */}
      <section className="py-16 md:py-20 lg:py-24 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="container mx-auto px-6 md:px-8 lg:px-12"
        >
          {/* Заголовок в стиле технического каталога */}
          <div className="mb-12 md:mb-16 lg:mb-20 text-center">
            <div className="mb-6">
              <h2 className="text-title-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase">
                {t('brandPage.galleryTitle')}
              </h2>
              {/* Техническая подпись в стиле Stone Island */}
              <p className="mt-1.5 text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
                {locale === 'ru' ? 'ГАЛЕРЕЯ' : 'GALLERY'}
              </p>
            </div>

            {/* Разделительная линия в стиле технических каталогов */}
            <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30" aria-hidden="true" />
          </div>
          
          {/* Мобильная версия - карусель с swipe */}
          <div className="md:hidden">
            <div className="relative">
              {/* Навигационные стрелки для мобильных */}
              <button
                type="button"
                onClick={goToMobilePrevious}
                aria-label="Предыдущее изображение"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-sm bg-fintage-graphite/80 dark:bg-fintage-graphite/70 hover:bg-fintage-graphite dark:hover:bg-fintage-graphite/90 transition-fintage flex items-center justify-center shadow-fintage-md border border-fintage-graphite/30 dark:border-fintage-graphite/40"
              >
                <ChevronLeft className="w-4 h-4 text-fintage-offwhite dark:text-fintage-offwhite" strokeWidth={2.5} />
              </button>
              
              <button
                type="button"
                onClick={goToMobileNext}
                aria-label="Следующее изображение"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-sm bg-fintage-graphite/80 dark:bg-fintage-graphite/70 hover:bg-fintage-graphite dark:hover:bg-fintage-graphite/90 transition-fintage flex items-center justify-center shadow-fintage-md border border-fintage-graphite/30 dark:border-fintage-graphite/40"
              >
                <ChevronRight className="w-4 h-4 text-fintage-offwhite dark:text-fintage-offwhite" strokeWidth={2.5} />
              </button>

              {/* Карусель с swipe */}
              <div
                className="relative aspect-[4/5] rounded-sm overflow-hidden border border-fintage-graphite/20 dark:border-fintage-graphite/30"
                style={{ touchAction: 'pan-x' }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mobileCurrentIndex}
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
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setSelectedImage(galleryImages[mobileCurrentIndex].src)}
                  >
                    <Image
                      src={galleryImages[mobileCurrentIndex].src}
                      alt={galleryImages[mobileCurrentIndex].alt}
                      fill
                      loading={mobileCurrentIndex === 0 ? 'eager' : 'lazy'}
                      sizes="100vw"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder/about_main_placeholder.jpg'
                      }}
                    />
                    {/* Технический номер изображения */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-block px-2 py-1 bg-fintage-graphite/80 dark:bg-fintage-graphite/70 backdrop-blur-sm text-fintage-offwhite dark:text-fintage-offwhite text-[9px] font-mono uppercase tracking-[0.2em] rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/40 shadow-fintage-sm">
                        {String(mobileCurrentIndex + 1).padStart(2, '0')}/{String(galleryImages.length).padStart(2, '0')}
                      </span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Индикаторы для мобильных */}
              <div className="flex justify-center gap-2 mt-4">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToMobileSlide(index)}
                    aria-label={`Перейти к изображению ${index + 1}`}
                    aria-current={mobileCurrentIndex === index ? 'true' : undefined}
                    className={`rounded-full transition-fintage ${
                      mobileCurrentIndex === index
                        ? 'bg-fintage-charcoal dark:bg-fintage-offwhite w-2.5 h-2.5 shadow-fintage-sm'
                        : 'bg-fintage-graphite/40 dark:bg-fintage-graphite/50 w-2 h-2 hover:bg-fintage-graphite/60 dark:hover:bg-fintage-graphite/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Десктопная версия - асимметричная сетка (vintage Nike style) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryImages.map((image, index) => {
              // Асимметричная композиция: разные размеры для разных позиций
              const aspectClasses = 
                index === 0 ? 'aspect-[4/5] lg:aspect-square' : // Первое - вертикальное/квадратное
                index === 1 ? 'aspect-square' : // Второе - квадратное
                index === 2 ? 'aspect-[4/5] lg:aspect-[3/4]' : // Третье - вертикальное
                'aspect-square' // Четвертое - квадратное
              
              const colSpan = index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              
              return (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        duration: 0.5, 
                        delay: index * 0.1,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    },
                  }}
                  className={`relative ${aspectClasses} ${colSpan} rounded-sm overflow-hidden group cursor-pointer border border-fintage-graphite/20 dark:border-fintage-graphite/30`}
                  onClick={() => setSelectedImage(image.src)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    loading={index < 2 ? 'eager' : 'lazy'}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder/about_main_placeholder.jpg'
                    }}
                  />
                  {/* Технический номер изображения */}
                  <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-block px-2 py-1 bg-fintage-graphite/80 dark:bg-fintage-graphite/70 backdrop-blur-sm text-fintage-offwhite dark:text-fintage-offwhite text-[9px] font-mono uppercase tracking-[0.2em] rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/40 shadow-fintage-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Hover overlay - технический стиль */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Тонкая рамка при hover */}
                  <div className="absolute inset-0 border-2 border-fintage-graphite/20 dark:border-fintage-graphite/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Modal для просмотра изображения - технический стиль */}
      {selectedImage && (() => {
        const currentModalIndex = galleryImages.findIndex(img => img.src === selectedImage)
        const goToModalPrevious = () => {
          const prevIndex = currentModalIndex === 0 ? galleryImages.length - 1 : currentModalIndex - 1
          setSelectedImage(galleryImages[prevIndex].src)
        }
        const goToModalNext = () => {
          const nextIndex = currentModalIndex === galleryImages.length - 1 ? 0 : currentModalIndex + 1
          setSelectedImage(galleryImages[nextIndex].src)
        }
        
        return (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-2 md:p-4"
              onClick={() => setSelectedImage(null)}
            >
              {/* Кнопка закрытия - технический стиль */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-2 right-2 md:top-4 md:right-4 text-white hover:text-accent transition-fintage font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] border border-white/20 hover:border-white/40 hover:border-accent px-2.5 md:px-3 py-1.5 md:py-2 rounded-sm bg-black/40 hover:bg-black/60 backdrop-blur-sm z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(null)
                }}
                aria-label={locale === 'ru' ? 'Закрыть' : 'Close'}
              >
                {locale === 'ru' ? 'ЗАКРЫТЬ' : 'CLOSE'}
              </motion.button>
              
              {/* Навигационные стрелки */}
              {galleryImages.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-8 h-10 md:w-10 md:h-12 rounded-sm bg-fintage-graphite/80 dark:bg-fintage-graphite/70 hover:bg-fintage-graphite dark:hover:bg-fintage-graphite/90 transition-fintage flex items-center justify-center shadow-fintage-md border border-fintage-graphite/30 dark:border-fintage-graphite/40"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToModalPrevious()
                    }}
                    aria-label={locale === 'ru' ? 'Предыдущее изображение' : 'Previous image'}
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-fintage-offwhite dark:text-fintage-offwhite" strokeWidth={2.5} />
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-8 h-10 md:w-10 md:h-12 rounded-sm bg-fintage-graphite/80 dark:bg-fintage-graphite/70 hover:bg-fintage-graphite dark:hover:bg-fintage-graphite/90 transition-fintage flex items-center justify-center shadow-fintage-md border border-fintage-graphite/30 dark:border-fintage-graphite/40"
                    onClick={(e) => {
                      e.stopPropagation()
                      goToModalNext()
                    }}
                    aria-label={locale === 'ru' ? 'Следующее изображение' : 'Next image'}
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-fintage-offwhite dark:text-fintage-offwhite" strokeWidth={2.5} />
                  </motion.button>
                </>
              )}
              
              {/* Изображение */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-7xl max-h-[95vh] md:max-h-[90vh] w-full h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={selectedImage}
                    alt={galleryImages[currentModalIndex]?.alt || (locale === 'ru' ? 'Увеличенное изображение' : 'Enlarged image')}
                    fill
                    className="object-contain"
                    priority
                    sizes="100vw"
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Счетчик изображений */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-block px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-mono uppercase tracking-[0.2em] rounded-sm border border-white/20">
                    {String(currentModalIndex + 1).padStart(2, '0')}/{String(galleryImages.length).padStart(2, '0')}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )
      })()}
    </div>
  )
}


