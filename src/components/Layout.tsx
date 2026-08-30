import { Activity, Atom, BookOpenCheck, CalendarRange, ChartNoAxesCombined, Cloud, Dumbbell, FileCheck2, FlaskConical, Gauge, ListX, LogOut, Menu, Sigma, TimerReset, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useProgress } from '../storage/ProgressContext'

const links = [
  { to: '/', label: 'Visão geral', icon: Gauge },
  { to: '/study', label: 'Estudar', icon: BookOpenCheck },
  { to: '/practice', label: 'Banco de treino', icon: Dumbbell },
  { to: '/diagnostic', label: 'Diagnóstico', icon: Activity },
  { to: '/analysis', label: 'Mapa do exame', icon: ChartNoAxesCombined },
  { to: '/exam-exercises', label: 'Exercícios de exame', icon: FileCheck2 },
  { to: '/simulators', label: 'Simuladores', icon: FlaskConical },
  { to: '/formulas', label: 'Formulário aplicado', icon: Sigma },
  { to: '/study-plan', label: 'Plano de estudo', icon: CalendarRange },
  { to: '/mock-exam', label: 'Simulado', icon: TimerReset },
  { to: '/mistakes', label: 'Caderno de erros', icon: ListX },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [endingSession, setEndingSession] = useState(false)
  const { user, logout } = useAuth()
  const { flush, syncStatus } = useProgress()
  const syncLabel = { loading: 'A carregar', saving: 'A guardar', saved: 'Sincronizado', error: 'Erro ao guardar' }[syncStatus]

  const endSession = async () => {
    setEndingSession(true)
    try {
      await flush().catch(() => undefined)
      await logout()
    } finally {
      setEndingSession(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <NavLink to="/" className="brand"><Atom size={22} /><span>FSIAP</span><small>PREP</small></NavLink>
        <button className="icon-button" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu size={21} /></button>
      </header>
      {open && <button className="scrim" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <NavLink to="/" className="brand" onClick={() => setOpen(false)}><Atom size={24} /><span>FSIAP</span><small>PREP</small></NavLink>
          <button className="icon-button mobile-only" aria-label="Fechar menu" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="main-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-account">
            <UserRound size={16} />
            <div><strong>{user?.username}</strong><span className={syncStatus === 'error' ? 'sync-error' : ''}><Cloud size={11} /> {syncLabel}</span></div>
            <button type="button" aria-label="Terminar sessão" title="Terminar sessão" disabled={endingSession} onClick={() => void endSession()}><LogOut size={16} /></button>
          </div>
          <div className="sidebar-note">
            <span>Base histórica</span>
            <strong>30 templates · 26 cenários</strong>
            <p>Métricas calculadas apenas dos documentos fornecidos.</p>
          </div>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
