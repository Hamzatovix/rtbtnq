export interface BackofficeCategory {
  id: string | number
  name: string
  slug: string
  parent?: string | number | null
  position?: number
  is_active?: boolean
}

export interface BackofficeColor {
  id: string | number
  name: string
  slug: string
  hex_code?: string
  hex?: string
}

export interface BackofficeProductImage {
  id?: number
  url: string
  alt?: string
  position?: number
  is_cover?: boolean
}

export interface BackofficeProductVariant {
  id?: string | number
  color?: string | number
  colorId?: string | number
  sku?: string
  price?: number
  priceCents?: number
  stock?: number
  stockQty?: number
  is_active?: boolean
  isDefault?: boolean
  images?: Array<{ url: string }>
}

export interface BackofficeProduct {
  id: string | number
  slug: string
  name: string
  description?: string
  category?: string | number
  categoryId?: string | number
  materials?: string
  material?: string
  care?: string
  isPublished?: boolean
  is_published?: boolean
  is_featured?: boolean
  images?: BackofficeProductImage[]
  variants: BackofficeProductVariant[]
  seo_title?: string
  seo_description?: string
  createdAt?: string
  updatedAt?: string
}

export interface BackofficePaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}


