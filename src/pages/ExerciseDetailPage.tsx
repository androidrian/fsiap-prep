import { ArrowLeft, ArrowRight, BookOpen, Calculator, Check, ChevronRight, CircleHelp, Eye, FlaskConical, ImageOff, Lightbulb, ListChecks, NotebookPen, RotateCcw, Sigma, TriangleAlert, X, ZoomIn } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MathBlock, RichText } from '../components/RichText'
import { openTools } from '../components/toolsBus'
import { familyById } from '../data/analysis'
import { formulaById } from '../data/formulas'
import { exerciseById, neighbours } from '../data/library'
import { difficultyLabels, exerciseLabel, sheetTitles, statusLabels, type ExercisePart, type StudyExercise } from '../domain/study'
import { checkAnswer, verdictMessage, type CheckResult } from '../domain/study/answer'
import type { StudyStatus } from '../domain/types'
import { hasLabScenario, labHref } from '../labs/registry'
import { useProgress } from '../storage/ProgressContext'


export function ExerciseDetailPage() {
  const { id } = useParams()
  const exercise = id ? exerciseById[id] : undefined
  useEffect(() => { window.scrollTo({ top: 0 }) }, [id])
  if (!exercise) {
    return <div className="page"><div className="empty-state"><CircleHelp size={28} /><h2>Exercício não encontrado.</h2><p>Pode ter sido renumerado. Volta à biblioteca e procura pelo tema.</p><Link className="button button-primary" to="/exercises">Ver todos os exercícios</Link></div></div>
  }
  return <ExerciseView key={exercise.id} exercise={exercise} />
}

function collectionLink(exercise: StudyExercise) {
  return exercise.source.kind === 'sheet'
    ? { to: `/exercises?c=f${exercise.source.sheet}`, label: `Ficha ${exercise.source.sheet}`, title: sheetTitles[exercise.source.sheet] }
    : { to: '/exercises?c=exams', label: 'Exames', title: exercise.source.exam }
}

