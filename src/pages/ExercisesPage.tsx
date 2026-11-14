import { ArrowRight, Check, CircleHelp, FlaskConical, Image, RotateCcw, Search, X } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { families, familyById } from '../data/analysis'
import { allExercises } from '../data/library'
import { difficultyLabels, sheetTitles, statusLabels, type StudyExercise } from '../domain/study'
import type { FamilyId, StudyStatus } from '../domain/types'
import { hasLabScenario } from '../labs/registry'
import { useProgress } from '../storage/ProgressContext'

type CollectionId = 'all' | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'exams'

const collections: Array<{ id: CollectionId; label: string; title: string }> = [
  { id: 'all', label: 'Tudo', title: 'Todas as fichas e exames' },
  ...([1, 2, 3, 4, 5] as const).map((sheet) => ({ id: `f${sheet}` as CollectionId, label: `Ficha ${sheet}`, title: sheetTitles[sheet] })),
  { id: 'exams', label: 'Exames', title: 'Problemas de exame resolvidos' },
]

function inCollection(exercise: StudyExercise, collection: CollectionId) {
  if (collection === 'all') return true
  if (collection === 'exams') return exercise.source.kind === 'exam'
  return exercise.source.kind === 'sheet' && `f${exercise.source.sheet}` === collection
}

function groupKey(exercise: StudyExercise) {
  return exercise.source.kind === 'sheet' ? `Ficha ${exercise.source.sheet} — ${sheetTitles[exercise.source.sheet]}` : exercise.source.exam
}

const statusIcon = { done: Check, review: RotateCcw, doubt: CircleHelp } as const

