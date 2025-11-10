/**
 * Общие клиентские хуки и прокси к состояниям стора.
 */

export function useCart() {
  const { useCartStore } = require('@/store/cart-store')
  const store = useCartStore()

  return {
    items: store.items,
    addToCart: (variant: any, qty: number = 1) => {
      const productInfo = variant.product || {}
      const colorInfo = variant.color || {}

      store.addItem({
        id: parseInt(variant.id) || Date.now(),
        title: productInfo.name || variant.name || 'Product',
        description: variant.description || '',
        price: parseFloat(String(variant.price ?? '0')),
        category: variant.category || '',
        image: variant.image || '',
        colors: [],
        quantity: qty,
        selectedColor: colorInfo.name || '',
      })
    },
    removeFromCart: (variantId: number) => {
      store.removeItem(variantId, '')
    },
    updateQuantity: (variantId: number, qty: number) => {
      store.updateQuantity(variantId, qty, '')
    },
    clearCart: () => {
      store.clearCart()
    },
    getTotalPrice: store.getTotalPrice,
    getTotalItems: store.getTotalItems,
  }
}

// Дополнительные хуки пока не используются после удаления legacy-store.
