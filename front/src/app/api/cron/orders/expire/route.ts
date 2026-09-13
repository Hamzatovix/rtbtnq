import { NextRequest, NextResponse } from 'next/server'
import { expireStaleOrders } from '@/server/orders/orders-json.service'

// Не защищено JWT-мидлваром (см. src/middleware.ts, isCronRoute) — вызывается
// по расписанию (crontab на сервере), а не из браузера. Вместо этого сверяем
// секрет из заголовка. Без CRON_SECRET на сервере эндпоинт отключён.
export async function POST(req: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET
  if (!configuredSecret) {
    return NextResponse.json({ error: 'CRON_SECRET не настроен на сервере' }, { status: 501 })
  }

  const providedSecret = req.headers.get('x-cron-secret')
  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const hoursThreshold = Number(process.env.ORDER_AUTO_CANCEL_HOURS) || 24
  const cancelled = await expireStaleOrders(hoursThreshold)

  return NextResponse.json({ cancelled, hoursThreshold })
}
