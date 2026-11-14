import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { SearchPalette } from '../components/SearchPalette'
import { ToolsDrawer } from '../components/ToolsDrawer'
import { ExerciseDetailPage } from '../pages/ExerciseDetailPage'
import { ExercisesPage } from '../pages/ExercisesPage'
import { TheoryPage } from '../pages/TheoryPage'
import { initialState } from '../storage/ProgressContext'

const dispatch = vi.fn()
let study: Record<string, { status: 'todo' | 'done' | 'review' | 'doubt'; updatedAt: string; checked?: string[] }> = {}

vi.mock('../storage/ProgressContext', async (importOriginal) => {
  const original = await importOriginal<typeof import('../storage/ProgressContext')>()
  return { ...original, useProgress: () => ({ state: { ...original.initialState, study }, dispatch, ready: true, syncStatus: 'saved', flush: async () => undefined }) }
})

beforeEach(() => {
  dispatch.mockClear()
  study = {}
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(cleanup)

const renderDetail = (id: string) => render(<MemoryRouter initialEntries={[`/exercises/${id}`]}><Routes><Route path="/exercises/:id" element={<ExerciseDetailPage />} /></Routes></MemoryRouter>)

describe('exercise library', () => {
  it('starts from an empty study record', () => {
    expect(initialState.study).toEqual({})
  })

  it('lists every sheet, filters by collection and searches the statements', () => {
    render(<MemoryRouter initialEntries={['/exercises?c=f1']}><ExercisesPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /Ficha 1/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('19 exercícios')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Dois protões no núcleo de ferro/ })).toHaveAttribute('href', '/exercises/f1-01')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'impressora jato' } })
    expect(screen.getByText('1 exercício')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzz' } })
    expect(screen.getByText(/Nenhum exercício com estes filtros/)).toBeInTheDocument()
  })

  it('shows the saved status of each exercise', () => {
    study = { 'f1-01': { status: 'done', updatedAt: '2026-11-14T00:00:00.000Z' } }
    render(<MemoryRouter initialEntries={['/exercises?c=f1&status=done']}><ExercisesPage /></MemoryRouter>)
    expect(screen.getByText('1 exercício')).toBeInTheDocument()
    expect(within(screen.getByRole('link', { name: /Dois protões/ })).getByText('Feito')).toBeInTheDocument()
  })
})

describe('exercise detail', () => {
  it('shows statement, original figure and data, and keeps the solution hidden at first', () => {
    renderDetail('f1-05')
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /quadrado/i })).toHaveAttribute('src', expect.stringContaining('figures/f1-05.png'))
    expect(screen.getByText('Dados')).toBeInTheDocument()
    expect(screen.queryByText('Resposta')).not.toBeInTheDocument()
    expect(document.querySelector('.solution-steps')).not.toBeInTheDocument()
  })

  it('reveals one step at a time and then the answer with the printed solution', () => {
    renderDetail('f1-05')
    const first = screen.getAllByRole('button', { name: /Primeiro passo/ })[0]
    fireEvent.click(first)
    expect(document.querySelectorAll('.solution-steps li')).toHaveLength(1)
    expect(screen.queryByText('Resposta')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /Resolução completa/ })[0])
    expect(document.querySelectorAll('.part-card')[0].querySelectorAll('.solution-steps li').length).toBeGreaterThan(1)
    expect(screen.getByText('Resposta')).toBeInTheDocument()
    expect(screen.getByText(/Solução impressa na ficha/)).toBeInTheDocument()
  })

  it('checks a numeric answer, explains a wrong power of ten and records a correct one', () => {
    renderDetail('f1-05')
    const input = screen.getAllByLabelText('A tua resposta')[0]
    fireEvent.change(input, { target: { value: '2,3e-7' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Verificar' })[0])
    expect(screen.getByText(/potência de 10/)).toBeInTheDocument()
    expect(dispatch).not.toHaveBeenCalled()
    fireEvent.change(input, { target: { value: '2,3e-4' } })
    fireEvent.click(screen.getAllByRole('button', { name: 'Verificar' })[0])
    expect(screen.getByText('Certo.')).toBeInTheDocument()
    expect(dispatch).toHaveBeenCalledWith({ type: 'study-check', exerciseId: 'f1-05', part: 'a' })
  })

  it('saves the status and offers the next exercise', () => {
    renderDetail('f1-05')
    fireEvent.click(screen.getByRole('button', { name: /Marcar como feito/ }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'study-status', exerciseId: 'f1-05', status: 'done' })
    expect(screen.getByRole('link', { name: /Seguinte: Ex. 6/ })).toHaveAttribute('href', '/exercises/f1-06')
  })

  it('lists the formulas used with a link to the theory', () => {
    renderDetail('f1-05')
    fireEvent.click(screen.getByRole('button', { name: /Fórmulas necessárias/ }))
    expect(screen.getByRole('link', { name: /Ver Campo de uma carga pontual na teoria/ })).toHaveAttribute('href', '/theory?f=field-point')
  })

  it('explains an unknown exercise id', () => {
    renderDetail('nao-existe')
    expect(screen.getByText(/Exercício não encontrado/)).toBeInTheDocument()
  })
})

describe('theory and formulas', () => {
  it('links each formula to the exercises that use it', () => {
    render(<MemoryRouter initialEntries={['/theory?f=coulomb-force']}><TheoryPage /></MemoryRouter>)
    const card = document.getElementById('formula-coulomb-force')!
    expect(card).toHaveClass('is-focused')
    expect(card.querySelector('a[href="/exercises/f1-01"]')).toHaveTextContent('Dois protões no núcleo de ferro')
  })

  it('searches formulas across chapters', () => {
    render(<MemoryRouter initialEntries={['/theory']}><TheoryPage /></MemoryRouter>)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Snell' } })
    expect(screen.getByRole('heading', { name: 'Lei de Snell' })).toBeInTheDocument()
  })
})

describe('global tools', () => {
  it('finds exercises, formulas and lab scenarios from one search box', () => {
    render(<MemoryRouter><SearchPalette open onClose={() => undefined} /></MemoryRouter>)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'protões núcleo' } })
    expect(screen.getByRole('option', { name: /Dois protões no núcleo de ferro/ })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'malus' } })
    expect(screen.getAllByRole('option').length).toBeGreaterThan(1)
  })

  it('calculates with the official constants and reports invalid input', () => {
    render(<ToolsDrawer open tab="calculator" onTab={() => undefined} onClose={() => undefined} />)
    const input = screen.getByLabelText('Expressão')
    fireEvent.change(input, { target: { value: 'k*(1,6e-19)^2/(4e-15)^2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }))
    expect(screen.getByText('= 14,38')).toBeInTheDocument()
    fireEvent.change(input, { target: { value: '2+' } })
    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/incompleta/)
  })

  it('converts SI prefixes including squared units', () => {
    render(<ToolsDrawer open tab="converter" onTab={() => undefined} onClose={() => undefined} />)
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('1 × 10^-6')
    fireEvent.change(screen.getByLabelText('De'), { target: { value: '-2' } })
    fireEvent.change(screen.getByLabelText('Dimensão'), { target: { value: '2' } })
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('1 × 10^-4')
  })
})
