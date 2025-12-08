import { Metadata } from 'next'
import { getProductById } from '@/server/products/products-json.service'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')

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

  const description = product.description || `Купить ${product.name} в интернет-магазине Rosebotanique с доставкой по России, Москве, Кавказу и СНГ. ${product.materials ? `Материалы: ${product.materials}.` : ''} Ручная работа, качественные материалы. Доставка по всей России, Москве, Кавказу, СНГ.`

  const keywords: string[] = [
    product.name.toLowerCase(),
    'сумка',
    'сумки ручной работы',
    'rosebotanique',
    'россия',
    'купить сумку москва',
    'купить сумку россия',
    'сумка ручной работы москва',
    'сумка ручной работы россия',
    'сумка ручной работы кавказ',
    'сумка ручной работы снг',
    'сумка доставка россия',
    'сумка доставка москва',
    `${product.name.toLowerCase()} москва`,
    `${product.name.toLowerCase()} россия`,
    `${product.name.toLowerCase()} кавказ`,
    `${product.name.toLowerCase()} снг`,
  ]
  if (product.categoryId) {
    keywords.push(
      String(product.categoryId),
      `${String(product.categoryId)} москва`,
      `${String(product.categoryId)} россия`
    )
  }

  return {
    title: `${product.name} - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ`,
    description,
    keywords,
    openGraph: {
      title: `${product.name} - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ`,
      description,
      type: 'website',
      url: `${baseUrl}/product/${product.slug}`,
      siteName: 'Rosebotanique',
      locale: 'ru_RU',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 1200,
          alt: `${product.name} - Доставка по России, Москве, Кавказу, СНГ`,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ`,
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

