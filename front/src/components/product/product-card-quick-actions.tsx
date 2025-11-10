'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCardQuickActionsProps {
  favorite: boolean
  onToggleFavorite: (event: React.MouseEvent<HTMLButtonElement>) => void
  positionClass: string
}

export default function ProductCardQuickActions({
  favorite,
  onToggleFavorite,
  positionClass,
}: ProductCardQuickActionsProps) {
  return (
    <div className={cn('absolute flex flex-col space-y-2.5 opacity-100 transition-all duration-250 z-10', positionClass)}>
      <button
        type="button"
        aria-label={favorite ? 'убрать из избранного' : 'в избранное'}
        aria-pressed={favorite}
        onClick={onToggleFavorite}
        className="group inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-roseBeige/30 h-9 w-9 rounded-full md:backdrop-blur-md shadow-warm bg-roseBeige/80 border-mistGray/30 text-inkSoft hover:scale-110 transition-transform duration-250 ease-brand"
      >
        <Heart className="h-4 w-4" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} />
      </button>
    </div>
  )
}

