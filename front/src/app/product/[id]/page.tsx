'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/product-card'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { mockProducts } from '@/lib/mock-data'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default function ProductPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)
  const product = mockProducts.find(p => p.id === productId)
  
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '')
  const [selectedImage, setSelectedImage] = useState(0)

  const { addItem } = useCartStore()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoritesStore()

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-800 mb-4">Product not found</h1>
          <Link href="/catalog">
            <Button>Back to catalog</Button>
          </Link>
        </div>
      </div>
    )
  }

  const favorite = isFavorite(product.id)
  const relatedProducts = mockProducts.filter(p => p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    addItem({ ...product, quantity: 1, selectedColor })
  }

  const handleToggleFavorite = () => {
    if (favorite) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  const getColorValue = (color: string): string => {
    const colorMap: Record<string, string> = {
      gray: "#9CA3AF",
      sand: "#F3E5AB",
      olive: "#808000",
      natural: "#F5F5DC",
      charcoal: "#36454F",
      sage: "#9CAF88",
      tan: "#D2B48C",
      black: "#000000",
      burgundy: "#800020",
      beige: "#F5F5DC",
      terracotta: "#E2725B",
      forest: "#228B22",
      cream: "#F5F5DC",
      midnight: "#191970",
      moss: "#8A9A5B",
      camel: "#C19A6B",
      navy: "#000080",
      rust: "#B7410E",
      earth: "#8B4513",
      sunset: "#FD5E53",
      moonlight: "#C0C0C0",
      cognac: "#9F4636",
      slate: "#708090"
    }
    return colorMap[color] || "#9CA3AF"
  }

  return (
    <div className="min-h-screen bg-white">
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
              <span>Назад к каталогу</span>
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
            <div className="relative aspect-square w-full max-w-[420px] md:max-w-[520px] mx-auto rounded-2xl overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder/about_main_placeholder.webp'
                }}
              />
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
              <h1 className="font-serif text-2xl font-light text-neutral-800 mb-3.5">
                {product.title}
              </h1>
              <p className="text-xl font-semibold text-neutral-900 mb-4">
                {formatPrice(product.price)}
              </p>
              <p className="text-neutral-600 leading-relaxed text-sm">
                {product.description}
              </p>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-medium text-neutral-800 mb-2.5 text-sm">Colors:</h3>
              <div className="flex space-x-2.5">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-neutral-800 scale-105' 
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                    style={{ backgroundColor: getColorValue(color) }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <Button 
                className="flex-1 flex items-center justify-center space-x-2 h-10 text-sm"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to cart</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={`px-3 h-10 text-sm ${favorite ? 'text-red-500' : 'text-neutral-600'}`}
              >
                <Heart className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} />
              </Button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-4 space-y-3.5">
              <div>
                <h4 className="font-medium text-neutral-800 mb-1.5 text-sm">Materials</h4>
                <p className="text-sm text-neutral-600">
                  Natural linen, cotton, vegetable-tanned leather
                </p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-800 mb-1.5 text-sm">Care</h4>
                <p className="text-sm text-neutral-600">
                  Hand wash in cold water, dry flat
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="font-serif text-xl font-light text-neutral-800 mb-6 text-center">
            You might like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => {
              const relatedItem = {
                id: relatedProduct.id,
                slug: relatedProduct.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                name: relatedProduct.title,
                category: {
                  id: relatedProduct.category,
                  name: relatedProduct.category.charAt(0).toUpperCase() + relatedProduct.category.slice(1),
                  slug: relatedProduct.category.toLowerCase().replace(/\s+/g, '-')
                },
                thumbnail: relatedProduct.image,
                price_range: relatedProduct.price,
                colors: relatedProduct.colors.map((colorName: string, idx: number) => ({
                  id: `${relatedProduct.id}-${idx}`,
                  name: colorName,
                  hex_code: getColorValue(colorName)
                })),
                is_featured: relatedProduct.id <= 3
              }
              return <ProductCard key={relatedItem.id} product={relatedItem as any} />
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


