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
  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 md:items-center">
        <div className="flex flex-wrap gap-2 md:gap-3 items-center" role="group" aria-label={texts.categoryLabel}>
          <Button
            variant={selectedCategory === '' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onSelectCategory('')}
          >
            {texts.allCategories}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSelectCategory(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:gap-3 md:items-center">
        <div className="flex flex-wrap gap-2 md:gap-3 items-center" role="group" aria-label={texts.colorLabel}>
          <Button
            variant={selectedColor === undefined ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onSelectColor(undefined)}
          >
            {texts.allColors}
          </Button>
          {colors.map((color) => (
            <Button
              key={color.id}
              variant={selectedColor === color.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSelectColor(color.id)}
              className="flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full border border-gray-300"
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
        ease: [0.22, 1, 0.36, 1], // ease-brand
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
      <div className="min-h-screen bg-white dark:bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative">
          <div className="text-center mb-16">
            <div className="h-10 w-48 bg-mistGray/20 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[320px] sm:h-[360px] bg-mistGray/20 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative">
        <div className="text-center mb-16">
          <h1 className="text-display-1 font-light text-ink-soft dark:text-foreground leading-[0.95] mb-6 tracking-normal">
            {t('catalog.title')}
          </h1>
        </div>

        {isMounted && (
          <Sheet>
            <div className="md:hidden mb-10">
              <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="w-full justify-center gap-2 rounded-full shadow-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  {texts.categoryLabel}
                </Button>
              </SheetTrigger>
            </div>
            <SheetContent side="bottom" className="bg-white dark:bg-card rounded-t-3xl shadow-2xl dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] !h-auto max-h-[75vh] w-full px-5 pt-6 pb-10 overflow-y-auto">
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

        <div className="mb-12">
          {(selectedCategory || selectedColor) && (
            <div className="flex justify-center mt-4">
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                {texts.reset}
              </Button>
            </div>
          )}
        </div>

        <div className="hidden md:flex justify-center mb-12">
          <FiltersPanel
            className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-6 justify-center"
            categories={categories}
            colors={colors}
            selectedCategory={selectedCategory}
            selectedColor={selectedColor}
            onSelectCategory={handleSelectCategory}
            onSelectColor={handleSelectColor}
            texts={texts}
          />
        </div>

        <div aria-live="polite">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[320px] sm:h-[360px] bg-mistGray/20 rounded-2xl animate-pulse" />
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
            <div className="text-center py-16">
              <p className="text-body text-ink-soft/70 dark:text-muted-foreground font-light tracking-wide mb-6">
                {t('catalog.empty') || 'товары не найдены'}
              </p>
              <Button variant="outline" onClick={handleResetFilters}>
                {t('catalog.reset') || 'сбросить фильтры'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CatalogClient


