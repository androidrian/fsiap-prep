import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, type LabProps } from '../ui'
import { num } from './format'
import { wireMaxCurrent, wireMinDiameter, wireProperties } from './physics'

/** Escala do desenho: 16 px por mm de diâmetro (satura acima de ~10 mm). */
const PX_PER_MM = 16
const SIDE = { x: 200, width: 266, y: 118 }
const SPACING = 24

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

export function Wire({ params }: LabProps) {
  const [diameter, setDiameter] = useState(Math.max(0.1, numberParam(params, 'd', 3.62)))
  const [resistivity, setResistivity] = useState(Math.abs(numberParam(params, 'rho', 1.72e-8)))
  const [current, setCurrent] = useState(Math.abs(numberParam(params, 'I', 1)))
  const [density, setDensity] = useState(Math.abs(numberParam(params, 'n', 5.8e28)))
  const [limit, setLimit] = useState(3)
  const [limits] = useState(() => ({ diameter: Math.max(10, Math.ceil(diameter)), current: Math.max(120, Math.ceil(current)) }))

  const state = wireProperties(diameter * 1e-3, resistivity, current, density)
  const maxCurrent = wireMaxCurrent(state.resistancePerMetre, limit)
  const minDiameter = wireMinDiameter(resistivity, current, limit) * 1e3
  const radius = clamp(diameter * PX_PER_MM / 2, 2, 84)
  const saturated = diameter * PX_PER_MM / 2 > 84
  const heat = clamp(limit > 0 ? state.powerPerMetre / limit : 0, 0, 1)
  const over = state.powerPerMetre > limit
  // Velocidade do desenho em escala logarítmica: 10⁻⁶ m/s → 4 px/s, 10⁻² m/s → 18 px/s.
  const speed = state.driftSpeed > 0 ? 4 + 14 * clamp((Math.log10(state.driftSpeed) + 6) / 4, 0, 1) : 0
  const rows = clamp(Math.round(2 * radius / 14), 1, 9)
  const columns = Math.ceil(SIDE.width / SPACING) + 2
  const top = SIDE.y - radius

  return (
    <>
      <svg className={`lab-circuits-stage lab-circuits-wire-stage${over ? ' is-over' : ''}`} viewBox="0 0 480 240" role="img" aria-label={`Fio de ${num(diameter)} mm de diâmetro com ${num(current)} A: ${num(state.resistancePerMetre)} ohm por metro, ${num(state.powerPerMetre)} W por metro, velocidade de deriva ${num(state.driftSpeed)} m/s`}>
        <defs>
          <clipPath id="dc-wire-clip"><rect x={SIDE.x} y={top} width={SIDE.width} height={2 * radius} /></clipPath>
          <marker id="dc-wire-current" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path className="lab-circuits-current-head" d="M0 0L10 5L0 10z" /></marker>
          <marker id="dc-wire-drift" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path className="lab-circuits-drift-head" d="M0 0L10 5L0 10z" /></marker>
        </defs>
        <text x="14" y="20">d = {num(diameter)} mm · A = {num(state.area * 1e6)} mm²</text>
        <circle className="lab-circuits-copper" cx="95" cy={SIDE.y} r={radius.toFixed(1)} style={{ fill: `color-mix(in srgb, var(--hot) ${Math.round(heat * 55)}%, var(--amber))` }} />
        <path className="lab-circuits-guide" d={`M${(95 - radius).toFixed(1)} ${SIDE.y}H${(95 + radius).toFixed(1)}`} />
        <path className="lab-circuits-axis" d={`M14 226H${14 + PX_PER_MM}M14 222V230M${14 + PX_PER_MM} 222V230`} />
        <text x={14 + PX_PER_MM + 6} y="230">1 mm{saturated ? ' (desenho saturado)' : ''}</text>

        <rect className="lab-circuits-copper" x={SIDE.x} y={top.toFixed(1)} width={SIDE.width} height={(2 * radius).toFixed(1)} style={{ fill: `color-mix(in srgb, var(--hot) ${Math.round(heat * 55)}%, var(--amber))` }} />
        <g clipPath="url(#dc-wire-clip)">
          <g className="lab-circuits-electrons" style={{ animationDuration: speed > 0 ? `${(SPACING / speed).toFixed(2)}s` : '0s', animationPlayState: speed > 0 ? 'running' : 'paused' }}>
            {Array.from({ length: rows * columns }, (_, index) => {
              const row = Math.floor(index / columns)
              const column = index % columns
              return <circle key={index} cx={SIDE.x + column * SPACING + (row % 2 ? SPACING / 2 : 0)} cy={(top + (row + 0.5) * 2 * radius / rows).toFixed(1)} r="2.4" />
            })}
          </g>
        </g>
        <line className="lab-circuits-current" x1={SIDE.x + 24} x2={SIDE.x + 24 + clamp(20 + current, 20, 96)} y1="22" y2="22" markerEnd="url(#dc-wire-current)" />
        <text className="lab-circuits-flow" x={SIDE.x + 130} y="26">I = {num(current)} A{over && <tspan className="lab-circuits-warn"> · acima de {num(limit)} W/m</tspan>}</text>
        {speed > 0 && <line className="lab-circuits-drift" x1={SIDE.x + SIDE.width - 20} x2={SIDE.x + SIDE.width - 20 - (10 + 2.5 * speed)} y1="222" y2="222" markerEnd="url(#dc-wire-drift)" />}
        <text className="lab-circuits-drift-label" x={SIDE.x} y="226">eletrões: v = {num(state.driftSpeed)} m/s</text>
      </svg>
      <ResultStrip label="Resistência por metro de fio" value={`${num(state.resistancePerMetre)} Ω/m`} formula="\dfrac{R}{L}=\dfrac{\rho}{A}\qquad A=\dfrac{\pi d^2}{4}\qquad v_d=\dfrac{I}{n\,e\,A}" secondary={`dissipa ${num(state.powerPerMetre)} W/m com ${num(current)} A`} />
      <Metrics items={[
        { label: 'Potência por metro', value: `${num(state.powerPerMetre)} W/m` },
        { label: 'Velocidade de deriva', value: `${num(state.driftSpeed)} m/s` },
        { label: `Corrente máxima (${num(limit)} W/m)`, value: `${num(maxCurrent)} A` },
        { label: 'Diâmetro mínimo para esta corrente', value: `${num(minDiameter)} mm` },
      ]} />
      <Control label="Diâmetro d" value={diameter} min={0.1} max={limits.diameter} step={0.01} onChange={setDiameter} unit="mm" />
      <Control label="Corrente I" value={current} min={0} max={limits.current} step={0.1} onChange={setCurrent} unit="A" />
      <Control label="Limite de potência por metro" value={limit} min={0.5} max={10} step={0.5} onChange={setLimit} unit="W/m" />
      <NumberField label="Resistividade ρ" value={resistivity} onChange={(value) => setResistivity(Math.abs(value))} unit="Ω·m" hint="Cobre a 20 °C: 1.72e-8" />
      <NumberField label="Eletrões livres por m³ (n)" value={density} onChange={(value) => setDensity(Math.abs(value))} unit="m⁻³" hint="Cobre: 5.8e28" />
      <LabNote title="Leitura do diagrama:">os eletrões derivam no sentido oposto ao da corrente convencional e muito devagar (décimos de milímetro por segundo); no desenho a deriva está muito ampliada, em escala logarítmica. O fio aquece (cor mais quente) à medida que a potência por metro se aproxima do limite: a potência cresce com I² e diminui com d².</LabNote>
    </>
  )
}
