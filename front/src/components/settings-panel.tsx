'use client'

import { useState, useEffect, useRef } from 'react'
import { Settings, X } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { LocaleSwitcher } from './i18n/locale-switcher'
import { useTranslations } from '@/hooks/useTranslations'
import { Button } from './ui/button'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

export function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations()
  const reducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)

  useLockBodyScroll(open)

  // Mount check for SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on ESC key
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  // Focus trap: focus first element on open
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
      // Small delay to ensure panel is fully rendered
      setTimeout(() => {
        firstElement.focus()
      }, 100)
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

  const motionConfig = reducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }

  const panelContent = mounted && open ? (
    <AnimatePresence>
      <>
        {/* Backdrop - должен быть первым и ниже панели */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={motionConfig}
          className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        {/* Panel - должна быть выше backdrop */}
        <motion.div
          ref={panelRef}
          initial={reducedMotion ? {} : { opacity: 0, y: -10, scale: 0.95 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? {} : { opacity: 0, y: -10, scale: 0.95 }}
          transition={motionConfig}
          className="fixed right-4 top-24 z-[60] w-auto rounded-xl border border-mistGray/20 dark:border-border bg-white dark:bg-card shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3"
          role="dialog"
          aria-modal="true"
          aria-label="Настройки"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-end mb-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6 rounded-full hover:bg-mistGray/10 dark:hover:bg-muted/30"
              aria-label="Закрыть настройки"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Settings Content */}
          <div className="flex flex-col gap-2">
            {/* Theme Toggle */}
            <div className="flex items-center justify-center rounded-lg border border-mistGray/20 dark:border-border bg-mistGray/5 dark:bg-muted/10 p-2">
              <ThemeToggle />
            </div>

            {/* Language Switcher */}
            <div className="flex items-center justify-center rounded-lg border border-mistGray/20 dark:border-border bg-mistGray/5 dark:bg-muted/10 p-2">
              <LocaleSwitcher />
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  ) : null

  return (
    <>
      {/* Trigger Button - всегда рендерится одинаково */}
      <Button
        variant="ghost"
        size="icon"
        onClick={mounted ? () => setOpen(true) : undefined}
        className="rounded-full hover:bg-sageTint/5 dark:hover:bg-muted/20 transition-all duration-500 ease-out"
        aria-label="Настройки"
        suppressHydrationWarning
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Settings Panel - рендерится в портале только после монтирования */}
      {mounted && panelContent ? createPortal(panelContent, document.body) : null}
    </>
  )
}

