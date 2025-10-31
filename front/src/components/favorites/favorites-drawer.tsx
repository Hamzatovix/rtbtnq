'use client'

import { X, Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavoritesStore } from '@/store/favorites-store'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types'
import Image from 'next/image'
import Link from 'next/link'

export function FavoritesDrawer() {
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
            className="fixed inset-0 bg-black/50 z-50"
            onClick={toggleFavorites}
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl animate-slide-up">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-serif text-xl font-semibold">
                  Favorites (<span suppressHydrationWarning>{favorites.length}</span>)
                </h2>
                <Button variant="ghost" size="icon" onClick={toggleFavorites}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <Heart className="h-16 w-16 text-neutral-300" />
                    <h3 className="font-medium text-neutral-600">Your favorites is empty</h3>
                    <p className="text-sm text-neutral-500">
                      Add items to favorites from catalog
                    </p>
                    <Button onClick={toggleFavorites} className="mt-4">
                      <Link href="/catalog">Go to catalog</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((item) => (
                      <div key={item.id} className="flex space-x-4 p-4 border rounded-xl">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 80px, 100px"
                            className="object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder/about_main_placeholder.webp'
                            }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-800 truncate">
                            {item.title}
                          </h4>
                          <p className="text-sm text-neutral-600 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-medium text-neutral-900">
                              {formatPrice(item.price)}
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddToCart(item)}
                                className="text-xs rounded-full"
                              >
                                <ShoppingBag className="h-3 w-3 mr-1" />
                                Add to cart
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => removeFromFavorites(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
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
                <div className="border-t p-6 space-y-4">
                  <Button variant="outline" className="w-full rounded-full" onClick={toggleFavorites}>
                    Continue shopping
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

