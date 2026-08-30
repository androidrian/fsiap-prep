import { ArrowRight, Atom, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../auth/api'

export function AuthPage() {
  const { login, register } = useAuth()
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
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível contactar o servidor.')
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
        <p className="eyebrow">Progresso pessoal e sincronizado</p>
        <h1>{mode === 'login' ? 'Continua exatamente onde paraste.' : 'Um plano que começa contigo.'}</h1>
        <p className="auth-lede">Cada pessoa tem o seu diagnóstico, domínio, simulados e caderno de erros.</p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Username</span>
            <input autoFocus autoComplete="username" autoCapitalize="none" minLength={3} maxLength={32} required value={username} onChange={(event) => setUsername(event.target.value)} />
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
        <div className="auth-security"><ShieldCheck size={16} /><span>{mode === 'register' ? 'Sem email: guarda a password, porque não existe recuperação automática.' : 'A sessão e o progresso ficam protegidos no servidor.'}</span></div>
      </section>
    </main>
  )
}
