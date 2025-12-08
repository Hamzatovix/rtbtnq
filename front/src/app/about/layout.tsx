import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')

export const metadata: Metadata = {
  title: 'О нас - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ',
  description: 'Узнайте историю создания Rosebotanique - бренда сумок ручной работы, вдохновленных природой. Каждое изделие создается с любовью и вниманием к деталям в нашей мастерской в Грозном, Чеченская Республика. Доставка по России, Москве, Кавказу и СНГ.',
  keywords: [
    'о нас', 'история бренда', 'rosebotanique', 'сумки ручной работы', 
    'мастерская', 'россия', 'грозный', 'чеченская республика', 
    'мастерская сумок грозный', 'о нас сумки москва', 'о нас сумки россия',
    'о нас сумки кавказ', 'о нас сумки снг', 'история мастерской сумок'
  ],
  openGraph: {
    title: 'О нас - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ',
    description: 'Узнайте историю создания Rosebotanique - бренда сумок ручной работы, вдохновленных природой. Доставка по России, Москве, Кавказу и СНГ.',
    type: 'website',
    url: `${baseUrl}/about`,
    images: [
      {
        url: `${baseUrl}/logo/logo_day.svg`,
        width: 1024,
        height: 1536,
        alt: 'О нас - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ',
        type: 'image/svg+xml',
      },
    ],
    siteName: 'Rosebotanique',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'О нас - Rosebotanique',
    description: 'Узнайте историю создания Rosebotanique',
    images: [`${baseUrl}/logo/logo_day.svg`],
  },
  alternates: {
    canonical: `${baseUrl}/about`,
    languages: {
      'ru': `${baseUrl}/about`,
      'en': `${baseUrl}/en/about`,
    },
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

