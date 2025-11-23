import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Providers } from '@/components/providers'
import SiteHeader from '@/components/layout/SiteHeader.client'
import { Footer } from '@/components/layout/footer'
import { HideOnBackoffice } from '@/components/layout/HideOnBackoffice'
import { getLocale } from 'next-intl/server'
const CartDrawer = dynamic(
  () => import('@/components/cart/cart-drawer'),
  { ssr: false, loading: () => null }
)
const FavoritesDrawer = dynamic(
  () => import('@/components/favorites/favorites-drawer'),
  { ssr: false, loading: () => null }
)
import ErrorBoundary from '@/components/ui/error-boundary'
import { ScrollToTop } from '@/components/layout/scroll-to-top'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body'
})
const cormorantGaramond = Cormorant_Garamond({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant'
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.com')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Rosebotanique - Сумки ручной работы',
    template: '%s | Rosebotanique'
  },
  description: 'Откройте для себя коллекцию сумок ручной работы Rosebotanique. Каждое изделие создано с любовью и вниманием к деталям, вдохновлено природой. Мастерская в Грозном, Чеченская Республика.',
  keywords: ['сумки ручной работы', 'handcrafted bags', 'rosebotanique', 'сумки из кожи', 'дизайнерские сумки', 'россия', 'грозный', 'чеченская республика', 'сумки грозный', 'мастерская сумок'],
  authors: [{ name: 'Rosebotanique' }],
  creator: 'Rosebotanique',
  publisher: 'Rosebotanique',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: baseUrl,
    siteName: 'Rosebotanique',
    title: 'Rosebotanique - Сумки ручной работы',
    description: 'Откройте для себя коллекцию сумок ручной работы Rosebotanique. Каждое изделие создано с любовью и вниманием к деталям. Мастерская в Грозном, Чеченская Республика.',
    images: [
      {
        url: '/images/about-m.png',
        width: 1200,
        height: 630,
        alt: 'Rosebotanique - Сумки ручной работы',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rosebotanique - Сумки ручной работы',
    description: 'Откройте для себя коллекцию сумок ручной работы Rosebotanique',
    images: ['/images/about-m.png'],
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'ru': baseUrl,
      'en': `${baseUrl}/en`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let locale = 'ru' // Дефолтная локаль
  try {
    locale = await getLocale()
  } catch (error) {
    // Fallback на дефолтную локаль если next-intl не настроен
    console.warn('next-intl config not found, using default locale:', error)
  }
  
  return (
    <html lang={locale} className={`${inter.variable} ${cormorantGaramond.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased bg-fintage-offwhite dark:bg-fintage-charcoal">
        <ErrorBoundary>
          <Providers>
            {/* Skip link для клавиатурной навигации */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
                focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary 
                focus:ring-offset-2 dark:focus:bg-primary dark:focus:text-primary-foreground"
            >
              Перейти к основному контенту
            </a>
            <HideOnBackoffice>
              <SiteHeader />
            </HideOnBackoffice>
            <main id="main-content">{children}</main>
            <HideOnBackoffice>
              <Footer />
            </HideOnBackoffice>
            <CartDrawer />
            <FavoritesDrawer />
            <ScrollToTop />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
