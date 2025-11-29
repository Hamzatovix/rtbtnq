/**
 * Утилиты для отправки уведомлений в Telegram
 */

interface TelegramMessageOptions {
  text: string
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  replyMarkup?: {
    inline_keyboard: Array<Array<{
      text: string
      url?: string
      callback_data?: string
    }>>
  }
}

/**
 * Отправляет фото в Telegram через Bot API
 * Пытается сначала отправить по URL, если не получается - загружает в буфер и отправляет как файл
 */
export async function sendTelegramPhoto(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption?: string
): Promise<boolean> {
  // Сначала пробуем отправить по URL
  const urlResult = await sendTelegramPhotoByUrl(botToken, chatId, photoUrl, caption)
  if (urlResult) {
    return true
  }
  
  // Если не получилось, пробуем загрузить в буфер и отправить как файл
  console.log('[Telegram] Попытка отправить фото через загрузку в буфер...')
  return await sendTelegramPhotoByFile(botToken, chatId, photoUrl, caption)
}

/**
 * Отправляет фото в Telegram по URL
 */
async function sendTelegramPhotoByUrl(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption?: string
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
    
    const payload = {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption || undefined,
      parse_mode: undefined,
    }
    
    console.log('[Telegram] Отправка фото:', {
      url: url.replace(botToken, 'TOKEN_HIDDEN'),
      chatId,
      photoUrl: photoUrl.substring(0, 50) + '...'
    })
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('[Telegram] Таймаут запроса отправки фото (30s)')
      controller.abort()
    }, 30000) // 30 секунд таймаут
    
    const startTime = Date.now()
    console.log('[Telegram] Начало fetch запроса отправки фото...', { timestamp: new Date().toISOString() })
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      const elapsed = Date.now() - startTime
      clearTimeout(timeoutId)
      console.log('[Telegram] Fetch запрос завершен, статус:', response.status, { elapsed: `${elapsed}ms`, timestamp: new Date().toISOString() })
    } catch (fetchError: any) {
      const elapsed = Date.now() - startTime
      clearTimeout(timeoutId)
      
      if (fetchError?.name === 'AbortError' || controller.signal.aborted) {
        console.error('[Telegram] Запрос прерван (таймаут):', { elapsed: `${elapsed}ms`, timestamp: new Date().toISOString() })
        const timeoutError = new Error('Telegram request timeout after 30s')
        // @ts-ignore
        timeoutError.status = 504
        throw timeoutError
      }
      
      if (fetchError?.code === 'UND_ERR_SOCKET') {
        console.error('[Telegram] Соединение закрыто сервером:', {
          elapsed: `${elapsed}ms`,
          timestamp: new Date().toISOString(),
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const socketError = new Error(`Telegram connection closed: ${fetchError.message}`)
        // @ts-ignore
        socketError.status = 503
        throw socketError
      }
      
      console.error('[Telegram] Fetch запрос завершился с ошибкой:', {
        elapsed: `${elapsed}ms`,
        timestamp: new Date().toISOString(),
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
      })
      throw fetchError
    }

    console.log('[Telegram] Чтение ответа от Telegram API...')
    const responseText = await response.text()
    console.log('[Telegram] Ответ получен, длина:', responseText.length)
    let responseData: any
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { ok: false, description: `Failed to parse response: ${responseText.substring(0, 200)}` }
    }

    if (!response.ok || !responseData.ok) {
      console.error('[Telegram] API error при отправке фото:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        responseText: responseText.substring(0, 500)
      })
      return false
    }

    console.log('[Telegram] Фото успешно отправлено:', {
      messageId: responseData.result?.message_id,
      chatId: responseData.result?.chat?.id
    })
    return true
  } catch (error) {
    console.error('[Telegram] Failed to send Telegram photo:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[Telegram] Request timeout (30s) при отправке фото')
      }
      console.error('[Telegram] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return false
  }
}

/**
 * Отправляет фото в Telegram, загружая его в буфер и отправляя как файл
 */
