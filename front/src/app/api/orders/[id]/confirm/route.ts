import { NextRequest, NextResponse } from 'next/server'
import { confirmOrder } from '@/server/orders/orders.service'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await confirmOrder(params.id)
  return NextResponse.json(order)
}


