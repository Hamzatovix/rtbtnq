'use client'

import Link from 'next/link'
import { useEffect, useState, memo, useRef } from 'react'
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
import { MOBILE_MENU_CONFIG } from './mobile-menu.constants'

export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { toggleCart, getTotalItems } = useCartStore()
  const { items: favorites, toggleFavorites } = useFavoritesStore()
  const t = useTranslations()
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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
              className="text-graceful text-xl font-light text-inkSoft dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors duration-500 ease-out"
            >
              rosebotanique store
            </span>
          </Link>

          {/* Navigation */}
          <nav 
            className="hidden md:flex items-center space-x-12"
            aria-label="Основная навигация"
          >
            {(() => {
              // Нормализуем pathname для сравнения (убираем локализацию)
              const normalizedPathname = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/') || '/'
              const isCatalogActive = normalizedPathname === '/catalog'
              const isBrandActive = normalizedPathname === '/brand' || normalizedPathname === '/about'
              const isGalleryActive = normalizedPathname === '/gallery'
              
              return (
                <>
                  <Link
                    href="/catalog"
                    className="text-inkSoft/75 dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors font-light text-base tracking-wide relative group"
                    suppressHydrationWarning
                    aria-current={isCatalogActive ? 'page' : undefined}
                  >
                    {t('header.collection')}
                    <span 
                      className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-primary dark:from-primary to-transparent group-hover:w-full transition-all duration-500 ease-out" 
                      aria-hidden="true"
                    />
                    {isCatalogActive && (
                      <span 
                        className="absolute -bottom-2 left-0 w-full h-px bg-primary dark:bg-primary" 
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                  <Link
                    href="/brand"
                    className="text-inkSoft/75 dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors font-light text-base tracking-wide relative group"
                    suppressHydrationWarning
                    aria-current={isBrandActive ? 'page' : undefined}
                  >
                    {t('header.about')}
                    <span 
                      className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-primary dark:from-primary to-transparent group-hover:w-full transition-all duration-500 ease-out" 
                      aria-hidden="true"
                    />
                    {isBrandActive && (
                      <span 
                        className="absolute -bottom-2 left-0 w-full h-px bg-primary dark:bg-primary" 
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                  <Link
                    href="/gallery"
                    className="text-inkSoft/75 dark:text-muted-foreground hover:text-primary dark:hover:text-primary transition-colors font-light text-base tracking-wide relative group"
                    suppressHydrationWarning
                    aria-current={isGalleryActive ? 'page' : undefined}
                  >
                    {t('header.gallery')}
                    <span 
                      className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-primary dark:from-primary to-transparent group-hover:w-full transition-all duration-500 ease-out" 
                      aria-hidden="true"
                    />
                    {isGalleryActive && (
                      <span 
                        className="absolute -bottom-2 left-0 w-full h-px bg-primary dark:bg-primary" 
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </>
              )
            })()}
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
                {!mounted ? (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-mistGray/30 dark:bg-muted/30 animate-pulse" aria-hidden="true" />
                ) : favCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-primary dark:bg-primary text-[10px] md:text-xs text-primary-foreground dark:text-primary-foreground flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
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
                {!mounted ? (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-mistGray/30 dark:bg-muted/30 animate-pulse" aria-hidden="true" />
                ) : cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-primary dark:bg-primary text-[10px] md:text-xs text-primary-foreground dark:text-primary-foreground flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
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
            ref={menuButtonRef}
            type="button"
            aria-label={drawerOpen ? "закрыть меню" : "открыть меню"}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="md:hidden hover:bg-sageTint/5 dark:hover:bg-muted/20 transition-all duration-500 ease-out rounded-full inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-mistGray/30 dark:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-98 relative"
          >
            <span className="sr-only">{drawerOpen ? "Close menu" : "Open menu"}</span>
            <div className="relative w-5 h-5 flex items-center justify-center">
              {/* Верхняя полоска */}
              <motion.span
                className="absolute block h-0.5 w-5 bg-inkSoft dark:bg-foreground origin-center"
                animate={{
                  rotate: drawerOpen ? 45 : 0,
                  y: drawerOpen ? 0 : -6,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              {/* Средняя полоска */}
              <motion.span
                className="absolute block h-0.5 w-5 bg-inkSoft dark:bg-foreground origin-center"
                animate={{
                  opacity: drawerOpen ? 0 : 1,
                  scale: drawerOpen ? 0 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              {/* Нижняя полоска */}
              <motion.span
                className="absolute block h-0.5 w-5 bg-inkSoft dark:bg-foreground origin-center"
                animate={{
                  rotate: drawerOpen ? -45 : 0,
                  y: drawerOpen ? 0 : 6,
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title="меню" 
        id="mobile-drawer"
        triggerRef={menuButtonRef}
      >
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

// Stagger animation variants - улучшенные с использованием констант
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: MOBILE_MENU_CONFIG.STAGGER_DELAY,
      delayChildren: MOBILE_MENU_CONFIG.STAGGER_DELAY_CHILDREN,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: MOBILE_MENU_CONFIG.ITEM_ANIMATION_DURATION,
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
    { href: '/', label: t('header.home') },
    { href: '/catalog', label: t('header.collection') },
    { href: '/brand', label: t('header.about') },
    { href: '/gallery', label: t('header.gallery') },
  ]

  return (
    <motion.div
      className="flex flex-col min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Navigation - улучшенная структура */}
      <nav className="px-2 pt-2 pb-3 space-y-2">
        {navigationLinks.map((link, index) => {
          // Нормализуем pathname для сравнения (убираем локализацию)
          const normalizedPathname = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/') || '/'
          const normalizedHref = link.href
          const isActive = normalizedPathname === normalizedHref
          return (
            <motion.div 
              key={link.href} 
              variants={itemVariants}
              custom={index}
            >
              <Link
                href={link.href}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center justify-between rounded-xl px-5 py-4 text-base font-light transition-all duration-300 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]',
                  isActive
                    ? 'bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary border border-primary/20 dark:border-primary/20 shadow-sm dark:shadow-md'
                    : 'text-inkSoft dark:text-foreground hover:bg-white/60 dark:hover:bg-card/60 hover:text-primary dark:hover:text-primary border border-transparent hover:border-mistGray/20 dark:hover:border-border/40'
                )}
              >
                <span suppressHydrationWarning className="relative z-10 flex-1">
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Divider - улучшенный с лучшим визуальным разделением */}
      <motion.div 
        variants={itemVariants}
        className="border-t border-mistGray/20 dark:border-border/50 mx-2 my-4" 
      />

      {/* Action Buttons - улучшенные */}
      <div className="px-2 pb-3 space-y-2.5">
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

      {/* Settings Section - компактная с улучшенным разделением */}
      <motion.div 
        variants={itemVariants}
        className="mt-auto pt-4 border-t border-mistGray/20 dark:border-border/50"
      >
        <div className="px-2 pb-2">
          <div className="flex gap-2">
            <motion.div variants={itemVariants} className="flex-1">
              <SettingsCard 
                label="Тема"
                icon={<ThemeToggle />}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex-1">
              <SettingsCard 
                label="Язык"
                icon={<LocaleSwitcher />}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

// Компонент кнопки действия - улучшенный
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
      className="group relative flex w-full items-center justify-between gap-3 rounded-xl px-5 py-4 bg-white/50 dark:bg-card/50 border border-mistGray/20 dark:border-border hover:bg-white dark:hover:bg-card hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] overflow-hidden"
    >
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-center gap-3 flex-1">
        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 dark:group-hover:bg-primary/20">
          {icon}
        </div>
        <span className="text-base font-light text-inkSoft dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300">
          {label}
        </span>
      </div>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-primary dark:bg-primary px-2.5 text-xs font-medium text-primary-foreground dark:text-primary-foreground shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
        >
          {count}
        </motion.span>
      )}
    </button>
  )
})

// Компонент карточки настроек - минималистичный без фона по умолчанию
const SettingsCard = memo(function SettingsCard({
  label,
  icon,
}: {
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="group flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-transparent hover:border-mistGray/20 dark:hover:border-border/50 transition-all duration-300 ease-brand cursor-pointer">
      <div className="flex items-center justify-center scale-90">
        {icon}
      </div>
      <span className="text-xs font-light text-inkSoft/60 dark:text-muted-foreground/80 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-300 leading-tight">
        {label}
      </span>
    </div>
  )
})
