import { ArrowRight, BookOpenText, ChevronDown, FileText, Search, Star, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MathBlock, RichText } from '../components/RichText'
import { formulaById, formulaChapters, formulas, type FormulaChapter, type FormulaEntry } from '../data/formulas'
import { exercisesForFormula } from '../data/library'
import { theoryTopics, type TheoryTopic } from '../data/theory'
import { exerciseLabel } from '../domain/study'

type Scope = 'all' | 'highlight' | 'official'

const highlighted = new Set(theoryTopics.flatMap((topic) => topic.highlight ?? []))

function matches(formula: FormulaEntry, needle: string) {
  return !needle || `${formula.name} ${formula.when} ${formula.legend} ${formula.id}`.toLowerCase().includes(needle)
}

export function TheoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const focus = searchParams.get('f')
  const focused = focus ? formulaById[focus] : undefined
  const requested = searchParams.get('c') as FormulaChapter | null
  const chapter: FormulaChapter = focused?.chapter ?? (formulaChapters.some((item) => item.id === requested) ? requested! : 'eletrostatica')
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const needle = query.trim().toLowerCase()

  useEffect(() => {
    if (!focus) return
    const element = document.getElementById(`formula-${focus}`)
    if (element) element.scrollIntoView({ block: 'center' })
  }, [focus, chapter])

  const inScope = (formula: FormulaEntry) => scope === 'all' || (scope === 'official' ? formula.official : highlighted.has(formula.id))
  const visible = (formula: FormulaEntry) => inScope(formula) && matches(formula, needle)

  const searchResults = useMemo(() => needle ? formulas.filter((formula) => inScope(formula) && matches(formula, needle)) : [], [needle, scope]) // eslint-disable-line react-hooks/exhaustive-deps
  const topics = theoryTopics.filter((topic) => topic.chapter === chapter)
  const inTopics = new Set(topics.flatMap((topic) => topic.formulaIds))
  const loose = formulas.filter((formula) => formula.chapter === chapter && !inTopics.has(formula.id) && visible(formula))
  const chapterInfo = formulaChapters.find((item) => item.id === chapter)!

  return (
    <div className="page theory-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Teoria das aulas · formulário aplicado</p>
          <h1>As fórmulas que contam, e onde se usam.</h1>
          <p className="lede">Resumo de cada tema, as fórmulas-chave de cada aula e os exercícios onde cada uma é aplicada.</p>
        </div>
        <label className="formula-search"><Search size={16} aria-hidden="true" /><span className="sr-only">Procurar fórmula</span><input type="search" placeholder="Procurar fórmula ou situação…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </section>

      <div className="theory-toolbar">
        <nav className="chapter-tabs" aria-label="Capítulos">
          {formulaChapters.map((item) => <button key={item.id} type="button" className={!needle && chapter === item.id ? 'active' : ''} aria-pressed={!needle && chapter === item.id} onClick={() => { setQuery(''); setSearchParams({ c: item.id }) }}>{item.label}<small>{formulas.filter((formula) => formula.chapter === item.id).length}</small></button>)}
        </nav>
        <div className="scope-switch" role="radiogroup" aria-label="Mostrar">
          {([['all', 'Todas'], ['highlight', 'Fórmulas-chave das aulas'], ['official', 'Do formulário oficial']] as const).map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={scope === id} className={scope === id ? 'active' : ''} onClick={() => setScope(id)}>{label}</button>)}
        </div>
      </div>

      {needle ? (
        <section className="theory-results">
          <h2 className="section-heading">{searchResults.length} {searchResults.length === 1 ? 'fórmula encontrada' : 'fórmulas encontradas'}</h2>
          <div className="formula-cards">{searchResults.map((formula) => <FormulaCard key={formula.id} formula={formula} focused={false} />)}</div>
          {searchResults.length === 0 && <div className="empty-state"><Search size={28} /><h2>Nada encontrado.</h2><p>Experimenta o nome da grandeza (campo, potencial, fluxo…) ou a situação (placas, fio, fibra…).</p></div>}
        </section>
      ) : (
        <>
          <header className="chapter-head">
            <h2>{chapterInfo.label}</h2>
            {chapterInfo.sheet && <Link to={`/exercises?c=f${chapterInfo.sheet}`}>Exercícios da Ficha {chapterInfo.sheet} <ArrowRight size={14} /></Link>}
          </header>
          {topics.map((topic) => <TopicSection key={topic.id} topic={topic} visible={visible} focus={focus} />)}
          {loose.length > 0 && (
            <section className="topic-section">
              {topics.length > 0 && <h3 className="topic-title">Outras fórmulas do capítulo</h3>}
              <div className="formula-cards">{loose.map((formula) => <FormulaCard key={formula.id} formula={formula} focused={focus === formula.id} />)}</div>
            </section>
          )}
          {topics.length === 0 && loose.length === 0 && <div className="empty-state"><BookOpenText size={28} /><h2>Sem fórmulas com este filtro.</h2><p>Escolhe “Todas” para ver o capítulo completo.</p></div>}
        </>
      )}
    </div>
  )
}

