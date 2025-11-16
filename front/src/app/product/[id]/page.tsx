'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react'
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
  const currentImage = currentImages[selectedImageIndex]?.url || currentImages[0]?.url || '/placeholder/about_main_placeholder.webp'
  
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sageTint dark:border-primary mx-auto mb-4"></div>
          <p className="text-inkSoft/60 dark:text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-light text-inkSoft dark:text-foreground mb-4">Товар не найден</h1>
          <Link href="/catalog">
            <Button>Вернуться в каталог</Button>
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
    
    // Вибрация при добавлении в корзину
    triggerHapticFeedback('success')
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

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {product && <ProductStructuredData product={product} variant={selectedVariant} />}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/catalog">
            <Button variant="ghost" className="flex items-center space-x-2 h-9 px-3 text-sm">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('product.backToCatalog')}</span>
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="w-full max-w-[420px] md:max-w-[520px] mx-auto space-y-4">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
                <Image
                  key={`${product.id}-${selectedColorId}-${selectedImageIndex}`}
                  src={currentImage.startsWith('http') || currentImage.startsWith('/') 
                    ? currentImage 
                    : `/${currentImage}`}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  className="object-cover transition-opacity duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.webp'
                  }}
                />
              </div>
              {/* Миниатюры изображений, если их несколько */}
              {currentImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx 
                          ? 'border-sageTint dark:border-primary ring-2 ring-sageTint/30 dark:ring-primary/30' 
                          : 'border-mistGray/30 dark:border-border hover:border-mistGray/50 dark:hover:border-border/60'
                      }`}
                    >
                      <img
                        src={img.url.startsWith('http') || img.url.startsWith('/') ? img.url : `/${img.url}`}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder/about_main_placeholder.webp'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-5"
          >
            <div>
              <h1 className="font-serif text-2xl font-light text-inkSoft dark:text-foreground mb-3.5">
                {product.name}
              </h1>
              <p className="text-xl font-light text-inkSoft dark:text-foreground mb-4">
                {formatPriceWithLocale(price, locale)}
              </p>
              <p className="text-inkSoft/70 dark:text-muted-foreground leading-relaxed text-sm break-words max-w-[65ch]">
                {product.description}
              </p>
            </div>

            {/* Colors */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="font-light text-inkSoft/80 dark:text-muted-foreground mb-2.5 text-sm">{t('product.colors') || 'Цвет'}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((colorData) => {
                    const isSelected = String(colorData.id) === String(selectedColorId)
                    return (
                      <button
                        key={colorData.id}
                        onClick={() => handleColorChange(String(colorData.id))}
                        className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                          isSelected 
                            ? 'border-inkSoft dark:border-foreground scale-105 ring-2 ring-sageTint dark:ring-primary' 
                            : 'border-mistGray/40 dark:border-border hover:border-mistGray/60 dark:hover:border-border/60'
                        }`}
                        style={{ backgroundColor: colorData.hex || colorData.hex_code || '#cccccc' }}
                        title={`${colorData.name}${isSelected ? ' (выбран)' : ''}`}
                        aria-label={`вариант цвета: ${colorData.name}${isSelected ? ' (выбран)' : ''}`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {selectedColor && (
                  <p className="text-xs text-inkSoft/60 dark:text-muted-foreground mt-2">{selectedColor.name}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <Button 
                className="flex-1 flex items-center justify-center space-x-2 h-10 text-sm"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{t('product.addToCart')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={`px-3 h-10 text-sm ${favorite ? 'text-red-500 dark:text-red-400' : 'text-inkSoft/70 dark:text-muted-foreground'}`}
              >
                <Heart className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} />
              </Button>
            </div>

            {/* Product Details */}
            {(product.materials || product.care) && (
              <div className="border-t border-mistGray/30 dark:border-border pt-4 space-y-3.5">
                {product.materials && (
                  <div>
                    <h4 className="font-light text-inkSoft/80 dark:text-muted-foreground mb-1.5 text-sm">{t('product.materials') || 'Материалы'}</h4>
                    <p className="text-sm text-inkSoft/70 dark:text-muted-foreground whitespace-pre-line">
                      {product.materials}
                    </p>
                  </div>
                )}
                {product.care && (
                  <div>
                    <h4 className="font-light text-inkSoft/80 dark:text-muted-foreground mb-1.5 text-sm">{t('product.care') || 'Уход'}</h4>
                    <p className="text-sm text-inkSoft/70 dark:text-muted-foreground whitespace-pre-line">
                      {product.care}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="font-serif text-xl font-light text-inkSoft dark:text-foreground mb-6 text-center">
            {t('product.youMightLike')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  )
}


