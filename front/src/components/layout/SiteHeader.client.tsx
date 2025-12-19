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
import { Logo } from '@/components/ui/logo'

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
    <header className="sticky top-0 z-50 w-full border-b-2 border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-offwhite/95 dark:bg-fintage-charcoal/95 backdrop-blur-sm supports-[backdrop-filter]:bg-fintage-offwhite/90 dark:supports-[backdrop-filter]:bg-fintage-charcoal/90 shadow-fintage-sm">
      <div className="container mx-auto px-2 max-[370px]:px-2 sm:px-6 md:px-12 lg:px-12">
        <div className="flex min-h-16 h-16 md:h-20 items-center justify-between gap-1 max-[370px]:gap-1">
          {/* Левая группа: Logo/Text */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            {/* Mobile и Desktop: логотип + текст */}
            <Logo
              variant="default"
              showText={true}
              href="/"
              aria-label={t('common.goToHome')}
            />
          </div>

          {/* Центр: Navigation - технический стиль (только desktop) */}
          <nav 
            className="hidden md:flex items-center justify-center flex-1 space-x-5 md:space-x-6 lg:space-x-12"
            aria-label={t('common.mainNavigation')}
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
                    className="text-fintage-charcoal dark:text-fintage-offwhite hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-mono text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase relative group"
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
                    className="text-fintage-charcoal dark:text-fintage-offwhite hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-mono text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase relative group"
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
                    className="text-fintage-charcoal dark:text-fintage-offwhite hover:text-accent transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] font-mono text-[10px] md:text-xs lg:text-sm tracking-[0.2em] uppercase relative group"
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

          {/* Правая группа: Actions */}
          <div className="flex items-center gap-0.5 max-[370px]:gap-0.5 max-[390px]:gap-1 md:gap-2.5 ml-auto flex-shrink-0">
            {/* Mobile: кнопки + кнопка меню */}
            <div className="flex items-center gap-1.5 max-[390px]:gap-1 md:hidden">
              {(() => {
                const favCount = mounted ? favorites.length : 0
                return (
                  <button
                    type="button"
                    onClick={toggleFavorites}
                    className="relative inline-flex h-8 w-8 max-[390px]:h-7 max-[390px]:w-7 items-center justify-center rounded-sm bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80"
                    aria-label={`Favorites ${favCount} items`}
                  >
                    <Heart className="h-3.5 w-3.5 max-[390px]:h-3 max-[390px]:w-3" />
                    {!mounted ? (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 max-[390px]:h-3 max-[390px]:-top-[2px] max-[390px]:-right-[2px] min-w-[14px] max-[390px]:min-w-[12px] rounded-sm bg-fintage-graphite/20 dark:bg-fintage-graphite/40 animate-pulse" aria-hidden="true" />
                    ) : favCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 max-[390px]:h-3 max-[390px]:-top-[2px] max-[390px]:-right-[2px] min-w-[14px] max-[390px]:min-w-[12px] rounded-sm bg-fintage-steel text-[8px] max-[390px]:text-[7px] font-mono text-fintage-offwhite flex items-center justify-center px-0.5 max-[390px]:px-[1px]" aria-hidden="true">
                        {favCount}
                      </span>
                    )}
                  </button>
                )
              })()}
              {(() => {
                const cartCount = mounted ? getTotalItems() : 0
                return (
                  <button
                    type="button"
                    onClick={toggleCart}
                    className="relative inline-flex h-8 w-8 max-[390px]:h-7 max-[390px]:w-7 items-center justify-center rounded-sm bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80"
                    aria-label={`Shopping cart ${cartCount} items`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 max-[390px]:h-3 max-[390px]:w-3" />
                    {!mounted ? (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 max-[390px]:h-3 max-[390px]:-top-[2px] max-[390px]:-right-[2px] min-w-[14px] max-[390px]:min-w-[12px] rounded-sm bg-fintage-graphite/20 dark:bg-fintage-graphite/40 animate-pulse" aria-hidden="true" />
                    ) : cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 max-[390px]:h-3 max-[390px]:-top-[2px] max-[390px]:-right-[2px] min-w-[14px] max-[390px]:min-w-[12px] rounded-sm bg-fintage-steel text-[8px] max-[390px]:text-[7px] font-mono text-fintage-offwhite flex items-center justify-center px-0.5 max-[390px]:px-[1px]" aria-hidden="true">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )
              })()}
            </div>

            {/* Mobile menu button */}
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={drawerOpen ? t('common.closeMenu') : t('common.openMenu')}
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="md:hidden inline-flex h-8 w-8 max-[390px]:h-7 max-[390px]:w-7 items-center justify-center rounded-sm bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80 relative"
            >
              <span className="sr-only">{drawerOpen ? "Close menu" : "Open menu"}</span>
              <div className="relative w-3.5 h-3.5 max-[390px]:w-3 max-[390px]:h-3 flex items-center justify-center">
                {/* Верхняя полоска */}
                <motion.span
                  className="absolute block h-0.5 w-full max-[390px]:h-[1.5px] max-[390px]:w-full bg-fintage-charcoal dark:bg-fintage-offwhite origin-center"
                  animate={{
                    rotate: drawerOpen ? 45 : 0,
                    y: drawerOpen ? 0 : -4.5,
                  }}
                  transition={{
                    duration: 0.28,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
                {/* Средняя полоска */}
                <motion.span
                  className="absolute block h-0.5 w-full max-[390px]:h-[1.5px] max-[390px]:w-full bg-fintage-charcoal dark:bg-fintage-offwhite origin-center"
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
                  className="absolute block h-0.5 w-full max-[390px]:h-[1.5px] max-[390px]:w-full bg-fintage-charcoal dark:bg-fintage-offwhite origin-center"
                  animate={{
                    rotate: drawerOpen ? -45 : 0,
                    y: drawerOpen ? 0 : 4.5,
                  }}
                  transition={{
                    duration: 0.28,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              </div>
            </button>

            {/* Tablet и Desktop: отдельные кнопки + Settings Panel */}
            <div className="hidden md:flex items-center gap-2.5">
              {(() => {
                const favCount = mounted ? favorites.length : 0
                return (
                  <button
                    type="button"
                    onClick={toggleFavorites}
                    className="relative inline-flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-sm bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80"
                    aria-label={`Favorites ${favCount} items`}
                  >
                    <Heart className="h-4 w-4 lg:h-5 lg:w-5" />
                    {!mounted ? (
                      <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-sm bg-fintage-graphite/20 dark:bg-fintage-graphite/40 animate-pulse" aria-hidden="true" />
                    ) : favCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-sm bg-fintage-steel text-[9px] font-mono text-fintage-offwhite flex items-center justify-center px-1" aria-hidden="true">
                        {favCount}
                      </span>
                    )}
                  </button>
                )
              })()}
              {(() => {
                const cartCount = mounted ? getTotalItems() : 0
                return (
                  <button
                    type="button"
                    onClick={toggleCart}
                    className="relative inline-flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-sm bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80"
                    aria-label={`Shopping cart ${cartCount} items`}
                  >
                    <ShoppingBag className="h-4 w-4 lg:h-5 lg:w-5" />
                    {!mounted ? (
                      <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-sm bg-fintage-graphite/20 dark:bg-fintage-graphite/40 animate-pulse" aria-hidden="true" />
                    ) : cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-sm bg-fintage-steel text-[9px] font-mono text-fintage-offwhite flex items-center justify-center px-1" aria-hidden="true">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )
              })()}
              {/* Settings Panel: tablet и desktop */}
              <div className="hidden md:block">
                <SettingsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        title={t('common.menu')} 
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
      {/* Navigation - технический стиль Vintage Nike */}
      <nav className="px-3 pt-2 pb-3 space-y-2">
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
                  'group relative flex items-center rounded-sm px-2 py-2 text-sm md:text-base font-medium font-body transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:scale-[0.97] active:opacity-90 tracking-[0.1em] normal-case',
                  isActive
                    ? 'text-accent'
                    : 'text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span suppressHydrationWarning className="relative z-10 flex-1 pl-3">
                  {link.label}
                </span>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Divider - технический стиль Stone Island */}
      <motion.div 
        variants={itemVariants}
        className="relative mx-3 my-4"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-fintage-graphite/30 dark:border-fintage-graphite/40"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-fintage-offwhite dark:bg-fintage-charcoal text-[8px] font-mono text-fintage-graphite/40 dark:text-fintage-graphite/50 uppercase tracking-[0.3em]">
            ─
          </span>
        </div>
      </motion.div>

      {/* Action Buttons - технический стиль North Face */}
      <div className="px-3 pb-3 space-y-2.5">
        {/* Техническая подпись секции */}
        <div className="px-2 mb-2">
          <span className="text-[10px] font-mono font-semibold text-fintage-graphite/70 dark:text-fintage-graphite/60 uppercase tracking-[0.2em]">
            {t('header.actions') || 'ACTIONS'}
          </span>
        </div>
        <motion.div variants={itemVariants}>
          <ActionButton
            icon={<ShoppingBag className="h-4 w-4" />}
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
            icon={<Heart className="h-4 w-4" />}
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

      {/* Settings Section - технический стиль Stone Island */}
      <motion.div 
        variants={itemVariants}
        className="mt-auto pt-4 border-t border-fintage-graphite/30 dark:border-fintage-graphite/40"
      >
        <div className="px-3 pb-3">
          {/* Техническая подпись секции */}
          <div className="px-2 mb-2">
            <span className="text-[10px] font-mono font-semibold text-fintage-graphite/70 dark:text-fintage-graphite/60 uppercase tracking-[0.2em]">
              {t('common.settings') || 'SETTINGS'}
            </span>
          </div>
          <div className="flex gap-2">
            <motion.div variants={itemVariants} className="flex-1">
              <SettingsCard 
                label={t('common.theme')}
                icon={<ThemeToggle />}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="flex-1">
              <SettingsCard 
                label={t('common.language')}
                icon={<LocaleSwitcher />}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

// Компонент кнопки действия - упрощенный редакционный стиль
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
      className="group flex w-full items-center justify-between gap-2.5 rounded-sm px-3 py-2.5 bg-transparent hover:bg-hover-bg dark:hover:bg-hover-bg border border-fintage-graphite/20 dark:border-fintage-graphite/30 hover:border-hover-border dark:hover:border-hover-border transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 active:opacity-80"
    >
      <div className="flex items-center gap-2.5 flex-1">
        <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-fintage-offwhite dark:bg-fintage-charcoal border border-fintage-graphite/20 dark:border-fintage-graphite/30 transition-fintage">
          {icon}
        </div>
        <span className="text-xs md:text-sm font-medium text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-accent transition-fintage tracking-[0.08em] uppercase">
          {label}
        </span>
      </div>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-sm bg-fintage-steel px-2 text-[10px] font-mono font-semibold text-fintage-offwhite dark:text-fintage-charcoal"
        >
          {count}
        </motion.span>
      )}
    </button>
  )
})

// Компонент карточки настроек - легкий стиль system chips
const SettingsCard = memo(function SettingsCard({
  label,
  icon,
}: {
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="group flex flex-col items-center gap-1 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 bg-fintage-graphite/3 dark:bg-fintage-graphite/8 hover:bg-hover-bg/70 dark:hover:bg-hover-bg/70 hover:border-accent dark:hover:border-accent transition-fintage cursor-pointer active:opacity-80 px-2 py-2.5">
      <div className="flex items-center justify-center group-hover:opacity-90 transition-fintage">
        {icon}
      </div>
      <span className="text-[9px] font-mono text-fintage-graphite/70 dark:text-fintage-graphite/60 group-hover:text-accent transition-fintage leading-tight uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  )
})
