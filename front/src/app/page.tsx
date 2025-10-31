import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { FeaturedProducts } from '@/components/sections/featured-products'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <FeaturedProducts />
    </main>
  )
}


