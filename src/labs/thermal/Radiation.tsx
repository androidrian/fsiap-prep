import { useState, type CSSProperties } from 'react'
import { Choice, Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, compact, fix, positive, watts } from './format'
import { ArrowMarker } from './parts'
import { ABSOLUTE_ZERO, kelvinToCelsius, planckRelative, radiationBalance, temperatureForPower } from './physics'

const BODY_X = 118
const BODY_Y = 122
const PLOT_LEFT = 252
const PLOT_RIGHT = 468
const PLOT_TOP = 40
const PLOT_BOTTOM = 190
const LOG_MIN = 2 // 100 nm
const LOG_MAX = 5 // 100 μm
const SUN_AREA = 6.158e18 // 4π(7,0×10⁸ m)²
const SUN_POWER = 3.9e26
const MIN_CELSIUS = ABSOLUTE_ZERO + 1
const TICKS: ReadonlyArray<readonly [string, number]> = [['100 nm', 100], ['1 μm', 1e3], ['10 μm', 1e4], ['100 μm', 1e5]]

type Preset = 'skin' | 'sun' | 'none'

function plotX(nanometres: number): number {
  return PLOT_LEFT + ((Math.log10(nanometres) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (PLOT_RIGHT - PLOT_LEFT)
}

function curve(kelvin: number, reference: number): string {
  const points: string[] = []
  for (let index = 0; index <= 72; index += 1) {
    const exponent = LOG_MIN + ((LOG_MAX - LOG_MIN) * index) / 72
    const value = clamp(planckRelative(10 ** exponent * 1e-9, kelvin, reference), 0, 1)
    points.push(`${(PLOT_LEFT + ((PLOT_RIGHT - PLOT_LEFT) * index) / 72).toFixed(1)},${(PLOT_BOTTOM - value * (PLOT_BOTTOM - PLOT_TOP)).toFixed(1)}`)
  }
  return points.join(' ')
}

function wavelength(metres: number): string {
  return `${sig(metres * 1e9)} nm`
}

export function Radiation({ params }: LabProps) {
  const [celsius, setCelsius] = useState(() => Math.max(numberParam(params, 'T', 35), MIN_CELSIUS))
  const [surroundings, setSurroundings] = useState(() => Math.max(numberParam(params, 'Tenv', -5), MIN_CELSIUS))
  const [area, setArea] = useState(() => positive(numberParam(params, 'A', 0.9), 0.9))
  const [emissivity, setEmissivity] = useState(() => clamp(positive(numberParam(params, 'e', 0.9), 0.9), 0.01, 1))
  const [target, setTarget] = useState(100)

  const balance = radiationBalance(celsius, surroundings, area, emissivity)
  const reference = Math.max(balance.kelvin, balance.surroundingsKelvin)
  const strongest = Math.max(balance.emitted, balance.absorbed)
  const outWidth = 1.5 + 5.5 * (strongest > 0 ? balance.emitted / strongest : 0)
  const inWidth = 1.5 + 5.5 * (strongest > 0 ? balance.absorbed / strongest : 0)
  const peakNm = balance.peak * 1e9
  const peakX = plotX(clamp(peakNm, 10 ** LOG_MIN, 10 ** LOG_MAX))
  const offScale = peakNm < 10 ** LOG_MIN || peakNm > 10 ** LOG_MAX
  const glow = Math.round(15 + 70 * clamp(Math.log10(balance.kelvin / 200) / Math.log10(30), 0, 1))
  const needed = temperatureForPower(target, area, emissivity)
  const preset: Preset = area === SUN_AREA && emissivity === 1 ? 'sun' : area === 0.9 && emissivity === 0.9 && celsius === 35 && surroundings === -5 ? 'skin' : 'none'

  const applyPreset = (choice: Preset) => {
    if (choice === 'sun') {
      setArea(SUN_AREA); setEmissivity(1); setTarget(SUN_POWER); setSurroundings(-270)
      setCelsius(Number(kelvinToCelsius(temperatureForPower(SUN_POWER, SUN_AREA, 1)).toFixed(0)))
    } else if (choice === 'skin') {
      setArea(0.9); setEmissivity(0.9); setCelsius(35); setSurroundings(-5); setTarget(100)
    }
  }

  const label = `Corpo a ${fix(balance.kelvin, 2)} K emite ${watts(balance.emitted)} e absorve ${watts(balance.absorbed)} da vizinhança a ${fix(balance.surroundingsKelvin, 2)} K. O máximo de emissão está em ${wavelength(balance.peak)}${offScale ? ', fora da escala do gráfico' : ''}.`

  return <>
    <svg className="lab-thermal-stage lab-thermal-radiation" viewBox="0 0 480 240" role="img" aria-label={label}>
      <defs>
        <ArrowMarker id="radiation-out-head" className="lab-thermal-head-hot" size={6 + 1.7 * outWidth} />
        <ArrowMarker id="radiation-in-head" className="lab-thermal-head-cold" size={6 + 1.7 * inWidth} />
      </defs>
      <text className="lab-thermal-tag hot" x={BODY_X} y="14" textAnchor="middle">emite {watts(balance.emitted)}</text>
      <text className="lab-thermal-tag cold" x={BODY_X} y="236" textAnchor="middle">absorve {watts(balance.absorbed)}</text>
      {[0, 60, 120, 180, 240, 300].map((degrees) => {
        const cos = Math.cos((degrees * Math.PI) / 180); const sin = Math.sin((degrees * Math.PI) / 180)
        return <line key={degrees} className="lab-thermal-ray out" strokeWidth={outWidth.toFixed(2)} x1={(BODY_X + 38 * cos).toFixed(1)} y1={(BODY_Y + 38 * sin).toFixed(1)} x2={(BODY_X + 76 * cos).toFixed(1)} y2={(BODY_Y + 76 * sin).toFixed(1)} markerEnd="url(#radiation-out-head)" />
      })}
      {[30, 90, 150, 210, 270, 330].map((degrees) => {
        const cos = Math.cos((degrees * Math.PI) / 180); const sin = Math.sin((degrees * Math.PI) / 180)
        return <line key={degrees} className="lab-thermal-ray in" strokeWidth={inWidth.toFixed(2)} x1={(BODY_X + 90 * cos).toFixed(1)} y1={(BODY_Y + 90 * sin).toFixed(1)} x2={(BODY_X + 50 * cos).toFixed(1)} y2={(BODY_Y + 50 * sin).toFixed(1)} markerEnd="url(#radiation-in-head)" />
      })}
      <circle className="lab-thermal-body" cx={BODY_X} cy={BODY_Y} r="30" style={{ '--glow': `${glow}%` } as CSSProperties} />
      <text className="lab-thermal-name" x={BODY_X} y={BODY_Y + 4} textAnchor="middle">{compact(balance.kelvin, 4)} K</text>

      <rect className="lab-thermal-visible" x={plotX(380).toFixed(1)} y={PLOT_TOP} width={(plotX(750) - plotX(380)).toFixed(1)} height={PLOT_BOTTOM - PLOT_TOP} />
      <text className="lab-thermal-visible-label" transform={`translate(${(plotX(535) + 4).toFixed(1)} ${PLOT_BOTTOM - 6}) rotate(-90)`}>visível</text>
      <path className="lab-thermal-axis" d={`M${PLOT_LEFT} ${PLOT_TOP - 6}V${PLOT_BOTTOM}H${PLOT_RIGHT}`} />
      {TICKS.map(([text, nanometres]) => <g key={text}>
        <line className="lab-thermal-axis" x1={plotX(nanometres)} y1={PLOT_BOTTOM} x2={plotX(nanometres)} y2={PLOT_BOTTOM + 4} />
        <text x={plotX(nanometres)} y={PLOT_BOTTOM + 16} textAnchor={nanometres === 1e5 ? 'end' : nanometres === 100 ? 'start' : 'middle'}>{text}</text>
      </g>)}
      <text x={PLOT_LEFT} y={PLOT_BOTTOM + 32}>λ em escala logarítmica</text>
      <text className="lab-thermal-tag cold" x={PLOT_RIGHT} y={PLOT_BOTTOM + 32} textAnchor="end">- - vizinhança</text>
      <polyline className="lab-thermal-spectrum surroundings" points={curve(balance.surroundingsKelvin, reference)} />
      <polyline className="lab-thermal-spectrum body" points={curve(balance.kelvin, reference)} />
      <line className="lab-thermal-peak" x1={peakX.toFixed(1)} y1={PLOT_TOP - 8} x2={peakX.toFixed(1)} y2={PLOT_BOTTOM} />
      <text className="lab-thermal-value" x={peakX} y="24" textAnchor={peakX > 400 ? 'end' : peakX < 320 ? 'start' : 'middle'}>λmax = {wavelength(balance.peak)}{offScale ? ' (fora da escala)' : ''}</text>
    </svg>
    <ResultStrip label={balance.net >= 0 ? 'Perda líquida por radiação' : 'Ganho líquido por radiação'} value={watts(Math.abs(balance.net))} formula="P=\varepsilon\sigma A\,(T^4-T_{viz}^4),\quad \lambda_{max}=\dfrac{2{,}898\times10^{-3}}{T}" secondary={`T = ${fix(balance.kelvin, 2)} K · T_viz = ${fix(balance.surroundingsKelvin, 2)} K`} />
    <Metrics items={[
      { label: 'Potência emitida', value: watts(balance.emitted) },
      { label: 'Potência absorvida', value: watts(balance.absorbed) },
      { label: 'Máximo de emissão (Wien)', value: wavelength(balance.peak) },
    ]} />
    <Choice<Preset> label="Exemplos da ficha" value={preset} onChange={applyPreset} options={[['skin', 'Campista (ex. 16)'], ['sun', 'Sol (ex. 14)']]} />
    <Control label="Temperatura da superfície" value={celsius} min={-50} max={150} step={1} onChange={setCelsius} unit={`°C = ${fix(balance.kelvin, 2)} K`} />
    <Control label="Temperatura da vizinhança" value={surroundings} min={-50} max={150} step={1} onChange={setSurroundings} unit={`°C = ${fix(balance.surroundingsKelvin, 2)} K`} />
    <Control label="Emissividade ε" value={emissivity} min={0.05} max={1} step={0.01} onChange={setEmissivity} unit="" />
    <div className="lab-thermal-fields">
      <NumberField label="Temperatura da superfície (valor livre)" value={celsius} unit="°C" onChange={(value) => setCelsius(Math.max(value, MIN_CELSIUS))} />
      <NumberField label="Temperatura da vizinhança (valor livre)" value={surroundings} unit="°C" onChange={(value) => setSurroundings(Math.max(value, MIN_CELSIUS))} />
      <NumberField label="Área da superfície" value={area} unit="m²" onChange={(value) => { if (value > 0) setArea(value) }} />
      <NumberField label="Potência a emitir" value={target} unit="W" hint="problema inverso" onChange={(value) => { if (value >= 0) setTarget(value) }} />
    </div>
    <p className="lab-thermal-inverse"><strong>Inverso.</strong> Para emitir {watts(target)} com esta área e emissividade a superfície tem de estar a T = (P/εσA)<sup>1/4</sup> = <strong>{sig(needed, 4)} K</strong> ({compact(kelvinToCelsius(needed))} °C).</p>
    <LabNote title="Armadilha.">As leis de Stefan–Boltzmann e de Wien usam temperaturas absolutas: converte sempre para kelvin antes de elevar à quarta potência. A espessura das setas é proporcional à potência emitida e absorvida; as curvas estão normalizadas ao máximo da mais quente. Usa-se σ = 5,6697×10⁻⁸ W/(m²·K⁴).</LabNote>
  </>
}
