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
      : 'https://rosebotanique.com'
  
  const price = variant ? variant.priceCents / 100 : (product.variants?.[0]?.priceCents || 0) / 100
  const image = variant?.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url || '/placeholder/product.jpg'
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${baseUrl}${image.startsWith('/') ? image : '/' + image}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Купить ${product.name} в интернет-магазине Rosebotanique`,
    image: fullImageUrl,
    brand: {
      '@type': 'Brand',
      name: 'Rosebotanique',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'RUB',
      price: price.toString(),
      availability: variant?.stockQty && variant.stockQty > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

