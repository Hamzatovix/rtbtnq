'use client'

export function LocalBusinessStructuredData() {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://rosebotanique.com'
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}#localbusiness`,
    name: 'Rosebotanique',
    image: `${baseUrl}/logo.png`,
    description: 'Мастерская сумок ручной работы в Грозном, Чеченская Республика',
    url: baseUrl,
    telephone: '', // Добавьте телефон при наличии
    address: {
      '@type': 'PostalAddress',
      streetAddress: '', // Добавьте адрес при наличии
      addressLocality: 'Грозный',
      addressRegion: 'Чеченская Республика',
      postalCode: '', // Добавьте индекс при наличии
      addressCountry: 'RU',
      addressCountryName: 'Россия',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.3119, // Координаты Грозного
      longitude: 45.6889,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '10:00',
      closes: '18:00',
    },
    priceRange: '$$',
    servesCuisine: false,
    areaServed: {
      '@type': 'Country',
      name: 'Россия',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

