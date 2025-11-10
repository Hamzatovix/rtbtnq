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
    
    const { customerName, customerEmail, customerPhone, items, addresses, total, currency } = body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items обязательны' },
        { status: 400 }
      )
    }
    
    const order = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      items,
      addresses,
      total: total || items.reduce((sum: number, item: any) => sum + (item.total || item.price * item.qty || 0), 0),
      currency: currency || 'RUB',
    })
    
    const baseUrl = buildBaseUrl(req)
    ;(async () => {
      try {
        await sendOrderNotification(
          {
            orderId: order.id,
            orderNumber: order.number,
            customerName: order.customerName ?? '—',
            customerPhone: order.customerPhone ?? '',
            items: order.items ?? [],
            total: order.total,
            currency: order.currency ?? 'RUB',
            addresses: order.addresses ?? [],
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


