import { NextRequest, NextResponse } from 'next/server'
import { getProductById, loadProducts, saveProducts } from '@/server/products/products-json.service'

// Кеширование для API routes (ISR)
export const revalidate = 60 // Обновлять каждые 60 секунд

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Используем сервис с кешем в памяти
    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ...product, id: String(product.id) }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error: any) {
    console.error('Ошибка при получении товара:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении товара' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let name: string | undefined
    let slug: string | undefined
    let description: string | undefined
    let materials: string | undefined
    let care: string | undefined
    let categoryId: string | undefined
    let isPublished: boolean | undefined
    let variants: any[] | undefined

    if (contentType.includes('application/json')) {
      const body = await req.json()
      name = body.name
      slug = body.slug
      description = body.description
      materials = body.materials
      care = body.care
      categoryId = body.categoryId
      if (typeof body.isPublished !== 'undefined') isPublished = !!body.isPublished
      if (Array.isArray(body.variants)) variants = body.variants
    } else {
      const formData = await req.formData()
      name = (formData.get('name') as string) || undefined
      slug = (formData.get('slug') as string) || undefined
      description = (formData.get('description') as string) || undefined
      materials = (formData.get('materials') as string) || undefined
      care = (formData.get('care') as string) || undefined
      categoryId = (formData.get('categoryId') as string) || undefined
      isPublished = String(formData.get('isPublished')) === 'true'
      const variantsJson = formData.get('variants') as string
      variants = variantsJson ? JSON.parse(variantsJson) : undefined
    }

    // Используем сервис с кешем в памяти
    const products = await loadProducts()

    const index = products.findIndex((prod: any) => String(prod.id) === String(params.id))
    if (index === -1) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    const nextVariants = Array.isArray(variants) ? variants : (products[index].variants || [])
    const variantsWithSku = nextVariants.map((variant: any, idx: number) => ({
      ...variant,
      sku: variant.sku || `${params.id}-${variant.colorId || idx}`,
    }))

    products[index] = {
      ...products[index],
      ...(typeof name !== 'undefined' ? { name } : {}),
      ...(typeof slug !== 'undefined' ? { slug } : {}),
      ...(typeof description !== 'undefined' ? { description } : {}),
      ...(typeof materials !== 'undefined' ? { materials } : {}),
      ...(typeof care !== 'undefined' ? { care } : {}),
      ...(typeof categoryId !== 'undefined' ? { categoryId } : {}),
      ...(typeof isPublished !== 'undefined' ? { isPublished } : {}),
      ...(Array.isArray(nextVariants) ? { variants: variantsWithSku } : {}),
      updatedAt: new Date().toISOString(),
    }

    // Сохраняем через сервис (обновит кеш автоматически)
    await saveProducts(products, 'wrapped')
    return NextResponse.json({ ...products[index], id: String(products[index].id) })
  } catch (error: any) {
    console.error('Ошибка при обновлении товара:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении товара' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Используем сервис с кешем в памяти
    const products = await loadProducts()

    const filtered = products.filter((prod: any) => String(prod.id) !== String(params.id))
    
    if (filtered.length === products.length) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      )
    }

    // Сохраняем через сервис (обновит кеш автоматически)
    await saveProducts(filtered, 'wrapped')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Ошибка при удалении товара:', error)
    return NextResponse.json(
      { error: 'Ошибка при удалении товара' },
      { status: 500 }
    )
  }
}

