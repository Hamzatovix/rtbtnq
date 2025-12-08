'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, ShoppingBag, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'info' | 'default'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

// Глобальный store для toast-уведомлений
let toastStore: Toast[] = []
let listeners: Set<() => void> = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

export const toastStoreManager = {
  add: (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    const newToast: Toast = {
      id,
      variant: 'default',
      duration: 4000,
      ...toast,
    }
    toastStore = [...toastStore, newToast]
    notifyListeners()
    
    // Автоматическое удаление через duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toastStoreManager.remove(id)
      }, newToast.duration)
    }
    
    return id
  },
  remove: (id: string) => {
    toastStore = toastStore.filter(toast => toast.id !== id)
    notifyListeners()
  },
  clear: () => {
    toastStore = []
    notifyListeners()
  },
  get: () => toastStore,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

// Хук для использования toast
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = toastStoreManager.subscribe(() => {
      setToasts(toastStoreManager.get())
    })
    // Инициализация
    setToasts(toastStoreManager.get())
    return unsubscribe
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    return toastStoreManager.add(toast)
  }, [])

  const removeToast = useCallback((id: string) => {
    toastStoreManager.remove(id)
  }, [])

  const clearToasts = useCallback(() => {
    toastStoreManager.clear()
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  }
}

// Компонент Toast
function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast()

  const handleRemove = () => {
    removeToast(toast.id)
  }

  const iconMap = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    default: ShoppingBag,
  }

  const variantStyles = {
    success: {
      bg: 'bg-fintage-offwhite dark:bg-fintage-charcoal',
      border: 'border-accent/30 dark:border-accent/40',
      icon: 'text-accent',
      title: 'text-fintage-charcoal dark:text-fintage-offwhite',
      description: 'text-fintage-graphite dark:text-fintage-graphite/70',
    },
    error: {
      bg: 'bg-fintage-offwhite dark:bg-fintage-charcoal',
      border: 'border-fintage-punch/30 dark:border-fintage-punch/40',
      icon: 'text-fintage-punch',
      title: 'text-fintage-charcoal dark:text-fintage-offwhite',
      description: 'text-fintage-graphite dark:text-fintage-graphite/70',
    },
    info: {
      bg: 'bg-fintage-offwhite dark:bg-fintage-charcoal',
      border: 'border-fintage-graphite/30 dark:border-fintage-graphite/40',
      icon: 'text-fintage-graphite dark:text-fintage-graphite/70',
      title: 'text-fintage-charcoal dark:text-fintage-offwhite',
      description: 'text-fintage-graphite dark:text-fintage-graphite/70',
    },
    default: {
      bg: 'bg-fintage-offwhite dark:bg-fintage-charcoal',
      border: 'border-fintage-graphite/30 dark:border-fintage-graphite/40',
      icon: 'text-fintage-charcoal dark:text-fintage-offwhite',
      title: 'text-fintage-charcoal dark:text-fintage-offwhite',
      description: 'text-fintage-graphite dark:text-fintage-graphite/70',
    },
  }

  const styles = variantStyles[toast.variant || 'default']
  const Icon = iconMap[toast.variant || 'default']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative flex items-center gap-2 p-2.5 sm:gap-2.5 sm:p-3 rounded-sm border shadow-fintage-md backdrop-blur-sm',
        styles.bg,
        styles.border,
        'w-full min-w-0 sm:min-w-[280px] sm:max-w-[360px]'
      )}
    >
      {/* Иконка */}
      <div className={cn('flex-shrink-0', styles.icon)}>
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>

      {/* Контент */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className={cn('font-mono text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.1em] leading-tight', styles.title)}>
          {toast.title}
        </div>
        {toast.description && (
          <div className={cn('text-[10px] sm:text-xs font-body leading-tight mt-0.5 line-clamp-2', styles.description)}>
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick()
              handleRemove()
            }}
            className="mt-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-[0.1em] text-accent hover:text-accent/80 underline transition-fintage"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Кнопка закрытия */}
      <button
        onClick={handleRemove}
        className={cn(
          'flex-shrink-0 p-0.5 sm:p-1 rounded-sm hover:bg-fintage-graphite/10 dark:hover:bg-fintage-graphite/20 transition-fintage min-h-[32px] min-w-[32px] flex items-center justify-center',
          styles.description
        )}
        aria-label="Закрыть"
      >
        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
    </motion.div>
  )
}

// Компонент ToastContainer
export function ToastContainer() {
  const { toasts } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:bottom-4 sm:right-4 sm:left-auto z-[100] flex flex-col gap-2 pointer-events-none max-w-full sm:max-w-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto w-full sm:w-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Вспомогательные функции для быстрого создания toast
export const toast = {
  success: (title: string, description?: string) => {
    return toastStoreManager.add({ title, description, variant: 'success' })
  },
  error: (title: string, description?: string) => {
    return toastStoreManager.add({ title, description, variant: 'error' })
  },
  info: (title: string, description?: string) => {
    return toastStoreManager.add({ title, description, variant: 'info' })
  },
  default: (title: string, description?: string) => {
    return toastStoreManager.add({ title, description, variant: 'default' })
  },
  custom: (toast: Omit<Toast, 'id'>) => {
    return toastStoreManager.add(toast)
  },
}

