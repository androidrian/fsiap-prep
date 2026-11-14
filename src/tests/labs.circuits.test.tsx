import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SimulatorsPage } from '../pages/SimulatorsPage'
import {
  NetParseError,
  loadedDivider,
  parallelPlate,
  parseNetwork,
  rcState,
  rcSwitch,
  realSource,
  scaleNetwork,
  solveBranches,
  solveNetwork,
  wireMaxCurrent,
  wireMinDiameter,
  wireProperties,
} from '../labs/circuits/physics'

afterEach(cleanup)

const EX23 = 'p(s(4,p(10,s(5,10))),s(5,p(10,10)))'

const renderLab = (family: string, scenario: string, query = '') => render(
  <MemoryRouter initialEntries={[`/simulators?family=${family}&scenario=${scenario}${query ? `&${query}` : ''}`]}><SimulatorsPage /></MemoryRouter>,
)
const result = (container: HTMLElement) => container.querySelector('.sim-result strong')!
const setField = (name: RegExp | string, value: string) => {
  const field = screen.getByRole('textbox', { name })
  fireEvent.change(field, { target: { value } })
  fireEvent.blur(field)
}
/** Leva todos os cursores ao mínimo e depois ao máximo e confirma que nada rebenta. */
const sweepSliders = (container: HTMLElement) => {
  for (const edge of ['min', 'max'] as const) {
    for (const slider of screen.getAllByRole('slider')) fireEvent.change(slider, { target: { value: slider.getAttribute(edge) } })
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  }
}

