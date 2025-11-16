import { MetadataRoute } from 'next'
import { getCatalogData } from '@/server/catalog/catalog.service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.com')
  
  // Статические страницы
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Страницы продуктов
  try {
    const catalogData = await getCatalogData({ includeRaw: true })
    const rawProducts = catalogData.rawProducts || []
    
    const productPages = rawProducts
      .filter((product: any) => product?.isPublished !== false && product?.slug)
      .map((product: any) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

    // Мультиязычные версии (ru - основной, en - дополнительный)
    const locales = ['ru', 'en']
    const multilingualPages = [
      ...staticPages,
      ...productPages,
    ].flatMap(page => 
      locales.map(locale => ({
        ...page,
        url: locale === 'ru' 
          ? page.url 
          : `${baseUrl}/${locale}${page.url.replace(baseUrl, '')}`,
      }))
    )

    return multilingualPages
  } catch (error) {
    console.error('Ошибка при генерации sitemap:', error)
    // Возвращаем хотя бы статические страницы
    return staticPages
  }
}

