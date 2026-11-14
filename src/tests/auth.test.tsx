import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchMock = vi.fn()

beforeEach(() => {
  window.localStorage.clear()
  fetchMock.mockReset()
  fetchMock.mockRejectedValue(new TypeError('network down'))
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

async function renderAuth() {
  const { AuthProvider, useAuth } = await import('../auth/AuthContext')
  const { AuthPage } = await import('../pages/AuthPage')
  function Gate() {
    const { user, loading } = useAuth()
    if (loading) return <p>a carregar</p>
    return user ? <p>sessão de {user.username}{user.local ? ' (local)' : ''}</p> : <AuthPage />
  }
  render(<AuthProvider><Gate /></AuthProvider>)
}

describe('sign-in page', () => {
  it('offers accounts and the local mode, and says when the account server is down', async () => {
    await renderAuth()
    expect(await screen.findByRole('button', { name: /Estudar neste computador/ })).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/servidor de contas não está a responder/)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('starts a local session that survives a reload without calling the server', async () => {
    await renderAuth()
    fireEvent.click(await screen.findByRole('button', { name: /Estudar neste computador/ }))
    expect(screen.getByText('sessão de Estudo local (local)')).toBeInTheDocument()
    cleanup()
    vi.resetModules()
    fetchMock.mockClear()
    await renderAuth()
    await waitFor(() => expect(screen.getByText('sessão de Estudo local (local)')).toBeInTheDocument())
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('hides accounts and never calls the API in a static build', async () => {
    vi.stubEnv('VITE_LOCAL_ONLY', 'true')
    await renderAuth()
    expect(await screen.findByRole('button', { name: /Estudar neste computador/ })).toBeInTheDocument()
    expect(screen.queryByText('Username')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText(/Esta versão não tem contas/)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
