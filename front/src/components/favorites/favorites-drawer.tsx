'use client'

import { X, Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavoritesStore } from '@/store/favorites-store'
import { useCartStore } from '@/store/cart-store'
import { formatPriceWithLocale } from '@/lib/utils'
import { Product } from '@/types'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { getOptimizedAsset } from '@/lib/optimized-assets'

export function FavoritesDrawer() {
  const t = useTranslations()
  const locale = useClientLocale()
  const { 
    items: favorites, 
    isOpen, 
    toggleFavorites, 
    removeFromFavorites 
  } = useFavoritesStore()
  
  const { addItem } = useCartStore()

  const handleAddToCart = (product: Product) => {
    addItem({ ...product, quantity: 1, selectedColor: product.colors[0] })
  }

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[49]"
            onClick={toggleFavorites}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-card z-[50] shadow-xl dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col" role="dialog" aria-modal="true" aria-label={t('favorites.title')}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-mistGray/20 dark:border-border">
              <h2 className="text-xl font-light text-inkSoft dark:text-foreground">
                {t('favorites.title')} <span suppressHydrationWarning>{favorites.length}</span>
              </h2>
              <button
                type="button"
                onClick={toggleFavorites}
                className="p-2 hover:bg-mistGray/10 dark:hover:bg-muted/30 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5 text-inkSoft dark:text-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
                  <Heart className="h-16 w-16 text-mistGray dark:text-muted-foreground" />
                  <h3 className="text-lg font-light text-inkSoft dark:text-foreground">{t('favorites.empty')}</h3>
                  <Button onClick={toggleFavorites} asChild>
                    <Link href="/catalog">{t('favorites.continueShopping')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-mistGray/5 dark:bg-muted/10 rounded-xl border border-mistGray/20 dark:border-border"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-mistGray/20 dark:border-border">
                        {(() => {
                          if (item.image.startsWith('http')) {
                            return (
                              <OptimizedImage
                                src={item.image}
                                fallbackSrc={item.image}
                                placeholder="empty"
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 80px, 100px"
                                className="object-cover"
                              />
                            )
                          }

                          const normalizedPath = item.image.startsWith('/') ? item.image : `/${item.image}`
                          const asset = getOptimizedAsset(normalizedPath, 360)
                          return (
                            <OptimizedImage
                              src={asset.src}
                              fallbackSrc={asset.fallback}
                              placeholder={asset.placeholder ? 'blur' : 'empty'}
                              blurDataURL={asset.placeholder}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 80px, 100px"
                              className="object-cover"
                            />
                          )
                        })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-light text-inkSoft dark:text-foreground truncate">{item.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-light text-inkSoft dark:text-foreground">
                            {formatPriceWithLocale(item.price, locale)}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              {t('product.addToCart')}
                            </Button>
                            <button
                              type="button"
                              onClick={() => removeFromFavorites(item.id)}
                              className="h-8 w-8 rounded-full border border-mistGray/20 dark:border-border hover:bg-mistGray/10 dark:hover:bg-muted/30 transition-colors flex items-center justify-center text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400 focus-visible:ring-offset-2"
                              aria-label={locale === 'ru' ? 'удалить из избранного' : 'remove from favorites'}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {favorites.length > 0 && (
              <div className="border-t border-mistGray/20 dark:border-border p-6">
                <Button variant="outline" className="w-full rounded-full" onClick={toggleFavorites}>
                  {t('favorites.continueShopping')}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default FavoritesDrawer

