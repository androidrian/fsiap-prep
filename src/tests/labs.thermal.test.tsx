import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { SimulatorsPage } from '../pages/SimulatorsPage'
import {
  celsiusToFahrenheit, celsiusToKelvin, convection, expansion, fahrenheitToCelsius, heatingStages, heatingState, jouleExperiment,
  mixedWall, mixing, parseLayers, planckRelative, radiationBalance, seriesWall, temperatureForPower, unknownSpecificHeat, wienPeak,
} from '../labs/thermal/physics'
import { compact, fix, watts, widen } from '../labs/thermal/format'

afterEach(cleanup)

const open = (query: string) => render(<MemoryRouter initialEntries={[`/simulators?${query}`]}><SimulatorsPage /></MemoryRouter>)
const tab = (name: string) => screen.getByRole('button', { name })
const slide = (name: RegExp, value: number | string) => fireEvent.change(screen.getByRole('slider', { name }), { target: { value: String(value) } })
const type = (name: string, value: string) => {
  const field = screen.getByRole('textbox', { name })
  fireEvent.change(field, { target: { value } })
  fireEvent.blur(field)
}
const clean = (container: HTMLElement) => expect(container.textContent).not.toMatch(/NaN|Infinity/)

describe('thermal physics', () => {
  it('parses the layer list and ignores invalid entries', () => {
    expect(parseLayers('0.15:3.5:pedra;0.05:0.025:espuma;0.02:0.14:madeira')).toEqual([
      { thickness: 0.15, conductivity: 3.5, name: 'pedra' },
      { thickness: 0.05, conductivity: 0.025, name: 'espuma' },
      { thickness: 0.02, conductivity: 0.14, name: 'madeira' },
    ])
    expect(parseLayers('0.03:50;x:2;0.05:0;;0.07:15').map((layer) => layer.name)).toEqual(['camada 1', 'camada 2'])
    expect(parseLayers('1:1;1:1;1:1;1:1;1:1;1:1;1:1')).toHaveLength(5)
  })

  it('solves the mountain house wall of sheet 5 exercise 18', () => {
    const wall = seriesWall(parseLayers('0.15:3.5;0.05:0.025;0.02:0.14'), 1, 35, 20)
    expect(wall.total).toBeCloseTo(2.1857, 3)
    expect(wall.flow).toBeCloseTo(6.863, 2)
    expect(wall.flux).toBeCloseTo(6.863, 2)
    expect(wall.temperatures[1]).toBeCloseTo(34.7, 1)
    expect(wall.temperatures[2]).toBeCloseTo(20.98, 2)
    expect(wall.temperatures[3]).toBe(20)
    expect(wall.shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(1, 10)
  })

  it('solves the three-material wall of exercise 20 and the interface of exercise 11', () => {
    const wall = seriesWall(parseLayers('0.03:50;0.05:30;0.07:15'), 1, 100, 20)
    expect(wall.resistances[0]).toBeCloseTo(6e-4, 8)
    expect(wall.resistances[1]).toBeCloseTo(16.67e-4, 6)
    expect(wall.resistances[2]).toBeCloseTo(46.67e-4, 6)
    expect(wall.flow / 1000).toBeCloseTo(11.54, 2)
    expect(wall.shares.indexOf(Math.max(...wall.shares))).toBe(2)
    const calories = seriesWall(parseLayers('2:0.12;7:0.49'), 1, 100, 20)
    expect(calories.temperatures[1]).toBeCloseTo(56.92, 2)
    expect(seriesWall(parseLayers('0.02:50.2;0.07:205'), 3.7, 100, 20).temperatures[1]).toBeCloseTo(56.92, 2)
  })

  it('solves the series and parallel wall of exercise 17 with half the area for b and c', () => {
    const wall = mixedWall({ area: 2.25, hot: 370, cold: -10, la: 0.025, ka: 175, lbc: 0.075, kb: 40, kc: 50, ld: 0.05, kd: 80 })
    expect(wall.rb).toBeCloseTo(1.6667e-3, 6)
    expect(wall.rc).toBeCloseTo(1.3333e-3, 6)
    expect(wall.total).toBeCloseTo(1.082e-3, 6)
    expect(wall.flow / 1000).toBeCloseTo(351.2, 1)
    expect(wall.flowB + wall.flowC).toBeCloseTo(wall.flow, 4)
    expect(wall.flowC / wall.flowB).toBeCloseTo(50 / 40, 8)
    expect(wall.t1).toBeCloseTo(347.7, 1)
    expect(wall.t2).toBeCloseTo(87.56, 1)
  })

  it('applies Stefan–Boltzmann and Wien to the camper and to the Sun', () => {
    const camper = radiationBalance(35, -5, 0.9, 0.9)
    expect(camper.kelvin).toBeCloseTo(308.15, 10)
    expect(camper.net).toBeCloseTo(177, 0)
    expect(camper.peak * 1e9).toBeCloseTo(9404.5, 0)
    expect(wienPeak(5800) * 1e9).toBeCloseTo(499.7, 1)
    const sun = temperatureForPower(3.9e26, 4 * Math.PI * 7e8 ** 2, 1)
    expect(sun / 1000).toBeCloseTo(5.8, 1)
    expect(planckRelative(wienPeak(300), 300, 300)).toBeCloseTo(1, 3)
    expect(planckRelative(wienPeak(300), 300, 600)).toBeCloseTo(1 / 32, 3)
    expect(planckRelative(1e-7, 1, 1)).toBe(0)
    expect(Number.isFinite(planckRelative(1e-4, 6000, 6000))).toBe(true)
  })

  it("applies Newton's law of cooling to exercise 9", () => {
    const person = convection(1.7e-3 * 4186, 1.5, 30, 0)
    expect(person.flow).toBeCloseTo(320.2, 1)
    expect(person.flowKcal).toBeCloseTo(7.65e-2, 6)
    expect(person.resistance).toBeCloseTo(1 / (7.1162 * 1.5), 8)
    expect(person.energyHour).toBeCloseTo(320.229 * 3600, 0)
  })

  it('adds the stages of the heating curve of exercise 6', () => {
    expect(heatingStages(10, -10, 0)).toMatchObject({ ice: 50, fusion: 797, water: 0, total: 847 })
    expect(heatingStages(2, -20, 30)).toMatchObject({ ice: 20, fusion: 159.4, water: 60 })
    expect(heatingStages(1, -20, -5)).toMatchObject({ ice: 7.5, fusion: 0, water: 0 })
    expect(heatingState(10, -10, 0, 25)).toMatchObject({ phase: 'ice', temperature: -5, melted: 0 })
    expect(heatingState(10, -10, 0, 50 + 797 / 2)).toMatchObject({ phase: 'melting', temperature: 0, melted: 0.5 })
    expect(heatingState(10, -10, 0, 847)).toMatchObject({ phase: 'melting', melted: 1 })
    expect(heatingState(2, -20, 30, 20 + 159.4 + 30)).toMatchObject({ phase: 'water', temperature: 15 })
    expect(heatingState(0, 0, 0, 10)).toMatchObject({ temperature: 0 })
  })

  it('balances heat in the calorimeter and inverts for the specific heat of exercise 5', () => {
    expect(mixing(1, 4186, 70, 2, 4186, 15).final).toBeCloseTo(33.33, 2)
    expect(unknownSpecificHeat(0.05, 200, 0.4, 4186, 20, 22.4)).toBeCloseTo(452.54, 2)
    const bar = mixing(0.05, 452.54, 200, 0.4, 4186, 20)
    expect(bar.final).toBeCloseTo(22.4, 3)
    expect(bar.heat1 + bar.heat2).toBeCloseTo(0, 6)
    expect(unknownSpecificHeat(1, 50, 1, 4186, 20, 50)).toBeNaN()
  })

  it('computes thermal expansion for exercises 2 and 3', () => {
    expect(expansion(2000, 12.7e-6, 40).deltaLength).toBeCloseTo(1.016, 3)
    const cylinder = expansion(1, 23e-6, 100)
    expect(cylinder.strain * 100).toBeCloseTo(0.23, 6)
    expect(cylinder.densityChange * 100).toBeCloseTo(-0.69, 6)
  })

  it('converts the temperatures of exercise 1 and the Joule experiment of exercise 7', () => {
    expect(celsiusToFahrenheit(-71)).toBeCloseTo(-95.8, 6)
    expect(fahrenheitToCelsius(134)).toBeCloseTo(56.67, 2)
    expect(celsiusToKelvin(-71)).toBeCloseTo(202.15, 6)
    const joule = jouleExperiment(6, 2, 25, 500, 1.4)
    expect(joule.work).toBeCloseTo(2943, 6)
    expect(joule.heat).toBeCloseTo(700, 6)
    expect(joule.ratio).toBeCloseTo(4.2, 1)
    expect(jouleExperiment(6, 2, 25, 500, 0).ratio).toBeNaN()
  })

  it('formats numbers the Portuguese way and widens slider ranges', () => {
    expect(fix(20.98, 1)).toBe('21,0')
    expect(fix(-0.001, 1)).toBe('0,0')
    expect(fix(Number.NaN, 2)).toBe('—')
    expect(compact(0.025)).toBe('0,025')
    expect(watts(351198, 4)).toBe('351,2 kW')
    expect(widen(0.001, 0.005, 0.2, 0.005)).toEqual({ min: 0.001, max: 0.2, step: 0.001 })
    expect(widen(150, 0.04, 1, 0.01)).toEqual({ min: 0.04, max: 150, step: 0.01 })
    expect(widen(0.5, 0.04, 1, 0.01)).toEqual({ min: 0.04, max: 1, step: 0.01 })
  })
})

describe('thermal transport scenarios', () => {
  it('draws the N-layer wall of exercise 18 and reacts to its controls', () => {
    const { container } = open('family=thermal_transport&scenario=wall&layers=0.15:3.5:pedra;0.05:0.025:espuma;0.02:0.14:madeira&area=1&hot=35&cold=20')
    expect(tab('Parede de N camadas')).toHaveClass('active')
    expect(container.textContent).toContain('2,186 K/W')
    expect(container.textContent).toContain('6,86 W')
    expect(container.textContent).toContain('34,7 °C')
    expect(container.textContent).toContain('20,98 °C')
    expect(container.querySelectorAll('.lab-thermal-layer')).toHaveLength(3)
    const profile = container.querySelector('.lab-thermal-profile')!
    const before = profile.getAttribute('points')
    type('Espessura da camada 2', '0.1')
    expect(profile.getAttribute('points')).not.toBe(before)
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar camada' }))
    expect(container.querySelectorAll('.lab-thermal-layer')).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar camada' }))
    expect(screen.getByRole('button', { name: 'Adicionar camada' })).toBeDisabled()
    for (let index = 0; index < 4; index += 1) fireEvent.click(screen.getByRole('button', { name: 'Remover camada' }))
    expect(container.querySelectorAll('.lab-thermal-layer')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Remover camada' })).toBeDisabled()
    type('Temperatura do lado frio', '35')
    clean(container)
  })

  it('reproduces exercises 20 and 11 in the N-layer wall', () => {
    const first = open('family=thermal_transport&scenario=wall&layers=0.03:50;0.05:30;0.07:15&area=1&hot=100&cold=20')
    expect(first.container.textContent).toContain('6,00×10⁻⁴')
    expect(first.container.textContent).toContain('1,67×10⁻³')
    expect(first.container.textContent).toContain('4,67×10⁻³')
    expect(first.container.textContent).toContain('11,5 kW')
    clean(first.container)
    cleanup()
    const second = open('family=thermal_transport&scenario=wall&layers=2:0.12;7:0.49&hot=100&cold=20')
    expect(second.container.textContent).toContain('56,92 °C')
    clean(second.container)
  })

  it('splits the heat between b and c in the series and parallel wall of exercise 17', () => {
    const { container } = open('family=thermal_transport&scenario=mixed&area=2.25&hot=370&cold=-10&la=0.025&ka=175&lbc=0.075&kb=40&kc=50&ld=0.05&kd=80')
    expect(tab('Série + paralelo')).toHaveClass('active')
    expect(container.textContent).toContain('351,2 kW')
    expect(container.textContent).toContain('1,082×10⁻³ K/W')
    expect(container.textContent).toContain('347,70 °C')
    expect(container.textContent).toMatch(/87,5[56] °C/)
    expect(container.textContent).toContain('345,45×10³ W')
    const arrow = container.querySelector('.lab-thermal-heat.branch-b')!
    const before = arrow.getAttribute('d')
    slide(/Condutividade de b/, 200)
    expect(arrow.getAttribute('d')).not.toBe(before)
    const wide = container.querySelector('.lab-thermal-block.a')!.getAttribute('width')
    type('Espessura de a', '0.1')
    expect(container.querySelector('.lab-thermal-block.a')!.getAttribute('width')).not.toBe(wide)
    clean(container)
  })

  it('shows the radiation balance of the camper and the temperature of the Sun', () => {
    const { container } = open('family=thermal_transport&scenario=radiation&T=35&Tenv=-5&A=0.9&e=0.9')
    expect(tab('Radiação térmica')).toHaveClass('active')
    expect(screen.getByText('177 W')).toBeInTheDocument()
    expect(container.textContent).toContain('9400 nm')
    expect(container.textContent).toContain('308,15 K')
    expect(container.textContent).toContain('268,15 K')
    const spectrum = container.querySelector('.lab-thermal-spectrum.body')!
    const ray = container.querySelector('.lab-thermal-ray.in')!
    const before = spectrum.getAttribute('points')
    const thin = ray.getAttribute('stroke-width')
    slide(/Temperatura da superfície/, 120)
    expect(spectrum.getAttribute('points')).not.toBe(before)
    expect(ray.getAttribute('stroke-width')).not.toBe(thin)
    fireEvent.click(screen.getByRole('button', { name: 'Sol (ex. 14)' }))
    expect(container.textContent).toContain('5781 K')
    expect(container.textContent).toContain('501 nm')
    type('Temperatura da superfície (valor livre)', '-400')
    slide(/Emissividade/, 0.05)
    clean(container)
  })

  it('carries heat away by convection as in exercise 9', () => {
    const { container } = open('family=thermal_transport&scenario=convection&h=7.1162&A=1.5&Ts=30&Tinf=0')
    expect(tab('Convecção')).toHaveClass('active')
    expect(screen.getByText('320 W')).toBeInTheDocument()
    expect(container.textContent).toContain('7,65×10⁻² kcal/s')
    expect(container.querySelectorAll('.lab-thermal-plume')).toHaveLength(7)
    const before = container.querySelector('.lab-thermal-plume')!.getAttribute('d')
    slide(/Temperatura do fluido/, 20)
    expect(container.querySelectorAll('.lab-thermal-plume')).toHaveLength(2)
    expect(container.querySelector('.lab-thermal-plume')!.getAttribute('d')).not.toBe(before)
    slide(/Temperatura do fluido/, 30)
    expect(container.querySelectorAll('.lab-thermal-plume')).toHaveLength(0)
    slide(/Temperatura do fluido/, 60)
    expect(container.textContent).toContain('Calor recebido por convecção')
    clean(container)
  })

  it('widens the single-layer sliders for the chip of exercise 8', () => {
    const { container } = open('family=thermal_transport&scenario=single&area=0.0001&hot=5&cold=0&l1=0.001&k1=150')
    expect(tab('Camada única')).toHaveClass('active')
    expect(screen.getByText('75.0 W')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Espessura L₁/ })).toHaveValue('0.001')
    expect(screen.getByRole('slider', { name: /Condutividade k₁/ })).toHaveValue('150')
    slide(/Espessura L₁/, 0.002)
    expect(screen.getByText('37.5 W')).toBeInTheDocument()
    clean(container)
  })
})

