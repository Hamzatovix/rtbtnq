'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ElvenFlower from '@/components/visuals/ElvenFlower'
import { useTranslations } from '@/hooks/useTranslations'

export function Hero() {
  const t = useTranslations()
  return (
    <section 
      className="relative min-h-[88svh] flex items-center justify-center bg-white pb-20"
      aria-labelledby="hero-heading"
    >
      {/* Фоновые элементы (абсолютный слой) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        {/* Орб: левый-верх (чуть меньше, мягкий blur) */}
        <div
          className="absolute top-[12%] left-[8%] w-[22rem] h-[22rem] bg-sageTint/20 rounded-full blur-2xl anim-breath anim-delay-2s hidden sm:block"
        />

        {/* Орб: правый-низ (чуть крупнее) */}
        <div
          className="absolute bottom-[10%] right-[12%] w-[26rem] h-[26rem] bg-mistGray/20 rounded-full blur-3xl anim-breath anim-delay-4s"
        />

        {/* Нижняя деликатная вуаль (поддержка композиции) */}
        <div className="absolute bottom-0 left-0 right-0 h-[12svh] veil-bottom" />
      </div>

      {/* Контент */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16">
        <div className="relative mx-auto max-w-4xl text-center md:-translate-y-[2vh] -translate-y-[4vh]">
          {/* Эльфийский цветок — над названием, по центру узла */}
          <div className="flex justify-center mb-3 md:mb-4">
            <ElvenFlower className="relative" size={120} ariaLabel="Decorative flower. Hover or focus to bloom." />
          </div>
          
          {/* Halo под узлом (центр внимания) */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center" aria-hidden="true">
            <div className="hidden sm:block halo w-[320px] h-[320px] rounded-full blur-2xl anim-breath" />
            <div className="sm:hidden halo w-[190px] h-[190px] rounded-full blur-2xl anim-breath" />
          </div>

          <h1 
            id="hero-heading"
            className="text-display-1 font-light text-ink-soft leading-[0.95] mb-14 tracking-normal"
          >
            rosebotanique
          </h1>

          {/* CTA + вторичная тихая ссылка */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              asChild
            >
              <Link href="/catalog" aria-label={t('home.hero.cta') + ' rosebotanique'}>
                {t('home.hero.cta')}
                <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-250 ease-brand group-hover:translate-x-1" />
              </Link>
            </Button>

            <span className="text-body font-light tracking-wide leading-relaxed text-inkSoft">
              {t('home.hero.tagline')}
            </span>
          </div>
        </div>
      </div>

      {/* Микро-бейджи — в самом низу секции */}
      <div className="absolute bottom-20 left-0 right-0 text-center">
        <div className="text-xs text-ink-soft/65">
          {t('home.hero.badges')}
        </div>
      </div>
    </section>
  )
}

