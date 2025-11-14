import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Providers } from '@/components/providers'
import SiteHeader from '@/components/layout/SiteHeader.client'
import { Footer } from '@/components/layout/footer'
import { HideOnBackoffice } from '@/components/layout/HideOnBackoffice'
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

export const metadata: Metadata = {
  title: 'rosebotanique store - Handcrafted Bags',
  description: 'Discover our collection of handcrafted bags inspired by nature. Each piece is carefully made with love and attention to detail.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <Providers>
            <HideOnBackoffice>
              <SiteHeader />
            </HideOnBackoffice>
            <main>{children}</main>
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
