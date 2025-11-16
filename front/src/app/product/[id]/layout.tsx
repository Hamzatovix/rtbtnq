import { Metadata } from 'next'
import { getProductById } from '@/server/products/products-json.service'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://rosebotanique.com'

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const product = await getProductById(params.id)
  
  if (!product) {
    return {
      title: 'Товар не найден - Rosebotanique',
      description: 'Запрашиваемый товар не найден в каталоге Rosebotanique',
    }
  }

  const firstVariant = product.variants?.[0]
  const price = firstVariant ? firstVariant.priceCents / 100 : 0
  const image = firstVariant?.images?.[0]?.url || '/placeholder/product.jpg'
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${baseUrl}${image.startsWith('/') ? image : '/' + image}`

  const description = product.description || `Купить ${product.name} в интернет-магазине Rosebotanique. ${product.materials ? `Материалы: ${product.materials}.` : ''} Ручная работа, качественные материалы.`

  return {
    title: `${product.name} - Rosebotanique`,
    description,
    keywords: [
      product.name.toLowerCase(),
      'сумка',
      'сумки ручной работы',
      'rosebotanique',
      product.categoryId,
      'россия',
    ].filter(Boolean),
    openGraph: {
      title: product.name,
      description,
      type: 'product',
      url: `${baseUrl}/product/${product.slug}`,
      siteName: 'Rosebotanique',
      locale: 'ru_RU',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [fullImageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/product/${product.slug}`,
      languages: {
        'ru': `${baseUrl}/product/${product.slug}`,
        'en': `${baseUrl}/en/product/${product.slug}`,
      },
    },
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

