import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.com')
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/backoffice/',
          '/api/',
          '/checkout/',
          '/order/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

