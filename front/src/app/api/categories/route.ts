import { NextRequest, NextResponse } from 'next/server'
import { loadCategories, saveCategories } from '@/server/categories/categories-json.service'
import { getCatalogData } from '@/server/catalog/catalog.service'

// Категории меняются редко - кешируем на 1 час
export const revalidate = 3600

export async function GET(req: NextRequest) {
  try {
    const catalog = await getCatalogData({ includeRaw: true })
    const rawCategories = Array.isArray(catalog.rawCategories) ? catalog.rawCategories : []
    const formatted = rawCategories.map((cat: any) => ({ ...cat, id: String(cat.id) }))

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error: any) {
    console.error('Ошибка при чтении категорий:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, name, position = 0, is_active = true } = body

    if (!slug || !name) {
      return NextResponse.json(
        { error: 'Slug и name обязательны' },
        { status: 400 }
      )
    }

    // Используем сервис с кешем в памяти
    const categories = await loadCategories()

    // Проверяем уникальность slug
    if (categories.some((cat: any) => cat.slug === slug)) {
      return NextResponse.json(
        { error: 'Категория с таким slug уже существует' },
        { status: 400 }
      )
    }

    // Генерируем ID
    const newId = Date.now().toString()
    const newCategory = {
      id: newId,
      slug,
      name,
      position,
      is_active,
    }

    categories.push(newCategory)
    // Сохраняем через сервис (обновит кеш автоматически)
    await saveCategories(categories)

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при создании категории:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании категории' },
      { status: 500 }
    )
  }
}

