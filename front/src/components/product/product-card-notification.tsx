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
        'absolute z-20 bg-sageTint text-linenWhite px-4 py-2 rounded-full text-sm font-light backdrop-blur-md shadow-warm border border-mistGray/30 transition-all duration-200 ease-out origin-top-left',
        visible ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}

