import { NextRequest, NextResponse } from 'next/server'
import { loadProducts, saveProducts } from '@/server/products/products-json.service'

// Кеширование для API routes (ISR)
export const revalidate = 60 // Обновлять каждые 60 секунд

export async function GET(req: NextRequest) {
  try {
    // Используем сервис с кешем в памяти
    const products = await loadProducts()
    
    // Форматируем ID как строки
    const formatted = products.map((prod: any) => ({ ...prod, id: String(prod.id) }))
    
    return NextResponse.json({ results: formatted }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error: any) {
    console.error('Ошибка при чтении товаров:', error)
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let name = ''
    let slug = ''
    let description = ''
    let categoryId = ''
    let materials = ''
    let care = ''
    let isPublished = false
    let variants: any[] = []

    const contentType = req.headers.get('content-type') || ''
    console.log('[API Products] Content-Type:', contentType)
    
    if (contentType.includes('application/json')) {
      const body = await req.json()
      console.log('[API Products] Received body:', JSON.stringify(body).substring(0, 200))
      name = body.name || ''
      slug = body.slug || ''
      description = body.description || ''
      categoryId = body.categoryId || ''
      materials = body.materials || ''
      care = body.care || ''
      isPublished = !!body.isPublished
      variants = Array.isArray(body.variants) ? body.variants : []
    } else {
      const formData = await req.formData()
      name = String(formData.get('name') || '')
      slug = String(formData.get('slug') || '')
      description = String(formData.get('description') || '')
      categoryId = String(formData.get('categoryId') || '')
      isPublished = String(formData.get('isPublished')) === 'true'
      materials = String(formData.get('materials') || '')
      care = String(formData.get('care') || '')
      const variantsJson = String(formData.get('variants') || '[]')
      try {
        variants = variantsJson ? JSON.parse(variantsJson) : []
      } catch (parseError) {
        console.error('[API Products] Failed to parse variants JSON:', parseError)
        variants = []
      }
    }

    if (!name || !slug) {
      console.error('[API Products] Missing name or slug:', { name, slug })
      return NextResponse.json(
        { error: 'Name и slug обязательны' },
        { status: 400 }
      )
    }

    // Используем сервис с кешем в памяти
    const products = await loadProducts()
    
    // Определяем формат файла (проверяем первый элемент)
    // Для простоты используем wrapped формат
    const originalFormat: 'array' | 'wrapped' = 'wrapped'

    // Проверяем уникальность slug
    if (products.some((prod: any) => prod.slug === slug)) {
      return NextResponse.json(
        { error: 'Товар с таким slug уже существует' },
        { status: 400 }
      )
    }

    const newId = Date.now().toString()
    
    // Генерируем SKU для каждого варианта
    const variantsWithSku = variants.map((variant: any, idx: number) => ({
      ...variant,
      sku: variant.sku || `${newId}-${variant.colorId || idx}`,
    }))

    const newProduct = {
      id: newId,
      slug,
      name,
      description: description || '',
      materials: materials || undefined,
      care: care || undefined,
      categoryId: categoryId || null,
      isPublished: !!isPublished,
      is_featured: false,
      variants: variantsWithSku,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    products.push(newProduct)
    
    // Сохраняем через сервис (обновит кеш автоматически)
    try {
      await saveProducts(products, originalFormat)
      console.log('[API Products] Product created successfully:', newId)
    } catch (writeError: any) {
      console.error('[API Products] Error writing file:', writeError)
      return NextResponse.json(
        { error: `Ошибка сохранения файла: ${writeError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error: any) {
    console.error('[API Products] Error creating product:', error)
    console.error('[API Products] Error stack:', error.stack)
    return NextResponse.json(
      { error: `Ошибка при создании товара: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

