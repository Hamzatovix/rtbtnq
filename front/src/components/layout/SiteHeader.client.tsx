'use client'

import Link from 'next/link'
import { useEffect, useState, memo } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { MobileDrawer } from './MobileDrawer'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { SettingsPanel } from '@/components/settings-panel'
import { useTranslations } from '@/hooks/useTranslations'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { toggleCart, getTotalItems } = useCartStore()
  const { items: favorites, toggleFavorites } = useFavoritesStore()
  const t = useTranslations()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mistGray/30 dark:border-border bg-white/80 dark:bg-background/80 backdrop-breathing dark:backdrop-breathing supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-background/60 shadow-breathing dark:shadow-breathing">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group" aria-label="на главную">
            <span
              className="text-graceful text-xl font-light text-inkSoft dark:text-foreground group-hover:text-sageTint dark:group-hover:text-primary transition-colors duration-500 ease-out"
            >
              rosebotanique store
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link
              href="/catalog"
              className="text-whisper dark:text-muted-foreground hover:text-sageTint dark:hover:text-primary transition-colors font-light text-base tracking-wide relative group"
            >
              <span suppressHydrationWarning>{t('header.collection')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-sageTint dark:from-primary to-transparent group-hover:w-full transition-all duration-500 ease-out" />
            </Link>
            <Link
              href="/about"
              className="text-whisper dark:text-muted-foreground hover:text-sageTint dark:hover:text-primary transition-colors font-light text-base tracking-wide relative group"
            >
              <span suppressHydrationWarning>{t('header.about')}</span>
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-sageTint dark:from-primary to-transparent group-hover:w-full transition-all duration-500 ease-out" />
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {(() => {
              const favCount = mounted ? favorites.length : 0
              return (
          <Button
            variant="ghost" 
              size="icon" 
            onClick={toggleFavorites}
              className="relative hover:bg-sageTint/5 dark:hover:bg-muted/20 transition-all duration-500 ease-out rounded-xl md:rounded-2xl h-10 w-10 md:h-11 md:w-11"
                aria-label={`Favorites ${favCount} items`}
          >
                <Heart className="h-4 w-4 md:h-5 md:w-5" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-sageTint dark:bg-primary text-[10px] md:text-xs text-linenWhite dark:text-primary-foreground flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
                    {favCount}
                  </span>
                )}
          </Button>
              )
            })()}
            {(() => {
              const cartCount = mounted ? getTotalItems() : 0
              return (
              <Button
            variant="ghost" 
              size="icon" 
            onClick={toggleCart}
              className="relative hover:bg-sageTint/5 dark:hover:bg-muted/20 transition-all duration-500 ease-out rounded-xl md:rounded-2xl h-10 w-10 md:h-11 md:w-11"
                aria-label={`Shopping cart ${cartCount} items`}
          >
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-sageTint dark:bg-primary text-[10px] md:text-xs text-linenWhite dark:text-primary-foreground flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
                    {cartCount}
                  </span>
                )}
          </Button>
              )
            })()}
            {/* Settings Panel: desktop only */}
            <div className="hidden md:block">
              <SettingsPanel />
            </div>
          <button
            type="button"
            aria-label="открыть меню"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden hover:bg-sageTint/5 dark:hover:bg-muted/20 transition-all duration-500 ease-out rounded-full inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-mistGray/30 dark:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-98"
          >
            <span className="sr-only">Open menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-inkSoft dark:bg-foreground" />
              <span className="block h-0.5 w-5 bg-inkSoft dark:bg-foreground" />
              <span className="block h-0.5 w-5 bg-inkSoft dark:bg-foreground" />
            </div>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="меню" id="mobile-drawer">
        <MobileDrawerContent
          pathname={pathname}
          mounted={mounted}
          getTotalItems={getTotalItems}
          favoritesLength={favorites.length}
          toggleCart={toggleCart}
          toggleFavorites={toggleFavorites}
          onClose={() => setDrawerOpen(false)}
          t={t}
        />
      </MobileDrawer>
    </header>
  )
}

// Stagger animation variants
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

// Мемоизированный компонент контента меню для оптимизации
const MobileDrawerContent = memo(function MobileDrawerContent({
  pathname,
  mounted,
  getTotalItems,
  favoritesLength,
  toggleCart,
  toggleFavorites,
  onClose,
  t,
}: {
  pathname: string
  mounted: boolean
  getTotalItems: () => number
  favoritesLength: number
  toggleCart: () => void
  toggleFavorites: () => void
  onClose: () => void
  t: (key: string) => string
}) {
  const navigationLinks = [
    { href: '/catalog', label: t('header.collection') },
    { href: '/about', label: t('header.about') },
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
          const isActive = pathname === link.href
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

      {/* Action Buttons */}
      <div className="px-4 py-4 space-y-2">
        <motion.div variants={itemVariants}>
          <ActionButton
            icon={<ShoppingBag className="h-5 w-5" />}
            label={t('header.cart')}
            count={mounted ? getTotalItems() : 0}
            onClick={() => {
              toggleCart()
              onClose()
            }}
            ariaLabel={`Shopping cart ${mounted ? getTotalItems() : 0} items`}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ActionButton
            icon={<Heart className="h-5 w-5" />}
            label={t('header.favorites')}
            count={mounted ? favoritesLength : 0}
            onClick={() => {
              toggleFavorites()
              onClose()
            }}
            ariaLabel={`Favorites ${mounted ? favoritesLength : 0} items`}
          />
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

// Компонент кнопки действия
const ActionButton = memo(function ActionButton({
  icon,
  label,
  count,
  onClick,
  ariaLabel,
}: {
  icon: React.ReactNode
  label: string
  count: number
  onClick: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="group flex w-full items-center justify-between gap-3 rounded-xl px-5 py-4 bg-white/50 dark:bg-card/50 border border-mistGray/20 dark:border-border hover:bg-white dark:hover:bg-card transition-all duration-300 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-sageTint/10 dark:bg-primary/10 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <span className="text-base font-light text-inkSoft dark:text-foreground">
          {label}
        </span>
      </div>
      {count > 0 && (
        <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-sageTint dark:bg-primary px-2.5 text-xs font-light text-white dark:text-primary-foreground shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          {count}
        </span>
      )}
    </button>
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
