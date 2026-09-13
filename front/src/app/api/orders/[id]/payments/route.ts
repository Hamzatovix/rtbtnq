import { NextRequest, NextResponse } from 'next/server'
import { getOrder, updateOrder } from '@/server/orders/orders-json.service'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}))
    const existing = await getOrder(params.id)
    if (!existing) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }

    const payment = {
      id: `pay_${Date.now()}`,
      amount: typeof body?.amount === 'number' ? body.amount : existing.total,
      method: body?.method || 'MANUAL',
      createdAt: new Date().toISOString(),
    }

    const order = await updateOrder(params.id, {
      payments: [...(existing.payments || []), payment],
      paymentStatus: 'paid',
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Ошибка при добавлении платежа:', error)
    return NextResponse.json({ error: 'Не удалось добавить платёж' }, { status: 500 })
  }
}
