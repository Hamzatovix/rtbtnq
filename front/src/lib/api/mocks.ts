/**
 * MSW handlers for backoffice API
 * Serves fixtures from src/data/*.json
 */

import categories from '@/data/categories.json'
import colors from '@/data/colors.json'
import products from '@/data/products.json'

// Типы для совместимости с реальным API
export interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
  position: number
  is_active: boolean
}

export interface Color {
  id: number
  name: string
  hex_code: string
}

export interface ProductImage {
  id: number
  url: string
  alt: string
  position: number
  is_cover: boolean
}

export interface ProductVariant {
  id: number
  color: number
  sku: string
  price: number
  stock: number
  is_active: boolean
}

export interface Product {
  id: number
  slug: string
  name: string
  description: string
  category: number
  material: string
  care: string
  is_published: boolean
  is_featured: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  seo_title: string
  seo_description: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Mock API client для backoffice
 * Использует локальные JSON фикстуры
 */
class MockBackofficeAPI {
  // Категории (массив)
  async getCategories(): Promise<Category[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(categories as Category[]), 100)
    })
  }

  // Цвета (массив)
  async getColors(): Promise<Color[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(colors as Color[]), 100)
    })
  }

  // Товары (пагинированный объект)
  async getProducts(params?: {
    page?: number
    search?: string
    category?: number
    is_published?: boolean
  }): Promise<PaginatedResponse<Product>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...(products.results as Product[])]

        // Фильтры (базовая реализация)
        if (params?.category) {
          results = results.filter(p => p.category === params.category)
        }
        if (params?.is_published !== undefined) {
          results = results.filter(p => p.is_published === params.is_published)
        }
        if (params?.search) {
          const searchLower = params.search.toLowerCase()
          results = results.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            p.description.toLowerCase().includes(searchLower)
          )
        }

        const response: PaginatedResponse<Product> = {
          count: results.length,
          next: null,
          previous: null,
          results
        }

        resolve(response)
      }, 200)
    })
  }

  // Получить товар по slug
  async getProduct(slug: string): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = (products.results as Product[]).find(p => p.slug === slug)
        resolve(product || null)
      }, 100)
    })
  }
}

// Экспортируем singleton instance
export const mockBackofficeAPI = new MockBackofficeAPI()

