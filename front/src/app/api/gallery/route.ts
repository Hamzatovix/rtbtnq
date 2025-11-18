import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { nanoid } from 'nanoid'

const GALLERY_FILE = path.join(process.cwd(), 'src', 'data', 'gallery.json')

async function loadGallery() {
  try {
    const fileContents = await fs.readFile(GALLERY_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    return data.images || []
  } catch (error) {
    console.error('Ошибка при загрузке галереи:', error)
    return []
  }
}

async function saveGallery(images: Array<{ id: string; src: string; alt: string }>) {
  try {
    await fs.writeFile(GALLERY_FILE, JSON.stringify({ images }, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Ошибка при сохранении галереи:', error)
    return false
  }
}

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
    const saved = await saveGallery(images)

    if (!saved) {
      return NextResponse.json(
        { error: 'Ошибка при сохранении галереи' },
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

    const saved = await saveGallery(images)

    if (!saved) {
      return NextResponse.json(
        { error: 'Ошибка при сохранении галереи' },
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

    const saved = await saveGallery(filtered)

    if (!saved) {
      return NextResponse.json(
        { error: 'Ошибка при сохранении галереи' },
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

