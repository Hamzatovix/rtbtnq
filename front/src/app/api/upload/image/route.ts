import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Файл должен быть изображением' },
        { status: 400 }
      )
    }

    // Ограничение размера (например, 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Файл слишком большой. Максимальный размер: 5MB' },
        { status: 400 }
      )
    }

    // Создаём уникальное имя файла
    const timestamp = Date.now()
    const uniqueId = nanoid(10)
    const ext = file.name.split('.').pop() || 'png'
    const filename = `${timestamp}-${uniqueId}.${ext}`

    // Путь для сохранения
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'products')
    
    // Создаём директорию, если её нет
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (err) {
      // Директория уже существует
    }

    const filePath = join(uploadsDir, filename)

    // Конвертируем File в Buffer и сохраняем
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Возвращаем URL для доступа к файлу
    const url = `/uploads/products/${filename}`

    return NextResponse.json({ url, filename })
  } catch (error: any) {
    console.error('Ошибка при загрузке изображения:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке изображения' },
      { status: 500 }
    )
  }
}

