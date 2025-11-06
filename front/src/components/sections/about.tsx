'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/hooks/useTranslations'

export function About() {
  const t = useTranslations()
  return (
    <section
      className="relative min-h-[88svh] flex items-center justify-center bg-white"
      aria-labelledby="about-heading"
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        {/* Wrap grid in relative to position connector */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Content */}
          <div className="space-y-4 relative text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-1 mb-4">
              <h2
                id="about-heading"
                className="text-title-1 font-light text-ink-soft leading-tight tracking-wide"
              >
                {t('home.about.title')}
              </h2>
            </div>
              
            <div className="flex items-center justify-center md:justify-start gap-4 min-h-[60px]">
              <p className="text-body font-light tracking-wide leading-relaxed">
                {t('home.about.description')}
              </p>
              
              <Button 
                variant="primary"
                size="lg"
                asChild
              >
                <Link 
                  href="/about" 
                  aria-label={t('home.about.readMore') + ' rosebotanique'}
                >
                  {t('home.about.readMore')}
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-250 ease-brand group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Signature line — same in both locales */}
            <div className="md:text-left text-center">
              <span className="text-xs tracking-wide text-inkSoft/60">made in daymohk</span>
            </div>
          </div>

          {/* Images — ULTRA COMPACT */}
          <div className="space-y-2 media-col relative">
            {/* Main hero image — more compact */}
            <div className="relative aspect-[16/9] md:aspect-[4/3] rounded-lg overflow-hidden group">
              <Image
                src="/images/about-one.png"
                alt={t('home.about.alt.process')}
                fill
                priority
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out group-hover:scale-[1.03]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder/about_main_placeholder.webp'
                }}
              />
              {/* more delicate mask */}
              <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_70%)] bg-sageTint/10 pointer-events-none" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-t from-sageTint/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
            </div>

            {/* Two smaller images — more compact */}
            <div className="grid grid-cols-2 gap-1.5 md:gap-2">
              <div className="relative aspect-square md:aspect-square rounded-md overflow-hidden group">
              <Image
                src="/images/about-two.png"
                alt={t('home.about.alt.texture')}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_square_macro_placeholder.webp'
                  }}
                />
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)] bg-sageTint/10 pointer-events-none" aria-hidden="true" />
              </div>

              <div className="relative aspect-square md:aspect-square rounded-md overflow-hidden group">
              <Image
                src="/images/about-three.png"
                alt={t('home.about.alt.stitching')}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_square_tools_placeholder.webp'
                  }}
                />
                <div className="absolute inset-0 [mask-image:linear-gradient(to_top,black,transparent_80%)] bg-sageTint/10 pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  )
}
