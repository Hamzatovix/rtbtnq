/**
 * React хуки для работы с API данными через SWR
 */

import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from './swr-config';
import { useLocaleStore } from '@/store/locale-store';
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
  colorImages?: Record<string, string>;
  is_featured: boolean;
}

// Хук для получения категорий с SWR
export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[] | { results: any[] }>(
    '/api/categories',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 минута
    }
  );

  const categories = useMemo(() => {
    if (!data) return [];
    
    // API возвращает массив категорий
    const apiCategories = Array.isArray(data) ? data : (data.results || []);
    
    // Фильтруем только активные (опубликованные) категории для каталога
    const activeCategories = apiCategories.filter((cat: any) => cat.is_active !== false);
    
    // Преобразуем в нужный формат
    const formatted: Category[] = activeCategories.map((cat: any) => ({
      id: String(cat.id),
      slug: cat.slug,
      name: cat.name,
    }));
    
    // Сортируем по position
    formatted.sort((a, b) => {
      const aPos = apiCategories.find((c: any) => String(c.id) === a.id)?.position || 0;
      const bPos = apiCategories.find((c: any) => String(c.id) === b.id)?.position || 0;
      return aPos - bPos;
    });
    
    return formatted;
  }, [data]);

  return { 
    categories, 
    loading: isLoading, 
    error: error?.message || null 
  };
}

// Хук для получения цветов с SWR
export function useColors() {
  const { data, error, isLoading } = useSWR<{ results: any[] }>(
    '/api/colors',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 минута
    }
  );

  const colors = useMemo(() => {
    if (!data) return [];
    
    const apiColors = data.results || [];
    // Преобразуем в нужный формат
    return apiColors.map((color: any) => ({
      id: String(color.id),
      name: color.name,
      hex_code: color.hex || color.hex_code || '#9CA3AF',
      hex: color.hex || color.hex_code || '#9CA3AF',
      slug: color.slug || color.name.toLowerCase().replace(/\s+/g, '-'),
    }));
  }, [data]);

  return { 
    colors, 
    loading: isLoading, 
    error: error?.message || null 
  };
}

// Хук для получения товаров с фильтрацией через SWR
export function useProducts(filters: {
  category?: string;
  color?: number;
} = {}) {
  const { locale } = useLocaleStore();

  // Загружаем все данные параллельно через SWR
  const { data: productsData, error: productsError, isLoading: productsLoading } = useSWR<{ results: any[] }>(
    '/api/products',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const { data: categoriesData } = useSWR<Category[] | { results: any[] }>(
    '/api/categories',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const { data: colorsData } = useSWR<{ results: any[] }>(
    '/api/colors',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const products = useMemo(() => {
    if (!productsData || !categoriesData || !colorsData) return [];

    try {
      // Получаем массивы данных
      const apiProducts = productsData.results || [];
      const allCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.results || []);
      const colors = colorsData.results || [];
      
      // Фильтруем только опубликованные товары
      let filtered = apiProducts.filter((p: any) => p.isPublished === true);

      // Фильтр по категории (по slug или id категории)
      if (filters.category) {
        filtered = filtered.filter((p: any) => {
          const catId = String(p.categoryId || '');
          // Находим категорию товара
          const productCategory = allCategories.find((c: any) => String(c.id) === catId);
          const catSlug = productCategory?.slug || '';
          // Проверяем по ID или slug
          return catId === filters.category || 
                 catSlug === filters.category;
        });
      }

      // Фильтр по цвету
      if (filters.color !== undefined) {
        const targetColor = colors.find((c: any) => Number(c.id) === filters.color);
        if (targetColor) {
          filtered = filtered.filter((p: any) => {
            return (p.variants || []).some((v: any) => String(v.colorId) === String(targetColor.id));
          });
        }
      }

      // Преобразуем в ProductListItem формат
      return filtered.map((product: any) => {
        // Получаем первый вариант для цены
        const firstVariant = (product.variants || [])[0];
        const price = firstVariant ? (firstVariant.priceCents / 100) : 0;
        
        // Находим категорию товара
        const productCategory = allCategories.find((c: any) => String(c.id) === String(product.categoryId));
        
        // Получаем изображения вариантов
        const variantImages = (product.variants || []).reduce((acc: any, v: any) => {
          if (v.colorId && v.images && v.images.length > 0) {
            acc[v.colorId] = v.images[0].url;
          }
          return acc;
        }, {});

        // Получаем цвета из вариантов
        const productColors = (product.variants || [])
          .map((v: any) => {
            const color = colors.find((c: any) => String(c.id) === String(v.colorId));
            return color ? {
              id: String(color.id),
              name: color.name,
              hex_code: color.hex || color.hex_code || '#9CA3AF'
            } : null;
          })
          .filter(Boolean) as Array<{ id: string; name: string; hex_code: string }>;

        return {
          id: Number(product.id),
          slug: product.slug,
          name: product.name,
          category: {
            id: product.categoryId || '',
            name: productCategory?.name || product.categoryId || '',
            slug: productCategory?.slug || product.categoryId || '',
          } as unknown as Category,
          thumbnail: firstVariant?.images?.[0]?.url || null,
          price_range: price,
          colors: productColors,
          colorImages: variantImages,
          is_featured: product.is_featured || false,
        }
      });
    } catch (err) {
      console.error('Error processing products:', err);
      return [];
    }
  }, [productsData, categoriesData, colorsData, filters.category, filters.color]);

  const loading = productsLoading || !categoriesData || !colorsData;
  const error = productsError?.message || null;

  return {
    products,
    loading,
    error,
    hasMore: false,
    loadMore: () => {},
    refetch: () => {
      // SWR автоматически обновит данные при изменении ключей
    }
  };
}

// Хук для получения отдельного продукта по ID/slug
export function useProduct(idOrSlug: string) {
  const { data, error, isLoading } = useSWR<any>(
    idOrSlug ? `/api/products/${idOrSlug}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    product: data || null,
    loading: isLoading,
    error: error?.message || null,
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
        description: variant.description || '',
        price: parseFloat(variant.price || variant.price_range || '0'),
        category: variant.category || '',
        image: variant.image || '',
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
