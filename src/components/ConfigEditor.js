'use client'

import { useState, useRef, useEffect } from 'react'

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

const DEFAULT_CONFIG = {
  task_id: 'daily-streak',
  timezone: 'Asia/Shanghai',
  friends: [],
  messages: [{ type: 'sticker', value: '续火花' }],
  stickers: { '续火花': { label: '续火花', fallback_index: 0 } },
  send_interval_seconds: { min: 3, max: 8 },
  continue_on_error: true,
  prevent_duplicates: false,
  target_open_retries: 1,
  target_open_timeout_seconds: 15,
}

const HISTORY_KEY = 'douyin_config_history'
const MAX_HISTORY = 20

function parseConfig(raw) {
  const c = typeof raw === 'string' ? JSON.parse(raw) : raw
  return {
    task_id: c.task_id || DEFAULT_CONFIG.task_id,
    timezone: c.timezone || DEFAULT_CONFIG.timezone,
    friends: Array.isArray(c.friends) ? c.friends : [],
    messages: Array.isArray(c.messages) ? c.messages : DEFAULT_CONFIG.messages,
    stickers: c.stickers && typeof c.stickers === 'object' ? c.stickers : DEFAULT_CONFIG.stickers,
    send_interval_seconds: {
      min: c.send_interval_seconds?.min ?? DEFAULT_CONFIG.send_interval_seconds.min,
      max: c.send_interval_seconds?.max ?? DEFAULT_CONFIG.send_interval_seconds.max,
    },
    continue_on_error: c.continue_on_error ?? DEFAULT_CONFIG.continue_on_error,
    prevent_duplicates: c.prevent_duplicates ?? DEFAULT_CONFIG.prevent_duplicates,
    target_open_retries: c.target_open_retries ?? DEFAULT_CONFIG.target_open_retries,
    target_open_timeout_seconds: c.target_open_timeout_seconds ?? DEFAULT_CONFIG.target_open_timeout_seconds,
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToHistory(config) {
  const history = loadHistory()
  const entry = {
    id: Date.now(),
    timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    friendCount: config.friends.length,
    messageCount: config.messages.length,
    config: { ...config },
  }
  history.unshift(entry)
  if (history.length > MAX_HISTORY) history.pop()
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return entry
}

export default function ConfigEditor({ onSuccess, onError }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [friendInput, setFriendInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showStickersEditor, setShowStickersEditor] = useState(false)
  const [stickersText, setStickersText] = useState(JSON.stringify(DEFAULT_CONFIG.stickers, null, 2))
  const [importMode, setImportMode] = useState(false)
  const [importText, setImportText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [selectedHistory, setSelectedHistory] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  function updateField(path, value) {
    setConfig((prev) => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  function applyImportedConfig(parsed) {
    setConfig(parsed)
    setStickersText(JSON.stringify(parsed.stickers, null, 2))
    setImportMode(false)
    setImportText('')
    setDragOver(false)
  }

  function handleImportPaste() {
    if (!importText.trim()) return
    try {
      const parsed = parseConfig(importText)
      saveToHistory(config)
      applyImportedConfig(parsed)
      setHistory(loadHistory())
      onSuccess?.('配置已导入，当前配置已自动记录到历史')
    } catch {
      onError('JSON 格式错误，请检查')
    }
  }

  function handleFileUpload(file) {
    if (!file || file.type !== 'application/json') {
      onError('请上传 JSON 文件')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseConfig(e.target.result)
        saveToHistory(config)
        applyImportedConfig(parsed)
        setHistory(loadHistory())
        onSuccess?.('配置已导入，当前配置已自动记录到历史')
      } catch {
        onError('JSON 文件格式错误')
      }
    }
    reader.readAsText(file)
  }

  function handleFileDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function addFriend() {
    const name = friendInput.trim()
    if (!name || config.friends.includes(name)) return
    setConfig((prev) => ({ ...prev, friends: [...prev.friends, name] }))
    setFriendInput('')
  }

  function removeFriend(name) {
    setConfig((prev) => ({
      ...prev,
      friends: prev.friends.filter((f) => f !== name),
    }))
  }

  function handleFriendKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addFriend()
    }
  }

  function addMessage() {
    setConfig((prev) => ({
      ...prev,
      messages: [...prev.messages, { type: 'sticker', value: '' }],
    }))
  }

  function updateMessage(index, field, value) {
    setConfig((prev) => {
      const messages = [...prev.messages]
      messages[index] = { ...messages[index], [field]: value }
      return { ...prev, messages }
    })
  }

  function removeMessage(index) {
    setConfig((prev) => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index),
    }))
  }

  function applyStickers() {
    try {
      const parsed = JSON.parse(stickersText)
      setConfig((prev) => ({ ...prev, stickers: parsed }))
      setShowStickersEditor(false)
    } catch {
      onError('Stickers JSON 格式错误')
    }
  }

  function restoreFromHistory(entry) {
    setConfig(entry.config)
    setStickersText(JSON.stringify(entry.config.stickers, null, 2))
    setSelectedHistory(null)
    setShowHistory(false)
  }

  function deleteHistoryEntry(id) {
    const updated = history.filter((h) => h.id !== id)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  function clearAllHistory() {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!Array.isArray(config.friends) || config.friends.length === 0) {
      onError('好友列表不能为空，请先导入配置或添加好友')
      return
    }
    if (!Array.isArray(config.messages) || config.messages.length === 0) {
      onError('消息列表不能为空')
      return
    }

    setLoading(true)

    const payload = {
      task_id: config.task_id,
      timezone: config.timezone,
      friends: config.friends,
      messages: config.messages,
      stickers: config.stickers,
      send_interval_seconds: config.send_interval_seconds,
      continue_on_error: config.continue_on_error,
      prevent_duplicates: config.prevent_duplicates,
      target_open_retries: config.target_open_retries,
      target_open_timeout_seconds: config.target_open_timeout_seconds,
    }

    try {
      const res = await fetch('/api/secrets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'DOUYIN_CONFIG',
          value: JSON.stringify(payload, null, 2),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        onError(data.error || '更新失败')
        return
      }

      saveToHistory(config)
      setHistory(loadHistory())
      onSuccess('Config 已保存到 GitHub Secrets，并已记录到历史')
    } catch {
      onError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card glass-lens p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">更新 DOUYIN_CONFIG</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowHistory(!showHistory); setSelectedHistory(null) }}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
            onMouseDown={createRipple}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            历史记录
            {history.length > 0 && (
              <span className="bg-white/40 text-gray-500 text-xs rounded-full px-1.5 py-0.5">{history.length}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setImportMode(!importMode)}
            className="btn-secondary text-xs px-3 py-1.5"
            onMouseDown={createRipple}
          >
            {importMode ? '取消导入' : '导入配置'}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4 ml-11">
        通过表单编辑配置，保存后会自动同步到 GitHub Secrets。导入或保存时会自动记录历史版本。
      </p>

      {/* History Panel */}
      {showHistory && (
        <div className="mb-6 glass glass-lens rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
            <h3 className="text-sm font-medium text-gray-700">配置历史记录</h3>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllHistory}
                  className="text-xs text-red-500 hover:text-red-700 transition"
                  onMouseDown={createRipple}
                >
                  清空全部
                </button>
              )}
              <button
                type="button"
                onClick={() => { setShowHistory(false); setSelectedHistory(null) }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {history.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              暂无历史记录。导入或保存配置后会自动记录。
            </div>
          ) : selectedHistory ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {selectedHistory.timestamp} — {selectedHistory.friendCount} 个好友 · {selectedHistory.messageCount} 条消息
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => restoreFromHistory(selectedHistory)}
                    className="btn-primary text-xs px-3 py-1.5"
                    onMouseDown={createRipple}
                  >
                    恢复此版本
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHistory(null)}
                    className="btn-secondary text-xs px-3 py-1.5"
                    onMouseDown={createRipple}
                  >
                    返回列表
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono bg-white/40 backdrop-blur-sm rounded-lg border border-white/30 p-3 overflow-auto max-h-64 text-gray-700">
                {JSON.stringify(selectedHistory.config, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="divide-y divide-white/10 max-h-72 overflow-y-auto">
              {history.map((entry) => (
                <div key={entry.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/10 transition group">
                  <button
                    type="button"
                    onClick={() => setSelectedHistory(entry)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm text-gray-500">{entry.timestamp}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {entry.friendCount} 个好友 · {entry.messageCount} 条消息
                    </div>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => restoreFromHistory(entry)}
                      className="text-xs px-2 py-1 text-orange-600 hover:bg-orange-50/50 rounded transition"
                      title="恢复此版本"
                      onMouseDown={createRipple}
                    >
                      恢复
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteHistoryEntry(entry.id)}
                      className="text-xs px-2 py-1 text-red-500 hover:bg-red-50/50 rounded transition"
                      title="删除此记录"
                      onMouseDown={createRipple}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Import Section */}
      {importMode && (
        <div className="mb-6 p-4 border-2 border-dashed border-white/40 rounded-xl bg-white/10 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-3">导入配置</h3>

          <div
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition mb-3 ${
              dragOver
                ? 'border-orange-400 bg-orange-100/30'
                : 'border-white/30 hover:border-orange-300/50 bg-white/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) handleFileUpload(file)
                e.target.value = ''
              }}
            />
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500">
              {dragOver ? '松开以上传文件' : '点击选择 JSON 文件，或拖拽文件到此处'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <div className="flex-1 h-px bg-white/30" />
            <span>或者粘贴 JSON</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={5}
            className="glass-input w-full px-3 py-2 text-sm font-mono mb-3"
            placeholder='粘贴 config.json 内容...&#10;{&#10;  "task_id": "daily-streak",&#10;  "friends": [...],&#10;  ...&#10;}'
          />
          <button
            type="button"
            onClick={handleImportPaste}
            disabled={!importText.trim()}
            className="btn-primary px-4 py-2 text-sm"
            onMouseDown={createRipple}
          >
            解析并导入
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">任务 ID</label>
            <input
              type="text"
              value={config.task_id}
              onChange={(e) => updateField('task_id', e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">时区</label>
            <input
              type="text"
              value={config.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Friends */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            好友列表（{config.friends.length} 人）
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {config.friends.map((name) => (
              <span key={name} className="tag">
                {name}
                <button
                  type="button"
                  onClick={() => removeFriend(name)}
                  className="hover:text-orange-900 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              onKeyDown={handleFriendKeyDown}
              className="glass-input flex-1 px-3 py-2 text-sm"
              placeholder="输入好友昵称，按 Enter 添加"
            />
            <button
              type="button"
              onClick={addFriend}
              disabled={!friendInput.trim()}
              className="btn-secondary text-sm px-4 py-2"
              onMouseDown={createRipple}
            >
              添加
            </button>
          </div>
        </div>

        {/* Messages */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">消息列表</label>
            <button
              type="button"
              onClick={addMessage}
              className="text-sm text-orange-600 hover:text-orange-700 transition font-medium"
            >
              + 添加消息
            </button>
          </div>
          <div className="space-y-2">
            {config.messages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={msg.type}
                  onChange={(e) => updateMessage(i, 'type', e.target.value)}
                  className="glass-input px-3 py-2 text-sm bg-white/40"
                >
                  <option value="sticker">贴纸 (sticker)</option>
                  <option value="text">文字 (text)</option>
                  <option value="image">图片 (image)</option>
                </select>
                <input
                  type="text"
                  value={msg.value}
                  onChange={(e) => updateMessage(i, 'value', e.target.value)}
                  className="glass-input flex-1 px-3 py-2 text-sm"
                  placeholder={msg.type === 'sticker' ? '贴纸名称' : msg.type === 'text' ? '消息内容' : '图片路径'}
                />
                {msg.type === 'sticker' && (
                  <span className="text-xs text-gray-400 whitespace-nowrap">需在 stickers 中定义</span>
                )}
                <button
                  type="button"
                  onClick={() => removeMessage(i)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stickers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Stickers（原生表情映射）</label>
            <button
              type="button"
              onClick={() => {
                setStickersText(JSON.stringify(config.stickers, null, 2))
                setShowStickersEditor(!showStickersEditor)
              }}
              className="text-sm text-orange-600 hover:text-orange-700 transition font-medium"
            >
              {showStickersEditor ? '收起' : 'JSON 编辑'}
            </button>
          </div>
          {showStickersEditor ? (
            <div className="space-y-2">
              <textarea
                value={stickersText}
                onChange={(e) => setStickersText(e.target.value)}
                rows={6}
                className="glass-input w-full px-3 py-2 text-sm font-mono"
              />
              <button
              type="button"
              onClick={applyStickers}
              className="btn-secondary text-sm px-3 py-1.5"
              onMouseDown={createRipple}
            >
                应用
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-400 bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              {Object.keys(config.stickers).length > 0
                ? `已定义 ${Object.keys(config.stickers).length} 个贴纸`
                : '未定义贴纸'}
            </div>
          )}
        </div>

        {/* Send Settings */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">发送设置</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">最小间隔（秒）</label>
              <input
                type="number"
                min={1}
                value={config.send_interval_seconds.min}
                onChange={(e) => updateField('send_interval_seconds.min', Number(e.target.value))}
                className="glass-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最大间隔（秒）</label>
              <input
                type="number"
                min={1}
                value={config.send_interval_seconds.max}
                onChange={(e) => updateField('send_interval_seconds.max', Number(e.target.value))}
                className="glass-input w-full px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.continue_on_error}
              onChange={(e) => updateField('continue_on_error', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 accent-orange-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">出错继续</span>
              <p className="text-xs text-gray-400">发送失败时继续执行，不中断</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.prevent_duplicates}
              onChange={(e) => updateField('prevent_duplicates', e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 accent-orange-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition">防重复发送</span>
              <p className="text-xs text-gray-400">记录发送历史，避免重复发送</p>
            </div>
          </label>
        </div>

        {/* Advanced */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">高级设置</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">目标打开重试次数</label>
              <input
                type="number"
                min={0}
                value={config.target_open_retries}
                onChange={(e) => updateField('target_open_retries', Number(e.target.value))}
                className="glass-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">目标打开超时（秒）</label>
              <input
                type="number"
                min={1}
                value={config.target_open_timeout_seconds}
                onChange={(e) => updateField('target_open_timeout_seconds', Number(e.target.value))}
                className="glass-input w-full px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2.5 text-sm"
            onMouseDown={createRipple}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                保存中...
              </span>
            ) : '保存 Config 到 GitHub Secrets'}
          </button>
        </div>
      </form>
    </div>
  )
}