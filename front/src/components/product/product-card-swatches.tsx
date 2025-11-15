'use client'

import { useEffect, useRef } from 'react'
import { getColorDisplayName } from '@/lib/utils'
import type { CatalogColor } from '@/types/catalog'

type ProductColor = CatalogColor

interface ProductCardSwatchesProps {
  colors: CatalogColor[]
  locale: string
  selectedIndex: number
  swatchSizeClass: string
  gapClass: string
  onSelect: (color: ProductColor, index: number) => void
}

export default function ProductCardSwatches({
  colors = [],
  locale,
  selectedIndex,
  swatchSizeClass,
  gapClass,
  onSelect,
}: ProductCardSwatchesProps) {
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([])
  const isFirstRender = useRef(true)

  useEffect(() => {
    // При смене набора цветов сбрасываем ссылки и отметку первого рендера,
    // чтобы избежать фокуса на элементах предыдущего товара (важно для виртуализации)
    radioRefs.current = []
    isFirstRender.current = true
  }, [colors])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    radioRefs.current[selectedIndex]?.focus()
  }, [selectedIndex])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!colors.length) return

    let nextIndex = selectedIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (selectedIndex + 1) % colors.length
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (selectedIndex - 1 + colors.length) % colors.length
    }

    if (nextIndex !== selectedIndex) {
      const nextColor = colors[nextIndex]
      if (nextColor) {
        onSelect(nextColor, nextIndex)
      }
    }
  }

  if (!colors?.length) {
    return null
  }

  const visibleColors = colors.slice(0, 3)
  const moreCount = colors.length - visibleColors.length

  return (
    <div
      className={`flex ${gapClass}`}
      role="radiogroup"
      aria-label={locale === 'ru' ? 'доступные цвета' : 'available colors'}
      onKeyDown={handleKeyDown}
    >
      {visibleColors.map((color, index) => {
        const checked = index === selectedIndex

        return (
          <button
            key={color.id ?? color.name ?? index}
            ref={(el) => {
              radioRefs.current[index] = el
            }}
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onSelect(color, index)
            }}
            className={`${swatchSizeClass} rounded-full border-2 shadow-warm transition-transform duration-250 ease-brand focus:outline-none focus:ring-2 focus:ring-sageTint dark:focus:ring-primary ${
              checked ? 'ring-2 ring-sageTint dark:ring-primary scale-110 shadow-medium' : 'border-mistGray/30 dark:border-border hover:border-mistGray/50 dark:hover:border-border/60 hover:scale-110'
            }`}
            style={{ backgroundColor: color.hex_code }}
            title={
              (locale === 'ru'
                ? `цвет: ${getColorDisplayName(color.name, 'ru')}`
                : `color: ${color.name}`) + (checked ? (locale === 'ru' ? ' (выбран)' : ' (selected)') : '')
            }
            aria-label={
              (locale === 'ru'
                ? `вариант цвета: ${getColorDisplayName(color.name, 'ru')}`
                : `color option: ${color.name}`) + (checked ? (locale === 'ru' ? ' (выбран)' : ' (selected)') : '')
            }
          />
        )
      })}

      {moreCount > 0 && (
        <div
          className={`${swatchSizeClass} rounded-full border-2 flex items-center justify-center text-[10px] font-medium text-muted-foreground shadow-warm bg-roseBeige dark:bg-card border-mistGray/30 dark:border-border`}
          role="img"
          aria-label={locale === 'ru' ? `ещё ${moreCount} цветов доступно` : `${moreCount} more colors available`}
        >
          +{moreCount}
        </div>
      )}
    </div>
  )
}

