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
      className="text-inkSoft/70 dark:text-foreground/70 hover:text-sageTint dark:hover:text-primary transition-colors font-light text-base tracking-wide relative group"
    >
      <span>{children}</span>
      <span
        className={
          "absolute -bottom-2 left-0 h-px w-0 bg-gradient-to-r from-sageTint to-transparent transition-all duration-500 ease-graceful " +
          (active ? "!w-full" : "group-hover:w-full")
        }
      />
    </Link>
  )
}

function DesktopNav() {
  return (
    <nav className="hidden lg:flex items-center space-x-8 xl:space-x-12">
      <NavLink href="/backoffice/products">товары</NavLink>
      <NavLink href="/backoffice/categories">категории</NavLink>
      <NavLink href="/backoffice/orders">заказы</NavLink>
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
  ]

  return (
    <motion.div
      className="flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Navigation */}
      <nav className="px-4 pt-6 pb-4 space-y-2">
        {navigationLinks.map((link) => {
          const isActive = pathname?.startsWith(link.href)
          return (
            <motion.div key={link.href} variants={itemVariants}>
              <Link
                href={link.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative block rounded-xl px-5 py-4 text-right text-base font-light transition-all duration-300 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]',
                  isActive
                    ? 'bg-sageTint/10 dark:bg-primary/10 text-sageTint dark:text-primary border border-sageTint/20 dark:border-primary/20 shadow-sm dark:shadow-md'
                    : 'text-inkSoft dark:text-foreground hover:bg-white/60 dark:hover:bg-card/60 hover:text-sageTint dark:hover:text-primary'
                )}
              >
                <span suppressHydrationWarning className="relative z-10">
                  {link.label}
                </span>
                {!isActive && (
                  <span
                    className="pointer-events-none absolute inset-0 rounded-xl border border-transparent group-hover:border-sageTint/20 dark:group-hover:border-primary/20 transition-all duration-300 ease-brand"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="border-t border-mistGray/15 dark:border-border/40 mx-4" />

      {/* Link to storefront */}
      <div className="px-4 py-4">
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            onClick={onClose}
            className="group relative block rounded-xl px-5 py-4 text-right text-base font-light text-inkSoft dark:text-foreground hover:bg-white/60 dark:hover:bg-card/60 hover:text-sageTint dark:hover:text-primary transition-all duration-300 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-end gap-2">
              <span>↖</span>
              <span>на витрину</span>
            </span>
            <span
              className="pointer-events-none absolute inset-0 rounded-xl border border-transparent group-hover:border-sageTint/20 dark:group-hover:border-primary/20 transition-all duration-300 ease-brand"
              aria-hidden="true"
            />
          </Link>
        </motion.div>
      </div>

      {/* Settings Section - внизу */}
      <div className="mt-auto border-t border-mistGray/15 dark:border-border/40 px-4 py-4">
        <div className="flex gap-2">
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
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-mistGray/20 dark:border-border/60 bg-white/60 dark:bg-card/60 backdrop-blur-sm shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300 ease-brand">
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
        className="lg:hidden hover:bg-sageTint/5 dark:hover:bg-muted/20 transition-all duration-500 ease-out rounded-full inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-mistGray/30 dark:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-98"
      >
        <span className="sr-only">Open menu</span>
        <div className="space-y-1.5">
          <span className="block h-0.5 w-5 bg-inkSoft dark:bg-foreground" />
          <span className="block h-0.5 w-5 bg-inkSoft dark:bg-foreground" />
          <span className="block h-0.5 w-5 bg-inkSoft dark:bg-foreground" />
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
            className="inline-flex h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-6 min-w-0 sm:min-w-[148px] items-center justify-center rounded-xl sm:rounded-2xl hover:bg-sageTint/10 dark:hover:bg-primary/10 transition-all duration-500 ease-graceful gap-1 sm:gap-2"
            aria-label="Меню аккаунта"
          >
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-roseBeige/70 dark:bg-primary/30 border border-mistGray/40 dark:border-border flex-shrink-0" />
            <span className="hidden sm:inline text-xs sm:text-sm font-light text-inkSoft dark:text-foreground">аккаунт</span>
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
      <div className="min-h-screen bg-linenWhite dark:bg-background text-inkSoft dark:text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sageTint dark:border-primary mx-auto mb-4"></div>
          <p className="text-inkSoft/60 dark:text-muted-foreground">Проверка авторизации...</p>
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
    <div className="min-h-screen bg-linenWhite dark:bg-background text-inkSoft dark:text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-linenWhite/90 dark:bg-background/90 backdrop-blur-md border-b border-mistGray/20 dark:border-border shadow-breathing">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
          <div className="flex h-16 sm:h-20 md:h-24 items-center justify-between gap-3 sm:gap-4">
            <Link href="/backoffice" className="flex items-center space-x-2 group flex-shrink-0 min-w-0" aria-label="Backoffice home">
              <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-light text-inkSoft dark:text-foreground group-hover:text-sageTint dark:group-hover:text-primary transition-colors duration-500 ease-graceful font-display whitespace-nowrap">
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
      <main className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 py-6 sm:py-8 md:py-10">
        {children}
      </main>

      {/* FOOTER (optional minimal) */}
      <footer className="mt-12 sm:mt-16 md:mt-20 py-6 sm:py-8 md:py-10 text-xs sm:text-sm text-inkSoft/60 dark:text-muted-foreground">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© RSBTNQ Backoffice</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link className="hover:text-sageTint dark:hover:text-primary transition-colors" href="/">view storefront</Link>
            <a className="hover:text-sageTint dark:hover:text-primary transition-colors" href="/api/docs" target="_blank" rel="noreferrer">API docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

