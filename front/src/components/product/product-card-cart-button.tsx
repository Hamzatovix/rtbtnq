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
        'group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-roseBeige/30 dark:hover:bg-muted/30 rounded-full md:backdrop-blur-md shadow-warm bg-roseBeige/80 dark:bg-card/80 border-mistGray/30 dark:border-border text-inkSoft dark:text-foreground hover:scale-110 transition-transform duration-250 ease-brand',
        buttonSize,
        className,
      )}
    >
      <ShoppingBag className={iconSize} />
    </button>
  )
}

