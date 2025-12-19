'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface SheetTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface SheetContentProps {
  side?: 'left' | 'right' | 'top' | 'bottom'
  children: React.ReactNode
  className?: string
}

const SheetContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }, [isControlled, onOpenChange])

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

export function SheetTrigger({ asChild, children }: SheetTriggerProps) {
  const { setOpen } = React.useContext(SheetContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    } as any)
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

export function SheetContent({ side = 'right', children, className = '' }: SheetContentProps) {
  const { open, setOpen } = React.useContext(SheetContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm dark:backdrop-blur-md z-[60]"
            onClick={() => setOpen(false)}
          />
          {/* Content */}
          <motion.div
            initial={side === 'right' ? { x: '100%' } : side === 'left' ? { x: '-100%' } : side === 'top' ? { y: '-100%' } : { y: '100%' }}
            animate={{ x: 0, y: 0 }}
            exit={side === 'right' ? { x: '100%' } : side === 'left' ? { x: '-100%' } : side === 'top' ? { y: '-100%' } : { y: '100%' }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={`fixed z-[61] bg-fintage-offwhite dark:bg-fintage-charcoal border-l border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-elevated ${
              side === 'right' ? 'right-0 h-full' :
              side === 'left' ? 'left-0 h-full' :
              side === 'top' ? 'top-0 left-0 w-full' :
              'bottom-0 left-0 w-full'
            } ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm transition-fintage z-10 border border-transparent hover:border-hover-border dark:hover:border-hover-border"
            >
              <X className="h-5 w-5 text-fintage-charcoal dark:text-fintage-offwhite" />
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

