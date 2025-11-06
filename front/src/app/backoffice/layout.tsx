"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const active = pathname?.startsWith(href)
  return (
    <Link
      href={href}
      className="text-inkSoft/70 hover:text-sageTint transition-colors font-light text-base tracking-wide relative group"
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

function MobileNav() {
  const pathname = usePathname()
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label="Открыть меню"
          className="lg:hidden hover:bg-sageTint/10 transition-all duration-500 ease-graceful rounded-xl sm:rounded-2xl inline-flex h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-6 min-w-0 sm:min-w-[132px] items-center justify-center border border-mistGray/40 gap-1 sm:gap-2"
          variant="ghost"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-inkSoft" />
          <span className="hidden sm:inline text-xs sm:text-sm font-light text-inkSoft">меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-white border-l border-mistGray/30 w-[280px] sm:w-[320px] shadow-xl [&>button]:hidden !top-[64px] sm:!top-[80px] md:!top-[96px] h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] md:h-[calc(100vh-96px)]">
        <div className="pt-4">
          <div className="flex flex-col space-y-1">
            <Link 
              className={`px-4 py-3.5 rounded-xl text-base font-normal transition-all ${
                pathname?.startsWith('/backoffice/products') 
                  ? 'bg-sageTint text-white shadow-md' 
                  : 'text-inkSoft bg-white hover:bg-roseBeige/20 hover:text-sageTint border border-transparent hover:border-mistGray/20'
              }`}
              href="/backoffice/products"
            >
              товары
            </Link>
            <Link 
              className={`px-4 py-3.5 rounded-xl text-base font-normal transition-all ${
                pathname?.startsWith('/backoffice/categories') 
                  ? 'bg-sageTint text-white shadow-md' 
                  : 'text-inkSoft bg-white hover:bg-roseBeige/20 hover:text-sageTint border border-transparent hover:border-mistGray/20'
              }`}
              href="/backoffice/categories"
            >
              категории
            </Link>
            <Link 
              className={`px-4 py-3.5 rounded-xl text-base font-normal transition-all ${
                pathname?.startsWith('/backoffice/orders') 
                  ? 'bg-sageTint text-white shadow-md' 
                  : 'text-inkSoft bg-white hover:bg-roseBeige/20 hover:text-sageTint border border-transparent hover:border-mistGray/20'
              }`}
              href="/backoffice/orders"
            >
              заказы
            </Link>
            <Link 
              className="block px-4 py-3.5 rounded-xl text-base font-normal text-inkSoft bg-white hover:bg-roseBeige/20 hover:text-sageTint transition-all border border-transparent hover:border-mistGray/20"
              href="/"
            >
              ↖ на витрину
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function QuickActions() {
  const router = usePathname()
  const handleLogout = async () => {
    try {
      // Удаляем токен из localStorage
      localStorage.removeItem('auth-token')
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      if (response.ok) {
        window.location.href = '/backoffice/login'
      } else {
        window.location.href = '/backoffice/login'
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error)
      localStorage.removeItem('auth-token')
      window.location.href = '/backoffice/login'
    }
  }

  return (
    <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="inline-flex h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-6 min-w-0 sm:min-w-[148px] items-center justify-center rounded-xl sm:rounded-2xl hover:bg-sageTint/10 transition-all duration-500 ease-graceful gap-1 sm:gap-2"
            aria-label="Меню аккаунта"
          >
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-roseBeige/70 border border-mistGray/40 flex-shrink-0" />
            <span className="hidden sm:inline text-xs sm:text-sm font-light text-inkSoft">аккаунт</span>
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
      // Небольшая задержка, чтобы дать время cookie установиться после редиректа
      const checkAuth = async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const token = localStorage.getItem('auth-token')
        try {
          const res = await fetch('/api/auth/verify', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            credentials: 'include',
            cache: 'no-store',
          })
          
          const data = await res.json()
          setIsAuthenticated(data.authenticated)
          
          if (!data.authenticated) {
            localStorage.removeItem('auth-token')
            window.location.href = '/backoffice/login'
          }
        } catch (err) {
          console.error('Auth check error:', err)
          // Даём второй шанс - возможно cookie ещё не успела примениться
          setTimeout(() => {
            const token2 = localStorage.getItem('auth-token')
            if (token2) {
              fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${token2}` },
                credentials: 'include',
                cache: 'no-store',
              })
                .then(res => res.json())
                .then(data => {
                  if (data.authenticated) {
                    setIsAuthenticated(true)
                  } else {
                    setIsAuthenticated(false)
                    localStorage.removeItem('auth-token')
                    window.location.href = '/backoffice/login'
                  }
                })
                .catch(() => {
                  setIsAuthenticated(false)
                  localStorage.removeItem('auth-token')
                  window.location.href = '/backoffice/login'
                })
            } else {
              setIsAuthenticated(false)
              window.location.href = '/backoffice/login'
            }
          }, 500)
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
      <div className="min-h-screen bg-linenWhite text-inkSoft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sageTint mx-auto mb-4"></div>
          <p className="text-inkSoft/60">Проверка авторизации...</p>
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
    <div className="min-h-screen bg-linenWhite text-inkSoft">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-linenWhite/90 backdrop-blur-md border-b border-mistGray/20 shadow-breathing">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
          <div className="flex h-16 sm:h-20 md:h-24 items-center justify-between gap-3 sm:gap-4">
            <Link href="/backoffice" className="flex items-center space-x-2 group flex-shrink-0 min-w-0" aria-label="Backoffice home">
              <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-light text-inkSoft group-hover:text-sageTint transition-colors duration-500 ease-graceful font-display whitespace-nowrap">
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
      <footer className="mt-12 sm:mt-16 md:mt-20 py-6 sm:py-8 md:py-10 text-xs sm:text-sm text-inkSoft/60">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© RSBTNQ Backoffice</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link className="hover:text-sageTint transition-colors" href="/">view storefront</Link>
            <a className="hover:text-sageTint transition-colors" href="/api/docs" target="_blank" rel="noreferrer">API docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

