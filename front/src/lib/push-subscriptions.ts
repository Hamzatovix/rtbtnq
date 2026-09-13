import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

/**
 * Хранилище Web Push подписок backoffice-устройств (телефон/десктоп),
 * подключённых через кнопку "Включить уведомления". Тот же файловый подход,
 * что и в src/server/orders/orders-json.service.ts — данные лежат в
 * src/data, которая уже примонтирована как volume в docker run, поэтому
 * подписки переживают передеплой.
 */

export interface PushSubscriptionRecord {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: string
}

const DATA_DIR = join(process.cwd(), 'src', 'data')
const FILE_PATH = join(DATA_DIR, 'push-subscriptions.json')

async function ensureFile(): Promise<void> {
  try {
    await readFile(FILE_PATH, 'utf-8')
  } catch {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(FILE_PATH, JSON.stringify([], null, 2), 'utf-8')
  }
}

export async function loadSubscriptions(): Promise<PushSubscriptionRecord[]> {
  await ensureFile()
  const raw = await readFile(FILE_PATH, 'utf-8')
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function saveSubscriptions(subs: PushSubscriptionRecord[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(FILE_PATH, JSON.stringify(subs, null, 2), 'utf-8')
}

export async function addSubscription(sub: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}): Promise<void> {
  const subs = await loadSubscriptions()
  if (subs.some((s) => s.endpoint === sub.endpoint)) return
  subs.push({ ...sub, createdAt: new Date().toISOString() })
  await saveSubscriptions(subs)
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const subs = await loadSubscriptions()
  await saveSubscriptions(subs.filter((s) => s.endpoint !== endpoint))
}

export async function removeSubscriptions(endpoints: string[]): Promise<void> {
  if (endpoints.length === 0) return
  const subs = await loadSubscriptions()
  await saveSubscriptions(subs.filter((s) => !endpoints.includes(s.endpoint)))
}
