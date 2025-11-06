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
import { useTranslations } from '@/hooks/useTranslations'
import { useLocaleStore } from '@/store/locale-store'
import { formatPriceWithLocale } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const t = useTranslations()
  const { locale } = useLocaleStore()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    country: locale === 'ru' ? 'Россия' : 'Russia',
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) return alert(locale === 'ru' ? 'Корзина пуста' : 'Cart is empty')
    setIsSubmitting(true)
    
    try {
      // Формируем элементы заказа
      const orderItems = items.map(item => ({
        name: item.title,
        productName: item.title,
        sku: `${item.id}-${item.selectedColor || 'default'}`,
        qty: item.quantity,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.price,
        total: item.price * item.quantity,
        image: item.image || '/placeholder/about_main_placeholder.webp',
        color: item.selectedColor || '',
      }))
      
      // Формируем адрес доставки
      const shippingAddress = {
        country: form.country,
        city: form.city,
        address: form.addressOptional,
        pickupPoint: form.pickupPoint,
      }
      
      // Создаём заказ через API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: '', // Можно добавить поле email в форму
          customerPhone: form.phone,
          items: orderItems,
          addresses: [shippingAddress],
          total: grand,
          currency: 'RUB',
          note: form.note || '',
        }),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Ошибка создания заказа' }))
        alert(error.error || 'Ошибка создания заказа')
        setIsSubmitting(false)
        return
      }
      
      const order = await response.json()
      clearCart()
      router.push(`/order/success?number=${order.number || order.id}`)
    } catch (error: any) {
      console.error('Ошибка при создании заказа:', error)
      alert(locale === 'ru' ? 'Ошибка при создании заказа. Попробуйте ещё раз.' : 'Error creating order. Please try again.')
      setIsSubmitting(false)
    }
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
          <h1 className="text-display-1 font-light text-inkSoft leading-[0.95] mb-6 tracking-normal">{t('checkout.title')}</h1>
          <Lead className="max-w-xl mx-auto">{t('checkout.orderDetails')}</Lead>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.form initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} onSubmit={onSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-h3 font-light text-inkSoft mb-2">{t('checkout.contactInfo')}</h2>
              <div>
                <Label htmlFor="name">{t('checkout.name')}</Label>
                <Input id="name" placeholder={t('checkout.namePlaceholder')} value={form.name} onChange={onChange('name')} required />
              </div>
              <div>
                <Label htmlFor="phone">{t('checkout.phone')}</Label>
                <Input id="phone" type="tel" placeholder={t('checkout.phonePlaceholder')} value={form.phone} onChange={onChange('phone')} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-h3 font-light text-inkSoft mb-2">{t('checkout.shippingInfo')}</h2>
              <div>
                <Label htmlFor="country">{t('checkout.country')}</Label>
                <Input id="country" value={form.country} onChange={onChange('country')} required />
              </div>
              <div>
                <Label htmlFor="city">{t('checkout.city')}</Label>
                <Input id="city" placeholder={t('checkout.cityPlaceholder')} value={form.city} onChange={onChange('city')} required />
              </div>

              <div>
                <Label htmlFor="addressOptional">{t('checkout.address')}</Label>
                <Input id="addressOptional" placeholder={t('checkout.addressPlaceholder')} value={form.addressOptional} onChange={onChange('addressOptional')} />
              </div>
              <div>
                <Label htmlFor="pickup">{t('checkout.pickupPoint')}</Label>
                <Input id="pickup" placeholder={t('checkout.pickupPointPlaceholder')} value={form.pickupPoint} onChange={onChange('pickupPoint')} />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-h3 font-light text-inkSoft mb-2">{t('checkout.note')}</h2>
              <div>
                <Label htmlFor="note">{t('checkout.note')}</Label>
                <Textarea id="note" rows={3} placeholder={t('checkout.notePlaceholder')} value={form.note} onChange={onChange('note')} />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
            </Button>
          </motion.form>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="bg-linenWhite p-6 rounded-2xl border border-mistGray/20 shadow-breathing">
            <h2 className="text-h3 font-light text-inkSoft mb-6">{t('checkout.yourOrder')}</h2>
            <div className="space-y-4 mb-6">
              {(mounted ? items : []).map((item) => (
                <div key={`${item.id}-${item.selectedColor}`} className="flex gap-3 items-center">
                  {item.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-mistGray/20">
                      <img 
                        src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder/about_main_placeholder.webp'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-light text-inkSoft truncate">
                      {item.title}
                      {item.selectedColor && ` - ${item.selectedColor}`}
                    </p>
                    <p className="text-sm text-inkSoft/70" suppressHydrationWarning>
                      {item.quantity} × {formatPriceWithLocale(item.price, locale)}
                    </p>
                  </div>
                  <p className="font-light text-inkSoft whitespace-nowrap" suppressHydrationWarning>
                    {formatPriceWithLocale(item.price * item.quantity, locale)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-mistGray/30 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-inkSoft/70">{locale === 'ru' ? 'Сумма:' : 'Subtotal:'}</span>
                <span suppressHydrationWarning>{formatPriceWithLocale(total, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inkSoft/70">{locale === 'ru' ? 'Доставка:' : 'Shipping:'}</span>
                <span suppressHydrationWarning>{formatPriceWithLocale(shipping, locale)}</span>
              </div>
              <div className="flex justify-between text-lg font-light">
                <span>{t('checkout.total')}</span>
                <span suppressHydrationWarning>{formatPriceWithLocale(grand, locale)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
