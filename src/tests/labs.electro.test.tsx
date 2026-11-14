import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import {
  E_CHARGE, chargedSheets, fieldAt, forceOnTestCharge, pairPendulum, parseCharges, parsePoint, planePendulum, potentialAt,
  releaseInField, sliderRange, transverseDeflection, workBetween, K, G, type PointCharge,
} from '../labs/electro/physics'
import { SimulatorsPage } from '../pages/SimulatorsPage'

afterEach(cleanup)

const renderLab = (query: string) => render(<MemoryRouter initialEntries={[`/simulators?${query}`]}><SimulatorsPage /></MemoryRouter>)

/** Compara com a resposta da ficha, que está arredondada: tolerância relativa. */
const expectClose = (actual: number, expected: number, relative = 0.01) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(Math.abs(expected) * relative)

const editField = (label: RegExp | string, value: string) => {
  const input = screen.getByRole('textbox', { name: label })
  fireEvent.change(input, { target: { value } })
  fireEvent.blur(input)
}

describe('electro physics — Folha 1', () => {
  it('exercise 5: field, potential, force and work in the square of charges', () => {
    const mm = 1e-3
    const charges: PointCharge[] = [{ x: 0, y: 5 * mm, q: E_CHARGE }, { x: 0, y: 0, q: 2 * E_CHARGE }, { x: 5 * mm, y: 0, q: E_CHARGE }]
    const P = { x: 2.5 * mm, y: 2.5 * mm }
    const A = { x: 5 * mm, y: 5 * mm }
    const field = fieldAt(charges, P)
    expectClose(field.total.magnitude, 2.3e-4)
    expectClose(field.total.x, 1.6e-4, 0.02)
    expectClose(field.total.y, 1.6e-4, 0.02)
    expect(field.total.angle).toBeCloseTo(45, 6)
    // As duas cargas +q estão em vértices opostos: os seus campos anulam-se em P.
    expect(Math.hypot(field.contributions[0].x + field.contributions[2].x, field.contributions[0].y + field.contributions[2].y)).toBeLessThan(1e-12 * field.contributions[0].magnitude)
    const potential = potentialAt(charges, P)
    expectClose(potential.total, 1.62e-6)
    expect(potential.terms).toHaveLength(3)
    expectClose(potential.terms[1], K * 2 * E_CHARGE / (Math.SQRT2 * 2.5 * mm), 1e-9)
    const force = forceOnTestCharge(charges, P, -100 * E_CHARGE)
    expectClose(force.x, -2.6e-21)
    expectClose(force.y, -2.6e-21)
    expectClose(force.magnitude, 3.68e-21, 0.002)
    expect(force.angle).toBeCloseTo(-135, 6)
    expectClose(workBetween(charges, P, A, -100 * E_CHARGE), -1.04e-23)
  })

  it('exercise 14: field of Q1 = 20 nC and Q2 = −80 nC at A and B', () => {
    const charges: PointCharge[] = [{ x: 0, y: 0, q: 20e-9 }, { x: 1, y: 0, q: -80e-9 }]
    const atA = fieldAt(charges, { x: 0.4, y: 0 }).total
    expectClose(atA.x, 3125, 0.002)
    expect(Math.abs(atA.y)).toBeLessThan(1e-9)
    const atB = fieldAt(charges, { x: 0.4, y: 0.5 }).total
    expectClose(atB.x, 1181, 0.002)
    expectClose(atB.y, -412, 0.002)
    const force = forceOnTestCharge(charges, { x: 0.4, y: 0.5 }, -15e-9)
    expectClose(force.magnitude, 1.87e-5, 0.005)
    // Carga negativa: força oposta ao campo, no 2.º quadrante (a ficha indica ≈ 19,8° com o semieixo negativo dos xx).
    expect(180 - force.angle).toBeCloseTo(Math.atan2(412, 1181) * 180 / Math.PI, 1)
  })

  it('exercise 12: potential midway and force on +3,0 nC', () => {
    const charges: PointCharge[] = [{ x: 0, y: 0, q: 5e-9 }, { x: 0.08, y: 0, q: 5e-9 }]
    expectClose(potentialAt(charges, { x: 0.04, y: 0 }).total, 2.25e3, 0.002)
    const force = forceOnTestCharge(charges, { x: -0.06, y: 0 }, 3e-9)
    expectClose(force.x, -4.44e-5, 0.003)
    expect(force.y).toBeCloseTo(0, 12)
    expect(Math.abs(force.angle)).toBeCloseTo(180, 6)
  })

  it('ignores a charge sitting exactly on the probe instead of dividing by zero', () => {
    const charges: PointCharge[] = [{ x: 0, y: 0, q: 1e-9 }, { x: 1, y: 0, q: 1e-9 }]
    const field = fieldAt(charges, { x: 0, y: 0 })
    expect(field.contributions[0].magnitude).toBe(0)
    expect(Number.isFinite(field.total.magnitude)).toBe(true)
    expect(Number.isFinite(potentialAt(charges, { x: 0, y: 0 }).total)).toBe(true)
  })

  it('parses charge lists and points from the URL', () => {
    expect(parseCharges('0,5,1;0,0,2;5,0,1')).toEqual([{ x: 0, y: 5, q: 1 }, { x: 0, y: 0, q: 2 }, { x: 5, y: 0, q: 1 }])
    expect(parseCharges('0,0,1e-9;oops;1,2')).toEqual([{ x: 0, y: 0, q: 1e-9 }])
    expect(parseCharges(undefined)).toEqual([])
    expect(parsePoint('2.5,-1')).toEqual({ x: 2.5, y: -1 })
    expect(parsePoint('2.5')).toBeNull()
  })

  it('exercise 19: bob hanging next to a charged vertical plane', () => {
    const result = planePendulum(0.040, 75e-9, 0.07, 22e-9 / 1e-4)
    expectClose(result.field, 12.42e6, 0.001)
    expect(Math.abs(result.theta * 180 / Math.PI - 67.17)).toBeLessThan(0.02)
    expect(result.tension).toBeCloseTo(Math.hypot(result.weight, result.electricForce), 12)
    expect(planePendulum(0.040, 0, 0.07, 2.2e-4).theta).toBe(0)
    expect(Number.isFinite(planePendulum(0, 75e-9, 0.07, 2.2e-4).theta)).toBe(true)
  })

  it('exercise 3: two pendulums satisfy sin²θ·tanθ = k·q²/(4·l²·m·g)', () => {
    const [m, q, l] = [1e-3, 100e-9, 0.2]
    const result = pairPendulum(m, q, l)
    expectClose(Math.sin(result.theta) ** 2 * Math.tan(result.theta), K * q * q / (4 * l * l * m * G), 1e-6)
    expectClose(result.separation, 2 * l * Math.sin(result.theta), 1e-12)
    // Para ângulos pequenos a estimativa (l·q²/(2π·ε₀·m·g))^(1/3) coincide com a solução exata.
    const small = pairPendulum(0.05, 5e-9, 0.5)
    expect(small.theta).toBeLessThan(0.02)
    expectClose(small.smallAngleSeparation, small.separation, 0.001)
    expect(pairPendulum(m, 0, l).theta).toBe(0)
    expect(pairPendulum(0, q, l).theta).toBe(0)
  })

  it('exercise 11: two charged sheets', () => {
    const result = chargedSheets(6.8e-6, 4.3e-6, 5e-3, -3.5e-6)
    expectClose(result.between, 6.3e5)
    expectClose(result.deltaV, 3.15e3)
    expectClose(result.work, -11e-3)
    expect(result.left).toBeLessThan(0)
    expect(result.right).toBeGreaterThan(0)
    expectClose(Math.abs(result.left), result.fieldPlus - result.fieldMinus, 1e-12)
    expect(chargedSheets(5e-6, 5e-6, 5e-3, 1e-6).left).toBe(0)
  })

  it('exercise 10: proton released in a uniform field', () => {
    const result = releaseInField(8.0e4, 0.5, 1.6e-19, 1.67e-27)
    expectClose(result.force, 1.3e-14, 0.02)
    expectClose(result.deltaV, 4.0e4, 1e-12)
    expectClose(result.kineticEnergy, 6.4e-15, 1e-9)
    expectClose(result.speed, Math.sqrt(2 * 6.4e-15 / 1.67e-27), 1e-9)
    expect(result.forceToWeight).toBeGreaterThan(1e11)
    expect(releaseInField(8.0e4, 0.5, 1.6e-19, 0).speed).toBe(0)
  })

  it('exercise 6: ink drop deflected upwards by a downward field', () => {
    const result = transverseDeflection(1.4e6, -1.5e-13, 1.3e-10, 18, 0.016)
    expectClose(result.deflection, 6.4e-4)
    expect(result.deflection).toBeGreaterThan(0)
    expect(transverseDeflection(1.4e6, 1.5e-13, 1.3e-10, 18, 0.016).deflection).toBeLessThan(0)
    expect(transverseDeflection(1.4e6, -1.5e-13, 1.3e-10, 0, 0.016).deflection).toBe(0)
  })

  it('widens slider ranges instead of clamping URL values', () => {
    expect(sliderRange(100, 20, 300, 5)).toEqual({ min: 20, max: 300, step: 5 })
    expect(sliderRange(0.2, -6, 6, 1)).toEqual({ min: -6, max: 6, step: 0.1 })
    const wide = sliderRange(1000, 20, 300, 5)
    expect(wide.max).toBeGreaterThanOrEqual(1000)
    const narrow = sliderRange(0.05, 0.5, 5, 0.1)
    expect(narrow.min).toBeLessThanOrEqual(0.05)
    expect(narrow.min).toBeGreaterThan(0)
  })
})

