/**
 * Global state management using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductListItem } from '@/lib/api';
type Variant = { id: number; price: string };

// Cart state
interface CartItem {
  variant: Variant;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (variant: Variant, quantity?: number) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (variant: Variant, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.variant.id === variant.id);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.variant.id === variant.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { variant, quantity }],
          };
        });
      },
      
      removeItem: (variantId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.variant.id !== variantId),
        }));
      },
      
      updateQuantity: (variantId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.variant.id === variantId
              ? { ...item, quantity }
              : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },
      
      getTotalItems: () => {
        const { items } = get();
        // Мемоизация: пересчитываем только при изменении items
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        // Мемоизация: пересчитываем только при изменении items
        return items.reduce((total, item) => {
          return total + (parseFloat(item.variant.price) * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Favorites state
interface FavoritesState {
  items: ProductListItem[];
  addToFavorites: (product: ProductListItem) => void;
  removeFromFavorites: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToFavorites: (product: ProductListItem) => {
        set((state) => {
          if (state.items.find(item => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },
      
      removeFromFavorites: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== productId),
        }));
      },
      
      isFavorite: (productId: number) => {
        return get().items.some(item => item.id === productId);
      },
      
      clearFavorites: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);

// UI state
interface UIState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  error: null,
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  },
}));

// User state
interface UserState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
  updateUser: (user: any) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      
      login: (user: any, token: string) => {
        set({ isAuthenticated: true, user, token });
      },
      
      logout: () => {
        set({ isAuthenticated: false, user: null, token: null });
      },
      
      updateUser: (user: any) => {
        set({ user });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token 
      }),
    }
  )
);

// Search state
interface SearchState {
  query: string;
  filters: {
    category?: string;
    color?: number;
    is_featured?: boolean;
    ordering?: string;
  };
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  filters: {},
  
  setQuery: (query: string) => {
    set({ query });
  },
  
  setFilters: (filters: Partial<SearchState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },
  
  clearSearch: () => {
    set({ query: '', filters: {} });
  },
}));

// Theme state
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },
      
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Notification state
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    }, duration);
  },
  
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Utility hooks
export const useCart = () => {
  const store = useCartStore();
  return {
    items: store.items,
    isOpen: store.isOpen,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
    totalItems: store.getTotalItems(),
    totalPrice: store.getTotalPrice(),
  };
};

export const useFavorites = () => {
  const store = useFavoritesStore();
  return {
    items: store.items,
    addToFavorites: store.addToFavorites,
    removeFromFavorites: store.removeFromFavorites,
    isFavorite: store.isFavorite,
    clearFavorites: store.clearFavorites,
  };
};

export const useNotifications = () => {
  const store = useNotificationStore();
  return {
    notifications: store.notifications,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
  };
};
