import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'

interface FavoritesStore {
  items: Product[]
  isOpen: boolean
  addToFavorites: (product: Product) => void
  removeFromFavorites: (id: number) => void
  isFavorite: (id: number) => boolean
  clearFavorites: () => void
  toggleFavorites: () => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addToFavorites: (product) => {
        const { items } = get()
        if (!items.find(item => item.id === product.id)) {
          set({ items: [...items, product] })
        }
      },
      
      removeFromFavorites: (id) => {
        const { items } = get()
        set({ items: items.filter(item => item.id !== id) })
      },
      
      isFavorite: (id) => {
        const { items } = get()
        return items.some(item => item.id === id)
      },
      
      clearFavorites: () => set({ items: [] }),
      
      toggleFavorites: () => set(state => ({ isOpen: !state.isOpen }))
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ items: state.items }) // Only persist items, not isOpen
    }
  )
)


