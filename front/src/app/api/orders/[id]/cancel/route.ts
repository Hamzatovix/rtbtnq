import { NextRequest, NextResponse } from 'next/server'
import { cancelOrder } from '@/server/orders/orders.service'
import { CancelSchema } from '@/server/orders/validators'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const parsed = CancelSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  await cancelOrder(params.id, parsed.data.reason)
  return NextResponse.json({ ok: true })
}


