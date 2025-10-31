import { NextRequest, NextResponse } from 'next/server'
import { getOrder, updateOrder } from '@/server/orders/orders.service'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const order = await updateOrder(params.id, data)
  return NextResponse.json(order)
}


