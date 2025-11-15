'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import NordicSunDisc from '@/components/visuals/NordicSunDisc'
import { useTranslations } from '@/hooks/useTranslations'

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
} as const

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion()
  const t = useTranslations()

  return (
    <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground">
      {/* One-shot hero with NordicSunDisc */}
      <section
        aria-label={t('home.about.title')}
        className="relative h-[58vh] min-h-[320px] w-full overflow-hidden"
      >
        <Image
          src="/images/about-m.jpg.png"
          alt={t('aboutPage.heroAlt') || 'atelier'}
          fill
          priority={false}
          loading="lazy"
          sizes="100vw"
          className="object-cover"
        />

        {/* универсальный overlay для читаемости */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
        />

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.7 } }}
          className="relative z-10 mx-auto max-w-4xl container px-4 md:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-center"
        >
          <div className="flex justify-center mb-6">
            <NordicSunDisc size={80} idSuffix="about-page" interactive />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-white">
            {t('home.about.title')}
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/80">
            {t('aboutPage.heroSubtitle')}
          </p>
        </motion.div>
      </section>

      {/* Short story */}
      <section className="py-16 md:py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="container mx-auto px-6 md:px-12 lg:px-24 max-w-4xl"
          role="region"
          aria-labelledby="about-title"
        >
          {/* Заголовок */}
          <h2
            id="about-title"
            className="text-title-1 md:text-display-2 font-light text-inkSoft dark:text-foreground leading-tight tracking-wide mb-10 md:mb-14"
          >
            {t('aboutPage.storyTitle')}
          </h2>

          {/* Основной текст */}
          <div className="space-y-6 md:space-y-7 text-base md:text-lg lg:text-xl font-light leading-relaxed md:leading-loose text-inkSoft dark:text-foreground">
            <p className="text-inkSoft/90 dark:text-foreground/90">
              {t('aboutPage.paragraph1')}
            </p>
            <p className="text-inkSoft/90 dark:text-foreground/90">
              {t('aboutPage.paragraph2')}
            </p>
          </div>

          {/* Теги ценностей */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-mistGray/20 dark:border-border/50">
            <div className="flex flex-wrap gap-3 md:gap-4">
              {[t('aboutPage.tagQuality'), t('aboutPage.tagTraditions'), t('aboutPage.tagSimplicity')].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-mistGray/30 dark:border-border/60 bg-mistGray/5 dark:bg-muted/10 px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base font-light text-inkSoft dark:text-foreground tracking-wide uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Подпись */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-mistGray/15 dark:border-border/30">
            <p className="text-xs md:text-sm font-light tracking-[0.15em] uppercase text-inkSoft/60 dark:text-muted-foreground">
              made in daymohk
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

