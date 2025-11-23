'use client'

import Link from 'next/link'
import type { CatalogProduct } from '@/types/catalog'
import { Card, CardContent } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useCart } from '@/lib/hooks'
import { useFavoritesStore } from '@/store/favorites-store'
import type { Product as FavoritableProduct } from '@/types'
import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react'
import { getOptimizedAsset } from '@/lib/optimized-assets'
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer'
import { useClientLocale } from '@/hooks/useClientLocale'
import { formatPriceWithLocale, getColorDisplayName } from '@/lib/utils'
import { triggerHapticFeedback } from '@/lib/haptics'
import ProductCardSwatches from './product-card-swatches'
import ProductCardNotification from './product-card-notification'
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
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore()
  const [favorite, setFavorite] = useState(false)
  const [showCartNotification, setShowCartNotification] = useState(false)
  const [showFavoriteNotification, setShowFavoriteNotification] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(product.colors?.[0] ?? null)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [hasSwiped, setHasSwiped] = useState(false)
  const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const favoriteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const isCoarsePointer = useIsCoarsePointer()
  const [isHydrated, setIsHydrated] = useState(false)
  const pointerMode = isHydrated ? isCoarsePointer : false

  const triggerMobileHaptics = useCallback(() => {
    if (!pointerMode) return
    triggerHapticFeedback('success')
  }, [pointerMode])

  // Compact mode styles
  const isCompact = density === 'compact'
  const cardRadius = isCompact ? 'rounded-sm' : 'rounded-sm'
  const imageRatio = isCompact ? 'aspect-[4/5] sm:aspect-square' : 'aspect-[4/5]'
  // Уменьшено масштабирование для более тонкого эффекта
  const imageScale = pointerMode ? '' : 'group-hover:scale-[1.01]'
  const bodyPadding = isCompact ? 'p-3 sm:p-3.5 space-y-1.5' : 'p-4 sm:p-5 space-y-3'
  const titleClass = isCompact ? 'text-xs sm:text-sm' : 'text-base sm:text-lg'
  const descClass = isCompact ? 'text-[9px] sm:text-[10px] line-clamp-1' : 'text-[10px] sm:text-xs line-clamp-2'
  const priceClass = isCompact ? 'text-xs sm:text-sm font-bold' : 'text-base sm:text-lg font-bold'
  const colorsGap = isCompact ? 'space-x-1 sm:space-x-1.5' : 'space-x-1.5 sm:space-x-2'
  const swatchSize = isCompact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-5 h-5 sm:w-6 sm:h-6'
  const badgeTR = isCompact ? 'top-2 right-2' : 'top-4 right-4'
  const badgeTL = isCompact ? 'top-2 left-2' : 'top-4 left-4'
  const overlayPad = isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-4 py-2 text-sm'
  const priceSectionPadding = isCompact ? 'pt-1 sm:pt-1.5' : 'pt-2 sm:pt-2.5'
  const swatchSectionPadding = isCompact ? 'pt-2 sm:pt-2.5' : 'pt-3 sm:pt-4'
  const numericId = useMemo(() => Number(product.id), [product.id])

  // Sync with store on client side
  useEffect(() => {
    setFavorite(isFavorite(numericId))
  }, [numericId, isFavorite])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (cartTimeoutRef.current) {
        clearTimeout(cartTimeoutRef.current)
      }
      if (favoriteTimeoutRef.current) {
        clearTimeout(favoriteTimeoutRef.current)
      }
    }
  }, [])

  // Get image for selected color
  const getImageForColor = (color: ProductColor | null) => {
    let path = product.thumbnail || '/placeholder/about_main_placeholder.webp'

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
      images.push({ path: '/placeholder/about_main_placeholder.webp', color: null })
    }
    
    return images
  }, [product.thumbnail, product.colors, product.colorImages])

  // Get current image from gallery
  const currentImage = useMemo(() => {
    const imageData = allImages[currentImageIndex] || allImages[0]
    return getOptimizedAsset(imageData.path)
  }, [allImages, currentImageIndex])

  // Sync currentImageIndex with selectedColor when color changes
  useEffect(() => {
    if (selectedColor && allImages.length > 0) {
      const index = allImages.findIndex(img => 
        img.color && (
          (img.color.id === selectedColor.id) || 
          (img.color.name === selectedColor.name)
        )
      )
      if (index !== -1) {
        setCurrentImageIndex(index)
      }
    }
  }, [selectedColor, allImages])

  // Handle swipe gestures
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    if (!pointerMode) return
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pointerMode) return
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!pointerMode || touchStartX === null || touchEndX === null) {
      setTouchStartX(null)
      setTouchEndX(null)
      return
    }
    
    const distance = touchStartX - touchEndX
    
    if (Math.abs(distance) > minSwipeDistance) {
      setHasSwiped(true)
      if (distance > 0) {
        // Swipe left - next image
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
        triggerMobileHaptics()
      } else {
        // Swipe right - previous image
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
        triggerMobileHaptics()
      }
      // Reset swipe flag after a short delay
      setTimeout(() => setHasSwiped(false), 300)
    } else {
      setHasSwiped(false)
    }
    
    setTouchStartX(null)
    setTouchEndX(null)
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasSwiped) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleColorSelect = (color: ProductColor, index: number) => {
    setSelectedColorIndex(index)
    setSelectedColor(color)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!selectedColor || !product.colors?.length) return
    
    // Find variant for selected color
    const variant = product.colors.find(color => color.id === selectedColor.id)
    if (!variant) return
    
    // Create a mock variant object for the cart
    const mockVariant = {
      id: variant.id,
      product: {
        name: product.name,
        slug: product.slug,
      },
      color: variant,
      price: (product.price ?? 0).toString(),
      stock_qty: 10, // Default stock
      image: getImageForColor(selectedColor).src,
      description: '',
      category: product.category?.name || ''
    }
    
    addToCart(mockVariant, 1)
    setShowCartNotification(true)
    triggerMobileHaptics() // Вибрация при добавлении в корзину
    
    // Clear existing timeout
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current)
    }
    
    // Set new timeout
    cartTimeoutRef.current = setTimeout(() => setShowCartNotification(false), 2000)
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
      image: product.thumbnail ?? '/placeholder/about_main_placeholder.webp',
      colors: (product.colors ?? []).map(c => c.name),
    }

    if (isFavorite(numericId)) {
      removeFromFavorites(numericId)
      setFavorite(false)
    } else {
      addToFavorites(favProduct)
      setFavorite(true)
      setShowFavoriteNotification(true)
      triggerMobileHaptics() // Вибрация при добавлении в избранное
      if (favoriteTimeoutRef.current) {
        clearTimeout(favoriteTimeoutRef.current)
      }
      favoriteTimeoutRef.current = setTimeout(() => setShowFavoriteNotification(false), 2000)
    }
  }

  // Use current image from gallery on mobile, selected color image on desktop
  const asset = pointerMode && allImages.length > 1 ? currentImage : getImageForColor(selectedColor)
  const placeholderType = asset.placeholder ? 'blur' : 'empty'

  const wrapperClass = `group relative ${className || ''}`

  const cardContent = (
    <>
      <ProductCardNotification
        message={locale === 'ru' ? 'Добавлено в корзину!' : 'Added to cart!'}
        visible={showCartNotification}
        className="top-4 left-4"
      />
      <ProductCardNotification
        message={locale === 'ru' ? 'Добавлено в избранное!' : 'Added to favorites!'}
        visible={showFavoriteNotification}
        className="top-4 left-4 translate-y-12"
      />

      <Card className={`overflow-hidden border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm hover:shadow-fintage-md hover:border-fintage-graphite/30 dark:hover:border-fintage-graphite/40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-fintage-offwhite dark:bg-fintage-charcoal ${cardRadius}`}>
        <CardContent className="p-0">
          {/* Image - крупное фото fashion-стиль */}
          <div 
            ref={imageContainerRef}
            className={`relative overflow-hidden rounded-t-sm ${imageRatio} ${pointerMode && allImages.length > 1 ? 'touch-none' : ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Link 
              href={`/product/${product.slug}`} 
              className="absolute inset-0 z-10" 
              aria-label={`посмотреть детали ${product.name}`}
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
                className={`object-cover transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${imageScale} group-hover:brightness-[0.98]`}
                priority={false}
              />
            </Link>
            
            {/* Винтажный overlay - тонкий fade при hover (Nike style) */}
            <div className="absolute inset-0 bg-gradient-to-t from-fintage-graphite/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hidden sm:block group-hover:opacity-100" aria-hidden="true" />
            
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
                    aria-label={locale === 'ru' ? `Изображение ${index + 1} из ${allImages.length}` : `Image ${index + 1} of ${allImages.length}`}
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

            {/* Винтажный hover overlay - тонкий эффект (Nike style) */}
            {!pointerMode && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center bg-fintage-graphite/5 dark:bg-fintage-graphite/10 z-0 border border-fintage-graphite/10 dark:border-fintage-graphite/20 pointer-events-none">
              </div>
            )}
          </div>

          {/* Content */}
          <div className={bodyPadding}>
            <Link href={`/product/${product.slug}`} aria-label={`просмотреть ${product.name}`}>
              <div className="space-y-1.5">
                <h3 className={`font-display-vintage font-black transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] leading-[0.95] text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-fintage-charcoal/90 dark:group-hover:text-fintage-offwhite/90 ${titleClass} uppercase tracking-tighter`}>
                  {product.name}
                </h3>
                <p className={`leading-relaxed font-mono tracking-[0.15em] text-fintage-graphite dark:text-fintage-graphite/60 ${descClass} uppercase`}>
                  {product.category.name}
                </p>
              </div>
            </Link>
            
            <div className={`flex items-center justify-between ${priceSectionPadding}`}>
              <div className="flex items-center space-x-2">
                <span className={`text-fintage-charcoal dark:text-fintage-offwhite font-bold ${priceClass} tracking-tight`}>
                  {typeof product.price === 'number'
                    ? formatPriceWithLocale(product.price, locale)
                    : (locale === 'ru' ? 'цена по запросу' : 'Price on request')
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
              <ProductCardCartButton
                onClick={handleAddToCart}
                ariaLabel={locale === 'ru' ? 'в корзину' : 'add to cart'}
                isCompact={isCompact}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )

  // Fintage hover эффект - micro-zoom 1.01 с улучшенной плавностью
  const interactiveWrapperClass = pointerMode
    ? wrapperClass
    : `${wrapperClass} hover-scale-fintage`

  return <div className={interactiveWrapperClass}>{cardContent}</div>
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

