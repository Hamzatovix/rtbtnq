// Service Worker для Web Push уведомлений backoffice (заказы rosebotanique).
// Ничего не кэширует и не перехватывает fetch — единственная задача:
// показывать push-уведомления и обрабатывать клик по ним.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let payload = { title: 'Новый заказ', body: '' }
  if (event.data) {
    try {
      payload = event.data.json()
    } catch {
      payload = { title: 'Новый заказ', body: event.data.text() }
    }
  }

  const title = payload.title || 'Новый заказ'
  const options = {
    body: payload.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    tag: payload.tag || 'rb-order',
    data: { url: payload.url || '/backoffice/orders' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/backoffice/orders'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/backoffice') && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(url)
          }
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