async function sendTelegramPhotoByFile(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption?: string
): Promise<boolean> {
  try {
    console.log('[Telegram] Загрузка изображения в буфер...', { photoUrl: photoUrl.substring(0, 100) + '...' })
    
    // Загружаем изображение в буфер
    const imageResponse = await fetch(photoUrl, { signal: AbortSignal.timeout(10000) })
    if (!imageResponse.ok) {
      console.error('[Telegram] Не удалось загрузить изображение:', { status: imageResponse.status })
      return false
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const blob = new Blob([imageBuffer], { type: imageResponse.headers.get('content-type') || 'image/jpeg' })
    
    console.log('[Telegram] Изображение загружено, размер:', blob.size, 'bytes')
    
    // Формируем FormData для отправки файла
    const formData = new FormData()
    formData.append('chat_id', chatId)
    formData.append('photo', blob, 'photo.jpg')
    if (caption) {
      formData.append('caption', caption)
    }
    
    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
    console.log('[Telegram] Отправка фото как файла...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('[Telegram] Таймаут запроса отправки фото как файла (30s)')
      controller.abort()
    }, 30000)
    
    const startTime = Date.now()
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })
      const elapsed = Date.now() - startTime
      clearTimeout(timeoutId)
      console.log('[Telegram] Fetch запрос завершен, статус:', response.status, { elapsed: `${elapsed}ms` })
    } catch (fetchError: any) {
      const elapsed = Date.now() - startTime
      clearTimeout(timeoutId)
      
      if (fetchError?.name === 'AbortError' || controller.signal.aborted) {
        console.error('[Telegram] Запрос прерван (таймаут при отправке фото как файла):', { elapsed: `${elapsed}ms` })
        const timeoutError = new Error('Telegram request timeout after 30s')
        // @ts-ignore
        timeoutError.status = 504
        throw timeoutError
      }
      
      if (fetchError?.code === 'UND_ERR_SOCKET') {
        console.error('[Telegram] Соединение закрыто сервером при отправке фото как файла:', {
          elapsed: `${elapsed}ms`,
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const socketError = new Error(`Telegram connection closed: ${fetchError.message}`)
        // @ts-ignore
        socketError.status = 503
        throw socketError
      }
      
      console.error('[Telegram] Fetch запрос завершился с ошибкой:', {
        elapsed: `${elapsed}ms`,
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
      })
      throw fetchError
    }
    
    const responseText = await response.text()
    console.log('[Telegram] Ответ получен, длина:', responseText.length)
    
    let responseData: any
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { ok: false, description: `Failed to parse response: ${responseText.substring(0, 200)}` }
    }
    
    if (!response.ok || !responseData.ok) {
      console.error('[Telegram] API error при отправке фото как файла:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        responseText: responseText.substring(0, 500)
      })
      return false
    }
    
    console.log('[Telegram] Фото успешно отправлено как файл:', {
      messageId: responseData.result?.message_id,
      chatId: responseData.result?.chat?.id
    })
    return true
  } catch (error) {
    console.error('[Telegram] Failed to send Telegram photo as file:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[Telegram] Request timeout (30s) при отправке фото как файла')
      }
      console.error('[Telegram] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return false
  }
}

/**
 * Отправляет медиа-группу (несколько фото) в Telegram
 */
