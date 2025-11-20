import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { loadGallery, saveGallery } from '@/server/gallery/gallery-json.service'

// GET - получить все изображения галереи
export async function GET() {
  try {
    const images = await loadGallery()
    return NextResponse.json({ images })
  } catch (error: any) {
    console.error('Ошибка при получении галереи:', error)
    return NextResponse.json({ images: [] }, { status: 200 })
  }
}

// POST - добавить новое изображение в галерею
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { src, alt } = body

    if (!src) {
      return NextResponse.json(
        { error: 'URL изображения обязателен' },
        { status: 400 }
      )
    }

    const images = await loadGallery()
    const newImage = {
      id: nanoid(),
      src,
      alt: alt || '',
    }

    images.push(newImage)
    
    try {
      const saved = await saveGallery(images)
      if (!saved) {
        return NextResponse.json(
          { error: 'Ошибка при сохранении галереи' },
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error('Ошибка при сохранении галереи:', error)
      return NextResponse.json(
        { 
          error: error.message || 'Ошибка при сохранении галереи',
          details: error.message?.includes('Supabase') ? 'Настройте Supabase для production. См. md/GALLERY_SUPABASE_SETUP.md' : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json(newImage, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при добавлении изображения:', error)
    return NextResponse.json(
      { error: 'Ошибка при добавлении изображения' },
      { status: 500 }
    )
  }
}

// PUT - обновить галерею (для обновления alt текста)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { images } = body

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Массив изображений обязателен' },
        { status: 400 }
      )
    }

    try {
      const saved = await saveGallery(images)
      if (!saved) {
        return NextResponse.json(
          { error: 'Ошибка при сохранении галереи' },
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error('Ошибка при обновлении галереи:', error)
      return NextResponse.json(
        { 
          error: error.message || 'Ошибка при обновлении галереи',
          details: error.message?.includes('Supabase') ? 'Настройте Supabase для production. См. md/GALLERY_SUPABASE_SETUP.md' : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, images }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при обновлении галереи:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении галереи' },
      { status: 500 }
    )
  }
}

// DELETE - удалить изображение из галереи
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID изображения обязателен' },
        { status: 400 }
      )
    }

    const images = await loadGallery()
    const filtered = images.filter((img: any) => img.id !== id)

    if (filtered.length === images.length) {
      return NextResponse.json(
        { error: 'Изображение не найдено' },
        { status: 404 }
      )
    }

    try {
      const saved = await saveGallery(filtered)
      if (!saved) {
        return NextResponse.json(
          { error: 'Ошибка при сохранении галереи' },
          { status: 500 }
        )
      }
    } catch (error: any) {
      console.error('Ошибка при удалении изображения:', error)
      return NextResponse.json(
        { 
          error: error.message || 'Ошибка при удалении изображения',
          details: error.message?.includes('Supabase') ? 'Настройте Supabase для production. См. md/GALLERY_SUPABASE_SETUP.md' : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Ошибка при удалении изображения:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении изображения' },
      { status: 500 }
    )
  }
}

