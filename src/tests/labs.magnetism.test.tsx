import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SimulatorsPage } from '../pages/SimulatorsPage'
import { directionWords, formatVec, texNumber } from '../labs/magnetism/format'
import {
  ATOMIC_MASS_UNIT, MU0, chargeBesideWire, chargeForLanding, curveSide, cyclotron, drawnTurns, faradayEmf, generator, lorentz,
  massForLanding, motionalEmf, niceCeil, niceFloor, orbit, parseVec3, solenoidField, transformer, velocitySelector, wireInExternalField, wireResultantAt,
} from '../labs/magnetism/physics'

afterEach(cleanup)

const open = (family: string, scenario: string, query = '') => render(<MemoryRouter initialEntries={[`/simulators?family=${family}&scenario=${scenario}${query ? `&${query}` : ''}`]}><SimulatorsPage /></MemoryRouter>)
const expectActive = (label: string) => expect(screen.getByRole('button', { name: label })).toHaveClass('active')
const expectClean = (container: HTMLElement) => expect(container.textContent).not.toMatch(/NaN|Infinity/)
const typeInto = (label: string, value: string) => {
  const input = screen.getByRole('textbox', { name: label })
  fireEvent.change(input, { target: { value } })
  fireEvent.blur(input)
}

describe('magnetism physics (ficha 3)', () => {
  it('ex. 1 — mass spectrometer', () => {
    const result = orbit(3.3863e-25, 1.6022e-19, 30761.722, 0.08, 'half')
    expect(result.chord).toBeCloseTo(1.6254, 4)
    expect(result.force / 3.9429e-16).toBeCloseTo(1, 4)
    expect(massForLanding(1.6022e-19, 30761.722, 0.08, 1.6254, 'half') / ATOMIC_MASS_UNIT).toBeCloseTo(203.93, 1)
  })

  it('ex. 9 — proton in a uniform field', () => {
    const result = orbit(1.6726e-27, 1.6022e-19, 3e5, 2e-2, 'half')
    expect(result.radius).toBeCloseTo(0.16, 2)
    expect(result.force / 9.6e-16).toBeCloseTo(1, 2)
    expect(result.kineticEnergy / 7.5e-17).toBeCloseTo(1, 2)
    // A ficha indica 3,3×10⁻⁶ s, que é o período completo; a meia-volta demora metade.
    expect(result.period / 3.3e-6).toBeCloseTo(1, 1)
    expect(result.arcTime).toBeCloseTo(result.period / 2, 12)
  })

  it('ex. 13 and 15 — inverse problems and curve side', () => {
    expect(chargeForLanding(2e-8, 50, 4e-2, 0.025, 'half')).toBeCloseTo(2e-3, 9)
    expect(orbit(2e-8, 2e-3, 50, 4e-2, 'half').arcTime / 8e-4).toBeCloseTo(1, 1)
    expect(orbit(2e-12, 4.4e-6, 2e6, 428.55, 'quarter').chord).toBeCloseTo(3e-3, 6)
    expect(orbit(1, 1, 1, 1, 'full').chord).toBe(0)
    expect(curveSide(1.6e-19, true)).toBe(1)
    expect(curveSide(2e-3, false)).toBe(-1)
    expect(curveSide(-1.6e-19, false)).toBe(1)
    expect(Number.isFinite(orbit(1, 0, 1, 1, 'half').radius)).toBe(false)
  })

  it('ex. 14, 2 and 10 — Lorentz force by components', () => {
    const body = lorentz(3, [3, 0, 0], [1, -2, 3], [-1, -3, 0], 0.3, 10)
    expect(body.magnetic).toEqual([0, -27, -18])
    expect(body.total).toEqual([-3, -36, -18])
    expect(body.acceleration!.map((value) => Math.round(value))).toEqual([-10, -120, -70])

    const electron = lorentz(-1.6e-19, [8e6, 0, 0], [0.025 * Math.cos(Math.PI / 3), 0.025 * Math.sin(Math.PI / 3), 0], undefined, 9.1e-31)
    expect(electron.magnetic[2] / -2.8e-14).toBeCloseTo(1, 1)
    expect(electron.magnetic[0]).toBe(0)
    expect(electron.angle).toBeCloseTo(60, 6)
    expect(electron.acceleration![2] / -3.1e16).toBeCloseTo(1, 1)

    const particle = lorentz(3e-11, [0, 2e6, 0], [2e-2, 0, 0], [0, 0, 4e3])
    expect(particle.total[2] / -1.08e-6).toBeCloseTo(1, 6)
    expect(particle.acceleration).toBeNull()
    expect(parseVec3('1,-2,3', [0, 0, 0])).toEqual([1, -2, 3])
    expect(parseVec3('1,2', [9, 9, 9])).toEqual([9, 9, 9])
  })

  it('velocity selector, cyclotron and wire', () => {
    expect(velocitySelector(39000, 0.15, 260000).selectedSpeed).toBeCloseTo(2.6e5, 3)
    expect(velocitySelector(39000, 0.15, 260000).imbalance).toBe(0)
    expect(velocitySelector(4e3, 2e-2, 2e6).selectedSpeed).toBeCloseTo(2e5, 3)
    expect(velocitySelector(4e3, 2e-2, 2e6).imbalance).toBeLessThan(0)

    const machine = cyclotron(12e6, 0.53, 3.34e-27, 1.6022e-19)
    expect(machine.field).toBeCloseTo(1.57, 2)
    expect(machine.maxSpeed / 3.99e7).toBeCloseTo(1, 2)

    const sum = wireInExternalField(1, 0.01, 2e-5)
    expect(sum.wire).toBeCloseTo(2e-5, 12)
    expect(sum.max).toBeCloseTo(4e-5, 12)
    expect(sum.min).toBe(0)
    expect(sum.cancelDistance).toBeCloseTo(0.01, 9)
    expect(wireResultantAt(1, 0.01, 2e-5, -Math.PI / 2).total[0]).toBeCloseTo(4e-5, 12)
    expect(wireResultantAt(1, 0.01, 2e-5, Math.PI / 2).total[0]).toBeCloseTo(0, 12)

    const proton = chargeBesideWire(5, 0.004, 1500)
    expect(proton.field).toBeCloseTo(2.5e-4, 10)
    expect(proton.force / 6e-20).toBeCloseTo(1, 2)
    expect(proton.balancingField).toBeCloseTo(0.375, 9)
  })

  it('induction, generator and transformer', () => {
    expect(faradayEmf(1, 0.1, 0.1) / 2).toBeCloseTo(1.57e-3, 5)
    expect(motionalEmf(1.2, 0.25, 10)).toBeCloseTo(3, 9)
    expect(1.5 * 2.4 / (MU0 * 1200) / 2400).toBeCloseTo(1, 1)
    expect(solenoidField(1200, 2.4, 2387)).toBeCloseTo(1.5, 3)

    const loop = generator(0.63, 0.11, 1, 250, 10)
    expect(loop.emfAmplitude).toBeCloseTo(5.99, 2)
    expect(loop.currentAmplitude).toBeCloseTo(0.599, 3)
    expect(loop.period).toBeCloseTo(2 * Math.PI / 250, 12)

    const house = transformer(8500, 120, { power: 78000 })
    expect(house.ratio).toBeCloseTo(70.83, 2)
    expect(house.primaryCurrent).toBeCloseTo(9.18, 2)
    expect(house.secondaryCurrent).toBeCloseTo(650, 6)
    expect(house.loadResistance).toBeCloseTo(0.1846, 4)
    expect(house.reflectedResistance).toBeCloseTo(926.3, 1)

    const resistive = transformer(5980, 230, { resistance: 4.4 })
    expect(resistive.ratio).toBeCloseTo(26, 6)
    expect(resistive.secondaryCurrent).toBeCloseTo(52.27, 2)
    expect(resistive.primaryCurrent).toBeCloseTo(2.01, 2)

    expect(drawnTurns(70.8)).toEqual({ primary: 16, secondary: 1, capped: true })
    expect(drawnTurns(2)).toEqual({ primary: 4, secondary: 2, capped: false })
    expect(drawnTurns(0.5)).toEqual({ primary: 2, secondary: 4, capped: false })
  })

  it('formats and scales', () => {
    expect(formatVec([0, -27, -18])).toBe('(0; -27; -18)')
    expect(texNumber(8e6)).toBe('8\\times10^{6}')
    expect(texNumber(0.025)).toBe('0{,}025')
    expect(directionWords([0, -9, -6])).toBe('−y e −z')
    expect(directionWords([0, 0, 5])).toBe('+z')
    expect(niceCeil(0.8127)).toBe(1)
    expect(niceCeil(0.0125)).toBeCloseTo(0.015, 12)
    expect(niceFloor(0.75)).toBe(0.5)
  })
})

