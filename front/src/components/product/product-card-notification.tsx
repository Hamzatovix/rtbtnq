'use client'

import { cn } from '@/lib/utils'

interface ProductCardNotificationProps {
  message: string
  visible: boolean
  className?: string
}

export default function ProductCardNotification({ message, visible, className }: ProductCardNotificationProps) {
  return (
    <div
      className={cn(
        'absolute z-20 bg-fintage-steel text-fintage-offwhite dark:text-fintage-charcoal px-3 py-1.5 md:px-4 md:py-2 rounded-sm text-xs md:text-sm font-medium backdrop-blur-md shadow-fintage-md border border-fintage-steel transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top-left uppercase tracking-wider',
        visible
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}

