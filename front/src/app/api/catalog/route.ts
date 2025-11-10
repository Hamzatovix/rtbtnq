import { NextRequest, NextResponse } from 'next/server'
import { getCatalogData } from '@/server/catalog/catalog.service'

export const revalidate = 60

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || undefined
  const color = searchParams.get('color') || undefined

  const data = await getCatalogData({
    categorySlug: category,
    colorId: color,
  })

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  })
}