function ExerciseView({ exercise }: { exercise: StudyExercise }) {
  const { state, dispatch } = useProgress()
  const study = state.study[exercise.id]
  const status: StudyStatus = study?.status ?? 'todo'
  const checked = study?.checked ?? []
  const { previous, next } = neighbours(exercise)
  const collection = collectionLink(exercise)
  const [showStrategy, setShowStrategy] = useState(false)
  const [showFormulas, setShowFormulas] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [note, setNote] = useState(study?.note ?? '')
  const labs = (exercise.labs ?? []).filter((link) => hasLabScenario(link.family, link.scenario))
  const formulas = exercise.formulaIds.map((formulaId) => formulaById[formulaId]).filter(Boolean)
  const checkable = exercise.parts.filter((part) => part.check)

  useEffect(() => {
    if (!zoom) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setZoom(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [zoom])

  const setStatus = (value: StudyStatus) => dispatch({ type: 'study-status', exerciseId: exercise.id, status: value })
  const saveNote = () => { if ((study?.note ?? '') !== note) dispatch({ type: 'study-note', exerciseId: exercise.id, note }) }

  return (
    <div className="page exercise-page">
      <nav className="crumbs" aria-label="Localização">
        <Link to="/exercises">Exercícios</Link><ChevronRight size={14} aria-hidden="true" />
        <Link to={collection.to}>{collection.label}</Link><ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{exercise.source.kind === 'sheet' ? `Ex. ${exercise.source.number}` : `P.${exercise.source.number}`}</span>
        <span className="crumbs-nav">
          {previous ? <Link to={`/exercises/${previous.id}`} title={previous.title}><ArrowLeft size={15} /> Anterior</Link> : <span aria-disabled="true"><ArrowLeft size={15} /> Anterior</span>}
          {next ? <Link to={`/exercises/${next.id}`} title={next.title}>Seguinte <ArrowRight size={15} /></Link> : <span aria-disabled="true">Seguinte <ArrowRight size={15} /></span>}
        </span>
      </nav>

      <header className="exercise-head">
        <p className="eyebrow">{exerciseLabel(exercise)} · {collection.title}</p>
        <h1>{exercise.title}</h1>
        <div className="exercise-meta">
          <span className={`difficulty level-${exercise.difficulty}`} title={difficultyLabels[exercise.difficulty]}><i /><i /><i /> {difficultyLabels[exercise.difficulty]}</span>
          {exercise.familyIds.map((familyId) => <Link key={familyId} className="chip" to={`/exercises?family=${familyId}`}>{familyById[familyId].shortName}</Link>)}
          <div className="status-switch" role="radiogroup" aria-label="Estado do exercício">
            {(Object.keys(statusLabels) as StudyStatus[]).map((value) => <button key={value} type="button" role="radio" aria-checked={status === value} className={`${status === value ? 'active' : ''} status-${value}`} onClick={() => setStatus(value)}>{statusLabels[value]}</button>)}
          </div>
        </div>
      </header>

      <div className="exercise-layout">
        <article className="exercise-main">
          <section className="statement-card" aria-labelledby="statement-title">
            <h2 id="statement-title" className="card-title">Enunciado</h2>
            <p className="statement"><RichText text={exercise.statement} /></p>
            {exercise.table && (
              <div className="table-scroll"><table className="data-table">
                {exercise.table.caption && <caption>{exercise.table.caption}</caption>}
                <thead><tr>{exercise.table.headers.map((header) => <th key={header} scope="col"><RichText text={header} /></th>)}</tr></thead>
                <tbody>{exercise.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><RichText text={cell} /></td>)}</tr>)}</tbody>
              </table></div>
            )}
            {exercise.figure && (
              <figure className="exercise-figure">
                <button type="button" onClick={() => setZoom(true)} aria-label="Ampliar a figura">
                  <img src={`${import.meta.env.BASE_URL}${exercise.figure.src}`} alt={exercise.figure.alt} loading="lazy" />
                  <span><ZoomIn size={14} /> Ampliar</span>
                </button>
                <figcaption>{exercise.figure.caption ?? `Figura original da ficha — ${exerciseLabel(exercise)}`}</figcaption>
              </figure>
            )}
            {exercise.missingFigure && <p className="figure-missing"><ImageOff size={15} /> O original tem uma figura que não está disponível; a geometria está descrita no enunciado.</p>}
            {exercise.data && exercise.data.length > 0 && (
              <div className="data-block">
                <h3>Dados</h3>
                <dl className="data-grid">{exercise.data.map((item) => <div key={`${item.symbol}-${item.value}`}><dt><RichText text={`$${item.symbol}$`} /></dt><dd><RichText text={item.value} /></dd></div>)}</dl>
              </div>
            )}
            <ol className="part-outline">{exercise.parts.map((part) => <li key={part.label || 'unica'}>{part.label && <strong>{part.label})</strong>} <RichText text={part.question} /></li>)}</ol>
          </section>

          <section className="attack-card" aria-label="Ajudas antes de resolver">
            <div className="attack-actions">
              {exercise.strategy && <button type="button" className={showStrategy ? 'active' : ''} aria-expanded={showStrategy} onClick={() => setShowStrategy((value) => !value)}><Lightbulb size={16} /> Como atacar</button>}
              {formulas.length > 0 && <button type="button" className={showFormulas ? 'active' : ''} aria-expanded={showFormulas} onClick={() => setShowFormulas((value) => !value)}><Sigma size={16} /> Fórmulas necessárias ({formulas.length})</button>}
              <button type="button" onClick={() => openTools('calculator')}><Calculator size={16} /> Calculadora</button>
            </div>
            {showStrategy && exercise.strategy && <p className="strategy-text"><RichText text={exercise.strategy} /></p>}
            {showFormulas && (
              <ul className="formula-list">{formulas.map((formula) => (
                <li key={formula.id}>
                  <div><strong>{formula.name}</strong>{formula.official && <span className="badge">formulário</span>}<Link to={`/theory?f=${formula.id}`} aria-label={`Ver ${formula.name} na teoria`}>teoria <ArrowRight size={12} /></Link></div>
                  <MathBlock value={formula.latex} />
                  <p><RichText text={formula.when} /></p>
                </li>
              ))}</ul>
            )}
          </section>

          <h2 className="section-heading"><ListChecks size={18} /> Resolução passo a passo</h2>
          <p className="section-help">Tenta primeiro no papel. Usa a dica, revela um passo de cada vez e confere o teu resultado.</p>
          {exercise.parts.map((part) => <PartCard key={part.label || 'unica'} part={part} solved={checked.includes(part.label)} onSolved={() => dispatch({ type: 'study-check', exerciseId: exercise.id, part: part.label })} />)}

          {exercise.pitfalls && exercise.pitfalls.length > 0 && (
            <section className="pitfalls-card"><h2 className="card-title"><TriangleAlert size={16} /> Armadilhas deste exercício</h2><ul>{exercise.pitfalls.map((pitfall) => <li key={pitfall}><RichText text={pitfall} /></li>)}</ul></section>
          )}
          {exercise.note && <section className="note-card"><h2 className="card-title"><BookOpen size={16} /> Nota sobre a solução da ficha</h2><p><RichText text={exercise.note} /></p></section>}

          <section className="notes-card">
            <label htmlFor="exercise-note" className="card-title"><NotebookPen size={16} /> As tuas notas</label>
            <textarea id="exercise-note" rows={3} maxLength={2000} placeholder="O que te fez hesitar? Que passo queres rever antes do exame?" value={note} onChange={(event) => setNote(event.target.value)} onBlur={saveNote} />
          </section>

          <footer className="exercise-footer">
            {status === 'done'
              ? <span className="done-flag"><Check size={16} /> Marcado como feito</span>
              : <button type="button" className="button button-primary" onClick={() => setStatus('done')}><Check size={16} /> Marcar como feito</button>}
            <button type="button" className="button button-quiet" onClick={() => setStatus('review')}><RotateCcw size={16} /> Rever mais tarde</button>
            {next && <Link className="button button-dark" to={`/exercises/${next.id}`}>Seguinte: {next.source.kind === 'sheet' ? `Ex. ${next.source.number}` : `P.${next.source.number}`} <ArrowRight size={16} /></Link>}
          </footer>
        </article>

        <aside className="exercise-aside" aria-label="Apoio ao exercício">
          {labs.length > 0 && (
            <section>
              <h2 className="aside-title"><FlaskConical size={15} /> Ver o setup no laboratório</h2>
              {labs.map((link) => <Link key={`${link.scenario}-${link.label}`} className="lab-link" to={labHref(link.family, link.scenario, link.params)}><strong>{link.label}</strong><small>{link.coverage === 'direct' ? 'Abre com os dados deste exercício' : 'Apoio conceptual'}</small><ArrowRight size={15} /></Link>)}
            </section>
          )}
          {checkable.length > 0 && (
            <section>
              <h2 className="aside-title"><ListChecks size={15} /> Respostas conferidas</h2>
              <ul className="check-list">{checkable.map((part) => <li key={part.label || 'unica'} className={checked.includes(part.label) ? 'ok' : ''}>{checked.includes(part.label) ? <Check size={14} /> : <i />} {part.label ? `Alínea ${part.label})` : 'Resposta'}</li>)}</ul>
            </section>
          )}
          <section>
            <h2 className="aside-title"><Sigma size={15} /> Fórmulas</h2>
            <ul className="formula-chips">{formulas.map((formula) => <li key={formula.id}><Link to={`/theory?f=${formula.id}`}>{formula.name}</Link></li>)}</ul>
          </section>
        </aside>
      </div>

      {zoom && exercise.figure && (
        <div className="figure-lightbox" role="dialog" aria-modal="true" aria-label="Figura ampliada" onClick={() => setZoom(false)}>
          <button type="button" className="icon-button" aria-label="Fechar figura" autoFocus onClick={() => setZoom(false)}><X size={20} /></button>
          <img src={`${import.meta.env.BASE_URL}${exercise.figure.src}`} alt={exercise.figure.alt} />
        </div>
      )}
    </div>
  )
}

