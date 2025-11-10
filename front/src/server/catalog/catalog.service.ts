import type { CatalogColor, CatalogData, CatalogProduct } from '@/types/catalog'
import type { Category } from '@/types'
import { loadProducts } from '@/server/products/products-json.service'
import { loadCategories } from '@/server/categories/categories-json.service'
import { loadColors } from '@/server/colors/colors-json.service'

interface CatalogFilters {
  categorySlug?: string
  colorId?: string
}

interface CatalogDataOptions extends CatalogFilters {
  includeRaw?: boolean
}

function mapCategories(rawCategories: any[]): Category[] {
  if (!Array.isArray(rawCategories)) return []
  return rawCategories
    .filter((cat) => cat?.is_active !== false)
    .map((cat) => ({
      id: String(cat.id ?? ''),
      slug: String(cat.slug ?? ''),
      name: String(cat.name ?? ''),
    }))
    .sort((a, b) => {
      const aPos = Number(rawCategories.find((c) => String(c.id) === a.id)?.position ?? 0)
      const bPos = Number(rawCategories.find((c) => String(c.id) === b.id)?.position ?? 0)
      return aPos - bPos
    })
}

function mapColors(rawColors: any[]): CatalogColor[] {
  if (!Array.isArray(rawColors)) return []
  return rawColors.map((color) => ({
    id: String(color.id ?? ''),
    name: String(color.name ?? ''),
    hex_code: String(color.hex || color.hex_code || '#9CA3AF'),
  }))
}

function buildProductListItem(
  product: any,
  categories: Category[],
  colors: CatalogColor[],
): CatalogProduct | null {
  if (!product?.isPublished) return null

  const productCategory =
    categories.find((c) => String(c.id) === String(product.categoryId)) ??
    ({
      id: product.categoryId ? String(product.categoryId) : '',
      slug: product.categoryId ? String(product.categoryId) : '',
      name: product.categoryId ? String(product.categoryId) : '',
    } as Category)

  const variants = Array.isArray(product.variants) ? product.variants : []

  const productColors = variants
    .map((variant: any) => {
      const color = colors.find((c) => String(c.id) === String(variant.colorId))
      if (!color) return null
      return color
    })
    .filter((color: CatalogColor | null): color is CatalogColor => Boolean(color))

  const variantImages = variants.reduce((acc: Record<string, string>, variant: any) => {
    const firstImage = variant?.images?.[0]?.url
    if (variant.colorId && firstImage) {
      acc[String(variant.colorId)] = firstImage
    }
    return acc
  }, {})

  const priceInCents = variants[0]?.priceCents

  return {
    id: String(product.id ?? ''),
    slug: String(product.slug ?? ''),
    name: String(product.name ?? ''),
    category: productCategory,
    thumbnail: variants[0]?.images?.[0]?.url ?? null,
    price: typeof priceInCents === 'number' ? Math.round(priceInCents) / 100 : null,
    colors: productColors,
    colorImages: Object.keys(variantImages).length ? variantImages : undefined,
    is_featured: Boolean(product.is_featured),
  }
}

function filterProducts(
  products: CatalogProduct[],
  filters: CatalogFilters,
): CatalogProduct[] {
  let filtered = products

  if (filters.categorySlug) {
    filtered = filtered.filter((product) => product.category.slug === filters.categorySlug)
  }

  if (filters.colorId) {
    filtered = filtered.filter((product) =>
      product.colors.some((color) => color.id === filters.colorId),
    )
  }

  return filtered
}

export async function getCatalogData(options: CatalogDataOptions = {}): Promise<CatalogData> {
  const { includeRaw = false, ...filters } = options
  const [rawProducts, rawCategories, rawColors] = await Promise.all([
    loadProducts(),
    loadCategories(),
    loadColors(),
  ])

  const categories = mapCategories(rawCategories)
  const colors = mapColors(rawColors)

  const products = (Array.isArray(rawProducts) ? rawProducts : [])
    .map((product) => buildProductListItem(product, categories, colors))
    .filter((product): product is CatalogProduct => Boolean(product))

  const filteredProducts = filterProducts(products, filters)

  const result: CatalogData = {
    products: filteredProducts,
    categories,
    colors,
  }

  if (includeRaw) {
    result.rawProducts = Array.isArray(rawProducts) ? rawProducts : []
    result.rawCategories = Array.isArray(rawCategories) ? rawCategories : []
    result.rawColors = Array.isArray(rawColors) ? rawColors : []
  }

  return result
}


