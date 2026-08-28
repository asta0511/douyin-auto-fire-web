'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LiquidBackground from '@/components/LiquidBackground'

function createRipple(e) {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2

  const ripple = document.createElement('span')
  ripple.className = 'btn-ripple'
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`

  btn.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '登录失败')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }, [password, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LiquidBackground />

      <div className="w-full max-w-md animate-enter" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card glass-lens p-10 mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/25"
                 style={{ transition: 'transform 0.3s var(--ease-out)' }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">抖音续火花</h1>
            <p className="text-gray-500 mt-1.5 text-sm">配置管理面板</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">登录密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full px-4 py-3 text-sm"
                placeholder="请输入密码"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-200/50 animate-enter">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full py-3 text-sm"
              onClick={createRipple}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  登录中...
                </span>
              ) : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}