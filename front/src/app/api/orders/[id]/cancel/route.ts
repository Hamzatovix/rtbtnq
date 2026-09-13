import { NextRequest, NextResponse } from 'next/server'
import { updateOrder } from '@/server/orders/orders-json.service'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await updateOrder(params.id, {
      orderStatus: 'cancelled',
      fulfillmentStatus: 'cancelled',
    })
    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    console.error('Ошибка при отмене заказа:', error)
    return NextResponse.json({ error: 'Не удалось отменить заказ' }, { status: 500 })
  }
}
