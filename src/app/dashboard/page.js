'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import SecretCard from '@/components/SecretCard'
import CookieEditor from '@/components/CookieEditor'
import ConfigEditor from '@/components/ConfigEditor'

export default function DashboardPage() {
  const [secrets, setSecrets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState(null)
  const router = useRouter()

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    fetchSecrets()
  }, [])

  async function fetchSecrets() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/secrets')
      if (res.status === 401) {
        router.push('/')
        return
      }
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '获取失败')
        return
      }
      const data = await res.json()
      setSecrets(data.secrets)
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold">配置管理</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            退出登录
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border">
          {[
            { id: 'overview', label: '概览', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'cookie', label: 'Cookie 管理', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { id: 'config', label: 'Config 配置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Secret 状态</h2>
              {loading ? (
                <div className="grid gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
                  {error}
                  <button onClick={fetchSecrets} className="ml-2 underline">重试</button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {secrets.map((s) => (
                    <SecretCard key={s.name} secret={s} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cookie' && <CookieEditor onSuccess={() => { fetchSecrets(); showToast('Cookie 更新成功！') }} onError={(msg) => showToast(msg, 'error')} />}

          {activeTab === 'config' && <ConfigEditor onSuccess={() => { fetchSecrets(); showToast('Config 更新成功！') }} onError={(msg) => showToast(msg, 'error')} />}
        </div>
      </div>

      <div className="h-12"></div>
    </div>
  )
}