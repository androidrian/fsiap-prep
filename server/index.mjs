import { createHash, randomBytes } from 'node:crypto'
import { createServer } from 'node:http'
import pg from 'pg'
import { hashPassword, normalizeUsername, validateCredentials, verifyPassword } from './auth.mjs'

const { Pool } = pg
const port = Number(process.env.PORT ?? 4180)
const cookiePath = process.env.COOKIE_PATH ?? '/fsiap-prep/'
const secureCookie = process.env.COOKIE_SECURE !== 'false'
const publicOrigin = process.env.PUBLIC_ORIGIN ?? ''
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000
const maximumBodyBytes = 750_000
const loginAttempts = new Map()
const pool = new Pool({ max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 })
const fallbackPasswordHash = hashPassword(randomBytes(24).toString('base64url'))
let lastSessionCleanup = 0

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    username_key TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    progress_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
`)

function json(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  })
  response.end(JSON.stringify(payload))
}

function empty(response, status, headers = {}) {
  response.writeHead(status, { 'Cache-Control': 'no-store', ...headers })
  response.end()
}

async function readJson(request) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > maximumBodyBytes) throw Object.assign(new Error('Pedido demasiado grande.'), { status: 413 })
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    throw Object.assign(new Error('JSON inválido.'), { status: 400 })
  }
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie ?? '').split(';').map((entry) => entry.trim().split('=').map(decodeURIComponent)).filter(([key]) => key))
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

function sessionCookie(token, maxAge = Math.floor(sessionLifetimeMs / 1000)) {
  return [
    `fsiap_session=${encodeURIComponent(token)}`,
    `Path=${cookiePath}`,
    'HttpOnly',
    'SameSite=Lax',
    secureCookie ? 'Secure' : '',
    `Max-Age=${maxAge}`,
  ].filter(Boolean).join('; ')
}

async function createSession(userId, database = pool) {
  const token = randomBytes(32).toString('base64url')
  await database.query(
    'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash(token), new Date(Date.now() + sessionLifetimeMs)],
  )
  return token
}

async function authenticatedUser(request) {
  const token = parseCookies(request).fsiap_session
  if (!token) return undefined
  const result = await pool.query(`
    SELECT users.id, users.username
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = $1 AND sessions.expires_at > NOW()
  `, [tokenHash(token)])
  return result.rows[0]
}

function requireSameOrigin(request) {
  const origin = request.headers.origin
  return !publicOrigin || !origin || origin === publicOrigin
}

function clientAddress(request) {
  return String(request.headers['x-forwarded-for'] ?? request.socket.remoteAddress ?? 'unknown').split(',')[0].trim()
}

function isRateLimited(request, usernameKey) {
  const key = `${clientAddress(request)}:${usernameKey}`
  const now = Date.now()
  const current = loginAttempts.get(key)
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60_000 })
    return false
  }
  current.count += 1
  return current.count > 10
}

function clearRateLimit(request, usernameKey) {
  loginAttempts.delete(`${clientAddress(request)}:${usernameKey}`)
}

const server = createServer(async (request, response) => {
  const method = request.method ?? 'GET'
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname.replace(/\/+$/, '') || '/'

  try {
    if (Date.now() - lastSessionCleanup > 60 * 60_000) {
      lastSessionCleanup = Date.now()
      await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()')
    }

    if (method === 'GET' && pathname === '/health') {
      await pool.query('SELECT 1')
      return json(response, 200, { status: 'ok' })
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !requireSameOrigin(request)) {
      return json(response, 403, { error: 'Origem não permitida.' })
    }

    if (method === 'POST' && pathname === '/register') {
      const body = await readJson(request)
      const username = typeof body.username === 'string' ? body.username : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const validated = validateCredentials(username, password)
      if (validated.error) return json(response, 400, { error: validated.error })
      if (isRateLimited(request, 'new-account')) return json(response, 429, { error: 'Demasiadas contas criadas. Tenta novamente dentro de 15 minutos.' })

      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const existing = await client.query('SELECT 1 FROM users WHERE username_key = $1', [validated.usernameKey])
        if (existing.rowCount) {
          await client.query('ROLLBACK')
          return json(response, 409, { error: 'Esse username já está a ser utilizado.' })
        }
        const inserted = await client.query(
          'INSERT INTO users (username, username_key, password_hash) VALUES ($1, $2, $3) RETURNING id',
          [validated.username, validated.usernameKey, hashPassword(password)],
        )
        const token = await createSession(inserted.rows[0].id, client)
        await client.query('COMMIT')
        return json(response, 201, { user: { username: validated.username } }, { 'Set-Cookie': sessionCookie(token) })
      } catch (error) {
        await client.query('ROLLBACK')
        if (error.code === '23505') return json(response, 409, { error: 'Esse username já está a ser utilizado.' })
        throw error
      } finally {
        client.release()
      }
    }

    if (method === 'POST' && pathname === '/login') {
      const body = await readJson(request)
      const username = typeof body.username === 'string' ? body.username : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const usernameKey = normalizeUsername(username)
      if (isRateLimited(request, usernameKey)) return json(response, 429, { error: 'Demasiadas tentativas. Tenta novamente dentro de 15 minutos.' })

      const result = await pool.query('SELECT id, username, password_hash FROM users WHERE username_key = $1', [usernameKey])
      const user = result.rows[0]
      const passwordIsValid = verifyPassword(password, user?.password_hash ?? fallbackPasswordHash)
      if (!user || !passwordIsValid) {
        return json(response, 401, { error: 'Username ou password incorretos.' })
      }

      clearRateLimit(request, usernameKey)
      const token = await createSession(user.id)
      return json(response, 200, { user: { username: user.username } }, { 'Set-Cookie': sessionCookie(token) })
    }

    if (method === 'POST' && pathname === '/logout') {
      const token = parseCookies(request).fsiap_session
      if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash(token)])
      return empty(response, 204, { 'Set-Cookie': sessionCookie('', 0) })
    }

    const user = await authenticatedUser(request)
    if (!user) return json(response, 401, { error: 'Sessão necessária.' })

    if (method === 'GET' && pathname === '/session') {
      return json(response, 200, { user: { username: user.username } })
    }

    if (method === 'GET' && pathname === '/progress') {
      const result = await pool.query('SELECT progress_json FROM users WHERE id = $1', [user.id])
      return json(response, 200, { progress: result.rows[0]?.progress_json ?? null })
    }

    if (method === 'PUT' && pathname === '/progress') {
      const body = await readJson(request)
      if (!body.progress || typeof body.progress !== 'object' || Array.isArray(body.progress)) {
        return json(response, 400, { error: 'Estado de progresso inválido.' })
      }
      const serialized = JSON.stringify(body.progress)
      if (Buffer.byteLength(serialized) > 700_000) return json(response, 413, { error: 'Estado de progresso demasiado grande.' })
      await pool.query('UPDATE users SET progress_json = $1::jsonb, updated_at = NOW() WHERE id = $2', [serialized, user.id])
      return json(response, 200, { saved: true })
    }

    return json(response, 404, { error: 'Rota não encontrada.' })
  } catch (error) {
    console.error(error)
    return json(response, error.status ?? 500, { error: error.status ? error.message : 'Erro interno do servidor.' })
  }
})

server.listen(port, '127.0.0.1', () => console.log(`FSIAP Prep API listening on 127.0.0.1:${port}`))

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(async () => {
    await pool.end()
    process.exit(0)
  }))
}
