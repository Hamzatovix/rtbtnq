import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')

export const metadata: Metadata = {
  title: 'Бренд Rosebotanique - История мастерской сумок | Доставка по России, Москве, Кавказу, СНГ',
  description: 'Узнайте историю создания Rosebotanique - бренда сумок ручной работы, вдохновленных природой. Каждое изделие создается с любовью и вниманием к деталям в нашей мастерской в Грозном, Чеченская Республика. Доставка по России, Москве, Кавказу и СНГ.',
  keywords: [
    'бренд', 'история бренда', 'rosebotanique', 'сумки ручной работы', 
    'мастерская', 'россия', 'грозный', 'чеченская республика', 
    'мастерская сумок грозный', 'бренд сумок москва', 'бренд сумок россия',
    'бренд сумок кавказ', 'бренд сумок снг', 'история сумок ручной работы',
    'мастерская сумок москва', 'мастерская сумок россия'
  ],
  openGraph: {
    title: 'Бренд Rosebotanique - История мастерской сумок | Доставка по России, Москве, Кавказу, СНГ',
    description: 'Узнайте историю создания Rosebotanique - бренда сумок ручной работы, вдохновленных природой. Доставка по России, Москве, Кавказу и СНГ.',
    type: 'website',
    url: `${baseUrl}/brand`,
    images: [
      {
        url: `${baseUrl}/logo/logo_day.svg`,
        width: 1024,
        height: 1536,
        alt: 'Бренд Rosebotanique - История мастерской сумок',
        type: 'image/svg+xml',
      },
    ],
    siteName: 'Rosebotanique',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Бренд - Rosebotanique',
    description: 'Узнайте историю создания Rosebotanique',
    images: [`${baseUrl}/logo/logo_day.svg`],
  },
  alternates: {
    canonical: `${baseUrl}/brand`,
    languages: {
      'ru': `${baseUrl}/brand`,
      'en': `${baseUrl}/en/brand`,
    },
  },
}

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


