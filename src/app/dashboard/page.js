'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import SecretCard from '@/components/SecretCard'
import CookieEditor from '@/components/CookieEditor'
import ConfigEditor from '@/components/ConfigEditor'
import LiquidBackground from '@/components/LiquidBackground'

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
    <div className="min-h-screen p-4 sm:p-6">
      <LiquidBackground />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm toast-enter ${
          toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto animate-enter">
        <header className="glass glass-lens rounded-2xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">配置管理</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出
          </button>
        </header>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mt-6 animate-enter animate-stagger-1">
        <div className="glass glass-lens rounded-2xl p-1.5">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: '概览', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
              { id: 'cookie', label: 'Cookie 管理', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { id: 'config', label: 'Config 配置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'tab-active shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="animate-enter" key="overview">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Secret 状态</h2>
              {loading ? (
                <div className="grid gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="glass-card p-6 animate-pulse" style={{ border: 'none' }}>
                      <div className="h-5 bg-white/30 rounded-lg w-1/3 mb-3"></div>
                      <div className="h-4 bg-white/20 rounded-lg w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="glass glass-lens rounded-2xl p-5 text-red-600 text-sm">
                  {error}
                  <button onClick={fetchSecrets} className="ml-2 underline font-medium">重试</button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {secrets.map((s, i) => (
                    <div key={s.name} className={`animate-enter animate-stagger-${i + 1}`}>
                      <SecretCard secret={s} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cookie' && (
            <div className="animate-enter animate-stagger-1" key="cookie">
              <CookieEditor
                onSuccess={() => { fetchSecrets(); showToast('Cookie 更新成功！') }}
                onError={(msg) => showToast(msg, 'error')}
              />
            </div>
          )}

          {activeTab === 'config' && (
            <div className="animate-enter animate-stagger-1" key="config">
              <ConfigEditor
                onSuccess={(msg) => { fetchSecrets(); showToast(msg || 'Config 更新成功！') }}
                onError={(msg) => showToast(msg, 'error')}
              />
            </div>
          )}
        </div>
      </div>

      <div className="h-12"></div>
    </div>
  )
}