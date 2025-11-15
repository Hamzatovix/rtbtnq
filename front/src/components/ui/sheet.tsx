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
            className="fixed inset-0 bg-black/20 dark:bg-black/50 z-[60]"
            onClick={() => setOpen(false)}
          />
          {/* Content */}
          <motion.div
            initial={side === 'right' ? { x: '100%' } : side === 'left' ? { x: '-100%' } : side === 'top' ? { y: '-100%' } : { y: '100%' }}
            animate={{ x: 0, y: 0 }}
            exit={side === 'right' ? { x: '100%' } : side === 'left' ? { x: '-100%' } : side === 'top' ? { y: '-100%' } : { y: '100%' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed z-[61] ${
              side === 'right' ? 'right-0 h-full' :
              side === 'left' ? 'left-0 h-full' :
              side === 'top' ? 'top-0 left-0 w-full' :
              'bottom-0 left-0 w-full'
            } ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-mistGray/20 dark:hover:bg-muted/30 rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5 text-inkSoft dark:text-foreground" />
            </button>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

