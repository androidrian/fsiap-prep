import { ArrowRight, FileCheck2, Image, ImageOff, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { families, familyById } from '../data/analysis'
import { examExercises } from '../data/examExercises'
import type { FamilyId } from '../domain/types'

export function ExamExercisesPage() {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState<'all' | FamilyId>('all')
  const [visual, setVisual] = useState<'all' | 'with' | 'without'>('all')
  const filtered = useMemo(() => examExercises.filter((exercise) => {
    const matchesFamily = family === 'all' || exercise.familyIds.includes(family)
    const matchesVisual = visual === 'all' || (visual === 'with' ? exercise.hasFigure : !exercise.hasFigure)
    const haystack = `${exercise.exam} ${exercise.statement} ${exercise.parts.join(' ')}`.toLowerCase()
    return matchesFamily && matchesVisual && haystack.includes(query.toLowerCase())
  }), [family, query, visual])
  const laboratoryLink = (exercise: (typeof examExercises)[number]) => {
    const params = new URLSearchParams({ family: exercise.lab.family, scenario: exercise.lab.scenario, ...exercise.lab.params })
    return `/simulators?${params.toString()}`
  }

  return <div className="page exam-exercises-page">
    <section className="page-heading exam-library-heading"><div><p className="eyebrow">PDFs verificados e enunciados fornecidos</p><h1>Exercícios reais, ligados ao laboratório.</h1><p className="lede">Transcrição dos problemas práticos, com indicação clara quando o original dependia de uma figura.</p></div><div className="verified-count"><strong>{examExercises.length}</strong><span>problemas documentados</span></div></section>
    <section className="exercise-filters"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Procurar por conceito ou dado…" /></label><select value={family} onChange={(event) => setFamily(event.target.value as 'all' | FamilyId)}><option value="all">Todas as famílias</option>{families.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select><div><button className={visual === 'all' ? 'active' : ''} onClick={() => setVisual('all')}>Todos</button><button className={visual === 'without' ? 'active' : ''} onClick={() => setVisual('without')}><ImageOff size={13} /> Sem figura</button><button className={visual === 'with' ? 'active' : ''} onClick={() => setVisual('with')}><Image size={13} /> Com figura</button></div></section>
    <section className="exam-exercise-list">{filtered.map((exercise) => <article key={exercise.id}>
      <div className="exam-exercise-meta"><span>{exercise.exam} · P.{exercise.number}</span><small>{exercise.hasFigure ? <><Image size={12} /> O original inclui figura</> : <><ImageOff size={12} /> Resolúvel apenas pelo texto</>}</small></div>
      <p className="exam-statement">{exercise.statement}</p>
      <ol>{exercise.parts.map((part) => <li key={part}>{part}</li>)}</ol>
      <div className="exercise-family-tags">{exercise.familyIds.map((id) => <span key={id}>{familyById[id].shortName}</span>)}</div>
      <footer><span><FileCheck2 size={14} /> Fonte: {exercise.sourcePath}</span><Link to={laboratoryLink(exercise)}>{exercise.lab.label}<small>{exercise.lab.coverage === 'direct' ? 'abre com os dados do exame quando disponíveis' : 'apoio conceptual'}</small><ArrowRight size={15} /></Link></footer>
    </article>)}</section>
    {filtered.length === 0 && <div className="empty-state"><Search size={28} /><h2>Nenhum exercício com estes filtros.</h2><p>Altera a família, a presença de figura ou o texto pesquisado.</p></div>}
  </div>
}
