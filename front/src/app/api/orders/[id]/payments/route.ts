import { NextRequest, NextResponse } from 'next/server'
import { addPayment } from '@/server/orders/orders.service'
import { PaymentSchema } from '@/server/orders/validators'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = PaymentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  await addPayment(params.id, parsed.data.amount, parsed.data.method)
  return NextResponse.json({ ok: true })
}


