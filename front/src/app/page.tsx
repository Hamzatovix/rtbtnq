import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { getCatalogData } from '@/server/catalog/catalog.service'

export const revalidate = 60

export default async function HomePage() {
  const { products } = await getCatalogData()
  const featured = products.filter((product) => product.is_featured).slice(0, 6)
  const fallback = featured.length > 0 ? featured : products.slice(0, 6)

  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <FeaturedProducts products={fallback} />
    </main>
  )
}


