/**
 * React хуки для работы с mock данными
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { mockProducts, mockCategories, colorMap } from './mock-data';
import type { Product, Category } from '@/types';

// Упрощённые типы для совместимости
export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  category: Category;
  thumbnail: string | null;
  price_range: string | number | null;
  colors: Array<{ id: string; name: string; hex_code: string }>;
  is_featured: boolean;
}

// Хук для получения категорий
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация асинхронной загрузки
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 100);
  }, []);

  return { categories, loading, error: null };
}

// Хук для получения цветов
export function useColors() {
  const [colors, setColors] = useState<Array<{ id: string; name: string; hex_code: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const uniqueColors = Array.from(new Set(
        mockProducts.flatMap(p => p.colors)
      ));
      
      const colorsList = uniqueColors.map((colorName, index) => ({
        id: `${index + 1}`,
        name: colorName,
        hex_code: colorMap[colorName.toLowerCase()] || '#9CA3AF'
      }));
      
      setColors(colorsList);
      setLoading(false);
    }, 100);
  }, []);

  return { colors, loading, error: null };
}

// Хук для получения товаров с фильтрацией
export function useProducts(filters: {
  category?: string;
  color?: number;
} = {}) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Имитация асинхронной загрузки
    setTimeout(() => {
      try {
        let filtered = [...mockProducts];

        // Фильтр по категории
        if (filters.category) {
          filtered = filtered.filter(p => 
            p.category.toLowerCase() === filters.category?.toLowerCase()
          );
        }

        // Фильтр по цвету
        if (filters.color !== undefined) {
          const uniqueColors = Array.from(new Set(mockProducts.flatMap(p => p.colors)));
          const colorName = uniqueColors[filters.color];
          if (colorName) {
            filtered = filtered.filter(p => p.colors.includes(colorName));
          }
        }

        // Преобразуем в ProductListItem формат
        const results: ProductListItem[] = filtered.map(product => ({
          id: product.id,
          slug: product.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: product.title,
          category: {
            id: product.category,
            name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
            slug: product.category.toLowerCase().replace(/\s+/g, '-')
          },
          thumbnail: product.image,
          price_range: product.price,
          colors: product.colors.map((colorName, idx) => ({
            id: `${product.id}-${idx}`,
            name: colorName,
            hex_code: colorMap[colorName.toLowerCase()] || '#9CA3AF'
          })),
          is_featured: product.id <= 3
        }));

        setProducts(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки товаров');
      } finally {
        setLoading(false);
      }
    }, 200);
  }, [filters.category, filters.color]);

  return {
    products,
    loading,
    error,
    hasMore: false,
    loadMore: () => {},
    refetch: () => {}
  };
}

// Хук для получения рекомендуемых товаров
export function useFeaturedProducts() {
  const { products } = useProducts({});
  const featured = useMemo(() => 
    products.filter(p => p.is_featured),
    [products]
  );

  return {
    products: featured,
    loading: false,
    error: null
  };
}

// Хук для корзины (используем store)
export function useCart() {
  // Импортируем из store
  const { useCartStore } = require('@/store/cart-store');
  const store = useCartStore();
  
  return {
    items: store.items,
    addToCart: (variant: any, qty: number = 1) => {
      // Преобразуем variant в формат store (CartItem)
      const productInfo = variant.product || {};
      const colorInfo = variant.color || {};
      
      store.addItem({
        id: parseInt(variant.id) || Date.now(),
        title: productInfo.name || variant.name || 'Product',
        description: '',
        price: parseFloat(variant.price || variant.price_range || '0'),
        category: '',
        image: '',
        colors: [],
        quantity: qty,
        selectedColor: colorInfo.name || ''
      });
    },
    removeFromCart: (variantId: number) => {
      store.removeItem(variantId, '');
    },
    updateQuantity: (variantId: number, qty: number) => {
      store.updateQuantity(variantId, qty, '');
    },
    clearCart: () => {
      store.clearCart();
    },
    getTotalPrice: store.getTotalPrice,
    getTotalItems: store.getTotalItems
  };
}

// Re-export store hooks
export { useFavorites, useUser, useUI } from './store';
