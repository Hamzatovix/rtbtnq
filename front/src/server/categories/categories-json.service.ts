import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

// Кеш в памяти для оптимизации
let categoriesCache: any[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5000 // 5 секунд

function getCategoriesPath(): string {
  const root = process.cwd()
  return join(root, 'src', 'data', 'categories.json')
}

export async function loadCategories(): Promise<any[]> {
  const now = Date.now()
  
  // Возвращаем из кеша если не истек
  if (categoriesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return categoriesCache
  }
  
  // Загружаем из файла
  const filePath = getCategoriesPath()
  try {
    const content = await readFile(filePath, 'utf-8')
    categoriesCache = JSON.parse(content)
    cacheTimestamp = now
    return categoriesCache
  } catch (error) {
    console.error('Error loading categories:', error)
    return []
  }
}

export async function saveCategories(categories: any[]): Promise<void> {
  const filePath = getCategoriesPath()
  await writeFile(filePath, JSON.stringify(categories, null, 2), 'utf-8')
  
  // Обновляем кеш после записи
  categoriesCache = categories
  cacheTimestamp = Date.now()
}

