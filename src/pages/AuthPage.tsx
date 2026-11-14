import { ArrowRight, Atom, Eye, EyeOff, HardDrive, ShieldCheck, WifiOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { ApiError, localOnly } from '../auth/api'

export function AuthPage() {
  const { login, register, continueLocally, serverAvailable } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await (mode === 'login' ? login(username, password) : register(username, password))
    } catch (caught) {
      setError(caught instanceof ApiError && caught.status < 500 ? caught.message : 'O servidor de contas não respondeu. Podes estudar neste computador sem conta.')
    } finally {
      setBusy(false)
    }
  }

  const switchMode = () => {
    setMode((current) => current === 'login' ? 'register' : 'login')
    setPassword('')
    setError('')
  }

  return (
    <main className="auth-page">
      <section className="auth-surface enter-up">
        <div className="auth-brand"><Atom size={27} /><span>FSIAP</span><small>PREP</small></div>
        <p className="eyebrow">Fichas resolvidas · laboratório · teoria</p>
        <h1>{mode === 'login' ? 'Continua exatamente onde paraste.' : 'Um plano que começa contigo.'}</h1>
        <p className="auth-lede">{localOnly ? 'Esta versão não tem contas: o teu progresso fica guardado neste browser.' : 'Entra com a tua conta para sincronizar o progresso, ou estuda já neste computador sem conta.'}</p>

        {!serverAvailable && !localOnly && <p className="auth-offline" role="status"><WifiOff size={16} /> O servidor de contas não está a responder. O modo local funciona na mesma.</p>}

        <button type="button" className="button button-dark auth-local" onClick={() => continueLocally()}>
          <HardDrive size={17} /> Estudar neste computador <ArrowRight size={17} />
        </button>
        <p className="auth-local-note">Sem conta nem password. O progresso fica guardado neste browser.</p>

        {!localOnly && <>
        <div className="auth-divider"><span>ou com conta</span></div>

        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Username</span>
            <input autoComplete="username" autoCapitalize="none" minLength={3} maxLength={32} required value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <div className="password-input">
              <input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'A validar…' : mode === 'login' ? 'Entrar' : 'Criar conta'} <ArrowRight size={17} /></button>
        </form>

        <button className="auth-switch" type="button" onClick={switchMode}>{mode === 'login' ? 'Ainda não tens conta? Criar conta' : 'Já tens conta? Entrar'}</button>
        <div className="auth-security"><ShieldCheck size={16} /><span>{mode === 'register' ? 'Sem email: guarda a password, porque não existe recuperação automática.' : 'Com conta, a sessão e o progresso ficam protegidos no servidor.'}</span></div>
        </>}
      </section>
    </main>
  )
}
