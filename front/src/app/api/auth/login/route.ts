import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Хранилище пользователей (в реальном приложении должно быть в БД)
// Логин: rosebotanique
// Пароль: RoseBot2024!
// Хеш генерируется при первом запуске или можно задать вручную
const ADMIN_USER = {
  username: 'rosebotanique',
  // Хеш для пароля "RoseBot2024!" - сгенерирован с помощью bcrypt
  // В продакшене этот хеш должен храниться в БД и генерироваться при создании пользователя
  passwordHash: '$2b$10$Ex0xi5EKce2dULLmluenFu53fIdTxe49nlFGoQvuK/Dk5X.aWMLze',
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
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    console.log('Login attempt:', { username, passwordLength: password?.length })

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Имя пользователя и пароль обязательны' },
        { status: 400 }
      )
    }

    // Проверяем учетные данные
    if (username !== ADMIN_USER.username) {
      console.log('Invalid username')
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    console.log('Username matches, checking password...')
    const isValidPassword = await verifyPassword(password, ADMIN_USER.passwordHash)
    console.log('Password valid:', isValidPassword)
    
    if (!isValidPassword) {
      console.log('Invalid password')
      return NextResponse.json(
        { error: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    // Создаем JWT токен
    const token = sign(
      { username: ADMIN_USER.username, id: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('Token created, setting cookie...')

    // Создаем ответ с токеном в теле для сохранения в localStorage
    // Также устанавливаем cookie для совместимости
    const response = NextResponse.json(
      { 
        success: true, 
        user: { username: ADMIN_USER.username },
        token: token // Отправляем токен в ответе для сохранения в localStorage
      },
      { status: 200 }
    )

    // Устанавливаем HTTP-only cookie для безопасности (для браузеров, которые поддерживают)
    const isProduction = process.env.NODE_ENV === 'production'
    
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, // 24 часа
      path: '/',
    }
    
    if (isProduction) {
      cookieOptions.secure = true
    }
    
    response.cookies.set('auth-token', token, cookieOptions)

    console.log('Login successful, token created. Token length:', token.length)
    return response
  } catch (error: any) {
    console.error('Ошибка при входе:', error)
    return NextResponse.json(
      { error: 'Ошибка при входе в систему' },
      { status: 500 }
    )
  }
}

