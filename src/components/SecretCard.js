export default function SecretCard({ secret }) {
  const statusColor = secret.exists ? 'bg-green-400' : 'bg-gray-300'
  const statusText = secret.exists ? '已配置' : '未配置'

  const formatDate = (dateStr) => {
    if (!dateStr) return '暂无'
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const secretNames = {
    DOUYIN_COOKIE: 'DOUYIN_COOKIE',
    DOUYIN_CONFIG: 'DOUYIN_CONFIG',
  }

  return (
    <div className="glass-card glass-lens px-6 py-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-sm ${secret.exists ? 'animate-pulse' : ''}`}
               style={secret.exists ? { animationDuration: '3s', boxShadow: '0 0 6px rgba(74, 222, 128, 0.4)' } : {}} />
          <h3 className="font-semibold text-gray-900">{secretNames[secret.name] || secret.name}</h3>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${
          secret.exists
            ? 'bg-green-100/60 text-green-700 border border-green-200/50'
            : 'bg-gray-100/60 text-gray-500 border border-gray-200/50'
        }`}>
          {statusText}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-gray-500">
          上次更新：<span className="text-gray-700 font-medium">{formatDate(secret.updated_at)}</span>
        </span>
      </div>
      {secret.error && (
        <div className="mt-2 text-xs text-red-500 bg-red-50/50 rounded-lg px-3 py-1.5 border border-red-200/50">
          {secret.error}
        </div>
      )}
    </div>
  )
}