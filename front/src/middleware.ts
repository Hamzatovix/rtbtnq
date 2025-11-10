import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-key'
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

async function verifyToken(token: string) {
  try {
    await jwtVerify(token, JWT_SECRET_KEY)
    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[middleware] Invalid token:', error)
    }
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isBackofficeRoute = pathname.startsWith('/backoffice')
  const isApiRoute = pathname.startsWith('/api')
  const isAuthRoute = pathname.startsWith('/api/auth')
  const publicApiRules: Array<{ prefix: string; methods: string[] }> = [
    { prefix: '/api/catalog', methods: ['GET'] },
    { prefix: '/api/products', methods: ['GET'] },
    { prefix: '/api/colors', methods: ['GET'] },
    { prefix: '/api/orders', methods: ['POST'] },
  ]
  const isPublicApiRoute = publicApiRules.some(
    ({ prefix, methods }) => pathname.startsWith(prefix) && methods.includes(request.method),
  )

  const isLoginPage = pathname === '/backoffice/login'

  if (isBackofficeRoute && isLoginPage) {
    return NextResponse.next()
  }

  if (!isBackofficeRoute && (!isApiRoute || isAuthRoute || isPublicApiRoute)) {
    return NextResponse.next()
  }

  // Разрешаем технические запросы
  if (isApiRoute && (request.method === 'OPTIONS' || request.method === 'HEAD')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    if (isBackofficeRoute) {
      const loginUrl = new URL('/backoffice/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (isApiRoute) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.next()
  }

  const isValid = await verifyToken(token)

  if (!isValid) {
    if (isBackofficeRoute) {
      const loginUrl = new URL('/backoffice/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (isApiRoute) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/backoffice/:path*',
    '/api/:path*',
  ],
}

