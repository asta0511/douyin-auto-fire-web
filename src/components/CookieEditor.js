'use client'

import { useState } from 'react'

export default function CookieEditor({ onSuccess, onError }) {
  const [cookie, setCookie] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!cookie.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/secrets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'DOUYIN_COOKIE', value: cookie.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        onError(data.error || '更新失败')
        return
      }

      setCookie('')
      onSuccess()
    } catch {
      onError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card glass-lens p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">更新 DOUYIN_COOKIE</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4 ml-11">
        粘贴从浏览器获取的抖音 Cookie 字符串。注意：GitHub API 不返回已存储的 Secret 值，每次更新都需要重新粘贴。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cookie 值</label>
          <textarea
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            rows={6}
            className="glass-input w-full px-4 py-3 text-sm font-mono"
            placeholder="粘贴 Cookie 字符串..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !cookie.trim()}
            className="btn-primary px-6 py-2.5 text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                保存中...
              </span>
            ) : '保存到 GitHub Secrets'}
          </button>
          {cookie && (
            <span className="text-xs text-gray-400 bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/30">
              {cookie.length} 个字符
            </span>
          )}
        </div>
      </form>
    </div>
  )
}