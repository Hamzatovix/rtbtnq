import { prisma } from '@/server/prisma'
import type { Prisma } from '@prisma/client'
import { addOrderEvent } from './events'
import { assertTransition, OrderStatus, PaymentStatus, FulfillmentStatus } from './status'
import { reserve, release, commit } from './inventory'
import { generateOrderNumber } from './numbers'

export async function createOrder(input: any) {
  // naive sequence from count (for demo only)
  const count = await prisma.order.count({})
  const number = generateOrderNumber(new Date(), count + 1)
  const items = input.items || []
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.total || i.price * i.qty || 0), 0)
  const total = subtotal
  const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const o = await tx.order.create({
      data: {
        number,
        customerEmail: input.customerEmail ?? null,
        customerPhone: input.customerPhone ?? null,
        customerName: input.customerName ?? null,
        subtotal,
        total,
        reservationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: { create: items },
        addresses: { create: input.addresses || [] },
      },
    })
    return o
  })
  await reserve(order.id)
  await addOrderEvent(order.id, 'created', { input })
  return order
}

export async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, addresses: true, payments: true, shipments: true, events: true, tags: { include: { tag: true } } },
  })
}

export async function listOrders(params: any) {
  const page = Number(params.page || 1)
  const pageSize = Math.min(Number(params.pageSize || 20), 100)
  const where: any = {}
  if (params.status) where.orderStatus = params.status
  if (params.paymentStatus) where.paymentStatus = params.paymentStatus
  if (params.fulfillmentStatus) where.fulfillmentStatus = params.fulfillmentStatus
  if (params.query) where.OR = [
    { number: { contains: params.query } },
    { customerEmail: { contains: params.query } },
    { customerName: { contains: params.query } },
  ]
  const [total, results] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ])
  return { results, meta: { total, page, pageSize } }
}

export async function updateOrder(id: string, data: any) {
  const order = await prisma.order.update({ where: { id }, data })
  await addOrderEvent(id, 'updated', { data })
  return order
}

export async function confirmOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Order not found')
  assertTransition(order.orderStatus, OrderStatus.CONFIRMED, 'order')
  const updated = await prisma.order.update({ where: { id }, data: { orderStatus: OrderStatus.CONFIRMED } })
  await addOrderEvent(id, 'confirmed', {})
  return updated
}

export async function addPayment(id: string, amount: number, method: string) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Order not found')
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.payment.create({ data: { orderId: id, amount, method: method as any, status: 'posted' } })
    const paidTotal = (await tx.payment.aggregate({ _sum: { amount: true }, where: { orderId: id, status: 'posted' } }))._sum.amount || 0
    const next = Number(paidTotal) >= Number(order.total) ? PaymentStatus.PAID : PaymentStatus.PENDING
    if (order.paymentStatus !== next) {
      assertTransition(order.paymentStatus, next, 'payment')
      await tx.order.update({ where: { id }, data: { paymentStatus: next, orderStatus: next === PaymentStatus.PAID && order.orderStatus === OrderStatus.NEW ? OrderStatus.IN_PROGRESS : order.orderStatus } })
    }
  })
  await addOrderEvent(id, 'payment_posted', { amount, method })
}

export async function createShipment(id: string, input: any) {
  const shipment = await prisma.shipment.create({ data: { orderId: id, carrier: input.carrier, service: input.service, tracking: input.tracking || null } })
  await prisma.order.update({ where: { id }, data: { fulfillmentStatus: FulfillmentStatus.PICKING } })
  await addOrderEvent(id, 'shipment_created', { shipment })
  return shipment
}

export async function markShipped(id: string) {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.order.update({ where: { id }, data: { fulfillmentStatus: FulfillmentStatus.SHIPPED } })
    await commit(id)
  })
  await addOrderEvent(id, 'shipment_shipped', {})
}

export async function markDelivered(id: string) {
  const updated = await prisma.order.update({ where: { id }, data: { fulfillmentStatus: FulfillmentStatus.DELIVERED, orderStatus: OrderStatus.COMPLETED } })
  await addOrderEvent(id, 'shipment_delivered', {})
  return updated
}

export async function cancelOrder(id: string, reason?: string) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Order not found')
  if (order.orderStatus !== OrderStatus.CANCELED) {
    await prisma.order.update({ where: { id }, data: { orderStatus: OrderStatus.CANCELED, paymentStatus: PaymentStatus.UNPAID } })
    await release(id)
    await addOrderEvent(id, 'canceled', { reason })
  }
}


