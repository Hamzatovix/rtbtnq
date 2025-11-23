'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Lead } from '@/components/ui/typography'
import { useTranslations } from '@/hooks/useTranslations'

function OrderSuccessInner() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('number')
  const t = useTranslations()

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-display-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] mb-6 tracking-tighter uppercase">{t('order.success.orderNotFound')}</h1>
          <Button onClick={() => window.location.href = '/catalog'}>
            {t('order.success.backToCatalog')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-accent/10 dark:bg-accent/20 rounded-sm flex items-center justify-center mx-auto mb-6 border border-accent/30 dark:border-accent/40">
            <svg className="w-8 h-8 text-accent dark:text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-display-1 md:text-[2rem] lg:text-[2.5rem] font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite leading-[0.95] mb-6 tracking-tighter uppercase">
            {t('order.success.title')}
          </h1>
          
          <Lead className="max-w-xl mx-auto mb-8 text-fintage-charcoal/80 dark:text-fintage-offwhite/80">
            {t('order.success.message')}
          </Lead>

          <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 p-6 rounded-sm max-w-md mx-auto mb-8 border border-fintage-graphite/20 dark:border-fintage-graphite/30">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-fintage-graphite/60 dark:text-fintage-graphite/50 mb-2">{t('order.success.orderNumber')}</p>
            <p className="text-h3 font-black text-fintage-charcoal dark:text-fintage-offwhite">{orderNumber}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.href = '/catalog'}>
              {t('order.success.continueShopping')}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              {t('order.success.printOrder')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  const t = useTranslations()
  return (
    <Suspense fallback={<div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas flex items-center justify-center">{t('order.success.loading')}</div>}>
      <OrderSuccessInner />
    </Suspense>
  )
}
