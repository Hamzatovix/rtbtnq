import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const productsPath = join(__dirname, '..', 'src', 'data', 'products.json')

// Функция для генерации slug из названия
function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Создаем несколько пустых товаров
const emptyProducts = [
  {
    id: Date.now().toString(),
    slug: 'product-1',
    name: 'Товар 1',
    description: '',
    materials: '',
    care: '',
    categoryId: null,
    isPublished: false,
    is_featured: false,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: (Date.now() + 1).toString(),
    slug: 'product-2',
    name: 'Товар 2',
    description: '',
    materials: '',
    care: '',
    categoryId: null,
    isPublished: false,
    is_featured: false,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: (Date.now() + 2).toString(),
    slug: 'product-3',
    name: 'Товар 3',
    description: '',
    materials: '',
    care: '',
    categoryId: null,
    isPublished: false,
    is_featured: false,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: (Date.now() + 3).toString(),
    slug: 'product-4',
    name: 'Товар 4',
    description: '',
    materials: '',
    care: '',
    categoryId: null,
    isPublished: false,
    is_featured: false,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: (Date.now() + 4).toString(),
    slug: 'product-5',
    name: 'Товар 5',
    description: '',
    materials: '',
    care: '',
    categoryId: null,
    isPublished: false,
    is_featured: false,
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

async function createEmptyProducts() {
  try {
    // Читаем текущий файл
    let currentData
    try {
      const content = await readFile(productsPath, 'utf-8')
      currentData = JSON.parse(content)
    } catch (error) {
      // Если файл не существует или пустой, создаем новую структуру
      currentData = {
        count: 0,
        next: null,
        previous: null,
        results: [],
      }
    }

    // Получаем существующие товары
    const existingProducts = Array.isArray(currentData.results) ? currentData.results : []
    
    // Проверяем, какие товары уже существуют (по slug)
    const existingSlugs = new Set(existingProducts.map(p => p.slug))
    const newProducts = emptyProducts.filter(p => !existingSlugs.has(p.slug))
    
    if (newProducts.length === 0) {
      console.log('Все пустые товары уже существуют!')
      return
    }

    // Добавляем новые товары
    const updatedProducts = [...existingProducts, ...newProducts]

    // Сохраняем в формате wrapped
    const outputData = {
      count: updatedProducts.length,
      next: null,
      previous: null,
      results: updatedProducts,
    }

    await writeFile(productsPath, JSON.stringify(outputData, null, 2), 'utf-8')
    
    console.log(`✅ Создано ${newProducts.length} пустых товаров:`)
    newProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (slug: ${product.slug})`)
    })
    console.log(`\n📦 Всего товаров в базе: ${updatedProducts.length}`)
  } catch (error) {
    console.error('❌ Ошибка при создании товаров:', error)
    process.exit(1)
  }
}

createEmptyProducts()

