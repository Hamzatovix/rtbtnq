'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardQuickActionsProps {
  favorite: boolean
  onToggleFavorite: (event: React.MouseEvent<HTMLButtonElement>) => void
  positionClass: string
  isCompact?: boolean
}

export default function ProductCardQuickActions({
  favorite,
  onToggleFavorite,
  positionClass,
  isCompact = false,
}: ProductCardQuickActionsProps) {
  const buttonSize = isCompact ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-9 w-9'
  const iconSize = isCompact ? 'h-3 w-3 sm:h-3.5 sm:w-3.5' : 'h-4 w-4'
  const spaceY = isCompact ? 'space-y-1.5 sm:space-y-2' : 'space-y-2.5'
  
  return (
    <div className={cn('absolute flex flex-col opacity-100 transition-all duration-250 z-10', positionClass, spaceY)}>
      <button
        type="button"
        aria-label={favorite ? 'убрать из избранного' : 'в избранное'}
        aria-pressed={favorite}
        onClick={onToggleFavorite}
        className={cn(
          'group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-roseBeige/30 dark:hover:bg-muted/30 rounded-full md:backdrop-blur-md shadow-warm bg-roseBeige/80 dark:bg-card/80 border-mistGray/30 dark:border-border text-inkSoft dark:text-foreground hover:scale-110 transition-transform duration-250 ease-brand',
          buttonSize
        )}
      >
        <Heart className={iconSize} fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} />
      </button>
    </div>
  )
}

