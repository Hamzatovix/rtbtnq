import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const DEFAULT_ADMIN_USERNAME = 'rosebotanique'
const DEFAULT_ADMIN_PASSWORD_HASH =
  '$2b$10$Ex0xi5EKce2dULLmluenFu53fIdTxe49nlFGoQvuK/Dk5X.aWMLze' // пароль RoseBot2024!

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? DEFAULT_ADMIN_PASSWORD_HASH

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
  console.warn(
    '[auth/login] Используются dev-учётные данные администратора. Задайте ADMIN_USERNAME и ADMIN_PASSWORD_HASH в окружении.'
  )
}

// Проверка пароля с помощью bcrypt
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error('Ошибка при проверке пароля:', error)
    return false
  }
}

// Генерируем секретный ключ для JWT
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production')
    }
    console.warn('[auth/login] JWT_SECRET отсутствует, используется dev-значение. Настройте переменную для production.')
    return 'dev-secret-key'
  }
  return secret
})()

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Имя пользователя и пароль обязательны' },
        { status: 400 }
      )
    }

    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, ADMIN_PASSWORD_HASH)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    // Создаем JWT токен
    const token = sign({ username: ADMIN_USERNAME, id: 'admin' }, JWT_SECRET, { expiresIn: '24h' })

    const response = NextResponse.json(
      {
        success: true,
        user: { username: ADMIN_USERNAME },
      },
      { status: 200 },
    )

    const isProduction = process.env.NODE_ENV === 'production'

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
      secure: isProduction,
    })

    return response
  } catch (error: any) {
    console.error('Ошибка при входе:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе в систему' },
      { status: 500 }
    )
  }
}

