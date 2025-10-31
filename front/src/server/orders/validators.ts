import { z } from 'zod'

export const OrderItemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
})

export const AddressSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  country: z.string().min(2),
  city: z.string().min(1),
  postal: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  company: z.string().optional(),
})

export const CreateOrderSchema = z.object({
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  addresses: z.array(AddressSchema).min(1),
})

export const ListOrdersSchema = z.object({
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
  query: z.string().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  fulfillmentStatus: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  tag: z.string().optional(),
})

export const PaymentSchema = z.object({ amount: z.coerce.number().positive(), method: z.string() })
export const ShipmentSchema = z.object({ carrier: z.string().optional(), service: z.string().optional(), tracking: z.string().optional() })
export const CancelSchema = z.object({ reason: z.string().optional() })


