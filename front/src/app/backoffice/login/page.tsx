'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    // Проверяем авторизацию только один раз при загрузке страницы
    // Не проверяем во время процесса входа
    if (loading) return
    
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!res.ok) {
          return
        }

        const data = await res.json()
        if (data.authenticated) {
          router.replace('/backoffice')
        }
      } catch {
        // игнорируем – пользователь не авторизован
      }
    }
    
    // Небольшая задержка для завершения инициализации
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, []) // Только при первой загрузке

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Валидация перед отправкой
    if (!username.trim() || !password.trim()) {
      setError('Пожалуйста, заполните все поля')
      setLoading(false)
      return
    }

    try {
      console.log('Sending login request...', { username: username.trim(), passwordLength: password.length })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важно для cookies
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password 
        }),
      })

      console.log('Response status:', response.status)
      
      let data
      try {
        data = await response.json()
        console.log('Response data:', data)
      } catch (parseError) {
        console.error('Failed to parse response:', parseError)
        setError('Ошибка при обработке ответа сервера')
        setLoading(false)
        return
      }

      if (!response.ok) {
        setError(data.error || 'Неверное имя пользователя или пароль')
        setLoading(false)
        return
      }

      // Небольшая пауза для гарантированного применения cookie
      await new Promise(resolve => setTimeout(resolve, 150))

      // Проверяем на сервере, что токен принят
      try {
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })
        if (!verifyRes.ok) {
          const txt = await verifyRes.text().catch(()=> '')
          throw new Error(`Проверка сессии не прошла (${verifyRes.status}). ${txt}`)
        }
        const j = await verifyRes.json().catch(()=> ({}))
        if (!j.authenticated) {
          throw new Error('Проверка сессии не прошла')
        }
      } catch (verErr: any) {
        console.error('Verify after login failed:', verErr)
        setError('Не удалось подтвердить сессию. Обновите страницу и попробуйте ещё раз.')
        setLoading(false)
        return
      }

      // Перенаправляем на /backoffice (полная навигация с полной перезагрузкой)
      hasRedirectedRef.current = true
      console.log('Login successful, redirecting to: /backoffice')
      
      // Принудительная полная перезагрузка страницы
      // Используем assign вместо href для более явного редиректа
      window.location.assign('/backoffice')
      
      // Прерываем выполнение, так как происходит навигация
      return
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Ошибка соединения с сервером. Проверьте консоль для подробностей.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas flex items-center justify-center relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-fintage-offwhite dark:bg-fintage-charcoal rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-md p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-logo font-medium text-fintage-charcoal dark:text-fintage-offwhite mb-2 tracking-[0.2em] uppercase">
                rosebotanique
              </h1>
              <p className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em] mt-2">Панель управления</p>
              <p className="text-[9px] font-mono text-fintage-graphite/40 dark:text-fintage-graphite/50 uppercase tracking-[0.2em] mt-3">Логин: rosebotanique</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username">Имя пользователя</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="mt-2"
                  placeholder="Введите имя пользователя"
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="mt-2"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="p-3 rounded-sm bg-fintage-punch/10 dark:bg-fintage-punch/20 border border-fintage-punch/30 dark:border-fintage-punch/40 text-fintage-punch dark:text-fintage-punch text-sm font-mono uppercase tracking-[0.1em]">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-fintage-offwhite dark:bg-fintage-charcoal bg-vintage-canvas flex items-center justify-center">
        <div className="animate-spin rounded-sm h-12 w-12 border-2 border-fintage-graphite/30 dark:border-fintage-graphite/50 border-t-accent dark:border-t-accent mx-auto"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

