import { prisma } from '@/server/prisma'

export async function addOrderEvent(orderId: string, type: string, data: Record<string, any> = {}, actorId?: string) {
  return prisma.orderEvent.create({
    data: {
      orderId,
      type,
      data,
      actorId,
    },
  })
}


