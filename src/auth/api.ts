import type { ProgressState } from '../domain/types'

export interface AuthUser {
  username: string
  /** true quando a sessão é local (sem servidor): o progresso fica guardado neste browser. */
  local?: boolean
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

const apiRoot = `${import.meta.env.BASE_URL}api`
const LOCAL_USER_KEY = 'fsiap.local.user'
const LOCAL_PROGRESS_KEY = 'fsiap.local.progress'

function readLocal<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    return null
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new ApiError('Não foi possível guardar neste browser (armazenamento cheio ou bloqueado).', 507)
  }
}

export function localSession(): AuthUser | null {
  const stored = readLocal<{ username?: string }>(LOCAL_USER_KEY)
  return stored?.username ? { username: stored.username, local: true } : null
}

/** Inicia uma sessão sem servidor. O progresso fica apenas neste browser. */
export function startLocalSession(username = 'Estudo local'): AuthUser {
  const name = username.trim().slice(0, 32) || 'Estudo local'
  writeLocal(LOCAL_USER_KEY, { username: name })
  return { username: name, local: true }
}

function endLocalSession() {
  try { window.localStorage.removeItem(LOCAL_USER_KEY) } catch { /* nada a limpar */ }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiRoot}${path}`, {
    ...init,
    credentials: 'include',
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  })
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(payload?.error ?? 'Não foi possível contactar o servidor.', response.status)
  return payload as T
}

export async function getSession() {
  const local = localSession()
  if (local) return local
  try {
    return (await request<{ user: AuthUser }>('/session')).user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

export async function loginRequest(username: string, password: string) {
  return (await request<{ user: AuthUser }>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })).user
}

export async function registerRequest(username: string, password: string) {
  return (await request<{ user: AuthUser }>('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })).user
}

export async function logoutRequest() {
  if (localSession()) {
    endLocalSession()
    return
  }
  await request<null>('/logout', { method: 'POST' })
}

export async function loadProgress() {
  if (localSession()) return readLocal<ProgressState>(LOCAL_PROGRESS_KEY)
  return (await request<{ progress: ProgressState | null }>('/progress')).progress
}

export async function saveProgress(progress: ProgressState) {
  if (localSession()) {
    writeLocal(LOCAL_PROGRESS_KEY, progress)
    return
  }
  await request<{ saved: true }>('/progress', {
    method: 'PUT',
    body: JSON.stringify({ progress }),
  })
}
