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
import { ToastContainer } from '@/components/ui/toast'
import { YandexMetrika } from '@/components/analytics/YandexMetrika'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

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
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://rosebotanique.store')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Rosebotanique - Сумки ручной работы',
    template: '%s | Rosebotanique'
  },
  description: 'Купить сумки ручной работы Rosebotanique с доставкой по России, Москве, Кавказу и СНГ. Дизайнерские сумки из натуральных материалов. Мастерская в Грозном, Чеченская Республика. Доставка по всей России, Москве, Кавказу, СНГ.',
  keywords: [
    'сумки ручной работы', 'handcrafted bags', 'rosebotanique',
    'сумки из кожи', 'дизайнерские сумки', 'россия', 'грозный', 
    'чеченская республика', 'сумки грозный', 'мастерская сумок',
    'сумки москва', 'сумки кавказ', 'сумки россия', 'сумки снг',
    'купить сумки москва', 'купить сумки россия', 'сумки ручной работы москва',
    'сумки ручной работы россия', 'сумки ручной работы кавказ',
    'сумки ручной работы снг', 'дизайнерские сумки москва',
    'дизайнерские сумки россия', 'сумки из кожи москва',
    'сумки из кожи россия', 'сумки доставка россия',
    'сумки доставка москва', 'сумки доставка кавказ',
    'сумки интернет магазин россия', 'сумки интернет магазин москва',
    'чеченская республика сумки', 'грозный сумки ручной работы',
    'кавказ сумки', 'снг сумки', 'россия сумки ручной работы'
  ],
  authors: [{ name: 'Rosebotanique' }],
  creator: 'Rosebotanique',
  publisher: 'Rosebotanique',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon-256x256.png', type: 'image/png', sizes: '256x256' },
      { url: '/favicon-128x128.png', type: 'image/png', sizes: '128x128' },
      { url: '/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512x512.png', type: 'image/png', sizes: '512x512' },
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
      { url: '/favicon.ico', sizes: '128x128', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: baseUrl,
    siteName: 'Rosebotanique',
    title: 'Rosebotanique - Сумки ручной работы | Доставка по России, Москве, Кавказу, СНГ',
    description: 'Купить сумки ручной работы Rosebotanique с доставкой по России, Москве, Кавказу и СНГ. Дизайнерские сумки из натуральных материалов. Мастерская в Грозном, Чеченская Республика. Доставка по всей России, Москве, Кавказу, СНГ.',
    images: [
      {
        url: `${baseUrl}/logo/logo_day.svg`,
        width: 1024,
        height: 1536,
        alt: 'Rosebotanique - Сумки ручной работы',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rosebotanique - Сумки ручной работы',
    description: 'Откройте для себя коллекцию сумок ручной работы Rosebotanique',
    images: [`${baseUrl}/logo/logo_day.svg`],
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
            <ToastContainer />
            <ScrollToTop />
            {/* Яндекс.Метрика */}
            {process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ? (
              <YandexMetrika counterId={process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID} />
            ) : (
              <YandexMetrika counterId="105738536" />
            )}
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
              <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            )}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
