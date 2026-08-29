import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Dices, Eye, Gauge, Lightbulb, RotateCcw, SlidersHorizontal, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Formula } from '../components/Formula'
import { families, familyById } from '../data/analysis'
import { generateExercise } from '../domain/exercises/generator'
import { currentConfidence } from '../domain/mastery/mastery'
import { recommendNext } from '../domain/study/studyEngine'
import type { Confidence, ErrorType, FamilyId } from '../domain/types'
import { useProgress } from '../storage/ProgressContext'

const errorLabels: Record<ErrorType, string> = {
  conceptual: 'Conceito', wrong_formula: 'Fórmula errada', calculation: 'Cálculo', units: 'Unidades', sign: 'Sinal', interpretation: 'Interpretação', rounding: 'Arredondamento', forgotten: 'Esquecimento', cannot_start: 'Não sei começar',
}

export function StudyPage() {
  const { state, dispatch } = useProgress()
  const [searchParams] = useSearchParams()
  const initialRecommendation = useMemo(() => recommendNext(state), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [familyId] = useState<FamilyId>(() => {
    const requested = searchParams.get('family') as FamilyId | null
    return requested && families.some((family) => family.id === requested) ? requested : initialRecommendation.family.id
  })
  const family = familyById[familyId]
  const familyConfidence = currentConfidence(state.mastery[familyId])
  const level = Math.max(1, Math.min(5, Math.ceil(familyConfidence * 5) + 1))
  const [seed, setSeed] = useState(() => Math.floor(Date.now() % 2_000_000_000))
  const exercise = useMemo(() => generateExercise(familyId, seed, level), [familyId, seed, level])
  const [phase, setPhase] = useState<'brief' | 'learn' | 'practice' | 'result'>('brief')
  const [selected, setSelected] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<Confidence>('medium')
  const [hints, setHints] = useState(0)
  const [errorType, setErrorType] = useState<ErrorType>('conceptual')
  const correct = selected === exercise.correctIndex
  const activity = familyConfidence < 0.25 ? 'Compreender primeiro' : familyConfidence < 0.58 ? 'Prática guiada' : 'Prática autónoma'
  const reasons = [
    `${family.examAppearances}/${family.examCount} exames completos`,
    `${family.historicalPoints.toFixed(1)} valores históricos`,
    familyConfidence > 0 ? `${Math.round(familyConfidence * 100)}% de confiança atual` : 'ainda sem evidência pessoal',
    '3 templates com parâmetros variáveis',
  ]

  const submit = () => {
    if (selected === null) return
    dispatch({
      type: 'attempt', familyId: exercise.familyId, exerciseId: exercise.id, prompt: exercise.prompt,
      correctAnswer: exercise.correctAnswer, correct, hintsUsed: hints, confidence,
      answer: exercise.options[selected], errorType: correct ? undefined : errorType,
    })
    setPhase('result')
  }

  const nextVariant = () => {
    setSeed((value) => value + 7919)
    setSelected(null); setHints(0); setConfidence('medium'); setErrorType('conceptual'); setPhase('practice')
  }

  return (
    <div className="page study-page">
      <div className="compact-heading">
        <Link to="/practice" className="back-link"><ArrowLeft size={16} /> Banco de treino</Link>
        <span className="session-badge">Sessão adaptativa · nível {level}/6</span>
      </div>

      {phase === 'brief' && (
        <section className="session-brief enter-up">
          <div className="session-number">PRÓXIMA<br />AÇÃO</div>
          <div className="session-copy"><p className="eyebrow">{activity}</p><h1>{family.name}</h1><p>{family.description}</p><ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
          <div className="session-side"><span>Confiança atual</span><strong>{Math.round(familyConfidence * 100)}%</strong><small>O enunciado, os dados e a posição da resposta mudam a cada variante.</small><button className="button button-primary" onClick={() => setPhase(familyConfidence < 0.35 ? 'learn' : 'practice')}>Começar <ArrowRight size={17} /></button></div>
        </section>
      )}

      {phase === 'learn' && (
        <section className="lesson-workspace enter-up">
          <div className="lesson-step"><span>01</span><small>Compreender</small></div>
          <div className="lesson-content"><p className="eyebrow">Ideia nuclear</p><h1>{family.recognition}</h1><p>{family.description}</p><div className="formula-board">{family.formulas.map((formula) => <Formula key={formula} value={formula} display />)}</div><h3>Processo que deves repetir no exame</h3><ol className="strategy-list">{family.strategy.map((step) => <li key={step}>{step}</li>)}</ol></div>
          <aside className="active-recall-note"><Lightbulb size={19} /><strong>Antes de avançar</strong><p>Tapa as fórmulas e tenta dizer em voz alta qual usarias primeiro e porquê.</p></aside>
          <button className="button button-dark lesson-next" onClick={() => setPhase('practice')}>Gerar exercício <ArrowRight size={16} /></button>
        </section>
      )}

      {phase === 'practice' && (
        <section className="question-workspace practice-workspace enter-up" key={exercise.id}>
          <div className="question-context"><span>Variante {String(seed).slice(-4)} · {exercise.templateId.replaceAll('-', ' ')}</span><small>Nível {exercise.level} · ~{exercise.estimatedMinutes} min</small></div>
          <h1>{exercise.prompt}</h1>
          <div className="exercise-parameters"><SlidersHorizontal size={15} />{exercise.parameters.map((parameter) => <span key={parameter.label}><small>{parameter.label}</small>{parameter.value}</span>)}</div>
          <div className="choice-list compact-choices">{exercise.options.map((option, index) => <button key={`${option}-${index}`} className={selected === index ? 'selected' : ''} onClick={() => setSelected(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
          <div className="hint-stack">
            {exercise.hints.slice(0, hints).map((hint, index) => <div key={hint}><Lightbulb size={15} /><span><strong>Dica {index + 1}</strong>{hint}</span></div>)}
            {hints < exercise.hints.length && <button onClick={() => setHints((value) => value + 1)}><Eye size={15} /> Pedir dica {hints + 1}</button>}
          </div>
          <div className="confidence-row"><span><Gauge size={16} /> Confiança antes de corrigir</span><div>{(['low', 'medium', 'high'] as Confidence[]).map((confidenceLevel) => <button key={confidenceLevel} className={confidence === confidenceLevel ? 'active' : ''} onClick={() => setConfidence(confidenceLevel)}>{({ low: 'Baixa', medium: 'Média', high: 'Alta' })[confidenceLevel]}</button>)}</div></div>
          {selected !== null && selected !== exercise.correctIndex && <label className="error-select">Se estiver errada, qual foi a causa mais provável?<select value={errorType} onChange={(event) => setErrorType(event.target.value as ErrorType)}>{Object.entries(errorLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>}
          <div className="question-footer"><button className="button button-quiet" onClick={nextVariant}><Dices size={16} /> Outra variante</button><button className="button button-primary" disabled={selected === null} onClick={submit}>Corrigir tentativa</button></div>
        </section>
      )}

      {phase === 'result' && (
        <section className={`result-panel enter-up ${correct ? 'correct' : 'incorrect'}`}>
          {correct ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
          <p className="eyebrow">{correct ? hints === 0 ? 'Correta e autónoma' : `Correta com ${hints} dica${hints > 1 ? 's' : ''}` : 'Ainda não consolidado'}</p>
          <h1>{correct ? 'Boa transferência para uma variante nova.' : 'Revê o passo que separa os dados da fórmula.'}</h1>
          <p>{exercise.explanation}</p>
          <div className="source-note"><BookOpen size={16} /> {exercise.source}</div>
          <div className="result-actions"><button className="button button-primary" onClick={nextVariant}><RotateCcw size={16} /> Gerar nova variante</button><Link className="button button-dark" to="/practice">Mudar de família <ArrowRight size={16} /></Link></div>
        </section>
      )}
    </div>
  )
}
