import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')

export const metadata: Metadata = {
  title: 'Галерея сумок ручной работы - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ',
  description: 'Галерея работ и изделий Rosebotanique - сумки ручной работы, вдохновленные природой. Доставка по России, Москве, Кавказу и СНГ. Дизайнерские сумки из натуральных материалов.',
  keywords: [
    'галерея', 'фото', 'изделия', 'rosebotanique', 'сумки ручной работы', 
    'мастерская', 'галерея сумок москва', 'галерея сумок россия',
    'галерея сумок кавказ', 'галерея сумок снг', 'фото сумок ручной работы',
    'изделия ручной работы москва', 'изделия ручной работы россия'
  ],
  openGraph: {
    title: 'Галерея сумок ручной работы - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ',
    description: 'Галерея работ и изделий Rosebotanique - сумки ручной работы, вдохновленные природой. Доставка по России, Москве, Кавказу и СНГ.',
    type: 'website',
    url: `${baseUrl}/gallery`,
    images: [
      {
        url: `${baseUrl}/images/about_c.jpg`,
        width: 1200,
        height: 630,
        alt: 'Галерея сумок ручной работы - Rosebotanique',
        type: 'image/jpeg',
      },
    ],
    siteName: 'Rosebotanique',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Галерея сумок ручной работы - Rosebotanique | Доставка по России, Москве, Кавказу, СНГ',
    description: 'Галерея работ и изделий Rosebotanique - сумки ручной работы, вдохновленные природой. Доставка по России, Москве, Кавказу и СНГ.',
    images: [`${baseUrl}/images/about-m.png`],
  },
  alternates: {
    canonical: `${baseUrl}/gallery`,
    languages: {
      'ru': `${baseUrl}/gallery`,
      'en': `${baseUrl}/en/gallery`,
    },
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}


