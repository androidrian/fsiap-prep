import { Activity, Atom, BookOpenCheck, CalendarRange, ChartNoAxesCombined, Dumbbell, FileCheck2, FlaskConical, Gauge, ListX, Menu, Sigma, TimerReset, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

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
        <div className="sidebar-note">
          <span>Base histórica</span>
          <strong>30 templates · 26 cenários</strong>
          <p>Métricas calculadas apenas dos documentos fornecidos.</p>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
