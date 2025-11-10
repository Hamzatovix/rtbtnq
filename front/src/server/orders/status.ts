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

type OrderStatusValue = (typeof OrderStatus)[keyof typeof OrderStatus]
type PaymentStatusValue = (typeof PaymentStatus)[keyof typeof PaymentStatus]
type FulfillmentStatusValue = (typeof FulfillmentStatus)[keyof typeof FulfillmentStatus]

const orderTransitions: Array<[OrderStatusValue, Set<OrderStatusValue>]> = [
  [OrderStatus.NEW, new Set<OrderStatusValue>([OrderStatus.CONFIRMED, OrderStatus.CANCELED])],
  [OrderStatus.CONFIRMED, new Set<OrderStatusValue>([OrderStatus.IN_PROGRESS, OrderStatus.CANCELED])],
  [OrderStatus.IN_PROGRESS, new Set<OrderStatusValue>([OrderStatus.COMPLETED, OrderStatus.CANCELED])],
  [OrderStatus.COMPLETED, new Set<OrderStatusValue>()],
  [OrderStatus.CANCELED, new Set<OrderStatusValue>()],
]

const paymentTransitions: Array<[PaymentStatusValue, Set<PaymentStatusValue>]> = [
  [PaymentStatus.UNPAID, new Set<PaymentStatusValue>([PaymentStatus.PENDING, PaymentStatus.PAID])],
  [PaymentStatus.PENDING, new Set<PaymentStatusValue>([PaymentStatus.PAID, PaymentStatus.UNPAID])],
  [PaymentStatus.PAID, new Set<PaymentStatusValue>([PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED])],
  [PaymentStatus.PARTIALLY_REFUNDED, new Set<PaymentStatusValue>([PaymentStatus.REFUNDED])],
  [PaymentStatus.REFUNDED, new Set<PaymentStatusValue>()],
]

const fulfillmentTransitions: Array<[FulfillmentStatusValue, Set<FulfillmentStatusValue>]> = [
  [FulfillmentStatus.UNFULFILLED, new Set<FulfillmentStatusValue>([FulfillmentStatus.PICKING])],
  [FulfillmentStatus.PICKING, new Set<FulfillmentStatusValue>([FulfillmentStatus.PACKED])],
  [FulfillmentStatus.PACKED, new Set<FulfillmentStatusValue>([FulfillmentStatus.SHIPPED])],
  [FulfillmentStatus.SHIPPED, new Set<FulfillmentStatusValue>([FulfillmentStatus.DELIVERED])],
  [
    FulfillmentStatus.DELIVERED,
    new Set<FulfillmentStatusValue>([FulfillmentStatus.PARTIALLY_RETURNED, FulfillmentStatus.RETURNED]),
  ],
  [FulfillmentStatus.PARTIALLY_RETURNED, new Set<FulfillmentStatusValue>([FulfillmentStatus.RETURNED])],
  [FulfillmentStatus.RETURNED, new Set<FulfillmentStatusValue>()],
]

const transitions: Record<Kind, Map<string, Set<string>>> = {
  order: new Map(orderTransitions),
  payment: new Map(paymentTransitions),
  fulfillment: new Map(fulfillmentTransitions),
}

export function assertTransition(current: string, next: string, kind: Kind) {
  const map = transitions[kind] as unknown as Map<string, Set<string>>
  const allowed = map.get(current)
  if (!allowed || !allowed.has(next as any)) {
    throw new Error(`Недопустимый переход ${kind}: ${current} → ${next}`)
  }
}