describe('thermal equilibrium scenarios', () => {
  it('keeps the water mixing defaults and solves the metal bar of exercise 5', () => {
    const defaults = open('family=thermal_equilibrium&scenario=mixing')
    expect(tab('Calorímetro')).toHaveClass('active')
    expect(screen.getByText('33,3 °C')).toBeInTheDocument()
    const beaker = defaults.container.querySelector('.cold-beaker') as HTMLElement
    const height = beaker.style.height
    slide(/Massa fria/, 3)
    expect(beaker.style.height).not.toBe(height)
    expect(screen.getByText('28,8 °C')).toBeInTheDocument()
    clean(defaults.container)
    cleanup()
    const { container } = open('family=thermal_equilibrium&scenario=mixing&m1=0.05&c1=452.5&T1=200&m2=0.4&c2=4186&T2=20')
    expect(screen.getByText('22,4 °C')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /Massa quente/ })).toHaveValue('0.05')
    expect(screen.getByRole('slider', { name: /Temperatura quente/ })).toHaveValue('200')
    type('Calor específico do corpo quente c₁', '900')
    type('Temperatura final medida', '22.4')
    expect(container.textContent).toContain('452,5 J/(kg·K)')
    type('Temperatura final medida', '250')
    expect(container.textContent).toContain('tem de ficar entre')
    clean(container)
  })

  it('draws the heating curve of exercise 6 and moves the energy marker', () => {
    const { container } = open('family=thermal_equilibrium&scenario=heating&m=10&T0=-10&Tf=0')
    expect(tab('Curva de aquecimento')).toHaveClass('active')
    expect(screen.getByText('847 kcal')).toBeInTheDocument()
    expect(container.textContent).toContain('fusão completa')
    const marker = container.querySelector('.lab-thermal-marker')!
    const before = marker.getAttribute('cx')
    slide(/Energia fornecida/, 400)
    expect(marker.getAttribute('cx')).not.toBe(before)
    expect(container.textContent).toContain('a fundir · 44 % derretido')
    slide(/Energia fornecida/, 20)
    expect(container.textContent).toContain('gelo a -6,0 °C')
    slide(/Temperatura final/, 50)
    expect(container.querySelector('.lab-thermal-curve.water')).toBeInTheDocument()
    slide(/Massa de gelo/, 0.1)
    slide(/Temperatura inicial do gelo/, 0)
    clean(container)
  })

  it('exaggerates the expansion of the bridge of exercise 3 and identifies aluminium in exercise 2', () => {
    const { container } = open('family=thermal_equilibrium&scenario=expansion&L0=2000&alpha=12.7&dT=40')
    expect(tab('Dilatação térmica')).toHaveClass('active')
    expect(screen.getByText('1,02 m')).toBeInTheDocument()
    const bar = container.querySelector('.lab-thermal-bar.after')!
    const cube = container.querySelector('.lab-thermal-cube.after')!
    const width = bar.getAttribute('width')
    const shape = cube.getAttribute('d')
    slide(/Variação de temperatura/, 100)
    expect(bar.getAttribute('width')).not.toBe(width)
    expect(cube.getAttribute('d')).not.toBe(shape)
    fireEvent.click(screen.getByRole('button', { name: 'alumínio 23' }))
    expect(screen.getByRole('button', { name: 'alumínio 23' })).toHaveClass('active')
    expect(container.textContent).toContain('+0,23 %')
    expect(container.textContent).toContain('-0,69 %')
    expect(container.textContent).toContain('alumínio (23)')
    slide(/Variação de temperatura/, -100)
    slide(/Coeficiente linear/, 60)
    clean(container)
  })

  it('reads one temperature on the three scales of exercise 1', () => {
    const { container } = open('family=thermal_equilibrium&scenario=scales&C=-71')
    expect(tab('Escalas de temperatura')).toHaveClass('active')
    expect(container.textContent).toContain('-95,8 °F')
    expect(container.textContent).toContain('202,15 K')
    const mercury = container.querySelector('.lab-thermal-scales .lab-thermal-mercury')!
    const before = mercury.getAttribute('width')
    type('Temperatura em °F', '134')
    expect(mercury.getAttribute('width')).not.toBe(before)
    expect(container.textContent).toContain('56,7 °C')
    expect(container.textContent).toContain('329,82 K')
    type('Temperatura em K', '0')
    expect(container.textContent).toContain('-273,2 °C')
    expect(container.textContent).toContain('-459,7 °F')
    slide(/^Temperatura/, 200)
    type('Temperatura em °C', '5000')
    clean(container)
  })

  it('obtains the mechanical equivalent of heat of exercise 7 and drops the weight', () => {
    const { container } = open('family=thermal_equilibrium&scenario=joule&M=6&h=2&n=25&mw=500&dT=1.4')
    expect(tab('Experiência de Joule')).toHaveClass('active')
    expect(screen.getByText('4,2 J/cal')).toBeInTheDocument()
    expect(container.textContent).toContain('2943 J')
    expect(container.textContent).toContain('700 cal')
    const weight = container.querySelector('.lab-thermal-weight')!
    expect(weight.getAttribute('data-offset')).toBe('0.0')
    fireEvent.click(screen.getByRole('button', { name: 'Largar' }))
    expect(weight.getAttribute('data-offset')).toBe('80.0')
    expect(weight).toHaveClass('falling')
    fireEvent.click(screen.getByRole('button', { name: 'Todas as quedas' }))
    expect(container.textContent).toContain('queda 25 de 25')
    expect(screen.getByRole('button', { name: 'Largar' })).toBeDisabled()
    const ruler = container.querySelector('.lab-thermal-dimension')!
    const before = ruler.getAttribute('d')
    slide(/Altura da queda/, 1)
    expect(ruler.getAttribute('d')).not.toBe(before)
    fireEvent.click(screen.getByRole('button', { name: 'Repor' }))
    expect(container.textContent).toContain('queda 0 de 25')
    slide(/Número de quedas/, 1)
    slide(/Aquecimento medido/, 0.1)
    clean(container)
  })
})
