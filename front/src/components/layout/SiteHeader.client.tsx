'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import { AnimatePresence, motion } from 'framer-motion'

type NavLink = { href: string; label: string }
const navLinks: Readonly<NavLink[]> = Object.freeze([
  { href: '/catalog', label: 'collection' },
  { href: '/about', label: 'about' },
])

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dialogId = useId()
  const { toggleCart, getTotalItems } = useCartStore()
  const { items: favorites, toggleFavorites } = useFavoritesStore()

  useEffect(() => {
    setMounted(true)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-mistGray/30 bg-white/80 backdrop-breathing supports-[backdrop-filter]:bg-white/60 shadow-breathing">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group" aria-label="Go to homepage">
            <span
              className="text-graceful text-xl font-light text-inkSoft group-hover:text-sageTint transition-colors duration-500 ease-out"
            >
              rosebotanique store
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-whisper hover:text-sageTint transition-colors font-light text-base tracking-wide relative group"
              >
                {l.label}
                <span className="absolute -bottom-2 left-0 w-0 h-px bg-gradient-to-r from-sageTint to-transparent group-hover:w-full transition-all duration-500 ease-out" />
              </Link>
            ))}
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
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls={dialogId}
            onClick={() => setOpen(true)}
              className="md:hidden hover:bg-sageTint/5 transition-all duration-500 ease-out rounded-xl inline-flex h-10 w-10 items-center justify-center border border-neutral-200"
          >
            <span className="sr-only">Open menu</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-neutral-900" />
              <span className="block h-0.5 w-6 bg-neutral-900" />
              <span className="block h-0.5 w-6 bg-neutral-900" />
            </div>
          </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.div
            key="panel"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-label`}
            id={dialogId}
            className="fixed inset-x-0 top-0 z-50 rounded-b-2xl bg-white border-b border-neutral-200 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div id={`${dialogId}-label`} className="font-serif text-lg">Menu</div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200"
              >
                <span className="sr-only">Close</span>
                <div className="relative h-5 w-5">
                  <span className="absolute inset-0 rotate-45 block h-0.5 w-5 bg-neutral-900 top-1/2" />
                  <span className="absolute inset-0 -rotate-45 block h-0.5 w-5 bg-neutral-900 top-1/2" />
                </div>
              </button>
            </div>

            <nav className="px-4 pb-4">
              <ul className="divide-y divide-neutral-200">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base text-neutral-800">
                      {l.label}
                    </Link>
                  </li>
                ))}
                {/* Mobile cart and favorites */}
                <li className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-neutral-800">Cart</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        toggleCart()
                        setOpen(false)
                      }}
                      className="relative hover:bg-sageTint/5 transition-all duration-500 ease-out rounded-xl h-10 w-10"
                      aria-label={`Shopping cart (${mounted ? getTotalItems() : 0} items)`}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {mounted && getTotalItems() > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sageTint text-[10px] text-linenWhite flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
                          {getTotalItems()}
                        </span>
                      )}
                    </Button>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-neutral-800">Favorites</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        toggleFavorites()
                        setOpen(false)
                      }}
                      className="relative hover:bg-sageTint/5 transition-all duration-500 ease-out rounded-xl h-10 w-10"
                      aria-label={`Favorites (${mounted ? favorites.length : 0} items)`}
                    >
                      <Heart className="h-4 w-4" />
                      {mounted && favorites.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sageTint text-[10px] text-linenWhite flex items-center justify-center font-medium shadow-breathing" aria-hidden="true">
                          {favorites.length}
                        </span>
                      )}
                    </Button>
                  </div>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}


