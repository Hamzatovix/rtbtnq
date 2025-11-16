import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { getCatalogData } from '@/server/catalog/catalog.service'
import { OrganizationStructuredData } from '@/components/seo/OrganizationStructuredData'
import { LocalBusinessStructuredData } from '@/components/seo/LocalBusinessStructuredData'

export const revalidate = 60

export default async function HomePage() {
  const { products } = await getCatalogData()
  const featured = products.filter((product) => product.is_featured).slice(0, 6)
  const fallback = featured.length > 0 ? featured : products.slice(0, 6)

  return (
    <main className="min-h-screen">
      <OrganizationStructuredData />
      <LocalBusinessStructuredData />
      <Hero />
      <About />
      <FeaturedProducts products={fallback} />
    </main>
  )
}


