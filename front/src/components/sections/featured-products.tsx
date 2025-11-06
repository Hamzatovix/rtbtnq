'use client'

import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import { Lead } from '@/components/ui/typography'
import { mockProducts, mockCategories, colorMap } from '@/lib/mock-data'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useTranslations } from '@/hooks/useTranslations'

// Динамический импорт для тяжелых компонентов
const DynamicProductCard = dynamic(
  () => import('@/components/product/product-card').then(mod => ({ default: mod.ProductCard })),
  { loading: () => <div className="animate-pulse bg-gray-200 rounded-xl aspect-square" /> }
)

export function FeaturedProducts() {
  const t = useTranslations()
  const featuredProducts = mockProducts.slice(0, 6) // Show all 6 products
  const locale = typeof window !== 'undefined' ? (localStorage.getItem('locale-storage') ? JSON.parse(localStorage.getItem('locale-storage') as string).state?.locale : 'ru') : 'ru'

  return (
    <section 
      className="py-16 md:py-18 bg-white relative overflow-hidden"
      aria-labelledby="featured-heading"
    >
      {/* Subtle decorative elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-sageTint/8 rounded-full blur-3xl anim-breath" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-mistGray/20 rounded-full blur-3xl anim-breath" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 relative">
        <div className="text-center mb-12 md:mb-14">
          <h2 
            id="featured-heading" 
            className="text-title-1 font-light text-ink-soft leading-tight tracking-wide mb-4"
          >
            {t('home.featuredProducts.title')}
          </h2>
          <Lead className="max-w-xl mx-auto">
            {t('home.featuredProducts.lead')}
          </Lead>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12">
          {featuredProducts.map((product) => {
            const title = locale === 'ru' ? product.title_ru : product.title_en
            const description = locale === 'ru' ? product.description_ru : product.description_en
            const cat = mockCategories.find(c => c.id === product.category_id)
            const categoryName = cat ? (locale === 'ru' ? cat.name_ru : cat.name_en) : ''
            const item = {
              id: product.id,
              slug: product.slug,
              name: title,
              category: {
                id: product.category_id,
                name: categoryName,
                slug: product.category_id
              },
              thumbnail: product.image,
              price_range: product.price,
              colors: product.colors.map((colorName: string, idx: number) => ({
                id: `${product.id}-${idx}`,
                name: colorName,
                hex_code: colorMap[colorName.toLowerCase()] || '#9CA3AF'
              })),
              is_featured: product.id <= 3
            }
            return (
              <div key={item.id}>
                <DynamicProductCard product={item as any} density="compact" />
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="primary"
            size="lg" 
            asChild
          >
            <Link href="/catalog">
              {t('catalog.allProducts')}
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform duration-250 ease-brand" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

