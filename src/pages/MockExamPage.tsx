import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flag, TimerReset } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { familyById } from '../data/analysis'
import { generateMixedSet } from '../domain/exercises/generator'
import type { FamilyId } from '../domain/types'
import { useProgress } from '../storage/ProgressContext'

export function MockExamPage() {
  const { dispatch } = useProgress()
  const [mockQuestions] = useState(() => generateMixedSet(5, Math.floor(Date.now() % 2_000_000_000), ['thermal_transport', 'electrostatics', 'rc_circuits', 'magnetic_particles', 'optics']))
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [index, setIndex] = useState(0)
  const [seconds, setSeconds] = useState(120 * 60)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const score = useMemo(() => mockQuestions.reduce((sum, question) => sum + (answers[question.id] === question.correctIndex ? 4 : 0), 0), [answers, mockQuestions])

  useEffect(() => {
    if (!started || finished) return
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value <= 1) { window.clearInterval(timer); setFinished(true); return 0 }
      return value - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [started, finished])

  const finish = () => {
    const familyLosses: Partial<Record<FamilyId, number>> = {}
    for (const question of mockQuestions) if (answers[question.id] !== question.correctIndex) familyLosses[question.familyId] = 4
    dispatch({ type: 'mock', result: { score, familyLosses } })
    setFinished(true)
  }

  if (!started) return (
    <div className="page mock-page"><section className="page-heading"><div><p className="eyebrow">Modo exame · nova combinação a cada início</p><h1>Um ensaio antes do dia real.</h1><p className="lede">Cinco problemas parametrizados das famílias mais recorrentes. Sem dicas, soluções ou formulário.</p></div></section><section className="mock-intro"><div className="mock-clock"><TimerReset size={34} /><strong>120</strong><span>minutos</span></div><div><span>Formato</span><strong>5 variantes · 4 valores cada</strong><p>A correção automática avalia apenas respostas objetivas. Não atribui pontos parciais a raciocínio intermédio.</p></div><button className="button button-primary" onClick={() => setStarted(true)}>Iniciar simulado <ArrowRight size={17} /></button></section></div>
  )

  if (finished) return (
    <div className="page mock-page"><section className="mock-result enter-up"><CheckCircle2 size={34} /><p className="eyebrow">Simulado terminado</p><div className="mock-score"><strong>{score.toFixed(1)}</strong><span>/20</span></div><h1>{score >= 10 ? 'Aprovação neste ensaio.' : 'Ainda há valores recuperáveis.'}</h1><p>{score === 20 ? 'Resolveste autonomamente todas as famílias testadas.' : `Poderias recuperar ${20 - score} valores ao consolidar as famílias abaixo.`}</p><div className="loss-list">{mockQuestions.filter((question) => answers[question.id] !== question.correctIndex).map((question) => <span key={question.id}>{familyById[question.familyId].shortName}<strong>−4 val.</strong></span>)}</div><div className="result-actions"><Link className="button button-quiet" to="/"><ArrowLeft size={16} /> Visão geral</Link><Link className="button button-dark" to="/study">Treinar maior lacuna <ArrowRight size={16} /></Link></div></section></div>
  )

  const current = mockQuestions[index]
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  return (
    <div className="page mock-page">
      <section className="mock-topbar"><span>Simulado FSIAP</span><div><Clock3 size={16} /> {minutes}:{secs}</div><button onClick={finish}>Terminar</button></section>
      <section className="question-workspace mock-workspace" key={current.id}>
        <div className="question-context"><span>Problema {index + 1} de {mockQuestions.length}</span><small>4 valores · resposta objetiva</small></div>
        <h1>{current.prompt}</h1>
        <div className="choice-list">{current.options.map((option, optionIndex) => <button key={option} className={answers[current.id] === optionIndex ? 'selected' : ''} onClick={() => setAnswers((previous) => ({ ...previous, [current.id]: optionIndex }))}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>
        <div className="question-footer"><button className="button button-quiet" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ArrowLeft size={16} /> Anterior</button>{index < mockQuestions.length - 1 ? <button className="button button-dark" onClick={() => setIndex((value) => value + 1)}>Seguinte <ArrowRight size={16} /></button> : <button className="button button-primary" onClick={finish}><Flag size={16} /> Entregar</button>}</div>
      </section>
      <div className="mock-nav">{mockQuestions.map((question, questionIndex) => <button key={question.id} className={`${index === questionIndex ? 'active' : ''} ${answers[question.id] !== undefined ? 'answered' : ''}`} onClick={() => setIndex(questionIndex)}>{questionIndex + 1}</button>)}</div>
    </div>
  )
}
