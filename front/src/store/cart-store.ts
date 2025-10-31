import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: CartItem) => void
  removeItem: (id: number, color?: string) => void
  updateQuantity: (id: number, quantity: number, color?: string) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product) => {
        const { items } = get()
        const existingItem = items.find(
          item => item.id === product.id && item.selectedColor === product.selectedColor
        )
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id && item.selectedColor === product.selectedColor
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          })
        }
      },
      
      removeItem: (id, color) => {
        const { items } = get()
        set({
          items: items.filter(
            item => !(item.id === id && item.selectedColor === color)
          )
        })
      },
      
      updateQuantity: (id, quantity, color) => {
        const { items } = get()
        if (quantity <= 0) {
          get().removeItem(id, color)
          return
        }
        
        set({
          items: items.map(item =>
            item.id === id && item.selectedColor === color
              ? { ...item, quantity }
              : item
          )
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      
      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
      
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)


