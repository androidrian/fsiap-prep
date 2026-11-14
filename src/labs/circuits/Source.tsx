import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, type LabProps } from '../ui'
import { eng, num } from './format'
import { realSource } from './physics'

const LEFT = 34
const RIGHT = 176
const TOP = 54
const BOTTOM = 164
const CHART = { x: 282, y: 46, width: 180, height: 150 }

const watts = (value: number) => (Math.abs(value) < 1 ? `${num(value * 1e3, 4)} mW` : `${num(value, 4)} W`)

export function Source({ params }: LabProps) {
  const [emf, setEmf] = useState(Math.abs(numberParam(params, 'emf', 10)))
  const [internal, setInternal] = useState(Math.max(0.1, numberParam(params, 'rin', 75)))
  const [load, setLoad] = useState(Math.max(0, numberParam(params, 'r', 75)))
  const [limits] = useState(() => ({ emf: Math.max(24, Math.ceil(emf)), internal: Math.max(200, Math.ceil(internal)), internalMin: internal < 5 ? 0.1 : 5, internalStep: Number.isInteger(internal) && internal >= 5 ? 1 : 0.1 }))

  const state = realSource(emf, internal, load)
  const span = Math.max(4 * internal, load)
  const loadStep = span >= 100 ? 1 : span >= 10 ? 0.1 : 0.01
  const chartX = (resistance: number) => CHART.x + CHART.width * resistance / span
  const chartY = (power: number) => CHART.y + CHART.height * (1 - (state.maxPower > 0 ? power / state.maxPower : 0))
  const curve = Array.from({ length: 73 }, (_, index) => {
    const resistance = span * index / 72
    return `${chartX(resistance).toFixed(1)},${chartY(realSource(emf, internal, resistance).loadPower).toFixed(1)}`
  }).join(' ')
  const shortCircuit = emf / internal
  const arrow = shortCircuit > 0 ? 10 + 44 * state.current / shortCircuit : 0
  const relative = state.maxPower > 0 ? state.loadPower / state.maxPower : 0
  const barWidth = RIGHT - LEFT
  const samples = [1 / 3, 2 / 3, 1, 4 / 3, 5 / 3].map((factor) => Number((factor * internal).toPrecision(6)))

  return (
    <>
      <svg className="lab-circuits-stage lab-circuits-source" viewBox="0 0 480 240" role="img" aria-label={`Fonte de ${num(emf)} V com resistência interna ${num(internal)} Ω ligada a uma carga de ${num(load)} Ω: potência na carga ${watts(state.loadPower)}, ${num(relative * 100)} % do máximo, rendimento ${num(state.efficiency * 100)} %`}>
        <defs><marker id="dc-source-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path className="lab-circuits-current-head" d="M0 0L10 5L0 10z" /></marker></defs>
        <rect className="lab-circuits-enclosure" x="12" y="36" width="102" height="140" rx="4" />
        <text x="14" y="28">fonte real</text>
        <path className="lab-circuits-wire" d={`M${LEFT} 117V${TOP}H60M104 ${TOP}H${RIGHT}V88M${RIGHT} 130V${BOTTOM}H${LEFT}V127`} />
        <line className="lab-circuits-plate-long" x1={LEFT - 13} x2={LEFT + 13} y1="117" y2="117" />
        <line className="lab-circuits-plate-short" x1={LEFT - 7} x2={LEFT + 7} y1="127" y2="127" />
        <text className="lab-circuits-polarity" x={LEFT + 16} y="113">+</text>
        <text x={LEFT + 16} y="140">ε = {num(emf)} V</text>
        <rect className="lab-circuits-box lab-circuits-box-loss" x="60" y={TOP - 9} width="44" height="18" rx="2" />
        <text x="82" y={TOP + 24} textAnchor="middle">Rin = {num(internal)} Ω</text>
        <rect className="lab-circuits-box lab-circuits-box-load" x={RIGHT - 9} y="88" width="18" height="42" rx="2" style={{ fillOpacity: 0.15 + 0.85 * relative }} />
        <text x={RIGHT + 15} y="106">R = {num(load)} Ω</text>
        <text className="lab-circuits-flow" x={RIGHT + 15} y="120">{watts(state.loadPower)}</text>
        <circle className="lab-circuits-node" cx="114" cy={TOP} r="2.6" /><circle className="lab-circuits-node" cx="114" cy={BOTTOM} r="2.6" />
        {arrow > 0 && <line className="lab-circuits-current" x1="120" x2={120 + arrow} y1={TOP - 10} y2={TOP - 10} markerEnd="url(#dc-source-arrow)" />}
        <text className="lab-circuits-flow" x="120" y={TOP - 20}>I = {eng(state.current, 'A')}</text>
        <text x="120" y={TOP + 20}>V = {num(state.terminalVoltage)} V</text>
        <rect className="lab-circuits-share-load" x={LEFT} y="196" width={(barWidth * state.efficiency).toFixed(1)} height="12" />
        <rect className="lab-circuits-share-loss" x={(LEFT + barWidth * state.efficiency).toFixed(1)} y="196" width={(barWidth * (1 - state.efficiency)).toFixed(1)} height="12" />
        <text x={LEFT} y="226">carga {num(state.efficiency * 100)} % · interna {num((1 - state.efficiency) * 100)} %</text>

        <text x={CHART.x + 4} y="26">P na carga</text>
        <path className="lab-circuits-axis" d={`M${CHART.x} ${CHART.y - 12}V${CHART.y + CHART.height}H${CHART.x + CHART.width + 8}`} />
        <path className="lab-circuits-guide" d={`M${chartX(internal).toFixed(1)} ${CHART.y}V${CHART.y + CHART.height}M${CHART.x} ${CHART.y}H${CHART.x + CHART.width}`} />
        <polyline className="lab-circuits-curve" points={curve} />
        <path className="lab-circuits-guide lab-circuits-guide-point" d={`M${chartX(load).toFixed(1)} ${chartY(state.loadPower).toFixed(1)}V${CHART.y + CHART.height}`} />
        <circle className="lab-circuits-marker" cx={chartX(load).toFixed(1)} cy={chartY(state.loadPower).toFixed(1)} r="5" />
        <text x={chartX(internal)} y={CHART.y + CHART.height + 15} textAnchor="middle">R = Rin</text>
        <text x={CHART.x + CHART.width + 8} y={CHART.y + CHART.height + 15} textAnchor="end">{num(span)} Ω</text>
        <text x={CHART.x + CHART.width} y={CHART.y - 5} textAnchor="end">Pmáx = {watts(state.maxPower)}</text>
      </svg>
      <ResultStrip label="Potência entregue à carga" value={watts(state.loadPower)} formula="P=\dfrac{\varepsilon^2R}{(R+R_{in})^2}\qquad P_{max}=\dfrac{\varepsilon^2}{4R_{in}}\ \text{em}\ R=R_{in}" secondary={`${num(relative * 100)} % do máximo (${watts(state.maxPower)})`} />
      <Metrics items={[
        { label: 'Corrente', value: eng(state.current, 'A') },
        { label: 'Tensão nos terminais', value: `${num(state.terminalVoltage)} V` },
        { label: 'Potência perdida em Rin', value: watts(state.internalPower) },
        { label: 'Rendimento', value: `${num(state.efficiency * 100)} %` },
      ]} />
      <Control label="Resistência de carga R" value={load} min={0} max={span} step={loadStep} onChange={setLoad} unit="Ω" />
      <Control label="Resistência interna Rin" value={internal} min={limits.internalMin} max={limits.internal} step={limits.internalStep} onChange={setInternal} unit="Ω" />
      <Control label="f.e.m. ε" value={emf} min={0} max={limits.emf} step={Number.isInteger(emf * 2) ? 0.5 : 0.1} onChange={setEmf} unit="V" />

      <div className="lab-circuits-panel">
        <h3>Potência para vários valores de R</h3>
        <div className="lab-circuits-table-wrap">
          <table className="lab-circuits-table">
            <thead><tr><th scope="col">R</th><th scope="col">Corrente</th><th scope="col">Potência na carga</th><th scope="col">Rendimento</th></tr></thead>
            <tbody>{samples.map((resistance) => {
              const sample = realSource(emf, internal, resistance)
              return <tr key={resistance} className={resistance === internal ? 'is-highlight' : undefined}><th scope="row">{num(resistance)} Ω</th><td>{eng(sample.current, 'A')}</td><td>{watts(sample.loadPower)}</td><td>{num(sample.efficiency * 100)} %</td></tr>
            })}</tbody>
          </table>
        </div>
      </div>
      <LabNote title="Armadilha:">potência máxima não é rendimento máximo. Em R = Rin a carga recebe o máximo de potência, mas metade da energia perde-se dentro da fonte (rendimento 50 %). Com R ≫ Rin o rendimento aproxima-se de 100 %, mas a potência entregue cai.</LabNote>
    </>
  )
}
