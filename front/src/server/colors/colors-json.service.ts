import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

// Кеш в памяти для оптимизации
let colorsCache: any[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5000 // 5 секунд

function getColorsPath(): string {
  const root = process.cwd()
  return join(root, 'src', 'data', 'colors.json')
}

export async function loadColors(): Promise<any[]> {
  const now = Date.now()
  
  // Возвращаем из кеша если не истек
  if (colorsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return colorsCache
  }
  
  // Загружаем из файла
  const filePath = getColorsPath()
  try {
    const content = await readFile(filePath, 'utf-8')
    colorsCache = JSON.parse(content)
    cacheTimestamp = now
    return colorsCache
  } catch (error) {
    console.error('Error loading colors:', error)
    return []
  }
}

export async function saveColors(colors: any[]): Promise<void> {
  const filePath = getColorsPath()
  await writeFile(filePath, JSON.stringify(colors, null, 2), 'utf-8')
  
  // Обновляем кеш после записи
  colorsCache = colors
  cacheTimestamp = Date.now()
}

