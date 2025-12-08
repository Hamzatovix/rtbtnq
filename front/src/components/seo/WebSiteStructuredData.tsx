export function WebSiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Rosebotanique',
    url: baseUrl,
    description: 'Интернет-магазин сумок ручной работы Rosebotanique. Доставка по России, Москве, Кавказу и СНГ.',
    inLanguage: ['ru', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/catalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Rosebotanique',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo/logo_day.svg`,
      },
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

