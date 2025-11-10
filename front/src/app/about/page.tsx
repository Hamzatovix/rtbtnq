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
    <div className="bg-white text-inkSoft">
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

        {/* универсальный overlay для читаемости в light/dark */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent dark:from-black/45"
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
      <section className="py-12 md:py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="mx-auto max-w-3xl container px-4 md:px-6 lg:px-8 leading-relaxed text-inkSoft/80"
          role="region"
          aria-labelledby="about-title"
        >
          <h2 id="about-title" className="sr-only">{t('aboutPage.storyTitle')}</h2>


          <p className="mb-4">
            {t('aboutPage.paragraph1')}
          </p>
          <p>
            {t('aboutPage.paragraph2')}
          </p>

          <div className="mt-10 flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm">
            {[t('aboutPage.tagSustainability'), t('aboutPage.tagQuality'), t('aboutPage.tagTraditions'), t('aboutPage.tagSimplicity')].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-mistGray/30 px-2.5 md:px-3 py-1 text-inkSoft/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}

