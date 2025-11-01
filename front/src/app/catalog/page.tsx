'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Lead } from '@/components/ui/typography'
import { useProducts, useCategories, useColors } from '@/lib/hooks'
import dynamic from 'next/dynamic'

// Динамический импорт для ProductCard
const ProductCard = dynamic(() => import('@/components/product/product-card').then(mod => ({ default: mod.ProductCard })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-2xl aspect-[4/5]" />,
  ssr: false
})

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<number | undefined>(undefined)

  // Memoize filter object to avoid infinite requests
  const filters = useMemo(() => ({
    category: selectedCategory || undefined,
    color: selectedColor,
  }), [selectedCategory, selectedColor])

  // Fetch data from API
  const { categories, loading: categoriesLoading } = useCategories()
  const { colors, loading: colorsLoading } = useColors()
  const { 
    products, 
    loading: productsLoading, 
    error: productsError,
    hasMore,
    loadMore,
    refetch
  } = useProducts(filters)

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-sageTint/6 rounded-full blur-2xl anim-breath" />
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-mistGray/15 rounded-full blur-3xl anim-breath" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-display-1 font-light text-ink-soft leading-[0.95] mb-6 tracking-normal">
            collection
          </h1>
          <Lead className="max-w-xl mx-auto">
            Hand-stitched bags in natural tones for every moment.
          </Lead>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex flex-wrap gap-6 justify-center">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-small font-medium text-ink-soft/70 tracking-wide">Category:</span>
              <Button
                variant={selectedCategory === '' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                All categories
              </Button>
              {categoriesLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : (
                categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name}
                  </Button>
                ))
              )}
            </div>

            {/* Color Filter */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-small font-medium text-ink-soft/70 tracking-wide">Color:</span>
              <Button
                variant={selectedColor === undefined ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedColor(undefined)}
              >
                All colors
              </Button>
              {colorsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              ) : (
                colors.map((color) => (
                  <Button
                    key={color.id}
                    variant={selectedColor === Number(color.id) ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedColor(Number(color.id))}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    {color.name}
                  </Button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8"
        >
          {productsLoading ? (
            // Skeleton loading
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 rounded-2xl aspect-[4/5]" />
            ))
          ) : productsError ? (
            <div className="col-span-full text-center py-16">
              <p className="text-body text-red-500 font-light tracking-wide mb-6">
                Error loading products: {productsError}
              </p>
              <Button variant="outline" onClick={refetch}>
                Try again
              </Button>
            </div>
          ) : (
            products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Load More Button */}
        {hasMore && !productsLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mt-12"
          >
            <Button variant="outline" onClick={loadMore}>
              Load more products
            </Button>
          </motion.div>
        )}

        {products.length === 0 && !productsLoading && !productsError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center py-16"
          >
            <p className="text-body text-ink-soft/70 font-light tracking-wide mb-6">No products found</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('')
                setSelectedColor(undefined)
              }}
            >
              Reset filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}


