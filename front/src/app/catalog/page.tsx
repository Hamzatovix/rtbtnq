import { getCatalogData } from '@/server/catalog/catalog.service'
import CatalogClient from './CatalogClient'

export const revalidate = 60

interface CatalogPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function CatalogPage({ searchParams = {} }: CatalogPageProps) {
  const categoryParam = searchParams.category
  const colorParam = searchParams.color

  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam || undefined
  const color = Array.isArray(colorParam) ? colorParam[0] : colorParam || undefined

  const initialData = await getCatalogData({
    categorySlug: category,
    colorId: color,
  })

  return (
    <CatalogClient
      initialData={initialData}
      initialFilters={{
        category,
        color,
      }}
    />
  )
}


