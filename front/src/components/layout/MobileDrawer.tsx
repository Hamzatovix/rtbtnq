'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { MOBILE_MENU_CONFIG } from './mobile-menu.constants'

export type MobileDrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  id?: string
  children: React.ReactNode
  /** Ref на кнопку открытия меню для восстановления фокуса */
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

/**
 * Mobile slide-out drawer component.
 * Renders in a portal to document.body.
 * Features:
 * - Soft slide-in animation from slightly above (under header)
 * - Styled to match header appearance
 * - Swipe gesture to close (swipe down) - native mobile behavior
 * - Focus trap management
 * - Multiple ways to close:
 *   - ESC key
 *   - Click on backdrop (area below menu)
 *   - Swipe down gesture
 *   - Click on navigation links
 *   - Click on action buttons (cart, favorites)
 *   - Automatically closes on route change
 * - Respects prefers-reduced-motion
 * - ARIA attributes for accessibility
 */
export function MobileDrawer({ open, onClose, title = 'Menu', id, children, triggerRef }: MobileDrawerProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement | null>(null)
  const focusableElementsRef = useRef<NodeListOf<HTMLElement> | null>(null)
  
  // Motion values for swipe gesture (downward drag)
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 100], [1, 0])
  const [isDragging, setIsDragging] = useState(false)

  useLockBodyScroll(open)

  // Mount check for SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset motion values when menu closes
  useEffect(() => {
    if (!open) {
      y.set(0)
      setIsDragging(false)
    }
  }, [open, y])

  // Close on pathname change and restore focus
  useEffect(() => {
    if (open) {
      onClose()
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Восстановление фокуса после закрытия меню
  useEffect(() => {
    if (!open && triggerRef?.current) {
      // Небольшая задержка для завершения анимации закрытия
      const timeoutId = setTimeout(() => {
        triggerRef.current?.focus()
      }, MOBILE_MENU_CONFIG.ANIMATION_DURATION * 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [open, triggerRef])

  // Объединенный useEffect для keyboard navigation и focus trap
  useEffect(() => {
    if (!open || !mounted) return

    const panel = panelRef.current
    if (!panel) return

    // Get focusable elements (кешируем для оптимизации)
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const focusableElements = panel.querySelectorAll<HTMLElement>(focusableSelectors)
    focusableElementsRef.current = focusableElements
    const firstElement = focusableElements[0]

    if (firstElement) {
      firstFocusableRef.current = firstElement
      // Delay focus to allow animation to complete
      setTimeout(() => firstElement.focus(), MOBILE_MENU_CONFIG.FOCUS_DELAY)
    }

    // Handle Tab key to trap focus
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const elements = focusableElementsRef.current
      if (!elements || elements.length === 0) {
        e.preventDefault()
        return
      }

      const firstEl = elements[0]
      const lastEl = elements[elements.length - 1]

      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    // Handle ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleTab)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleTab)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open, mounted, onClose])

  // Handle swipe gesture - swipe down to close (native mobile behavior)
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = MOBILE_MENU_CONFIG.SWIPE_THRESHOLD
    const velocity = info.velocity.y

    // Close on swipe down (positive y values)
    if (info.offset.y > threshold || velocity > MOBILE_MENU_CONFIG.SWIPE_VELOCITY) {
      // Swipe down - close menu
      onClose()
    } else {
      // Return to original position
      y.set(0)
    }
    setIsDragging(false)
  }

  // Constrain drag to downward direction only
  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only allow dragging down (positive y values)
    // Prevent dragging up (negative y values)
    if (info.offset.y < 0) {
      y.set(0)
    }
  }

  if (!mounted) return null

  const drawerId = id || 'mobile-drawer'
  const headerHeight = MOBILE_MENU_CONFIG.HEADER_HEIGHT
  const motionConfig = reducedMotion
    ? { duration: 0 }
    : { 
        duration: MOBILE_MENU_CONFIG.ANIMATION_DURATION, 
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
      }

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - под меню для закрытия при клике */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ top: `${headerHeight}px` }}
            className="fixed inset-0 z-[48] bg-black/20 dark:bg-black/30 md:hidden backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel - под хедером */}
          <motion.div
            ref={panelRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: Infinity }}
            dragElastic={{ top: 0, bottom: MOBILE_MENU_CONFIG.DRAG_ELASTIC }}
            onDragStart={() => setIsDragging(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{
              top: `${headerHeight}px`,
              ...(isDragging ? { y, opacity } : {}),
            }}
            initial={reducedMotion ? {} : { y: -16, opacity: 0 }}
            animate={reducedMotion || isDragging ? {} : { y: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { y: -16, opacity: 0 }}
            transition={isDragging ? { duration: 0 } : motionConfig}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Mobile menu'}
            id={drawerId}
            className="fixed left-0 right-0 z-[49] w-full bg-fintage-offwhite dark:bg-fintage-charcoal border-b border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-md will-change-[transform,opacity]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Container с контентом */}
            <div className="container mx-auto px-3 md:px-6 lg:px-8">
              {/* Content */}
              <div className="relative flex flex-col pb-6 pt-3 max-h-[calc(100vh-64px)] overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
