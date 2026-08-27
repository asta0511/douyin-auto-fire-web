import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getSecretStatus, updateSecret } from '@/lib/github'

export async function GET() {
  try {
    requireAuth()
    const status = await getSecretStatus()
    return NextResponse.json({ secrets: status })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    requireAuth()
    const { name, value } = await request.json()

    if (!name || !value) {
      return NextResponse.json(
        { error: '缺少 name 或 value' },
        { status: 400 }
      )
    }

    const validSecrets = ['DOUYIN_COOKIE', 'DOUYIN_CONFIG']
    if (!validSecrets.includes(name)) {
      return NextResponse.json(
        { error: '无效的 Secret 名称' },
        { status: 400 }
      )
    }

    await updateSecret(name, value)
    return NextResponse.json({ success: true, name })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}