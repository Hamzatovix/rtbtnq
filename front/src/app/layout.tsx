import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import SiteHeader from '@/components/layout/SiteHeader.client'
import { Footer } from '@/components/layout/footer'
import { HideOnBackoffice } from '@/components/layout/HideOnBackoffice'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { FavoritesDrawer } from '@/components/favorites/favorites-drawer'
import ErrorBoundary from '@/components/ui/error-boundary'

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
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
