'use client'

import Link from 'next/link'
import type { CatalogProduct } from '@/types/catalog'
import { Card, CardContent } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useCart } from '@/lib/hooks'
import { useFavoritesStore } from '@/store/favorites-store'
import type { Product as FavoritableProduct } from '@/types'
import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { getOptimizedAsset } from '@/lib/optimized-assets'
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer'
import { useClientLocale } from '@/hooks/useClientLocale'
import { useTranslations } from '@/hooks/useTranslations'
import { formatPriceWithLocale, getColorDisplayName } from '@/lib/utils'
import { triggerHapticFeedback } from '@/lib/haptics'
import ProductCardSwatches from './product-card-swatches'
import ProductCardQuickActions from './product-card-quick-actions'
import ProductCardCartButton from './product-card-cart-button'

interface ProductCardProps {
  product: CatalogProduct
  density?: 'regular' | 'compact'
  className?: string
}

type ProductColor = NonNullable<CatalogProduct['colors']>[number]

function ProductCardComponent({ product, density = 'compact', className }: ProductCardProps) {
  const locale = useClientLocale()
  const t = useTranslations()
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore()
  const [favorite, setFavorite] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(product.colors?.[0] ?? null)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [hasSwiped, setHasSwiped] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const isCoarsePointer = useIsCoarsePointer()
  const [isHydrated, setIsHydrated] = useState(false)
  // pointerMode активируется только после гидратации и на устройствах с touch-вводом
  const pointerMode = isHydrated ? isCoarsePointer : false
  
  // Для мобильных устройств: убеждаемся, что свайпы работают даже если isHydrated еще false
  // Используем проверку на наличие touch-событий
  const isMobileDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0))

  const triggerMobileHaptics = useCallback(() => {
    if (!pointerMode && !isMobileDevice) return
    triggerHapticFeedback('success')
  }, [pointerMode, isMobileDevice])

  // Compact mode styles
  const isCompact = density === 'compact'
  const cardRadius = isCompact ? 'rounded-sm' : 'rounded-sm'
  // Соотношение сторон 3:4 соответствует размерам 3024x4032
  const imageRatio = isCompact ? 'aspect-[3/4] sm:aspect-[3/4]' : 'aspect-[3/4]'
  // Simplified: no image scale on hover for calmer, editorial feel
  const imageScale = ''
  const bodyPadding = isCompact ? 'p-3 sm:p-3.5 space-y-1.5' : 'p-4 sm:p-5 space-y-3'
  const titleClass = isCompact ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
  const descClass = isCompact ? 'text-[9px] sm:text-[10px] line-clamp-1' : 'text-[10px] sm:text-xs line-clamp-2'
  const priceClass = isCompact ? 'text-[15px] md:text-[16px] font-medium' : 'text-[15px] md:text-[16px] font-medium'
  const colorsGap = isCompact ? 'space-x-1 sm:space-x-1.5' : 'space-x-1.5 sm:space-x-2'
  const swatchSize = isCompact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-5 h-5 sm:w-6 sm:h-6'
  const badgeTR = isCompact ? 'top-2 right-2' : 'top-4 right-4'
  const priceSectionPadding = isCompact ? 'pt-1 sm:pt-1.5' : 'pt-2 sm:pt-2.5'
  const swatchSectionPadding = isCompact ? 'pt-2 sm:pt-2.5' : 'pt-3 sm:pt-4'
  const numericId = useMemo(() => Number(product.id), [product.id])

  // Sync with store on client side
  useEffect(() => {
    setFavorite(isFavorite(numericId))
  }, [numericId, isFavorite])


  // Get image for selected color
  const getImageForColor = (color: ProductColor | null) => {
    let path = product.thumbnail || '/placeholder/about_main_placeholder.svg'

    if (color && product.colorImages) {
      if (color.id && product.colorImages[color.id]) {
        path = product.colorImages[color.id]
      } else if (color.name && product.colorImages[color.name]) {
        path = product.colorImages[color.name]
      }
    }

    return getOptimizedAsset(path)
  }

  // Create array of all available images for swipe gallery
  const allImages = useMemo(() => {
    const images: Array<{ path: string; color: ProductColor | null }> = []
    
    // Add main thumbnail first
    if (product.thumbnail) {
      images.push({ path: product.thumbnail, color: null })
    }
    
    // Add color-specific images
    if (product.colors && product.colorImages) {
      product.colors.forEach((color) => {
        let path: string | undefined
        if (color.id && product.colorImages![color.id]) {
          path = product.colorImages![color.id]
        } else if (color.name && product.colorImages![color.name]) {
          path = product.colorImages![color.name]
        }
        
        // Only add if it's different from thumbnail
        if (path && path !== product.thumbnail) {
          images.push({ path, color })
        }
      })
    }
    
    // If no images, add placeholder
    if (images.length === 0) {
      images.push({ path: '/placeholder/about_main_placeholder.svg', color: null })
    }
    
    return images
  }, [product.thumbnail, product.colors, product.colorImages])

  // Get current image from gallery
  const currentImage = useMemo(() => {
    const imageData = allImages[currentImageIndex] || allImages[0]
    return getOptimizedAsset(imageData.path)
  }, [allImages, currentImageIndex])

  // Strategy B: Keep color swatch and image gallery in sync bidirectionally
  // When user selects a color, show images for that color
  // When user swipes/clicks to an image, update selected color to match that image's color
  
  // Sync currentImageIndex with selectedColor when color changes (color -> image)
  // When user selects a color, find and show the first image for that color
  // Используем ref для отслеживания, был ли это программный свайп (чтобы избежать конфликтов)
  const isSwipeUpdateRef = useRef(false)
  
  useEffect(() => {
    if (selectedColor && allImages.length > 0) {
      // Если это обновление из-за свайпа, пропускаем синхронизацию
      // (цвет уже обновлен из-за смены изображения)
      if (isSwipeUpdateRef.current) {
        isSwipeUpdateRef.current = false
        return
      }
      
      // Проверяем, соответствует ли текущее изображение выбранному цвету
      const currentImage = allImages[currentImageIndex]
      const currentImageMatchesColor = currentImage?.color && (
        (currentImage.color.id === selectedColor.id) ||
        (currentImage.color.name === selectedColor.name)
      )
      
      // Если текущее изображение уже соответствует цвету, не меняем индекс
      if (currentImageMatchesColor) {
        return
      }
      
      // Находим первое изображение для выбранного цвета
      const index = allImages.findIndex(img => 
        img.color && (
          (img.color.id === selectedColor.id) || 
          (img.color.name === selectedColor.name)
        )
      )
      if (index !== -1) {
        setCurrentImageIndex(index)
      }
      // Note: if no image found for selected color (index === -1), keep current image
      // This handles edge cases where a color might not have a specific image
    }
  }, [selectedColor, allImages, currentImageIndex])

  // Sync selectedColor with currentImageIndex when image changes (image -> color)
  // This ensures swatch stays in sync when user swipes or clicks image indicators
  useEffect(() => {
    if (allImages.length > 0 && currentImageIndex >= 0 && currentImageIndex < allImages.length) {
      const currentImage = allImages[currentImageIndex]
      
      // If current image belongs to a specific color, update selectedColor to match
      if (currentImage.color && product.colors) {
        const matchingColorIndex = product.colors.findIndex(c => 
          (c.id && currentImage.color!.id && c.id === currentImage.color!.id) ||
          (c.name && currentImage.color!.name && c.name === currentImage.color!.name)
        )
        
        if (matchingColorIndex !== -1) {
          const matchingColor = product.colors[matchingColorIndex]
          
          // Используем функциональное обновление для получения актуального значения selectedColor
          setSelectedColor((prevSelectedColor) => {
            // Only update if it's different from current selection to avoid loops
            // Colors are considered the same if both ID and name match (or if one matches when the other is missing)
            const isSameColor = prevSelectedColor && (
              (matchingColor.id && prevSelectedColor.id && matchingColor.id === prevSelectedColor.id) ||
              (matchingColor.name && prevSelectedColor.name && matchingColor.name === prevSelectedColor.name)
            )
            
            if (!isSameColor) {
              // Помечаем, что это обновление из-за свайпа/смены изображения
              isSwipeUpdateRef.current = true
              return matchingColor
            }
            return prevSelectedColor
          })
          
          // Обновляем selectedColorIndex отдельно после обновления selectedColor
          // Используем функциональное обновление для получения актуального значения
          setSelectedColorIndex((prevIndex) => {
            // Проверяем, нужно ли обновлять индекс
            const currentColor = product.colors[prevIndex]
            const needsUpdate = !currentColor || (
              (matchingColor.id && currentColor.id && matchingColor.id !== currentColor.id) ||
              (matchingColor.name && currentColor.name && matchingColor.name !== currentColor.name)
            )
            
            return needsUpdate ? matchingColorIndex : prevIndex
          })
        }
      }
      // If image has no color (thumbnail), keep current selectedColor unchanged
    }
  }, [currentImageIndex, allImages, product.colors]) // Note: intentionally not including selectedColor to avoid loops

  // Handle swipe gestures
  const minSwipeDistance = 40 // Уменьшено для лучшей чувствительности на мобильных

  const onTouchStart = (e: React.TouchEvent) => {
    // Разрешаем обработку touch-событий на мобильных устройствах
    // даже если pointerMode еще не активирован (до гидратации)
    if (!pointerMode && !isMobileDevice) return
    
    // Полностью сбрасываем состояние предыдущего свайпа перед началом нового
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
    setIsHorizontalSwipe(false)
    // Не сбрасываем hasSwiped здесь, так как он сбрасывается через setTimeout в onTouchEnd
  }

  const onTouchMove = (e: React.TouchEvent) => {
    // Разрешаем обработку touch-событий на мобильных устройствах
    if ((!pointerMode && !isMobileDevice) || touchStartX === null || touchStartY === null) return
    
    const currentX = e.targetTouches[0].clientX
    const currentY = e.targetTouches[0].clientY
    const deltaX = currentX - touchStartX // Сохраняем знак для определения направления
    const deltaY = currentY - touchStartY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    
    // Определяем направление свайпа: горизонтальный или вертикальный
    // Для iOS используем более строгие условия для точного определения направления
    // Порог увеличен до 30px для лучшей чувствительности на iPhone
    if (absDeltaX > absDeltaY && absDeltaX > 30 && absDeltaX > absDeltaY * 2) {
      // Горизонтальный свайп - блокируем скролл страницы только после уверенного определения
      if (!isHorizontalSwipe) {
        setIsHorizontalSwipe(true)
      }
      // Блокируем скролл только для горизонтального свайпа
      e.preventDefault()
      e.stopPropagation()
      // Сохраняем текущую позицию X для вычисления расстояния в onTouchEnd
      // Обновляем touchEndX для обоих направлений (влево и вправо)
      setTouchEndX(currentX)
    } else if (absDeltaY > absDeltaX && absDeltaY > 30) {
      // Вертикальный свайп - разрешаем скролл страницы
      // Не вызываем preventDefault, чтобы страница могла скроллиться
      // НЕ сбрасываем touchStartX/touchStartY здесь, чтобы не нарушить последующие свайпы
      // Вместо этого просто сбрасываем флаг горизонтального свайпа
      setIsHorizontalSwipe(false)
      // Также сбрасываем touchEndX, чтобы не использовать старое значение
      setTouchEndX(null)
    } else {
      // Промежуточное состояние - продолжаем отслеживать позицию для горизонтального свайпа
      // Это важно для быстрых свайпов, когда направление еще не определено
      // Обновляем touchEndX для обоих направлений (влево и вправо)
      if (absDeltaX > 10) {
        setTouchEndX(currentX)
        // Если горизонтальное движение достаточно большое, но еще не достигло порога,
        // все равно помечаем как потенциальный горизонтальный свайп
        if (absDeltaX > 20 && absDeltaX > absDeltaY) {
          setIsHorizontalSwipe(true)
        }
      }
    }
  }

  const onTouchEnd = (e?: React.TouchEvent) => {
    // Сохраняем значения перед сбросом состояния
    const savedTouchStartX = touchStartX
    const savedTouchStartY = touchStartY
    const savedTouchEndX = touchEndX
    const savedIsHorizontalSwipe = isHorizontalSwipe
    
    // Сбрасываем состояние касания сразу, чтобы не блокировать последующие свайпы
    // Это критически важно для работы последовательных свайпов
    setTouchStartX(null)
    setTouchStartY(null)
    setTouchEndX(null)
    setIsHorizontalSwipe(false)
    
    // Разрешаем обработку touch-событий на мобильных устройствах
    // Используем сохраненные значения, так как состояние уже сброшено
    if ((!pointerMode && !isMobileDevice) || savedTouchStartX === null) {
      setHasSwiped(false)
      return
    }
    
    // Получаем финальную позицию X из события или из сохраненного touchEndX
    // Важно: используем changedTouches для получения финальной позиции
    const finalX = e?.changedTouches?.[0]?.clientX ?? savedTouchEndX ?? savedTouchStartX
    
    // Вычисляем расстояние и направление
    const distance = savedTouchStartX - finalX
    const absDistance = Math.abs(distance)
    const absDeltaY = savedTouchStartY !== null && e?.changedTouches?.[0]?.clientY !== undefined
      ? Math.abs(e.changedTouches[0].clientY - savedTouchStartY)
      : 0
    
    // Проверяем, является ли это горизонтальным свайпом
    const isHorizontal = savedIsHorizontalSwipe || (absDistance > minSwipeDistance && (absDeltaY === 0 || absDistance > absDeltaY * 1.5))
    
    if (isHorizontal && absDistance > minSwipeDistance) {
      // Проверяем, что есть изображения для свайпа
      if (allImages.length === 0) {
        setHasSwiped(false)
        return
      }
      
      setHasSwiped(true)
      
      // Обновляем индекс изображения - useEffect на строке 183 автоматически обновит цвет
      // и установит isSwipeUpdateRef.current = true для предотвращения обратной синхронизации
      if (distance > 0) {
        // Swipe left (touchStartX > finalX) - палец двинулся влево - следующее изображение
        setCurrentImageIndex((prev) => {
          const nextIndex = (prev + 1) % allImages.length
          return nextIndex
        })
        triggerMobileHaptics()
      } else if (distance < 0) {
        // Swipe right (touchStartX < finalX) - палец двинулся вправо - предыдущее изображение
        setCurrentImageIndex((prev) => {
          const prevIndex = (prev - 1 + allImages.length) % allImages.length
          return prevIndex
        })
        triggerMobileHaptics()
      }
      
      // Reset swipe flag after a short delay
      // Используем более короткую задержку для быстрой реакции на последующие свайпы
      setTimeout(() => setHasSwiped(false), 200)
    } else {
      setHasSwiped(false)
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasSwiped) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Handle drag end for framer-motion horizontal swipe
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (allImages.length <= 1) return
    
    const threshold = 60
    const { offset, velocity } = info
    
    // Check if drag was significant enough
    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      if (offset.x < -threshold && currentImageIndex < allImages.length - 1) {
        // Swipe left - next image
        setCurrentImageIndex((prev) => prev + 1)
        triggerMobileHaptics()
      } else if (offset.x > threshold && currentImageIndex > 0) {
        // Swipe right - previous image
        setCurrentImageIndex((prev) => prev - 1)
        triggerMobileHaptics()
      }
    }
  }

  const handleColorSelect = (color: ProductColor, index: number) => {
    // При клике на цвет сбрасываем флаг свайпа, чтобы изображение точно обновилось
    isSwipeUpdateRef.current = false
    setSelectedColorIndex(index)
    setSelectedColor(color)
    // Находим первое изображение для выбранного цвета и сразу обновляем индекс
    if (allImages.length > 0) {
      const imageIndex = allImages.findIndex(img => 
        img.color && (
          (img.color.id === color.id) || 
          (img.color.name === color.name)
        )
      )
      if (imageIndex !== -1) {
        setCurrentImageIndex(imageIndex)
      }
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Determine if product has color variants
    const hasColorVariants = product.colors && product.colors.length > 0
    
    // If product has colors, we need a selected color
    // Note: button should be disabled if !selectedColor, so this path assumes selectedColor exists
    if (hasColorVariants) {
      // Find variant for selected color - use selectedColor directly as fallback if not found by id
      const variant = product.colors.find(color => color.id === selectedColor?.id) || selectedColor
      
      // Create a mock variant object for the cart with selected color
      const mockVariant = {
        id: variant?.id || selectedColor?.id || product.id,
        product: {
          name: product.name,
          slug: product.slug,
        },
        color: variant || selectedColor,
        price: (product.price ?? 0).toString(),
        stock_qty: 10, // Default stock
        image: getImageForColor(selectedColor).src,
        description: '',
        category: product.category?.name || ''
      }
      
      addToCart(mockVariant, 1)
    } else {
      // Product has no color variants - create variant directly from product data
      // This path always works as there are no color requirements
      const mockVariant = {
        id: product.id,
        product: {
          name: product.name,
          slug: product.slug,
        },
        color: null,
        price: (product.price ?? 0).toString(),
        stock_qty: 10, // Default stock
        image: product.thumbnail || '/placeholder/about_main_placeholder.svg',
        description: '',
        category: product.category?.name || ''
      }
      
      addToCart(mockVariant, 1)
    }
    
    // Silent add to cart - no toast notification for calmer UX
    triggerMobileHaptics() // Вибрация при добавлении в корзину
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const favProduct: FavoritableProduct = {
      id: numericId,
      title: product.name,
      description: '',
      price: typeof product.price === 'number' ? product.price : Number(product.price ?? 0),
      category: product.category?.name ?? '',
      image: product.thumbnail ?? '/placeholder/about_main_placeholder.svg',
      colors: (product.colors ?? []).map(c => c.name),
    }

    if (isFavorite(numericId)) {
      removeFromFavorites(numericId)
      setFavorite(false)
    } else {
      addToFavorites(favProduct)
      setFavorite(true)
      // Silent favorite toggle - no toast notification for calmer UX
      triggerMobileHaptics() // Вибрация при добавлении в избранное
    }
  }

  // Use current image from gallery on mobile, selected color image on desktop
  const asset = pointerMode && allImages.length > 1 ? currentImage : getImageForColor(selectedColor)
  const placeholderType = asset.placeholder ? 'blur' : 'empty'

  const wrapperClass = `group relative ${className || ''}`

  const cardContent = (
    <>
      <Card className={`overflow-hidden border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm hover:shadow-fintage-md hover:border-fintage-graphite/30 dark:hover:border-fintage-graphite/40 transition-fintage bg-fintage-offwhite dark:bg-fintage-charcoal ${cardRadius}`}>
        <CardContent className="p-0">
          {/* Image - крупное фото fashion-стиль */}
          <motion.div 
            ref={imageContainerRef}
            className={`relative overflow-hidden rounded-t-sm ${imageRatio}`}
            style={{ 
              touchAction: allImages.length > 1 ? 'pan-x pan-y pinch-zoom' : 'pan-y pinch-zoom',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain'
            }}
            drag={allImages.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={(e) => onTouchEnd(e)}
          >
            <Link 
              href={`/product/${product.slug}`} 
              className="absolute inset-0 z-10" 
              aria-label={t('product.card.viewDetails').replace('{name}', product.name)}
              onClick={handleLinkClick}
            >
              <OptimizedImage
                key={`${product.id}-${pointerMode && allImages.length > 1 ? currentImageIndex : (selectedColor?.id || selectedColor?.name || 'default')}`}
                src={asset.src}
                fallbackSrc={asset.fallback}
                placeholder={placeholderType}
                blurDataURL={asset.placeholder}
                alt={pointerMode && allImages.length > 1 && allImages[currentImageIndex]?.color
                  ? `${product.name} · ${locale === 'ru' ? 'оттенок ' + getColorDisplayName(allImages[currentImageIndex].color!.name, 'ru') : 'shade ' + allImages[currentImageIndex].color!.name}`
                  : selectedColor 
                    ? `${product.name} · ${locale === 'ru' ? 'оттенок ' + getColorDisplayName(selectedColor.name, 'ru') : 'shade ' + selectedColor.name}` 
                    : product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className={`object-cover transition-fintage ${imageScale}`}
                priority={false}
              />
            </Link>
            
            {/* Image indicators (dots) for mobile swipe */}
            {pointerMode && allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5" aria-hidden="true">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                      triggerMobileHaptics()
                    }}
                    className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full ${
                      index === currentImageIndex
                        ? 'w-2 h-2 bg-primary dark:bg-primary shadow-sm'
                        : 'w-1.5 h-1.5 bg-white/60 dark:bg-white/40 hover:bg-white/80 dark:hover:bg-white/60'
                    }`}
                    aria-label={t('product.card.imageIndicator').replace('{current}', String(index + 1)).replace('{total}', String(allImages.length))}
                  />
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <ProductCardQuickActions
              favorite={favorite}
              onToggleFavorite={handleToggleFavorite}
              positionClass={badgeTR}
              isCompact={isCompact}
            />
          </motion.div>

          {/* Content */}
          <div className={bodyPadding}>
            <Link href={`/product/${product.slug}`} aria-label={t('product.card.viewProduct').replace('{name}', product.name)}>
              <div className="space-y-1.5">
                <h3 className={`font-display-vintage font-black leading-[0.95] text-fintage-charcoal dark:text-fintage-offwhite ${titleClass} uppercase tracking-tighter`}>
                  {product.name}
                </h3>
                <p className={`leading-relaxed font-mono tracking-[0.15em] text-fintage-graphite dark:text-fintage-graphite/60 ${descClass} uppercase`}>
                  {product.category.name}
                </p>
              </div>
            </Link>
            
            <div className={`flex items-center justify-between ${priceSectionPadding}`}>
              <div className="flex items-center space-x-2">
                <span className={`text-fintage-charcoal dark:text-fintage-offwhite ${priceClass} tracking-normal`}>
                  {typeof product.price === 'number'
                    ? formatPriceWithLocale(product.price, locale)
                    : t('product.priceOnRequest')
                  }
                </span>
              </div>
            </div>

            <div className={`${swatchSectionPadding} grid grid-cols-[1fr_auto] items-center gap-3 border-t border-fintage-graphite/10 dark:border-fintage-graphite/20 ${isCompact ? 'pt-2 sm:pt-2.5' : 'pt-3 sm:pt-4'}`}>
              <ProductCardSwatches
                colors={product.colors}
                locale={locale}
                selectedIndex={selectedColorIndex}
                swatchSizeClass={swatchSize}
                gapClass={colorsGap}
                onSelect={handleColorSelect}
              />
              {/* Add to cart button - subtle, only visible on hover on desktop for calmer editorial feel */}
              {/* On mobile: always visible. On desktop: only on hover */}
              {(() => {
                const hasColorVariants = product.colors && product.colors.length > 0
                const isDisabled = hasColorVariants && !selectedColor
                const helperText = isDisabled 
                  ? t('product.card.chooseColor')
                  : undefined
                
                return (
                  <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity transition-fintage">
                    <ProductCardCartButton
                      onClick={handleAddToCart}
                      ariaLabel={t('product.addToCart')}
                      isCompact={isCompact}
                      disabled={isDisabled}
                      showHelperText={isDisabled}
                      helperText={helperText}
                      locale={locale}
                    />
                  </div>
                )
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )

  // Simplified: single hover effect (shadow + border) for calmer editorial feel
  // Removed card scale animation to avoid competing effects
  return <div className={wrapperClass}>{cardContent}</div>
}

// Мемоизация компонента для предотвращения лишних ре-рендеров
// Компонент перерендерится только если изменились product.id, density или className
const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  // Проверяем, изменились ли важные пропсы
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.slug === nextProps.product.slug &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.thumbnail === nextProps.product.thumbnail &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.density === nextProps.density &&
    prevProps.className === nextProps.className &&
    // Проверяем изменения в массиве colors (по длине и ID первого цвета)
    prevProps.product.colors?.length === nextProps.product.colors?.length &&
    prevProps.product.colors?.[0]?.id === nextProps.product.colors?.[0]?.id
  )
})

export { ProductCard }
export default ProductCard

