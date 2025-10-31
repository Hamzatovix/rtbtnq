'use client'

import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { ProductListItem } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useCart } from '@/lib/hooks'
import { useFavoritesStore } from '@/store/favorites-store'
import type { Product as FavoritableProduct } from '@/types'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

interface ProductCardProps {
  product: ProductListItem
  density?: 'regular' | 'compact'
  className?: string
}

export function ProductCard({ product, density = 'compact', className }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite, toggleFavorites } = useFavoritesStore()
  const [favorite, setFavorite] = useState(false)
  const [showCartNotification, setShowCartNotification] = useState(false)
  const [showFavoriteNotification, setShowFavoriteNotification] = useState(false)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null)
  const [imgError, setImgError] = useState(false)
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const cartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const favoriteTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([])
  
  // Intersection observer for lazy loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  // Compact mode styles
  const isCompact = density === 'compact'
  const cardRadius = isCompact ? 'rounded-lg' : 'rounded-2xl'
  const imageRatio = isCompact ? 'aspect-square' : 'aspect-[4/5]'
  const imageScale = isCompact ? 'group-hover:scale-[1.02]' : 'group-hover:scale-103'
  const bodyPadding = isCompact ? 'p-3 sm:p-3.5 space-y-1.5' : 'p-4 sm:p-5 space-y-3'
  const titleClass = isCompact ? 'text-sm' : 'text-base sm:text-lg'
  const descClass = isCompact ? 'text-xs line-clamp-1' : 'text-xs sm:text-sm line-clamp-2'
  const priceClass = isCompact ? 'text-sm font-medium' : 'text-base sm:text-lg font-medium'
  const colorsGap = isCompact ? 'space-x-1' : 'space-x-1 sm:space-x-2'
  const swatchSize = isCompact ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-5 h-5 sm:w-6 sm:h-6'
  const badgeTR = isCompact ? 'top-2.5 right-2.5' : 'top-6 right-6'
  const badgeTL = isCompact ? 'top-2.5 left-2.5' : 'top-6 left-6'
  const overlayPad = isCompact ? 'px-2.5 py-1 text-[11px]' : 'px-4 py-2 text-sm'

  // Sync with store on client side
  useEffect(() => {
    setFavorite(isFavorite(product.id))
  }, [product.id, isFavorite])

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
  const getImageForColor = (color: any) => {
    // For now, just return the thumbnail
    return product.thumbnail || '/placeholder/about_main_placeholder.webp'
  }

  const handleSwatchKey = (e: React.KeyboardEvent) => {
    if (!product.colors?.length) return
    let next = selectedColorIndex
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (selectedColorIndex + 1) % product.colors.length
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   next = (selectedColorIndex - 1 + product.colors.length) % product.colors.length
    if (next !== selectedColorIndex && product.colors[next]) {
      setSelectedColorIndex(next)
      setSelectedColor(product.colors[next])
      radioRefs.current[next]?.focus()
    }
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
      price: product.price_range?.toString() || '0',
      stock_qty: 10, // Default stock
    }
    
    addToCart(mockVariant, 1)
    setShowCartNotification(true)
    
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
      id: product.id,
      title: product.name,
      description: '',
      price: typeof product.price_range === 'number' ? product.price_range : Number(product.price_range ?? 0),
      category: product.category?.name ?? '',
      image: product.thumbnail ?? '/placeholder/about_main_placeholder.webp',
      colors: (product.colors ?? []).map(c => c.name),
    }

    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
      setFavorite(false)
    } else {
      addToFavorites(favProduct)
      setFavorite(true)
      setShowFavoriteNotification(true)
      if (favoriteTimeoutRef.current) {
        clearTimeout(favoriteTimeoutRef.current)
      }
      favoriteTimeoutRef.current = setTimeout(() => setShowFavoriteNotification(false), 2000)
    }
  }

  return (
    <motion.div 
      ref={ref}
      className={`group relative ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
    >
      {/* Toast Notifications */}
      {showCartNotification && (
        <motion.div 
          className="absolute top-4 left-4 z-20 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          Added to cart!
        </motion.div>
      )}
      {showFavoriteNotification && (
        <motion.div 
          className="absolute top-4 left-4 z-20 bg-red-500 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          Added to favorites!
        </motion.div>
      )}
      
      <Card className={`overflow-hidden border border-mistGray/20 shadow-misty/50 hover:shadow-misty transition-breathing backdrop-misty ${cardRadius}`} style={{ backgroundColor: '#f9f9f9' }}>
        <CardContent className="p-0">
          {/* Image */}
          <div className={`relative overflow-hidden rounded-t-[inherit] ${imageRatio}`}>
            <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={`View details for ${product.name}`}>
              <OptimizedImage
                src={getImageForColor(selectedColor)}
                alt={selectedColor ? `${product.name} in ${selectedColor.name}` : product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className={`object-cover transition-transform duration-300 ease-brand ${imageScale}`}
                onError={() => setImgError(true)}
                onLoad={() => setIsLoaded(true)}
                priority={false}
              />
            </Link>
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-sageTint/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" aria-hidden="true" />
            
            {/* Action buttons - compact */}
            <div className={`absolute flex flex-col space-y-2.5 opacity-100 transition-all duration-250 z-10 ${badgeTR}`}>
              <button
                type="button"
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={favorite}
                onClick={handleToggleFavorite}
                className="group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-mistGray/20 h-9 w-9 rounded-xl backdrop-blur-md shadow-warm border text-muted-foreground hover:scale-110 transition-transform duration-250 ease-brand"
              >
                <Heart className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
              </button>
              
              <button
                type="button"
                aria-label="Add to cart"
                onClick={handleAddToCart}
                className="group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-mistGray/20 h-9 w-9 rounded-xl backdrop-blur-md shadow-warm bg-linenWhite/95 border-mistGray/30 hover:scale-110 transition-transform duration-250 ease-brand"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>

            {/* Handmade badge */}
            <div className={`absolute ${badgeTL}`}>
              <div 
                className={`${overlayPad} font-medium rounded-full backdrop-blur-md shadow-warm border bg-sageTint/90 text-linenWhite border-mistGray/30`}
                aria-hidden="true"
              >
                Handmade
              </div>
            </div>

            {/* View details overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center bg-sageTint/20">
            </div>
          </div>

          {/* Content */}
          <div className={bodyPadding}>
            <Link href={`/product/${product.slug}`} aria-label={`View ${product.name} product details`}>
              <div className="space-y-1.5">
                <h3 className={`text-graceful font-light transition-colors duration-250 leading-tight ${titleClass}`} style={{ color: '#4b4b4b' }}>
                  {product.name}
                </h3>
                <p className={`leading-relaxed font-light tracking-wide ${descClass}`} style={{ color: 'rgba(75, 75, 75, 0.6)' }}>
                  {product.category.name}
                </p>
              </div>
            </Link>
            
            <div className="flex items-center justify-between pt-1.5">
              <div className="flex items-center space-x-2">
                <span className={`text-inkSoft/80 ${priceClass}`}>
                  {product.price_range ? 
                    (typeof product.price_range === 'string' ? product.price_range : `${product.price_range} ₽`) : 
                    'Цена по запросу'
                  }
                </span>
              </div>
              <div className={`flex ${colorsGap}`} role="radiogroup" aria-label="Available colors" onKeyDown={handleSwatchKey}>
                {product.colors?.slice(0, 3).map((color, index) => {
                  const checked = index === selectedColorIndex
                  return (
                    <button
                      key={color.id}
                      ref={(el) => { radioRefs.current[index] = el }}
                      role="radio"
                      aria-checked={checked}
                      tabIndex={checked ? 0 : -1}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedColorIndex(index)
                        setSelectedColor(color)
                      }}
                      className={`${swatchSize} rounded-full border-2 shadow-warm transition-transform duration-250 ease-brand focus:outline-none focus:ring-2 focus:ring-sageTint ${
                        checked ? 'ring-2 ring-sageTint scale-110 shadow-medium' : 'border-mistGray/30 hover:border-mistGray/50 hover:scale-110'
                      }`}
                      style={{ backgroundColor: color.hex_code }}
                      title={`Color: ${color.name}${checked ? ' (selected)' : ''}`}
                      aria-label={`Color option: ${color.name}${checked ? ' (selected)' : ''}`}
                    />
                  )
                })}
                {product.colors.length > 3 && (
                  <div 
                    className={`${swatchSize} rounded-full border-2 flex items-center justify-center text-[10px] font-medium text-muted-foreground shadow-warm bg-roseBeige border-mistGray/30`}
                    role="img"
                    aria-label={`${product.colors.length - 3} more colors available`}
                  >
                    +{product.colors.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}


