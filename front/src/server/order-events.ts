import { EventEmitter } from 'events'

/**
 * Внутрипроцессная шина событий для live-уведомлений в backoffice.
 *
 * Работает по тому же принципу, что и src/server/prisma.ts — синглтон через
 * globalThis, чтобы пережить hot-reload в dev-режиме и не плодить несколько
 * инстансов EventEmitter в одном процессе.
 *
 * Важно: это решение годится только для одного Node-процесса (текущий деплой —
 * один Docker-контейнер на VPS). Если проект когда-нибудь будет запускаться
 * в нескольких инстансах за балансировщиком, шину нужно будет заменить на
 * что-то межпроцессное (Redis pub/sub и т.п.) — иначе вкладка backoffice,
 * подключённая к другому инстансу, не получит событие.
 */

declare global {
  // eslint-disable-next-line no-var
  var __orderEvents__: EventEmitter | undefined
}

function createEmitter(): EventEmitter {
  const emitter = new EventEmitter()
  // Каждая открытая вкладка backoffice — это один слушатель (SSE-соединение).
  // Дефолтный лимит в 10 слишком мал и будет спамить MaxListenersExceededWarning.
  emitter.setMaxListeners(100)
  return emitter
}

export const orderEvents: EventEmitter = globalThis.__orderEvents__ ?? (globalThis.__orderEvents__ = createEmitter())

export const NEW_ORDER_EVENT = 'new-order'

export interface NewOrderEventPayload {
  id: string
  number: string
  customerName: string | null
  customerPhone: string | null
  total: number
  currency: string
  createdAt: string
}
