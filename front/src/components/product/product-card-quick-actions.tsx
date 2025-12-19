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
          'group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring dark:focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm md:backdrop-blur-md shadow-fintage-sm bg-fintage-offwhite/90 dark:bg-fintage-charcoal/90 border border-fintage-graphite/20 dark:border-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite hover:scale-110 hover:shadow-fintage-md active:scale-105 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          buttonSize
        )}
      >
        <Heart className={iconSize} fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} />
      </button>
    </div>
  )
}

