/**
 * Универсальная функция для тактильной обратной связи (вибрации)
 * Поддерживает Android (Vibration API) и iOS Safari (AudioContext fallback)
 */

let audioContext: AudioContext | null = null
let hapticAudioBuffer: AudioBuffer | null = null
let audioContextInitialized = false

/**
 * Инициализирует AudioContext для iOS Safari fallback
 * AudioContext требует пользовательского взаимодействия для инициализации
 */
function initAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return null
    
    if (!audioContext && !audioContextInitialized) {
      audioContextInitialized = true
      audioContext = new AudioContextClass()
      
      // Создаем очень тихий звуковой сигнал для тактильной обратной связи
      // Используем низкочастотный сигнал, который создает вибрацию
      const sampleRate = audioContext.sampleRate
      const duration = 0.01 // 10ms
      const length = sampleRate * duration
      const buffer = audioContext.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      
      // Генерируем низкочастотный сигнал (40Hz)
      for (let i = 0; i < length; i++) {
        data[i] = Math.sin(2 * Math.PI * 40 * i / sampleRate) * 0.01 // Очень тихий звук
      }
      
      hapticAudioBuffer = buffer
    }
    
    return audioContext
  } catch {
    return null
  }
}

/**
 * Определяет, является ли устройство iOS
 */
function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/**
 * Определяет, является ли устройство мобильным
 */
function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 1)
}

/**
 * Универсальная функция для тактильной обратной связи
 * @param type - тип вибрации: 'light' | 'medium' | 'heavy' | 'success'
 */
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' = 'medium'): void {
  if (typeof window === 'undefined') return
  
  // Проверяем, что это мобильное устройство
  if (!isMobile()) return
  
  try {
    const nav = navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean }
    
    // Android: используем Vibration API
    if (typeof nav.vibrate === 'function') {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: [10, 15, 10],
        heavy: [20, 30, 20],
        success: [10, 20, 10, 20, 10],
      }
      
      nav.vibrate(patterns[type] || patterns.medium)
      return
    }
    
    // iOS Safari: используем AudioContext fallback
    if (isIOS()) {
      const ctx = initAudioContext()
      if (ctx && hapticAudioBuffer) {
        // Восстанавливаем контекст, если он был приостановлен
        const resumePromise = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve()
        
        resumePromise
          .then(() => {
            if (ctx.state === 'closed') return
            
            const source = ctx.createBufferSource()
            source.buffer = hapticAudioBuffer!
            
            // Настраиваем громкость в зависимости от типа
            const gainNode = ctx.createGain()
            const volumes: Record<string, number> = {
              light: 0.005,
              medium: 0.01,
              heavy: 0.02,
              success: 0.015,
            }
            gainNode.gain.value = volumes[type] || volumes.medium
            
            source.connect(gainNode)
            gainNode.connect(ctx.destination)
            
            source.start(0)
            source.stop(ctx.currentTime + 0.01)
          })
          .catch(() => {
            // Игнорируем ошибки - вибрация не критична
          })
      }
      
      // Также пробуем использовать WebKit messageHandlers для нативных приложений
      const webkit = (window as any).webkit
      const hapticHandler =
        webkit?.messageHandlers?.notificationFeedback ??
        webkit?.messageHandlers?.hapticFeedback ??
        webkit?.messageHandlers?.impactFeedback
      
      if (hapticHandler?.postMessage) {
        hapticHandler.postMessage(type === 'success' ? 'success' : 'medium')
      }
    }
  } catch {
    // Игнорируем ошибки - вибрация не критична для функциональности
  }
}

