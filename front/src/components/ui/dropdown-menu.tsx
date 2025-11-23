'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
})

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface DropdownMenuContentProps {
  align?: 'start' | 'end' | 'center'
  side?: 'top' | 'bottom'
  sideOffset?: number
  children: React.ReactNode
  className?: string
}

interface DropdownMenuItemProps {
  asChild?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown-menu]')) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as any)
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  align = 'start',
  side = 'bottom',
  sideOffset = 8,
  children,
  className = '',
}: DropdownMenuContentProps) {
  const { open } = React.useContext(DropdownMenuContext)

  if (!open) return null

  const positionClass =
    align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'
  const verticalClass = side === 'top' ? 'bottom-full' : 'top-full'
  const offsetStyle =
    side === 'top' ? { marginBottom: sideOffset } : { marginTop: sideOffset }

  return (
    <div
      className={`absolute ${positionClass} ${verticalClass} bg-fintage-offwhite dark:bg-fintage-charcoal border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm shadow-fintage-md py-2 z-[55] ${className}`}
      style={offsetStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ asChild, children, className = '', onClick }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      className: `block w-full text-left px-4 py-2 text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage ${className}`,
      onClick: (e: React.MouseEvent) => {
        handleClick()
        if (child.props && typeof (child.props as any).onClick === 'function') {
          ;(child.props as any).onClick(e)
        }
      },
    } as any)
  }

  return (
    <div
      className={`block w-full text-left px-4 py-2 text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