export async function sendTelegramMediaGroup(
  botToken: string,
  chatId: string,
  media: Array<{ type: 'photo'; media: string; caption?: string }>
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMediaGroup`
    
    const payload = {
      chat_id: chatId,
      media: media,
    }
    
    console.log('[Telegram] Отправка медиа-группы:', {
      url: url.replace(botToken, 'TOKEN_HIDDEN'),
      chatId,
      mediaCount: media.length
    })
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('[Telegram] Таймаут запроса отправки медиа-группы (30s)')
      controller.abort()
    }, 30000) // 30 секунд таймаут
    
    console.log('[Telegram] Начало fetch запроса отправки медиа-группы...')
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      console.log('[Telegram] Fetch запрос завершен, статус:', response.status)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError?.name === 'AbortError' || controller.signal.aborted) {
        console.error('[Telegram] Запрос прерван (таймаут при отправке медиа-группы)')
        const timeoutError = new Error('Telegram request timeout after 30s')
        // @ts-ignore
        timeoutError.status = 504
        throw timeoutError
      }
      
      if (fetchError?.code === 'UND_ERR_SOCKET') {
        console.error('[Telegram] Соединение закрыто сервером при отправке медиа-группы:', {
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const socketError = new Error(`Telegram connection closed: ${fetchError.message}`)
        // @ts-ignore
        socketError.status = 503
        throw socketError
      }
      
      console.error('[Telegram] Ошибка fetch при отправке медиа-группы:', {
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
      })
      throw fetchError
    }

    console.log('[Telegram] Чтение ответа от Telegram API...')
    const responseText = await response.text()
    console.log('[Telegram] Ответ получен, длина:', responseText.length)
    let responseData: any
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { ok: false, description: `Failed to parse response: ${responseText.substring(0, 200)}` }
    }

    if (!response.ok || !responseData.ok) {
      console.error('[Telegram] API error при отправке медиа-группы:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        responseText: responseText.substring(0, 500)
      })
      return false
    }

    console.log('[Telegram] Медиа-группа успешно отправлена:', {
      messageIds: responseData.result?.map((r: any) => r.message_id),
      chatId: responseData.result?.[0]?.chat?.id
    })
    return true
  } catch (error) {
    console.error('[Telegram] Failed to send Telegram media group:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[Telegram] Request timeout (30s) при отправке медиа-группы')
      }
      console.error('[Telegram] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return false
  }
}

/**
 * Отправляет сообщение в Telegram через Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  options: TelegramMessageOptions
): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    
    const payload = {
      chat_id: chatId,
      text: options.text,
      parse_mode: options.parseMode || undefined,
      reply_markup: options.replyMarkup,
      disable_web_page_preview: true,
    }
    
    console.log('[Telegram] Отправка запроса к API:', {
      url: url.replace(botToken, 'TOKEN_HIDDEN'),
      chatId,
      textLength: options.text.length
    })
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('[Telegram] Таймаут запроса отправки сообщения (30s)')
      controller.abort()
    }, 30000) // 30 секунд таймаут
    
    console.log('[Telegram] Начало fetch запроса отправки сообщения...')
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      console.log('[Telegram] Fetch запрос завершен, статус:', response.status)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError?.name === 'AbortError' || controller.signal.aborted) {
        console.error('[Telegram] Запрос прерван (таймаут при отправке сообщения)')
        const timeoutError = new Error('Telegram request timeout after 30s')
        // @ts-ignore
        timeoutError.status = 504
        throw timeoutError
      }
      
      if (fetchError?.code === 'UND_ERR_SOCKET') {
        console.error('[Telegram] Соединение закрыто сервером при отправке сообщения:', {
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const socketError = new Error(`Telegram connection closed: ${fetchError.message}`)
        // @ts-ignore
        socketError.status = 503
        throw socketError
      }
      
      console.error('[Telegram] Ошибка fetch при отправке сообщения:', {
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
      })
      throw fetchError
    }

    console.log('[Telegram] Чтение ответа от Telegram API...')
    const responseText = await response.text()
    console.log('[Telegram] Ответ получен, длина:', responseText.length)
    let responseData: any
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { ok: false, description: `Failed to parse response: ${responseText.substring(0, 200)}` }
    }

    if (!response.ok || !responseData.ok) {
      console.error('[Telegram] API error при отправке сообщения:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        responseText: responseText.substring(0, 500)
      })
      return false
    }

    console.log('[Telegram] Сообщение успешно отправлено в Telegram:', {
      messageId: responseData.result?.message_id,
      chatId: responseData.result?.chat?.id
    })
    return true
  } catch (error) {
    console.error('[Telegram] Failed to send Telegram message:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[Telegram] Request timeout (30s) при отправке сообщения')
      }
      console.error('[Telegram] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return false
  }
}

interface OrderNotificationData {
  orderId: string
  orderNumber: string
  customerName: string
  customerPhone?: string | null
  items: Array<{
    name: string
    qty: number
    color?: string | null
    price: number
    total: number
    image?: string | null
  }>
  total: number
  currency: string
  address?: {
    country: string
    city: string
    line1: string
    line2?: string | null
    postal?: string
  } | null
  shippingMethod?: string | null
  shippingPrice?: number | null
  note?: string | null
  baseUrl?: string
}

/**
 * Форматирует сообщение о новом заказе для Telegram
 */
// Маппинг способов доставки для отображения
const shippingMethodNames: Record<string, { ru: string; en: string }> = {
  ozon: { ru: 'Ozon доставка', en: 'Ozon delivery' },
  courier: { ru: 'Доставка курьером (г. Грозный)', en: 'Courier delivery (Grozny)' },
  russianPost: { ru: 'Почта России', en: 'Russian Post' },
  cdek: { ru: 'СДЭК', en: 'CDEK' },
  international: { ru: 'Международная доставка', en: 'International delivery' },
}

export function formatOrderNotification(data: OrderNotificationData): string {
  const { orderNumber, customerName, customerPhone, items, total, currency, address, shippingMethod, shippingPrice, note } = data

  // Форматируем список товаров
  const itemsText = items
    .map(item => {
      const colorText = item.color ? ` — ${item.color}` : ''
      const priceText = formatPrice(item.total, currency)
      return `  • ${item.name}${colorText} (x${item.qty}) — ${priceText}`
    })
    .join('\n')

  // Форматируем адрес доставки
  let addressText = ''
  if (address) {
    const addressParts = [
      address.country,
      address.city,
      address.line1,
      address.line2,
      address.postal,
    ].filter(Boolean)
    addressText = addressParts.join(', ')
  }

  // Форматируем способ доставки
  let shippingText = ''
  if (shippingMethod) {
    const methodName = shippingMethodNames[shippingMethod]?.ru || shippingMethod
    shippingText = methodName
    if (shippingPrice !== null && shippingPrice !== undefined) {
      shippingText += ` — ${formatPrice(shippingPrice, currency)}`
    }
  }

  // Форматируем телефон
  const phoneText = customerPhone ? formatPhone(customerPhone) : '—'

  // Собираем сообщение с улучшенным форматированием
  let message = `🛍️ *Новый заказ!*\n\n`
  message += `📦 *Номер заказа:* ${orderNumber}\n`
  message += `👤 *Клиент:* ${customerName}\n`
  message += `📞 *Телефон:* ${phoneText}\n\n`
  
  message += `🛒 *Товары:*\n${itemsText}\n\n`
  message += `💰 *Итого:* ${formatPrice(total, currency)}\n`

  if (shippingText) {
    message += `\n🚚 *Способ доставки:*\n${shippingText}\n`
  }

  if (addressText) {
    message += `\n📍 *Адрес:*\n${addressText}\n`
  }

  if (note) {
    message += `\n💬 *Комментарий:*\n${note}`
  }

  return message
}

/**
 * Форматирует цену с валютой
 */
function formatPrice(amount: number, currency: string): string {
  const formatted = Math.floor(amount).toLocaleString('ru-RU')
  return `${formatted} ₽`
}

/**
 * Форматирует телефон для отображения
 */
function formatPhone(phone: string): string {
  // Убираем все нецифровые символы
  const digits = phone.replace(/\D/g, '')
  
  // Форматируем российский номер
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  
  // Если не подходит под формат, возвращаем как есть
  return phone
}

/**
 * Отправляет уведомление о новом заказе в Telegram
 */
export async function sendOrderNotification(
  data: OrderNotificationData,
  botToken?: string,
  chatId?: string
): Promise<boolean> {
  // Проверяем наличие токена и chat_id
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN
  const chat = chatId || process.env.TELEGRAM_CHAT_ID

  console.log('[Telegram] Проверка конфигурации:', {
    hasToken: !!token,
    hasChatId: !!chat,
    chatId: chat,
    tokenPreview: token ? `${token.substring(0, 10)}...` : 'не установлен'
  })

  if (!token || !chat) {
    console.warn('[Telegram] Telegram bot token or chat ID not configured', {
      token: token ? 'установлен' : 'не установлен',
      chatId: chat ? 'установлен' : 'не установлен'
    })
    return false
  }

  // Форматируем сообщение
  const message = formatOrderNotification(data)

  // Определяем базовый URL: используем data.baseUrl, валидный NEXT_PUBLIC_BASE_URL или VERCEL_URL
  const resolveBaseUrl = () => {
    if (data.baseUrl) return data.baseUrl

    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const isEnvBaseUrlValid =
      envBaseUrl && !envBaseUrl.includes('localhost') && !envBaseUrl.includes('127.0.0.1')
    if (isEnvBaseUrlValid) return envBaseUrl

    const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
    if (vercelUrl) {
      const normalized = vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`
      return normalized
    }

    return 'http://localhost:3000'
  }

  const baseUrl = resolveBaseUrl()
  const orderUrl = `${baseUrl}/backoffice/orders/${data.orderId}`

  // Проверяем, можно ли использовать URL для кнопки
  // Telegram не принимает localhost URLs в inline кнопках
  const isValidUrl = !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')
  
  console.log('[Telegram] Отправка уведомления о заказе:', {
    orderNumber: data.orderNumber,
    orderUrl,
    isValidUrl
  })
  
  // Отправляем фото товаров, если они есть
  // Важно: для localhost изображения не отправляем, так как Telegram не может получить к ним доступ
  const itemsWithImages = data.items.filter(item => item.image)
  const canSendImages = !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')
  
  let captionFallback: string | undefined

  if (itemsWithImages.length > 0 && canSendImages) {
    console.log('[Telegram] Найдено товаров с изображениями:', itemsWithImages.length)
    
    // Формируем полные URL для изображений
    const mediaItems = itemsWithImages.slice(0, 10).map((item, index) => {
      let imageUrl = item.image!
      // Если путь относительный, добавляем базовый URL
      if (imageUrl.startsWith('/')) {
        imageUrl = `${baseUrl}${imageUrl}`
      }
      
      // Формируем подпись для каждого товара
      const colorText = item.color ? ` - ${item.color}` : ''
      const priceText = formatPrice(item.total, data.currency)
      const caption = `${item.name}${colorText} (x${item.qty}) - ${priceText}`
      
      return {
        type: 'photo' as const,
        media: imageUrl,
        caption: caption.length > 1024 ? caption.substring(0, 1021) + '...' : caption, // Telegram limit
      }
    })
    
    // Добавляем текст заказа в подпись к первой карточке (с ограничением 1024 символа)
    captionFallback = message.length > 1024 ? `${message.substring(0, 1021)}...` : message
    if (mediaItems.length > 0) {
      const firstCaption = mediaItems[0].caption ? `${mediaItems[0].caption}\n\n` : ''
      mediaItems[0].caption = `${firstCaption}${captionFallback}`
    }
    
    // Отправляем медиа-группу (если несколько товаров) или одно фото
    let photoSent = false
    if (mediaItems.length === 1) {
      console.log('[Telegram] Попытка отправить одно фото:', {
        photoUrl: mediaItems[0].media.substring(0, 100) + '...',
        captionLength: (mediaItems[0].caption ?? captionFallback).length
      })
      photoSent = await sendTelegramPhoto(token, chat, mediaItems[0].media, mediaItems[0].caption ?? captionFallback)
      console.log('[Telegram] Результат отправки фото:', photoSent ? 'успешно' : 'ошибка')
      
      // Если фото не отправилось, добавляем информацию о товаре в текстовое сообщение
      if (!photoSent) {
        console.log('[Telegram] Фото не отправилось, информация о товаре будет в текстовом сообщении')
      }
    } else if (mediaItems.length > 1) {
      console.log('[Telegram] Попытка отправить медиа-группу:', {
        count: mediaItems.length
      })
      photoSent = await sendTelegramMediaGroup(token, chat, mediaItems)
      console.log('[Telegram] Результат отправки медиа-группы:', photoSent ? 'успешно' : 'ошибка')
      
      // Если фото не отправилось, добавляем информацию о товарах в текстовое сообщение
      if (!photoSent) {
        console.log('[Telegram] Медиа-группа не отправилась, информация о товарах будет в текстовом сообщении')
      }
    }
  } else if (itemsWithImages.length > 0 && !canSendImages) {
    console.log('[Telegram] Изображения товаров пропущены (localhost недоступен для Telegram)')
  }
  
  // Текстовое сообщение отправляется ВСЕГДА, независимо от результата отправки фото

  // Формируем сообщение с кнопкой или без (если localhost)
  const messageOptions: TelegramMessageOptions = {
    text: message,
    parseMode: 'Markdown', // Используем Markdown для форматирования
  }
  
  if (isValidUrl) {
    messageOptions.replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '📋 Посмотреть заказ',
            url: orderUrl,
          },
        ],
      ],
    }
  } else {
    // Для localhost добавляем URL в текст сообщения
    messageOptions.text = `${message}\n\n🔗 *Ссылка на заказ:*\n${orderUrl}`
  }
  
  console.log('[Telegram] Попытка отправить текстовое сообщение:', {
    textLength: messageOptions.text.length,
    hasButton: !!messageOptions.replyMarkup
  })
  const success = await sendTelegramMessage(token, chat, messageOptions)
  
  if (success) {
    console.log('[Telegram] ✅ Уведомление успешно отправлено в Telegram:', {
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      timestamp: new Date().toISOString()
    })
  } else {
    console.error('[Telegram] ❌ Ошибка при отправке уведомления в Telegram:', {
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      timestamp: new Date().toISOString(),
      hasToken: !!token,
      hasChatId: !!chat
    })
  }
  
  return success
}