describe('electro lab scenarios', () => {
  it('charges: opens exercise 5 by default with the sheet answers and reacts to the probe', () => {
    const { container } = renderLab('family=electrostatics&scenario=charges')
    expect(screen.getByRole('button', { name: 'Mapa de cargas' })).toHaveClass('active')
    const text = () => container.textContent ?? ''
    expect(text()).toContain('2,30×10⁻⁴ N/C') // |E| = 2,3×10⁻⁴ N/C
    expect(text()).toContain('(1,63×10⁻⁴ êₓ + 1,63×10⁻⁴ êᵧ) N/C') // E = (1,6 êx + 1,6 êy)×10⁻⁴ N/C
    expect(text()).toContain('1,63×10⁻⁶ V') // V = 1,62×10⁻⁶ V na ficha (arredondamento)
    expect(text()).toContain('(-2,60×10⁻²¹ êₓ − 2,60×10⁻²¹ êᵧ) N') // F = (−2,6 êx − 2,6 êy)×10⁻²¹ N
    expect(text()).toContain('3,68×10⁻²¹ N')
    expect(text()).toContain('-1,03×10⁻²³ J') // W = −1,04×10⁻²³ J na ficha (arredondamento)
    expect(text()).toContain('45,0°')

    const total = container.querySelector('.lab-electro-e-total')!
    const before = total.getAttribute('x2')
    fireEvent.change(screen.getByRole('slider', { name: /Posição x de P/ }), { target: { value: '4' } })
    expect(total.getAttribute('x2')).not.toBe(before)
    expect(text()).not.toContain('2,30×10⁻⁴ N/C')

    const probe = container.querySelector('.lab-electro-probe')!
    const probeBefore = probe.getAttribute('cx')
    fireEvent.click(container.querySelector('.lab-electro-map')!, { clientX: 120, clientY: 60 })
    expect(probe.getAttribute('cx')).not.toBe(probeBefore)
    expect(text()).not.toMatch(/NaN|Infinity/)

    fireEvent.click(screen.getByRole('button', { name: 'Repor dados do exercício' }))
    expect(text()).toContain('2,30×10⁻⁴ N/C')
    editField('Carga q₂', '-2')
    expect(text()).toContain('-135,0°')
    editField('Carga q₂', '0')
    expect(container.querySelector('.lab-electro-e-total')).not.toBeInTheDocument()
    expect(text()).not.toMatch(/NaN|Infinity/)
    fireEvent.click(screen.getByRole('button', { name: 'Repor dados do exercício' }))
    expect(text()).toContain('3,68×10⁻²¹ N')
  })

  it('charges: reproduces exercises 14 and 12 from URL parameters', () => {
    const first = renderLab('family=electrostatics&scenario=charges&c=0,0,20;100,0,-80&lu=cm&qu=nC&p=40,0&names=Q1,Q2&pn=A')
    expect(first.container.textContent).toContain('3120 N/C') // 3125 êx V/m com k = 9×10⁹
    expect(first.container.textContent).toContain('Q2 = -80 nC')
    expect(first.container.textContent).not.toMatch(/NaN|Infinity/)
    cleanup()

    const second = renderLab('family=electrostatics&scenario=charges&c=0,0,20;100,0,-80&lu=cm&qu=nC&p=40,50&names=Q1,Q2&pn=B&qt=-15')
    expect(second.container.textContent).toContain('(1180 êₓ − 412 êᵧ) N/C') // 1181 êx − 412 êy V/m
    expect(second.container.textContent).toContain('1,87×10⁻⁵ N')
    cleanup()

    const third = renderLab('family=electrostatics&scenario=charges&c=0,0,5;8,0,5&lu=cm&qu=nC&p=4,0')
    expect(third.container.textContent).toContain('2250 V') // 22,5×10² V
    expect(third.container.textContent).not.toMatch(/NaN|Infinity/)
    cleanup()

    const fourth = renderLab('family=electrostatics&scenario=charges&c=0,0,5;8,0,5&lu=cm&qu=nC&p=-6,0&qt=3')
    expect(fourth.container.textContent).toContain('4,43×10⁻⁵ N') // 4,44×10⁻⁵ N com k = 9×10⁹
    expect(fourth.container.textContent).toContain('180,0°')
  })

  it('pendulum: reproduces exercise 19 and redraws the string at the real angle', () => {
    const { container } = renderLab('family=electrostatics&scenario=pendulum&mode=plane&m=40&q=75&l=7&sigma=22')
    expect(screen.getByRole('button', { name: 'Pêndulos carregados' })).toHaveClass('active')
    expect(container.textContent).toContain('67,2°') // θ = 67,17°
    expect(container.textContent).toContain('1,24×10⁷ V/m') // E = 12,42×10⁶ V/m
    const string = () => [...container.querySelectorAll('.lab-electro-string')].at(-1)!
    const before = string().getAttribute('x2')
    fireEvent.change(screen.getByRole('slider', { name: /Carga q/ }), { target: { value: '20' } })
    expect(string().getAttribute('x2')).not.toBe(before)
    fireEvent.change(screen.getByRole('slider', { name: /Densidade de carga/ }), { target: { value: '0' } })
    expect(container.textContent).toContain('0,0°')
    expect(container.textContent).not.toMatch(/NaN|Infinity/)

    fireEvent.click(screen.getByRole('button', { name: 'Dois pêndulos' }))
    expect(container.querySelectorAll('.lab-electro-bob')).toHaveLength(2)
    const pairBefore = string().getAttribute('x2')
    fireEvent.change(screen.getByRole('slider', { name: /Carga q/ }), { target: { value: '200' } })
    expect(string().getAttribute('x2')).not.toBe(pairBefore)
    fireEvent.change(screen.getByRole('slider', { name: /Carga q/ }), { target: { value: '0' } })
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('pendulum: mode=pair shows the exact and the small-angle separation', () => {
    const { container } = renderLab('family=electrostatics&scenario=pendulum&mode=pair&m=1&q=100&l=20')
    const exact = pairPendulum(1e-3, 100e-9, 0.2)
    expect(container.textContent).toContain(`${(exact.theta * 180 / Math.PI).toFixed(1).replace('.', ',')}°`)
    expect(container.textContent).toContain('Estimativa (ângulos pequenos)')
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('sheets: reproduces exercise 11 and redraws the fields outside the plates', () => {
    const { container } = renderLab('family=uniform_fields&scenario=sheets&sp=6.8&sm=4.3&d=5&q=-3.5')
    expect(screen.getByRole('button', { name: 'Duas placas carregadas' })).toHaveClass('active')
    expect(container.textContent).toContain('6,27×10⁵ N/C') // 6,3×10⁵ N/C
    expect(container.textContent).toContain('3,13 kV') // 3,15 kV na ficha (com E arredondado)
    expect(container.textContent).toContain('-11 mJ') // −11×10⁻³ J
    const outside = () => container.querySelector('.lab-electro-region-left .lab-electro-e-total')
    const before = outside()!.getAttribute('x2')
    fireEvent.change(screen.getByRole('slider', { name: /Placa negativa/ }), { target: { value: '1' } })
    expect(outside()!.getAttribute('x2')).not.toBe(before)
    // Densidades iguais: o campo anula-se fora das placas e a seta desaparece.
    fireEvent.change(screen.getByRole('slider', { name: /Placa negativa/ }), { target: { value: '6.8' } })
    expect(outside()).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider', { name: /Placa positiva/ }), { target: { value: '0' } })
    fireEvent.change(screen.getByRole('slider', { name: /Placa negativa/ }), { target: { value: '0' } })
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('release: reproduces exercise 10 and moves the particle between A and B', () => {
    const { container } = renderLab('family=uniform_fields&scenario=release&E=8e4&d=0.5&q=1.6e-19&m=1.67e-27')
    expect(screen.getByRole('button', { name: 'Carga abandonada no campo' })).toHaveClass('active')
    expect(container.textContent).toContain('1,28×10⁻¹⁴ N') // 1,3×10⁻¹⁴ N
    expect(container.textContent).toContain('4,00×10⁴ V')
    expect(container.textContent).toContain('6,40×10⁻¹⁵ J')
    const particle = container.querySelector('.lab-electro-particle')!
    const bar = container.querySelector('.lab-electro-energy-kinetic')!
    const [cx, width] = [particle.getAttribute('cx'), bar.getAttribute('width')]
    fireEvent.change(screen.getByRole('slider', { name: /Posição entre A e B/ }), { target: { value: '100' } })
    expect(particle.getAttribute('cx')).not.toBe(cx)
    expect(bar.getAttribute('width')).not.toBe(width)
    // Carga negativa: sobe o campo, por isso a partícula passa para o outro lado.
    const positiveSide = particle.getAttribute('cx')
    editField('Carga q', '-1.6e-19')
    expect(container.querySelector('.lab-electro-particle')!.getAttribute('cx')).not.toBe(positiveSide)
    editField('Massa m', '0')
    editField('Campo E', '0')
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('motion: physical parameters reproduce the ink-jet exercise 6', () => {
    const { container } = renderLab('family=uniform_fields&scenario=motion&E=1.4e6&q=-1.5e-13&m=1.3e-10&vx=18&L=0.016')
    expect(screen.getByRole('button', { name: 'Lançamento transversal' })).toHaveClass('active')
    expect(container.textContent).toContain('6,38×10⁻⁴ m') // 6,4×10⁻⁴ m
    expect(container.textContent).toContain('para cima')
    const path = container.querySelector('.lab-electro-trajectory')!
    const before = path.getAttribute('d')
    editField('Carga q', '1.5e-13')
    expect(container.querySelector('.lab-electro-trajectory')!.getAttribute('d')).not.toBe(before)
    expect(container.textContent).toContain('para baixo')
    editField('Velocidade inicial vₓ', '0')
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('motion: keeps the original slider version when no physical parameter is given', () => {
    const { container } = renderLab('family=uniform_fields&scenario=motion')
    expect(container.querySelector('.particle-path')).toBeInTheDocument()
    expect(container.querySelector('.lab-electro-trajectory')).not.toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Velocidade horizontal/ })).toBeInTheDocument()
  })

  it('pair: accepts q1, q2 and r and widens the sliders for out-of-range values', () => {
    const first = renderLab('family=electrostatics&scenario=pair&q1=2&q2=-3&r=0.5')
    expect(screen.getByRole('button', { name: 'Duas cargas' })).toHaveClass('active')
    expect(screen.getByRole('slider', { name: /Distância r/ })).toHaveValue('0.5')
    expect(first.container.textContent).toContain('0.2158 N')
    expect(first.container.textContent).toContain('atração')
    cleanup()

    renderLab('family=electrostatics&scenario=pair&q1=20&q2=2.5&r=0.05')
    expect(screen.getByRole('slider', { name: /Carga q₁/ })).toHaveValue('20')
    expect(screen.getByRole('slider', { name: /Carga q₂/ })).toHaveValue('2.5')
    expect(screen.getByRole('slider', { name: /Distância r/ })).toHaveValue('0.05')
  })

  it('plates: accepts V, d and q and reproduces exercise 7', () => {
    const first = renderLab('family=uniform_fields&scenario=plates&V=300&d=0.05&q=0.2')
    expect(screen.getByRole('button', { name: 'Campo entre placas' })).toHaveClass('active')
    expect(first.container.textContent).toContain('6000 V/m')
    expect(first.container.textContent).toContain('F=1.20e-3 N') // 1,2×10⁻³ N
    expect(screen.getByRole('slider', { name: /Carga/ })).toHaveValue('0.2')
    expect(first.container.querySelector('.force-right')).toBeInTheDocument()
    cleanup()

    const second = renderLab('family=uniform_fields&scenario=plates&V=1000&d=0.5&q=-12')
    expect(screen.getByRole('slider', { name: /Diferença de potencial/ })).toHaveValue('1000')
    expect(screen.getByRole('slider', { name: /Separação/ })).toHaveValue('0.5')
    expect(screen.getByRole('slider', { name: /Carga/ })).toHaveValue('-12')
    expect(second.container.textContent).toContain('2000 V/m')
    expect(second.container.textContent).not.toMatch(/NaN|Infinity/)
  })
})
