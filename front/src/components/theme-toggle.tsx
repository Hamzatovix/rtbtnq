'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={mounted ? () => setTheme(theme === 'dark' ? 'light' : 'dark') : undefined}
      className="rounded-full relative hover:bg-sageTint/10 dark:hover:bg-primary/10 transition-colors"
      aria-label={mounted ? (theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему') : 'Переключить тему'}
      suppressHydrationWarning
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-inkSoft dark:text-foreground" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-inkSoft dark:text-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