function TopicSection({ topic, visible, focus }: { topic: TheoryTopic; visible: (formula: FormulaEntry) => boolean; focus: string | null }) {
  const items = topic.formulaIds.map((id) => formulaById[id]).filter((formula): formula is FormulaEntry => Boolean(formula) && visible(formula))
  return (
    <section className="topic-section" id={`topic-${topic.id}`}>
      <div className="topic-intro">
        <div>
          <p className="topic-source"><FileText size={13} /> {topic.lecture}</p>
          <h3 className="topic-title">{topic.title}</h3>
          <p className="topic-summary"><RichText text={topic.summary} /></p>
        </div>
        <ul className="key-ideas">{topic.keyIdeas.map((idea) => <li key={idea}><RichText text={idea} /></li>)}</ul>
      </div>
      {topic.examTip && <p className="exam-tip"><Star size={15} /><span><strong>No exame:</strong> <RichText text={topic.examTip} /></span></p>}
      {items.length > 0 && <div className="formula-cards">{items.map((formula) => <FormulaCard key={formula.id} formula={formula} focused={focus === formula.id} />)}</div>}
    </section>
  )
}

function FormulaCard({ formula, focused }: { formula: FormulaEntry; focused: boolean }) {
  const used = useMemo(() => exercisesForFormula(formula.id), [formula.id])
  const [open, setOpen] = useState(focused)
  const isHighlighted = highlighted.has(formula.id)
  return (
    <article id={`formula-${formula.id}`} className={`formula-card ${isHighlighted ? 'is-highlighted' : ''} ${focused ? 'is-focused' : ''}`}>
      <header>
        <h4>{formula.name}</h4>
        <div className="formula-badges">
          {isHighlighted && <span className="badge badge-star"><Star size={11} /> fórmula-chave da aula</span>}
          {formula.official && <span className="badge">formulário oficial</span>}
          {formula.lecture && <span className="badge badge-quiet">{formula.lecture}</span>}
        </div>
      </header>
      <MathBlock value={formula.latex} />
      <p className="formula-when"><RichText text={formula.when} /></p>
      <p className="formula-legend"><RichText text={formula.legend} /></p>
      {formula.watch && <p className="formula-watch"><TriangleAlert size={14} /><span><RichText text={formula.watch} /></span></p>}
      {used.length > 0 ? (
        <div className="formula-usage">
          <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Usada em {used.length} {used.length === 1 ? 'exercício' : 'exercícios'} <ChevronDown size={14} className={open ? 'rotated' : ''} /></button>
          {open && <ul>{used.map((exercise) => <li key={exercise.id}><Link to={`/exercises/${exercise.id}`}><span>{exerciseLabel(exercise)}</span>{exercise.title}</Link></li>)}</ul>}
        </div>
      ) : <p className="formula-unused">Ainda sem exercícios associados.</p>}
    </article>
  )
}
