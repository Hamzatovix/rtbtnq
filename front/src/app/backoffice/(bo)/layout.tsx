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
  Plus,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react"

/**
 * Backoffice layout shell with a brand-aligned header inspired by the storefront header snippet.
 * - Uses RSBTQ DS tokens: text-inkSoft, bg-linenWhite, border-mistGray, accent sageTint, shadows.
 * - Gradient underline on hover for nav items; smooth transitions Approximate 'ease-graceful'.
 * - Persistent theme toggle (localStorage: 'rsbtq_bo_theme', data-theme="dark").
 * - Mobile drawer navigation under /backoffice.
 */

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const pref = typeof window !== "undefined" && localStorage.getItem("rsbtq_bo_theme")
    const shouldDark = pref === "dark"
    setIsDark(shouldDark)
    if (shouldDark) document.documentElement.setAttribute("data-theme", "dark")
  }, [])
  useEffect(() => {
    if (typeof window === "undefined") return
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark")
      localStorage.setItem("rsbtq_bo_theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
      localStorage.setItem("rsbtq_bo_theme", "light")
    }
  }, [isDark])
  return (
    <Button
      variant="ghost"
      className="group inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sageTint/10 transition-all duration-500 ease-graceful"
      aria-label="Toggle theme"
      onClick={() => setIsDark((v) => !v)}
    >
      Toggle
    </Button>
  )
};

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
    <nav className="hidden md:flex items-center space-x-12">
      <NavLink href="/backoffice/products">products</NavLink>
      <NavLink href="/backoffice/categories">categories</NavLink>
      <NavLink href="/backoffice/colors">colors</NavLink>
      <NavLink href="/backoffice/orders">orders</NavLink>
    </nav>
  )
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          aria-label="Open menu"
          className="md:hidden hover:bg-sageTint/10 transition-all duration-500 ease-graceful rounded-full inline-flex h-10 w-10 items-center justify-center border border-mistGray/40"
          variant="ghost"
        >
          <Menu className="h-5 w-5 text-inkSoft" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-linenWhite border-l-0">
        <div className="mt-8 flex flex-col space-y-6 text-lg">
          <Link className="hover:text-sageTint" href="/backoffice/products">products</Link>
          <Link className="hover:text-sageTint" href="/backoffice/categories">categories</Link>
          <Link className="hover:text-sageTint" href="/backoffice/colors">colors</Link>
          <Link className="hover:text-sageTint" href="/backoffice/orders">orders</Link>
          <Link className="hover:text-sageTint" href="/">↖ storefront</Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function QuickActions() {
  return (
    <div className="flex items-center space-x-2 md:space-x-4">
      <Link href="/backoffice/products/new" aria-label="New product">
        <Button
          className="group inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 transition-[transform,background-color] duration-250 ease-brand disabled:opacity-50 disabled:pointer-events-none border border-mistGray/60 bg-sageTint hover:bg-mistGray/20 h-11 px-6 rounded-full text-subtle tracking-wide"
        >
          <span className="hidden sm:inline">add product</span>
          <Plus className="ml-3 h-4 w-4 transition-transform duration-250 ease-brand group-hover:translate-x-1" />
        </Button>
      </Link>


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sageTint/10 transition-all duration-500 ease-graceful"
            aria-label="Account menu"
          >
            <span className="sr-only">Open account menu</span>
            <div className="h-6 w-6 rounded-full bg-roseBeige/70 border border-mistGray/40" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem asChild>
            <Link href="/backoffice/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/api/auth/logout" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Sign out
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linenWhite text-inkSoft">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-linenWhite/90 backdrop-blur-md border-b border-mistGray/20 shadow-breathing">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex h-24 items-center justify-between">
            <Link href="/backoffice" className="flex items-center space-x-2 group" aria-label="Backoffice home">
              <span className="text-xl font-light text-inkSoft group-hover:text-sageTint transition-colors duration-500 ease-graceful font-display">
                rosebotanique — backoffice
              </span>
            </Link>
            <DesktopNav />
            <div className="flex items-center gap-2">
              <QuickActions />
              <MobileNav />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-6 md:px-12 lg:px-24 py-10">
        {children}
      </main>

      {/* FOOTER (optional minimal) */}
      <footer className="mt-20 py-10 text-sm text-inkSoft/60">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
          <p>© RSBTQ Backoffice</p>
          <div className="hidden md:flex items-center gap-6">
            <Link className="hover:text-sageTint" href="/">view storefront</Link>
            <a className="hover:text-sageTint" href="/api/docs" target="_blank" rel="noreferrer">API docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