export function ExercisesPage() {
  const { state } = useProgress()
  const [searchParams, setSearchParams] = useSearchParams()
  const collection = (collections.some((item) => item.id === searchParams.get('c')) ? searchParams.get('c') : 'all') as CollectionId
  const query = searchParams.get('q') ?? ''
  const family = (searchParams.get('family') ?? 'all') as 'all' | FamilyId
  const status = (searchParams.get('status') ?? 'all') as 'all' | StudyStatus
  const level = searchParams.get('level') ?? 'all'
  const statusOf = (exercise: StudyExercise): StudyStatus => state.study[exercise.id]?.status ?? 'todo'

  const setParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams)
    if (!value || value === 'all') nextParams.delete(key)
    else nextParams.set(key, value)
    setSearchParams(nextParams, { replace: true })
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return allExercises.filter((exercise) => {
      if (!inCollection(exercise, collection)) return false
      if (family !== 'all' && !exercise.familyIds.includes(family)) return false
      if (status !== 'all' && (state.study[exercise.id]?.status ?? 'todo') !== status) return false
      if (level !== 'all' && String(exercise.difficulty) !== level) return false
      if (!needle) return true
      const haystack = `${exercise.title} ${exercise.statement} ${exercise.parts.map((part) => part.question).join(' ')}`.toLowerCase()
      return needle.split(/\s+/).every((word) => haystack.includes(word))
    })
  }, [collection, family, level, query, state.study, status])

  const groups = useMemo(() => {
    const map = new Map<string, StudyExercise[]>()
    for (const exercise of filtered) map.set(groupKey(exercise), [...(map.get(groupKey(exercise)) ?? []), exercise])
    return [...map.entries()]
  }, [filtered])

  const doneCount = (items: StudyExercise[]) => items.filter((exercise) => state.study[exercise.id]?.status === 'done').length
  const totalDone = doneCount(allExercises)
  const hasFilters = query || family !== 'all' || status !== 'all' || level !== 'all'

  return (
    <div className="page exercises-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Fichas TP 2025/26 e exames</p>
          <h1>Exercícios resolvidos, passo a passo.</h1>
          <p className="lede">Enunciado e figura originais, dica, resolução por passos, resposta da ficha e o setup no laboratório.</p>
        </div>
        <div className="verified-count"><strong>{totalDone}<small>/{allExercises.length}</small></strong><span>exercícios feitos</span></div>
      </section>

      <nav className="collection-tabs" aria-label="Coleções">
        {collections.map((item) => {
          const items = allExercises.filter((exercise) => inCollection(exercise, item.id))
          const done = doneCount(items)
          return (
            <button key={item.id} type="button" className={collection === item.id ? 'active' : ''} aria-pressed={collection === item.id} title={item.title} onClick={() => setParam('c', item.id)}>
              <strong>{item.label}</strong>
              <span>{done}/{items.length}</span>
              <i aria-hidden="true"><b style={{ width: `${items.length ? done / items.length * 100 : 0}%` }} /></i>
            </button>
          )
        })}
      </nav>

      <section className="library-filters" aria-label="Filtros">
        <label className="filter-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Procurar</span><input type="search" value={query} onChange={(event) => setParam('q', event.target.value)} placeholder="Procurar por tema, dado ou palavra do enunciado…" /></label>
        <label><span>Família</span><select value={family} onChange={(event) => setParam('family', event.target.value)}><option value="all">Todas</option>{families.map((item) => <option key={item.id} value={item.id}>{item.shortName}</option>)}</select></label>
        <label><span>Estado</span><select value={status} onChange={(event) => setParam('status', event.target.value)}><option value="all">Todos</option>{(Object.keys(statusLabels) as StudyStatus[]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label>
        <label><span>Dificuldade</span><select value={level} onChange={(event) => setParam('level', event.target.value)}><option value="all">Todas</option>{([1, 2, 3] as const).map((value) => <option key={value} value={value}>{difficultyLabels[value]}</option>)}</select></label>
        {hasFilters && <button type="button" className="filter-clear" onClick={() => setSearchParams(collection === 'all' ? {} : { c: collection }, { replace: true })}><X size={14} /> Limpar</button>}
      </section>

      <p className="result-count" role="status">{filtered.length} {filtered.length === 1 ? 'exercício' : 'exercícios'}</p>

      {groups.map(([title, items]) => (
        <section key={title} className="exercise-group">
          <header><h2>{title}</h2><span>{doneCount(items)}/{items.length} feitos</span></header>
          <ul className="exercise-rows">
            {items.map((exercise) => {
              const current = statusOf(exercise)
              const Icon = current === 'todo' ? null : statusIcon[current]
              const hasLab = (exercise.labs ?? []).some((link) => hasLabScenario(link.family, link.scenario))
              return (
                <li key={exercise.id}>
                  <Link to={`/exercises/${exercise.id}`} className={`exercise-row status-${current}`}>
                    <span className="row-number">{exercise.source.number}</span>
                    <span className="row-body">
                      <strong>{exercise.title}</strong>
                      <small>{exercise.familyIds.map((id) => familyById[id].shortName).join(' · ')} · {exercise.parts.length} {exercise.parts.length === 1 ? 'pergunta' : 'alíneas'}</small>
                    </span>
                    <span className="row-flags">
                      {exercise.figure && <span title="Com figura original"><Image size={14} aria-label="Com figura" /></span>}
                      {hasLab && <span title="Com laboratório"><FlaskConical size={14} aria-label="Com laboratório" /></span>}
                      <span className={`difficulty level-${exercise.difficulty}`} title={difficultyLabels[exercise.difficulty]} aria-label={difficultyLabels[exercise.difficulty]}><i /><i /><i /></span>
                    </span>
                    <span className={`row-status status-${current}`}>{Icon && <Icon size={13} />}{statusLabels[current]}</span>
                    <ArrowRight size={16} className="row-arrow" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {filtered.length === 0 && <div className="empty-state"><Search size={28} /><h2>Nenhum exercício com estes filtros.</h2><p>Altera a coleção, a família, o estado ou o texto pesquisado.</p></div>}
    </div>
  )
}
