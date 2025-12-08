'use client'

type Product = {
  id: string
  slug: string
  name: string
  description?: string
  variants?: Array<{
    priceCents: number
    stockQty?: number
    images?: Array<{ url: string }>
  }>
}

type ProductVariant = {
  priceCents: number
  stockQty?: number
  images?: Array<{ url: string }>
}

export function ProductStructuredData({ 
  product, 
  variant 
}: { 
  product: Product
  variant?: ProductVariant 
}) {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://rosebotanique.store'
  
  const price = variant ? variant.priceCents / 100 : (product.variants?.[0]?.priceCents || 0) / 100
  const image = variant?.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url || '/placeholder/product.jpg'
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${baseUrl}${image.startsWith('/') ? image : '/' + image}`

  // Получаем все изображения продукта
  const allImages = variant?.images || product.variants?.[0]?.images || []
  const imageUrls = allImages
    .map(img => {
      const imgUrl = img.url || ''
      return imgUrl.startsWith('http') 
        ? imgUrl 
        : `${baseUrl}${imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl}`
    })
    .filter(Boolean)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Купить ${product.name} в интернет-магазине Rosebotanique с доставкой по России, Москве, Кавказу и СНГ`,
    image: imageUrls.length > 0 ? imageUrls : [fullImageUrl],
    brand: {
      '@type': 'Brand',
      name: 'Rosebotanique',
    },
    category: product.categoryId || 'Сумки',
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'RUB',
      price: price.toString(),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 год
      availability: variant?.stockQty && variant.stockQty > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Rosebotanique',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

