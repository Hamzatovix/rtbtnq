import { NextRequest, NextResponse } from 'next/server'
import { listOrders, createOrder } from '@/server/orders/orders.service'
import { ListOrdersSchema, CreateOrderSchema } from '@/server/orders/validators'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const parsed = ListOrdersSchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  const data = await listOrders(parsed.data)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  const order = await createOrder(parsed.data)
  return NextResponse.json(order, { status: 201 })
}


