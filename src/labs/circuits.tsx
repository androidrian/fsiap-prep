/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { rcDischargeVoltage, seriesCapacitorDischarge, twoMeshCurrents } from '../domain/exercises/calculators'
import type { FamilyId } from '../domain/types'
import './circuits.css'
import { Capacitor } from './circuits/Capacitor'
import { CapNet } from './circuits/CapNet'
import { Kirchhoff } from './circuits/Kirchhoff'
import { Meter } from './circuits/Meter'
import { Network } from './circuits/Network'
import { Source } from './circuits/Source'
import { SwitchRC } from './circuits/SwitchRC'
import { Wire } from './circuits/Wire'
import { Control, ResultStrip, numberParam, type LabScenario } from './ui'

function DCSimulator({ mode }: { mode: 'parallel' | 'meshes' }) {
  const [voltage, setVoltage] = useState(12); const [r1, setR1] = useState(6); const [r2, setR2] = useState(12)
  const [source2, setSource2] = useState(6); const [r3, setR3] = useState(4)
  const req = r1 * r2 / (r1 + r2); const total = voltage / req
  const { mesh1, mesh2, shared } = twoMeshCurrents(voltage, source2, r1, r2, r3)
  return <>
    {mode === 'parallel' && <><svg className="circuit-stage" viewBox="0 0 480 190"><path d="M50 35H180M180 35V75M180 35V150M180 75H330M180 150H330M330 75V150M330 115H420M420 115V35H50" /><rect x="220" y="63" width="70" height="24" /><rect x="220" y="138" width="70" height="24" /><line x1="45" y1="18" x2="45" y2="52" /><line x1="35" y1="25" x2="35" y2="45" /><text x="238" y="80">R₁ {r1}Ω</text><text x="238" y="155">R₂ {r2}Ω</text><text x="62" y="25">{voltage}V</text></svg><ResultStrip label="Resistência e corrente total" value={`${req.toFixed(2)} Ω`} formula="R_{eq}=R_1R_2/(R_1+R_2)" secondary={`It=${total.toFixed(2)} A · I₁=${(voltage/r1).toFixed(2)} A · I₂=${(voltage/r2).toFixed(2)} A`} /><Control label="Fonte" value={voltage} min={3} max={24} step={1} onChange={setVoltage} unit="V" /><Control label="R₁" value={r1} min={2} max={30} step={1} onChange={setR1} unit="Ω" /><Control label="R₂" value={r2} min={2} max={30} step={1} onChange={setR2} unit="Ω" /></>}
    {mode === 'meshes' && <><svg className="mesh-stage" viewBox="0 0 500 220"><path d="M55 35H245V185H55ZM245 35H445V185H245" /><rect x="120" y="23" width="65" height="24" /><rect x="315" y="23" width="65" height="24" /><rect x="232" y="83" width="26" height="64" /><line x1="43" y1="85" x2="67" y2="85" /><line x1="48" y1="98" x2="62" y2="98" /><line x1="433" y1="85" x2="457" y2="85" /><line x1="438" y1="98" x2="452" y2="98" /><text x="137" y="40">R₁</text><text x="332" y="40">R₂</text><text x="237" y="118">R₃</text><text x="77" y="118">E₁ {voltage}V</text><text x="370" y="118">E₂ {source2}V</text><text className="current-direction" x="151" y="151">{mesh1 >= 0 ? '→' : '←'}</text><text className="current-direction" x="344" y="151">{mesh2 >= 0 ? '→' : '←'}</text><text x="128" y="172">I₁ = {mesh1.toFixed(2)} A</text><text x="319" y="172">I₂ = {mesh2.toFixed(2)} A</text></svg><ResultStrip label="Corrente no ramo comum" value={`${shared.toFixed(3)} A`} formula="I_{R3}=I_1-I_2" secondary={`I₁=${mesh1.toFixed(2)} A · I₂=${mesh2.toFixed(2)} A · sinal define o sentido`} /><Control label="Fonte E₁" value={voltage} min={1} max={24} step={1} onChange={setVoltage} unit="V" /><Control label="Fonte E₂" value={source2} min={1} max={24} step={1} onChange={setSource2} unit="V" /><Control label="R₁" value={r1} min={2} max={20} step={1} onChange={setR1} unit="Ω" /><Control label="R₂" value={r2} min={2} max={20} step={1} onChange={setR2} unit="Ω" /><Control label="Ramo comum R₃" value={r3} min={1} max={15} step={1} onChange={setR3} unit="Ω" /></>}
  </>
}

/**
 * Curva de carga/descarga. Aceita `V` (V), `tau` (s) e `t` (s) no URL; os cursores trabalham em
 * s, ms ou μs conforme a ordem de grandeza de τ e alargam-se para caberem os valores pedidos.
 */
