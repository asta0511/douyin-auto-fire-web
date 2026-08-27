import { randomBytes } from 'crypto'

const SESSION_COOKIE = 'session_token'
const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

function generateToken() {
  return randomBytes(32).toString('hex')
}

export function verifyPassword(input) {
  const expected = process.env.PASSWORD
  if (!expected) return false
  return input === expected
}

export function createSession() {
  const token = generateToken()
  const expires = new Date(Date.now() + SESSION_EXPIRY)
  return { token, expires }
}

export function requireAuth(request) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionToken) {
    throw new Error('Unauthorized')
  }
  return sessionToken
}