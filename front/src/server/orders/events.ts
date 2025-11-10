import { prisma } from '@/server/prisma'

export async function addOrderEvent(orderId: string, type: string, data: Record<string, any> = {}, actorId?: string) {
  const serialized =
    data && Object.keys(data).length > 0 ? JSON.stringify(data) : null

  return prisma.orderEvent.create({
    data: {
      orderId,
      type,
      data: serialized,
      actorId,
    },
  })
}