function RCCurve({ mode, params }: { mode: 'charge' | 'discharge'; params: Record<string, string> }) {
  const [setup] = useState(() => {
    const tauSeconds = Math.abs(numberParam(params, 'tau', 1)) || 1
    const [unit, scale] = tauSeconds >= 0.1 ? ['s', 1] as const : tauSeconds >= 1e-4 ? ['ms', 1e-3] as const : ['μs', 1e-6] as const
    const tau = tauSeconds / scale
    const time = Math.max(0, numberParam(params, 't', tauSeconds)) / scale
    const voltage = Math.abs(numberParam(params, 'V', 10))
    const tauStep = tau < 0.3 ? 0.01 : 0.1
    const timeMax = Math.max(4, Math.ceil(4 * tau), Math.ceil(1.25 * time))
    return {
      unit, tau, time, voltage, tauStep, timeMax,
      tauMin: Math.min(0.3, Math.max(tauStep, Number((tau / 2).toFixed(2)))),
      tauMax: Math.max(3, Math.ceil(2 * tau)),
      timeStep: tauStep * (timeMax > 40 ? 10 : timeMax > 8 ? 5 : 1),
      voltageMin: Math.min(3, Math.floor(voltage)),
      voltageMax: Math.max(24, Math.ceil(voltage)),
      voltageStep: Number.isInteger(voltage) ? 1 : 0.1,
    }
  })
  const [time, setTime] = useState(setup.time); const [tau, setTau] = useState(setup.tau); const [voltage, setVoltage] = useState(setup.voltage)
  const { unit, timeMax } = setup
  const fraction = (t: number) => (mode === 'charge' ? 1 - Math.exp(-t / tau) : Math.exp(-t / tau))
  const value = mode === 'charge' ? voltage * fraction(time) : rcDischargeVoltage(voltage, time, tau)
  const ratio = voltage > 0 ? value / voltage : 0
  const points = Array.from({ length: 41 }, (_, index) => `${10 + index * 10},${(150 - fraction(index / 40 * timeMax) * 120).toFixed(2)}`).join(' ')
  const tauX = 10 + Math.min(1, tau / timeMax) * 400
  return <><svg className="rc-chart" viewBox="0 0 420 180" role="img" aria-label={`Curva de ${mode === 'charge' ? 'carga' : 'descarga'} de um condensador: ${value.toFixed(2)} V em t = ${time} ${unit}, com τ = ${tau} ${unit}`}><path d="M10 150H410M10 150V10" /><path className="lab-circuits-guide" d={`M${tauX.toFixed(1)} 150V30`} /><polyline points={points} /><circle cx={Math.min(410, time / timeMax * 400 + 10)} cy={150 - ratio * 120} r="6" /><text x="18" y="20">{mode === 'charge' ? 'Vf' : 'V0'}</text><text x={tauX.toFixed(1)} y="168" textAnchor="middle">τ</text><text x="410" y="168" textAnchor="end">{timeMax} {unit}</text></svg><ResultStrip label="Tensão no condensador" value={`${value.toFixed(2)} V`} formula={mode === 'charge' ? 'V_C=V_f(1-e^{-t/\\tau})' : 'V_C=V_0e^{-t/\\tau}'} secondary={`${(ratio * 100).toFixed(1)}% de ${voltage} V · em 1τ: ${mode === 'charge' ? '63,2%' : '36,8%'}`} /><Control label="Tempo t" value={time} min={0} max={timeMax} step={setup.timeStep} onChange={setTime} unit={unit} /><Control label="Constante τ=RC" value={tau} min={setup.tauMin} max={setup.tauMax} step={setup.tauStep} onChange={setTau} unit={unit} /><Control label={mode === 'charge' ? 'Tensão final' : 'Tensão inicial'} value={voltage} min={setup.voltageMin} max={setup.voltageMax} step={setup.voltageStep} onChange={setVoltage} unit="V" /></>
}

