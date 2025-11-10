import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { nanoid } from 'nanoid'
import { sendOrderNotification } from '@/lib/telegram'
import { isSupabaseEnabled, supabaseDelete, supabaseSelect, supabaseUpsert } from '@/lib/supabase-admin'

const SUPABASE_ORDERS_TABLE = process.env.SUPABASE_ORDERS_TABLE || 'orders'

interface Order {
  id: string
  number: string
  customerName?: string | null
  customerEmail?: string | null
  customerPhone?: string | null
  items: Array<{
    id: string
    sku: string
    name: string
    qty: number
    price: number
    total: number
  }>
  addresses?: Array<{
    id: string
    type: string
    country: string
    city: string
    line1: string
    line2?: string
    postal: string
  }>
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'partially_fulfilled' | 'cancelled'
  orderStatus: 'new' | 'in_progress' | 'completed' | 'cancelled'
  total: number
  currency: string
  note?: string | null
  createdAt: string
  updatedAt: string
}

function getOrdersPath(): string {
  const root = process.cwd()
  const dataDir = join(root, 'src', 'data')
  return join(dataDir, 'orders.json')
}

async function ensureOrdersFile(): Promise<void> {
  const filePath = getOrdersPath()
  try {
    await readFile(filePath, 'utf-8')
  } catch {
    // Файл не существует, создаем пустой массив
    const dataDir = join(process.cwd(), 'src', 'data')
    try {
      await mkdir(dataDir, { recursive: true })
    } catch {}
    await writeFile(filePath, JSON.stringify([], null, 2), 'utf-8')
  }
}

