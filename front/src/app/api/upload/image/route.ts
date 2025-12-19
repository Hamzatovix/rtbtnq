import { nanoid } from 'nanoid'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

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
    
    // Определяем папку для сохранения (по умолчанию products)
    const folder = (formData.get('folder') as string) || 'products'

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Локальное хранение на сервере
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
    
    // Создаём директорию, если её нет
    await mkdir(uploadDir, { recursive: true })
    
    // Сохраняем файл
    const filePath = join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    // Формируем URL для доступа к файлу
    // Используем API route для отдачи файлов в production
    const url = `/uploads/${folder}/${filename}`
    
    // Проверяем, что файл действительно сохранён
    if (!existsSync(filePath)) {
      console.error(`[Upload] Ошибка: файл не был сохранён: ${filePath}`)
      return NextResponse.json({ 
        error: 'Ошибка при сохранении файла' 
      }, { status: 500 })
    }
    
    console.log(`[Upload] Изображение сохранено: ${filePath}`)
    console.log(`[Upload] URL: ${url}`)
    console.log(`[Upload] Размер файла: ${buffer.length} байт`)
    
    return NextResponse.json({ url, filename })
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error)
    return NextResponse.json({ 
      error: 'Ошибка при загрузке изображения',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
