/**
 * Утилиты для отправки уведомлений в Telegram
 */

const TELEGRAM_TIMEOUT_MS = 15000 // 15 секунд таймаут для всех Telegram запросов
const TELEGRAM_READ_TIMEOUT_MS = 5000 // 5 секунд таймаут на чтение ответа
const TELEGRAM_MAX_RETRIES = 3 // Максимум 3 попытки при сетевых ошибках

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
      console.error(`[Telegram] Таймаут запроса отправки фото (${TELEGRAM_TIMEOUT_MS}ms)`)
      controller.abort()
    }, TELEGRAM_TIMEOUT_MS)
    
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
        const timeoutError = new Error(`Telegram request timeout after ${TELEGRAM_TIMEOUT_MS}ms`)
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
      
      if (fetchError?.code === 'ECONNRESET') {
        console.error('[Telegram] TLS соединение сброшено:', {
          elapsed: `${elapsed}ms`,
          timestamp: new Date().toISOString(),
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const resetError = new Error(`Telegram TLS connection reset: ${fetchError.message}`)
        // @ts-ignore
        resetError.status = 503
        throw resetError
      }
      
      // Обработка ETIMEDOUT - таймаут записи в сокет
      if (fetchError?.code === 'ETIMEDOUT' || fetchError?.cause?.code === 'ETIMEDOUT' || fetchError?.cause?.errno === -110) {
        console.error('[Telegram] Таймаут записи в сокет:', {
          elapsed: `${elapsed}ms`,
          timestamp: new Date().toISOString(),
          error: fetchError.message,
          code: fetchError?.code,
          cause: fetchError.cause,
        })
        const writeTimeoutError = new Error(`Telegram write timeout: ${fetchError.message}`)
        // @ts-ignore
        writeTimeoutError.status = 504
        // @ts-ignore
        writeTimeoutError.code = 'ETIMEDOUT'
        throw writeTimeoutError
      }
      
      console.error('[Telegram] Fetch запрос завершился с ошибкой:', {
        elapsed: `${elapsed}ms`,
        timestamp: new Date().toISOString(),
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
        cause: fetchError?.cause,
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
        console.error(`[Telegram] Request timeout (${TELEGRAM_TIMEOUT_MS}ms) при отправке фото`)
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
      console.error(`[Telegram] Таймаут запроса отправки фото как файла (${TELEGRAM_TIMEOUT_MS}ms)`)
      controller.abort()
    }, TELEGRAM_TIMEOUT_MS)
    
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
        const timeoutError = new Error(`Telegram request timeout after ${TELEGRAM_TIMEOUT_MS}ms`)
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
      
      if (fetchError?.code === 'ECONNRESET') {
        console.error('[Telegram] TLS соединение сброшено при отправке фото как файла:', {
          elapsed: `${elapsed}ms`,
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const resetError = new Error(`Telegram TLS connection reset: ${fetchError.message}`)
        // @ts-ignore
        resetError.status = 503
        throw resetError
      }
      
      // Обработка ETIMEDOUT - таймаут записи в сокет
      if (fetchError?.code === 'ETIMEDOUT' || fetchError?.cause?.code === 'ETIMEDOUT' || fetchError?.cause?.errno === -110) {
        console.error('[Telegram] Таймаут записи в сокет при отправке фото как файла:', {
          elapsed: `${elapsed}ms`,
          error: fetchError.message,
          code: fetchError?.code,
          cause: fetchError.cause,
        })
        const writeTimeoutError = new Error(`Telegram write timeout: ${fetchError.message}`)
        // @ts-ignore
        writeTimeoutError.status = 504
        // @ts-ignore
        writeTimeoutError.code = 'ETIMEDOUT'
        throw writeTimeoutError
      }
      
      console.error('[Telegram] Fetch запрос завершился с ошибкой:', {
        elapsed: `${elapsed}ms`,
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
        cause: fetchError?.cause,
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
        console.error(`[Telegram] Request timeout (${TELEGRAM_TIMEOUT_MS}ms) при отправке фото как файла`)
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
      console.error(`[Telegram] Таймаут запроса отправки медиа-группы (${TELEGRAM_TIMEOUT_MS}ms)`)
      controller.abort()
    }, TELEGRAM_TIMEOUT_MS)
    
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
        const timeoutError = new Error(`Telegram request timeout after ${TELEGRAM_TIMEOUT_MS}ms`)
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
      
      if (fetchError?.code === 'ECONNRESET') {
        console.error('[Telegram] TLS соединение сброшено при отправке медиа-группы:', {
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const resetError = new Error(`Telegram TLS connection reset: ${fetchError.message}`)
        // @ts-ignore
        resetError.status = 503
        throw resetError
      }
      
      // Обработка ETIMEDOUT - таймаут записи в сокет
      if (fetchError?.code === 'ETIMEDOUT' || fetchError?.cause?.code === 'ETIMEDOUT' || fetchError?.cause?.errno === -110) {
        console.error('[Telegram] Таймаут записи в сокет при отправке медиа-группы:', {
          error: fetchError.message,
          code: fetchError?.code,
          cause: fetchError.cause,
        })
        const writeTimeoutError = new Error(`Telegram write timeout: ${fetchError.message}`)
        // @ts-ignore
        writeTimeoutError.status = 504
        // @ts-ignore
        writeTimeoutError.code = 'ETIMEDOUT'
        throw writeTimeoutError
      }
      
      console.error('[Telegram] Ошибка fetch при отправке медиа-группы:', {
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
        cause: fetchError?.cause,
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
        console.error(`[Telegram] Request timeout (${TELEGRAM_TIMEOUT_MS}ms) при отправке медиа-группы`)
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
 * Отправляет сообщение в Telegram через Bot API с retry логикой
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  options: TelegramMessageOptions,
  retryCount = 0
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
      console.error(`[Telegram] Таймаут запроса отправки сообщения (${TELEGRAM_TIMEOUT_MS}ms)`)
      controller.abort()
    }, TELEGRAM_TIMEOUT_MS)
    
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
        const timeoutError = new Error(`Telegram request timeout after ${TELEGRAM_TIMEOUT_MS}ms`)
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
      
      if (fetchError?.code === 'ECONNRESET') {
        console.error('[Telegram] TLS соединение сброшено при отправке сообщения:', {
          error: fetchError.message,
          cause: fetchError.cause,
        })
        const resetError = new Error(`Telegram TLS connection reset: ${fetchError.message}`)
        // @ts-ignore
        resetError.status = 503
        throw resetError
      }
      
      // Обработка ETIMEDOUT - таймаут записи в сокет
      if (fetchError?.code === 'ETIMEDOUT' || fetchError?.cause?.code === 'ETIMEDOUT' || fetchError?.cause?.errno === -110) {
        console.error('[Telegram] Таймаут записи в сокет при отправке сообщения:', {
          error: fetchError.message,
          code: fetchError?.code,
          cause: fetchError.cause,
        })
        const writeTimeoutError = new Error(`Telegram write timeout: ${fetchError.message}`)
        // @ts-ignore
        writeTimeoutError.status = 504
        // @ts-ignore
        writeTimeoutError.code = 'ETIMEDOUT'
        throw writeTimeoutError
      }
      
      console.error('[Telegram] Ошибка fetch при отправке сообщения:', {
        error: fetchError?.message || fetchError,
        code: fetchError?.code,
        cause: fetchError?.cause,
      })
      throw fetchError
    }

    console.log('[Telegram] Чтение ответа от Telegram API...')
    // Читаем ответ с таймаутом
    const readStartTime = Date.now()
    let responseText: string
    try {
      // Используем Promise.race для таймаута на чтение
      responseText = await Promise.race([
        response.text(),
        new Promise<string>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Read timeout after ${TELEGRAM_READ_TIMEOUT_MS}ms`))
          }, TELEGRAM_READ_TIMEOUT_MS)
        })
      ])
      const readElapsed = Date.now() - readStartTime
      console.log('[Telegram] Ответ получен, длина:', responseText.length, { elapsed: `${readElapsed}ms` })
    } catch (readError) {
      const readElapsed = Date.now() - readStartTime
      console.error('[Telegram] Ошибка чтения ответа:', {
        error: readError instanceof Error ? readError.message : readError,
        elapsed: `${readElapsed}ms`
      })
      throw new Error(`Failed to read response: ${readError instanceof Error ? readError.message : 'unknown error'}`)
    }
    
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
    // Retry логика для сетевых ошибок
    const isRetryableError = error instanceof Error && (
      error.name === 'AbortError' ||
      (error as any).code === 'UND_ERR_SOCKET' ||
      (error as any).code === 'ECONNRESET' ||
      (error as any).code === 'ETIMEDOUT' ||
      error.message.includes('timeout') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('connection') ||
      error.message.includes('Failed to read response') ||
      error.message.includes('write timeout')
    )
    
    if (isRetryableError && retryCount < TELEGRAM_MAX_RETRIES) {
      // Уменьшенные задержки для быстрого retry: 500ms, 1000ms, 2000ms
      // Это позволяет завершить все попытки быстрее на Vercel
      const delay = retryCount === 0 ? 500 : retryCount === 1 ? 1000 : 2000
      console.log(`[Telegram] Повторная попытка отправки сообщения (${retryCount + 1}/${TELEGRAM_MAX_RETRIES}) через ${delay}ms...`, {
        error: error instanceof Error ? error.message : 'unknown',
        retryCount
      })
      
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return sendTelegramMessage(botToken, chatId, options, retryCount + 1)
    }
    
    console.error('[Telegram] Failed to send Telegram message:', error)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`[Telegram] Request timeout (${TELEGRAM_TIMEOUT_MS}ms) при отправке сообщения`)
      }
      console.error('[Telegram] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        retryCount,
        maxRetries: TELEGRAM_MAX_RETRIES
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
    .map((item, index) => {
      const colorText = item.color ? ` • ${item.color}` : ''
      const priceText = formatPrice(item.total, currency)
      return `${index + 1}. *${item.name}*${colorText}\n   ${item.qty} шт. × ${formatPrice(item.price, currency)} = ${priceText}`
    })
    .join('\n\n')

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
    // Показываем цену доставки только если она больше 0
    if (shippingPrice !== null && shippingPrice !== undefined && shippingPrice > 0) {
      shippingText += ` — ${formatPrice(shippingPrice, currency)}`
    }
  }

  // Форматируем телефон
  const phoneText = customerPhone ? formatPhone(customerPhone) : '—'
  const phoneDigits = customerPhone ? customerPhone.replace(/\D/g, '') : ''
  
  // Собираем сообщение с улучшенным форматированием
  let message = `✨ *НОВЫЙ ЗАКАЗ*\n`
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`
  
  // Номер заказа в формате кода для легкого копирования (блок кода)
  message += `📦 *Заказ:*\n\`\`\`\n${orderNumber}\n\`\`\`\n`
  message += `👤 *Клиент:* ${customerName}\n`
  
  // Номер телефона в формате кода для легкого копирования
  if (customerPhone && phoneDigits) {
    message += `📞 *Телефон:*\n\`\`\`\n${phoneText}\n\`\`\`\n`
  } else {
    message += `📞 *Телефон:* ${phoneText}\n`
  }
  
  message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
  
  message += `🛒 *ТОВАРЫ*\n\n${itemsText}\n`
  
  message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`
  
  message += `💰 *ИТОГО:* ${formatPrice(total, currency)}\n`

  if (shippingText) {
    message += `\n🚚 *Доставка:* ${shippingText}\n`
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
 * Поддерживает отправку нескольким пользователям (Chat ID через запятую)
 */
export async function sendOrderNotification(
  data: OrderNotificationData,
  botToken?: string,
  chatId?: string
): Promise<boolean> {
  // Проверяем наличие токена и chat_id
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN
  const chatIdsString = chatId || process.env.TELEGRAM_CHAT_ID

  // Поддерживаем несколько Chat ID через запятую
  const chatIds = chatIdsString
    ? chatIdsString.split(',').map(id => id.trim()).filter(Boolean)
    : []

  // Детальное логирование для диагностики
  console.log('[Telegram] Проверка конфигурации:', {
    hasToken: !!token,
    hasChatIds: chatIds.length > 0,
    chatIdsCount: chatIds.length,
    chatIds: chatIds.map(id => id.substring(0, 10) + '...'),
    tokenPreview: token ? `${token.substring(0, 10)}...` : 'не установлен',
    // Дополнительная диагностика
    envTokenExists: !!process.env.TELEGRAM_BOT_TOKEN,
    envChatIdExists: !!process.env.TELEGRAM_CHAT_ID,
    envTokenLength: process.env.TELEGRAM_BOT_TOKEN?.length || 0,
    envChatIdValue: process.env.TELEGRAM_CHAT_ID || 'не установлен',
    nodeEnv: process.env.NODE_ENV,
    // Проверяем все переменные окружения, начинающиеся с TELEGRAM
    allTelegramEnvVars: Object.keys(process.env).filter(key => key.startsWith('TELEGRAM'))
  })

  if (!token || chatIds.length === 0) {
    console.warn('[Telegram] Telegram bot token or chat ID not configured', {
      token: token ? 'установлен' : 'не установлен',
      chatIdsCount: chatIds.length
    })
    return false
  }

  // Отправляем уведомления всем указанным Chat ID
  // logDetails = true только для первого Chat ID, чтобы не дублировать логи
  const results = await Promise.allSettled(
    chatIds.map((chat, index) => sendOrderNotificationToChat(data, token, chat, index === 0))
  )

  // Обрабатываем результаты
  const successResults: Array<{ chatId: string; success: boolean }> = []
  const failedResults: Array<{ chatId: string; error: string }> = []

  results.forEach((result, index) => {
    const chatId = chatIds[index]
    if (result.status === 'fulfilled') {
      successResults.push({ chatId, success: result.value })
    } else {
      failedResults.push({
        chatId,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason)
      })
    }
  })

  const successCount = successResults.filter(r => r.success).length
  const success = successCount > 0

  console.log('[Telegram] Результат отправки уведомлений:', {
    totalChatIds: chatIds.length,
    successCount,
    failedCount: failedResults.length,
    success,
    successfulChatIds: successResults.filter(r => r.success).map(r => r.chatId.substring(0, 10) + '...'),
    failedChatIds: failedResults.map(r => ({ chatId: r.chatId.substring(0, 10) + '...', error: r.error }))
  })

  // Логируем ошибки для каждого Chat ID отдельно
  if (failedResults.length > 0) {
    failedResults.forEach(({ chatId, error }) => {
      console.error(`[Telegram] ❌ Ошибка отправки для Chat ID ${chatId.substring(0, 10)}...:`, error)
    })
  }

  return success
}

/**
 * Отправляет уведомление о заказе в конкретный чат
 */
async function sendOrderNotificationToChat(
  data: OrderNotificationData,
  token: string,
  chat: string,
  logDetails: boolean = true
): Promise<boolean> {

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
  
  if (logDetails) {
    console.log('[Telegram] Отправка уведомления о заказе:', {
      chatId: chat.substring(0, 10) + '...',
      orderNumber: data.orderNumber,
      orderUrl,
      isValidUrl,
      itemsWithImages: data.items.filter(item => item.image).length
    })
  }
  
  // Собираем уникальные изображения товаров (убираем дубликаты и placeholder)
  const uniqueImages = new Map<string, string>()
  
  console.log('[Telegram] Проверка изображений товаров:', {
    itemsCount: data.items.length,
    itemsWithImages: data.items.filter(item => item.image).length,
    baseUrl,
    items: data.items.map(item => ({
      name: item.name,
      hasImage: !!item.image,
      image: item.image ? item.image.substring(0, 50) + '...' : null
    }))
  })
  
  // Обрабатываем все товары в заказе
  data.items.forEach((item, index) => {
    if (item.image && item.image.trim()) {
      const imageUrl = item.image.trim()
      
      // Пропускаем placeholder изображения
      if (imageUrl.includes('placeholder') || imageUrl.includes('about_main_placeholder')) {
        console.log('[Telegram] Пропущено placeholder изображение для товара:', {
          itemIndex: index + 1,
          itemName: item.name,
          imageUrl: imageUrl.substring(0, 50)
        })
        return
      }
      
      // Формируем абсолютный URL для изображения
      let fullImageUrl = imageUrl
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        fullImageUrl = imageUrl.startsWith('/') 
          ? `${baseUrl}${imageUrl}`
          : `${baseUrl}/${imageUrl}`
      }
      
      // Используем Map для автоматического удаления дубликатов
      // Если товар добавлен несколько раз с одинаковым изображением, оно будет отправлено только один раз
      const wasAdded = uniqueImages.has(fullImageUrl)
      uniqueImages.set(fullImageUrl, fullImageUrl)
      
      console.log('[Telegram] Обработка изображения товара:', {
        itemIndex: index + 1,
        itemName: item.name,
        qty: item.qty,
        original: imageUrl.substring(0, 50),
        full: fullImageUrl.substring(0, 80),
        wasDuplicate: wasAdded
      })
    } else {
      console.log('[Telegram] Товар без изображения:', {
        itemIndex: index + 1,
        itemName: item.name,
        qty: item.qty
      })
    }
  })
  
  const imageUrls = Array.from(uniqueImages.values())
  
  console.log('[Telegram] Итого уникальных изображений:', {
    count: imageUrls.length,
    urls: imageUrls.map(url => url.substring(0, 80))
  })
  
  // Если есть изображения, отправляем медиа-группу с первым фото и подписью
  if (imageUrls.length > 0) {
    console.log('[Telegram] Отправка уведомления с изображениями товаров:', {
      imagesCount: imageUrls.length,
      itemsCount: data.items.length,
      totalItemsQty: data.items.reduce((sum, item) => sum + item.qty, 0),
      willSendCount: Math.min(imageUrls.length, 10) // Telegram ограничивает до 10 фото в группе
    })
    
    // Формируем медиа-группу (максимум 10 фото в группе по лимиту Telegram)
    const media: Array<{ type: 'photo'; media: string; caption?: string }> = imageUrls.slice(0, 10).map((imageUrl, index) => ({
      type: 'photo' as const,
      media: imageUrl,
      // Подпись будет только у первого фото
      caption: index === 0 ? message.substring(0, 1024) : undefined, // Telegram ограничивает подпись 1024 символами
    }))
    
    // Проверяем, что подпись добавлена к первому фото
    if (media.length > 0 && media[0].caption) {
    }
    
    // Пытаемся отправить медиа-группу
    console.log('[Telegram] Попытка отправить медиа-группу:', {
      mediaCount: media.length,
      firstImageUrl: media[0]?.media?.substring(0, 100),
      captionLength: media[0]?.caption?.length || 0
    })
    
    const mediaGroupSuccess = await sendTelegramMediaGroup(token, chat, media)
    
    console.log('[Telegram] Результат отправки медиа-группы:', {
      success: mediaGroupSuccess
    })
    
    if (mediaGroupSuccess) {
      // Если медиа-группа отправлена успешно, отправляем кнопку отдельным сообщением (если нужно)
      if (isValidUrl) {
        const buttonMessage = `🔗 [Посмотреть заказ](${orderUrl})`
        await sendTelegramMessage(token, chat, {
          text: buttonMessage,
          parseMode: 'Markdown',
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: '📋 Посмотреть заказ',
                  url: orderUrl,
                },
              ],
            ],
          },
        })
      }
      
      if (logDetails) {
        console.log('[Telegram] ✅ Уведомление с изображениями успешно отправлено в Telegram:', {
          chatId: chat.substring(0, 10) + '...',
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          imagesCount: media.length,
          timestamp: new Date().toISOString()
        })
      }
      return true
    } else {
      console.warn('[Telegram] Не удалось отправить медиа-группу, отправляем только текстовое сообщение')
      // Продолжаем отправку текстового сообщения
    }
  } else {
    console.log('[Telegram] Изображения товаров отсутствуют, отправляется только текстовое сообщение')
  }
  
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
    if (logDetails) {
      console.log('[Telegram] ✅ Уведомление успешно отправлено в Telegram:', {
        chatId: chat.substring(0, 10) + '...',
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        timestamp: new Date().toISOString()
      })
    }
  } else {
    console.error('[Telegram] ❌ Ошибка при отправке уведомления в Telegram:', {
      chatId: chat.substring(0, 10) + '...',
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      timestamp: new Date().toISOString(),
      hasToken: !!token
    })
  }
  
  return success
}

