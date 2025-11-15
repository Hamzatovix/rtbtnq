'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

export type MobileDrawerProps = {
  open: boolean
  onClose: () => void
  title?: string
  id?: string
  children: React.ReactNode
}

/**
 * Mobile slide-out drawer component.
 * Renders in a portal to document.body.
 * Features:
 * - Slide-in animation from right (Framer Motion)
 * - Backdrop with click-to-close
 * - Focus trap management
 * - ESC key to close
 * - Closes on route change
 * - Respects prefers-reduced-motion
 * - ARIA attributes for accessibility
 */
export function MobileDrawer({ open, onClose, title = 'Menu', id, children }: MobileDrawerProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const reducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement | null>(null)

  useLockBodyScroll(open)

  // Mount check for SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on pathname change
  useEffect(() => {
    if (open) {
      onClose()
    }
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus trap: focus first element on open, restore on close
  useEffect(() => {
    if (!open || !mounted) return

    const panel = panelRef.current
    if (!panel) return

    // Get first focusable element
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const focusableElements = panel.querySelectorAll<HTMLElement>(focusableSelectors)
    const firstElement = focusableElements[0]

    if (firstElement) {
      firstFocusableRef.current = firstElement
      firstElement.focus()
    }

    // Handle Tab key to trap focus
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (focusableElements.length === 0) {
        e.preventDefault()
        return
      }

      const firstEl = focusableElements[0]
      const lastEl = focusableElements[focusableElements.length - 1]

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

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [open, mounted])

  // ESC key handler
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!mounted) return null

  const drawerId = id || 'mobile-drawer'
  const motionConfig = reducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionConfig}
            className="fixed inset-0 z-[59] bg-black/40 md:hidden dark:bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={panelRef}
            initial={reducedMotion ? {} : { x: '100%', opacity: 0 }}
            animate={reducedMotion ? {} : { x: 0, opacity: 1 }}
            exit={reducedMotion ? {} : { x: '100%', opacity: 0 }}
            transition={{
              ...motionConfig,
              opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${drawerId}-label`}
            id={drawerId}
            className="fixed right-0 top-0 z-[60] h-dvh w-[min(88vw,380px)] bg-gradient-to-b from-white via-white to-white/95 dark:from-card dark:via-card dark:to-card/98 border-l border-mistGray/20 dark:border-border backdrop-blur-xl dark:backdrop-blur-xl shadow-2xl dark:shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-y-auto will-change-[transform,opacity]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Декоративный градиент сверху */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sageTint/5 dark:from-primary/5 to-transparent pointer-events-none" aria-hidden="true" />
            
            {/* Header */}
            <div className="relative flex items-center justify-between mb-6 pt-8 pb-4 px-5 border-b border-mistGray/10 dark:border-border/50">
              <h2 id={`${drawerId}-label`} className="text-title-1 font-light text-inkSoft dark:text-foreground tracking-wide">
                {title}
              </h2>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-mistGray/20 dark:border-border bg-white/50 dark:bg-card/50 backdrop-blur-sm hover:bg-mistGray/10 dark:hover:bg-muted/30 transition-all duration-300 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-95 hover:scale-105"
              >
                <X className="h-5 w-5 text-inkSoft dark:text-foreground transition-transform duration-300 group-hover:rotate-90" />
              </button>
            </div>

            {/* Content */}
            <div className="relative flex flex-col flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

