import { NextRequest, NextResponse } from 'next/server'
import { listOrders, createOrder, markNewOrdersAsViewed } from '@/server/orders/orders-json.service'
import { sendOrderNotification } from '@/lib/telegram'

function buildBaseUrl(req: NextRequest): string | undefined {
  const headerUrl = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (!headerUrl) return undefined
  const protocol = req.headers.get('x-forwarded-proto') ?? 'https'
  return `${protocol}://${headerUrl}`
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const markViewed = url.searchParams.get('markViewed') === 'true'
    
    // Если запрос с markViewed=true, обновляем статус новых заказов
    if (markViewed) {
      await markNewOrdersAsViewed()
    }
    
    const status = url.searchParams.get('status') || undefined
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    
    const data = await listOrders({ status, limit, offset })
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Ошибка при получении заказов:', error)
    return NextResponse.json({ results: [], meta: { total: 0, limit: 100, offset: 0 } }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const { customerName, customerPhone, items, addresses, total, currency, shippingMethod, shippingPrice, note } = body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items обязательны' },
        { status: 400 }
      )
    }
    
    const order = await createOrder({
      customerName,
      customerPhone,
      items,
      addresses,
      total: total || items.reduce((sum: number, item: any) => sum + (item.total || item.price * item.qty || 0), 0),
      currency: currency || 'RUB',
      note,
      shippingMethod,
      shippingPrice,
    })
    
    const baseUrl = buildBaseUrl(req)
    ;(async () => {
      try {
        const shippingAddress = order.addresses && order.addresses.length > 0 ? order.addresses[0] : null
        
        await sendOrderNotification(
          {
            orderId: order.id,
            orderNumber: order.number,
            customerName: order.customerName ?? '—',
            customerPhone: order.customerPhone ?? '',
            items:
              order.items?.map((item: any) => ({
                name: item.name,
                qty: item.qty ?? item.quantity ?? 1,
                color: item.color ?? null,
                price: item.price ?? 0,
                total: item.total ?? item.price ?? 0,
                image: item.image ?? null,
              })) ?? [],
            total: order.total,
            currency: order.currency ?? 'RUB',
            address: shippingAddress
              ? {
                  country: shippingAddress.country ?? '',
                  city: shippingAddress.city ?? '',
                  line1: shippingAddress.line1 ?? '',
                  line2: shippingAddress.line2 ?? null,
                  postal: shippingAddress.postal ?? '',
                }
              : null,
            shippingMethod: (shippingAddress as any)?.shippingMethod ?? (order as any).shippingMethod ?? null,
            shippingPrice: (shippingAddress as any)?.shippingPrice ?? (order as any).shippingPrice ?? null,
            note: order.note,
            baseUrl,
          },
          process.env.TELEGRAM_BOT_TOKEN,
          process.env.TELEGRAM_CHAT_ID,
        )
      } catch (error) {
        console.error('[Order] Failed to send Telegram notification:', error)
      }
    })()
    
    return NextResponse.json(order, { status: 201 })
  } catch (error: any) {
    console.error('Ошибка при создании заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    )
  }
}


