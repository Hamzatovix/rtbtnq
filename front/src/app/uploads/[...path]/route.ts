import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    
    // Проверяем безопасность пути (защита от path traversal)
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json({ error: 'Неверный путь' }, { status: 400 })
    }

    // Формируем полный путь к файлу
    const fullPath = join(process.cwd(), 'public', 'uploads', filePath)
    
    // Проверяем существование файла
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 404 })
    }

    // Читаем файл
    const fileBuffer = await readFile(fullPath)
    
    // Определяем MIME тип по расширению
    const ext = filePath.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    }
    const contentType = mimeTypes[ext || ''] || 'application/octet-stream'

    // Возвращаем файл с правильными заголовками
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('[Uploads Route] Ошибка:', error)
    return NextResponse.json({ 
      error: 'Ошибка при чтении файла',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

