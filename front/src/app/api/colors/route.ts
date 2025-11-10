import { NextRequest, NextResponse } from 'next/server'
import { loadColors, saveColors } from '@/server/colors/colors-json.service'
import { getCatalogData } from '@/server/catalog/catalog.service'

// Цвета меняются редко - кешируем на 1 час
export const revalidate = 3600

export async function GET(req: NextRequest) {
  try {
    const catalog = await getCatalogData({ includeRaw: true })
    const rawColors = Array.isArray(catalog.rawColors) ? catalog.rawColors : []

    const formatted = rawColors.map((color: any) => {
      const hex = color.hex || color.hex_code || '#000000'
      return {
        ...color,
        id: String(color.id),
        hex,
        hex_code: hex,
      }
    })

    // Удаляем дубликаты по slug
    const uniqueColors = formatted.reduce((acc: any[], color: any) => {
      const existing = acc.find(c => c.slug === color.slug)
      if (!existing) {
        acc.push(color)
      }
      return acc
    }, [])
    
    return NextResponse.json({ results: uniqueColors }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error: any) {
    console.error('Ошибка при чтении цветов:', error)
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, slug, hex } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name и slug обязательны' },
        { status: 400 }
      )
    }

    // Используем сервис с кешем в памяти
    const colors = await loadColors()

    // Проверяем уникальность slug
    if (colors.some((col: any) => col.slug === slug)) {
      return NextResponse.json(
        { error: 'Цвет с таким slug уже существует' },
        { status: 400 }
      )
    }

    const newId = Date.now().toString()
    const newColor = {
      id: newId,
      slug,
      name,
      hex: hex || '#000000',
    }

    colors.push(newColor)
    // Сохраняем через сервис (обновит кеш автоматически)
    await saveColors(colors)

    return NextResponse.json(newColor, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при создании цвета:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании цвета' },
      { status: 500 }
    )
  }
}
