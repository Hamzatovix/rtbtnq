'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface CartItem {
  id: string
  variant: {
    id: number
    product: {
      name: string
      slug: string
    }
    color: {
      id: number
      name: string
      hex_code: string
    }
    price: string
    stock_qty: number
  }
  quantity: number
  addedAt: string
}

export interface FavoriteItem {
  id: string
  product: {
    id: number
    name: string
    slug: string
    thumbnail?: string
    price_range?: string
  }
  addedAt: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface AppState {
  // Cart
  cart: CartItem[]
  cartCount: number
  
  // Favorites
  favorites: FavoriteItem[]
  favoritesCount: number
  
  // User
  user: User | null
  isAuthenticated: boolean
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Actions
  addToCart: (variant: any, quantity: number) => void
  removeFromCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  
  addToFavorites: (product: any) => void
  removeFromFavorites: (productId: number) => void
  clearFavorites: () => void
  
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: [],
      cartCount: 0,
      favorites: [],
      favoritesCount: 0,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Cart actions
      addToCart: (variant, quantity) => {
        const state = get()
        const existingItem = state.cart.find(
          item => item.variant.id === variant.id
        )

        if (existingItem) {
          // Update existing item
          const updatedCart = state.cart.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
          set({
            cart: updatedCart,
            cartCount: updatedCart.reduce((sum, item) => sum + item.quantity, 0)
          })
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${variant.id}-${Date.now()}`,
            variant,
            quantity,
            addedAt: new Date().toISOString()
          }
          const updatedCart = [...state.cart, newItem]
          set({
            cart: updatedCart,
            cartCount: updatedCart.reduce((sum, item) => sum + item.quantity, 0)
          })
        }
      },

      removeFromCart: (itemId) => {
        const state = get()
        const updatedCart = state.cart.filter(item => item.id !== itemId)
        set({
          cart: updatedCart,
          cartCount: updatedCart.reduce((sum, item) => sum + item.quantity, 0)
        })
      },

      updateCartQuantity: (itemId, quantity) => {
        const state = get()
        if (quantity <= 0) {
          get().removeFromCart(itemId)
          return
        }

        const updatedCart = state.cart.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
        set({
          cart: updatedCart,
          cartCount: updatedCart.reduce((sum, item) => sum + item.quantity, 0)
        })
      },

      clearCart: () => {
        set({ cart: [], cartCount: 0 })
      },

      // Favorites actions
      addToFavorites: (product) => {
        const state = get()
        const existingItem = state.favorites.find(
          item => item.product.id === product.id
        )

        if (!existingItem) {
          const newItem: FavoriteItem = {
            id: `fav-${product.id}-${Date.now()}`,
            product,
            addedAt: new Date().toISOString()
          }
          const updatedFavorites = [...state.favorites, newItem]
          set({
            favorites: updatedFavorites,
            favoritesCount: updatedFavorites.length
          })
        }
      },

      removeFromFavorites: (productId) => {
        const state = get()
        const updatedFavorites = state.favorites.filter(
          item => item.product.id !== productId
        )
        set({
          favorites: updatedFavorites,
          favoritesCount: updatedFavorites.length
        })
      },

      clearFavorites: () => {
        set({ favorites: [], favoritesCount: 0 })
      },

      // User actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user
        })
      },

      // UI actions
      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      }
    }),
    {
      name: 'rsbtq-store',
      partialize: (state) => ({
        cart: state.cart,
        cartCount: state.cartCount,
        favorites: state.favorites,
        favoritesCount: state.favoritesCount,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Selectors
export const useCart = () => {
  const cart = useAppStore(state => state.cart)
  const cartCount = useAppStore(state => state.cartCount)
  const addToCart = useAppStore(state => state.addToCart)
  const removeFromCart = useAppStore(state => state.removeFromCart)
  const updateCartQuantity = useAppStore(state => state.updateCartQuantity)
  const clearCart = useAppStore(state => state.clearCart)

  return {
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart
  }
}

export const useFavorites = () => {
  const favorites = useAppStore(state => state.favorites)
  const favoritesCount = useAppStore(state => state.favoritesCount)
  const addToFavorites = useAppStore(state => state.addToFavorites)
  const removeFromFavorites = useAppStore(state => state.removeFromFavorites)
  const clearFavorites = useAppStore(state => state.clearFavorites)

  return {
    favorites,
    favoritesCount,
    addToFavorites,
    removeFromFavorites,
    clearFavorites
  }
}

export const useUser = () => {
  const user = useAppStore(state => state.user)
  const isAuthenticated = useAppStore(state => state.isAuthenticated)
  const setUser = useAppStore(state => state.setUser)

  return {
    user,
    isAuthenticated,
    setUser
  }
}

export const useUI = () => {
  const isLoading = useAppStore(state => state.isLoading)
  const error = useAppStore(state => state.error)
  const setLoading = useAppStore(state => state.setLoading)
  const setError = useAppStore(state => state.setError)

  return {
    isLoading,
    error,
    setLoading,
    setError
  }
}
