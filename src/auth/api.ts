import type { ProgressState } from '../domain/types'

export interface AuthUser {
  username: string
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

const apiRoot = `${import.meta.env.BASE_URL}api`

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
  await request<null>('/logout', { method: 'POST' })
}

export async function loadProgress() {
  return (await request<{ progress: ProgressState | null }>('/progress')).progress
}

export async function saveProgress(progress: ProgressState) {
  await request<{ saved: true }>('/progress', {
    method: 'PUT',
    body: JSON.stringify({ progress }),
  })
}
