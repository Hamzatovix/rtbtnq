import { NextRequest, NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join } from 'path'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get('path')
    
    if (!filePath) {
      return NextResponse.json({ error: 'Путь не указан' }, { status: 400 })
    }

    // Убираем начальный слэш если есть
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath
    
    // Проверяем, что путь начинается с uploads
    if (!cleanPath.startsWith('uploads/')) {
      return NextResponse.json({ error: 'Неверный путь' }, { status: 400 })
    }

    // Формируем полный путь к файлу
    const fullPath = join(process.cwd(), 'public', cleanPath)
    
    // Проверяем существование файла
    const exists = existsSync(fullPath)
    
    return NextResponse.json({ 
      exists,
      path: filePath,
      fullPath: fullPath,
    })
  } catch (error) {
    console.error('[Upload Check] Ошибка:', error)
    return NextResponse.json({ 
      error: 'Ошибка при проверке файла',
      exists: false 
    }, { status: 500 })
  }
}

