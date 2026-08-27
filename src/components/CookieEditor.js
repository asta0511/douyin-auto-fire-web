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
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">更新 DOUYIN_COOKIE</h2>
      <p className="text-sm text-gray-500 mb-4">
        粘贴从浏览器获取的抖音 Cookie 字符串。注意：GitHub API 不返回已存储的 Secret 值，每次更新都需要重新粘贴。
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cookie 值</label>
          <textarea
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-sm font-mono"
            placeholder="粘贴 Cookie 字符串..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !cookie.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {loading ? '保存中...' : '保存到 GitHub Secrets'}
          </button>
          {cookie && (
            <span className="text-xs text-gray-400">
              {cookie.length} 个字符
            </span>
          )}
        </div>
      </form>
    </div>
  )
}