/**
 * Mock API клиент (без бэкенда)
 * Использует локальные mock данные
 */

import { mockProducts, mockCategories, colorMap } from './mock-data';
import type { Product, Category } from '@/types';

// Экспортируем типы для совместимости
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

// Упрощённый API клиент с mock данными
class MockApiClient {
  async getCategories(): Promise<Category[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCategories), 100);
    });
  }

  async getColors(): Promise<Array<{ id: string; name: string; hex_code: string }>> {
    return new Promise((resolve) => {
      const colors = Array.from(new Set(
        mockProducts.flatMap(p => p.colors)
      )).map((colorName, index) => ({
        id: `${index + 1}`,
        name: colorName,
        hex_code: colorMap[colorName.toLowerCase()] || '#9CA3AF'
      }));
      setTimeout(() => resolve(colors), 100);
    });
  }

  async getProducts(filters: {
    category?: string;
    color?: number;
    page?: number;
  } = {}): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: ProductListItem[];
  }> {
    return new Promise((resolve) => {
      let filtered = [...mockProducts];

      // Фильтр по категории
      if (filters.category) {
        filtered = filtered.filter(p => 
          p.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      // Фильтр по цвету
      if (filters.color !== undefined) {
        const colors = Array.from(new Set(mockProducts.flatMap(p => p.colors)));
        const colorName = colors[filters.color];
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
        colorImages: product.colorImages,
        is_featured: product.id <= 3
      }));

      setTimeout(() => resolve({
        count: results.length,
        next: null,
        previous: null,
        results
      }), 200);
    });
  }

  async getFeaturedProducts(): Promise<ProductListItem[]> {
    return this.getProducts({}).then(res => res.results.filter(p => p.is_featured));
  }
}

export const apiClient = new MockApiClient();
