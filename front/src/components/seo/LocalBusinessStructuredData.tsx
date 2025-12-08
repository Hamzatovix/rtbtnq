'use client'

export function LocalBusinessStructuredData() {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://rosebotanique.store'
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}#localbusiness`,
    name: 'Rosebotanique',
    image: `${baseUrl}/logo/logo_day.svg`,
    description: 'Мастерская сумок ручной работы в Грозном, Чеченская Республика. Доставка по России, Москве, Кавказу и СНГ. Дизайнерские сумки из натуральных материалов.',
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
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

