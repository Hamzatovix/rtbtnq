'use client'
import React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // подключайте сюда Theme/Query/Redux провайдеры по мере необходимости
  return <>{children}</>
}
