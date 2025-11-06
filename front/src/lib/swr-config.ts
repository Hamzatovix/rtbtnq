/**
 * SWR конфигурация и fetcher функции
 */

// Базовый fetcher для SWR
export const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    // @ts-ignore
    error.info = await res.json()
    // @ts-ignore
    error.status = res.status
    throw error
  }
  
  return res.json()
}

// Конфигурация SWR по умолчанию
export const swrConfig = {
  revalidateOnFocus: false, // Не обновлять при фокусе (для лучшей производительности)
  revalidateOnReconnect: true, // Обновлять при восстановлении сети
  dedupingInterval: 60000, // Дедупликация запросов на 1 минуту
  focusThrottleInterval: 5000, // Throttle для focus events
  errorRetryCount: 3, // Количество повторных попыток при ошибке
  errorRetryInterval: 5000, // Интервал между попытками
  shouldRetryOnError: (error: any) => {
    // Не повторять при 404 и 403
    if (error?.status === 404 || error?.status === 403) {
      return false
    }
    return true
  },
}

