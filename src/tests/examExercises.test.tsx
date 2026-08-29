import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ExamExercisesPage } from '../pages/ExamExercisesPage'

afterEach(cleanup)

describe('verified exam exercise library', () => {
  it('shows the full verified exercise set and a configured laboratory shortcut', () => {
    render(<MemoryRouter><ExamExercisesPage /></MemoryRouter>)
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText(/Um fio reto e longo transporta uma corrente de 6,0 A/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver campo em torno do fio/ })).toHaveAttribute('href', expect.stringContaining('I=6'))
  })

  it('filters exercises that need no original figure', () => {
    render(<MemoryRouter><ExamExercisesPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Sem figura/ }))
    expect(screen.getByText(/Uma sonda na superfície lunar/)).toBeInTheDocument()
    expect(screen.queryByText(/Duas cargas elétricas estão fixas/)).not.toBeInTheDocument()
  })
})
