'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ElvenFlower from '@/components/visuals/ElvenFlower'
import { StarField } from '@/components/visuals/StarField'
import { useTranslations } from '@/hooks/useTranslations'
import { useClientLocale } from '@/hooks/useClientLocale'

export function Hero() {
  const t = useTranslations()
  const locale = useClientLocale()
  
  return (
    <section 
      className="relative min-h-[90vh] md:min-h-[95vh] flex items-center justify-center bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas pb-20 md:pb-24 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30"
      aria-labelledby="hero-heading"
    >
      {/* Fintage декоративные линии - тонкие */}
      <div className="absolute top-0 left-0 right-0 h-px bg-fintage-graphite/20 dark:bg-fintage-graphite/30" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-fintage-graphite/20 dark:bg-fintage-graphite/30" aria-hidden="true" />
      
      {/* Контент - много воздуха */}
      <div className="relative z-10 container mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="relative mx-auto max-w-6xl text-center">
          {/* Год - технический стиль */}
          <div className="flex justify-center mb-12 md:mb-16">
            <span className="text-[10px] md:text-xs font-mono text-fintage-graphite/50 dark:text-fintage-graphite/40 tracking-[0.3em] uppercase">
              2024
            </span>
          </div>

          <h1 
            id="hero-heading"
            className="text-display-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] mb-12 md:mb-16 tracking-tighter"
          >
            ROSEBOTANIQUE
          </h1>

          {/* Подзаголовок - технический стиль */}
          <div className="mb-16 md:mb-20">
            <p className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] mb-4">
              {t('home.hero.tagline')}
            </p>
            {/* Разделительная линия */}
            <div className="w-16 h-px bg-fintage-graphite/30 dark:bg-fintage-graphite/40 mx-auto" aria-hidden="true" />
          </div>

          {/* CTA - минималистичная кнопка в техническом стиле */}
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              asChild
              className="group font-mono tracking-[0.15em]"
            >
              <Link href="/catalog" aria-label={t('home.hero.cta') + ' rosebotanique'} className="flex items-center gap-2">
                <span suppressHydrationWarning className="uppercase text-xs md:text-sm tracking-[0.15em]">
                  {t('home.hero.cta')}
                </span>
                <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:translate-x-0.5 transition-fintage" />
              </Link>
            </Button>

            {/* Техническая подпись под кнопкой */}
            <p className="text-[9px] md:text-[10px] font-mono text-fintage-graphite/40 dark:text-fintage-graphite/50 uppercase tracking-[0.2em]">
              {locale === 'ru' ? 'КОЛЛЕКЦИЯ' : 'COLLECTION'}
            </p>
          </div>
        </div>
      </div>

      {/* Минималистичные бейджи внизу - технический стиль */}
      <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 text-center px-6">
        <div className="text-[9px] sm:text-[10px] font-mono text-fintage-graphite/40 dark:text-fintage-graphite/50 leading-relaxed tracking-[0.2em] uppercase" suppressHydrationWarning>
          {t('home.hero.badges')}
        </div>
      </div>
    </section>
  )
}

