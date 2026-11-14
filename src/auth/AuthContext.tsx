/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getSession, loginRequest, logoutRequest, registerRequest, startLocalSession, type AuthUser } from './api'

interface AuthValue {
  user: AuthUser | null
  loading: boolean
  /** false quando o servidor de contas não respondeu ao arrancar (só o modo local está disponível). */
  serverAvailable: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  /** Entra sem conta: o progresso fica guardado neste browser. */
  continueLocally: (username?: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [serverAvailable, setServerAvailable] = useState(true)

  useEffect(() => {
    let active = true
    getSession()
      .then((sessionUser) => { if (active) setUser(sessionUser) })
      .catch(() => { if (active) { setUser(null); setServerAvailable(false) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const value = useMemo<AuthValue>(() => ({
    user,
    loading,
    serverAvailable,
    login: async (username, password) => setUser(await loginRequest(username, password)),
    register: async (username, password) => setUser(await registerRequest(username, password)),
    continueLocally: (username) => setUser(startLocalSession(username)),
    logout: async () => {
      await logoutRequest()
      setUser(null)
    },
  }), [loading, serverAvailable, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
