'use client'

import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardCartButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  ariaLabel: string
  className?: string
  isCompact?: boolean
  disabled?: boolean
  showHelperText?: boolean
  helperText?: string
  locale?: string
}

export default function ProductCardCartButton({ 
  onClick, 
  ariaLabel, 
  className, 
  isCompact = false,
  disabled = false,
  showHelperText = false,
  helperText,
  locale = 'ru'
}: ProductCardCartButtonProps) {
  const buttonSize = isCompact ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-9 w-9'
  const iconSize = isCompact ? 'h-3 w-3 sm:h-3.5 sm:w-3.5' : 'h-4 w-4'
  
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm md:backdrop-blur-md shadow-fintage-sm bg-fintage-offwhite dark:bg-fintage-charcoal border border-accent dark:border-accent text-fintage-charcoal dark:!text-fintage-offwhite hover:scale-110 hover:shadow-fintage-md hover:border-accent/80 dark:hover:border-accent/80 active:scale-105 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          disabled && 'hover:scale-100 hover:shadow-fintage-sm',
          buttonSize,
          className,
        )}
      >
        <ShoppingBag className={iconSize} />
      </button>
      {showHelperText && helperText && (
        <p className="text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.1em] text-right">
          {helperText}
        </p>
      )}
    </div>
  )
}

