import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.com')

export const metadata: Metadata = {
  title: 'О нас - Rosebotanique',
  description: 'Узнайте историю создания Rosebotanique - бренда сумок ручной работы, вдохновленных природой. Каждое изделие создается с любовью и вниманием к деталям в нашей мастерской в Грозном, Чеченская Республика.',
  keywords: ['о нас', 'история бренда', 'rosebotanique', 'сумки ручной работы', 'мастерская', 'россия', 'грозный', 'чеченская республика', 'мастерская сумок грозный'],
  openGraph: {
    title: 'О нас - Rosebotanique',
    description: 'Узнайте историю создания Rosebotanique - бренда сумок ручной работы, вдохновленных природой',
    type: 'website',
    url: `${baseUrl}/about`,
    images: [
      {
        url: '/images/about-m.jpg.png',
        width: 1200,
        height: 630,
        alt: 'О нас - Rosebotanique',
      },
    ],
    siteName: 'Rosebotanique',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'О нас - Rosebotanique',
    description: 'Узнайте историю создания Rosebotanique',
    images: ['/images/about-m.jpg.png'],
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

