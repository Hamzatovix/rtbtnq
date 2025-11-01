'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Lead } from '@/components/ui/typography'

function OrderSuccessInner() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('number')

  if (!orderNumber) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-display-1 font-light text-ink-soft mb-6">Order not found</h1>
          <Button onClick={() => window.location.href = '/catalog'}>
            Browse catalog
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-sageTint/6 rounded-full blur-2xl anim-breath" />
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-mistGray/15 rounded-full blur-3xl anim-breath" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-display-1 font-light text-ink-soft leading-[0.95] mb-6 tracking-normal">
            Order placed!
          </h1>
          
          <Lead className="max-w-xl mx-auto mb-8">
            Thank you for your order. We've received your request and will contact you shortly for confirmation.
          </Lead>

          <div className="bg-gray-50 p-6 rounded-2xl max-w-md mx-auto mb-8">
            <p className="text-small font-medium text-ink-soft/70 tracking-wide mb-2">Order number</p>
            <p className="text-h3 font-light text-ink-soft">{orderNumber}</p>
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
              Continue shopping
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print order
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessInner />
    </Suspense>
  )
}
