export function OrganizationStructuredData() {
  // Используем одинаковый URL на сервере и клиенте для избежания hydration mismatch
  // На сервере всегда используем production URL или из env
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rosebotanique',
    url: baseUrl,
    logo: `${baseUrl}/logo/logo_day.svg`,
    description: 'Сумки ручной работы, вдохновленные природой. Мастерская в Грозном, Чеченская Республика. Доставка по России, Москве, Кавказу и СНГ.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
      addressRegion: 'Чеченская Республика',
      addressLocality: 'Грозный',
      addressCountryName: 'Россия',
    },
    areaServed: [
      {
        '@type': 'Country',
        name: 'Россия',
      },
      {
        '@type': 'City',
        name: 'Москва',
      },
      {
        '@type': 'State',
        name: 'Чеченская Республика',
      },
      {
        '@type': 'State',
        name: 'Кавказ',
      },
      {
        '@type': 'Country',
        name: 'Казахстан',
      },
      {
        '@type': 'Country',
        name: 'Беларусь',
      },
      {
        '@type': 'Country',
        name: 'Украина',
      },
      {
        '@type': 'Country',
        name: 'Армения',
      },
      {
        '@type': 'Country',
        name: 'Грузия',
      },
      {
        '@type': 'Country',
        name: 'Азербайджан',
      },
    ],
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

