import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.com')

export const metadata: Metadata = {
  title: 'Галерея - Rosebotanique',
  description: 'Галерея работ и изделий Rosebotanique - сумки ручной работы, вдохновленные природой.',
  keywords: ['галерея', 'фото', 'изделия', 'rosebotanique', 'сумки ручной работы', 'мастерская'],
  openGraph: {
    title: 'Галерея - Rosebotanique',
    description: 'Галерея работ и изделий Rosebotanique',
    type: 'website',
    url: `${baseUrl}/gallery`,
    images: [
      {
        url: '/images/about-m.jpg.png',
        width: 1200,
        height: 630,
        alt: 'Галерея - Rosebotanique',
      },
    ],
    siteName: 'Rosebotanique',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Галерея - Rosebotanique',
    description: 'Галерея работ и изделий Rosebotanique',
    images: ['/images/about-m.jpg.png'],
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

