import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

// Кеш в памяти для оптимизации
let productsCache: any[] = []
let cacheTimestamp = 0
let cacheInitialized = false
const CACHE_TTL = 5000 // 5 секунд

function getProductsPath(): string {
  const root = process.cwd()
  return join(root, 'src', 'data', 'products.json')
}

export async function loadProducts(): Promise<any[]> {
  const now = Date.now()
  
  // Возвращаем из кеша если не истек
  if (cacheInitialized && (now - cacheTimestamp) < CACHE_TTL) {
    return productsCache
  }
  
  // Загружаем из файла
  const filePath = getProductsPath()
  try {
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content)
    
    // Поддерживаем оба формата: массив и объект с results
    if (Array.isArray(data)) {
      productsCache = data
    } else if (data && Array.isArray(data.results)) {
      productsCache = data.results
    } else {
      productsCache = []
    }
    
    cacheTimestamp = now
    cacheInitialized = true
    return productsCache
  } catch (error) {
    console.error('Error loading products:', error)
    return []
  }
}

export async function saveProducts(products: any[], originalFormat: 'array' | 'wrapped' = 'wrapped'): Promise<void> {
  const filePath = getProductsPath()
  
  // Сохраняем в том же формате, что и исходный файл
  let outputData: any
  if (originalFormat === 'wrapped') {
    outputData = {
      count: products.length,
      next: null,
      previous: null,
      results: products
    }
  } else {
    outputData = products
  }
  
  await writeFile(filePath, JSON.stringify(outputData, null, 2), 'utf-8')
  
  // Обновляем кеш после записи
  productsCache = products
  cacheTimestamp = Date.now()
  cacheInitialized = true
}

export async function getProductById(id: string): Promise<any | null> {
  const products = await loadProducts()
  return products.find((prod: any) => String(prod.id) === String(id) || prod.slug === id) || null
}

