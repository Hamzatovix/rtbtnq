import { prisma } from '@/server/prisma'
import { OrderStatus, PaymentStatus, FulfillmentStatus } from './status'
import { release } from './inventory'
import { addOrderEvent } from './events'

export async function expireReservations(now = new Date()) {
  const expired = await prisma.order.findMany({
    where: {
      orderStatus: OrderStatus.NEW,
      reservationExpiresAt: { lt: now },
    },
    select: { id: true },
  })
  for (const o of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: o.id },
        data: {
          orderStatus: OrderStatus.CANCELED,
          paymentStatus: PaymentStatus.UNPAID,
          fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        },
      })
    })
    await release(o.id)
    await addOrderEvent(o.id, 'reservation_expired', {})
  }
  return expired.length
}


