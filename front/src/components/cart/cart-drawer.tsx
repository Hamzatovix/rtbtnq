'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import { useFavoritesStore } from '@/store/favorites-store'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { formatPriceWithLocale } from '@/lib/utils'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { getOptimizedAsset } from '@/lib/optimized-assets'
import { createPortal } from 'react-dom'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { MOBILE_MENU_CONFIG } from '@/components/layout/mobile-menu.constants'

export function CartDrawer() {
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
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalItems,
  } = useCartStore()

  const { isOpen: favoritesIsOpen, toggleFavorites } = useFavoritesStore()
  const prevIsOpenRef = useRef(false)

  useLockBodyScroll(isOpen)

  // Закрываем избранное при открытии корзины
  useEffect(() => {
    // Если корзина только что открылась (была закрыта, стала открыта)
    if (isOpen && !prevIsOpenRef.current && favoritesIsOpen) {
      // Небольшая задержка для плавного закрытия
      const timeoutId = setTimeout(() => {
        toggleFavorites()
      }, 50)
      prevIsOpenRef.current = isOpen
      return () => clearTimeout(timeoutId)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, favoritesIsOpen, toggleFavorites])

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
        toggleCart()
      }
    }

    document.addEventListener('keydown', handleTab)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('keydown', handleTab)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, mounted, toggleCart])

  // Handle swipe gesture - вертикальный для мобильных, горизонтальный для десктопа
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = MOBILE_MENU_CONFIG.SWIPE_THRESHOLD
    
    if (isDesktop) {
      // Десктоп: свайп вправо для закрытия
      const velocity = info.velocity.x
      if (info.offset.x > threshold || velocity > MOBILE_MENU_CONFIG.SWIPE_VELOCITY) {
        toggleCart()
      } else {
        x.set(0)
      }
    } else {
      // Мобильные: свайп вверх для закрытия
      const velocity = info.velocity.y
      if (info.offset.y < -threshold || velocity < -MOBILE_MENU_CONFIG.SWIPE_VELOCITY) {
        toggleCart()
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

  const handleQuantityChange = (id: number, color: string | undefined, qty: number) => {
    if (qty <= 0) {
      removeItem(id, color)
      return
    }
    updateQuantity(id, qty, color)
  }

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

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
            className={`fixed inset-0 z-[48] bg-black/60 dark:bg-black/80 backdrop-blur-sm dark:backdrop-blur-md ${isDesktop ? '' : 'md:hidden'}`}
            onClick={toggleCart}
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
            className={`fixed z-[49] bg-fintage-offwhite dark:bg-fintage-charcoal border border-fintage-graphite/20 dark:border-fintage-steel/30 shadow-fintage-md will-change-[transform,opacity] flex flex-col ${
              isDesktop
                ? 'right-0 w-full max-w-md border-l'
                : 'left-0 right-0 w-full max-h-[calc(100vh-96px)] border-b'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={t('cart.title')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe indicator - только на мобильных, технический стиль */}
            {!isDesktop && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-px bg-fintage-graphite/30 dark:bg-fintage-graphite/40" aria-hidden="true" />
            )}

            {/* Header - технический стиль */}
            <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 pt-6 pb-4 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
              <h2 className="text-lg md:text-xl font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-tighter">
                {t('cart.title')} <span className="font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50">({totalItems})</span>
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 border border-transparent hover:border-hover-border dark:hover:border-hover-border"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5 text-fintage-charcoal dark:text-fintage-offwhite" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <ShoppingBag className="w-16 h-16 text-fintage-graphite dark:text-fintage-graphite/60 mb-4" />
                  <h3 className="text-lg font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite mb-2 uppercase tracking-tighter">{t('cart.empty')}</h3>
                  <p className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 mb-6 uppercase tracking-[0.2em]">{t('favorites.empty') || ''}</p>
                  <Button onClick={toggleCart} asChild>
                    <Link href="/catalog">{t('favorites.continueShopping')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="py-6 space-y-4">
                  {items.map((item) => {
                    const normalizedSource = item.image
                      ? item.image.startsWith('http')
                        ? item.image
                        : item.image.startsWith('/')
                          ? item.image
                          : `/${item.image}`
                      : undefined

                    const asset = normalizedSource
                      ? normalizedSource.startsWith('http')
                        ? { src: normalizedSource, fallback: normalizedSource, placeholder: undefined }
                        : getOptimizedAsset(normalizedSource, 360)
                      : undefined

                    return (
                      <motion.div
                        key={`${item.id}-${item.selectedColor || 'default'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center space-x-4 p-4 bg-fintage-graphite/10 dark:bg-fintage-graphite/20 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30"
                      >
                      {/* Product Image */}
                      {asset ? (
                        <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border border-fintage-graphite/20 dark:border-fintage-graphite/30 relative">
                          <OptimizedImage
                            src={asset.src}
                            fallbackSrc={asset.fallback}
                            placeholder={asset.placeholder ? 'blur' : 'empty'}
                            blurDataURL={asset.placeholder}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-fintage-graphite/20 dark:bg-fintage-graphite/30 rounded-sm flex-shrink-0 flex items-center justify-center border border-fintage-graphite/20 dark:border-fintage-graphite/30">
                          <ShoppingBag className="w-6 h-6 text-fintage-graphite dark:text-fintage-graphite/60" />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite truncate text-sm uppercase tracking-tighter">{item.title}</h3>
                        <p className="text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] mt-1">
                          {item.selectedColor || (locale === 'ru' ? 'цвет не выбран' : 'Color not selected')}
                        </p>
                        <p className="text-sm font-bold text-fintage-charcoal dark:text-fintage-offwhite mt-1">
                          {formatPriceWithLocale(item.price, locale)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity - 1)}
                          className="p-1 hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 border border-transparent hover:border-hover-border dark:hover:border-hover-border"
                          aria-label={locale === 'ru' ? 'уменьшить количество' : 'Decrease quantity'}
                        >
                          <Minus className="w-4 h-4 text-fintage-charcoal dark:text-fintage-offwhite" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-fintage-charcoal dark:text-fintage-offwhite tracking-tight">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity + 1)}
                          className="p-1 hover:bg-hover-bg dark:hover:bg-hover-bg rounded-sm transition-fintage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 border border-transparent hover:border-hover-border dark:hover:border-hover-border"
                          aria-label={locale === 'ru' ? 'увеличить количество' : 'Increase quantity'}
                        >
                          <Plus className="w-4 h-4 text-fintage-charcoal dark:text-fintage-offwhite" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id, item.selectedColor)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-sm transition-colors duration-200 ease-vintage text-red-500 dark:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 border-2 border-transparent hover:border-red-500"
                        aria-label={locale === 'ru' ? 'удалить товар' : 'Remove item'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer - технический стиль */}
            {items.length > 0 && (
              <div className="border-t border-fintage-graphite/20 dark:border-fintage-graphite/30 px-4 md:px-6 lg:px-8 py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.2em]">{t('cart.total')}</span>
                  <span className="text-lg font-bold text-fintage-charcoal dark:text-fintage-offwhite">
                    {formatPriceWithLocale(totalPrice, locale)}
                  </span>
                </div>
                <Button onClick={toggleCart} className="w-full" asChild>
                  <Link href="/checkout">{t('cart.checkout')}</Link>
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

export default CartDrawer