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
      <section className="py-12 md:py-18">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="container mx-auto px-6 md:px-12 lg:px-24 max-w-5xl"
          role="region"
          aria-labelledby="about-title"
        >
          <h2
            id="about-title"
            className="text-title-1 font-light text-ink-soft leading-tight tracking-wide text-center md:text-left"
          >
            {t('aboutPage.storyTitle')}
          </h2>

          <div className="mt-6 space-y-6 text-base md:text-lg font-light leading-relaxed text-inkSoft/80 text-center md:text-left">
            <p className="indent-6 md:indent-8">
              {t('aboutPage.paragraph1')}
            </p>
            <p className="indent-6 md:indent-8">
              {t('aboutPage.paragraph2')}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-2.5 md:gap-3 text-xs md:text-sm">
            {[t('aboutPage.tagQuality'), t('aboutPage.tagTraditions'), t('aboutPage.tagSimplicity')].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-mistGray/30 px-3 md:px-3.5 py-1.5 text-inkSoft/70 tracking-wide uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-8 text-xs md:text-sm font-light tracking-wide text-inkSoft/60 text-center md:text-left">
            made in daymohk
          </p>
        </motion.div>
      </section>
    </div>
  )
}

