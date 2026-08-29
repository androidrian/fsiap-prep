import { ArrowLeft, ArrowRight, Check, Gauge, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { familyById } from '../data/analysis'
import { diagnosticExercises } from '../data/exercises'
import type { Confidence } from '../domain/types'
import { useProgress } from '../storage/ProgressContext'

interface DiagnosticAnswer { option: number | null; confidence: Confidence }

export function DiagnosticPage() {
  const { state, dispatch } = useProgress()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, DiagnosticAnswer>>({})
  const current = diagnosticExercises[index]
  const answer = answers[current.id] ?? { option: null, confidence: 'medium' as Confidence }
  const completed = useMemo(() => Object.keys(answers).filter((id) => answers[id].option !== null).length, [answers])

  const update = (patch: Partial<DiagnosticAnswer>) => setAnswers((previous) => ({ ...previous, [current.id]: { ...answer, ...patch } }))
  const finish = () => {
    dispatch({ type: 'diagnostic', results: diagnosticExercises.map((exercise) => ({ familyId: exercise.familyId, correct: answers[exercise.id]?.option === exercise.correctIndex, confidence: answers[exercise.id]?.confidence ?? 'medium' })) })
    navigate('/')
  }

  return (
    <div className="page diagnostic-page">
      <section className="compact-heading">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Visão geral</Link>
        <div className="diagnostic-progress"><span>{completed}/{diagnosticExercises.length}</span><div><i style={{ width: `${completed / diagnosticExercises.length * 100}%` }} /></div></div>
      </section>
      <section className="question-workspace enter-up" key={current.id}>
        <div className="question-context"><span>Diagnóstico · {familyById[current.familyId].shortName}</span><small>Não uses apontamentos. “Não sei” também é informação útil.</small></div>
        <h1>{current.prompt}</h1>
        <div className="choice-list">
          {current.options.map((option, optionIndex) => (
            <button key={option} className={answer.option === optionIndex ? 'selected' : ''} onClick={() => update({ option: optionIndex })}>
              <span>{String.fromCharCode(65 + optionIndex)}</span>{option}{answer.option === optionIndex && <Check size={18} />}
            </button>
          ))}
        </div>
        <div className="confidence-row">
          <span><Gauge size={16} /> Confiança antes de corrigir</span>
          <div>{(['low', 'medium', 'high'] as Confidence[]).map((level) => <button key={level} className={answer.confidence === level ? 'active' : ''} onClick={() => update({ confidence: level })}>{({ low: 'Baixa', medium: 'Média', high: 'Alta' })[level]}</button>)}</div>
        </div>
        <div className="question-footer">
          <button className="button button-quiet" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ArrowLeft size={16} /> Anterior</button>
          {index < diagnosticExercises.length - 1 ? <button className="button button-dark" disabled={answer.option === null} onClick={() => setIndex((value) => value + 1)}>Seguinte <ArrowRight size={16} /></button> : <button className="button button-primary" disabled={completed < diagnosticExercises.length} onClick={finish}>Gerar plano <ArrowRight size={16} /></button>}
        </div>
      </section>
      {state.diagnosed && <button className="restart-link" onClick={() => { setAnswers({}); setIndex(0) }}><RotateCcw size={14} /> Repetir diagnóstico</button>}
    </div>
  )
}
