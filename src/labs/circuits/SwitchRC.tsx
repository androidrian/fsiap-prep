import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, type LabProps } from '../ui'
import { eng, num } from './format'
import { rcState, rcSwitch } from './physics'

type Phase = 'charge' | 'discharge'

const PLOT = { x: 268, width: 200, span: 5, voltageTop: 30, currentTop: 132, height: 70 }
const plotX = (taus: number) => PLOT.x + PLOT.width * taus / PLOT.span
const marks = [1, 2, 3]

export function SwitchRC({ params }: LabProps) {
  const [phase, setPhase] = useState<Phase>('charge')
  const [taus, setTaus] = useState(1)
  const [source, setSource] = useState(Math.abs(numberParam(params, 'V', 10)))
  const [microfarads, setMicrofarads] = useState(Math.abs(numberParam(params, 'C', 5)))
  const [chargeR, setChargeR] = useState(Math.abs(numberParam(params, 'rc', 1000)))
  const [dischargeR, setDischargeR] = useState(Math.abs(numberParam(params, 'rd', 3)))
  const [sourceMax] = useState(() => Math.max(24, Math.ceil(source)))

  const capacitance = microfarads * 1e-6
  const summary = rcSwitch(capacitance, source, chargeR, dischargeR)
  const charging = phase === 'charge'
  const resistance = charging ? chargeR : dischargeR
  const tau = charging ? summary.tauCharge : summary.tauDischarge
  const initialCurrent = charging ? summary.initialChargeCurrent : summary.initialDischargeCurrent
  const state = rcState(phase, source, resistance, capacitance, taus * tau)
  const voltageFraction = (u: number) => (charging ? 1 - Math.exp(-u) : Math.exp(-u))
  const currentFraction = (u: number) => Math.exp(-u)
  const voltageY = (u: number) => PLOT.voltageTop + PLOT.height * (1 - voltageFraction(u))
  const currentY = (u: number) => PLOT.currentTop + PLOT.height * (1 - currentFraction(u))
  const samples = Array.from({ length: 51 }, (_, index) => index / 10)
  const voltageCurve = samples.map((u) => `${plotX(u).toFixed(1)},${voltageY(u).toFixed(1)}`).join(' ')
  const currentCurve = samples.map((u) => `${plotX(u).toFixed(1)},${currentY(u).toFixed(1)}`).join(' ')
  const arrow = 6 + 36 * currentFraction(taus)
  const arrowX = charging ? 50 : 172
  const signs = Math.round(4 * state.fraction)
  const lever = charging ? { x: 120.5, y: 53 } : { x: 155.5, y: 53 }
  const ohms = (value: number) => eng(value, 'Ω')

  return (
    <>
      <svg className="lab-circuits-stage lab-circuits-switch-stage" viewBox="0 0 480 240" role="img" aria-label={`Condensador de ${num(microfarads)} μF com o comutador em ${charging ? 'A, a carregar' : 'B, a descarregar'} por ${ohms(resistance)}: em t = ${num(taus)} τ a tensão é ${num(state.voltage)} V e a corrente ${eng(state.current, 'A')}`}>
        <defs><marker id="rc-switch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path className="lab-circuits-current-head" d="M0 0L10 5L0 10z" /></marker></defs>
        <g className={charging ? undefined : 'lab-circuits-idle'}>
          <path className="lab-circuits-wire" d="M138 190H28V128M28 118V50H48M92 50H114" />
          <line className="lab-circuits-plate-long" x1="15" x2="41" y1="118" y2="118" />
          <line className="lab-circuits-plate-short" x1="21" x2="35" y1="128" y2="128" />
          <text className="lab-circuits-polarity" x="45" y="115">+</text>
          <text x="36" y="162">ε = {num(source)} V</text>
          <rect className="lab-circuits-box" x="48" y="41" width="44" height="18" rx="2" />
          <text x="70" y="34" textAnchor="middle">Rc = {ohms(chargeR)}</text>
        </g>
        <g className={charging ? 'lab-circuits-idle' : undefined}>
          <path className="lab-circuits-wire" d="M162 50H172M212 50H222V190H138" />
          <rect className="lab-circuits-box" x="172" y="41" width="40" height="18" rx="2" />
          <text x="170" y="34">Rd = {ohms(dischargeR)}</text>
        </g>
        <path className="lab-circuits-wire" d="M138 88V120M138 130V190" />
        <line className="lab-circuits-cap-plate" x1="122" x2="154" y1="120" y2="120" style={{ strokeWidth: 2 + 4 * state.fraction }} />
        <line className="lab-circuits-cap-plate" x1="122" x2="154" y1="130" y2="130" style={{ strokeWidth: 2 + 4 * state.fraction }} />
        <text className="lab-circuits-charge-plus" x="160" y="121">{'+'.repeat(signs)}</text>
        <text className="lab-circuits-charge-minus" x="160" y="137">{'−'.repeat(signs)}</text>
        <text x="116" y="120" textAnchor="end">C = {eng(capacitance, 'F')}</text>
        <text className="lab-circuits-flow" x="116" y="134" textAnchor="end">Vc = {num(state.voltage)} V</text>
        <g className="lab-circuits-toggle" onClick={() => setPhase(charging ? 'discharge' : 'charge')}>
          <rect className="lab-circuits-hit" x="104" y="26" width="68" height="66" />
          <line className="lab-circuits-switch" x1="138" y1="84" x2={lever.x} y2={lever.y} />
          <circle className="lab-circuits-terminal" cx="118" cy="50" r="3.5" /><circle className="lab-circuits-terminal" cx="158" cy="50" r="3.5" /><circle className="lab-circuits-terminal" cx="138" cy="84" r="3.5" />
          <text className="lab-circuits-node-label" x="118" y="38" textAnchor="middle">A</text><text className="lab-circuits-node-label" x="158" y="38" textAnchor="middle">B</text>
        </g>
        <line className="lab-circuits-current" x1={arrowX} x2={(arrowX + arrow).toFixed(1)} y1="68" y2="68" markerEnd="url(#rc-switch-arrow)" />
        <text className="lab-circuits-flow" x={arrowX} y="82">i = {eng(state.current, 'A')}</text>
        <text x="28" y="214">{charging ? 'A: carrega por Rc' : 'B: descarrega por Rd'} · τ = {eng(tau, 's')}</text>
        <text x="28" y="228">t = {num(taus)} τ = {eng(taus * tau, 's')}</text>

        <text x={PLOT.x + 4} y={PLOT.voltageTop - 8}>Vc(t)</text>
        <text x={PLOT.x + PLOT.width} y={PLOT.voltageTop - 8} textAnchor="end">ε = {num(source)} V</text>
        <text x={PLOT.x + 4} y={PLOT.currentTop - 8}>i(t)</text>
        <text x={PLOT.x + PLOT.width} y={PLOT.currentTop - 8} textAnchor="end">I₀ = {eng(initialCurrent, 'A')}</text>
        <path className="lab-circuits-axis" d={`M${PLOT.x} ${PLOT.voltageTop - 4}V${PLOT.voltageTop + PLOT.height}H${PLOT.x + PLOT.width}M${PLOT.x} ${PLOT.currentTop - 4}V${PLOT.currentTop + PLOT.height}H${PLOT.x + PLOT.width}`} />
        <path className="lab-circuits-guide" d={`M${PLOT.x} ${PLOT.voltageTop}H${PLOT.x + PLOT.width}M${PLOT.x} ${PLOT.currentTop}H${PLOT.x + PLOT.width}${marks.map((mark) => `M${plotX(mark)} ${PLOT.voltageTop}V${PLOT.voltageTop + PLOT.height}M${plotX(mark)} ${PLOT.currentTop}V${PLOT.currentTop + PLOT.height}`).join('')}`} />
        <polyline className="lab-circuits-curve" points={voltageCurve} />
        <polyline className="lab-circuits-curve lab-circuits-curve-current" points={currentCurve} />
        {marks.map((mark) => <g key={mark}>
          <circle className="lab-circuits-tick" cx={plotX(mark)} cy={voltageY(mark).toFixed(1)} r="3" />
          <circle className="lab-circuits-tick" cx={plotX(mark)} cy={currentY(mark).toFixed(1)} r="3" />
          <text x={plotX(mark)} y={PLOT.currentTop + PLOT.height + 15} textAnchor="middle">{mark === 1 ? 'τ' : `${mark}τ`}</text>
        </g>)}
        <text x={PLOT.x + PLOT.width} y={PLOT.currentTop + PLOT.height + 15} textAnchor="end">5τ</text>
        <circle className="lab-circuits-marker lab-circuits-marker-voltage" cx={plotX(taus).toFixed(1)} cy={voltageY(taus).toFixed(1)} r="5" />
        <circle className="lab-circuits-marker lab-circuits-marker-current" cx={plotX(taus).toFixed(1)} cy={currentY(taus).toFixed(1)} r="5" />
      </svg>
      <ResultStrip
        label={`Tensão no condensador em t = ${num(taus)} τ (${eng(taus * tau, 's')})`}
        value={`${num(state.voltage)} V`}
        formula={charging ? 'V_C=\\varepsilon\\,(1-e^{-t/\\tau})\\qquad i=\\dfrac{\\varepsilon}{R}\\,e^{-t/\\tau}' : 'V_C=\\varepsilon\\,e^{-t/\\tau}\\qquad i=\\dfrac{\\varepsilon}{R}\\,e^{-t/\\tau}'}
        secondary={`i = ${eng(state.current, 'A')} · q = ${eng(state.charge, 'C')}`}
      />
      <Metrics items={[
        { label: 'τ de carga (Rc·C)', value: eng(summary.tauCharge, 's') },
        { label: 'τ de descarga (Rd·C)', value: eng(summary.tauDischarge, 's') },
        { label: 'Corrente inicial de carga', value: eng(summary.initialChargeCurrent, 'A') },
        { label: 'Corrente inicial de descarga', value: eng(summary.initialDischargeCurrent, 'A') },
      ]} />
      <Metrics items={[
        { label: `Corrente com metade da carga (${charging ? 'carga' : 'descarga'})`, value: eng(charging ? summary.halfChargeCurrent : summary.halfDischargeCurrent, 'A') },
        { label: 'Carga final Q = C·ε', value: eng(summary.finalCharge, 'C') },
        { label: 'Energia armazenada', value: eng(summary.energy, 'J') },
        { label: 'Tempo até metade da carga', value: eng(tau * Math.LN2, 's') },
      ]} />
      <Metrics items={marks.map((mark) => ({ label: `i(${mark === 1 ? '' : mark}τ)`, value: eng(initialCurrent * Math.exp(-mark), 'A') }))} />
      <Choice label="Comutador" value={phase} onChange={setPhase} options={[['charge', 'A · carga'], ['discharge', 'B · descarga']] as const} />
      <Control label="Instante t" value={taus} min={0} max={PLOT.span} step={0.05} onChange={setTaus} unit="τ" />
      <Control label="Fonte ε" value={source} min={0} max={sourceMax} step={Number.isInteger(source * 2) ? 0.5 : 0.1} onChange={setSource} unit="V" />
      <NumberField label="Capacidade C" value={microfarads} onChange={(value) => setMicrofarads(Math.abs(value))} unit="μF" />
      <NumberField label="Resistência de carga Rc" value={chargeR} onChange={(value) => setChargeR(Math.abs(value))} unit="Ω" hint="Resistência equivalente vista pelo condensador na posição A" />
      <NumberField label="Resistência de descarga Rd" value={dischargeR} onChange={(value) => setDischargeR(Math.abs(value))} unit="Ω" hint="Resistência equivalente vista pelo condensador na posição B" />
      <LabNote title="Leitura do diagrama:">carrega no comutador (ou usa os botões) para passar de A para B. A corrente salta para ε/R no instante da comutação e cai para 36,8 %, 13,5 % e 5 % ao fim de τ, 2τ e 3τ. Metade da carga corresponde a metade da tensão, logo a metade da corrente inicial — em t = τ·ln 2. As duas fases têm constantes de tempo muito diferentes porque só muda a resistência.</LabNote>
    </>
  )
}
