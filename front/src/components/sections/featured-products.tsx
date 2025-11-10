'use client'

import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import type { CatalogProduct } from '@/types/catalog'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'

interface FeaturedProductsProps {
  products: CatalogProduct[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const t = useTranslations()
  const locale = useClientLocale()

  const hasProducts = products.length > 0
  const emptyMessageRaw = t('home.featuredProducts.empty')
  const emptyMessage = emptyMessageRaw && emptyMessageRaw !== 'home.featuredProducts.empty'
    ? emptyMessageRaw
    : (locale === 'ru'
      ? 'Скоро добавим новые изделия.'
      : 'New pieces are coming soon.')

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
            <span suppressHydrationWarning>{t('home.featuredProducts.title')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12">
          {hasProducts ? (
            products.slice(0, 6).map((product) => (
              <div key={product.id}>
                <ProductCard product={product} density="compact" />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-ink-soft/70 text-base font-light tracking-wide">
              {emptyMessage}
            </p>
          )}
        </div>

        <div className="text-center">
          <Button 
            variant="primary"
            size="lg" 
            asChild
          >
            <Link href="/catalog">
              <span suppressHydrationWarning>{t('catalog.allProducts')}</span>
              <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform duration-250 ease-brand" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

