import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Файл должен быть изображением' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл слишком большой. Максимум 5MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'png'
    const filename = `${Date.now()}-${nanoid(10)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { url } = await put(`products/${filename}`, Buffer.from(arrayBuffer), {
      access: 'public',
      contentType: file.type,
    })

    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error)
    return NextResponse.json({ error: 'Ошибка при загрузке изображения' }, { status: 500 })
  }
}