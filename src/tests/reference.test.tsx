import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { referenceCategories, unitQuantities } from '../data/reference'
import { OfficialFormulaPage } from '../pages/OfficialFormulaPage'
import { UnitsPage } from '../pages/UnitsPage'

afterEach(cleanup)

describe('exam references', () => {
  it('covers every reference category with a substantial unit register', () => {
    expect(unitQuantities.length).toBeGreaterThanOrEqual(35)
    for (const category of referenceCategories) {
      expect(unitQuantities.some((quantity) => quantity.category === category.id)).toBe(true)
    }
  })

  it('converts centimetres to metres interactively', () => {
    const { container } = render(<MemoryRouter><UnitsPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Valor a converter'), { target: { value: '250' } })
    expect(screen.getByText('2,5')).toBeInTheDocument()
    expect(screen.getByText('× 10⁻²')).toBeInTheDocument()
    expect(container.querySelectorAll('.unit-register small .formula').length).toBeGreaterThan(0)
  })

  it('provides the original PDF, valid rendered formulas and the source typo warning', () => {
    const { container } = render(<MemoryRouter><OfficialFormulaPage /></MemoryRouter>)
    expect(screen.getByRole('link', { name: /Abrir PDF original/ })).toHaveAttribute('href', expect.stringContaining('docs/Formulario_FSIAP_2025-2026.pdf'))
    expect(screen.getByText(/aparenta omitir o algarismo 2/)).toBeInTheDocument()
    expect(container.querySelector('.katex-error')).toBeNull()
  })
})
