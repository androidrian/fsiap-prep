import { ArrowRight, CalendarDays, CalendarRange, ChevronRight, Clock3, Crosshair, Dices, FlaskConical, Settings2, Sigma, Target, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { families } from '../data/analysis'
import { calculateCoverage } from '../domain/analytics/coverage'
import { currentConfidence } from '../domain/mastery/mastery'
import { daysUntilExam } from '../domain/study/examDate'
import { rankFamilies, recommendNext } from '../domain/study/studyEngine'
import { useProgress } from '../storage/ProgressContext'
import { StatusDot } from '../components/StatusDot'

export function DashboardPage() {
  const { state, dispatch } = useProgress()
  const coverage = calculateCoverage(state)
  const next = recommendNext(state)
  const critical = rankFamilies(state).slice(0, 3).map(({ id }) => families.find((family) => family.id === id)!)
  const lastMock = state.mockResults.at(-1)
  const activityLabel = { learn: 'compreender', guided: 'prática guiada', practice: 'prática autónoma', review: 'revisão' }[next.activity]

  return (
    <div className="page dashboard-page">
      <section className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">Plano adaptativo · {daysUntilExam(state.settings.examDate)} dias até ao exame</p>
          <h1>O que aumenta mais<br />a tua nota agora?</h1>
        </div>
        <StatusDot status={coverage.status} />
      </section>

      {!state.diagnosed && (
        <section className="diagnostic-callout enter-up">
          <div><span>Primeiro passo</span><h2>Não vamos assumir que começas do zero.</h2><p>Seis perguntas representativas calibram o plano em cerca de 8 minutos.</p></div>
          <Link className="button button-dark" to="/diagnostic">Fazer diagnóstico <ArrowRight size={17} /></Link>
        </section>
      )}

      <section className="scoreboard enter-up delay-1">
        <div className="coverage-figure">
          <span className="section-label">Cobertura histórica estimada</span>
          <div className="big-score">
            <strong>{state.diagnosed ? coverage.effective.toFixed(1) : '—'}</strong><span>/20</span>
          </div>
          <p>{state.diagnosed ? 'Componente prática normalizada; não é uma previsão de nota.' : 'Disponível depois do diagnóstico.'}</p>
        </div>
        <div className="coverage-track-wrap">
          <div className="coverage-labels"><span>agora</span><span>aprovação {state.settings.passTarget}</span><span>meta {state.settings.preparationTarget}</span></div>
          <div className="coverage-track">
            <div className="coverage-fill" style={{ width: `${Math.min(100, coverage.effective / 20 * 100)}%` }} />
            <i className="pass-mark" style={{ left: `${state.settings.passTarget / 20 * 100}%` }} />
            <i className="target-mark" style={{ left: `${state.settings.preparationTarget / 20 * 100}%` }} />
          </div>
          <div className="coverage-breakdown">
            <div><span>Consolidado</span><strong>{coverage.mastered.toFixed(1)} val.</strong></div>
            <div><span>Em aprendizagem</span><strong>{coverage.learning.toFixed(1)} val.</strong></div>
            <div><span>Por estudar</span><strong>{coverage.notStudied.toFixed(1)} val.</strong></div>
          </div>
        </div>
      </section>

      <section className="next-action enter-up delay-2">
        <div className="action-index">01</div>
        <div className="action-copy">
          <span className="section-label">Próxima melhor ação</span>
          <h2>{state.diagnosed ? next.family.name : 'Completar o diagnóstico inicial'}</h2>
          <p>{state.diagnosed ? next.reasons.join(' · ') : 'O motor precisa de medir o ponto de partida antes de ordenar o estudo.'}</p>
          <div className="action-meta"><span><Clock3 size={15} /> {state.diagnosed ? `~${next.minutes} min` : '~8 min'}</span><span><Crosshair size={15} /> {state.diagnosed ? activityLabel : 'calibração'}</span></div>
        </div>
        <Link className="button button-primary" to={state.diagnosed ? '/study' : '/diagnostic'}>{state.diagnosed ? 'Continuar a estudar' : 'Começar'} <ArrowRight size={17} /></Link>
      </section>

      <section className="dashboard-grid">
        <div className="critical-list">
          <div className="section-heading-row"><div><span className="section-label">Pontos críticos</span><h2>Maior retorno por minuto</h2></div><Link to="/analysis">Ver mapa <ChevronRight size={15} /></Link></div>
          {critical.map((family, index) => (
            <div className="critical-row" key={family.id}>
              <span className="rank">0{index + 1}</span>
              <div><strong>{family.shortName}</strong><small>{family.examAppearances}/{family.examCount} exames · {family.historicalPoints.toFixed(1)} val.</small></div>
              <span className="mastery-number">{state.diagnosed ? `${Math.round(currentConfidence(state.mastery[family.id]) * 100)}%` : '—'}</span>
            </div>
          ))}
        </div>

        <aside className="tomorrow-panel">
          <span className="section-label">Se o exame fosse amanhã</span>
          <h2>{state.diagnosed ? `${coverage.effective.toFixed(1)} valores cobertos` : 'Ainda sem evidência suficiente'}</h2>
          <p>{state.diagnosed ? `As maiores perdas potenciais estão em ${critical.slice(0, 2).map((item) => item.shortName).join(' e ')}.` : 'Completa o diagnóstico para obter prioridades pessoais, não genéricas.'}</p>
          <div className="tomorrow-rule" />
          <div className="mock-summary"><span>Último simulado</span><strong>{lastMock ? `${lastMock.score.toFixed(1)} / 20` : 'Ainda não realizado'}</strong></div>
          <Link to="/mock-exam">Fazer simulado <ArrowRight size={15} /></Link>
        </aside>
      </section>

      <section className="toolbelt">
        <Link to="/practice"><Dices size={18} /><span><strong>Banco de prática</strong>30 tipos com variantes ilimitadas</span><ArrowRight size={15} /></Link>
        <Link to="/simulators"><FlaskConical size={18} /><span><strong>Laboratórios</strong>26 cenários interativos</span><ArrowRight size={15} /></Link>
        <Link to="/formulas"><Sigma size={18} /><span><strong>Formulário</strong>Fórmulas ligadas ao contexto</span><ArrowRight size={15} /></Link>
        <Link to="/study-plan"><CalendarRange size={18} /><span><strong>Plano de 7 dias</strong>Prioridades adaptadas ao domínio</span><ArrowRight size={15} /></Link>
      </section>

      <section className="settings-strip">
        <Settings2 size={19} />
        <label><CalendarDays size={15} /> Data do exame<input type="date" value={state.settings.examDate} onChange={(event) => dispatch({ type: 'settings', settings: { examDate: event.target.value } })} /></label>
        <label><Clock3 size={15} /> Minutos/dia<select value={state.settings.dailyMinutes} onChange={(event) => dispatch({ type: 'settings', settings: { dailyMinutes: Number(event.target.value) } })}>{[15, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes}>{minutes}</option>)}</select></label>
        <label><Target size={15} /> Meta<select value={state.settings.preparationTarget} onChange={(event) => dispatch({ type: 'settings', settings: { preparationTarget: Number(event.target.value) } })}>{[10, 11, 12, 13, 14, 15, 16].map((target) => <option key={target}>{target}</option>)}</select></label>
        <span className="method-note"><TriangleAlert size={14} /> A cobertura é histórica, não uma garantia.</span>
      </section>
    </div>
  )
}