function CapacitorNetworkScenario({ params }: { params: Record<string, string> }) {
  const [c1, setC1] = useState(numberParam(params, 'c1', 20)); const [c2, setC2] = useState(numberParam(params, 'c2', 90)); const [initialVoltage, setInitialVoltage] = useState(numberParam(params, 'V', 20))
  const [r1, setR1] = useState(numberParam(params, 'r1', 10)); const [r2, setR2] = useState(numberParam(params, 'r2', 15)); const [seriesR, setSeriesR] = useState(numberParam(params, 'rs', 5)); const [timeMicroseconds, setTimeMicroseconds] = useState(numberParam(params, 't', 18))
  const result = seriesCapacitorDischarge(c1 * 1e-6, c2 * 1e-6, initialVoltage, r1, r2, seriesR, timeMicroseconds * 1e-6)
  const chargeRatio = result.initialCharge > 0 ? result.chargeAtTime / result.initialCharge : 0
  const chartPoints = Array.from({ length: 51 }, (_, index) => `${35 + index * 7.8},${225 - Math.exp(-index / 10) * 48}`).join(' ')
  const markerX = 35 + Math.min(50, timeMicroseconds / (result.timeConstant * 1e6) * 10) * 7.8
  const markerY = 225 - chargeRatio * 48
  return <>
    <svg className="exam-rc-stage" viewBox="0 0 480 250" role="img" aria-label="Dois condensadores em série a descarregar numa resistência em série com dois ramos paralelos">
      <path className="circuit-wire" d="M35 62H78M96 38V86M112 38V86M112 62H148M166 38V86M182 38V86M182 62H225" />
      <text x="77" y="29">C₁ {c1.toFixed(0)} μF</text><text x="148" y="29">C₂ {c2.toFixed(0)} μF</text><text x="35" y="108">carregados a {initialVoltage.toFixed(1)} V</text>
      <path className="transfer-arrow" d="M213 62H268" /><text x="232" y="50">liga</text>
      <path className="circuit-wire" d="M275 62H310M360 62H435V132H390M340 132H302V92M302 92H390M390 92V172H340M290 172H275V62" />
      <rect className="circuit-resistor" x="310" y="50" width="50" height="24" /><rect className="circuit-resistor" x="340" y="80" width="50" height="24" /><rect className="circuit-resistor" x="290" y="160" width="50" height="24" />
      <text x="318" y="67">{seriesR.toFixed(0)} Ω</text><text x="348" y="97">{r1.toFixed(0)} Ω</text><text x="298" y="177">{r2.toFixed(0)} Ω</text><text className="branch-current" x="345" y="146">I₁₅(0)={result.maxCurrentInSecondBranch.toFixed(3)} A</text>
      <path className="rc-mini-axes" d="M35 225H435M35 225V168" /><polyline className="rc-mini-curve" points={chartPoints} /><circle className="rc-time-marker" cx={markerX} cy={markerY} r="5" /><text x="38" y="165">Q/Q₀</text><text x="395" y="242">5τ</text>
    </svg>
    <ResultStrip label={`Carga após ${timeMicroseconds.toFixed(1)} μs`} value={`${(result.chargeAtTime * 1e6).toFixed(2)} μC`} formula="Q(t)=Q_0e^{-t/(R_{eq}C_{eq})}" secondary={`Q/Q₀=${(chargeRatio * 100).toFixed(1)}% · Req=${result.equivalentResistance.toFixed(2)} Ω`} />
    <div className="exam-metrics four"><span><small>Capacidade equivalente</small><strong>{(result.equivalentCapacitance * 1e6).toFixed(2)} μF</strong></span><span><small>Carga inicial Q₀</small><strong>{(result.initialCharge * 1e6).toFixed(2)} μC</strong></span><span><small>Corrente máxima em 15 Ω</small><strong>{result.maxCurrentInSecondBranch.toFixed(3)} A</strong></span><span><small>Constante de tempo τ</small><strong>{(result.timeConstant * 1e6).toFixed(1)} μs</strong></span></div>
    <Control label="Condensador C₁" value={c1} min={5} max={120} step={5} onChange={setC1} unit="μF" /><Control label="Condensador C₂" value={c2} min={5} max={120} step={5} onChange={setC2} unit="μF" /><Control label="Tensão inicial" value={initialVoltage} min={2} max={40} step={1} onChange={setInitialVoltage} unit="V" /><Control label="Resistência em paralelo R₁" value={r1} min={2} max={30} step={1} onChange={setR1} unit="Ω" /><Control label="Resistência em paralelo R₂" value={r2} min={2} max={30} step={1} onChange={setR2} unit="Ω" /><Control label="Resistência em série" value={seriesR} min={1} max={20} step={1} onChange={setSeriesR} unit="Ω" /><Control label="Instante t" value={timeMicroseconds} min={0} max={900} step={1} onChange={setTimeMicroseconds} unit="μs" />
    <p className="balance-note"><strong>Sequência de cálculo:</strong> reduz primeiro os condensadores em série; depois reduz 10 Ω ∥ 15 Ω e soma 5 Ω; a corrente de 15 Ω exige a tensão do ramo paralelo, não 20 V diretamente.</p>
  </>
}

export const circuitLabs: Partial<Record<FamilyId, LabScenario[]>> = {
  dc_circuits: [
    { id: 'parallel', label: 'Ramos em paralelo', component: () => <DCSimulator mode="parallel" /> },
    { id: 'meshes', label: '2 malhas · 2 fontes', component: () => <DCSimulator mode="meshes" /> },
    { id: 'network', label: 'Redutor série/paralelo', component: Network },
    { id: 'kirchhoff', label: '3 ramos entre dois nós', component: Kirchhoff },
    { id: 'source', label: 'Fonte real e potência máxima', component: Source },
    { id: 'meter', label: 'Voltímetro real', component: Meter },
    { id: 'wire', label: 'Fio condutor', component: Wire },
  ],
  rc_circuits: [
    { id: 'charge', label: 'Carga', component: ({ params }) => <RCCurve mode="charge" params={params} /> },
    { id: 'discharge', label: 'Descarga', component: ({ params }) => <RCCurve mode="discharge" params={params} /> },
    { id: 'network', label: '2 condensadores · rede', component: CapacitorNetworkScenario },
    { id: 'switch', label: 'Comutador carga/descarga', component: SwitchRC },
    { id: 'capacitor', label: 'Condensador plano', component: Capacitor },
    { id: 'capnet', label: 'Associação de condensadores', component: CapNet },
  ],
}
