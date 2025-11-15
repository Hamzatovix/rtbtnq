'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ElvenFlower from '@/components/visuals/ElvenFlower'
import { StarField } from '@/components/visuals/StarField'
import { useTranslations } from '@/hooks/useTranslations'

export function Hero() {
  const t = useTranslations()
  return (
    <section 
      className="relative min-h-[72svh] md:min-h-[88svh] flex items-center justify-center bg-white dark:bg-background pb-16 md:pb-20"
      aria-labelledby="hero-heading"
    >
      {/* Звездное небо - только в темной теме */}
      <StarField />
      {/* Градиентное затухание звезд внизу для плавного перехода */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-[5]" aria-hidden="true" />
      
      {/* Контент */}
      <div className="relative z-10 container mx-auto px-5 sm:px-6 md:px-12 lg:px-16">
        <div className="relative mx-auto max-w-4xl text-center md:-translate-y-[2vh]">
          {/* Эльфийский цветок — над названием, по центру узла */}
          <div className="flex justify-center mb-6 md:mb-4">
            <ElvenFlower className="relative" size={120} ariaLabel="Decorative flower. Hover or focus to bloom." />
          </div>

          <h1 
            id="hero-heading"
            className="text-4xl xs:text-[2.8rem] sm:text-display-1 font-light text-ink-soft dark:text-foreground leading-[1.02] md:leading-[0.95] mb-10 md:mb-14 tracking-normal"
          >
            rosebotanique
          </h1>

          {/* CTA + вторичная тихая ссылка */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              asChild
            >
              <Link href="/catalog" aria-label={t('home.hero.cta') + ' rosebotanique'}>
                <span suppressHydrationWarning>{t('home.hero.cta')}</span>
                <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-250 ease-brand group-hover:translate-x-1" />
              </Link>
            </Button>

            <span
              className="text-sm sm:text-body font-light tracking-wide leading-relaxed text-inkSoft/80 dark:text-muted-foreground text-center max-w-[20rem]"
              suppressHydrationWarning
            >
              {t('home.hero.tagline')}
            </span>
          </div>
        </div>
      </div>

      {/* Микро-бейджи — в самом низу секции */}
      <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 text-center px-6">
        <div className="text-[13px] sm:text-xs text-ink-soft/75 dark:text-muted-foreground leading-relaxed" suppressHydrationWarning>
          {t('home.hero.badges')}
        </div>
      </div>
    </section>
  )
}

