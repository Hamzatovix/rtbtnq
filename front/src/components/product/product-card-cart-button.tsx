'use client'

import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardCartButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  ariaLabel: string
  className?: string
  isCompact?: boolean
}

export default function ProductCardCartButton({ onClick, ariaLabel, className, isCompact = false }: ProductCardCartButtonProps) {
  const buttonSize = isCompact ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-9 w-9'
  const iconSize = isCompact ? 'h-3 w-3 sm:h-3.5 sm:w-3.5' : 'h-4 w-4'
  
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm md:backdrop-blur-md shadow-fintage-sm bg-fintage-offwhite dark:bg-fintage-charcoal border border-accent dark:border-accent text-fintage-charcoal dark:!text-fintage-offwhite hover:scale-110 hover:shadow-fintage-md hover:border-accent/80 dark:hover:border-accent/80 active:scale-105 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        buttonSize,
        className,
      )}
    >
      <ShoppingBag className={iconSize} />
    </button>
  )
}

