'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'
import { formatPriceWithLocale } from '@/lib/utils'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { getOptimizedAsset } from '@/lib/optimized-assets'

export function CartDrawer() {
  const t = useTranslations()
  const locale = useClientLocale()
  const {
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalItems,
  } = useCartStore()

  const handleQuantityChange = (id: number, color: string | undefined, qty: number) => {
    if (qty <= 0) {
      removeItem(id, color)
      return
    }
    updateQuantity(id, qty, color)
  }

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[49]"
            onClick={toggleCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-card shadow-xl dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-[50] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={t('cart.title')}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-mistGray/20 dark:border-border">
              <h2 className="text-xl font-light text-inkSoft dark:text-foreground">
                {t('cart.title')} ({totalItems})
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-mistGray/10 dark:hover:bg-muted/30 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={t('common.close')}
              >
                <X className="w-5 h-5 text-inkSoft dark:text-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <ShoppingBag className="w-16 h-16 text-mistGray dark:text-muted-foreground mb-4" />
                  <h3 className="text-lg font-light text-inkSoft dark:text-foreground mb-2">{t('cart.empty')}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{t('favorites.empty') || ''}</p>
                  <Button onClick={toggleCart} asChild>
                    <Link href="/catalog">{t('favorites.continueShopping')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
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
                        className="flex items-center space-x-4 p-4 bg-mistGray/5 dark:bg-muted/10 rounded-xl border border-mistGray/20 dark:border-border"
                      >
                      {/* Product Image */}
                      {asset ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-mistGray/20 dark:border-border relative">
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
                        <div className="w-16 h-16 bg-mistGray/20 dark:bg-muted/20 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-light text-inkSoft dark:text-foreground truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.selectedColor || (locale === 'ru' ? 'цвет не выбран' : 'Color not selected')}
                        </p>
                        <p className="text-sm font-light text-inkSoft dark:text-foreground">
                          {formatPriceWithLocale(item.price, locale)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity - 1)}
                          className="p-1 hover:bg-mistGray/20 dark:hover:bg-muted/30 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={locale === 'ru' ? 'уменьшить количество' : 'Decrease quantity'}
                        >
                          <Minus className="w-4 h-4 text-inkSoft dark:text-foreground" />
                        </button>
                        <span className="w-8 text-center font-light text-inkSoft dark:text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity + 1)}
                          className="p-1 hover:bg-mistGray/20 dark:hover:bg-muted/30 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sageTint dark:focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={locale === 'ru' ? 'увеличить количество' : 'Increase quantity'}
                        >
                          <Plus className="w-4 h-4 text-inkSoft dark:text-foreground" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id, item.selectedColor)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors text-red-500 dark:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-mistGray/20 dark:border-border p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-light text-inkSoft dark:text-foreground">{t('cart.total')}</span>
                  <span className="text-xl font-light text-inkSoft dark:text-foreground">
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
}

export default CartDrawer