describe('circuit physics', () => {
  it('parses nested series/parallel expressions and numbers the components', () => {
    const tree = parseNetwork(` ${EX23} `)
    expect(tree.kind).toBe('parallel')
    expect(solveNetwork(tree, 'resistance', { voltage: 12 }).leaves.map((leaf) => leaf.value)).toEqual([4, 10, 5, 10, 5, 10, 10])
    expect(parseNetwork('S(2k, 1.5e3, .5M)')).toEqual({ kind: 'series', children: [{ kind: 'leaf', value: 2000, id: 1 }, { kind: 'leaf', value: 1500, id: 2 }, { kind: 'leaf', value: 500000, id: 3 }] })
    expect(parseNetwork('47')).toEqual({ kind: 'leaf', value: 47, id: 1 })
  })

  it('reports clear parse errors with a position', () => {
    const message = (text: string) => { try { parseNetwork(text) } catch (error) { if (error instanceof NetParseError) return `${error.position}:${error.message}` } return 'ok' }
    expect(message('')).toMatch(/Escreve uma associação/)
    expect(message('s(4,p(10,15)')).toMatch(/Falta fechar/)
    expect(message('s(4,-5)')).toMatch(/^4:.*positivos/)
    expect(message('s(4,0)')).toMatch(/positivos/)
    expect(message('s(4)')).toMatch(/pelo menos dois/)
    expect(message('s()')).toMatch(/vazio/)
    expect(message('s 4,5)')).toMatch(/Falta "\("/)
    expect(message('4,5')).toMatch(/s\(…\) ou p\(…\)/)
    expect(message('s(4,x)')).toMatch(/^4:Esperava um número/)
    expect(message('s(4,5))')).toMatch(/Texto a mais/)
    expect(message('b(1,2,3)')).toMatch(/exatamente 5/)
  })

  it('solves sheet 2 exercise 23 (series/parallel reduction)', () => {
    const solution = solveNetwork(parseNetwork(EX23), 'resistance', { voltage: 12 })
    expect(solution.equivalent).toBeCloseTo(5, 10)
    expect(solution.flow).toBeCloseTo(2.4, 10)
    const currents = solution.leaves.map((leaf) => leaf.flow)
    ;[1.2, 0.72, 0.48, 0.48, 1.2, 0.6, 0.6].forEach((expected, index) => expect(currents[index]).toBeCloseTo(expected, 10))
    expect(solution.steps.map((step) => Number(step.result.toFixed(6)))).toEqual([15, 6, 10, 5, 10, 5])
    expect(solution.steps[0]).toMatchObject({ kind: 'series', operands: [5, 10] })
    expect(solution.leaves.reduce((sum, leaf) => sum + leaf.work, 0)).toBeCloseTo(solution.work, 10)
    // Mesma rede com a corrente total imposta.
    expect(solveNetwork(parseNetwork(EX23), 'resistance', { flow: 2.4 }).voltage).toBeCloseTo(12, 10)
  })

  it('solves sheet 2 exercise 7 (bridge, 1 mA)', () => {
    const solution = solveNetwork(parseNetwork('b(2000,1000,1000,2000,1000)'), 'resistance', { flow: 1e-3 })
    expect(solution.equivalent).toBeCloseTo(1400, 8)
    const milliamps = solution.leaves.map((leaf) => leaf.flow * 1e3)
    ;[0.4, 0.6, 0.6, 0.4, 0.2].forEach((expected, index) => expect(milliamps[index]).toBeCloseTo(expected, 10))
    expect(solution.leaves[4].reversed).toBe(true)
    // Ponte equilibrada: sem corrente no elemento central.
    expect(solveNetwork(parseNetwork('b(1,2,2,4,7)'), 'resistance', { voltage: 6 }).leaves[4].flow).toBeCloseTo(0, 12)
  })

  it('solves sheet 2 exercise 21 (capacitor association)', () => {
    const solution = solveNetwork(scaleNetwork(parseNetwork('p(s(4,15),12)'), 1e-6), 'capacitance', { voltage: 200 })
    expect(solution.equivalent * 1e6).toBeCloseTo(15.158, 3)
    expect(solution.leaves[0].flow * 1e6).toBeCloseTo(631.6, 1)
    expect(solution.leaves[1].flow * 1e6).toBeCloseTo(631.6, 1)
    expect(solution.leaves[2].flow * 1e3).toBeCloseTo(2.4, 10)
    expect(solution.leaves[0].voltage + solution.leaves[1].voltage).toBeCloseTo(200, 8)
    expect(solution.work).toBeCloseTo(0.303, 3)
  })

  it('solves three branches between two nodes (exercises 20 and 9)', () => {
    const ex20 = solveBranches([{ emf: -10, resistance: 6 }, { emf: 0, resistance: 2 }, { emf: 14, resistance: 4 }])
    expect(ex20.vab).toBeCloseTo(2, 10)
    ;[-2, -1, 3].forEach((expected, index) => expect(ex20.currents[index]).toBeCloseTo(expected, 10))
    expect(ex20.delivered).toBeCloseTo(62, 10)
    expect(ex20.dissipated).toBeCloseTo(62, 10)
    // V_CD = V_AB + 1 Ω · I₃ − 6 Ω · |I₂| = −7 V
    expect(ex20.vab + 1 * ex20.currents[2] - 6 * Math.abs(ex20.currents[0])).toBeCloseTo(-7, 10)
    const ex9 = solveBranches([{ emf: 2, resistance: 2 }, { emf: 4, resistance: 4 }, { emf: 2, resistance: 2 }])
    expect(ex9.vab).toBeCloseTo(12 / 5, 10)
    const opened = solveBranches([{ emf: -10, resistance: 6 }, { emf: 0, resistance: 2 }, { emf: 14, resistance: 4 }], 1)
    expect(opened.currents[0]).toBe(0)
    expect(opened.currents[1] + opened.currents[2]).toBeCloseTo(0, 10)
    expect(opened.currents[2]).toBeCloseTo(14 / 6, 10)
  })

  it('reproduces the real source table of exercise 6', () => {
    const milliwatts = [25, 50, 75, 100, 125].map((load) => realSource(10, 75, load).loadPower * 1e3)
    ;[250, 320, 333.3, 326.5, 312.5].forEach((expected, index) => expect(milliwatts[index]).toBeCloseTo(expected, 1))
    expect(realSource(10, 75, 75).efficiency).toBeCloseTo(0.5, 10)
    expect(realSource(10, 75, 75).maxPower).toBeCloseTo(realSource(10, 75, 75).loadPower, 10)
    expect(realSource(10, 0, 0).current).toBe(0)
  })

  it('reproduces the loaded voltmeter of exercise 10', () => {
    const cheap = loadedDivider(6, 100e3, 200e3, 100e3)
    expect(cheap.trueVoltage).toBeCloseTo(2, 10)
    expect(cheap.measuredVoltage).toBeCloseTo(1.2, 10)
    expect(cheap.errorPercent).toBeCloseTo(-40, 8)
    const good = loadedDivider(6, 100e3, 200e3, 10e6)
    expect(good.measuredVoltage).toBeCloseTo(1.99, 2)
    expect(good.errorPercent).toBeCloseTo(-0.662, 3)
    expect(loadedDivider(6, 100e3, 200e3, 0).measuredVoltage).toBeCloseTo(2, 10)
  })

  it('reproduces the copper wire of exercises 1 and 5', () => {
    const thick = wireProperties(3.62e-3, 1.72e-8, 1, 5.8e28)
    expect(thick.resistancePerMetre).toBeCloseTo(1.67e-3, 5)
    expect(wireMaxCurrent(thick.resistancePerMetre, 3)).toBeCloseTo(42.4, 1)
    expect(wireMinDiameter(1.72e-8, 100, 3) * 1e3).toBeCloseTo(8.5, 1)
    expect(wireProperties(1e-3, 1.72e-8, 1, 5.8e28).driftSpeed).toBeCloseTo(1.37e-4, 6)
    expect(wireProperties(0, 1.72e-8, 1, 0).driftSpeed).toBe(0)
  })

  it('reproduces the RC switch of exercise 14', () => {
    const summary = rcSwitch(5e-6, 10, 1000, 3)
    expect(summary.tauCharge).toBeCloseTo(5e-3, 12)
    expect(summary.tauDischarge).toBeCloseTo(15e-6, 12)
    expect(summary.initialChargeCurrent).toBeCloseTo(10e-3, 12)
    expect(summary.initialDischargeCurrent).toBeCloseTo(3.33, 2)
    expect(summary.halfChargeCurrent).toBeCloseTo(5e-3, 12)
    expect(summary.finalCharge).toBeCloseTo(50e-6, 12)
    expect(summary.energy).toBeCloseTo(250e-6, 12)
    const half = rcState('charge', 10, 1000, 5e-6, 5e-3 * Math.LN2)
    expect(half.fraction).toBeCloseTo(0.5, 10)
    expect(half.current).toBeCloseTo(5e-3, 10)
    expect(rcState('discharge', 10, 3, 5e-6, 15e-6).voltage).toBeCloseTo(3.679, 3)
    expect(rcState('charge', 10, 0, 0, 1).current).toBe(0)
  })

  it('reproduces the parallel-plate capacitors of sheet 1 ex. 15 and sheet 2 ex. 12', () => {
    const film = parallelPlate(4.91, 0.2e-3, 2.3, 80)
    expect(film.capacitance * 1e6).toBeCloseTo(0.5, 3)
    expect(film.energy).toBeCloseTo(1.6e-3, 5)
    expect(film.field).toBeCloseTo(4e5, 6)
    const key = parallelPlate(100e-6, 5e-3, 3, 5)
    expect(key.capacitance * 1e12).toBeCloseTo(0.531, 3)
    const pressed = 3 * 8.8541878128e-12 * 100e-6 / (key.capacitance + 20e-12)
    expect((5e-3 - pressed) * 1e3).toBeCloseTo(4.87, 2)
    expect(parallelPlate(1, 0, 1, 10).capacitance).toBe(0)
  })
})

