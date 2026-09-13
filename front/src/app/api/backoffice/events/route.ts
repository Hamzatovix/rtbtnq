import { NextRequest } from 'next/server'
import { orderEvents, NEW_ORDER_EVENT, type NewOrderEventPayload } from '@/server/order-events'

// Стриминг-эндпоинт (Server-Sent Events) — держим соединение открытым и
// пушим событие "новый заказ" всем подключённым вкладкам backoffice в момент
// его создания. Авторизация не проверяется здесь явно: этот путь уже защищён
// общим middleware (src/middleware.ts) — он требует валидный auth-token для
// любого /api/:path*, кроме явно публичных маршрутов, и этого сюда не входит.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HEARTBEAT_INTERVAL_MS = 20000

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  let onNewOrder: ((payload: NewOrderEventPayload) => void) | undefined
  let heartbeat: ReturnType<typeof setInterval> | undefined

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch {
          // controller уже закрыт (клиент отключился) — просто игнорируем
        }
      }

      // Сразу подтверждаем клиенту, что соединение установлено
      send('connected', { ts: Date.now() })

      onNewOrder = (payload) => send('new-order', payload)
      orderEvents.on(NEW_ORDER_EVENT, onNewOrder)

      // Heartbeat нужен, чтобы Nginx/браузер не разрывали "простаивающее"
      // соединение по таймауту, пока заказов долго нет
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          if (heartbeat) clearInterval(heartbeat)
        }
      }, HEARTBEAT_INTERVAL_MS)

      // Если клиент отключился, а cancel() по какой-то причине не вызвался
      // (бывает в некоторых рантаймах) — подчищаем и по сигналу запроса
      req.signal.addEventListener('abort', () => {
        if (onNewOrder) orderEvents.off(NEW_ORDER_EVENT, onNewOrder)
        if (heartbeat) clearInterval(heartbeat)
        try {
          controller.close()
        } catch {
          // уже закрыт — не страшно
        }
      })
    },
    cancel() {
      if (onNewOrder) orderEvents.off(NEW_ORDER_EVENT, onNewOrder)
      if (heartbeat) clearInterval(heartbeat)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Явно просим Nginx не буферизовать ответ — без этого SSE может
      // зависать за прокси, даже если в конфиге не настроено иначе
      'X-Accel-Buffering': 'no',
    },
  })
}
