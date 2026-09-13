'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface NewOrderPayload {
  id: string
  number: string
  customerName: string | null
  customerPhone: string | null
  total: number
  currency: string
  createdAt: string
}

const currencyFormatters: Record<string, Intl.NumberFormat> = {}

function formatMoney(total: number, currency: string) {
  const key = currency || 'RUB'
  if (!currencyFormatters[key]) {
    currencyFormatters[key] = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: key,
      maximumFractionDigits: 0,
    })
  }
  return currencyFormatters[key].format(total)
}

/**
 * Короткий двухтональный сигнал через Web Audio API — без внешнего аудиофайла.
 * Используется только пока вкладка backoffice реально открыта (сигнал от SSE).
 * За системные уведомления (в т.ч. когда вкладка/приложение закрыты) отвечает
 * Web Push + Service Worker, см. requestPushSubscription() ниже и public/sw.js.
 */
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx: AudioContext = new AudioContextClass()

    const playTone = (freq: number, startAt: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + startAt)
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + startAt + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + startAt)
      osc.stop(ctx.currentTime + startAt + duration + 0.05)
    }

    playTone(880, 0, 0.16)
    playTone(1320, 0.14, 0.22)

    setTimeout(() => ctx.close().catch(() => {}), 600)
  } catch {
    // звук — приятное дополнение, а не критичная часть уведомления
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

type PushState =
  | 'unsupported' // браузер не умеет Push API / Service Worker
  | 'idle' // ещё не подписан, кнопка доступна
  | 'subscribing' // идёт процесс подписки
  | 'subscribed' // всё готово, пуши приходят
  | 'denied' // пользователь/браузер запретил уведомления

async function requestPushSubscription(): Promise<{ ok: boolean; reason?: string }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' }
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const keyRes = await fetch('/api/backoffice/push', { credentials: 'include' })
  if (!keyRes.ok) {
    return { ok: false, reason: 'no-server-key' }
  }
  const { publicKey } = await keyRes.json()

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Типы lib.dom для BufferSource и Uint8Array иногда расходятся между
      // версиями TS/@types — привести к BufferSource безопасно, это то, что
      // PushManager.subscribe() ожидает по спецификации.
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    })
  }

  await fetch('/api/backoffice/push', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription.toJSON()),
  })

  return { ok: true }
}

/**
 * Слушает поток /api/backoffice/events (SSE) и на событие "новый заказ":
 *  - проигрывает звук и показывает toast (пока вкладка открыта),
 *  - обновляет список заказов через window-событие 'rb:new-order'.
 *
 * Отдельно управляет подпиской на Web Push (кнопка-колокольчик в шапке) —
 * это то, что реально доставит уведомление на телефон, даже если backoffice
 * не открыт: сервер сам шлёт push при создании заказа (см. sendPushToAll в
 * src/server/orders/orders-json.service.ts), а показывает его Service Worker
 * (public/sw.js), не эта страница.
 */
export function OrderNotifications() {
  const [pushState, setPushState] = useState<PushState>('idle')
  const esRef = useRef<EventSource | null>(null)

  // Определяем текущее состояние подписки при монтировании
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        if (!cancelled) setPushState('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        if (!cancelled) setPushState('denied')
        return
      }
      try {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js')
        const existing = await registration?.pushManager.getSubscription()
        if (!cancelled) setPushState(existing ? 'subscribed' : 'idle')
      } catch {
        if (!cancelled) setPushState('idle')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleNewOrder = useCallback((payload: NewOrderPayload) => {
    playChime()
    toast.default(
      `Новый заказ ${payload.number}`,
      `${payload.customerName || 'Без имени'} — ${formatMoney(payload.total, payload.currency)}`
    )
    window.dispatchEvent(new CustomEvent('rb:new-order', { detail: payload }))
  }, [])

  useEffect(() => {
    // EventSource поддерживает только GET и сам переподключается при разрыве —
    // ручная retry-логика не нужна
    const es = new EventSource('/api/backoffice/events')
    esRef.current = es

    es.addEventListener('new-order', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as NewOrderPayload
        handleNewOrder(payload)
      } catch (err) {
        console.error('[OrderNotifications] Не удалось разобрать событие new-order:', err)
      }
    })

    es.onerror = () => {
      console.warn('[OrderNotifications] SSE-соединение прервано, браузер переподключится автоматически')
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [handleNewOrder])

  const enablePush = async () => {
    setPushState('subscribing')
    try {
      const result = await requestPushSubscription()
      if (result.ok) {
        setPushState('subscribed')
        toast.success('Уведомления включены', 'Теперь заказы будут приходить даже на телефон')
      } else if (Notification.permission === 'denied') {
        setPushState('denied')
      } else {
        setPushState('idle')
        toast.error('Не получилось включить уведомления', 'Попробуйте ещё раз чуть позже')
      }
    } catch (error) {
      console.error('[OrderNotifications] Ошибка подписки на push:', error)
      setPushState(Notification.permission === 'denied' ? 'denied' : 'idle')
      toast.error('Не получилось включить уведомления', 'Попробуйте ещё раз чуть позже')
    }
  }

  if (pushState === 'unsupported') return null

  if (pushState === 'subscribed') {
    return (
      <span
        className="hidden sm:inline-flex h-9 w-9 items-center justify-center text-accent"
        title="Уведомления о новых заказах включены (в т.ч. на этом устройстве)"
      >
        <BellRing className="h-4 w-4" />
      </span>
    )
  }

  if (pushState === 'subscribing') {
    return (
      <span className="hidden sm:inline-flex h-9 w-9 items-center justify-center text-fintage-charcoal/50 dark:text-fintage-offwhite/50">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={enablePush}
      disabled={pushState === 'denied'}
      title={
        pushState === 'denied'
          ? 'Уведомления заблокированы в настройках браузера'
          : 'Включить уведомления о новых заказах (в т.ч. на телефоне)'
      }
      className={cn(
        'hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-sm transition-fintage',
        pushState === 'denied'
          ? 'text-fintage-graphite/40 dark:text-fintage-graphite/50 cursor-not-allowed'
          : 'text-fintage-charcoal/70 dark:text-fintage-offwhite/70 hover:bg-hover-bg dark:hover:bg-hover-bg hover:text-accent dark:hover:text-accent'
      )}
      aria-label="Включить уведомления о новых заказах"
    >
      {pushState === 'denied' ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  )
}
