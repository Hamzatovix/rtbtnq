import { Metadata } from 'next'
import { getCatalogData } from '@/server/catalog/catalog.service'
import CatalogClient from './CatalogClient'

export const revalidate = 60

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.com')

interface CatalogPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export async function generateMetadata({ 
  searchParams 
}: { 
  searchParams?: Record<string, string | string[] | undefined> 
}): Promise<Metadata> {
  const categoryParam = searchParams?.category
  const colorParam = searchParams?.color
  
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam
  const color = Array.isArray(colorParam) ? colorParam[0] : colorParam
  
  let title = 'Каталог - Rosebotanique'
  let description = 'Откройте для себя коллекцию сумок ручной работы Rosebotanique. Каждое изделие создано с любовью и вниманием к деталям.'
  let canonicalUrl = `${baseUrl}/catalog`
  
  if (category) {
    title = `Категория ${category} - Каталог | Rosebotanique`
    description = `Сумки категории ${category} в интернет-магазине Rosebotanique. Ручная работа, качественные материалы, уникальный дизайн.`
    canonicalUrl = `${baseUrl}/catalog?category=${category}`
  }
  
  if (color) {
    title = `Сумки цвета ${color} - Каталог | Rosebotanique`
    description = `Сумки цвета ${color} в интернет-магазине Rosebotanique. Ручная работа, качественные материалы.`
    canonicalUrl = `${baseUrl}/catalog?color=${color}`
  }
  
  return {
    title,
    description,
    keywords: ['каталог сумок', 'сумки ручной работы', 'rosebotanique каталог', category, color].filter((k): k is string => Boolean(k)),
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Rosebotanique',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'ru': canonicalUrl,
        'en': `${baseUrl}/en${canonicalUrl.replace(baseUrl, '')}`,
      },
    },
  }
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


