'use client'

import { ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardCartButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  ariaLabel: string
  className?: string
}

export default function ProductCardCartButton({ onClick, ariaLabel, className }: ProductCardCartButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-roseBeige/30 dark:hover:bg-muted/30 h-9 w-9 rounded-full md:backdrop-blur-md shadow-warm bg-roseBeige/80 dark:bg-card/80 border-mistGray/30 dark:border-border text-inkSoft dark:text-foreground hover:scale-110 transition-transform duration-250 ease-brand',
        className,
      )}
    >
      <ShoppingBag className="h-4 w-4" />
    </button>
  )
}

