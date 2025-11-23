'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavoritesStore } from '@/store/favorites-store'
import { useCartStore } from '@/store/cart-store'
import { formatPriceWithLocale } from '@/lib/utils'
import { Product } from '@/types'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { getOptimizedAsset } from '@/lib/optimized-assets'
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { MOBILE_MENU_CONFIG } from '@/components/layout/mobile-menu.constants'

export function FavoritesDrawer() {
  const t = useTranslations()
  const locale = useClientLocale()
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const reducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const focusableElementsRef = useRef<NodeListOf<HTMLElement> | null>(null)
  
  // Motion values for swipe gesture
  const y = useMotionValue(0)
  const x = useMotionValue(0)
  const opacityY = useTransform(y, [-100, 0], [0, 1])
  const opacityX = useTransform(x, [100, 0], [0, 1])
  const [isDragging, setIsDragging] = useState(false)

  const { 
    items: favorites, 
    isOpen, 
    toggleFavorites, 
    removeFromFavorites 
  } = useFavoritesStore()
  
  const { isOpen: cartIsOpen, toggleCart } = useCartStore()
  const prevIsOpenRef = useRef(false)

  useLockBodyScroll(isOpen)

  // Закрываем корзину при открытии избранного
  useEffect(() => {
    // Если избранное только что открылось (было закрыто, стало открыто)
    if (isOpen && !prevIsOpenRef.current && cartIsOpen) {
      // Небольшая задержка для плавного закрытия
      const timeoutId = setTimeout(() => {
        toggleCart()
      }, 50)
      prevIsOpenRef.current = isOpen
      return () => clearTimeout(timeoutId)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, cartIsOpen, toggleCart])

  // Mount check for SSR and detect desktop
  useEffect(() => {
    setMounted(true)
    
    // Check if desktop (md breakpoint = 768px)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Reset motion values when drawer closes
  useEffect(() => {
    if (!isOpen) {
      y.set(0)
      x.set(0)
      setIsDragging(false)
    }
  }, [isOpen, y, x])

  // Keyboard navigation and focus trap
  useEffect(() => {
    if (!isOpen || !mounted) return

    const panel = panelRef.current
    if (!panel) return

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const focusableElements = panel.querySelectorAll<HTMLElement>(focusableSelectors)
    focusableElementsRef.current = focusableElements
    const firstElement = focusableElements[0]

    if (firstElement) {
      setTimeout(() => firstElement.focus(), MOBILE_MENU_CONFIG.FOCUS_DELAY)
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const elements = focusableElementsRef.current
      if (!elements || elements.length === 0) {
        e.preventDefault()
        return
      }

      const firstEl = elements[0]
      const lastEl = elements[elements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleFavorites()
      }
    }

    document.addEventListener('keydown', handleTab)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleTab)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, mounted, toggleFavorites])

  // Handle swipe gesture - вертикальный для мобильных, горизонтальный для десктопа
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = MOBILE_MENU_CONFIG.SWIPE_THRESHOLD
    
    if (isDesktop) {
      // Десктоп: свайп вправо для закрытия
      const velocity = info.velocity.x
      if (info.offset.x > threshold || velocity > MOBILE_MENU_CONFIG.SWIPE_VELOCITY) {
        toggleFavorites()
      } else {
        x.set(0)
      }
    } else {
      // Мобильные: свайп вверх для закрытия
      const velocity = info.velocity.y
      if (info.offset.y < -threshold || velocity < -MOBILE_MENU_CONFIG.SWIPE_VELOCITY) {
        toggleFavorites()
      } else {
        y.set(0)
      }
    }
    setIsDragging(false)
  }

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isDesktop) {
      // Десктоп: разрешаем drag только вправо
      if (info.offset.x < 0) {
        x.set(0)
      }
    } else {
      // Мобильные: разрешаем drag только вверх
      if (info.offset.y > 0) {
        y.set(0)
      }
    }
  }

  const { addItem } = useCartStore()

  const handleAddToCart = (product: Product) => {
    addItem({ ...product, quantity: 1, selectedColor: product.colors[0] })
  }

  if (!mounted) return null

  const headerHeight = MOBILE_MENU_CONFIG.HEADER_HEIGHT
  const motionConfig = reducedMotion
    ? { duration: 0 }
    : { 
        duration: MOBILE_MENU_CONFIG.ANIMATION_DURATION, 
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
      }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={isDesktop ? {} : { top: `${headerHeight}px` }}
            className={`fixed inset-0 z-[48] bg-black/20 dark:bg-black/30 backdrop-blur-sm ${isDesktop ? '' : 'md:hidden'}`}
            onClick={toggleFavorites}
            aria-hidden="true"
          />
          
          {/* Drawer Panel - справа на десктопе, сверху на мобильных */}
          <motion.div
            ref={panelRef}
            drag={isDesktop ? "x" : "y"}
            dragConstraints={isDesktop 
              ? { left: 0, right: Infinity } 
              : { top: -Infinity, bottom: 0 }
            }
            dragElastic={isDesktop
              ? { right: MOBILE_MENU_CONFIG.DRAG_ELASTIC, left: 0 }
              : { top: MOBILE_MENU_CONFIG.DRAG_ELASTIC, bottom: 0 }
            }
            onDragStart={() => setIsDragging(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{
              ...(isDesktop 
                ? { top: `${headerHeight}px`, right: 0, height: `calc(100vh - ${headerHeight}px)` }
                : { top: `${headerHeight}px`, left: 0, right: 0 }
              ),
              ...(isDragging 
                ? isDesktop 
                  ? { x, opacity: opacityX } 
                  : { y, opacity: opacityY }
                : {}
              ),
            }}
            initial={reducedMotion 
              ? {} 
              : isDesktop 
                ? { x: '100%', opacity: 0 }
                : { y: '-100%', opacity: 0 }
            }
            animate={reducedMotion || isDragging 
              ? {} 
              : { x: 0, y: 0, opacity: 1 }
            }
            exit={reducedMotion 
              ? {} 
              : isDesktop 
                ? { x: '100%', opacity: 0 }
                : { y: '-100%', opacity: 0 }
            }
            transition={isDragging ? { duration: 0 } : motionConfig}
            className={`fixed z-[49] bg-fintage-offwhite/95 dark:bg-fintage-charcoal/95 backdrop-blur-sm supports-[backdrop-filter]:bg-fintage-offwhite/90 dark:supports-[backdrop-filter]:bg-fintage-charcoal/90 border border-fintage-graphite/20 dark:border-fintage-steel/30 shadow-fintage-md will-change-[transform,opacity] flex flex-col ${
              isDesktop
                ? 'right-0 w-full max-w-md border-l-2'
                : 'left-0 right-0 w-full max-h-[calc(100vh-96px)] border-b-2'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={t('favorites.title')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe indicator - только на мобильных, технический стиль */}
            {!isDesktop && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-px bg-fintage-graphite/30 dark:bg-fintage-graphite/40" aria-hidden="true" />
            )}

            {/* Header - технический стиль */}
            <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 pt-6 pb-4 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
              <h2 className="text-lg md:text-xl font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-tighter">
                {t('favorites.title')} <span className="font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50">({favorites.length})</span>
              </h2>
              <button
                type="button"
                onClick={toggleFavorites}
                className="p-2 hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 border border-transparent hover:border-hover-border dark:hover:border-hover-border"
                aria-label={t('common.close')}
              >
                <X className="h-5 w-5 text-fintage-charcoal dark:text-fintage-offwhite" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
                  <Heart className="h-16 w-16 text-fintage-graphite dark:text-fintage-graphite/60" />
                  <h3 className="text-lg font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-tighter">{t('favorites.empty')}</h3>
                  <Button onClick={toggleFavorites} asChild>
                    <Link href="/catalog">{t('favorites.continueShopping')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="py-6 space-y-4">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-fintage-graphite/10 dark:bg-fintage-graphite/20 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30">
                        {(() => {
                          if (item.image.startsWith('http')) {
                            return (
                              <OptimizedImage
                                src={item.image}
                                fallbackSrc={item.image}
                                placeholder="empty"
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 80px, 100px"
                                className="object-cover"
                              />
                            )
                          }

                          const normalizedPath = item.image.startsWith('/') ? item.image : `/${item.image}`
                          const asset = getOptimizedAsset(normalizedPath, 360)
                          return (
                            <OptimizedImage
                              src={asset.src}
                              fallbackSrc={asset.fallback}
                              placeholder={asset.placeholder ? 'blur' : 'empty'}
                              blurDataURL={asset.placeholder}
                              alt={item.title}
                              fill
                              sizes="(max-width: 768px) 80px, 100px"
                              className="object-cover"
                            />
                          )
                        })()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite truncate text-sm uppercase tracking-tighter">{item.title}</h4>
                        <p className="text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] line-clamp-1 mt-1">{item.description || ''}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold text-fintage-charcoal dark:text-fintage-offwhite">
                            {formatPriceWithLocale(item.price, locale)}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                            >
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              {t('product.addToCart')}
                            </Button>
                            <button
                              type="button"
                              onClick={() => removeFromFavorites(item.id)}
                              className="h-8 w-8 rounded-full border border-mistGray/20 dark:border-border hover:bg-mistGray/10 dark:hover:bg-muted/30 transition-colors flex items-center justify-center text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400 focus-visible:ring-offset-2"
                              aria-label={locale === 'ru' ? 'удалить из избранного' : 'remove from favorites'}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {favorites.length > 0 && (
              <div className="border-t border-mistGray/20 dark:border-border/50 px-4 md:px-6 lg:px-8 py-6">
                <Button variant="outline" className="w-full rounded-full" onClick={toggleFavorites}>
                  {t('favorites.continueShopping')}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

export default FavoritesDrawer

