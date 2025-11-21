import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { loadGallery, saveGallery } from '@/server/gallery/gallery-json.service'

// GET - получить все изображения галереи
export async function GET() {
  try {
    console.log('[Gallery API] GET запрос получен')
    console.log('[Gallery API] Environment:', {
      isVercel: !!process.env.VERCEL,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    
    const images = await loadGallery()
    console.log('[Gallery API] Загружено изображений:', images.length)
    
    if (images.length > 0) {
      console.log('[Gallery API] Первое изображение:', {
        id: images[0].id,
        src: images[0].src,
        alt: images[0].alt,
      })
    } else {
      console.warn('[Gallery API] Галерея пуста или не удалось загрузить данные')
    }
    
    return NextResponse.json({ images }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error: any) {
    console.error('[Gallery API] Ошибка при получении галереи:', error)
    console.error('[Gallery API] Stack trace:', error?.stack)
    return NextResponse.json({ 
      images: [],
      error: error?.message || 'Ошибка при загрузке галереи'
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
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
      console.log('[Gallery API] Сохранение галереи, изображений:', images.length)
      const saved = await saveGallery(images)
      if (!saved) {
        console.error('[Gallery API] saveGallery вернул false')
        return NextResponse.json(
          { error: 'Ошибка при сохранении галереи' },
          { status: 500 }
        )
      }
      console.log('[Gallery API] Галерея успешно сохранена')
    } catch (error: any) {
      console.error('[Gallery API] Ошибка при сохранении галереи:', error)
      console.error('[Gallery API] Stack:', error?.stack)
      return NextResponse.json(
        { 
          error: error.message || 'Ошибка при сохранении галереи',
          details: error.message?.includes('Supabase') 
            ? 'Настройте Supabase для синхронизации данных между устройствами. См. md/GALLERY_SUPABASE_SETUP.md' 
            : 'Проверьте логи сервера для деталей'
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

