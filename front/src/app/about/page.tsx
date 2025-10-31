'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import NordicSunDisc from '@/components/visuals/NordicSunDisc'

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
} as const

export default function AboutPage() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="bg-white text-inkSoft">
      {/* One-shot hero with NordicSunDisc */}
      <section
        aria-label="About the brand"
        className="relative h-[58vh] min-h-[320px] w-full overflow-hidden"
      >
        <Image
          src="/images/about-m.jpg.png"
          alt="Atelier — quiet craftsmanship in natural materials"
          fill
          priority
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
            About the brand
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/80">
            Philosophy of simplicity, material quality and attention to detail
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
          <h2 id="about-title" className="sr-only">Our story</h2>


          <p className="mb-4">
            rosebotanique was born from a love of nature and the desire to create
            objects that are both beautiful and useful. Each piece is handcrafted
            using traditional techniques and natural materials.
          </p>
          <p>
            We believe quality objects should last and quietly live with you every day.
            That is why we choose reliable materials and work with artisans who share our values.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            {['Sustainability', 'Quality', 'Traditions', 'Simplicity'].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-mistGray/30 px-3 py-1 text-inkSoft/70"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="mailto:hello@rosebotanique.store"
              aria-label="Email hello@rosebotanique.store"
              className="inline-flex items-center rounded-full border border-mistGray/40 px-5 py-2 text-base hover:bg-mistGray/10 transition-colors"
            >
              hello@rosebotanique.store
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

