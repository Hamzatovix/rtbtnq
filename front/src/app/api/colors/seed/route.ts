import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

async function getColorsPath() {
  const root = process.cwd()
  return join(root, 'src', 'data', 'colors.json')
}

const defaultColors = [
  { id: '1', slug: 'black', name: 'Черный', hex: '#000000' },
  { id: '2', slug: 'white', name: 'Белый', hex: '#FFFFFF' },
  { id: '3', slug: 'beige', name: 'Бежевый', hex: '#D9C7B2' },
  { id: '4', slug: 'brown', name: 'Коричневый', hex: '#8B4513' },
  { id: '5', slug: 'gray', name: 'Серый', hex: '#808080' },
  { id: '6', slug: 'red', name: 'Красный', hex: '#FF0000' },
  { id: '7', slug: 'blue', name: 'Синий', hex: '#0000FF' },
  { id: '8', slug: 'green', name: 'Зеленый', hex: '#008000' },
  { id: '9', slug: 'pink', name: 'Розовый', hex: '#FFC0CB' },
  { id: '10', slug: 'yellow', name: 'Желтый', hex: '#FFFF00' },
  { id: '11', slug: 'orange', name: 'Оранжевый', hex: '#FFA500' },
  { id: '12', slug: 'purple', name: 'Фиолетовый', hex: '#800080' },
  { id: '13', slug: 'navy', name: 'Темно-синий', hex: '#000080' },
  { id: '14', slug: 'khaki', name: 'Хаки', hex: '#C3B091' },
  { id: '15', slug: 'terracotta', name: 'Терракотовый', hex: '#E2725B' },
]

export async function POST(req: NextRequest) {
  try {
    const filePath = await getColorsPath()
    let colors: any[] = []
    
    try {
      const fileContent = await readFile(filePath, 'utf-8')
      colors = JSON.parse(fileContent)
    } catch {
      // Файл не существует или пустой, создаем новый
      colors = []
    }

    // Добавляем только отсутствующие цвета
    const existingSlugs = new Set(colors.map((c: any) => c.slug))
    const colorsToAdd = defaultColors.filter(c => !existingSlugs.has(c.slug))
    
    if (colorsToAdd.length > 0) {
      colors.push(...colorsToAdd)
      await writeFile(filePath, JSON.stringify(colors, null, 2), 'utf-8')
    }

    return NextResponse.json({ 
      success: true, 
      added: colorsToAdd.length,
      total: colors.length 
    })
  } catch (error: any) {
    console.error('Ошибка при добавлении цветов:', error)
    return NextResponse.json(
      { error: 'Ошибка при добавлении цветов' },
      { status: 500 }
    )
  }
}

