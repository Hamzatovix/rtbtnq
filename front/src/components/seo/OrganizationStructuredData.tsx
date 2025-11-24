export function OrganizationStructuredData() {
  // Используем одинаковый URL на сервере и клиенте для избежания hydration mismatch
  // На сервере всегда используем production URL или из env
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.com')
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rosebotanique',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Сумки ручной работы, вдохновленные природой. Мастерская в Грозном, Чеченская Республика',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressRegion: 'Чеченская Республика',
      addressLocality: 'Грозный',
      addressCountryName: 'Россия',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Россия',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Russian', 'English'],
      areaServed: 'RU',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      suppressHydrationWarning
    />
  )
}

