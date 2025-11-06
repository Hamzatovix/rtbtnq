import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

async function getCategoriesPath() {
  const root = process.cwd()
  return join(root, 'src', 'data', 'categories.json')
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = await getCategoriesPath()
    const fileContent = await readFile(filePath, 'utf-8')
    const categories = JSON.parse(fileContent)
    const category = categories.find((cat: any) => String(cat.id) === String(params.id))

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ...category, id: String(category.id) })
  } catch (error: any) {
    console.error('Ошибка при получении категории:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении категории' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const filePath = await getCategoriesPath()
    const fileContent = await readFile(filePath, 'utf-8')
    const categories = JSON.parse(fileContent)

    const index = categories.findIndex((cat: any) => String(cat.id) === String(params.id))
    if (index === -1) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    categories[index] = { ...categories[index], ...body, id: String(categories[index].id) }
    await writeFile(filePath, JSON.stringify(categories, null, 2), 'utf-8')

    return NextResponse.json(categories[index])
  } catch (error: any) {
    console.error('Ошибка при обновлении категории:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении категории' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = await getCategoriesPath()
    const fileContent = await readFile(filePath, 'utf-8')
    const categories = JSON.parse(fileContent)

    const filtered = categories.filter((cat: any) => String(cat.id) !== String(params.id))
    
    if (filtered.length === categories.length) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }

    await writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ошибка при удалении категории:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении категории' },
      { status: 500 }
    )
  }
}

