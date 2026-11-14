import { ArrowRight, FileCheck2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { allExercises, exerciseById } from '../data/library'
import { exerciseLabel, sheetTitles, type StudyExercise } from '../domain/study'
import { useProgress } from '../storage/ProgressContext'

const collections: Array<{ id: string; label: string; title: string; match: (exercise: StudyExercise) => boolean }> = [
  ...([1, 2, 3, 4, 5] as const).map((sheet) => ({ id: `f${sheet}`, label: `Ficha ${sheet}`, title: sheetTitles[sheet], match: (exercise: StudyExercise) => exercise.source.kind === 'sheet' && exercise.source.sheet === sheet })),
  { id: 'exams', label: 'Exames', title: 'Problemas de exame resolvidos', match: (exercise: StudyExercise) => exercise.source.kind === 'exam' },
]

/** Bloco da visão geral: progresso por ficha e atalho para retomar o estudo. */
export function SheetProgress() {
  const { state } = useProgress()
  const isDone = (exercise: StudyExercise) => state.study[exercise.id]?.status === 'done'
  const recent = Object.entries(state.study)
    .filter(([id]) => exerciseById[id])
    .sort(([, first], [, second]) => second.updatedAt.localeCompare(first.updatedAt))[0]
  const lastExercise = recent ? exerciseById[recent[0]] : undefined
  const resume = lastExercise && !isDone(lastExercise) ? lastExercise : allExercises.find((exercise) => !isDone(exercise))
  const toReview = allExercises.filter((exercise) => ['review', 'doubt'].includes(state.study[exercise.id]?.status ?? '')).length

  return (
    <section className="sheet-progress enter-up delay-2" aria-labelledby="sheet-progress-title">
      <div className="section-heading-row">
        <div><span className="section-label">Fichas TP e exames resolvidos</span><h2 id="sheet-progress-title">Resolve, confere, avança.</h2></div>
        <Link to="/exercises">Ver todos <ArrowRight size={15} /></Link>
      </div>
      <div className="sheet-grid">
        {collections.map((collection) => {
          const items = allExercises.filter(collection.match)
          const done = items.filter(isDone).length
          const percent = items.length ? Math.round(done / items.length * 100) : 0
          return (
            <Link key={collection.id} to={`/exercises?c=${collection.id}`} className="sheet-tile">
              <strong>{collection.label}</strong>
              <small>{collection.title}</small>
              <span className="sheet-bar" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label={`${collection.label}: ${done} de ${items.length} feitos`}><i style={{ width: `${percent}%` }} /></span>
              <em>{done}/{items.length} feitos</em>
            </Link>
          )
        })}
      </div>
      <div className="sheet-resume">
        {resume
          ? <Link className="button button-primary" to={`/exercises/${resume.id}`}><FileCheck2 size={17} /> {lastExercise === resume ? 'Retomar' : 'Começar'}: {exerciseLabel(resume)} — {resume.title} <ArrowRight size={17} /></Link>
          : <span className="done-flag">Todos os exercícios estão feitos. Revê os marcados para rever.</span>}
        {toReview > 0 && <Link className="button button-quiet" to="/exercises?status=review">{toReview} para rever ou com dúvida</Link>}
      </div>
    </section>
  )
}
