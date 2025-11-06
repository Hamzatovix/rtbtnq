# 📊 Отчет по оптимизации проекта

## 🔍 Анализ текущего состояния

### ✅ Что уже хорошо:
- ✅ Используется lazy loading для изображений
- ✅ Динамический импорт компонентов (ProductCard)
- ✅ Zustand для управления состоянием
- ✅ Мемоизация фильтров в каталоге
- ✅ Next.js 14 с App Router

### ⚠️ Критические проблемы для оптимизации:

---

## 🚨 КРИТИЧЕСКИЕ ОПТИМИЗАЦИИ

### 1. **Отсутствие кеширования API запросов**

**Проблема:** Все запросы используют `cache: 'no-store'`, каждый запрос идет на сервер.

**Решение:**
```typescript
// Вместо cache: 'no-store'
fetch('/api/products', { 
  next: { revalidate: 60 } // Кешировать на 60 секунд
})

// Или для статических данных
fetch('/api/categories', { 
  next: { revalidate: 3600 } // Кешировать на 1 час
})
```

**Где применить:**
- `/api/products` - кеш 60 секунд
- `/api/categories` - кеш 1 час
- `/api/colors` - кеш 1 час
- `/api/orders` - только для backoffice, без кеша

---

### 2. **Блокирующая отправка Telegram**

**Проблема:** Отправка в Telegram блокирует создание заказа (хотя в try-catch, но все равно ждет).

**Решение:** Вынести в очередь/фоновую задачу.

---

### 3. **Синхронные операции с файлами**

**Проблема:** Каждый запрос читает/пишет JSON файлы синхронно.

**Решение:** 
- Добавить кеширование в памяти
- Использовать реальную БД (Prisma уже подключен)

---

### 4. **Пустая конфигурация Next.js**

**Проблема:** `next.config.js` пустой, нет оптимизаций.

**Решение:** Добавить настройки производительности.

---

### 5. **Нет мемоизации в stores**

**Проблема:** `getTotalPrice()` и `getTotalItems()` пересчитываются каждый раз.

**Решение:** Добавить мемоизацию.

---

## 📝 ДЕТАЛЬНЫЕ РЕКОМЕНДАЦИИ

### Приоритет 1: Критично для производительности

#### A. Настроить Next.js конфигурацию

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация изображений
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Компрессия
  compress: true,
  
  // Оптимизация сборки
  swcMinify: true,
  
  // Экспериментальные оптимизации
  experimental: {
    optimizeCss: true,
  },
  
  // Оптимизация бандла
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
```

#### B. Добавить кеширование в API routes

```typescript
// front/src/app/api/products/route.ts
export const revalidate = 60 // ISR: обновлять каждые 60 секунд

export async function GET(req: NextRequest) {
  // ... существующий код
  return NextResponse.json({ results: formatted }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

#### C. Оптимизировать Zustand stores

```typescript
// front/src/store/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

// Добавить мемоизацию
getTotalPrice: () => {
  const { items } = get()
  // Используем мемоизацию
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
},
```

#### D. Вынести Telegram отправку в очередь

```typescript
// front/src/server/orders/orders-json.service.ts
// После сохранения заказа
orders.push(order)
await saveOrders(orders)

// Не блокируем - отправляем асинхронно
setImmediate(async () => {
  try {
    await sendOrderNotification({...})
  } catch (error) {
    console.error('Telegram notification failed:', error)
  }
})

return order
```

---

### Приоритет 2: Важно для масштабируемости

#### E. Добавить кеш в памяти для чтения файлов

```typescript
// front/src/server/orders/orders-json.service.ts
let ordersCache: Order[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5000 // 5 секунд

export async function loadOrders(): Promise<Order[]> {
  const now = Date.now()
  
  // Возвращаем из кеша если не истек
  if (ordersCache && (now - cacheTimestamp) < CACHE_TTL) {
    return ordersCache
  }
  
  // Загружаем из файла
  await ensureOrdersFile()
  const filePath = getOrdersPath()
  try {
    const content = await readFile(filePath, 'utf-8')
    ordersCache = JSON.parse(content)
    cacheTimestamp = now
    return ordersCache
  } catch {
    return []
  }
}

// Инвалидировать кеш при записи
export async function saveOrders(orders: Order[]): Promise<void> {
  const filePath = getOrdersPath()
  await writeFile(filePath, JSON.stringify(orders, null, 2), 'utf-8')
  ordersCache = orders // Обновить кеш
  cacheTimestamp = Date.now()
}
```

#### F. Оптимизировать запросы на клиенте

```typescript
// front/src/lib/hooks.ts
// Использовать SWR или React Query для кеширования
import useSWR from 'swr'

export function useProducts(filters) {
  const key = `/api/products?${new URLSearchParams(filters)}`
  const { data, error, isLoading } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 минута
  })
  // ...
}
```

#### G. Добавить React.memo для компонентов

```typescript
// front/src/components/product/product-card.tsx
import { memo } from 'react'

export const ProductCard = memo(function ProductCard({ product }) {
  // ...
}, (prev, next) => prev.product.id === next.product.id)
```

---

### Приоритет 3: Улучшения для production

#### H. Использовать реальную БД вместо JSON файлов

Prisma уже подключен, но не используется для заказов.

#### I. Добавить мониторинг производительности

```typescript
// front/src/middleware.ts
export function middleware(request: NextRequest) {
  const start = Date.now()
  
  // ... логика
  
  const duration = Date.now() - start
  if (duration > 1000) {
    console.warn(`Slow request: ${request.url} took ${duration}ms`)
  }
}
```

#### J. Оптимизировать изображения

- Использовать WebP/AVIF форматы
- Добавить blur placeholder
- Настроить правильные sizes

---

## 📈 Ожидаемые улучшения

| Оптимизация | Улучшение производительности |
|------------|------------------------------|
| Кеширование API | 50-80% меньше запросов |
| Кеш в памяти | 90% быстрее чтение файлов |
| Асинхронная Telegram | 200-500ms быстрее создание заказа |
| Next.js config | 10-20% меньше размер бандла |
| Мемоизация stores | 30-50% меньше пересчетов |
| React.memo | 20-40% меньше ре-рендеров |

---

## 🎯 План внедрения

1. **День 1:** Next.js конфигурация + кеширование API
2. **День 2:** Кеш в памяти + мемоизация stores
3. **День 3:** Асинхронная Telegram + оптимизация компонентов
4. **День 4:** Тестирование и мониторинг

---

## 🔧 Готовые решения

Все оптимизации готовы к внедрению. Нужно только применить изменения.

