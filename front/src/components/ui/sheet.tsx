'use client'

import * as React from 'react'
import { X } from 'lucide-react'

interface SheetProps {
  children: React.ReactNode
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

export function Sheet({ children }: SheetProps) {
  const [open, setOpen] = React.useState(false)

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

  if (!open) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setOpen(false)}
      />
      <div 
        className={`fixed z-50 ${
          side === 'right' ? 'right-0 top-0 h-full w-80' :
          side === 'left' ? 'left-0 top-0 h-full w-80' :
          side === 'top' ? 'top-0 left-0 w-full h-80' :
          'bottom-0 left-0 w-full h-80'
        } ${className}`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-mistGray/20 rounded-full"
        >
          <X className="h-5 w-5 text-inkSoft" />
        </button>
        {children}
      </div>
    </>
  )
}

