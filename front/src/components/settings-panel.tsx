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
import { MOBILE_MENU_CONFIG } from '@/components/layout/mobile-menu.constants'

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
    : { 
        duration: MOBILE_MENU_CONFIG.ANIMATION_DURATION, 
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
      }

  const panelContent = mounted && open ? (
    <AnimatePresence>
      <>
        {/* Backdrop - должен быть первым и ниже панели */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={motionConfig}
          className="fixed inset-0 z-[59] bg-black/10 dark:bg-black/20"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        {/* Panel - технический стиль Stone Island / North Face */}
        <motion.div
          ref={panelRef}
          initial={reducedMotion ? {} : { opacity: 0, y: -8, scale: 0.98 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? {} : { opacity: 0, y: -8, scale: 0.98 }}
          transition={motionConfig}
          className="fixed right-4 top-20 z-[60] w-[170px] border-2 border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-offwhite dark:bg-fintage-charcoal shadow-fintage-md p-3"
          role="dialog"
          aria-modal="true"
          aria-label={t('common.settings')}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header - технический стиль */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-fintage-graphite/20 dark:border-fintage-graphite/30">
            <span className="text-[10px] font-mono font-semibold text-fintage-graphite/70 dark:text-fintage-graphite/60 uppercase tracking-[0.25em]">
              {t('common.settings')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-7 w-7 rounded-sm hover:bg-hover-bg dark:hover:bg-hover-bg border border-transparent hover:border-hover-border dark:hover:border-hover-border transition-fintage active:scale-95"
              aria-label={t('common.closeSettings')}
            >
              <X className="h-3.5 w-3.5 text-fintage-charcoal dark:text-fintage-offwhite" />
            </Button>
          </div>

          {/* Settings Content - технический стиль */}
          <div className="flex flex-col gap-2">
            {/* Theme Toggle */}
            <div className="group flex flex-col items-center gap-1.5 rounded-sm border-2 border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 hover:bg-hover-bg dark:hover:bg-hover-bg hover:border-hover-border dark:hover:border-hover-border transition-fintage p-2.5">
              <div className="flex items-center justify-center scale-90">
                <ThemeToggle />
              </div>
              <span className="text-[9px] font-mono font-medium text-fintage-graphite/70 dark:text-fintage-graphite/60 group-hover:text-accent transition-fintage uppercase tracking-[0.2em]">
                {t('common.theme')}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="group flex flex-col items-center gap-1.5 rounded-sm border-2 border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 hover:bg-hover-bg dark:hover:bg-hover-bg hover:border-hover-border dark:hover:border-hover-border transition-fintage p-2.5">
              <div className="flex items-center justify-center scale-90">
                <LocaleSwitcher />
              </div>
              <span className="text-[9px] font-mono font-medium text-fintage-graphite/70 dark:text-fintage-graphite/60 group-hover:text-accent transition-fintage uppercase tracking-[0.2em]">
                {t('common.language')}
              </span>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  ) : null

  return (
    <>
      {/* Trigger Button - технический стиль */}
      <Button
        variant="ghost"
        size="icon"
        onClick={mounted ? () => setOpen(true) : undefined}
        className="relative hover:bg-hover-bg dark:hover:bg-hover-bg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm h-9 w-9 lg:h-10 lg:w-10 border border-transparent hover:border-hover-border dark:hover:border-hover-border active:scale-[0.97] active:opacity-90"
        aria-label={t('common.settings')}
        aria-expanded={open}
        suppressHydrationWarning
      >
        <Settings className={`h-4 w-4 lg:h-5 lg:w-5 text-fintage-charcoal dark:text-fintage-offwhite transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
      </Button>

      {/* Settings Panel - рендерится в портале только после монтирования */}
      {mounted && panelContent ? createPortal(panelContent, document.body) : null}
    </>
  )
}

