'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { triggerHapticFeedback } from '@/lib/haptics'
import { createPortal } from 'react-dom'

interface ProductImageLightboxProps {
  isOpen: boolean
  onClose: () => void
  images: Array<{ url: string; position?: number }>
  currentIndex: number
  onIndexChange: (index: number) => void
  productName: string
}

export function ProductImageLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  productName,
}: ProductImageLightboxProps) {
  const [mounted, setMounted] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  useLockBodyScroll(isOpen)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Обработка клавиатуры: ESC для закрытия, стрелки для навигации
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault()
        onIndexChange(currentIndex - 1)
        triggerHapticFeedback('light')
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        e.preventDefault()
        onIndexChange(currentIndex + 1)
        triggerHapticFeedback('light')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, images.length, onIndexChange, onClose])

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX || images.length <= 1) {
      setTouchStartX(null)
      setTouchEndX(null)
      return
    }
    
    const distance = touchStartX - touchEndX
    const minSwipeDistance = 50

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0 && currentIndex < images.length - 1) {
        // Swipe left - next
        onIndexChange(currentIndex + 1)
        triggerHapticFeedback('light')
      } else if (distance < 0 && currentIndex > 0) {
        // Swipe right - previous
        onIndexChange(currentIndex - 1)
        triggerHapticFeedback('light')
      }
    }
    setTouchStartX(null)
    setTouchEndX(null)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
      triggerHapticFeedback('light')
    }
  }

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1)
      triggerHapticFeedback('light')
    }
  }

  // Получаем текущее изображение
  const getCurrentImageUrl = () => {
    if (images.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ProductImageLightbox] Нет изображений')
      }
      return '/placeholder/about_main_placeholder.svg'
    }
    
    const imageData = images[currentIndex] || images[0]
    if (!imageData) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ProductImageLightbox] Нет данных изображения:', { currentIndex, images })
      }
      return '/placeholder/about_main_placeholder.svg'
    }
    
    // Поддерживаем разные форматы данных
    const imageUrl = imageData.url || (typeof imageData === 'string' ? imageData : null)
    if (!imageUrl) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ProductImageLightbox] Нет URL в данных изображения:', imageData)
      }
      return '/placeholder/about_main_placeholder.svg'
    }
    
    // Формируем правильный путь
    let finalUrl = imageUrl
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
      finalUrl = `/${imageUrl}`
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ProductImageLightbox] URL изображения:', { 
        original: imageUrl, 
        final: finalUrl, 
        currentIndex, 
        imagesLength: images.length 
      })
    }
    
    return finalUrl
  }

  const currentImage = getCurrentImageUrl()

  // Проверяем, что изображения есть и они валидны
  if (!mounted) return null
  
  // Если нет изображений, не показываем lightbox
  if (images.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ProductImageLightbox] Нет изображений для отображения')
    }
    return null
  }
  
  // Проверяем, что текущее изображение не placeholder (если есть валидные изображения)
  if (currentImage.includes('placeholder')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ProductImageLightbox] Текущее изображение - placeholder:', {
        currentImage,
        images,
        currentIndex,
        imageData: images[currentIndex],
      })
    }
    // Не показываем lightbox если только placeholder
    return null
  }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/95 dark:bg-black/98 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Кнопка закрытия */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-4 right-4 text-white hover:text-accent transition-fintage font-mono text-xs uppercase tracking-[0.2em] border border-white/20 hover:border-white/40 px-3 py-2 rounded-sm bg-black/40 hover:bg-black/60 backdrop-blur-sm z-10"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label="Закрыть"
          >
            ЗАКРЫТЬ
          </motion.button>

          {/* Навигационные стрелки - только если больше 1 изображения */}
          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-sm border border-white/20 hover:border-white/40 text-white transition-fintage z-10 hidden sm:flex"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft className="h-6 w-6" />
                </motion.button>
              )}
              {currentIndex < images.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-sm border border-white/20 hover:border-white/40 text-white transition-fintage z-10 hidden sm:flex"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  aria-label="Следующее изображение"
                >
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              )}
            </>
          )}

          {/* Изображение */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={currentImage}
              alt={productName}
              className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (process.env.NODE_ENV === 'development') {
                  console.error('[ProductImageLightbox] Ошибка загрузки изображения:', {
                    src: currentImage,
                    currentIndex,
                    imagesLength: images.length,
                    images: images,
                    imageData: images[currentIndex],
                  })
                }
                // Показываем placeholder только если это не placeholder уже
                if (!currentImage.includes('placeholder')) {
                  target.src = '/placeholder/about_main_placeholder.svg'
                }
              }}
              onLoad={() => {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ProductImageLightbox] Изображение загружено успешно:', currentImage)
                }
              }}
            />
          </div>

          {/* Индикатор изображения */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-sm border border-white/20">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    onIndexChange(idx)
                    triggerHapticFeedback('light')
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? 'w-2.5 h-2.5 bg-white'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Изображение ${idx + 1} из ${images.length}`}
                />
              ))}
            </div>
          )}

          {/* Счетчик изображений */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-sm border border-white/20 text-white text-xs font-mono uppercase tracking-[0.15em]">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return mounted ? createPortal(content, document.body) : null
}

