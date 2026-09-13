import webpush from 'web-push'

/**
 * Обёртка над web-push. Настраивается лениво при первом вызове, чтобы не
 * падать при импорте модуля, если VAPID-ключи ещё не заданы на сервере
 * (тогда пуш просто тихо не отправляется — Telegram и SSE остаются рабочими
 * каналами).
 */

let configured = false

export function isPushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

function ensureConfigured(): void {
  if (configured) return
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@rosebotanique.store'

  if (!publicKey || !privateKey) {
    throw new Error('VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY не заданы в окружении')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

/**
 * Рассылает push-уведомление всем сохранённым подпискам (все устройства,
 * на которых кто-то из backoffice нажал "Включить уведомления"). Мёртвые
 * подписки (404/410 — юзер отписался, удалил PWA и т.п.) удаляются сами.
 */
export async function sendPushToAll(payload: PushPayload): Promise<void> {
  if (!isPushConfigured()) return
  ensureConfigured()

  const { loadSubscriptions, removeSubscriptions } = await import('./push-subscriptions')
  const subscriptions = await loadSubscriptions()
  if (subscriptions.length === 0) return

  const body = JSON.stringify(payload)
  const deadEndpoints: string[] = []

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, body)
      } catch (error: any) {
        const statusCode = error?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Подписка больше не действительна — устройство отписалось/убрало PWA
          deadEndpoints.push(sub.endpoint)
        } else {
          console.error('[WebPush] Ошибка отправки:', {
            statusCode,
            body: error?.body,
            message: error?.message,
          })
        }
      }
    })
  )

  if (deadEndpoints.length > 0) {
    await removeSubscriptions(deadEndpoints)
  }
}
