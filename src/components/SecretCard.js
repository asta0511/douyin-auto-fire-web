export default function SecretCard({ secret }) {
  const statusColor = secret.exists ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
  const statusText = secret.exists ? '已配置' : '未配置'

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
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
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${secret.exists ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <h3 className="font-semibold text-gray-900">{secretNames[secret.name] || secret.name}</h3>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
          {statusText}
        </span>
      </div>
      <div className="text-sm text-gray-500">
        {secret.exists ? (
          <>上次更新：{formatDate(secret.updated_at)}</>
        ) : (
          <>尚未配置，请在对应标签页中设置</>
        )}
      </div>
      {secret.error && (
        <div className="mt-2 text-xs text-red-500">{secret.error}</div>
      )}
    </div>
  )
}