describe('magnetic_particles laboratory scenarios', () => {
  it('orbit: reproduces the mass spectrometer and bends to the side set by q and B', () => {
    const { container } = open('magnetic_particles', 'orbit', 'm=3.3863e-25&q=1.6022e-19&v=30761.722&B=0.08&arc=half')
    expectActive('Espectrómetro / arco')
    expect(container.textContent).toContain('1,6254 m')
    expect(container.textContent).toContain('3,9429×10⁻¹⁶ N')
    expect(container.textContent).toContain('203,93 u')
    expect(container.textContent).toContain('m = 3,3863×10⁻²⁵ kg')
    const path = container.querySelector('.lab-magnetism-orbit-path')!
    const force = container.querySelector('.lab-magnetism-orbit-force')!
    const right = path.getAttribute('d')
    expect(Number(force.getAttribute('x2'))).toBeGreaterThan(Number(force.getAttribute('x1')))
    fireEvent.click(screen.getByRole('button', { name: 'B ⊗ a entrar' }))
    expect(path.getAttribute('d')).not.toBe(right)
    const left = container.querySelector('.lab-magnetism-orbit-force')!
    expect(Number(left.getAttribute('x2'))).toBeLessThan(Number(left.getAttribute('x1')))
    const half = path.getAttribute('d')
    fireEvent.click(screen.getByRole('button', { name: '¼ de volta' }))
    expect(path.getAttribute('d')).not.toBe(half)
    typeInto('Campo B', '0.16')
    expect(container.textContent).toContain('0,40635 m')
    typeInto('Campo B', '0')
    expectClean(container)
  })

  it('orbit: exercise 13 lands 2,5 cm to the left with B into the page', () => {
    const { container } = open('magnetic_particles', 'orbit', 'm=2e-8&q=2e-3&v=50&B=-0.04&arc=half')
    expect(screen.getByRole('button', { name: 'B ⊗ a entrar' })).toHaveClass('active')
    expect(container.textContent).toContain('x = 2r = 0,025 m')
    expect(container.textContent).toContain('7,8540×10⁻⁴ s')
    expect(container.textContent).toContain('|q| = 2,0000×10⁻³ C')
    const force = container.querySelector('.lab-magnetism-orbit-force')!
    expect(Number(force.getAttribute('x2'))).toBeLessThan(Number(force.getAttribute('x1')))
    expectClean(container)
  })

  it('vectors: exercise 14 by components, with view and component controls', () => {
    const { container } = open('magnetic_particles', 'vectors', 'v=3,0,0&B=1,-2,3&E=-1,-3,0&q=3&m=0.3&g=10')
    expectActive('Produto vetorial v × B')
    expect(screen.getByText('(0; -27; -18) N')).toBeInTheDocument()
    expect(screen.getByText('(-3; -36; -18) N')).toBeInTheDocument()
    expect(screen.getByText('(-10; -120; -70) m/s²')).toBeInTheDocument()
    expect(container.textContent).toContain('o polegar fica segundo v × B, isto é, −y e −z')
    const magnetic = container.querySelector('.lab-magnetism-vector-Fm')!
    fireEvent.click(screen.getByRole('button', { name: 'y para a frente' }))
    const before = magnetic.getAttribute('x2')
    fireEvent.click(screen.getByRole('button', { name: 'isométrica' }))
    expect(magnetic.getAttribute('x2')).not.toBe(before)
    const isometric = magnetic.getAttribute('y2')
    typeInto('vy', '4')
    expect(container.querySelector('.lab-magnetism-vector-Fm')!.getAttribute('y2')).not.toBe(isometric)
    typeInto('Carga q (com sinal)', '-3')
    expect(container.textContent).toContain('Como q < 0')
    expectClean(container)
  })

  it('vectors: exercises 2 and 10 from the URL', () => {
    const electron = open('magnetic_particles', 'vectors', 'v=8e6,0,0&B=0.0125,0.0216506,0&q=-1.6e-19&m=9.1e-31')
    expect(electron.container.textContent).toContain('|Fₘ| = 2,77×10⁻¹⁴ N')
    expect(screen.getAllByText('(0; 0; -2,77×10⁻¹⁴) N')).toHaveLength(2)
    expect(screen.getByText('3,05×10¹⁶ m/s²')).toBeInTheDocument()
    expect(screen.getByText('60°')).toBeInTheDocument()
    expectClean(electron.container)
    cleanup()
    const particle = open('magnetic_particles', 'vectors', 'v=0,2e6,0&B=0.02,0,0&E=0,0,4000&q=3e-11')
    expect(screen.getByText('(0; 0; -1,08×10⁻⁶) N')).toBeInTheDocument()
    expect(screen.getByText('indica a massa')).toBeInTheDocument()
    expectClean(particle.container)
  })

  it('selector: straight at v = E/B and bends when the speed changes', () => {
    const { container } = open('magnetic_particles', 'selector', 'E=39000&B=0.15&v=260000&q=1')
    expectActive('Seletor de velocidades')
    expect(screen.getByText('2,60×10⁵ m/s')).toBeInTheDocument()
    expect(container.textContent).toContain('segue em linha reta')
    const path = container.querySelector('.lab-magnetism-selector-path')!
    const straight = path.getAttribute('d')
    const magnetic = () => container.querySelector('.lab-magnetism-selector-fm')!
    const electric = () => container.querySelector('.lab-magnetism-selector-fe')!
    expect(Number(electric().getAttribute('x2'))).toBeGreaterThan(Number(electric().getAttribute('x1')))
    expect(Number(magnetic().getAttribute('x2'))).toBeLessThan(Number(magnetic().getAttribute('x1')))
    fireEvent.change(screen.getByRole('slider', { name: /Velocidade v/ }), { target: { value: '400' } })
    expect(path.getAttribute('d')).not.toBe(straight)
    expect(container.textContent).toContain('domina a força magnética')
    expect(container.textContent).toContain('bloqueada')
    fireEvent.click(screen.getByRole('button', { name: 'q negativa' }))
    expect(Number(electric().getAttribute('x2'))).toBeLessThan(Number(electric().getAttribute('x1')))
    fireEvent.change(screen.getByRole('slider', { name: /Campo magnético B/ }), { target: { value: '5' } })
    expectClean(container)
  })

  it('selector: exercise 10 b) gives 2,0×10⁵ m/s', () => {
    open('magnetic_particles', 'selector', 'E=4000&B=0.02&v=200000')
    expect(screen.getByText('2,00×10⁵ m/s')).toBeInTheDocument()
  })

  it('cyclotron: field and final speed for the deuteron', () => {
    const { container } = open('magnetic_particles', 'cyclotron', 'f=12&R=0.53&m=3.34e-27&q=1.6022e-19')
    expectActive('Ciclotrão')
    expect(screen.getByText('1,57 T')).toBeInTheDocument()
    expect(screen.getByText('3,996×10⁷ m/s')).toBeInTheDocument()
    expect(screen.getByText('16,6 MeV')).toBeInTheDocument()
    const spiral = container.querySelector('.lab-magnetism-cyclotron-spiral')!
    const before = spiral.getAttribute('d')
    fireEvent.change(screen.getByRole('slider', { name: /Raio do D/ }), { target: { value: '1.5' } })
    expect(spiral.getAttribute('d')).not.toBe(before)
    const clockwise = spiral.getAttribute('d')
    typeInto('Carga q (com sinal)', '-1.6022e-19')
    expect(container.querySelector('.lab-magnetism-cyclotron-spiral')!.getAttribute('d')).not.toBe(clockwise)
    expectClean(container)
  })

  it('wire-field: maximum and zero resultant at 1 cm', () => {
    const { container } = open('magnetic_particles', 'wire-field', 'I=1&Bext=20&r=1')
    expectActive('Fio num campo externo')
    expect(container.querySelector('.sim-result strong')).toHaveTextContent('20 μT')
    expect(screen.getByText('4,00×10⁻⁵ T')).toBeInTheDocument()
    expect(screen.getByText('0 T')).toBeInTheDocument()
    expect(container.textContent).toContain('B máx = 40 μT')
    expect(container.textContent).toContain('B mín = 0 μT')
    expect(container.querySelectorAll('.lab-magnetism-wirefield-sample')).toHaveLength(8)
    const mark = container.querySelector('.lab-magnetism-mark.max')!
    const below = Number(mark.getAttribute('cy'))
    expect(below).toBeGreaterThan(120)
    const ring = container.querySelector('.lab-magnetism-wirefield-ring')!
    const radius = ring.getAttribute('r')
    fireEvent.change(screen.getByRole('slider', { name: /Distância ao fio r/ }), { target: { value: '4' } })
    expect(ring.getAttribute('r')).not.toBe(radius)
    fireEvent.change(screen.getByRole('slider', { name: /Corrente I/ }), { target: { value: '-2' } })
    expect(Number(container.querySelector('.lab-magnetism-mark.max')!.getAttribute('cy'))).toBeLessThan(120)
    fireEvent.change(screen.getByRole('slider', { name: /Corrente I/ }), { target: { value: '0' } })
    fireEvent.change(screen.getByRole('slider', { name: /Campo externo/ }), { target: { value: '0' } })
    expectClean(container)
  })

  it('wire: force on a proton travelling along the current (exercise 16)', () => {
    const { container } = open('magnetic_particles', 'wire', 'I=5&r=0.004&v=1500')
    expectActive('Campo de um fio')
    expect(screen.getByText('250.00 μT')).toBeInTheDocument()
    expect(screen.getByText('6,01×10⁻²⁰ N')).toBeInTheDocument()
    expect(screen.getByText('0,375 N/C')).toBeInTheDocument()
    expect(screen.getByText('para o fio')).toBeInTheDocument()
    const force = container.querySelector('.lab-magnetism-wire-f')!
    expect(Number(force.getAttribute('x2'))).toBeLessThan(Number(force.getAttribute('x1')))
    const field = container.querySelector('.lab-magnetism-wire-b')!
    const up = field.getAttribute('y2')
    fireEvent.change(screen.getByRole('slider', { name: /Corrente I/ }), { target: { value: '-5' } })
    expect(container.querySelector('.lab-magnetism-wire-b')!.getAttribute('y2')).not.toBe(up)
    expectClean(container)
  })
})

