import { Atom, Calculator, Cloud, HardDrive, LogOut, Menu, Search, UserRound, X } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useProgress } from '../storage/ProgressContext'
import { navigationGroups } from './navigation'
import { onOpenTools, type ToolTab } from './toolsBus'

// A pesquisa indexa todos os exercícios e cenários: só se carrega quando é aberta.
const SearchPalette = lazy(() => import('./SearchPalette').then((module) => ({ default: module.SearchPalette })))
const ToolsDrawer = lazy(() => import('./ToolsDrawer').then((module) => ({ default: module.ToolsDrawer })))

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [tools, setTools] = useState(false)
  const [toolTab, setToolTab] = useState<ToolTab>('calculator')
  const [endingSession, setEndingSession] = useState(false)
  const { user, logout } = useAuth()
  const { state, flush, syncStatus } = useProgress()
  const location = useLocation()
  const syncLabel = user?.local
    ? ({ loading: 'A carregar', saving: 'A guardar', saved: 'Guardado neste browser', error: 'Erro ao guardar' })[syncStatus]
    : ({ loading: 'A carregar', saving: 'A guardar', saved: 'Sincronizado', error: 'Erro ao guardar' })[syncStatus]
  const done = Object.values(state.study).filter((entry) => entry.status === 'done').length
  const toReview = Object.values(state.study).filter((entry) => entry.status === 'review' || entry.status === 'doubt').length

  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => onOpenTools((tab) => { setToolTab(tab); setTools(true) }), [])

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearching(true)
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])

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
    <div className={`app-shell ${tools ? 'with-tools' : ''}`}>
      <a className="skip-link" href="#conteudo">Saltar para o conteúdo</a>
      <header className="mobile-header">
        <NavLink to="/" className="brand"><Atom size={22} /><span>FSIAP</span><small>PREP</small></NavLink>
        <div className="mobile-actions">
          <button className="icon-button" aria-label="Pesquisar" onClick={() => setSearching(true)}><Search size={20} /></button>
          <button className="icon-button" aria-label="Abrir ferramentas" onClick={() => setTools(true)}><Calculator size={20} /></button>
          <button className="icon-button" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={21} /></button>
        </div>
      </header>
      {open && <button className="scrim" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <NavLink to="/" className="brand"><Atom size={24} /><span>FSIAP</span><small>PREP</small></NavLink>
          <button className="icon-button mobile-only" aria-label="Fechar menu" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <button type="button" className="sidebar-search" onClick={() => setSearching(true)}><Search size={15} /><span>Pesquisar…</span><kbd>Ctrl K</kbd></button>
        <nav className="main-nav" aria-label="Navegação principal">
          {navigationGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <p>{group.label}</p>
              {group.links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === '/'}>
                  <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button type="button" className="sidebar-tools" onClick={() => setTools((value) => !value)} aria-pressed={tools}><Calculator size={16} /><span>Calculadora</span></button>
          <div className="sidebar-account">
            <UserRound size={16} />
            <div><strong>{user?.username}</strong><span className={syncStatus === 'error' ? 'sync-error' : ''}>{user?.local ? <HardDrive size={11} /> : <Cloud size={11} />} {syncLabel}</span></div>
            <button type="button" aria-label="Terminar sessão" title="Terminar sessão" disabled={endingSession} onClick={() => void endSession()}><LogOut size={16} /></button>
          </div>
          <div className="sidebar-note">
            <span>O teu progresso</span>
            <strong>{done} {done === 1 ? 'exercício feito' : 'exercícios feitos'}</strong>
            <p>{toReview > 0 ? `${toReview} para rever ou com dúvida.` : 'Marca os exercícios à medida que os resolves.'}</p>
          </div>
        </div>
      </aside>
      <main className="main-content" id="conteudo" tabIndex={-1}>{children}</main>
      <Suspense fallback={null}>
        {tools && <ToolsDrawer open tab={toolTab} onTab={setToolTab} onClose={() => setTools(false)} />}
        {searching && <SearchPalette open onClose={() => setSearching(false)} />}
      </Suspense>
    </div>
  )
}
