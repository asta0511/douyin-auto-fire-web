const GITHUB_API = 'https://api.github.com'

function getHeaders() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN not configured')
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'douyin-auto-fire-web',
  }
}

function getRepo() {
  const repo = process.env.GITHUB_REPO
  if (!repo) throw new Error('GITHUB_REPO not configured')
  return repo
}

export async function getSecretStatus() {
  const repo = getRepo()
  const secrets = ['DOUYIN_COOKIE', 'DOUYIN_CONFIG']

  const results = await Promise.allSettled(
    secrets.map(async (name) => {
      const res = await fetch(
        `${GITHUB_API}/repos/${repo}/actions/secrets/${name}`,
        { headers: getHeaders() }
      )
      if (res.status === 404) {
        return { name, exists: false, updated_at: null }
      }
      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Failed to get ${name}: ${err}`)
      }
      const data = await res.json()
      return { name, exists: true, updated_at: data.updated_at }
    })
  )

  return results.map((r) =>
    r.status === 'fulfilled' ? r.value : { name: 'unknown', exists: false, updated_at: null, error: r.reason.message }
  )
}

export async function getPublicKey() {
  const repo = getRepo()
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/actions/secrets/public-key`,
    { headers: getHeaders() }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get public key: ${err}`)
  }
  return res.json()
}

export async function encryptSecret(publicKey, secretValue) {
  const sodium = require('tweetsodium')
  const keyBytes = Buffer.from(publicKey, 'base64')
  const valueBytes = Buffer.from(secretValue)
  const encryptedBytes = sodium.seal(valueBytes, keyBytes)
  return Buffer.from(encryptedBytes).toString('base64')
}

export async function updateSecret(name, value) {
  const repo = getRepo()
  const { key, key_id } = await getPublicKey()
  const encryptedValue = await encryptSecret(key, value)

  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/actions/secrets/${name}`,
    {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        encrypted_value: encryptedValue,
        key_id,
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update ${name}: ${err}`)
  }

  return true
}