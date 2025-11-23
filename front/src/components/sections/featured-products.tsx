'use client'

import { ProductCard } from '@/components/product/product-card'
import { Button } from '@/components/ui/button'
import type { CatalogProduct } from '@/types/catalog'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { StarFieldSubtle } from '@/components/visuals/StarFieldSubtle'
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

  // Уникальные категории для утилитарных меток
  const uniqueCategories = Array.from(
    new Set(products.slice(0, 6).map(p => p.category?.name).filter(Boolean))
  ).slice(0, 3)

  return (
    <section 
      className="py-12 md:py-16 lg:py-20 bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas relative overflow-hidden border-b border-fintage-graphite/20 dark:border-fintage-graphite/30"
      aria-labelledby="featured-heading"
    >
      {/* Менее яркие звезды - только в темной теме */}
      <StarFieldSubtle />
      <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        {/* Заголовок в стиле технического каталога - Nike/Stone Island */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6 mb-6">
            {/* Левая часть: номер секции + заголовок */}
            <div className="flex items-baseline gap-3 md:gap-4">
              {/* Утилитарный номер секции в стиле каталога */}
              <div className="flex-shrink-0">
                <span 
                  className="inline-block text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-mono font-bold text-fintage-graphite/40 dark:text-fintage-graphite/30 leading-none tracking-tighter"
                  aria-hidden="true"
                >
                  01
                </span>
              </div>
              <div>
                <h2 
                  id="featured-heading" 
                  className="text-title-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase"
                >
                  <span suppressHydrationWarning>{t('home.featuredProducts.title')}</span>
                </h2>
                {/* Техническая подпись в стиле Stone Island */}
                <p className="mt-1.5 text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
                  {locale === 'ru' ? 'ОСНОВНАЯ КОЛЛЕКЦИЯ' : 'MAIN COLLECTION'}
                </p>
              </div>
            </div>

            {/* Правая часть: утилитарные метки категорий (только на desktop) */}
            {uniqueCategories.length > 0 && (
              <div className="hidden lg:flex items-center gap-2 flex-wrap">
                {uniqueCategories.map((category, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-[9px] font-mono font-medium text-fintage-graphite/50 dark:text-fintage-graphite/40 uppercase tracking-[0.2em] border border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-offwhite/50 dark:bg-fintage-charcoal/50 backdrop-blur-sm"
                    aria-label={category || undefined}
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Разделительная линия в стиле технических каталогов */}
          <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30" aria-hidden="true" />
        </div>

        {/* Сетка товаров - асимметричная на больших экранах (Stone Island style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {hasProducts ? (
            products.slice(0, 6).map((product) => (
              <div key={product.id}>
                <ProductCard product={product} density="compact" />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-fintage-graphite dark:text-fintage-graphite/70 text-sm font-mono tracking-[0.15em] uppercase py-12">
              {emptyMessage}
            </p>
          )}
        </div>

        {/* CTA в стиле минималистичного Nike - без лишних элементов */}
        <div className="flex flex-col items-center gap-4">
          {/* Разделительная линия перед кнопкой */}
          <div className="w-16 h-px bg-fintage-graphite/30 dark:bg-fintage-graphite/40" aria-hidden="true" />
          
          <Button 
            variant="primary"
            size="lg" 
            asChild
            className="group font-mono tracking-[0.15em]"
          >
            <Link href="/catalog" className="flex items-center gap-2">
              <span suppressHydrationWarning className="uppercase text-xs md:text-sm tracking-[0.15em]">
                {t('catalog.allProducts')}
              </span>
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:translate-x-0.5 transition-fintage" />
            </Link>
          </Button>

          {/* Техническая подпись под кнопкой */}
          <p className="text-[9px] md:text-[10px] font-mono text-fintage-graphite/40 dark:text-fintage-graphite/50 uppercase tracking-[0.2em]">
            {locale === 'ru' ? `${products.length > 0 ? products.length : 0} ИЗДЕЛИЙ` : `${products.length > 0 ? products.length : 0} PIECES`}
          </p>
        </div>
      </div>
    </section>
  )
}