describe('circuit lab scenarios', () => {
  it('reduces the association of exercise 23 step by step', () => {
    const { container } = renderLab('dc_circuits', 'network', `net=${EX23}&V=12`)
    expect(screen.getByRole('button', { name: 'Redutor série/paralelo' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('5 Ω')
    expect(screen.getByText('10 Ω ∥ 15 Ω = 6 Ω')).toBeInTheDocument()
    expect(screen.getByText('5 Ω + 10 Ω = 15 Ω')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /^R₁/ })).toHaveTextContent('1,2 A')
    expect(screen.getByRole('row', { name: /^R₂/ })).toHaveTextContent('0,72 A')
    expect(screen.getByRole('row', { name: /^R₃/ })).toHaveTextContent('0,48 A')
    expect(screen.getByRole('row', { name: /^Total/ })).toHaveTextContent('2,4 A')
    expect(container.querySelectorAll('.lab-circuits-net .lab-circuits-element')).toHaveLength(7)

    const stage = container.querySelector('.lab-circuits-net')!
    const before = stage.getAttribute('aria-label')
    const lead = container.querySelector('.lab-circuits-net .lab-circuits-lead')!.getAttribute('style')
    setField('Tensão aplicada entre A e B', '24')
    expect(stage.getAttribute('aria-label')).not.toBe(before)
    expect(screen.getByRole('row', { name: /^Total/ })).toHaveTextContent('4,8 A')

    fireEvent.change(screen.getByRole('textbox', { name: 'Associação entre A e B' }), { target: { value: 's(4,p(6,3))' } })
    expect(result(container)).toHaveTextContent('6 Ω')
    expect(container.querySelectorAll('.lab-circuits-net .lab-circuits-element')).toHaveLength(3)
    expect(container.querySelector('.lab-circuits-net .lab-circuits-lead')!.getAttribute('style')).not.toBe(lead)

    fireEvent.change(screen.getByRole('textbox', { name: 'Associação entre A e B' }), { target: { value: 's(4,p(6,' } })
    expect(screen.getByRole('alert')).toHaveTextContent(/acabou cedo/)
    expect(result(container)).toHaveTextContent('6 Ω')
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('expresses the bridge of exercise 7 in kΩ and mA from the total current', () => {
    const { container } = renderLab('dc_circuits', 'network', 'net=b(2000,1000,1000,2000,1000)&I=0.001&unit=kohm')
    expect(result(container)).toHaveTextContent('1,4 kΩ')
    expect(screen.getByRole('row', { name: /^R₁/ })).toHaveTextContent('0,4 mA')
    expect(screen.getByRole('row', { name: /^R₂/ })).toHaveTextContent('0,6 mA')
    expect(screen.getByRole('row', { name: /^R₅/ })).toHaveTextContent('0,2 mA')
    expect(screen.getByRole('row', { name: /^Total/ })).toHaveTextContent('1 mA')
    fireEvent.click(screen.getByRole('button', { name: 'Tensão total' }))
    expect(screen.getByRole('textbox', { name: 'Tensão aplicada entre A e B' })).toHaveValue('1.4')
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('falls back to the reference association when the URL expression is invalid', () => {
    const { container } = renderLab('dc_circuits', 'network', 'net=s(4,')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(result(container)).toHaveTextContent('5 Ω')
  })

  it('solves the three branches of exercise 20 and reacts to sources and switches', () => {
    const { container } = renderLab('dc_circuits', 'kirchhoff', 'e1=-10&r1=6&e2=0&r2=2&e3=14&r3=4')
    expect(screen.getByRole('button', { name: '3 ramos entre dois nós' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('2 V')
    expect(screen.getByText('−2 A · de a para b')).toBeInTheDocument()
    expect(screen.getByText('−1 A · de a para b')).toBeInTheDocument()
    expect(screen.getByText('3 A · de b para a')).toBeInTheDocument()
    expect(screen.getByText('I₁ + I₂ + I₃ = (−2) + (−1) + 3 = 0 A')).toBeInTheDocument()
    expect(screen.getByText('Verificação: Σ ε·I = 62 W = Σ R·I² = 62 W')).toBeInTheDocument()
    expect(screen.getByText('fornece 20 W')).toBeInTheDocument()

    const arrow = container.querySelector('[data-branch="1"] .lab-circuits-current')!
    const before = arrow.getAttribute('y1')
    const plate = container.querySelector('[data-branch="3"] .lab-circuits-plate-long')!
    const polarity = plate.getAttribute('y1')
    fireEvent.change(screen.getByRole('slider', { name: /f\.e\.m\. do ramo 3/ }), { target: { value: '20' } })
    expect(arrow.getAttribute('y1')).not.toBe(before)
    fireEvent.change(screen.getByRole('slider', { name: /f\.e\.m\. do ramo 3/ }), { target: { value: '-20' } })
    expect(container.querySelector('[data-branch="3"] .lab-circuits-plate-long')!.getAttribute('y1')).not.toBe(polarity)

    fireEvent.click(screen.getByRole('button', { name: 'ramo 2' }))
    expect(container.querySelector('[data-branch="2"]')).toHaveClass('is-open')
    expect(screen.getByText('ramo aberto')).toBeInTheDocument()
    sweepSliders(container)
  })

  it('reproduces V_ab = 12/5 V of exercise 9 and opens a branch from the URL', () => {
    const { container } = renderLab('dc_circuits', 'kirchhoff', 'e1=2&r1=2&e2=4&r2=4&e3=2&r3=2')
    expect(result(container)).toHaveTextContent('2,4 V')
    cleanup()
    const opened = renderLab('dc_circuits', 'kirchhoff', 'e1=2&r1=2&e2=4&r2=4&e3=2&r3=2&open=2')
    expect(opened.container.querySelector('[data-branch="2"]')).toHaveClass('is-open')
    expect(result(opened.container)).toHaveTextContent('2 V')
  })

  it('shows the maximum power transfer of exercise 6', () => {
    const { container } = renderLab('dc_circuits', 'source', 'emf=10&rin=75&r=75')
    expect(screen.getByRole('button', { name: 'Fonte real e potência máxima' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('333,3 mW')
    for (const [load, power] of [['25 Ω', '250 mW'], ['50 Ω', '320 mW'], ['75 Ω', '333,3 mW'], ['100 Ω', '326,5 mW'], ['125 Ω', '312,5 mW']]) {
      expect(screen.getByRole('row', { name: new RegExp(`^${load}`) })).toHaveTextContent(power)
    }
    expect(screen.getAllByText('50 %').length).toBeGreaterThanOrEqual(1)
    const marker = container.querySelector('.lab-circuits-source .lab-circuits-marker')!
    const before = marker.getAttribute('cx')
    fireEvent.change(screen.getByRole('slider', { name: /Resistência de carga R/ }), { target: { value: '25' } })
    expect(marker.getAttribute('cx')).not.toBe(before)
    expect(result(container)).toHaveTextContent('250 mW')
    expect(screen.getAllByText('25 %').length).toBeGreaterThanOrEqual(1)
    sweepSliders(container)
  })

  it('shows the loading error of a real voltmeter (exercise 10)', () => {
    const { container } = renderLab('dc_circuits', 'meter', 'V=6&r1=100&r2=200&rv=100')
    expect(screen.getByRole('button', { name: 'Voltímetro real' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('1,2 V')
    expect(screen.getByText('2 V')).toBeInTheDocument()
    expect(screen.getByText('−40 %')).toBeInTheDocument()
    const needle = container.querySelector('.lab-circuits-needle')!
    const before = needle.getAttribute('x2')
    fireEvent.click(screen.getByRole('button', { name: '10 MΩ' }))
    expect(needle.getAttribute('x2')).not.toBe(before)
    expect(result(container)).toHaveTextContent('1,99 V')
    expect(screen.getByText('−0,662 %')).toBeInTheDocument()
    const afterMeter = needle.getAttribute('x2')
    fireEvent.change(screen.getByRole('slider', { name: /Resistência em série R₂/ }), { target: { value: '100' } })
    expect(needle.getAttribute('x2')).not.toBe(afterMeter)
    setField(/Resistência interna do voltímetro/, '0')
    expect(screen.getByText('0 %')).toBeInTheDocument()
    sweepSliders(container)
  })

  it('computes resistance per metre, current limit and drift speed of a copper wire', () => {
    const { container } = renderLab('dc_circuits', 'wire', 'd=3.62&rho=1.72e-8&I=1&n=5.8e28')
    expect(screen.getByRole('button', { name: 'Fio condutor' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('1,67×10⁻³ Ω/m')
    expect(screen.getByText('42,4 A')).toBeInTheDocument()
    const section = container.querySelector('circle.lab-circuits-copper')!
    const before = section.getAttribute('r')
    fireEvent.change(screen.getByRole('slider', { name: /Diâmetro d/ }), { target: { value: '1' } })
    expect(section.getAttribute('r')).not.toBe(before)
    expect(screen.getByText('1,37×10⁻⁴ m/s')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider', { name: /Corrente I/ }), { target: { value: '100' } })
    expect(screen.getByText('8,54 mm')).toBeInTheDocument()
    expect(container.querySelector('.lab-circuits-wire-stage')).toHaveClass('is-over')
    setField(/Eletrões livres/, '0')
    sweepSliders(container)
  })

  it('toggles the RC switch of exercise 14 between charge and discharge', () => {
    const { container } = renderLab('rc_circuits', 'switch', 'V=10&C=5&rc=1000&rd=3')
    expect(screen.getByRole('button', { name: 'Comutador carga/descarga' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('6,32 V')
    for (const answer of ['5 ms', '15 μs', '10 mA', '3,33 A', '5 mA', '50 μC', '250 μJ']) expect(screen.getByText(answer)).toBeInTheDocument()
    expect(screen.getByText('3,68 mA')).toBeInTheDocument()

    const lever = container.querySelector('line.lab-circuits-switch')!
    const before = lever.getAttribute('x2')
    fireEvent.click(screen.getByRole('button', { name: 'B · descarga' }))
    expect(lever.getAttribute('x2')).not.toBe(before)
    expect(result(container)).toHaveTextContent('3,68 V')
    expect(screen.getByText('1,67 A')).toBeInTheDocument()
    fireEvent.click(container.querySelector('.lab-circuits-toggle')!)
    expect(lever.getAttribute('x2')).toBe(before)

    const marker = container.querySelector('.lab-circuits-marker-current')!
    const position = marker.getAttribute('cx')
    fireEvent.change(screen.getByRole('slider', { name: /Instante t/ }), { target: { value: '3' } })
    expect(marker.getAttribute('cx')).not.toBe(position)
    expect(result(container)).toHaveTextContent('9,5 V')
    setField('Capacidade C', '0')
    setField(/Resistência de carga/, '0')
    sweepSliders(container)
  })

  it('draws the parallel-plate capacitor of sheet 1 exercise 15', () => {
    const { container } = renderLab('rc_circuits', 'capacitor', 'A=4.91&d=0.2&er=2.3&V=80')
    expect(screen.getByRole('button', { name: 'Condensador plano' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('0,5 μF')
    expect(screen.getByText('1,60×10⁻³ J')).toBeInTheDocument()
    expect(screen.getByText('4,00×10⁵ V/m')).toBeInTheDocument()
    const plate = container.querySelector('.lab-circuits-plate-negative')!
    const before = plate.getAttribute('x')
    const lines = container.querySelectorAll('.lab-circuits-field-line').length
    fireEvent.change(screen.getByRole('slider', { name: /Separação d/ }), { target: { value: '5' } })
    expect(plate.getAttribute('x')).not.toBe(before)
    expect(container.querySelectorAll('.lab-circuits-field-line').length).toBeLessThan(lines)
    setField(/Área de cada placa/, '1e-4')
    fireEvent.change(screen.getByRole('slider', { name: /Constante dielétrica/ }), { target: { value: '3' } })
    expect(result(container)).toHaveTextContent('0,531 pF')
    setField(/Área de cada placa/, '0')
    sweepSliders(container)
  })

  it('reduces the capacitor association of exercise 21', () => {
    const { container } = renderLab('rc_circuits', 'capnet', 'net=p(s(4,15),12)&unit=uF&V=200')
    expect(screen.getByRole('button', { name: 'Associação de condensadores' })).toHaveClass('active')
    expect(result(container)).toHaveTextContent('15,16 μF')
    expect(screen.getByRole('row', { name: /^C₁/ })).toHaveTextContent('632 μC')
    expect(screen.getByRole('row', { name: /^C₂/ })).toHaveTextContent('632 μC')
    expect(screen.getByRole('row', { name: /^C₃/ })).toHaveTextContent('2,4 mC')
    expect(screen.getByRole('row', { name: /^Total/ })).toHaveTextContent('0,303 J')
    expect(screen.getByText('4 μF em série com 15 μF = 3,158 μF')).toBeInTheDocument()
    expect(screen.getByText('3,158 μF + 12 μF = 15,16 μF')).toBeInTheDocument()

    const stage = container.querySelector('.lab-circuits-net')!
    const before = stage.getAttribute('aria-label')
    setField('Tensão aplicada entre A e B', '100')
    expect(stage.getAttribute('aria-label')).not.toBe(before)
    expect(screen.getByRole('row', { name: /^C₃/ })).toHaveTextContent('1,2 mC')
    fireEvent.click(within(container.querySelector('.sim-visual') as HTMLElement).getByRole('button', { name: 'pF' }))
    expect(result(container)).toHaveTextContent('15,16 pF')
    fireEvent.change(screen.getByRole('textbox', { name: 'Associação entre A e B' }), { target: { value: 's(6,p(2,1))' } })
    expect(result(container)).toHaveTextContent('2 pF')
    expect(container.querySelectorAll('.lab-circuits-net .lab-circuits-element')).toHaveLength(3)
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('keeps the original circuit scenarios reachable from the family index', () => {
    const { container } = render(<MemoryRouter initialEntries={['/simulators']}><SimulatorsPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /05 Circuitos DC/ }))
    expect(screen.getByRole('button', { name: 'Ramos em paralelo' })).toHaveClass('active')
    fireEvent.click(screen.getByRole('button', { name: '2 malhas · 2 fontes' }))
    expect(screen.getByRole('slider', { name: /Fonte E₂/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /06 Circuitos RC/ }))
    expect(screen.getByRole('button', { name: 'Carga' })).toHaveClass('active')
    expect(screen.getByText('6.32 V')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Descarga' }))
    expect(screen.getByText('3.68 V')).toBeInTheDocument()
    expect(container.textContent).not.toMatch(/NaN|Infinity/)
  })

  it('opens the charge and discharge curves with V, tau and t from the URL', () => {
    const charge = renderLab('rc_circuits', 'charge', 'V=60&tau=5&t=2')
    expect(screen.getByRole('button', { name: 'Carga' })).toHaveClass('active')
    expect(screen.getByText('19.78 V')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Tempo t/ })).toHaveValue('2')
    expect(screen.getByRole('slider', { name: /Tempo t/ })).toHaveAttribute('max', '20')
    expect(screen.getByRole('slider', { name: /Constante τ=RC/ })).toHaveValue('5')
    expect(screen.getByRole('slider', { name: /Tensão final/ })).toHaveValue('60')
    const marker = charge.container.querySelector('.rc-chart circle')!
    const before = marker.getAttribute('cx')
    fireEvent.change(screen.getByRole('slider', { name: /Tempo t/ }), { target: { value: '10' } })
    expect(marker.getAttribute('cx')).not.toBe(before)
    sweepSliders(charge.container)
    cleanup()

    const discharge = renderLab('rc_circuits', 'discharge', 'V=10&tau=0.005&t=0.005')
    expect(screen.getByText('3.68 V')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Constante τ=RC/ })).toHaveValue('5')
    expect(discharge.container.textContent).toContain('5.0 ms')
    sweepSliders(discharge.container)
    cleanup()

    renderLab('rc_circuits', 'discharge')
    expect(screen.getByText('3.68 V')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Tempo t/ })).toHaveAttribute('max', '4')
    expect(screen.getByRole('slider', { name: /Constante τ=RC/ })).toHaveAttribute('min', '0.3')
  })
})
