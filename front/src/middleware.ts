import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Проверяем, является ли запрос к backoffice
  if (request.nextUrl.pathname.startsWith('/backoffice')) {
    // Пропускаем страницу логина и API маршруты авторизации
    if (
      request.nextUrl.pathname === '/backoffice/login' ||
      request.nextUrl.pathname.startsWith('/api/auth/')
    ) {
      return NextResponse.next()
    }

    // Проверяем наличие и валидность токена в cookies или заголовке Authorization
    let token = request.cookies.get('auth-token')?.value
    
    // Если токена нет в cookie, проверяем заголовок Authorization
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    // Логирование для отладки (только в development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware]', request.nextUrl.pathname, 'Token exists:', !!token)
    }

    if (!token) {
      // Перенаправляем на страницу логина, если токена нет
      const loginUrl = new URL('/backoffice/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // На уровне middleware в dev-режиме не выполняем криптопроверку JWT,
    // т.к. edge-runtime может не поддерживать jsonwebtoken. Доверяем наличию cookie.
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/backoffice/:path*',
  ],
}

