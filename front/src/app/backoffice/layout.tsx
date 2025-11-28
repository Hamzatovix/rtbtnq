"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, memo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  Settings,
  LogOut,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LocaleSwitcher } from "@/components/i18n/locale-switcher"
import { MobileDrawer } from "@/components/layout/MobileDrawer"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname?.startsWith(href)
  return (
    <Link
      href={href}
      className="text-fintage-charcoal/70 dark:text-fintage-offwhite/70 hover:text-accent dark:hover:text-accent transition-fintage font-mono text-xs tracking-[0.15em] uppercase relative group"
    >
      <span>{children}</span>
      <span
        className={
          "absolute -bottom-2 left-0 h-px w-0 bg-gradient-to-r from-accent to-transparent transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] " +
          (active ? "!w-full" : "group-hover:w-full")
        }
      />
    </Link>
  )
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center space-x-6 md:space-x-8 xl:space-x-12">
      <NavLink href="/backoffice/products">товары</NavLink>
      <NavLink href="/backoffice/categories">категории</NavLink>
      <NavLink href="/backoffice/orders">заказы</NavLink>
      <NavLink href="/backoffice/gallery">галерея</NavLink>
    </nav>
  )
}

// Stagger animation variants для мобильного меню
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // ease-brand
    },
  },
}

