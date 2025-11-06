import { NextRequest, NextResponse } from 'next/server'
import { getOrder, updateOrder } from '@/server/orders/orders-json.service'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await getOrder(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Ошибка при получении заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении заказа' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const order = await updateOrder(params.id, data)
    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Ошибка при обновлении заказа:', error)
    return NextResponse.json(
      { error: 'Ошибка при обновлении заказа' },
      { status: 500 }
    )
  }
}


