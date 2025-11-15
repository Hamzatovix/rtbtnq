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
  const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const favoriteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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
  const cardRadius = isCompact ? 'rounded-lg' : 'rounded-2xl'
  const imageRatio = isCompact ? 'aspect-[4/5] sm:aspect-square' : 'aspect-[4/5]'
  // Уменьшено масштабирование для более тонкого эффекта
  const imageScale = pointerMode ? '' : 'group-hover:scale-[1.01]'
  const bodyPadding = isCompact ? 'p-3 sm:p-3.5 space-y-1.5' : 'p-4 sm:p-5 space-y-3'
  const titleClass = isCompact ? 'text-sm' : 'text-base sm:text-lg'
  const descClass = isCompact ? 'text-xs line-clamp-1' : 'text-xs sm:text-sm line-clamp-2'
  const priceClass = isCompact ? 'text-sm font-light' : 'text-base sm:text-lg font-light'
  const colorsGap = isCompact ? 'space-x-1' : 'space-x-1 sm:space-x-2'
  const swatchSize = isCompact ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-5 h-5 sm:w-6 sm:h-6'
  const badgeTR = isCompact ? 'top-2.5 right-2.5' : 'top-6 right-6'
  const badgeTL = isCompact ? 'top-2.5 left-2.5' : 'top-6 left-6'
  const overlayPad = isCompact ? 'px-2.5 py-1 text-[11px]' : 'px-4 py-2 text-sm'
  const priceSectionPadding = isCompact ? 'pt-1 sm:pt-1.5' : 'pt-2 sm:pt-2.5'
  const swatchSectionPadding = isCompact ? 'pt-2.5 sm:pt-3' : 'pt-4 sm:pt-5'
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

  const asset = getImageForColor(selectedColor)
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

      <Card className={`overflow-hidden border border-mistGray/20 dark:border-border shadow-misty/50 dark:shadow-misty hover:shadow-misty dark:hover:shadow-misty transition-breathing backdrop-misty dark:backdrop-misty ${cardRadius}`}>
        <CardContent className="p-0">
          {/* Image */}
          <div className={`relative overflow-hidden rounded-t-[inherit] ${imageRatio}`}>
            <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={`посмотреть детали ${product.name}`}>
              <OptimizedImage
                key={`${product.id}-${selectedColor?.id || selectedColor?.name || 'default'}`}
                src={asset.src}
                fallbackSrc={asset.fallback}
                placeholder={placeholderType}
                blurDataURL={asset.placeholder}
                alt={selectedColor ? `${product.name} · ${locale === 'ru' ? 'оттенок ' + getColorDisplayName(selectedColor.name, 'ru') : 'shade ' + selectedColor.name}` : product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className={`object-cover transition-transform duration-250 ease-brand ${imageScale}`}
                priority={false}
              />
            </Link>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-sageTint/10 dark:from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-250 hidden sm:block group-hover:opacity-100" aria-hidden="true" />
            
            {/* Action buttons */}
            <ProductCardQuickActions
              favorite={favorite}
              onToggleFavorite={handleToggleFavorite}
              positionClass={badgeTR}
            />

            {/* View details overlay */}
            {!pointerMode && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center bg-sageTint/20 dark:bg-primary/20">
              </div>
            )}
          </div>

          {/* Content */}
          <div className={bodyPadding}>
            <Link href={`/product/${product.slug}`} aria-label={`просмотреть ${product.name}`}>
              <div className="space-y-1.5">
                <h3 className={`text-graceful font-light transition-colors duration-250 leading-tight text-inkSoft dark:text-foreground ${titleClass}`}>
                  {product.name}
                </h3>
                <p className={`leading-relaxed font-light tracking-wide text-whisper dark:text-muted-foreground ${descClass}`}>
                  {product.category.name}
                </p>
              </div>
            </Link>
            
            <div className={`flex items-center justify-between ${priceSectionPadding}`}>
              <div className="flex items-center space-x-2">
                <span className={`text-inkSoft/80 dark:text-foreground ${priceClass}`}>
                  {typeof product.price === 'number'
                    ? formatPriceWithLocale(product.price, locale)
                    : (locale === 'ru' ? 'цена по запросу' : 'Price on request')
                  }
                </span>
              </div>
            </div>

            <div className={`${swatchSectionPadding} grid grid-cols-[1fr_auto] items-center gap-3`}>
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
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )

  // Унифицированы easing (ease-brand) и duration (200ms для hover)
  const interactiveWrapperClass = pointerMode
    ? wrapperClass
    : `${wrapperClass} transition-transform duration-200 ease-brand hover:-translate-y-1`

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

