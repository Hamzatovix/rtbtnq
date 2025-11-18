'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import NordicSunDisc from '@/components/visuals/NordicSunDisc'
import { useTranslations } from '@/hooks/useTranslations'
import { useState } from 'react'

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
} as const

// Галерея изображений
const galleryImages = [
  { src: '/images/about-one.png', alt: 'Процесс создания' },
  { src: '/images/about-two.png', alt: 'Текстура материалов' },
  { src: '/images/about-three.png', alt: 'Ручная отстрочка' },
  { src: '/images/about-m.jpg.png', alt: 'Мастерская' },
]

export default function BrandPage() {
  const prefersReducedMotion = useReducedMotion()
  const t = useTranslations()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="bg-white dark:bg-background text-inkSoft dark:text-foreground">
      {/* Hero section with NordicSunDisc */}
      <section
        aria-label={t('home.brand.title')}
        className="relative h-[58vh] min-h-[320px] w-full overflow-hidden"
      >
        <Image
          src="/images/about-m.jpg.png"
          alt={t('brandPage.heroAlt') || 'atelier'}
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
            <NordicSunDisc size={80} idSuffix="brand-page" interactive />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-wide text-white">
            {t('home.brand.title')}
          </h1>
          <p className="mt-3 text-base md:text-lg text-white/80">
            {t('brandPage.heroSubtitle')}
          </p>
        </motion.div>
      </section>

      {/* Story section */}
      <section className="py-16 md:py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="container mx-auto px-6 md:px-12 lg:px-24 max-w-4xl"
          role="region"
          aria-labelledby="brand-title"
        >
          {/* Заголовок */}
          <h2
            id="brand-title"
            className="text-title-1 md:text-display-2 font-normal text-inkSoft dark:text-foreground leading-tight tracking-wide mb-10 md:mb-14"
          >
            {t('brandPage.storyTitle')}
          </h2>

          {/* Основной текст */}
          <div className="space-y-6 md:space-y-7 text-base md:text-lg lg:text-xl font-normal leading-relaxed md:leading-loose text-inkSoft dark:text-foreground">
            <p className="text-inkSoft/90 dark:text-foreground/90">
              {t('brandPage.paragraph1')}
            </p>
            <p className="text-inkSoft/90 dark:text-foreground/90">
              {t('brandPage.paragraph2')}
            </p>
          </div>

          {/* Теги ценностей */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-mistGray/20 dark:border-border/50">
            <div className="flex flex-wrap gap-3 md:gap-4">
              {[t('brandPage.tagQuality'), t('brandPage.tagTraditions'), t('brandPage.tagSimplicity')].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-mistGray/30 dark:border-border/60 bg-mistGray/5 dark:bg-muted/10 px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base font-normal text-inkSoft dark:text-foreground tracking-wide uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Подпись */}
          <div className="mt-12 md:mt-16 pt-8 md:pt-10 border-t border-mistGray/15 dark:border-border/30">
            <p className="text-xs md:text-sm font-normal tracking-[0.15em] uppercase text-inkSoft/75 dark:text-muted-foreground">
              made in daymohk
            </p>
          </div>
        </motion.div>
      </section>

      {/* Gallery section */}
      <section className="py-16 md:py-24 bg-mistGray/5 dark:bg-muted/5">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fade}
          className="container mx-auto px-6 md:px-12 lg:px-24"
        >
          <h2 className="text-title-1 md:text-display-2 font-normal text-inkSoft dark:text-foreground leading-tight tracking-wide mb-10 md:mb-14 text-center">
            {t('brandPage.galleryTitle')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      duration: 0.5, 
                      delay: index * 0.1,
                      ease: [0.22, 1, 0.36, 1]
                    }
                  },
                }}
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => setSelectedImage(image.src)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder/about_main_placeholder.webp'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Modal для просмотра изображения */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label="Закрыть"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Увеличенное изображение"
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

