import { NextResponse } from 'next/server'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password || !verifyPassword(password)) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    const session = createSession()

    const response = NextResponse.json({ success: true })

    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}