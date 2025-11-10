import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { isSupabaseEnabled, supabaseDelete, supabaseSelect, supabaseUpsert } from '@/lib/supabase-admin'

const SUPABASE_PRODUCTS_TABLE = process.env.SUPABASE_PRODUCTS_TABLE || 'products'

// Кеш в памяти для оптимизации
let productsCache: any[] = []
let cacheTimestamp = 0
let cacheInitialized = false
const CACHE_TTL = 5000 // 5 секунд

function getProductsPath(): string {
  const root = process.cwd()
  return join(root, 'src', 'data', 'products.json')
}

async function loadProductsFromSupabase(): Promise<any[]> {
  try {
    const data = await supabaseSelect<Array<{ id: string; data: any }>>(
      SUPABASE_PRODUCTS_TABLE,
      'select=id,data&order=created_at.asc',
    )

    return (Array.isArray(data) ? data : []).map((row) => {
      const payload = row.data ?? {}
      return {
        ...payload,
        id: String(payload.id ?? row.id ?? ''),
      }
    })
  } catch (err) {
    console.error('Supabase loadProducts error:', err)
    return []
  }
}

async function saveProductsToSupabase(products: any[]): Promise<void> {
  const rows = products.map((product: any) => ({
    id: String(product.id ?? ''),
    name: product.name ?? null,
    slug: product.slug ?? null,
    data: product,
    created_at: product.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  await supabaseDelete(SUPABASE_PRODUCTS_TABLE, '')

  if (rows.length) {
    await supabaseUpsert(SUPABASE_PRODUCTS_TABLE, rows)
  }
}

export async function loadProducts(): Promise<any[]> {
  const now = Date.now()

  if (cacheInitialized && now - cacheTimestamp < CACHE_TTL) {
    return productsCache
  }

  let products: any[]

  if (isSupabaseEnabled()) {
    products = await loadProductsFromSupabase()
  } else {
    const filePath = getProductsPath()
    try {
      const content = await readFile(filePath, 'utf-8')
      const data = JSON.parse(content)

      if (Array.isArray(data)) {
        products = data
      } else if (data && Array.isArray(data.results)) {
        products = data.results
      } else {
        products = []
      }
    } catch (error) {
      console.error('Error loading products:', error)
      products = []
    }
  }

  productsCache = products
  cacheTimestamp = now
  cacheInitialized = true

  return productsCache
}

export async function saveProducts(products: any[], originalFormat: 'array' | 'wrapped' = 'wrapped'): Promise<void> {
  if (isSupabaseEnabled()) {
    await saveProductsToSupabase(products)
    productsCache = products
    cacheTimestamp = Date.now()
    cacheInitialized = true
    return
  }

  const filePath = getProductsPath()

  let outputData: any
  if (originalFormat === 'wrapped') {
    outputData = {
      count: products.length,
      next: null,
      previous: null,
      results: products,
    }
  } else {
    outputData = products
  }

  await writeFile(filePath, JSON.stringify(outputData, null, 2), 'utf-8')

  productsCache = products
  cacheTimestamp = Date.now()
  cacheInitialized = true
}

export async function getProductById(id: string): Promise<any | null> {
  const products = await loadProducts()
  return products.find((prod: any) => String(prod.id) === String(id) || prod.slug === id) || null
}

