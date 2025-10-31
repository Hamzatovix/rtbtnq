export type Kind = 'order' | 'payment' | 'fulfillment'

export const OrderStatus = {
  NEW: 'NEW',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const

export const PaymentStatus = {
  UNPAID: 'UNPAID',
  PENDING: 'PENDING',
  PAID: 'PAID',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  REFUNDED: 'REFUNDED',
} as const

export const FulfillmentStatus = {
  UNFULFILLED: 'UNFULFILLED',
  PICKING: 'PICKING',
  PACKED: 'PACKED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  PARTIALLY_RETURNED: 'PARTIALLY_RETURNED',
  RETURNED: 'RETURNED',
} as const

const transitions = {
  order: new Map([
    [OrderStatus.NEW, new Set([OrderStatus.CONFIRMED, OrderStatus.CANCELED])],
    [OrderStatus.CONFIRMED, new Set([OrderStatus.IN_PROGRESS, OrderStatus.CANCELED])],
    [OrderStatus.IN_PROGRESS, new Set([OrderStatus.COMPLETED, OrderStatus.CANCELED])],
    [OrderStatus.COMPLETED, new Set([])],
    [OrderStatus.CANCELED, new Set([])],
  ]),
  payment: new Map([
    [PaymentStatus.UNPAID, new Set([PaymentStatus.PENDING, PaymentStatus.PAID])],
    [PaymentStatus.PENDING, new Set([PaymentStatus.PAID, PaymentStatus.UNPAID])],
    [PaymentStatus.PAID, new Set([PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED])],
    [PaymentStatus.PARTIALLY_REFUNDED, new Set([PaymentStatus.REFUNDED])],
    [PaymentStatus.REFUNDED, new Set([])],
  ]),
  fulfillment: new Map([
    [FulfillmentStatus.UNFULFILLED, new Set([FulfillmentStatus.PICKING])],
    [FulfillmentStatus.PICKING, new Set([FulfillmentStatus.PACKED])],
    [FulfillmentStatus.PACKED, new Set([FulfillmentStatus.SHIPPED])],
    [FulfillmentStatus.SHIPPED, new Set([FulfillmentStatus.DELIVERED])],
    [FulfillmentStatus.DELIVERED, new Set([FulfillmentStatus.PARTIALLY_RETURNED, FulfillmentStatus.RETURNED])],
    [FulfillmentStatus.PARTIALLY_RETURNED, new Set([FulfillmentStatus.RETURNED])],
    [FulfillmentStatus.RETURNED, new Set([])],
  ]),
} as const

export function assertTransition(current: string, next: string, kind: Kind) {
  const map = transitions[kind] as unknown as Map<string, Set<string>>
  const allowed = map.get(current)
  if (!allowed || !allowed.has(next as any)) {
    throw new Error(`Недопустимый переход ${kind}: ${current} → ${next}`)
  }
}


