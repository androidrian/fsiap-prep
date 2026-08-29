import { ArrowRight, CheckCircle2, ListX, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { familyById } from '../data/analysis'
import type { ErrorType } from '../domain/types'
import { useProgress } from '../storage/ProgressContext'

const labels: Record<ErrorType, string> = {
  conceptual: 'Conceito', wrong_formula: 'Fórmula', calculation: 'Cálculo', units: 'Unidades', sign: 'Sinal', interpretation: 'Interpretação', rounding: 'Arredondamento', forgotten: 'Esquecimento', cannot_start: 'Não sei começar',
}

export function MistakesPage() {
  const { state, dispatch } = useProgress()
  const openMistakes = state.mistakes.filter((mistake) => !mistake.resolved)
  const counts = state.mistakes.reduce<Partial<Record<ErrorType, number>>>((accumulator, mistake) => ({ ...accumulator, [mistake.errorType]: (accumulator[mistake.errorType] ?? 0) + 1 }), {})
  const topErrors = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3) as Array<[ErrorType, number]>

  return (
    <div className="page mistakes-page">
      <section className="page-heading"><div><p className="eyebrow">Caderno automático</p><h1>Erros que ainda ensinam.</h1><p className="lede">Uma resposta certa depois de ver a solução não fecha o erro; uma variante autónoma fecha.</p></div></section>
      {state.mistakes.length > 0 && <section className="error-patterns"><span className="section-label">Padrões pessoais</span>{topErrors.map(([type, count]) => <div key={type}><strong>{Math.round(count / state.mistakes.length * 100)}%</strong><span>{labels[type]}</span><i style={{ width: `${count / state.mistakes.length * 100}%` }} /></div>)}</section>}
      {openMistakes.length === 0 ? (
        <section className="empty-state"><ListX size={32} /><h2>Ainda não há erros por rever.</h2><p>As tentativas incorretas aparecem aqui com causa, resposta e família.</p><Link className="button button-dark" to="/study">Começar uma sessão <ArrowRight size={16} /></Link></section>
      ) : (
        <section className="mistake-list">{openMistakes.map((mistake) => <article key={mistake.id}><div className="mistake-meta"><span>{labels[mistake.errorType]}</span><time>{new Date(mistake.createdAt).toLocaleDateString('pt-PT')}</time></div><h2>{mistake.prompt}</h2><div className="answer-compare"><p><span>A tua resposta</span>{mistake.answer}</p><p><span>Resposta correta</span>{mistake.correctAnswer}</p></div><div className="mistake-footer"><small>{familyById[mistake.familyId].name}</small><div><Link to="/study"><RotateCcw size={15} /> Refazer variante</Link><button onClick={() => dispatch({ type: 'resolve-mistake', id: mistake.id })}><CheckCircle2 size={15} /> Marcar revista</button></div></div></article>)}</section>
      )}
    </div>
  )
}
