import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ExamExercisesPage } from '../pages/ExamExercisesPage'

afterEach(cleanup)

describe('verified exam exercise library', () => {
  it('shows the full verified exercise set and a configured laboratory shortcut', () => {
    render(<MemoryRouter><ExamExercisesPage /></MemoryRouter>)
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText(/Um fio reto e longo transporta uma corrente de 6,0 A/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver campo em torno do fio/ })).toHaveAttribute('href', expect.stringContaining('I=6'))
  })

  it('filters exercises that need no original figure', () => {
    render(<MemoryRouter><ExamExercisesPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Sem figura/ }))
    expect(screen.getByText(/Uma sonda na superfície lunar/)).toBeInTheDocument()
    expect(screen.queryByText(/Duas cargas elétricas estão fixas/)).not.toBeInTheDocument()
  })

  it('links every supplied exercise directly to its matching laboratory', () => {
    render(<MemoryRouter><ExamExercisesPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Simular as 4 cargas no círculo/ })).toHaveAttribute('href', expect.stringContaining('scenario=circle'))
    expect(screen.getByRole('link', { name: /Montar condensadores e resistências/ })).toHaveAttribute('href', expect.stringContaining('scenario=network'))
    expect(screen.getByRole('link', { name: /Seguir a partícula no solenoide/ })).toHaveAttribute('href', expect.stringContaining('scenario=solenoid-particle'))
  })
})
