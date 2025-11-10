import type { Category } from '@/types'

export interface CatalogColor {
  id: string
  name: string
  hex_code: string
}

export interface CatalogProduct {
  id: string
  slug: string
  name: string
  category: Category
  thumbnail: string | null
  price: number | null
  colors: CatalogColor[]
  colorImages?: Record<string, string>
  is_featured?: boolean
}

export interface CatalogData {
  products: CatalogProduct[]
  categories: Category[]
  colors: CatalogColor[]
  rawProducts?: any[]
  rawCategories?: any[]
  rawColors?: any[]
}


