'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { MobileDrawer } from './MobileDrawer'
import { LocaleSwitcher } from '@/components/i18n/locale-switcher'
import { useTranslations } from '@/hooks/useTranslations'

export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toggleCart, getTotalItems } = useCartStore()
  const { items: favorites, toggleFavorites } = useFavoritesStore()
  const t = useTranslations()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mistGray/30 bg-white/80 backdrop-breathing supports-[backdrop-filter]:bg-white/60 shadow-breathing">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group" aria-label="на главную">
            <span
              className="text-graceful text-xl font-light text-inkSoft group-hover:text-sageTint transition-colors duration-500 ease-out"
            >
              rosebotanique store
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link
              href="/catalog"
              className="text-whisper hover:text-sageTint transition-colors font-light text-base tracking-wide relative group"
            >
              {t('header.collection')}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-sageTint to-transparent group-hover:w-full transition-all duration-500 ease-out" />
            </Link>
            <Link
              href="/about"
              className="text-whisper hover:text-sageTint transition-colors font-light text-base tracking-wide relative group"
            >
              {t('header.about')}
              <span className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-sageTint to-transparent group-hover:w-full transition-all duration-500 ease-out" />
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
              className="relative hover:bg-sageTint/5 transition-all duration-500 ease-out rounded-xl md:rounded-2xl h-10 w-10 md:h-11 md:w-11"
                aria-label={`Favorites (${favCount} items)`}
          >
                <Heart className="h-4 w-4 md:h-5 md:w-5" />
                {favCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-sageTint text-[10px] md:text-xs text-linenWhite flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
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
              className="relative hover:bg-sageTint/5 transition-all duration-500 ease-out rounded-xl md:rounded-2xl h-10 w-10 md:h-11 md:w-11"
                aria-label={`Shopping cart (${cartCount} items)`}
          >
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-sageTint text-[10px] md:text-xs text-linenWhite flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
                    {cartCount}
                  </span>
                )}
          </Button>
              )
            })()}
            {/* Locale switcher: desktop only */}
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>
          <button
            type="button"
            aria-label="открыть меню"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden hover:bg-sageTint/5 transition-all duration-500 ease-out rounded-full inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-mistGray/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 active:scale-98"
          >
            <span className="sr-only">Open menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-inkSoft" />
              <span className="block h-0.5 w-5 bg-inkSoft" />
              <span className="block h-0.5 w-5 bg-inkSoft" />
            </div>
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="меню" id="mobile-drawer">
        {/* Navigation Links */}
        <nav className="space-y-2">
          <Link
            href="/catalog"
            onClick={() => setDrawerOpen(false)}
            className="block px-4 py-3 rounded-full text-base font-light text-inkSoft hover:bg-mistGray/10 transition-[transform,background-color] duration-250 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 active:scale-98"
          >
            {t('header.collection')}
          </Link>
          <Link
            href="/about"
            onClick={() => setDrawerOpen(false)}
            className="block px-4 py-3 rounded-full text-base font-light text-inkSoft hover:bg-mistGray/10 transition-[transform,background-color] duration-250 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 active:scale-98"
          >
            {t('header.about')}
          </Link>
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-mistGray/20" />

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Cart */}
          <button
            type="button"
            onClick={() => {
              toggleCart()
              setDrawerOpen(false)
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full text-base font-light text-inkSoft hover:bg-mistGray/10 transition-[transform,background-color] duration-250 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 active:scale-98"
            aria-label={`Shopping cart (${mounted ? getTotalItems() : 0} items)`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5" />
              <span>{t('header.cart')}</span>
            </div>
            {mounted && getTotalItems() > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-sageTint text-xs text-white font-light">
                {getTotalItems()}
              </span>
            )}
          </button>

          {/* Favorites */}
          <button
            type="button"
            onClick={() => {
              toggleFavorites()
              setDrawerOpen(false)
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full text-base font-light text-inkSoft hover:bg-mistGray/10 transition-[transform,background-color] duration-250 ease-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint focus-visible:ring-offset-2 active:scale-98"
            aria-label={`Favorites (${mounted ? favorites.length : 0} items)`}
          >
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5" />
              <span>{t('header.favorites')}</span>
            </div>
            {mounted && favorites.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-sageTint text-xs text-white font-light">
                {favorites.length}
              </span>
            )}
          </button>
        </div>

        {/* Locale switcher in mobile drawer (last) */}
        <div className="my-4 border-t border-mistGray/20" />
        <div className="pt-2">
          <LocaleSwitcher />
        </div>
      </MobileDrawer>
    </header>
  )
}


