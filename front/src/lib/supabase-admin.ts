const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export function isSupabaseEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
}

function getAuthHeaders(): Record<string, string> {
  if (!isSupabaseEnabled()) {
    throw new Error('Supabase credentials are not configured')
  }

  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY as string,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

const SUPABASE_TIMEOUT_MS = 15000 // 15 секунд таймаут для Supabase запросов

async function supabaseRequest<T>(path: string, init: RequestInit): Promise<T> {
  if (!SUPABASE_URL) {
    throw new Error('Supabase URL is not configured')
  }

  const url = `${SUPABASE_URL}/rest/v1/${path}`
  console.log('[Supabase] Запрос:', {
    method: init.method || 'GET',
    url: url,
    hasAuth: !!SUPABASE_SERVICE_ROLE_KEY,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.error('[Supabase] Таймаут запроса (15s)')
    controller.abort()
  }, SUPABASE_TIMEOUT_MS)

  const startTime = Date.now()
  let response: Response
  
  try {
    // Извлекаем signal из init, если он есть, и комбинируем с нашим
    const { signal: externalSignal, ...restInit } = init
    const combinedSignal = externalSignal 
      ? (() => {
          const combinedController = new AbortController()
          externalSignal.addEventListener('abort', () => combinedController.abort(), { once: true })
          controller.signal.addEventListener('abort', () => combinedController.abort(), { once: true })
          return combinedController.signal
        })()
      : controller.signal

    response = await fetch(url, {
      ...restInit,
      headers: {
        ...getAuthHeaders(),
        ...(restInit.headers || {}),
      },
      signal: combinedSignal,
    })
    
    const elapsed = Date.now() - startTime
    clearTimeout(timeoutId)
    console.log('[Supabase] Ответ получен:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      elapsed: `${elapsed}ms`,
    })
  } catch (fetchError: any) {
    const elapsed = Date.now() - startTime
    clearTimeout(timeoutId)
    
    if (fetchError?.name === 'AbortError' || controller.signal.aborted) {
      console.error('[Supabase] Запрос прерван (таймаут или отмена):', {
        elapsed: `${elapsed}ms`,
        path,
      })
      const timeoutError = new Error(`Supabase request timeout after ${SUPABASE_TIMEOUT_MS}ms`)
      // @ts-ignore
      timeoutError.status = 504
      throw timeoutError
    }
    
    if (fetchError?.code === 'UND_ERR_SOCKET') {
      console.error('[Supabase] Соединение закрыто сервером:', {
        elapsed: `${elapsed}ms`,
        path,
        error: fetchError.message,
      })
      const socketError = new Error(`Supabase connection closed: ${fetchError.message}`)
      // @ts-ignore
      socketError.status = 503
      throw socketError
    }
    
    if (fetchError?.code === 'ECONNRESET') {
      console.error('[Supabase] TLS соединение сброшено до установления:', {
        elapsed: `${elapsed}ms`,
        path,
        error: fetchError.message,
        cause: fetchError.cause,
      })
      const resetError = new Error(`Supabase TLS connection reset: ${fetchError.message}`)
      // @ts-ignore
      resetError.status = 503
      throw resetError
    }
    
    // Обработка ETIMEDOUT - таймаут записи в сокет
    if (fetchError?.code === 'ETIMEDOUT' || fetchError?.cause?.code === 'ETIMEDOUT' || fetchError?.cause?.errno === -110) {
      console.error('[Supabase] Таймаут записи в сокет:', {
        elapsed: `${elapsed}ms`,
        path,
        error: fetchError.message,
        code: fetchError?.code,
        cause: fetchError.cause,
      })
      const writeTimeoutError = new Error(`Supabase write timeout: ${fetchError.message}`)
      // @ts-ignore
      writeTimeoutError.status = 504
      // @ts-ignore
      writeTimeoutError.code = 'ETIMEDOUT'
      throw writeTimeoutError
    }
    
    console.error('[Supabase] Ошибка fetch:', {
      elapsed: `${elapsed}ms`,
      path,
      error: fetchError?.message || fetchError,
      code: fetchError?.code,
      cause: fetchError?.cause,
    })
    throw fetchError
  }

  if (!response.ok) {
    let errorText = ''
    try {
      errorText = await response.text()
    } catch {
      errorText = 'Не удалось прочитать тело ответа'
    }
    
    console.error('[Supabase] Ошибка ответа:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText.substring(0, 500),
    })
    throw new Error(`${response.status} ${response.statusText}: ${errorText.substring(0, 200)}`)
  }

  const contentLength = response.headers.get('content-length')
  if (response.status === 204 || contentLength === '0' || (!contentLength && init.method === 'DELETE')) {
    return undefined as T
  }

  let text: string
  try {
    text = await response.text()
  } catch (error) {
    console.error('[Supabase] Ошибка чтения ответа:', error)
    throw new Error('Failed to read response body')
  }
  
  if (!text) {
    return undefined as T
  }

  try {
    return JSON.parse(text) as T
  } catch (parseError) {
    console.error('[Supabase] Ошибка парсинга JSON:', {
      text: text.substring(0, 200),
      error: parseError,
    })
    throw new Error('Failed to parse response as JSON')
  }
}

