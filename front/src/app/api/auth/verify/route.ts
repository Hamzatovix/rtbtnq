import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export const dynamic = 'force-dynamic'

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    // При билде Next.js устанавливает NODE_ENV=production, но это не значит, что мы в production
    // Проверяем только при реальном запуске в production (через VERCEL_ENV или явную проверку)
    const isRealProduction = process.env.VERCEL_ENV === 'production' || 
                             (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1')
    if (isRealProduction) {
      throw new Error('JWT_SECRET environment variable must be set in production')
    }
    return 'dev-secret-key'
  }
  return secret
})()

export async function GET(req: NextRequest) {
  try {
    // Проверяем токен из cookie
    let token = req.cookies.get('auth-token')?.value
    
    // Если токена нет в cookie, проверяем заголовок Authorization
    if (!token) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    try {
      const decoded = verify(token, JWT_SECRET) as { username: string; id: string }
      return NextResponse.json(
        { authenticated: true, user: { username: decoded.username } },
        { status: 200 }
      )
    } catch (error) {
      // Токен невалиден или истек
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Ошибка при проверке авторизации:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

