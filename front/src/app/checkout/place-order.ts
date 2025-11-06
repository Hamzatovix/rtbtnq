'use server'

import { z } from 'zod'
import { nanoid } from 'nanoid'
import { mockProducts } from '@/lib/mock-data'

const CartItemSchema = z.object({
  id: z.number(),
  qty: z.number().int().min(1),
  color: z.string().nullable().optional()
})

const CheckoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  address1: z.string().min(3),
  address2: z.string().optional().nullable(),
  city: z.string().min(2),
  postcode: z.string().min(3),
  country: z.string().min(2),
  shippingMethod: z.enum(['standard','pickup']),
  notes: z.string().optional().nullable(),
  website: z.string().optional().nullable(), // honeypot
  cart: z.string().min(2)
})

function priceCentsFromLabel(label: string): number {
  // ожидаем "$4,200" → 420000
  const digits = label.replace(/[^\d]/g, '')
  return Number(digits) * 100 // если ценник без копеек
}

export async function placeOrder(formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries())
    const parsed = CheckoutSchema.parse(raw)
    if (parsed.website) return { ok: false, message: 'Bot detected' }

    const cartParsed = JSON.parse(parsed.cart) as unknown
    const cart = z.array(CartItemSchema).parse(cartParsed)

    // Пересчитываем на сервере (анти-манипуляция)
    const productsMap = new Map(mockProducts.map(p => [p.id, p]))
    let items: Array<{
      id: number, title: string, qty: number, unitPriceCents: number, subtotalCents: number
    }> = []
    let subtotalCents = 0

    for (const ci of cart) {
      const p = productsMap.get(ci.id)
      if (!p) continue
      const unitPriceCents = priceCentsFromLabel(String(p.price))
      const subtotal = unitPriceCents * ci.qty
      items.push({ id: p.id, title: p.title, qty: ci.qty, unitPriceCents, subtotalCents: subtotal })
      subtotalCents += subtotal
    }

    const shippingCents = parsed.shippingMethod === 'pickup' ? 0 : 0 // добавите позже тариф
    const totalCents = subtotalCents + shippingCents
    const orderId = `RB-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${nanoid(6)}`

    const order = {
      orderId,
      status: 'pending_payment' as const,
      createdAt: new Date().toISOString(),
      customer: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone ?? ''
      },
      shipping: {
        address1: parsed.address1,
        address2: parsed.address2 ?? '',
        city: parsed.city,
        postcode: parsed.postcode,
        country: parsed.country,
        method: parsed.shippingMethod
      },
      notes: parsed.notes ?? '',
      items,
      totals: {
        subtotalCents,
        shippingCents,
        totalCents,
        currency: 'RUB'
      }
    }

    // (Опционально) отправляем письма, если настроены переменные окружения
    try {
      if (process.env.RESEND_API_KEY && process.env.ORDERS_EMAIL_TO) {
        // Email отправка временно отключена
        // const { Resend } = await import('resend')
        // const resend = new Resend(process.env.RESEND_API_KEY)
        // const adminText =
        // `New order ${orderId}
        // 
        // Customer: ${order.customer.name} <${order.customer.email}> ${order.customer.phone ? `(${order.customer.phone})` : ''}
        // Address: ${order.shipping.address1} ${order.shipping.address2 || ''}, ${order.shipping.city} ${order.shipping.postcode}, ${order.shipping.country}
        // Method: ${order.shipping.method}
        // 
        // Items:
        // ${items.map(i => `- ${i.title} × ${i.qty}`).join('\n')}
        // 
        // Total: $${(totalCents/100).toFixed(2)} (pending_payment)
        // Notes: ${order.notes || '—'}
        // `
        // await resend.emails.send({
        //   from: 'orders@rosebotanique.store',
        //   to: process.env.ORDERS_EMAIL_TO,
        //   subject: `New order ${orderId}`,
        //   text: adminText,
        // })
        // await resend.emails.send({
        //   from: 'orders@rosebotanique.store',
        //   to: parsed.email,
        //   subject: `Your order ${orderId} — pending payment`,
        //   text:
        // `Thanks for your order!
        // 
        // Order: ${orderId}
        // Total: $${(totalCents/100).toFixed(2)}
        // Status: pending payment
        // 
        // We will email invoice with bank transfer instructions shortly.
        // If you have questions, just reply to this email.
        // 
        // — rosebotanique`
        // })
      }
    } catch (e) {
      console.error('Email send failed', e)
      // не валим заказ, просто лог
    }

    // В реальной БД сохраняем order; сейчас возвращаем ответ
    return { ok: true, orderId }
  } catch (e: any) {
    console.error(e)
    return { ok: false, message: e?.message || 'Validation error' }
  }
}

