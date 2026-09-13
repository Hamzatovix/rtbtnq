'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'
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
 * Если браузер ещё не разрешил звук на странице (autoplay policy), просто
 * молча ничего не проигрываем — сотрудник backoffice уже точно взаимодействовал
 * со страницей (залогинился), так что на практике это почти всегда работает.
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
    // звук — это приятное дополнение, а не критичная часть уведомления
  }
}

function notifyBrowser(payload: NewOrderPayload) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  try {
    const n = new Notification('Новый заказ ' + payload.number, {
      body: `${payload.customerName || 'Без имени'} — ${formatMoney(payload.total, payload.currency)}`,
      tag: `order-${payload.id}`,
      silent: true, // звук уже играем сами через playChime()
    })
    n.onclick = () => {
      window.focus()
      window.location.href = '/backoffice/orders'
      n.close()
    }
  } catch {
    // некоторые браузеры/ОС могут кидать ошибку на createNotification — не критично
  }
}

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

/**
 * Слушает поток /api/backoffice/events (SSE) и на событие "новый заказ":
 *  - проигрывает звук,
 *  - показывает системное уведомление браузера (если разрешено),
 *  - показывает toast внутри backoffice,
 *  - рассылает window-событие 'rb:new-order', чтобы страницы (например,
 *    список заказов) могли сами обновить данные без перезагрузки.
 *
 * Также рендерит маленькую кнопку в шапке для включения/статуса уведомлений.
 */
export function OrderNotifications() {
  const [permission, setPermission] = useState<PermissionState>('default')
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as PermissionState)
  }, [])

  const handleNewOrder = useCallback((payload: NewOrderPayload) => {
    playChime()
    notifyBrowser(payload)
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
      // Ошибка транзитная (переподключение браузер делает сам) — просто логируем
      console.warn('[OrderNotifications] SSE-соединение прервано, браузер переподключится автоматически')
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [handleNewOrder])

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    try {
      const result = await Notification.requestPermission()
      setPermission(result as PermissionState)
    } catch {
      // пользователь мог закрыть системный диалог — не критично
    }
  }

  if (permission === 'unsupported') return null

  if (permission === 'granted') {
    return (
      <span
        className="hidden sm:inline-flex h-9 w-9 items-center justify-center text-accent"
        title="Уведомления о новых заказах включены"
      >
        <BellRing className="h-4 w-4" />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={requestPermission}
      title={
        permission === 'denied'
          ? 'Уведомления заблокированы в настройках браузера'
          : 'Включить уведомления о новых заказах'
      }
      className={cn(
        'hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-sm transition-fintage',
        permission === 'denied'
          ? 'text-fintage-graphite/40 dark:text-fintage-graphite/50 cursor-not-allowed'
          : 'text-fintage-charcoal/70 dark:text-fintage-offwhite/70 hover:bg-hover-bg dark:hover:bg-hover-bg hover:text-accent dark:hover:text-accent'
      )}
      aria-label="Включить уведомления о новых заказах"
    >
      {permission === 'denied' ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  )
}
