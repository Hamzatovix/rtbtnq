import { NextResponse } from 'next/server'
import { expireReservations } from '@/server/orders/ttl'

export async function POST() {
  const count = await expireReservations()
  return NextResponse.json({ expired: count })
}


