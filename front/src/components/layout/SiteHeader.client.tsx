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
    <header className="sticky top-0 z-50 w-full border-b border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-offwhite/95 dark:bg-fintage-charcoal/95 backdrop-blur-sm supports-[backdrop-filter]:bg-fintage-offwhite/90 dark:supports-[backdrop-filter]:bg-fintage-charcoal/90 shadow-fintage-sm">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo - технический стиль */}
          <Link href="/" className="flex items-center space-x-2 group" aria-label="на главную">
            <span
              className="font-logo text-sm md:text-base lg:text-lg font-medium text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] tracking-[0.2em]"
            >
              ROSEBOTANIQUE <span className="text-[0.7em] tracking-[0.15em]">STORE</span>
            </span>
          </Link>

          {/* Navigation - технический стиль */}
          <nav 
            className="hidden md:flex items-center space-x-10 lg:space-x-12"
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
                    className="text-fintage-charcoal dark:text-fintage-offwhite hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase relative group"
                    suppressHydrationWarning
                    aria-current={isCatalogActive ? 'page' : undefined}
                  >
                    {t('header.collection')}
                    <span 
                      className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" 
                      aria-hidden="true"
                    />
                    {isCatalogActive && (
                      <span 
                        className="absolute -bottom-1 left-0 w-full h-px bg-accent" 
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                  <Link
                    href="/brand"
                    className="text-fintage-charcoal dark:text-fintage-offwhite hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase relative group"
                    suppressHydrationWarning
                    aria-current={isBrandActive ? 'page' : undefined}
                  >
                    {t('header.about')}
                    <span 
                      className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" 
                      aria-hidden="true"
                    />
                    {isBrandActive && (
                      <span 
                        className="absolute -bottom-1 left-0 w-full h-px bg-accent" 
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                  <Link
                    href="/gallery"
                    className="text-fintage-charcoal dark:text-fintage-offwhite hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase relative group"
                    suppressHydrationWarning
                    aria-current={isGalleryActive ? 'page' : undefined}
                  >
                    {t('header.gallery')}
                    <span 
                      className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" 
                      aria-hidden="true"
                    />
                    {isGalleryActive && (
                      <span 
                        className="absolute -bottom-1 left-0 w-full h-px bg-accent" 
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </>
              )
            })()}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {(() => {
              const favCount = mounted ? favorites.length : 0
              return (
          <Button
            variant="ghost" 
              size="icon" 
            onClick={toggleFavorites}
              className="relative hover:bg-hover-bg dark:hover:bg-hover-bg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm h-9 w-9 md:h-10 md:w-10 border border-transparent hover:border-hover-border dark:hover:border-hover-border active:scale-95"
                aria-label={`Favorites ${favCount} items`}
          >
                <Heart className="h-4 w-4 md:h-5 md:w-5" />
                {!mounted ? (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-sm bg-fintage-graphite/20 dark:bg-fintage-graphite/40 animate-pulse" aria-hidden="true" />
                ) : favCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-sm bg-fintage-steel text-[9px] md:text-[10px] font-mono font-bold text-fintage-offwhite dark:text-fintage-charcoal flex items-center justify-center shadow-fintage-sm tracking-tight" aria-hidden="true">
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
              className="relative hover:bg-hover-bg dark:hover:bg-hover-bg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm h-9 w-9 md:h-10 md:w-10 border border-transparent hover:border-hover-border dark:hover:border-hover-border active:scale-95"
                aria-label={`Shopping cart ${cartCount} items`}
          >
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                {!mounted ? (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-sm bg-fintage-graphite/20 dark:bg-fintage-graphite/40 animate-pulse" aria-hidden="true" />
                ) : cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-sm bg-fintage-steel text-[9px] md:text-[10px] font-mono font-bold text-fintage-offwhite dark:text-fintage-charcoal flex items-center justify-center shadow-fintage-sm tracking-tight" aria-hidden="true">
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
            className="md:hidden hover:bg-hover-bg dark:hover:bg-hover-bg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-sm inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-fintage-graphite/30 dark:border-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-95 relative"
          >
            <span className="sr-only">{drawerOpen ? "Close menu" : "Open menu"}</span>
            <div className="relative w-5 h-5 flex items-center justify-center">
              {/* Верхняя полоска */}
              <motion.span
                className="absolute block h-0.5 w-5 bg-fintage-charcoal dark:bg-fintage-offwhite origin-center"
                animate={{
                  rotate: drawerOpen ? 45 : 0,
                  y: drawerOpen ? 0 : -6,
                }}
                transition={{
                  duration: 0.28,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
              {/* Средняя полоска */}
              <motion.span
                className="absolute block h-0.5 w-5 bg-fintage-charcoal dark:bg-fintage-offwhite origin-center"
                animate={{
                  opacity: drawerOpen ? 0 : 1,
                  scale: drawerOpen ? 0 : 1,
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
              {/* Нижняя полоска */}
              <motion.span
                className="absolute block h-0.5 w-5 bg-fintage-charcoal dark:bg-fintage-offwhite origin-center"
                animate={{
                  rotate: drawerOpen ? -45 : 0,
                  y: drawerOpen ? 0 : 6,
                }}
                transition={{
                  duration: 0.28,
                  ease: [0.4, 0, 0.2, 1],
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
      {/* Navigation - технический стиль */}
      <nav className="px-2 pt-2 pb-3 space-y-2">
        {/* Техническая подпись секции */}
        <div className="px-3 mb-2">
          <span className="text-[9px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/40 uppercase tracking-[0.2em]">
            {t('header.navigation') || 'NAVIGATION'}
          </span>
        </div>
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
                  'group relative flex items-center justify-between rounded-sm px-5 py-4 text-xs font-mono transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-[0.98] uppercase tracking-[0.2em]',
                  isActive
                    ? 'bg-fintage-steel text-fintage-offwhite dark:text-fintage-charcoal border border-fintage-steel shadow-fintage-sm'
                    : 'text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg hover:text-accent border border-transparent hover:border-hover-border dark:hover:border-hover-border'
                )}
              >
                <span suppressHydrationWarning className="relative z-10 flex-1">
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 rounded-sm bg-fintage-steel"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Divider - технический */}
      <motion.div 
        variants={itemVariants}
        className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 mx-2 my-4" 
      />

      {/* Action Buttons - технический стиль */}
      <div className="px-2 pb-3 space-y-2.5">
        {/* Техническая подпись секции */}
        <div className="px-3 mb-2">
          <span className="text-[9px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/40 uppercase tracking-[0.2em]">
            {t('header.actions') || 'ACTIONS'}
          </span>
        </div>
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

      {/* Settings Section - технический стиль */}
      <motion.div 
        variants={itemVariants}
        className="mt-auto pt-4 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30"
      >
        <div className="px-2 pb-2">
          {/* Техническая подпись секции */}
          <div className="px-3 mb-2">
            <span className="text-[9px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/40 uppercase tracking-[0.2em]">
              {t('common.settings') || 'SETTINGS'}
            </span>
          </div>
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
      className="group relative flex w-full items-center justify-between gap-3 rounded-sm px-5 py-4 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 border border-fintage-graphite/20 dark:border-fintage-graphite/30 hover:bg-hover-bg dark:hover:bg-hover-bg hover:border-hover-border dark:hover:border-hover-border transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-[0.98] overflow-hidden"
    >
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-fintage-steel/5 to-transparent opacity-0 group-hover:opacity-100 transition-fintage" />
      
      <div className="relative flex items-center gap-3 flex-1">
        <div className="p-2 rounded-sm bg-fintage-offwhite dark:bg-fintage-charcoal transition-fintage group-hover:scale-110 group-hover:bg-active-bg border border-fintage-graphite/20 dark:border-fintage-graphite/30 group-hover:border-hover-border dark:group-hover:border-hover-border">
          {icon}
        </div>
        <span className="text-xs font-mono text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-accent transition-fintage uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative inline-flex h-6 min-w-[24px] items-center justify-center rounded-sm bg-fintage-steel px-2.5 text-[10px] font-mono font-bold text-fintage-offwhite dark:text-fintage-charcoal shadow-fintage-sm tracking-tight"
        >
          {count}
        </motion.span>
      )}
    </button>
  )
})

// Компонент карточки настроек - технический стиль
const SettingsCard = memo(function SettingsCard({
  label,
  icon,
}: {
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="group flex flex-col items-center gap-1.5 p-2.5 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 hover:bg-hover-bg dark:hover:bg-hover-bg hover:border-hover-border dark:hover:border-hover-border transition-fintage cursor-pointer">
      <div className="flex items-center justify-center scale-90">
        {icon}
      </div>
      <span className="text-[9px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 group-hover:text-accent transition-fintage leading-tight uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  )
})
