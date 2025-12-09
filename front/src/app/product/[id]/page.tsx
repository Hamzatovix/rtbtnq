'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, ShoppingBag, ArrowLeft, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { formatPriceWithLocale } from '@/lib/utils'
import { useClientLocale } from '@/hooks/useClientLocale'
import { useTranslations } from '@/hooks/useTranslations'
import { triggerHapticFeedback } from '@/lib/haptics'
import Link from 'next/link'
import { ProductStructuredData } from '@/components/seo/ProductStructuredData'
import { ProductImageLightbox } from '@/components/product/ProductImageLightbox'
import { ProductShareButtons } from '@/components/product/product-share-buttons'

type ProductVariant = {
  id?: string
  colorId: string
  sku?: string
  priceCents: number
  stockQty?: number
  images: Array<{ url: string; position?: number }>
}

type Product = {
  id: string
  slug: string
  name: string
  description: string
  materials?: string
  care?: string
  categoryId: string
  isPublished: boolean
  variants: ProductVariant[]
}

type Color = {
  id: string
  name: string
  hex?: string
  hex_code?: string
}

export default function ProductPage() {
  const locale = useClientLocale()
  const t = useTranslations()
  const params = useParams()
  const productSlug = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedColorId, setSelectedColorId] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false)
  const [hasSwiped, setHasSwiped] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { addItem } = useCartStore()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore()

  useEffect(() => {
    // Загружаем товар и цвета (используем кеш браузера)
    Promise.all([
      fetch(`/api/products/${productSlug}`).then(r => r.json()),
      fetch('/api/colors').then(r => r.json()),
    ])
      .then(([productData, colorsData]) => {
        setProduct(productData)
        setColors(colorsData.results || colorsData)
        
        // Выбираем первый доступный цвет
        if (productData.variants && productData.variants.length > 0) {
          setSelectedColorId(String(productData.variants[0].colorId || ''))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading product:', err)
        setLoading(false)
      })
    
    // Cleanup: очищаем таймер при размонтировании или изменении productSlug
    return () => {
      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current)
      }
    }
  }, [productSlug])

  // Загружаем похожие товары для секции "Вам может понравиться" (используем кеш браузера)
  useEffect(() => {
    if (product) {
      fetch('/api/products')
        .then(r => r.json())
        .then(data => {
          const all = (data.results || []).filter((p: any) => 
            p.id !== product.id && p.isPublished === true
          ).slice(0, 4)
          setRelatedProducts(all)
        })
        .catch(() => {
          setRelatedProducts([])
        })
    }
  }, [product])

  // Получаем текущий выбранный вариант
  const selectedVariant = product?.variants?.find(v => String(v.colorId) === String(selectedColorId))
  const currentImages = selectedVariant?.images || []
  const currentImage = currentImages[selectedImageIndex]?.url || currentImages[0]?.url || '/placeholder/about_main_placeholder.svg'
  
  // Получаем информацию о выбранном цвете
  const selectedColor = colors.find(c => String(c.id) === String(selectedColorId))

  // Получаем все доступные цвета для этого товара
  const availableColors = product?.variants
    ?.map(v => {
      const color = colors.find(c => String(c.id) === String(v.colorId))
      return color ? { ...color, variant: v } : null
    })
    .filter(Boolean) as Array<Color & { variant: ProductVariant }> || []

  const favorite = product ? isFavorite(Number(product.id)) : false
  const price = selectedVariant ? selectedVariant.priceCents / 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fintage-offwhite dark:bg-fintage-charcoal">
        <div className="text-center">
          <div className="animate-spin rounded-sm h-12 w-12 border-2 border-fintage-graphite/30 dark:border-fintage-graphite/50 border-t-accent dark:border-t-accent mx-auto mb-4"></div>
          <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.2em]">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fintage-offwhite dark:bg-fintage-charcoal">
        <div className="text-center">
          <h1 className="text-2xl font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-tighter">Товар не найден</h1>
          <Link href="/catalog">
            <Button variant="primary" className="font-mono tracking-[0.15em] text-xs uppercase">Вернуться в каталог</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return
    
    const variant = {
      id: selectedVariant.sku || `${product.id}-${selectedColorId}`,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
      },
      color: selectedColor,
      price: price.toString(),
      priceCents: selectedVariant.priceCents,
      image: currentImage,
      stockQty: selectedVariant.stockQty || 0,
    }
    
    addItem({
      id: Number(product.id),
      title: product.name,
      description: product.description,
      price: price,
      category: product.categoryId,
      image: currentImage,
      colors: [],
      quantity: 1,
      selectedColor: selectedColor?.name || '',
    })
    
    // Вибрация уже вызывается в cart-store.addItem(), но оставляем здесь для обратной совместимости
    // triggerHapticFeedback('success')
  }

  const handleToggleFavorite = () => {
    if (favorite) {
      removeFromFavorites(Number(product.id))
    } else {
      addToFavorites({
        id: Number(product.id),
        name: product.name,
        slug: product.slug,
        price: price,
        image: currentImage,
      } as any)
      
      // Вибрация при добавлении в избранное
      triggerHapticFeedback('success')
    }
  }

  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId)
    setSelectedImageIndex(0) // Сбрасываем индекс изображения при смене цвета
  }

  // Touch handlers для свайпа изображений на мобильных устройствах
  const minSwipeDistance = 50

  const onImageTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
    setTouchStartY(e.targetTouches[0].clientY)
    setIsHorizontalSwipe(false)
  }

  const onImageTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null || currentImages.length <= 1) return
    
    const currentX = e.targetTouches[0].clientX
    const currentY = e.targetTouches[0].clientY
    const deltaX = Math.abs(currentX - touchStartX)
    const deltaY = Math.abs(currentY - touchStartY)
    
    // Определяем направление свайпа: горизонтальный или вертикальный
    // Для iOS используем более строгие условия
    if (deltaX > deltaY && deltaX > 30 && deltaX > deltaY * 2) {
      // Горизонтальный свайп - блокируем скролл страницы
      if (!isHorizontalSwipe) {
        setIsHorizontalSwipe(true)
      }
      e.preventDefault()
      e.stopPropagation()
      setTouchEndX(currentX)
    } else if (deltaY > deltaX && deltaY > 30) {
      // Вертикальный свайп - разрешаем скролл страницы
      setTouchStartX(null)
      setTouchStartY(null)
      setTouchEndX(null)
      setIsHorizontalSwipe(false)
    }
  }

  const onImageTouchEnd = () => {
    const wasSwipe = touchStartX !== null && touchEndX !== null && isHorizontalSwipe && currentImages.length > 1
    
    if (wasSwipe) {
      const distance = touchStartX - touchEndX
      
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          // Swipe left - next image
          setSelectedImageIndex((prev) => (prev + 1) % currentImages.length)
        } else {
          // Swipe right - previous image
          setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
        }
        triggerHapticFeedback('success')
        setHasSwiped(true)
        // Сбрасываем флаг через небольшую задержку
        // Очищаем предыдущий таймер если он существует
        if (swipeTimeoutRef.current) {
          clearTimeout(swipeTimeoutRef.current)
        }
        swipeTimeoutRef.current = setTimeout(() => setHasSwiped(false), 300)
      }
    }
    
    setTouchStartX(null)
    setTouchStartY(null)
    setTouchEndX(null)
    setIsHorizontalSwipe(false)
  }

  return (
    <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas">
      {product && <ProductStructuredData product={product} variant={selectedVariant} />}
      <div className="container mx-auto px-6 md:px-8 lg:px-12 pt-6 md:pt-8 lg:pt-10 pb-12 md:pb-16 lg:pb-20">
        {/* Back Button - технический стиль */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-10"
        >
          <Link href="/catalog">
            <Button 
              variant="outline" 
              className="flex items-center justify-center space-x-1.5 md:space-x-2 h-9 md:h-9 px-3 md:px-4 text-xs md:text-sm font-mono tracking-[0.15em] uppercase min-w-[36px] md:min-w-auto transition-fintage"
            >
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t('product.backToCatalog')}</span>
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-16 md:mb-20">
          {/* Images - технический стиль */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="w-full max-w-full sm:max-w-[420px] md:max-w-[450px] lg:max-w-[480px] mx-auto space-y-4 md:space-y-6">
              <div 
                className="relative aspect-[3/4] sm:aspect-[3/4] md:aspect-[4/5] lg:aspect-[4/5] w-full rounded-sm overflow-hidden border border-fintage-graphite/20 dark:border-fintage-graphite/30 group cursor-pointer"
                style={{ touchAction: 'pan-y pinch-zoom' }}
                onTouchStart={onImageTouchStart}
                onTouchMove={onImageTouchMove}
                onTouchEnd={onImageTouchEnd}
                onClick={(e) => {
                  // Открываем lightbox при клике (не при свайпе)
                  if (!hasSwiped && !isHorizontalSwipe) {
                    setIsLightboxOpen(true)
                  }
                }}
              >
                <Image
                  key={`${product.id}-${selectedColorId}-${selectedImageIndex}`}
                  src={currentImage.startsWith('http') || currentImage.startsWith('/') 
                    ? currentImage 
                    : `/${currentImage}`}
                  alt={product.name}
                  fill
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 45vw, 480px"
                  className="object-cover transition-opacity duration-300"
                  unoptimized={currentImage.startsWith('/uploads/') || currentImage.includes('blob.vercel-storage.com') || currentImage.startsWith('http')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('[ProductPage] Ошибка загрузки изображения:', {
                        src: currentImage,
                        productId: product.id,
                        selectedColorId,
                        selectedImageIndex,
                      })
                    }
                    target.src = '/placeholder/about_main_placeholder.svg'
                  }}
                />
                {/* Индикатор увеличения - только на desktop */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-fintage flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                  <div className="px-3 py-1.5 bg-black/60 dark:bg-black/80 backdrop-blur-sm rounded-sm border border-white/20">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              {/* Миниатюры изображений - технический стиль */}
              {currentImages.length > 1 && (
                <div 
                  className="flex gap-2 md:gap-3 overflow-x-auto pb-2"
                  style={{ 
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-x',
                    overscrollBehaviorX: 'contain'
                  }}
                >
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-sm overflow-hidden border-2 transition-fintage ${
                        selectedImageIndex === idx 
                          ? 'border-accent dark:border-accent ring-2 ring-accent/30 dark:ring-accent/30 shadow-fintage-sm' 
                          : 'border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:border-fintage-graphite/50 dark:hover:border-fintage-graphite/60'
                      }`}
                    >
                      <img
                        src={img.url.startsWith('http') || img.url.startsWith('/') ? img.url : `/${img.url}`}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder/about_main_placeholder.svg'
                          if (process.env.NODE_ENV === 'development') {
                            console.warn('[ProductPage] Ошибка загрузки миниатюры:', img.url)
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info - технический стиль */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 md:space-y-8"
          >
            <div>
              <h1 className="text-title-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase mb-4">
                {product.name}
              </h1>
              <p className="text-xl md:text-2xl font-bold text-fintage-charcoal dark:text-fintage-offwhite mb-6">
                {formatPriceWithLocale(price, locale)}
              </p>
              {/* Разделительная линия */}
              <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30 mb-6" aria-hidden="true" />
              <p className="text-fintage-charcoal/80 dark:text-fintage-offwhite/80 leading-relaxed text-sm md:text-base break-words max-w-[65ch] font-light">
                {product.description}
              </p>
            </div>

            {/* Colors - технический стиль */}
            {availableColors.length > 0 && (
              <div>
                <div className="mb-3">
                  <h3 className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] mb-2">{t('product.colors') || 'ЦВЕТ'}</h3>
                  <div className="h-px bg-fintage-graphite/20 dark:bg-fintage-graphite/30 w-16" aria-hidden="true" />
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {availableColors.map((colorData) => {
                    const isSelected = String(colorData.id) === String(selectedColorId)
                    return (
                      <button
                        key={colorData.id}
                        onClick={() => handleColorChange(String(colorData.id))}
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-sm border-2 transition-fintage relative ${
                          isSelected 
                            ? 'border-accent dark:border-accent scale-105 ring-2 ring-accent/30 dark:ring-accent/30 shadow-fintage-md' 
                            : 'border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:border-fintage-graphite/50 dark:hover:border-fintage-graphite/60'
                        }`}
                        style={{ backgroundColor: colorData.hex || colorData.hex_code || '#cccccc' }}
                        title={`${colorData.name}${isSelected ? ' (выбран)' : ''}`}
                        aria-label={`вариант цвета: ${colorData.name}${isSelected ? ' (выбран)' : ''}`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions - технический стиль */}
            <div className="flex space-x-3 md:space-x-4 pt-4 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30">
              <Button 
                variant="primary"
                className="flex-1 flex items-center justify-center space-x-2 h-12 text-sm font-mono tracking-[0.15em] uppercase"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{t('product.addToCart')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={`px-4 h-12 text-sm rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:bg-hover-bg dark:hover:bg-hover-bg ${
                  favorite 
                    ? 'text-fintage-punch dark:text-fintage-punch border-fintage-punch/30 dark:border-fintage-punch/30' 
                    : 'text-fintage-charcoal dark:text-fintage-offwhite'
                }`}
              >
                <Heart className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} />
              </Button>
            </div>

            {/* Share buttons */}
            {product && (
              <div className="pt-4 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30">
                <ProductShareButtons
                  productName={product.name}
                  productUrl={`${typeof window !== 'undefined' ? window.location.origin : 'https://rosebotanique.store'}/product/${product.slug}`}
                  productImageUrl={currentImage.startsWith('http') ? currentImage : `${typeof window !== 'undefined' ? window.location.origin : 'https://rosebotanique.store'}${currentImage.startsWith('/') ? currentImage : '/' + currentImage}`}
                  productPrice={selectedVariant ? selectedVariant.priceCents / 100 : 0}
                  variant="page"
                />
              </div>
            )}

            {/* Product Details - технический стиль */}
            {(product.materials || product.care) && (
              <div className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 pt-6 md:pt-8 space-y-6 md:space-y-8">
                {product.materials && (
                  <div>
                    <div className="mb-3">
                      <h4 className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] mb-2">{t('product.materials') || 'МАТЕРИАЛЫ'}</h4>
                      <div className="h-px bg-fintage-graphite/20 dark:bg-fintage-graphite/30 w-16" aria-hidden="true" />
                    </div>
                    <p className="text-sm md:text-base text-fintage-charcoal/80 dark:text-fintage-offwhite/80 leading-relaxed whitespace-pre-line font-light">
                      {product.materials}
                    </p>
                  </div>
                )}
                {product.care && (
                  <div>
                    <div className="mb-3">
                      <h4 className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] mb-2">{t('product.care') || 'УХОД'}</h4>
                      <div className="h-px bg-fintage-graphite/20 dark:bg-fintage-graphite/30 w-16" aria-hidden="true" />
                    </div>
                    <p className="text-sm md:text-base text-fintage-charcoal/80 dark:text-fintage-offwhite/80 leading-relaxed whitespace-pre-line font-light">
                      {product.care}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products - технический стиль */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8 md:pt-10 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30"
        >
          <div className="mb-4 md:mb-6 text-center">
            <h2 className="text-lg md:text-xl font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase mb-2">
              {t('product.youMightLike')}
            </h2>
            {/* Разделительная линия */}
            <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30 w-24 mx-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {relatedProducts.map((relatedProduct) => {
              const firstVariant = (relatedProduct.variants || [])[0]
              const relatedPrice = firstVariant ? firstVariant.priceCents / 100 : 0
              const relatedThumbnail = firstVariant?.images?.[0]?.url || null
              
              const relatedColors = (relatedProduct.variants || [])
                .map((v: ProductVariant) => {
                  const color = colors.find(c => String(c.id) === String(v.colorId))
                  return color ? {
                    id: String(color.id),
                    name: color.name,
                    hex_code: color.hex || color.hex_code || '#9CA3AF'
                  } : null
                })
                .filter(Boolean) as Array<{ id: string; name: string; hex_code: string }>

              const relatedItem = {
                id: String(relatedProduct.id),
                slug: relatedProduct.slug,
                name: relatedProduct.name,
                category: {
                  id: String(relatedProduct.categoryId || ''),
                  name: String(relatedProduct.categoryId || ''),
                  slug: String(relatedProduct.categoryId || ''),
                },
                thumbnail: relatedThumbnail,
                price: relatedPrice,
                colors: relatedColors,
                colorImages: undefined,
                is_featured: Boolean(relatedProduct.is_featured),
              }
              return <ProductCard key={relatedItem.id} product={relatedItem as any} />
            })}
          </div>
        </motion.div>
      </div>

      {/* Image Lightbox - для детального просмотра */}
      {product && (
        <ProductImageLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={currentImages}
          currentIndex={selectedImageIndex}
          onIndexChange={setSelectedImageIndex}
          productName={product.name}
        />
      )}
    </div>
  )
}


