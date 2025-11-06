import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
    
    console.log('Verify request - token exists:', !!token)

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    try {
      const decoded = verify(token, JWT_SECRET) as { username: string; id: string }
      console.log('Token verified successfully:', decoded.username)
      return NextResponse.json(
        { authenticated: true, user: { username: decoded.username } },
        { status: 200 }
      )
    } catch (error) {
      // Токен невалиден или истек
      console.log('Token verification failed:', error)
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

