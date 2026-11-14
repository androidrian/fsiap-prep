import { BookOpenText, FileCheck2, FlaskConical, LayoutGrid, Search, Sigma } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { familyById } from '../data/analysis'
import { formulas } from '../data/formulas'
import { allExercises } from '../data/library'
import { theoryTopics } from '../data/theory'
import { exerciseLabel } from '../domain/study'
import type { FamilyId } from '../domain/types'
import { labHref, labRegistry } from '../labs/registry'
import { navigationGroups } from './navigation'

interface Entry {
  kind: 'Página' | 'Exercício' | 'Fórmula' | 'Teoria' | 'Laboratório'
  title: string
  subtitle: string
  to: string
  haystack: string
  icon: ComponentType<{ size?: number }>
}

function buildIndex(): Entry[] {
  const pages: Entry[] = navigationGroups.flatMap((group) => group.links.map((link) => ({ kind: 'Página' as const, title: link.label, subtitle: group.label, to: link.to, haystack: `${link.label} ${group.label} ${link.keywords ?? ''}`.toLowerCase(), icon: LayoutGrid })))
  const exercises: Entry[] = allExercises.map((exercise) => ({ kind: 'Exercício' as const, title: exercise.title, subtitle: exerciseLabel(exercise), to: `/exercises/${exercise.id}`, haystack: `${exercise.title} ${exerciseLabel(exercise)} ${exercise.statement}`.toLowerCase(), icon: FileCheck2 }))
  const formulaEntries: Entry[] = formulas.map((formula) => ({ kind: 'Fórmula' as const, title: formula.name, subtitle: formula.when, to: `/theory?f=${formula.id}`, haystack: `${formula.name} ${formula.when} ${formula.id}`.toLowerCase(), icon: Sigma }))
  const topics: Entry[] = theoryTopics.map((topic) => ({ kind: 'Teoria' as const, title: topic.title, subtitle: topic.lecture, to: `/theory?c=${topic.chapter}#topic-${topic.id}`, haystack: `${topic.title} ${topic.summary}`.toLowerCase(), icon: BookOpenText }))
  const labs: Entry[] = (Object.keys(labRegistry) as FamilyId[]).flatMap((family) => labRegistry[family].map((scenario) => ({ kind: 'Laboratório' as const, title: scenario.label, subtitle: familyById[family].shortName, to: labHref(family, scenario.id), haystack: `${scenario.label} ${familyById[family].shortName} laboratório simulador`.toLowerCase(), icon: FlaskConical })))
  return [...pages, ...exercises, ...formulaEntries, ...topics, ...labs]
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const index = useMemo(buildIndex, [])
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (open) { setQuery(''); setActive(0); inputRef.current?.focus() }
  }, [open])

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length === 0) return index.filter((entry) => entry.kind === 'Página')
    return index
      .filter((entry) => words.every((word) => entry.haystack.includes(word)))
      .sort((first, second) => Number(second.title.toLowerCase().includes(words[0])) - Number(first.title.toLowerCase().includes(words[0])))
      .slice(0, 40)
  }, [index, query])

  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }) }, [active])

  if (!open) return null

  const go = (entry: Entry) => { onClose(); navigate(entry.to) }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose() }
    else if (event.key === 'ArrowDown') { event.preventDefault(); setActive((value) => Math.min(results.length - 1, value + 1)) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((value) => Math.max(0, value - 1)) }
    else if (event.key === 'Enter' && results[active]) { event.preventDefault(); go(results[active]) }
  }

  return (
    <div className="palette-scrim" onClick={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Pesquisa global" onClick={(event) => event.stopPropagation()} onKeyDown={onKeyDown}>
        <label className="palette-input">
          <Search size={18} aria-hidden="true" />
          <input ref={inputRef} type="search" role="combobox" aria-expanded="true" aria-controls="palette-results" aria-activedescendant={results[active] ? `palette-${active}` : undefined} placeholder="Procurar exercício, fórmula, cenário ou página…" value={query} onChange={(event) => { setQuery(event.target.value); setActive(0) }} />
          <kbd>Esc</kbd>
        </label>
        <ul id="palette-results" ref={listRef} role="listbox" className="palette-results">
          {results.map((entry, position) => {
            const Icon = entry.icon
            return (
              <li key={`${entry.kind}-${entry.to}-${entry.title}`} id={`palette-${position}`} role="option" aria-selected={position === active} onMouseEnter={() => setActive(position)} onClick={() => go(entry)}>
                <Icon size={16} />
                <span><strong>{entry.title}</strong><small>{entry.subtitle}</small></span>
                <em>{entry.kind}</em>
              </li>
            )
          })}
          {results.length === 0 && <li className="palette-empty">Nada encontrado para “{query}”.</li>}
        </ul>
        <p className="palette-help"><kbd>↑</kbd><kbd>↓</kbd> navegar · <kbd>Enter</kbd> abrir · <kbd>Ctrl</kbd>+<kbd>K</kbd> abrir a pesquisa em qualquer página</p>
      </div>
    </div>
  )
}
