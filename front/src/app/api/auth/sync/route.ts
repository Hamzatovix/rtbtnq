import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    let token: string | undefined
    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({} as any))
      token = body?.token
    }

    if (!token) {
      const authHeader = req.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ ok: false, error: 'TOKEN_REQUIRED' }, { status: 400 })
    }

    const isProduction = process.env.NODE_ENV === 'production'

    const res = NextResponse.json({ ok: true })
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
      secure: isProduction,
    })
    return res
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