export async function supabaseSelect<T>(table: string, query = '', options?: { count?: boolean }): Promise<T> {
  const path = query ? `${table}?${query}` : table
  const headers: Record<string, string> = {}
  
  // Если нужен подсчет, добавляем заголовок для получения count
  if (options?.count) {
    headers['Prefer'] = 'count=exact'
  }
  
  return supabaseRequest<T>(path, { 
    method: 'GET',
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  })
}

/**
 * Получает количество записей в таблице с опциональной фильтрацией
 * Использует заголовок Content-Range от Supabase для эффективного подсчета
 */
export async function supabaseCount(table: string, filter = ''): Promise<number> {
  try {
    if (!SUPABASE_URL) {
      throw new Error('Supabase URL is not configured')
    }
    
    // Используем GET с limit=0 и Prefer: count=exact для получения count из заголовка
    const query = filter ? `${table}?${filter}&select=id&limit=0` : `${table}?select=id&limit=0`
    const url = `${SUPABASE_URL}/rest/v1/${query}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, SUPABASE_TIMEOUT_MS)
    
    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Prefer': 'count=exact',
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime
    
    // Supabase возвращает count в заголовке Content-Range
    // Формат: "0-9/100" где 100 - это total
    const contentRange = response.headers.get('content-range')
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/)
      if (match) {
        const count = parseInt(match[1], 10)
        console.log('[Supabase] Получен count из заголовка:', { 
          table, 
          filter, 
          count,
          elapsed: `${elapsed}ms`
        })
        return count
      }
    }
    
    // Если не удалось получить из заголовка, делаем fallback - загружаем все ID
    // Это медленнее, но работает как запасной вариант
    console.log('[Supabase] Content-Range не найден, делаем запрос для подсчета через данные')
    const data = await supabaseSelect<Array<{ id: string }>>(query)
    const count = Array.isArray(data) ? data.length : 0
    console.log('[Supabase] Получен count из данных:', { 
      table, 
      filter, 
      count,
      elapsed: `${elapsed}ms`
    })
    return count
  } catch (error) {
    console.error('[Supabase] Ошибка при подсчете записей:', {
      table,
      filter,
      error: error instanceof Error ? error.message : error,
    })
    return 0
  }
}

export async function supabaseUpsert<T>(table: string, payload: unknown): Promise<T> {
  return supabaseRequest<T>(table, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  })
}

export async function supabaseDelete(table: string, filter: string): Promise<void> {
  await supabaseRequest(table + (filter ? `?${filter}` : ''), {
    method: 'DELETE',
    headers: {
      Prefer: 'return=minimal',
    },
  })
}
