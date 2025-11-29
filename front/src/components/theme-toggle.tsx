'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      type="button"
      onClick={mounted ? () => setTheme(theme === 'dark' ? 'light' : 'dark') : undefined}
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80 relative"
      aria-label={mounted ? (theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему') : 'Переключить тему'}
      suppressHydrationWarning
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-fintage-charcoal dark:text-fintage-offwhite" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-fintage-charcoal dark:text-fintage-offwhite" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