function PartCard({ part, solved, onSolved }: { part: ExercisePart; solved: boolean; onSolved: () => void }) {
  const [hint, setHint] = useState(false)
  const [shown, setShown] = useState(0)
  const [answerShown, setAnswerShown] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const total = part.steps.length
  const allShown = shown >= total
  const inputId = `answer-${part.label || 'unica'}`

  const verify = (event: FormEvent) => {
    event.preventDefault()
    if (!part.check) return
    const outcome = checkAnswer(input, part.check)
    setResult(outcome)
    if (outcome.verdict === 'correct') onSolved()
  }
  const revealNext = () => {
    const value = Math.min(total, shown + 1)
    setShown(value)
    if (value >= total) setAnswerShown(true)
  }
  const revealAll = () => { setShown(total); setAnswerShown(true); setHint(true) }

  return (
    <section className={`part-card ${solved ? 'is-solved' : ''}`}>
      <header>
        {part.label && <span className="part-label">{part.label})</span>}
        <p className="part-question"><RichText text={part.question} /></p>
        {solved && <span className="solved-flag"><Check size={14} /> conferida</span>}
      </header>

      {part.check && (
        <form className="answer-check" onSubmit={verify}>
          <label htmlFor={inputId}>A tua resposta</label>
          <div className="answer-input">
            <input id={inputId} inputMode="decimal" autoComplete="off" placeholder="ex.: 1,2e-3" value={input} onChange={(event) => { setInput(event.target.value); setResult(null) }} aria-describedby={`${inputId}-feedback`} />
            <span>{part.check.unit}</span>
          </div>
          <button type="submit" className="button button-dark" disabled={!input.trim()}>Verificar</button>
          <p id={`${inputId}-feedback`} className={`answer-feedback ${result ? result.verdict : ''}`} role="status">
            {result && <>{verdictMessage[result.verdict]}{result.deviation !== undefined && result.verdict !== 'correct' && result.verdict !== 'invalid' && result.verdict !== 'power' && result.verdict !== 'sign' ? ` Desvio: ${(result.deviation * 100).toFixed(0)} %.` : ''}</>}
          </p>
        </form>
      )}

      <div className="reveal-bar">
        {part.hint && <button type="button" className={hint ? 'active' : ''} aria-expanded={hint} onClick={() => setHint((value) => !value)}><Lightbulb size={15} /> Dica</button>}
        <button type="button" disabled={allShown} onClick={revealNext}><ArrowRight size={15} /> {shown === 0 ? 'Primeiro passo' : 'Passo seguinte'} <small>{shown}/{total}</small></button>
        <button type="button" disabled={allShown && answerShown} onClick={revealAll}><Eye size={15} /> Resolução completa</button>
        <button type="button" className={answerShown ? 'active' : ''} aria-expanded={answerShown} onClick={() => setAnswerShown((value) => !value)}><Check size={15} /> Só a resposta</button>
      </div>

      {hint && part.hint && <p className="hint-text"><Lightbulb size={15} /><span><RichText text={part.hint} /></span></p>}

      {shown > 0 && (
        <ol className="solution-steps">
          {part.steps.slice(0, shown).map((step, index) => (
            <li key={index} className="enter-up">
              <span className="step-index">{index + 1}</span>
              <div>
                {step.title && <h4>{step.title}</h4>}
                <p><RichText text={step.text} /></p>
                {step.math && <MathBlock value={step.math} />}
              </div>
            </li>
          ))}
        </ol>
      )}

      {answerShown && (
        <div className="final-answer">
          <span>Resposta</span>
          <p><RichText text={part.answer} /></p>
          {part.official && <small>Solução impressa na ficha: <RichText text={part.official} /></small>}
        </div>
      )}
    </section>
  )
}
