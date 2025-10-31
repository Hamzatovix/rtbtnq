'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/cart-store'
import Link from 'next/link'

export function CartDrawer() {
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
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-light text-neutral-800">
                Корзина ({totalItems})
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-light text-neutral-800 mb-2">Корзина пуста</h3>
                  <p className="text-sm text-neutral-500 mb-6">Добавьте товары из каталога</p>
                  <Button onClick={toggleCart} asChild>
                    <Link href="/catalog">Перейти к каталогу</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.selectedColor || 'default'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      {/* Product Image placeholder */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-500" />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 truncate">{item.title}</h3>
                        <p className="text-sm text-neutral-500">
                          {item.selectedColor || 'Цвет не выбран'}
                        </p>
                        <p className="text-sm font-medium text-neutral-900">
                          {item.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.selectedColor, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id, item.selectedColor)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500"
                        aria-label="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-neutral-800">Итого:</span>
                  <span className="text-xl font-medium text-neutral-900">
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <Button onClick={toggleCart} className="w-full" asChild>
                  <Link href="/checkout">Оформить заказ</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}