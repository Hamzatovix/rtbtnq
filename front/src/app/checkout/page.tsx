'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Lead } from '@/components/ui/typography'
import { useCartStore } from '@/store/cart-store'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    country: 'Russia',
    city: '',
    addressOptional: '',
    pickupPoint: '',
    note: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mark fields that were autofilled by browser/password manager before first focus
  useEffect(() => {
    const markAutocompleted = () => {
      const nodes = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-rb-input]')
      nodes.forEach((el) => {
        if (el.value && !el.hasAttribute('data-autocompleted')) {
          el.setAttribute('data-autocompleted', '')
        }
      })
    }
    // First wave (after hydration and fast password managers)
    const t1 = setTimeout(markAutocompleted, 150)
    // Second wave — lazy password managers/browsers
    const t2 = setTimeout(markAutocompleted, 750)

    const onVis = () => requestAnimationFrame(markAutocompleted)
    document.addEventListener('visibilitychange', onVis)

    const onAnim = (e: AnimationEvent) => {
      if (e.animationName === 'rb-autofill-start') markAutocompleted()
    }
    document.addEventListener('animationstart', onAnim, true)

    return () => {
      clearTimeout(t1); clearTimeout(t2)
      document.removeEventListener('visibilitychange', onVis)
      document.removeEventListener('animationstart', onAnim, true)
    }
  }, [])

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [k]: e.target.value }))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) return alert('Cart is empty')
    setIsSubmitting(true)
    setTimeout(() => {
      const orderNumber = `ORD-${Date.now()}`
      clearCart()
      router.push(`/order/success?number=${orderNumber}`)
    }, 800)
  }

  const total = mounted ? getTotalPrice() : 0
  const shipping = 500
  const grand = total + shipping

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/6 w-32 h-32 bg-sageTint/6 rounded-full blur-2xl anim-breath" />
        <div className="absolute bottom-1/4 right-1/6 w-40 h-40 bg-mistGray/15 rounded-full blur-3xl anim-breath" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h1 className="text-display-1 font-light text-inkSoft leading-[0.95] mb-6 tracking-normal">checkout</h1>
          <Lead className="max-w-xl mx-auto">Complete your order and we'll prepare your items with care.</Lead>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.form initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-h3 font-light text-inkSoft mb-2">Contact Information</h2>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={onChange('name')} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={onChange('phone')} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-h3 font-light text-inkSoft mb-2">Delivery Address</h2>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={onChange('country')} required />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={onChange('city')} required />
              </div>

              <div>
                <Label htmlFor="addressOptional">Optional: delivery address</Label>
                <Input id="addressOptional" value={form.addressOptional} onChange={onChange('addressOptional')} />
              </div>
              <div>
                <Label htmlFor="pickup">Optional: pickup point (Grozny)</Label>
                <Input id="pickup" value={form.pickupPoint} onChange={onChange('pickupPoint')} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-h3 font-light text-inkSoft mb-2">Order Comment</h2>
              <div>
                <Label htmlFor="note">Additional notes</Label>
                <Textarea id="note" rows={3} value={form.note} onChange={onChange('note')} />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Placing order...' : 'Place order'}
            </Button>
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="bg-linenWhite p-6 rounded-2xl border border-mistGray/20 shadow-breathing">
            <h2 className="text-h3 font-light text-inkSoft mb-6">Your Order</h2>
            <div className="space-y-4 mb-6">
              {(mounted ? items : []).map((item) => (
                <div key={`${item.id}-${item.selectedColor}`} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-inkSoft">
                      {item.title}
                      {item.selectedColor && ` - ${item.selectedColor}`}
                    </p>
                    <p className="text-sm text-inkSoft/70" suppressHydrationWarning>
                      {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <p className="font-medium text-inkSoft" suppressHydrationWarning>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-mistGray/30 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-inkSoft/70">Subtotal:</span>
                <span suppressHydrationWarning>{total.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inkSoft/70">Shipping:</span>
                <span suppressHydrationWarning>{shipping.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-lg font-medium">
                <span>Total:</span>
                <span suppressHydrationWarning>{grand.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