describe('induction_sources laboratory scenarios', () => {
  it('generator: sinusoidal emf and current of the rotating loop', () => {
    const { container } = open('induction_sources', 'generator', 'B=0.63&r=0.11&N=1&w=250&R=10')
    expectActive('Espira a rodar')
    expect(screen.getByText('5,99 sen(250 t) V')).toBeInTheDocument()
    expect(container.textContent).toContain('i(t) = 0,599 sen(250 t) A')
    expect(screen.getByText('0,599 A')).toBeInTheDocument()
    const marker = container.querySelector('.lab-magnetism-marker.emf')!
    const normal = container.querySelector('.lab-magnetism-generator-normal')!
    const markerBefore = marker.getAttribute('cx')
    const normalBefore = normal.getAttribute('x2')
    fireEvent.change(screen.getByRole('slider', { name: /Instante t/ }), { target: { value: '0.5' } })
    expect(marker.getAttribute('cx')).not.toBe(markerBefore)
    expect(container.querySelector('.lab-magnetism-generator-normal')!.getAttribute('x2')).not.toBe(normalBefore)
    expect(screen.getByText('0 V')).toBeInTheDocument()
    const loop = container.querySelector('.lab-magnetism-loop')!
    const loopBefore = loop.getAttribute('y1')
    fireEvent.change(screen.getByRole('slider', { name: /Raio da espira/ }), { target: { value: '0.4' } })
    expect(container.querySelector('.lab-magnetism-loop')!.getAttribute('y1')).not.toBe(loopBefore)
    fireEvent.change(screen.getByRole('slider', { name: /Número de voltas N/ }), { target: { value: '3' } })
    expect(container.querySelectorAll('.lab-magnetism-loop')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'a rodar' }))
    fireEvent.click(screen.getByRole('button', { name: 'parada' }))
    expectClean(container)
  })

  it('transformer: turns ratio, currents and reflected resistance', () => {
    const { container } = open('induction_sources', 'transformer', 'vp=8500&vs=120&P=78000')
    expectActive('Transformador ideal')
    expect(screen.getByText('70,8')).toBeInTheDocument()
    expect(screen.getByText('9,18 A')).toBeInTheDocument()
    expect(screen.getByText('650 A')).toBeInTheDocument()
    expect(screen.getByText('0,185 Ω')).toBeInTheDocument()
    expect(screen.getByText('926 Ω')).toBeInTheDocument()
    expect(container.querySelectorAll('.lab-magnetism-turn.primary')).toHaveLength(16)
    expect(container.querySelectorAll('.lab-magnetism-turn.secondary')).toHaveLength(1)
    typeInto('Tensão no secundário Vs', '4250')
    expect(container.querySelectorAll('.lab-magnetism-turn.primary')).toHaveLength(4)
    expect(container.querySelectorAll('.lab-magnetism-turn.secondary')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'resistência Rₛ' }))
    expect(screen.getByRole('textbox', { name: 'Resistência de carga Rs' })).toBeInTheDocument()
    typeInto('Tensão no secundário Vs', '0')
    expectClean(container)
  })

  it('transformer: exercise 12 from the load resistance', () => {
    const { container } = open('induction_sources', 'transformer', 'vp=5980&vs=230&rs=4.4')
    expect(screen.getByText('26')).toBeInTheDocument()
    expect(screen.getByText('52,3 A')).toBeInTheDocument()
    expect(screen.getByText('2,01 A')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'resistência Rₛ' })).toHaveClass('active')
    expectClean(container)
  })

  it('faraday, motional and solenoid accept the sheet values from the URL', () => {
    const faraday = open('induction_sources', 'faraday', 'N=1&r=0.1&rate=0.1&R=2')
    expectActive('Fluxo variável')
    expect(screen.getByText('1,57×10⁻³ A')).toBeInTheDocument()
    const loop = faraday.container.querySelector('.lab-magnetism-faraday-loop')!
    const before = loop.getAttribute('r')
    fireEvent.change(screen.getByRole('slider', { name: /Raio/ }), { target: { value: '0.05' } })
    expect(loop.getAttribute('r')).not.toBe(before)
    expectClean(faraday.container)
    cleanup()

    const motional = open('induction_sources', 'motional', 'B=1.2&l=0.25&v=10')
    expect(screen.getByText('3.00 V')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Velocidade/ })).toHaveValue('10')
    expectClean(motional.container)
    cleanup()

    const solenoid = open('induction_sources', 'solenoid', 'N=1200&L=2.4&I=2400')
    expect(screen.getByText('1,51 T')).toBeInTheDocument()
    expect(screen.getByText('2 mm')).toBeInTheDocument()
    expect(screen.getByText('2390 A')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Espiras N/ })).toHaveValue('1200')
    expectClean(solenoid.container)
  })
})
