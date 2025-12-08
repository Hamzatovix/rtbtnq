import { Metadata } from 'next'
import { getCatalogData } from '@/server/catalog/catalog.service'
import CatalogClient from './CatalogClient'

export const revalidate = 60

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')

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
  
  let title = 'Каталог сумок ручной работы - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ'
  let description = 'Каталог сумок ручной работы Rosebotanique с доставкой по России, Москве, Кавказу и СНГ. Дизайнерские сумки из натуральных материалов. Ручная работа, качественные материалы, уникальный дизайн.'
  let canonicalUrl = `${baseUrl}/catalog`
  
  if (category) {
    title = `Категория ${category} - Каталог сумок | Rosebotanique | Доставка по России, Москве, Кавказу, СНГ`
    description = `Сумки категории ${category} в интернет-магазине Rosebotanique. Доставка по России, Москве, Кавказу и СНГ. Ручная работа, качественные материалы, уникальный дизайн.`
    canonicalUrl = `${baseUrl}/catalog?category=${category}`
  }
  
  if (color) {
    title = `Сумки цвета ${color} - Каталог | Rosebotanique | Доставка по России, Москве, Кавказу, СНГ`
    description = `Сумки цвета ${color} в интернет-магазине Rosebotanique. Доставка по России, Москве, Кавказу и СНГ. Ручная работа, качественные материалы.`
    canonicalUrl = `${baseUrl}/catalog?color=${color}`
  }
  
  const keywords: string[] = [
    'каталог сумок', 'сумки ручной работы', 'rosebotanique каталог',
    'сумки москва', 'сумки россия', 'сумки кавказ', 'сумки снг',
    'купить сумки москва', 'купить сумки россия', 'сумки доставка россия',
    'сумки доставка москва', 'сумки интернет магазин россия',
    'сумки интернет магазин москва'
  ]
  if (category) keywords.push(category, `${category} москва`, `${category} россия`)
  if (color) keywords.push(color, `сумки ${color} москва`, `сумки ${color} россия`)
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      siteName: 'Rosebotanique',
      locale: 'ru_RU',
      images: [
        {
          url: `${baseUrl}/images/about_h1.jpg.jpg`,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/images/about_h1.jpg.jpg`],
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


