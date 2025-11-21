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

  const response = await fetch(url, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init.headers || {}),
    },
  })

  console.log('[Supabase] Ответ:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  })

  if (!response.ok) {
    const text = await response.text()
    console.error('[Supabase] Ошибка ответа:', {
      status: response.status,
      statusText: response.statusText,
      body: text,
    })
    throw new Error(`${response.status} ${response.statusText}: ${text}`)
  }

  const contentLength = response.headers.get('content-length')
  if (response.status === 204 || contentLength === '0' || (!contentLength && init.method === 'DELETE')) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  return JSON.parse(text) as T
}

export async function supabaseSelect<T>(table: string, query = ''): Promise<T> {
  const path = query ? `${table}?${query}` : table
  return supabaseRequest<T>(path, { method: 'GET' })
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
