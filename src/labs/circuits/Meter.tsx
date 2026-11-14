import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, type LabProps } from '../ui'
import { eng, num } from './format'
import { loadedDivider } from './physics'

const PIVOT = { x: 300, y: 134 }
const NEEDLE = 30

/** Ponta da agulha: −55° (zero) a +55° (fundo de escala = tensão da fonte). */
function needleTip(fraction: number) {
  const angle = (-55 + 110 * Math.min(1, Math.max(0, fraction))) * Math.PI / 180
  return { x: (PIVOT.x + NEEDLE * Math.sin(angle)).toFixed(1), y: (PIVOT.y - NEEDLE * Math.cos(angle)).toFixed(1) }
}

export function Meter({ params }: LabProps) {
  const [source, setSource] = useState(Math.abs(numberParam(params, 'V', 6)))
  const [measured, setMeasured] = useState(Math.max(1, numberParam(params, 'r1', 100)))
  const [series, setSeries] = useState(Math.max(0, numberParam(params, 'r2', 200)))
  const [meter, setMeter] = useState(Math.max(0, numberParam(params, 'rv', 100)))
  const [limits] = useState(() => ({ source: Math.max(24, Math.ceil(source)), measured: Math.max(500, Math.ceil(measured)), series: Math.max(500, Math.ceil(series)) }))

  const state = loadedDivider(source, measured * 1e3, series * 1e3, meter * 1e3)
  const ideal = !(meter > 0)
  const total = state.resistorCurrent + state.meterCurrent
  const share = (current: number) => Number((1.5 + 3 * (total > 0 ? current / total : 0)).toFixed(2))
  const reading = needleTip(source > 0 ? state.measuredVoltage / source : 0)
  const truth = needleTip(source > 0 ? state.trueVoltage / source : 0)
  const ohms = (kilo: number) => eng(kilo * 1e3, 'Ω')
  const meterText = ideal ? 'ideal (∞)' : ohms(meter)

  return (
    <>
      <svg className="lab-circuits-stage lab-circuits-meter" viewBox="0 0 480 240" role="img" aria-label={`Divisor de tensão com fonte de ${num(source)} V, R₂ = ${ohms(series)} em série e R₁ = ${ohms(measured)}; voltímetro de ${meterText} em paralelo com R₁ lê ${num(state.measuredVoltage)} V em vez de ${num(state.trueVoltage)} V`}>
        <path className="lab-circuits-wire" d="M40 110V50H90M134 50H190M190 190H40V120" />
        <line className="lab-circuits-plate-long" x1="27" x2="53" y1="110" y2="110" />
        <line className="lab-circuits-plate-short" x1="33" x2="47" y1="120" y2="120" />
        <text className="lab-circuits-polarity" x="56" y="106">+</text>
        <text x="56" y="132">{num(source)} V</text>
        <rect className="lab-circuits-box" x="90" y="41" width="44" height="18" rx="2" />
        <text x="112" y="33" textAnchor="middle">R₂ = {ohms(series)}</text>
        <path className="lab-circuits-lead lab-circuits-split" style={{ strokeWidth: share(state.resistorCurrent) }} d="M190 50V95M190 137V190" />
        <rect className="lab-circuits-box" x="181" y="95" width="18" height="42" rx="2" />
        <text x="172" y="112" textAnchor="end">R₁ = {ohms(measured)}</text>
        <text className="lab-circuits-flow" x="172" y="126" textAnchor="end">{eng(state.resistorCurrent, 'A')}</text>
        <path className={`lab-circuits-lead lab-circuits-split${ideal ? ' is-idle' : ''}`} style={{ strokeWidth: share(state.meterCurrent) }} d="M190 50H300V92M300 148V190H190" />
        <text className="lab-circuits-flow" x="245" y="42" textAnchor="middle">{eng(state.meterCurrent, 'A')}</text>
        <circle className="lab-circuits-node" cx="190" cy="50" r="3" /><circle className="lab-circuits-node" cx="190" cy="190" r="3" />
        <circle className="lab-circuits-dial" cx="300" cy="120" r="28" />
        <path className="lab-circuits-dial-scale" d={`M${needleTip(0).x} ${needleTip(0).y}A${NEEDLE} ${NEEDLE} 0 0 1 ${needleTip(1).x} ${needleTip(1).y}`} />
        <line className="lab-circuits-needle-true" x1={PIVOT.x} y1={PIVOT.y} x2={truth.x} y2={truth.y} />
        <line className="lab-circuits-needle" x1={PIVOT.x} y1={PIVOT.y} x2={reading.x} y2={reading.y} />
        <circle className="lab-circuits-node" cx={PIVOT.x} cy={PIVOT.y} r="2.6" />
        <text className="lab-circuits-dial-label" x="300" y="146" textAnchor="middle">V</text>
        <text className="lab-circuits-flow" x="342" y="100">lê {num(state.measuredVoltage)} V</text>
        <text x="342" y="116">real {num(state.trueVoltage)} V (tracejado)</text>
        <text x="342" y="132">Rv = {meterText}</text>
        <text className="lab-circuits-warn" x="342" y="148">desvio {num(state.errorPercent)} %</text>
        <text x="40" y="222">Espessura dos fios ∝ corrente em R₁ e no voltímetro.</text>
      </svg>
      <ResultStrip label="Tensão lida pelo voltímetro" value={`${num(state.measuredVoltage)} V`} formula="V_{lido}=V\,\dfrac{R_p}{R_2+R_p}\qquad R_p=\dfrac{R_1R_V}{R_1+R_V}" secondary={`valor real ${num(state.trueVoltage)} V · desvio ${num(state.errorPercent)} %`} />
      <Metrics items={[
        { label: 'Valor real (sem voltímetro)', value: `${num(state.trueVoltage)} V` },
        { label: 'Desvio percentual', value: `${num(state.errorPercent)} %` },
        { label: 'R₁ ∥ Rv', value: eng(state.parallel, 'Ω') },
        { label: 'Corrente no voltímetro', value: eng(state.meterCurrent, 'A') },
      ]} />
      <NumberField label="Resistência interna do voltímetro Rv" value={meter} onChange={(value) => setMeter(Math.abs(value))} unit="kΩ" hint="10 MΩ = 10000 kΩ; 0 = voltímetro ideal" />
      <Choice label="Voltímetros típicos" value={meter} onChange={setMeter} options={[[100, '100 kΩ'], [1000, '1 MΩ'], [10000, '10 MΩ']] as const} />
      <Control label="Resistência medida R₁" value={measured} min={1} max={limits.measured} step={1} onChange={setMeasured} unit="kΩ" />
      <Control label="Resistência em série R₂" value={series} min={0} max={limits.series} step={1} onChange={setSeries} unit="kΩ" />
      <Control label="Fonte" value={source} min={0} max={limits.source} step={Number.isInteger(source * 2) ? 0.5 : 0.1} onChange={setSource} unit="V" />
      <LabNote title="Armadilha:">o voltímetro fica em paralelo com R₁ e baixa a resistência desse troço, por isso lê sempre a menos. O desvio só é desprezável quando Rv ≫ R₁. Na ficha, o desvio de 0,5 % para Rv = 10 MΩ vem de arredondar a leitura para 1,99 V; sem arredondar dá −0,66 %.</LabNote>
    </>
  )
}
