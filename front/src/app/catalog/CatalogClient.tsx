'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'
import { SlidersHorizontal } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import type { CatalogData, CatalogProduct, CatalogColor } from '@/types/catalog'
import type { Category } from '@/types'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { useIsCoarsePointer } from '@/hooks/useIsCoarsePointer'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'

interface CatalogClientProps {
  initialData: CatalogData
  initialFilters: {
    category?: string
    color?: string
  }
}

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((res) => res.json())

interface FiltersTexts {
  categoryLabel: string
  colorLabel: string
  allCategories: string
  allColors: string
  reset: string
}

interface FiltersPanelProps {
  categories: Category[]
  colors: CatalogColor[]
  selectedCategory: string
  selectedColor?: string
  onSelectCategory: (slug: string) => void
  onSelectColor: (colorId: string | undefined) => void
  texts: FiltersTexts
  className?: string
}

const FiltersPanel = ({
  categories,
  colors,
  selectedCategory,
  selectedColor,
  onSelectCategory,
  onSelectColor,
  texts,
  className = '',
}: FiltersPanelProps) => {
  const locale = useClientLocale()
  
  return (
    <div className={className}>
      {/* Категории - технический стиль */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="mb-1">
          <span className="text-[9px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/40 uppercase tracking-[0.2em]">
            {texts.categoryLabel || (locale === 'ru' ? 'КАТЕГОРИИ' : 'CATEGORIES')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center" role="group" aria-label={texts.categoryLabel}>
          <Button
            variant={selectedCategory === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory('')}
            className="font-mono tracking-[0.15em] text-xs uppercase"
          >
            {texts.allCategories}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSelectCategory(category.slug)}
              className="font-mono tracking-[0.15em] text-xs uppercase"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Цвета - технический стиль */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="mb-1">
          <span className="text-[9px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/40 uppercase tracking-[0.2em]">
            {texts.colorLabel || (locale === 'ru' ? 'ЦВЕТА' : 'COLORS')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center" role="group" aria-label={texts.colorLabel}>
          <Button
            variant={selectedColor === undefined ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onSelectColor(undefined)}
            className="font-mono tracking-[0.15em] text-xs uppercase"
          >
            {texts.allColors}
          </Button>
          {colors.map((color) => (
            <Button
              key={color.id}
              variant={selectedColor === color.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSelectColor(color.id)}
              className="flex items-center gap-2 font-mono tracking-[0.15em] text-xs uppercase"
            >
              <span
                className="w-3 h-3 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/50"
                style={{ backgroundColor: color.hex_code }}
              />
              {color.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ProductGridProps {
  products: CatalogProduct[]
  isCoarsePointer: boolean
  filterKey: string // Ключ для пересоздания анимации при изменении фильтров
}

interface VirtualizedProductGridProps extends ProductGridProps {
  windowWidth: number
}

const DefaultProductGrid = ({ products, isCoarsePointer, filterKey }: ProductGridProps) => {
  // Stagger анимация для последовательного появления карточек
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // ease-brand
    },
  },
}

  if (isCoarsePointer) {
    // Мобильная версия - без hover эффектов, с stagger анимацией
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={filterKey}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    )
  }

  // Desktop версия - без двойной анимации подъема (убрана из CatalogClient)
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={filterKey}
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

const VirtualizedProductGrid = ({ products, isCoarsePointer, windowWidth, filterKey }: VirtualizedProductGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setContainerWidth(entry.contentRect.width)
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const columnCount = useMemo(() => {
    if (windowWidth >= 1024) return 4
    if (windowWidth >= 768) return 3
    return 2
  }, [windowWidth])

  const columnGap = useMemo(() => {
    if (windowWidth >= 1024) return 32
    if (windowWidth >= 768) return 24
    if (windowWidth >= 640) return 16
    return 12
  }, [windowWidth])

  const rowGap = columnGap
  const availableWidth = containerWidth > 0 ? containerWidth - columnGap * (columnCount - 1) : 0
  const cardWidth = availableWidth > 0 ? availableWidth / columnCount : 0
  const textAllowance = isCoarsePointer ? 190 : 150
  const cardHeight = cardWidth > 0 ? cardWidth + textAllowance : 0
  const rowHeight = cardHeight + rowGap
  const rowCount = Math.ceil(products.length / columnCount)
  const shouldVirtualize = containerWidth > 0 && cardWidth > 0 && products.length > columnCount * 3

  if (!shouldVirtualize) {
    return <DefaultProductGrid products={products} isCoarsePointer={isCoarsePointer} filterKey={filterKey} />
  }

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight,
    overscan: 4,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const totalHeight = virtualizer.getTotalSize()

  return (
    <div ref={containerRef} className="relative" style={{ minHeight: totalHeight }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualRows.map((virtualRow) => {
          const rowIndex = virtualRow.index
          const startIndex = rowIndex * columnCount
          const rowItems = products.slice(startIndex, startIndex + columnCount)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: rowIndex === rowCount - 1 ? 0 : rowGap,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                  gap: columnGap,
                }}
              >
                {rowItems.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function CatalogClient({ initialData, initialFilters }: CatalogClientProps) {
  const t = useTranslations()
  const locale = useClientLocale()
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category ?? '')
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialFilters.color)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.append('category', selectedCategory)
    if (selectedColor) params.append('color', selectedColor)
    const query = params.toString()
    return query ? `?${query}` : ''
  }, [selectedCategory, selectedColor])

  const { data, isLoading } = useSWR<CatalogData>(
    `/api/catalog${queryString}`,
    fetcher,
    {
      fallbackData: initialData,
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  )

  const products = data?.products ?? []
  const categories = data?.categories ?? []
  const colors = data?.colors ?? []

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    if (isLoading) return
    const settleToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
    settleToTop()
    const rafId = requestAnimationFrame(settleToTop)
    const timeoutId = window.setTimeout(settleToTop, 0)
    return () => {
      cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
    }
  }, [isMounted, isLoading, selectedCategory, selectedColor])

  const detectedCoarsePointer = useIsCoarsePointer()
  const coarsePointer = isMounted ? detectedCoarsePointer : false
  const { width: windowWidth } = useWindowSize()
  const virtualizationEnabled = isMounted && !isLoading && products.length > 20

  const texts = useMemo(
    () => ({
      categoryLabel: t('catalog.categoryLabel') || 'категория:',
      colorLabel: t('catalog.colorLabel') || 'цвет:',
      allCategories: t('catalog.allCategories'),
      allColors: t('catalog.allColors'),
      reset: t('catalog.reset') || 'сбросить',
    }),
    [t],
  )

  const handleSelectCategory = useCallback((slug: string) => {
    setSelectedCategory(slug)
  }, [])

  const handleSelectColor = useCallback((colorId: string | undefined) => {
    setSelectedColor(colorId)
  }, [])

  const handleResetFilters = useCallback(() => {
    setSelectedCategory('')
    setSelectedColor(undefined)
  }, [])

  const isLoadingProducts = isLoading && products.length === 0

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-20 lg:py-24 relative z-10">
          <div className="text-center mb-16">
            <div className="h-10 w-48 bg-fintage-graphite/20 rounded-sm mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[320px] sm:h-[360px] bg-fintage-graphite/10 rounded-sm animate-pulse border border-fintage-graphite/20 dark:border-fintage-graphite/30" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-20 lg:py-24 relative z-10">
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
                <h1 
                  className="text-title-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] tracking-tighter uppercase"
                >
                  <span suppressHydrationWarning>{t('catalog.title')}</span>
                </h1>
                {/* Техническая подпись в стиле Stone Island */}
                <p className="mt-1.5 text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
                  {locale === 'ru' ? 'ПОЛНЫЙ КАТАЛОГ' : 'FULL CATALOG'}
                </p>
              </div>
            </div>
          </div>

          {/* Разделительная линия в стиле технических каталогов */}
          <div className="h-px bg-gradient-to-r from-transparent via-fintage-graphite/20 to-transparent dark:via-fintage-graphite/30" aria-hidden="true" />
        </div>

        {isMounted && (
          <Sheet>
            <div className="md:hidden mb-10">
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="w-full justify-center gap-2 rounded-sm shadow-fintage-sm font-mono tracking-[0.15em] text-xs uppercase">
                  <SlidersHorizontal className="h-4 w-4" />
                  {texts.categoryLabel || (locale === 'ru' ? 'ФИЛЬТРЫ' : 'FILTERS')}
                </Button>
              </SheetTrigger>
            </div>
            <SheetContent side="bottom" className="bg-fintage-offwhite dark:bg-fintage-charcoal border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-t-sm shadow-fintage-md !h-auto max-h-[75vh] w-full px-5 pt-6 pb-10 overflow-y-auto">
              <FiltersPanel
                className="flex flex-col gap-6"
                categories={categories}
                colors={colors}
                selectedCategory={selectedCategory}
                selectedColor={selectedColor}
                onSelectCategory={handleSelectCategory}
                onSelectColor={handleSelectColor}
                texts={texts}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Фильтры - технический стиль */}
        <div className="mb-12 md:mb-16">
          <div className="hidden md:flex flex-col md:flex-row md:flex-wrap gap-6 md:gap-8 justify-center items-start md:items-center">
            <FiltersPanel
              className="flex flex-col md:flex-row md:flex-wrap gap-6 md:gap-8"
              categories={categories}
              colors={colors}
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              onSelectCategory={handleSelectCategory}
              onSelectColor={handleSelectColor}
              texts={texts}
            />
          </div>
          
          {(selectedCategory || selectedColor) && (
            <div className="flex justify-center mt-6 md:mt-8">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="font-mono tracking-[0.15em] text-xs uppercase"
              >
                {texts.reset}
              </Button>
            </div>
          )}
        </div>

        <div aria-live="polite">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[320px] sm:h-[360px] bg-fintage-graphite/10 rounded-sm animate-pulse border border-fintage-graphite/20 dark:border-fintage-graphite/30" />
              ))}
            </div>
          ) : products.length > 0 ? (
            virtualizationEnabled ? (
              <VirtualizedProductGrid
                products={products}
                isCoarsePointer={coarsePointer}
                windowWidth={windowWidth}
                filterKey={queryString}
              />
            ) : (
              <DefaultProductGrid products={products} isCoarsePointer={coarsePointer} filterKey={queryString} />
            )
          ) : (
            <div className="text-center py-16 md:py-20">
              <p className="text-sm md:text-base font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] mb-6">
                {t('catalog.empty') || (locale === 'ru' ? 'товары не найдены' : 'no products found')}
              </p>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="font-mono tracking-[0.15em] text-xs uppercase"
              >
                {t('catalog.reset') || (locale === 'ru' ? 'сбросить фильтры' : 'reset filters')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CatalogClient


