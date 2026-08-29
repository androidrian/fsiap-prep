import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SimulatorsPage } from '../pages/SimulatorsPage'

afterEach(cleanup)

const renderSimulators = (entry = '/simulators') => render(<MemoryRouter initialEntries={[entry]}><SimulatorsPage /></MemoryRouter>)

describe('interactive simulator diagrams', () => {
  it('opens the laboratory immediately and exposes layered heat transfer', () => {
    renderSimulators()
    expect(screen.queryByRole('button', { name: /abrir laboratório/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Parede composta' })).toBeInTheDocument()
    expect(screen.getByText(/T interface=/)).toBeInTheDocument()
  })

  it('changes the magnetic trajectory geometry when B changes', () => {
    const { container } = renderSimulators()
    fireEvent.click(screen.getByRole('button', { name: /07 Partículas em B/ }))
    const path = container.querySelector('.orbit-stage > path')!
    const before = path.getAttribute('d')
    fireEvent.change(screen.getByRole('slider', { name: /Campo B/ }), { target: { value: '12' } })
    expect(path.getAttribute('d')).not.toBe(before)
    expect(screen.getByText('9.36 m')).toBeInTheDocument()
    const afterField = path.getAttribute('d')
    fireEvent.click(screen.getByRole('button', { name: 'q negativa' }))
    expect(path.getAttribute('d')).not.toBe(afterField)
  })

  it('switches among the main assessed scenarios without invalid results', () => {
    const { container } = renderSimulators()
    fireEvent.click(screen.getByRole('button', { name: /03 Eletrostática/ }))
    expect(screen.getByRole('button', { name: 'Componentes que anulam' })).toBeInTheDocument()
    expect(container.textContent).toContain('Ex₁ + Ex₂ = 0')

    fireEvent.click(screen.getByRole('button', { name: /05 Circuitos DC/ }))
    fireEvent.click(screen.getByRole('button', { name: '2 malhas · 2 fontes' }))
    expect(screen.getByRole('slider', { name: /Fonte E₂/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /06 Circuitos RC/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Descarga' }))
    expect(screen.getByText('3.68 V')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /09 Ótica/ }))
    expect(screen.getByRole('button', { name: 'Faces paralelas' })).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('opens a configured exam shortcut with its scenario and values', () => {
    renderSimulators('/simulators?family=magnetic_particles&scenario=wire&I=6&r=0.005&v=1750')
    expect(screen.getByRole('button', { name: 'Campo de um fio' })).toHaveClass('active')
    expect(screen.getByRole('slider', { name: /Corrente I/ })).toHaveValue('6')
    expect(screen.getByRole('slider', { name: /Distância r/ })).toHaveValue('0.005')
    expect(screen.getByText('240.00 μT')).toBeInTheDocument()
  })

  it('balances heat flow at the junction of the exam Y network', () => {
    const { container } = renderSimulators('/simulators?family=thermal_transport&scenario=network')
    expect(screen.getByRole('button', { name: 'Rede térmica em Y' })).toHaveClass('active')
    expect(screen.getByText(/Verificação do nó/)).toBeInTheDocument()
    const initialTemperature = screen.getByText(/82\.29 °C/)
    fireEvent.change(screen.getByRole('slider', { name: /Comprimento do aço/ }), { target: { value: '0.5' } })
    expect(initialTemperature).toHaveTextContent('82.96 °C')
    expect(screen.getByText(/W entram; .* W saem/)).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('recreates the complete A to B exam path with electric and gravitational energy', () => {
    const { container } = renderSimulators('/simulators?family=uniform_fields&scenario=work&q=3&E=2&dx=-4&dy=-3&m=200')
    expect(screen.getByRole('button', { name: 'Trabalho A → B' })).toHaveClass('active')
    expect(screen.getByText('-2.40e-13 J')).toBeInTheDocument()
    expect(screen.getByText('1.81e-13 J')).toBeInTheDocument()
    const trajectory = container.querySelector('.work-trajectory')!
    const before = trajectory.getAttribute('d')
    fireEvent.change(screen.getByRole('slider', { name: /Deslocamento horizontal/ }), { target: { value: '-7' } })
    expect(trajectory.getAttribute('d')).not.toBe(before)
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('keeps field direction fixed and changes transverse motion with speed and charge', () => {
    const { container } = renderSimulators('/simulators?family=uniform_fields&scenario=motion')
    const path = container.querySelector('.particle-path')!
    const initial = path.getAttribute('d')
    fireEvent.change(screen.getByRole('slider', { name: /Velocidade horizontal/ }), { target: { value: '80' } })
    expect(path.getAttribute('d')).not.toBe(initial)
    const faster = path.getAttribute('d')
    fireEvent.click(screen.getByRole('button', { name: 'negativa' }))
    expect(path.getAttribute('d')).not.toBe(faster)
    expect(container.querySelector('.electric-field-lines')!.getAttribute('d')).toBe('M90 45V175M170 45V175M250 45V175M330 45V175M410 45V175')
  })

  it('changes the measurement point, not the field circles, around a straight wire', () => {
    const { container } = renderSimulators('/simulators?family=magnetic_particles&scenario=wire')
    const rings = [...container.querySelectorAll('.field-ring')].map((ring) => ring.getAttribute('r'))
    const point = container.querySelector('.sample-point')!
    const initialPoint = point.getAttribute('cx')
    fireEvent.change(screen.getByRole('slider', { name: /Distância r/ }), { target: { value: '0.2' } })
    expect([...container.querySelectorAll('.field-ring')].map((ring) => ring.getAttribute('r'))).toEqual(rings)
    expect(point.getAttribute('cx')).not.toBe(initialPoint)
    fireEvent.change(screen.getByRole('slider', { name: /Corrente I/ }), { target: { value: '0' } })
    expect(screen.getByText('0.00 μT')).toBeInTheDocument()
    expect(container.querySelector('.field-source-stage')).toHaveClass('zero-field')
    expect(container.querySelector('.field-sense')).not.toBeInTheDocument()
  })

  it('changes the induction rod length without translating it', () => {
    const { container } = renderSimulators('/simulators?family=induction_sources&scenario=motional')
    const rod = container.querySelector('.moving-rod')!
    const x = rod.getAttribute('x1')
    const y = rod.getAttribute('y1')
    fireEvent.change(screen.getByRole('slider', { name: /Comprimento da barra/ }), { target: { value: '1' } })
    expect(rod.getAttribute('x1')).toBe(x)
    expect(rod.getAttribute('y1')).not.toBe(y)
    fireEvent.click(screen.getByRole('button', { name: 'Solenoide' }))
    const coil = container.querySelector('.solenoid-wire')!
    const coilBefore = coil.getAttribute('points')
    fireEvent.change(screen.getByRole('slider', { name: /Comprimento L/ }), { target: { value: '1.5' } })
    expect(coil.getAttribute('points')).not.toBe(coilBefore)
  })

  it('never reverses the electric field when only the charge sign changes', () => {
    const { container } = renderSimulators('/simulators?family=uniform_fields&scenario=plates')
    const fieldLabel = container.querySelector('.field-space > span')!
    expect(fieldLabel).toHaveTextContent('E → → →')
    fireEvent.change(screen.getByRole('slider', { name: /Carga/ }), { target: { value: '4' } })
    expect(fieldLabel).toHaveTextContent('E → → →')
    expect(container.querySelector('.force-right')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider', { name: /Carga/ }), { target: { value: '-4' } })
    expect(fieldLabel).toHaveTextContent('E → → →')
    expect(container.querySelector('.force-left')).toBeInTheDocument()
  })
})