// Компонент контента мобильного меню для бэк-офиса
const BackofficeMobileDrawerContent = memo(function BackofficeMobileDrawerContent({
  pathname,
  onClose,
}: {
  pathname: string
  onClose: () => void
}) {
  const navigationLinks = [
    { href: '/backoffice/products', label: 'товары' },
    { href: '/backoffice/categories', label: 'категории' },
    { href: '/backoffice/orders', label: 'заказы' },
    { href: '/backoffice/gallery', label: 'галерея' },
  ]

  return (
    <motion.div
      className="flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Navigation */}
      <nav className="px-3 sm:px-4 pt-4 sm:pt-6 pb-3 sm:pb-4 space-y-2 sm:space-y-2.5">
        {navigationLinks.map((link) => {
          const isActive = pathname?.startsWith(link.href)
          return (
            <motion.div key={link.href} variants={itemVariants}>
              <Link
                href={link.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative block rounded-sm px-5 py-4 text-right text-sm font-mono transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring dark:focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-[0.98] uppercase tracking-[0.15em]',
                  isActive
                    ? 'bg-accent/10 dark:bg-accent/10 text-accent dark:text-accent border border-accent/20 dark:border-accent/20 shadow-fintage-sm'
                    : 'text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg hover:text-accent dark:hover:text-accent'
                )}
              >
                <span suppressHydrationWarning className="relative z-10">
                  {link.label}
                </span>
                {!isActive && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-sm border border-transparent group-hover:border-accent/20 dark:group-hover:border-accent/20 transition-fintage"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 mx-4" />

      {/* Link to storefront */}
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            onClick={onClose}
            className="group relative block rounded-sm px-5 py-4 text-right text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg hover:text-accent dark:hover:text-accent transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring dark:focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-[0.98] uppercase tracking-[0.15em]"
          >
            <span className="relative z-10 flex items-center justify-end gap-2">
              <span>↖</span>
              <span>на витрину</span>
            </span>
            <span
              className="pointer-events-none absolute inset-0 rounded-sm border border-transparent group-hover:border-accent/20 dark:group-hover:border-accent/20 transition-fintage"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>

      {/* Settings Section - внизу */}
      <div className="mt-auto border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex gap-2 sm:gap-2.5">
          <motion.div variants={itemVariants} className="flex-1">
            <SettingsCard>
              <ThemeToggle />
            </SettingsCard>
          </motion.div>
          <motion.div variants={itemVariants} className="flex-1">
            <SettingsCard>
              <LocaleSwitcher />
            </SettingsCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
})

// Компонент карточки настроек
const SettingsCard = memo(function SettingsCard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-offwhite/60 dark:bg-fintage-charcoal/60 backdrop-blur-sm shadow-fintage-sm hover:shadow-fintage-md transition-fintage">
      {children}
    </div>
  )
})

function MobileNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="открыть меню"
        aria-expanded={drawerOpen}
        aria-controls="backoffice-mobile-drawer"
        onClick={() => setDrawerOpen(true)}
        className="md:hidden hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage rounded-sm inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-fintage-graphite/30 dark:border-fintage-graphite/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring dark:focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-95 touch-manipulation"
      >
        <span className="sr-only">Open menu</span>
        <div className="space-y-1.5">
          <span className="block h-0.5 w-5 bg-fintage-charcoal dark:bg-fintage-offwhite" />
          <span className="block h-0.5 w-5 bg-fintage-charcoal dark:bg-fintage-offwhite" />
          <span className="block h-0.5 w-5 bg-fintage-charcoal dark:bg-fintage-offwhite" />
        </div>
      </button>

      {/* Mobile Drawer */}
      <MobileDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title="меню" 
        id="backoffice-mobile-drawer"
      >
        <BackofficeMobileDrawerContent
          pathname={pathname}
          onClose={() => setDrawerOpen(false)}
        />
      </MobileDrawer>
    </>
  )
}

function QuickActions() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        window.location.href = '/backoffice/login'
      } else {
        window.location.href = '/backoffice/login'
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
      window.location.href = '/backoffice/login'
    }
  }

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
      <div className="hidden sm:block">
        <ThemeToggle />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="inline-flex h-9 sm:h-10 md:h-10 lg:h-11 px-3 sm:px-4 md:px-5 lg:px-6 min-w-0 sm:min-w-[148px] items-center justify-center rounded-sm hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage gap-1 sm:gap-2"
            aria-label="Меню аккаунта"
          >
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-sm bg-fintage-graphite/20 dark:bg-fintage-graphite/30 border border-fintage-graphite/30 dark:border-fintage-graphite/40 flex-shrink-0" />
            <span className="hidden sm:inline text-xs sm:text-sm md:text-sm font-mono uppercase tracking-[0.1em] text-fintage-charcoal dark:text-fintage-offwhite">аккаунт</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem asChild>
            <Link href="/backoffice/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Настройки
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Выйти
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    if (pathname !== '/backoffice/login') {
      const checkAuth = async () => {
        try {
          const res = await fetch('/api/auth/verify', {
            credentials: 'include',
            cache: 'no-store',
          })
          
          const data = await res.json()
          setIsAuthenticated(data.authenticated)
          
          if (!data.authenticated) {
            window.location.href = '/backoffice/login'
          }
        } catch (err) {
          console.error('Auth check error:', err)
          setIsAuthenticated(false)
          window.location.href = '/backoffice/login'
        }
      }
      
      checkAuth()
    } else {
      setIsAuthenticated(true) // Разрешаем показ страницы логина
    }
  }, [pathname])

  // Показываем загрузку, пока проверяем авторизацию
  if (pathname !== '/backoffice/login' && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas text-fintage-charcoal dark:text-fintage-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-sm h-12 w-12 border-2 border-fintage-graphite/30 dark:border-fintage-graphite/50 border-t-accent dark:border-t-accent mx-auto mb-4"></div>
          <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Проверка авторизации...</p>
        </div>
      </div>
    )
  }

  // Не показываем layout на странице логина
  if (pathname === '/backoffice/login') {
    return <>{children}</>
  }

  // Если не авторизован, не показываем содержимое (перенаправление уже произошло)
  if (isAuthenticated === false) {
    return null
  }

  return (
    <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas text-fintage-charcoal dark:text-fintage-offwhite">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-fintage-offwhite/90 dark:bg-fintage-charcoal/90 backdrop-blur-md border-b border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
          <div className="flex h-14 sm:h-16 md:h-16 lg:h-20 items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <Link href="/backoffice" className="flex items-center space-x-1.5 sm:space-x-2 group flex-shrink-0 min-w-0" aria-label="Backoffice home">
              <span className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg font-logo font-medium text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-accent dark:group-hover:text-accent transition-fintage tracking-[0.15em] sm:tracking-[0.2em] uppercase whitespace-nowrap">
                rosebotanique — backoffice
              </span>
            </Link>
            <DesktopNav />
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <QuickActions />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-4 sm:py-6 md:py-8 lg:py-10">
        {children}
      </main>

      {/* FOOTER (optional minimal) */}
      <footer className="mt-8 sm:mt-12 md:mt-16 py-4 sm:py-6 md:py-8 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[10px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/50 tracking-[0.2em] uppercase">© RSBTNQ Backoffice</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link className="text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 hover:text-accent dark:hover:text-accent transition-fintage uppercase tracking-[0.15em]" href="/">view storefront</Link>
            <a className="text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 hover:text-accent dark:hover:text-accent transition-fintage uppercase tracking-[0.15em]" href="/api/docs" target="_blank" rel="noreferrer">API docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

