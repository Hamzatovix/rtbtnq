#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки работы Telegram уведомлений
 * 
 * Использование:
 *   node scripts/test-telegram.mjs
 * 
 * Требуется наличие переменных окружения:
 *   - TELEGRAM_BOT_TOKEN
 *   - TELEGRAM_CHAT_ID
 */

import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Загружаем переменные окружения из .env.local или .env
const envPath = join(__dirname, '..', '.env.local')
try {
  config({ path: envPath })
  console.log(`✅ Загружен .env.local из ${envPath}`)
} catch (e) {
  config({ path: join(__dirname, '..', '.env') })
  console.log(`✅ Загружен .env`)
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

console.log('\n🔍 Проверка конфигурации:')
console.log(`   TELEGRAM_BOT_TOKEN: ${BOT_TOKEN ? `✅ установлен (${BOT_TOKEN.substring(0, 10)}...)` : '❌ не установлен'}`)
console.log(`   TELEGRAM_CHAT_ID: ${CHAT_ID ? `✅ установлен (${CHAT_ID})` : '❌ не установлен'}`)

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('\n❌ Ошибка: Необходимо установить TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID')
  console.error('\n📝 Инструкции по настройке:')
  console.error('   1. Создайте бота через @BotFather в Telegram')
  console.error('   2. Получите Chat ID через @userinfobot или @RawDataBot')
  console.error('   3. Добавьте переменные в .env.local:')
  console.error('      TELEGRAM_BOT_TOKEN=ваш_токен')
  console.error('      TELEGRAM_CHAT_ID=ваш_chat_id')
  process.exit(1)
}

// Импортируем функцию отправки уведомления
const telegramModule = await import('../src/lib/telegram.ts')
const { sendOrderNotification } = telegramModule

// Создаем тестовые данные заказа
const testOrderData = {
  orderId: 'test-' + Date.now(),
  orderNumber: 'TEST-001',
  customerName: 'Тестовый Клиент',
  customerPhone: '+7 (999) 123-45-67',
  items: [
    {
      name: 'Linen Tote Bag',
      qty: 1,
      color: 'Linen',
      price: 4500,
      total: 4500,
      image: '/images/about-one.png',
    },
    {
      name: 'Minimal Backpack',
      qty: 2,
      color: 'Black',
      price: 6500,
      total: 13000,
      image: '/images/about-m.jpg.png',
    },
  ],
  total: 17500,
  currency: 'RUB',
  address: {
    country: 'Россия',
    city: 'Москва',
    line1: 'ул. Тестовая, д. 1',
    line2: 'кв. 10',
    postal: '123456',
  },
  shippingMethod: 'courier',
  shippingPrice: 500,
  note: 'Это тестовый заказ для проверки Telegram уведомлений',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
}

console.log('\n📤 Отправка тестового уведомления...')
console.log(`   Заказ: ${testOrderData.orderNumber}`)
console.log(`   Клиент: ${testOrderData.customerName}`)
console.log(`   Товаров: ${testOrderData.items.length}`)
console.log(`   Сумма: ${testOrderData.total} ${testOrderData.currency}`)

try {
  const result = await sendOrderNotification(
    testOrderData,
    BOT_TOKEN,
    CHAT_ID
  )

  if (result) {
    console.log('\n✅ Уведомление успешно отправлено!')
    console.log('   Проверьте Telegram - должно прийти сообщение с деталями заказа')
  } else {
    console.log('\n❌ Не удалось отправить уведомление')
    console.log('   Проверьте логи выше для деталей ошибки')
    process.exit(1)
  }
} catch (error) {
  console.error('\n❌ Ошибка при отправке уведомления:')
  console.error(error)
  process.exit(1)
}

