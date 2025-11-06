import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  // Кешированные вычисляемые значения
  _cachedTotalPrice: number
  _cachedTotalItems: number
  _itemsHash: string
  addItem: (product: CartItem) => void
  removeItem: (id: number, color?: string) => void
  updateQuantity: (id: number, quantity: number, color?: string) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

// Функция для создания хеша items (для проверки изменений)
function createItemsHash(items: CartItem[]): string {
  return items.map(item => `${item.id}-${item.selectedColor}-${item.quantity}`).join('|')
}

// Вычисление общей цены (мемоизировано)
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// Вычисление общего количества (мемоизировано)
function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _cachedTotalPrice: 0,
      _cachedTotalItems: 0,
      _itemsHash: '',
      
      addItem: (product) => {
        const { items } = get()
        const existingItem = items.find(
          item => item.id === product.id && item.selectedColor === product.selectedColor
        )
        
        let newItems: CartItem[]
        if (existingItem) {
          newItems = items.map(item =>
            item.id === product.id && item.selectedColor === product.selectedColor
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          newItems = [...items, { ...product, quantity: 1 }]
        }
        
        // Обновляем кеш при изменении items
        const newHash = createItemsHash(newItems)
        set({
          items: newItems,
          _itemsHash: newHash,
          _cachedTotalPrice: calculateTotalPrice(newItems),
          _cachedTotalItems: calculateTotalItems(newItems),
        })
      },
      
      removeItem: (id, color) => {
        const { items } = get()
        const newItems = items.filter(
          item => !(item.id === id && item.selectedColor === color)
        )
        
        // Обновляем кеш
        const newHash = createItemsHash(newItems)
        set({
          items: newItems,
          _itemsHash: newHash,
          _cachedTotalPrice: calculateTotalPrice(newItems),
          _cachedTotalItems: calculateTotalItems(newItems),
        })
      },
      
      updateQuantity: (id, quantity, color) => {
        const { items } = get()
        if (quantity <= 0) {
          get().removeItem(id, color)
          return
        }
        
        const newItems = items.map(item =>
          item.id === id && item.selectedColor === color
            ? { ...item, quantity }
            : item
        )
        
        // Обновляем кеш
        const newHash = createItemsHash(newItems)
        set({
          items: newItems,
          _itemsHash: newHash,
          _cachedTotalPrice: calculateTotalPrice(newItems),
          _cachedTotalItems: calculateTotalItems(newItems),
        })
      },
      
      clearCart: () => {
        set({ 
          items: [],
          _itemsHash: '',
          _cachedTotalPrice: 0,
          _cachedTotalItems: 0,
        })
      },
      
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      
      getTotalPrice: () => {
        const { items, _cachedTotalPrice, _itemsHash } = get()
        const currentHash = createItemsHash(items)
        
        // Если хеш изменился, пересчитываем
        if (currentHash !== _itemsHash) {
          const total = calculateTotalPrice(items)
          set({
            _cachedTotalPrice: total,
            _itemsHash: currentHash,
          })
          return total
        }
        
        return _cachedTotalPrice
      },
      
      getTotalItems: () => {
        const { items, _cachedTotalItems, _itemsHash } = get()
        const currentHash = createItemsHash(items)
        
        // Если хеш изменился, пересчитываем
        if (currentHash !== _itemsHash) {
          const total = calculateTotalItems(items)
          set({
            _cachedTotalItems: total,
            _itemsHash: currentHash,
          })
          return total
        }
        
        return _cachedTotalItems
      }
    }),
    {
      name: 'cart-storage',
      // Исключаем внутренние поля кеша из persist
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen,
      }),
    }
  )
)

// Инициализация кеша после загрузки из persist
if (typeof window !== 'undefined') {
  useCartStore.subscribe((state) => {
    // При инициализации вычисляем кеш, если он не установлен
    if (state.items.length > 0 && state._itemsHash === '') {
      const hash = createItemsHash(state.items)
      useCartStore.setState({
        _itemsHash: hash,
        _cachedTotalPrice: calculateTotalPrice(state.items),
        _cachedTotalItems: calculateTotalItems(state.items),
      })
    }
  })
}


