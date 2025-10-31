import { prisma } from '@/server/prisma'

export async function reserve(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId } })
    for (const item of items) {
      const inv = await tx.inventory.findUnique({ where: { sku: item.sku } })
      if (!inv || inv.qtyOnHand - inv.qtyReserved < item.qty) {
        throw new Error(`Недостаточно остатков для SKU ${item.sku}`)
      }
      await tx.inventory.update({
        where: { sku: item.sku },
        data: { qtyReserved: inv.qtyReserved + item.qty },
      })
    }
  })
}

export async function release(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId } })
    for (const item of items) {
      const inv = await tx.inventory.findUnique({ where: { sku: item.sku } })
      if (!inv) continue
      await tx.inventory.update({
        where: { sku: item.sku },
        data: { qtyReserved: Math.max(0, inv.qtyReserved - item.qty) },
      })
    }
  })
}

export async function commit(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId } })
    for (const item of items) {
      const inv = await tx.inventory.findUnique({ where: { sku: item.sku } })
      if (!inv || inv.qtyReserved < item.qty || inv.qtyOnHand < item.qty) {
        throw new Error(`Нельзя списать SKU ${item.sku}`)
      }
      await tx.inventory.update({
        where: { sku: item.sku },
        data: { qtyReserved: inv.qtyReserved - item.qty, qtyOnHand: inv.qtyOnHand - item.qty },
      })
    }
  })
}