async function loadOrdersFromSupabase(): Promise<Order[]> {
  try {
    const data = await supabaseSelect<Array<{ id: string; number?: string; order_status?: string; data?: Order; created_at?: string; updated_at?: string }>>(
      `${SUPABASE_ORDERS_TABLE}?select=id,number,order_status,data,created_at,updated_at&order=created_at.desc`,
    )

    return (Array.isArray(data) ? data : []).map((row) => {
      const payload = row.data ?? ({} as Order)
      return {
        ...payload,
        id: payload.id ?? row.id,
        number: payload.number ?? row.number ?? '',
        orderStatus: payload.orderStatus ?? row.order_status ?? 'new',
        createdAt: payload.createdAt ?? row.created_at ?? new Date().toISOString(),
        updatedAt: payload.updatedAt ?? row.updated_at ?? new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Supabase loadOrders error:', error)
    return []
  }
}

async function saveOrdersToSupabase(orders: Order[]): Promise<void> {
  const rows = orders.map((order) => ({
    id: order.id,
    number: order.number,
    order_status: order.orderStatus,
    data: order,
    created_at: order.createdAt ?? new Date().toISOString(),
    updated_at: order.updatedAt ?? new Date().toISOString(),
  }))

  await supabaseDelete(SUPABASE_ORDERS_TABLE, 'id=not.is.null')

  if (rows.length) {
    await supabaseUpsert(SUPABASE_ORDERS_TABLE, rows)
  }
}

// Кеш в памяти для оптимизации
let ordersCache: Order[] = []
let cacheTimestamp = 0
let cacheInitialized = false
const CACHE_TTL = 5000 // 5 секунд

export async function loadOrders(): Promise<Order[]> {
  const now = Date.now()

  if (cacheInitialized && now - cacheTimestamp < CACHE_TTL) {
    return ordersCache
  }

  let orders: Order[]

  if (isSupabaseEnabled()) {
    orders = await loadOrdersFromSupabase()
  } else {
    await ensureOrdersFile()
    const filePath = getOrdersPath()
    try {
      const content = await readFile(filePath, 'utf-8')
      orders = JSON.parse(content)
    } catch {
      orders = []
    }
  }

  ordersCache = orders
  cacheTimestamp = now
  cacheInitialized = true

  return ordersCache
}

export async function saveOrders(orders: Order[]): Promise<void> {
  if (isSupabaseEnabled()) {
    await saveOrdersToSupabase(orders)
    ordersCache = orders
    cacheTimestamp = Date.now()
    cacheInitialized = true
    return
  }

  const filePath = getOrdersPath()
  await writeFile(filePath, JSON.stringify(orders, null, 2), 'utf-8')
  ordersCache = orders
  cacheTimestamp = Date.now()
  cacheInitialized = true
}

export async function createOrder(data: {
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  items: Array<{
    sku: string
    name: string
    productName?: string
    qty: number
    quantity?: number
    price: number
    unitPrice?: number
    total: number
    image?: string
    color?: string
    [key: string]: any
  }>
  addresses?: Array<{
    type?: string
    country: string
    city: string
    address?: string
    line1?: string
    line2?: string
    postal?: string
    pickupPoint?: string
    [key: string]: any
  }>
  total: number
  currency?: string
  note?: string
}): Promise<Order> {
  const orders = await loadOrders()
  
  const id = nanoid()
  const now = new Date().toISOString()
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const number = `RB-${datePrefix}-${id.slice(0, 6).toUpperCase()}`
  
  const order: Order = {
    id,
    number,
    customerName: data.customerName || null,
    customerEmail: data.customerEmail || null,
    customerPhone: data.customerPhone || null,
    items: data.items.map(item => ({
      id: nanoid(),
      ...item,
    })),
    addresses: data.addresses?.map(addr => ({
      id: nanoid(),
      type: addr.type ?? 'shipping',
      ...addr,
      country: addr.country ?? '',
      city: addr.city ?? '',
      line1: addr.address ?? addr.line1 ?? '',
      line2: addr.line2 ?? addr.pickupPoint ?? '',
      postal: addr.postal ?? '',
    })),
    paymentStatus: 'pending',
    fulfillmentStatus: 'unfulfilled',
    orderStatus: 'new',
    total: data.total,
    currency: data.currency || 'RUB',
    note: data.note || null,
    createdAt: now,
    updatedAt: now,
  }
  
  orders.push(order)
  await saveOrders(orders)

  console.log('[Order] Заказ создан:', {
    id: order.id,
    number: order.number,
    customerName: order.customerName,
    total: order.total
  })

  // Отправляем уведомление в Telegram асинхронно (не блокируем создание заказа)
  // Используем setImmediate для отправки в следующем тике event loop
  setImmediate(async () => {
    try {
      console.log('[Order] Начало отправки уведомления в Telegram...')
      const shippingAddress = order.addresses?.find(addr => addr.type === 'shipping') || order.addresses?.[0]
      
      const notificationResult = await sendOrderNotification({
        orderId: order.id,
        orderNumber: order.number,
        customerName: order.customerName || 'Не указано',
        customerPhone: order.customerPhone,
        items: order.items.map(item => ({
          name: item.name,
          qty: item.qty,
          color: (item as any).color || null,
          price: item.price,
          total: item.total,
          image: (item as any).image || null,
        })),
        total: order.total,
        currency: order.currency,
        address: shippingAddress ? {
          country: shippingAddress.country,
          city: shippingAddress.city,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || null,
          postal: shippingAddress.postal,
        } : null,
        note: order.note,
      })
      
      console.log('[Order] Результат отправки в Telegram:', notificationResult ? 'успешно' : 'не удалось')
    } catch (error) {
      // Не блокируем создание заказа, если отправка в Telegram не удалась
      console.error('[Order] Ошибка при отправке уведомления в Telegram:', error)
      if (error instanceof Error) {
        console.error('[Order] Stack trace:', error.stack)
      }
    }
  })

  return order
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await loadOrders()
  return orders.find(o => o.id === id) || null
}

export async function listOrders(options?: {
  status?: string
  limit?: number
  offset?: number
}): Promise<{ results: Order[]; meta: { total: number; limit: number; offset: number } }> {
  let orders = await loadOrders()
  
  if (options?.status) {
    orders = orders.filter(o => o.orderStatus === options.status)
  }
  
  const total = orders.length
  const limit = options?.limit || 100
  const offset = options?.offset || 0
  
  const results = orders.slice(offset, offset + limit)
  
  return {
    results,
    meta: { total, limit, offset },
  }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const orders = await loadOrders()
  const index = orders.findIndex(o => o.id === id)
  
  if (index === -1) {
    return null
  }
  
  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  await saveOrders(orders)
  return orders[index]
}

export async function markNewOrdersAsViewed(): Promise<void> {
  const orders = await loadOrders()
  let changed = false
  
  for (const order of orders) {
    if (order.orderStatus === 'new') {
      order.orderStatus = 'in_progress'
      order.updatedAt = new Date().toISOString()
      changed = true
    }
  }
  
  if (changed) {
    await saveOrders(orders)
  }
}

