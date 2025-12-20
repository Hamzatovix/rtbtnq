import { NextRequest, NextResponse } from 'next/server'
import { generateDefaultOGImage, generateProductOGImage } from '@/lib/og-image-generator'

/**
 * API endpoint для генерации Open Graph изображений
 * GET /api/og?type=default|product&title=...&imageUrl=...&price=...
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') || 'default'
    const title = searchParams.get('title') || 'Rosebotanique'
    const description = searchParams.get('description')
    const imageUrl = searchParams.get('imageUrl')
    const productName = searchParams.get('productName') || title
    const priceParam = searchParams.get('price')
    const productPrice = priceParam ? parseFloat(priceParam) : undefined

    let imageBuffer: Buffer

    if (type === 'product') {
      imageBuffer = await generateProductOGImage({
        title,
        description,
        imageUrl: imageUrl || undefined,
        type: 'product',
        productName,
        productPrice,
      })
    } else {
      imageBuffer = await generateDefaultOGImage()
    }

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('[OG Image API] Ошибка:', error)
    return NextResponse.json(
      { error: 'Ошибка при генерации изображения' },
      { status: 500 }
    )
  }
}


