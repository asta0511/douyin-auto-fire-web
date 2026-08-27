'use client'

import { useState, useRef } from 'react'

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

export default function ConfigEditor({ onSuccess, onError }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [friendInput, setFriendInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showStickersEditor, setShowStickersEditor] = useState(false)
  const [stickersText, setStickersText] = useState(JSON.stringify(DEFAULT_CONFIG.stickers, null, 2))
  const [importMode, setImportMode] = useState(false)
  const [importText, setImportText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

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
      applyImportedConfig(parsed)
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
        applyImportedConfig(parsed)
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

  async function handleSubmit(e) {
    e.preventDefault()
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

      onSuccess()
    } catch {
      onError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">更新 DOUYIN_CONFIG</h2>
        <button
          type="button"
          onClick={() => setImportMode(!importMode)}
          className="text-sm px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
        >
          {importMode ? '取消导入' : '导入配置'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        通过表单编辑配置，保存后会自动同步到 GitHub Secrets。
      </p>

      {/* Import Section */}
      {importMode && (
        <div className="mb-6 p-4 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">导入配置</h3>

          {/* Upload Area */}
          <div
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition mb-3 ${
              dragOver
                ? 'border-orange-400 bg-orange-100'
                : 'border-gray-300 hover:border-orange-300 bg-white'
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
            <div className="flex-1 h-px bg-gray-200" />
            <span>或者粘贴 JSON</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Paste Area */}
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm font-mono mb-3"
            placeholder='粘贴 config.json 内容...&#10;{&#10;  "task_id": "daily-streak",&#10;  "friends": [...],&#10;  ...&#10;}'
          />
          <button
            type="button"
            onClick={handleImportPaste}
            disabled={!importText.trim()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50 transition"
          >
            解析并导入
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务 ID</label>
            <input
              type="text"
              value={config.task_id}
              onChange={(e) => updateField('task_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">时区</label>
            <input
              type="text"
              value={config.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Friends */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            好友列表（{config.friends.length} 人）
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {config.friends.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-sm border border-orange-200"
              >
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
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              placeholder="输入好友昵称，按 Enter 添加"
            />
            <button
              type="button"
              onClick={addFriend}
              disabled={!friendInput.trim()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm transition"
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
              className="text-sm text-orange-500 hover:text-orange-600 transition"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white"
                >
                  <option value="sticker">贴纸 (sticker)</option>
                  <option value="text">文字 (text)</option>
                  <option value="image">图片 (image)</option>
                </select>
                <input
                  type="text"
                  value={msg.value}
                  onChange={(e) => updateMessage(i, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                  placeholder={msg.type === 'sticker' ? '贴纸名称' : msg.type === 'text' ? '消息内容' : '图片路径'}
                />
                {msg.type === 'sticker' && (
                  <span className="text-xs text-gray-400">需在 stickers 中定义</span>
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
              className="text-sm text-orange-500 hover:text-orange-600 transition"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm font-mono"
              />
              <button
                type="button"
                onClick={applyStickers}
                className="text-sm px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
              >
                应用
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3 border">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">最大间隔（秒）</label>
              <input
                type="number"
                min={1}
                value={config.send_interval_seconds.max}
                onChange={(e) => updateField('send_interval_seconds.max', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.continue_on_error}
              onChange={(e) => updateField('continue_on_error', e.target.checked)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">出错继续</span>
              <p className="text-xs text-gray-400">发送失败时继续执行，不中断</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.prevent_duplicates}
              onChange={(e) => updateField('prevent_duplicates', e.target.checked)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">防重复发送</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">目标打开超时（秒）</label>
              <input
                type="number"
                min={1}
                value={config.target_open_timeout_seconds}
                onChange={(e) => updateField('target_open_timeout_seconds', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg font-medium hover:from-orange-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {loading ? '保存中...' : '保存 Config 到 GitHub Secrets'}
          </button>
        </div>
      </form>
    </div>
  )
}