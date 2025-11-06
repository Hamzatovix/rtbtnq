import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    // Удаляем cookie с токеном
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Ошибка при выходе:', error)
    return NextResponse.json(
      { error: 'Ошибка при выходе из системы' },
      { status: 500 }
    )
  }
}

