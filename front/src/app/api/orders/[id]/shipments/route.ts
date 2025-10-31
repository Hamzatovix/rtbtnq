import { NextRequest, NextResponse } from 'next/server'
import { createShipment } from '@/server/orders/orders.service'
import { ShipmentSchema } from '@/server/orders/validators'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const parsed = ShipmentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
  const shipment = await createShipment(params.id, parsed.data)
  return NextResponse.json(shipment)
}


