import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, compact, fix, positive, widen } from './format'
import { JOULE_PER_CAL, heatingStages, heatingState } from './physics'

const LEFT = 60
const RIGHT = 456
const TOP = 44
const BOTTOM = 172
const AXIS_Y = 184

function energy(kcal: number): string {
  return `${compact(kcal, 4)} kcal`
}

export function Heating({ params }: LabProps) {
  const initialMass = positive(numberParam(params, 'm', 10), 10)
  const initialStart = Math.min(numberParam(params, 'T0', -10), 0)
  const initialEnd = clamp(numberParam(params, 'Tf', 0), initialStart, 100)
  const [mass, setMass] = useState(initialMass)
  const [start, setStart] = useState(initialStart)
  const [end, setEnd] = useState(initialEnd)
  const [fraction, setFraction] = useState(1)

  const stages = heatingStages(mass, start, end)
  const scale = Math.max(stages.total, 1e-9)
  const supplied = fraction * stages.total
  const state = heatingState(mass, start, end, supplied)
  const low = Math.min(stages.start, 0)
  const high = Math.max(stages.end, 0)
  const range = Math.max(high - low, 1e-9)
  const x = (kcal: number) => LEFT + (kcal / scale) * (RIGHT - LEFT)
  const y = (temperature: number) => BOTTOM - ((temperature - low) / range) * (BOTTOM - TOP)
  const knee1 = stages.ice
  const knee2 = stages.ice + stages.fusion
  const segments = [
    { key: 'ice', name: 'Q₁', from: 0, to: knee1, value: stages.ice },
    { key: 'fusion', name: 'Q₂', from: knee1, to: knee2, value: stages.fusion },
    { key: 'water', name: 'Q₃', from: knee2, to: stages.total, value: stages.water },
  ]
  const melts = stages.fusion > 0
  const iceEnd = melts ? 0 : stages.end
  const stateText = state.phase === 'ice'
    ? `gelo a ${fix(state.temperature, 1)} °C`
    : state.phase === 'melting'
      ? (state.melted >= 1 ? 'fusão completa · água a 0 °C' : `a fundir · ${fix(state.melted * 100, 0)} % derretido · 0 °C`)
      : `água a ${fix(state.temperature, 1)} °C`
  const markerX = x(supplied)
  const markerY = y(state.temperature)

  const label = `Curva de aquecimento de ${compact(mass)} kg de gelo de ${compact(stages.start)} °C até ${compact(stages.end)} °C: ${energy(stages.ice)} para aquecer o gelo, ${energy(stages.fusion)} para fundir e ${energy(stages.water)} para aquecer a água. Com ${energy(supplied)} fornecidas: ${stateText}.`

  return <>
    <svg className="lab-thermal-stage lab-thermal-heating" viewBox="0 0 480 240" role="img" aria-label={label}>
      <text x={LEFT} y="18">temperatura</text>
      <text className="lab-thermal-value" x={RIGHT} y="18" textAnchor="end">{stateText}</text>
      <path className="lab-thermal-axis" d={`M${LEFT} 26V${AXIS_Y}H${RIGHT + 8}`} />
      <line className="lab-thermal-guide" x1={LEFT} y1={y(0).toFixed(1)} x2={RIGHT} y2={y(0).toFixed(1)} />
      <text x={LEFT - 6} y={y(0) + 4} textAnchor="end">0 °C</text>
      {Math.abs(y(stages.start) - y(0)) >= 13 && <text x={LEFT - 6} y={y(stages.start) + 4} textAnchor="end">{compact(stages.start)} °C</text>}
      {Math.abs(y(stages.end) - y(0)) >= 13 && Math.abs(y(stages.end) - y(stages.start)) >= 13 && <text x={LEFT - 6} y={y(stages.end) + 4} textAnchor="end">{compact(stages.end)} °C</text>}
      <line className="lab-thermal-curve ice" x1={x(0).toFixed(1)} y1={y(stages.start).toFixed(1)} x2={x(knee1).toFixed(1)} y2={y(iceEnd).toFixed(1)} />
      {melts && <line className="lab-thermal-curve fusion" x1={x(knee1).toFixed(1)} y1={y(0).toFixed(1)} x2={x(knee2).toFixed(1)} y2={y(0).toFixed(1)} />}
      {melts && <line className="lab-thermal-curve water" x1={x(knee2).toFixed(1)} y1={y(0).toFixed(1)} x2={x(stages.total).toFixed(1)} y2={y(stages.end).toFixed(1)} />}
      {segments.map((segment) => {
        const from = x(segment.from); const to = x(segment.to); const span = to - from
        if (span < 1) return null
        return <g key={segment.key}>
          <path className={`lab-thermal-bracket ${segment.key}`} d={`M${from.toFixed(1)} ${AXIS_Y + 6}v6H${to.toFixed(1)}v-6`} />
          {span >= 18 && <text className="lab-thermal-value" x={(from + to) / 2} y={AXIS_Y + 27} textAnchor="middle">{span >= 90 ? `${segment.name} = ${energy(segment.value)}` : segment.name}</text>}
        </g>
      })}
      <text x={RIGHT} y="236" textAnchor="end">energia fornecida → total {energy(stages.total)}</text>
      <path className="lab-thermal-guide marker" d={`M${markerX.toFixed(1)} ${AXIS_Y}V${markerY.toFixed(1)}H${LEFT}`} />
      <circle className="lab-thermal-marker" cx={markerX.toFixed(1)} cy={markerY.toFixed(1)} r="5.5" />
    </svg>
    <ResultStrip label="Calor total necessário" value={energy(stages.total)} formula="Q=mc_{\text{gelo}}\Delta T_1+mL_f+mc_{\text{água}}\Delta T_2" secondary={`= ${compact(stages.total * JOULE_PER_CAL, 4)} kJ`} />
    <Metrics items={[
      { label: 'Q₁ · aquecer o gelo', value: `${energy(stages.ice)} · ${compact(stages.ice * JOULE_PER_CAL)} kJ` },
      { label: 'Q₂ · fundir o gelo', value: `${energy(stages.fusion)} · ${compact(stages.fusion * JOULE_PER_CAL)} kJ` },
      { label: 'Q₃ · aquecer a água', value: `${energy(stages.water)} · ${compact(stages.water * JOULE_PER_CAL)} kJ` },
    ]} />
    <Control label="Energia fornecida" value={supplied} min={0} max={scale} step={scale / 200} onChange={(value) => setFraction(clamp(value / scale, 0, 1))} unit={`kcal · ${sig(supplied * JOULE_PER_CAL)} kJ`} />
    <Control label="Massa de gelo" value={mass} {...widen(initialMass, 0.1, 20, 0.1)} onChange={setMass} unit="kg" />
    <Control label="Temperatura inicial do gelo" value={start} {...widen(initialStart, -40, 0, 1)} onChange={(value) => setStart(Math.min(value, 0))} unit="°C" />
    <Control label="Temperatura final" value={end} {...widen(initialEnd, 0, 100, 1)} onChange={setEnd} unit="°C" />
    <LabNote title="Armadilha.">Durante a fusão a temperatura fica presa nos 0 °C: toda a energia vai para o calor latente (L_f = 79,7 kcal/kg), que é quase sempre a maior parcela. Não te esqueças de aquecer primeiro o gelo até 0 °C com c_gelo = 0,500 kcal/(kg·K); a água usa c = 1,000 kcal/(kg·K) e 1 cal = 4,186 J.</LabNote>
  </>
}
