import { NextRequest, NextResponse } from 'next/server'
import { addSubscription, removeSubscription } from '@/lib/push-subscriptions'

// Защищено общим middleware (см. src/middleware.ts) — как и всё под /api,
// кроме явно публичных маршрутов.

export const dynamic = 'force-dynamic'

export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  if (!publicKey) {
    return NextResponse.json({ error: 'Push не настроен на сервере' }, { status: 501 })
  }
  return NextResponse.json({ publicKey })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return NextResponse.json({ error: 'Некорректная подписка' }, { status: 400 })
    }
    await addSubscription({
      endpoint: body.endpoint,
      keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push] Ошибка сохранения подписки:', error)
    return NextResponse.json({ error: 'Не удалось сохранить подписку' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body?.endpoint) {
      return NextResponse.json({ error: 'endpoint обязателен' }, { status: 400 })
    }
    await removeSubscription(body.endpoint)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push] Ошибка удаления подписки:', error)
    return NextResponse.json({ error: 'Не удалось удалить подписку' }, { status: 500 })
  }
}
