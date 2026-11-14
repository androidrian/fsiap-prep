/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { fourChargeCircle, symmetricElectricField, uniformElectricForce, uniformFieldEnergyChange } from '../domain/exercises/calculators'
import type { FamilyId } from '../domain/types'
import { Control, ResultStrip, numberParam, sig, type LabScenario } from './ui'
import { Charges } from './electro/Charges'
import { Pendulum } from './electro/Pendulum'
import { sliderRange } from './electro/physics'
import { Release } from './electro/Release'
import { Sheets } from './electro/Sheets'
import { TransverseMotion } from './electro/TransverseMotion'
import './electro.css'

/** Lê um parâmetro que tem de ser positivo (distâncias); valores inválidos caem no valor por omissão. */
function positiveParam(params: Record<string, string>, key: string, fallback: number) {
  const value = numberParam(params, key, fallback)
  return value > 0 ? value : fallback
}

/** Parâmetros que ativam a versão com valores físicos de `uniform_fields/motion` (exercício do jato de tinta). */
const physicalMotionParams = ['E', 'q', 'm', 'vx', 'L']

function CoulombSimulator({ mode, params }: { mode: 'symmetry' | 'pair' | 'circle'; params: Record<string, string> }) {
  // `pair` aceita q1, q2 (μC) e r (m); fora da gama dos cursores, a gama alarga em vez de cortar o valor.
  const pairStart = mode === 'pair' ? { r: positiveParam(params, 'r', 2), q1: numberParam(params, 'q1', 2), q2: numberParam(params, 'q2', -3) } : { r: 2, q1: 2, q2: -3 }
  const pairRanges = { r: sliderRange(pairStart.r, 0.5, 5, 0.1), q1: sliderRange(pairStart.q1, -6, 6, 1), q2: sliderRange(pairStart.q2, -6, 6, 1) }
  const [distance, setDistance] = useState(pairStart.r); const [q1, setQ1] = useState(pairStart.q1); const [q2, setQ2] = useState(pairStart.q2)
  const [side, setSide] = useState(1.5); const [height, setHeight] = useState(2); const [symmetricCharge, setSymmetricCharge] = useState(3)
  const value = 8.99e-3 * Math.abs(q1 * q2) / distance ** 2
  const vectorDistance = Math.hypot(side, height)
  const verticalField = Math.abs(symmetricElectricField(symmetricCharge * 1e-6, side, height).vertical)
  const vectorScale = 42
  const dx = side / vectorDistance * vectorScale; const dy = height / vectorDistance * vectorScale
  if (mode === 'circle') return <><FourChargeCircleScenario params={params} /></>
  return <>
    {mode === 'pair' && <><div className="particle-stage"><div className={`charge ${q1 >= 0 ? 'positive' : 'negative'}`}>{q1 > 0 ? '+' : ''}{q1}</div><div className="distance-line" style={{ width: `${Math.min(255, 80 + distance * 35)}px` }}><span>{distance.toFixed(pairRanges.r.step < 0.01 ? 3 : pairRanges.r.step < 0.1 ? 2 : 1)} m</span></div><div className={`charge ${q2 >= 0 ? 'positive' : 'negative'}`}>{q2 > 0 ? '+' : ''}{q2}</div></div><ResultStrip label="Força" value={value === 0 || value >= 0.001 ? `${value.toFixed(4)} N` : `${sig(value)} N`} formula="F=k|q_1q_2|/r^2" secondary={q1 * q2 === 0 ? 'sem força: uma das cargas é nula' : q1 * q2 < 0 ? 'atração' : 'repulsão'} /><Control label="Distância r" value={distance} min={pairRanges.r.min} max={pairRanges.r.max} step={pairRanges.r.step} onChange={setDistance} unit="m" /><Control label="Carga q₁" value={q1} min={pairRanges.q1.min} max={pairRanges.q1.max} step={pairRanges.q1.step} onChange={setQ1} unit="μC" /><Control label="Carga q₂" value={q2} min={pairRanges.q2.min} max={pairRanges.q2.max} step={pairRanges.q2.step} onChange={setQ2} unit="μC" /></>}
    {mode === 'symmetry' && <><svg className="vector-stage" viewBox="0 0 480 230"><line className="axis-line-dashed" x1="240" y1="15" x2="240" y2="210" /><line className="geometry-line" x1="105" y1="185" x2="240" y2="55" /><line className="geometry-line" x1="375" y1="185" x2="240" y2="55" /><circle className="charge-dot" cx="105" cy="185" r="20" /><circle className="charge-dot" cx="375" cy="185" r="20" /><circle className="test-dot" cx="240" cy="55" r="8" /><text x="91" y="191">+q</text><text x="361" y="191">+q</text><text x="247" y="49">P</text><path className="vector-arrow faded" d={`M240 55l${-dx} ${-dy}`} /><path className="vector-arrow faded" d={`M240 55l${dx} ${-dy}`} /><path className="vector-arrow total" d={`M240 55v${-Math.min(82, 30 + verticalField / 600)}`} /><text x="251" y="25">E⃗ total</text><text x="210" y="219">Ex₁ + Ex₂ = 0</text></svg><ResultStrip label="Campo resultante em P" value={`${verticalField.toFixed(0)} N/C`} formula="E_y=2(kq/r^2)\\,y/r" secondary={`componentes horizontais anulam · r=${vectorDistance.toFixed(2)} m`} /><Control label="Meia-separação a" value={side} min={0.5} max={3} step={0.1} onChange={setSide} unit="m" /><Control label="Altura y" value={height} min={0.5} max={4} step={0.1} onChange={setHeight} unit="m" /><Control label="Cada carga q" value={symmetricCharge} min={1} max={8} step={1} onChange={setSymmetricCharge} unit="μC" /></>}
  </>
}

function FourChargeCircleScenario({ params }: { params: Record<string, string> }) {
  const [q1, setQ1] = useState(numberParam(params, 'q1', 6))
  const [q2, setQ2] = useState(numberParam(params, 'q2', 5))
  const [q3, setQ3] = useState(numberParam(params, 'q3', 5))
  const [q4, setQ4] = useState(numberParam(params, 'q4', -6))
  const [diameter, setDiameter] = useState(numberParam(params, 'd', 6))
  const result = fourChargeCircle([q1 * 1e-6, q2 * 1e-6, q3 * 1e-6, q4 * 1e-6], diameter)
  const forceScale = result.forceOnFirst.magnitude > 0 ? 62 / result.forceOnFirst.magnitude : 0
  const forceEndX = 185 + result.forceOnFirst.x * forceScale
  const forceEndY = 50 - result.forceOnFirst.y * forceScale
  const charges = [{ x: 185, y: 50, value: q1, label: 'Q1' }, { x: 295, y: 50, value: q2, label: 'Q2' }, { x: 185, y: 160, value: q3, label: 'Q3' }, { x: 295, y: 160, value: q4, label: 'Q4' }]
  return <>
    <svg className="charge-circle-stage" viewBox="0 0 480 220" role="img" aria-label="Quatro cargas igualmente afastadas do centro P">
      <circle className="charge-orbit" cx="240" cy="105" r="78" />
      <path className="charge-diameters" d="M185 50L295 160M295 50L185 160" />
      <path className="charge-transfer" d="M185 50Q203 83 240 105" />
      <circle className="charge-center" cx="240" cy="105" r="6" /><text className="center-label" x="248" y="101">P</text>
      {charges.map((charge) => <g key={charge.label}><circle className={charge.value >= 0 ? 'exam-charge positive' : 'exam-charge negative'} cx={charge.x} cy={charge.y} r="18" /><text className="charge-value" x={charge.x} y={charge.y + 4}>{charge.value >= 0 ? '+' : ''}{charge.value}</text><text className="charge-name" x={charge.x - 11} y={charge.y - 25}>{charge.label}</text></g>)}
      {result.forceOnFirst.magnitude > 0 && <><line className="charge-force-vector" x1="185" y1="50" x2={forceEndX} y2={forceEndY} /><circle className="vector-tip" cx={forceEndX} cy={forceEndY} r="4" /><text className="force-caption" x={forceEndX - 10} y={forceEndY - 8}>F⃗R</text></>}
      <text className="diameter-caption" x="214" y="207">D = {diameter.toFixed(1)} m</text>
    </svg>
    <ResultStrip label="Potencial elétrico no centro P" value={`${(result.centerPotential / 1000).toFixed(2)} kV`} formula="V_P=k\sum_i q_i/R" secondary={`R=${(diameter / 2).toFixed(2)} m · potencial é escalar: somam-se cargas com sinal`} />
    <div className="exam-metrics three"><span><small>Força resultante em Q1</small><strong>{result.forceOnFirst.magnitude.toExponential(3)} N</strong></span><span><small>Componentes Fx · Fy</small><strong>{result.forceOnFirst.x.toExponential(2)} · {result.forceOnFirst.y.toExponential(2)} N</strong></span><span><small>Trabalho externo Q1 → P</small><strong>{result.externalWorkToCenter.toExponential(3)} J</strong></span></div>
    <Control label="Carga Q1" value={q1} min={-10} max={10} step={1} onChange={setQ1} unit="μC" /><Control label="Carga Q2" value={q2} min={-10} max={10} step={1} onChange={setQ2} unit="μC" /><Control label="Carga Q3" value={q3} min={-10} max={10} step={1} onChange={setQ3} unit="μC" /><Control label="Carga Q4" value={q4} min={-10} max={10} step={1} onChange={setQ4} unit="μC" /><Control label="Diâmetro do círculo" value={diameter} min={1} max={12} step={0.5} onChange={setDiameter} unit="m" />
    <p className="balance-note"><strong>Leitura do diagrama:</strong> o potencial em P soma escalares; a força em Q1 exige somar vetores; no trabalho para P exclui-se o potencial criado pela própria Q1.</p>
  </>
}

function UniformFieldSimulator({ mode, params }: { mode: 'plates' | 'motion' | 'work'; params: Record<string, string> }) {
  // `plates` aceita V (V), d (m) e q (μC); fora da gama dos cursores, a gama alarga em vez de cortar o valor.
  const plateStart = mode === 'plates' ? { V: numberParam(params, 'V', 100), d: positiveParam(params, 'd', 0.1), q: numberParam(params, 'q', -2) } : { V: 100, d: 0.1, q: -2 }
  const plateRanges = { V: sliderRange(plateStart.V, 20, 300, 5), d: sliderRange(plateStart.d, 0.02, 0.3, 0.01), q: sliderRange(plateStart.q, -6, 6, 1) }
  const [voltage, setVoltage] = useState(plateStart.V); const [distance, setDistance] = useState(plateStart.d); const [charge, setCharge] = useState(plateStart.q)
  const [particleMass, setParticleMass] = useState(4); const [motionChargeSign, setMotionChargeSign] = useState(1); const [initialSpeed, setInitialSpeed] = useState(30)
  const [workCharge, setWorkCharge] = useState(numberParam(params, 'q', 3)); const [workField, setWorkField] = useState(numberParam(params, 'E', 2))
  const [deltaX, setDeltaX] = useState(numberParam(params, 'dx', -4)); const [deltaY, setDeltaY] = useState(numberParam(params, 'dy', -3)); const [workMass, setWorkMass] = useState(numberParam(params, 'm', 200))
  const field = voltage / distance; const force = uniformElectricForce(charge * 1e-6, field)
  const acceleration = motionChargeSign * 1.602e-19 * field / (particleMass * 1e-27)
  const flightLength = 0.02; const flightTime = flightLength / (initialSpeed * 1000); const verticalDeflection = 0.5 * acceleration * flightTime ** 2
  const bend = Math.max(-72, Math.min(72, verticalDeflection / distance * 150))
  const workForce = uniformElectricForce(workCharge * 1e-15, workField * 1e3)
  const workEnergy = uniformFieldEnergyChange(workCharge * 1e-15, workField * 1e3, deltaX / 100, deltaY / 100, workMass * 1e-15)
  const pointBX = Math.max(55, Math.min(425, 240 + deltaX * 38)); const pointBY = Math.max(45, Math.min(190, 70 - deltaY * 30))
  const forceDirection = Math.sign(workForce)
  return <>
    {mode === 'plates' && <><div className="plate-stage"><div className="plate positive-plate">+</div><div className="field-space"><span>E → → →</span><i>{charge > 0 ? '+' : charge < 0 ? '−' : '0'}</i><b className={charge < 0 ? 'force-left' : charge > 0 ? 'force-right' : 'force-zero'}>{charge === 0 ? 'F = 0' : `F ${charge > 0 ? '→' : '←'}`}</b></div><div className="plate negative-plate">−</div></div><ResultStrip label="Campo e força" value={`${field.toFixed(0)} V/m`} formula="\\vec F=q\\vec E" secondary={charge === 0 ? 'q=0: o campo existe, mas a partícula neutra não sente força elétrica' : `F=${force.toExponential(2)} N · ${charge > 0 ? 'mesmo sentido de E' : 'sentido oposto a E'}`} /><Control label="Diferença de potencial" value={voltage} min={plateRanges.V.min} max={plateRanges.V.max} step={plateRanges.V.step} onChange={setVoltage} unit="V" /><Control label="Separação" value={distance} min={plateRanges.d.min} max={plateRanges.d.max} step={plateRanges.d.step} onChange={setDistance} unit="m" /><Control label="Carga" value={charge} min={plateRanges.q.min} max={plateRanges.q.max} step={plateRanges.q.step} onChange={setCharge} unit="μC" /></>}
    {mode === 'motion' && <><svg className="electric-motion-stage transverse" viewBox="0 0 480 220" role="img" aria-label="Partícula lançada transversalmente num campo elétrico uniforme"><rect className="positive-electric-plate" x="25" y="15" width="430" height="14" /><rect className="negative-electric-plate" x="25" y="191" width="430" height="14" /><text x="235" y="26">+</text><text x="235" y="203">−</text><path className="electric-field-lines" d="M90 45V175M170 45V175M250 45V175M330 45V175M410 45V175" /><text x="420" y="75">E ↓</text><path className="particle-path" d={`M60 105 Q240 105 420 ${105 + bend}`} /><circle className="moving-charge" cx="60" cy="105" r="7" /><text x="70" y="94">vₓ →</text></svg><ResultStrip label="Desvio após 2,0 cm na horizontal" value={`${(verticalDeflection * 1000).toFixed(2)} mm`} formula="y=\\frac{qE}{2m}(L/v_x)^2" secondary={`aᵧ=${acceleration.toExponential(2)} m/s² · t=${(flightTime * 1e6).toFixed(2)} μs · vₓ mantém-se constante`} /><Control label="Diferença de potencial" value={voltage} min={20} max={300} step={5} onChange={setVoltage} unit="V" /><Control label="Separação das placas" value={distance} min={0.02} max={0.3} step={0.01} onChange={setDistance} unit="m" /><Control label="Velocidade horizontal" value={initialSpeed} min={5} max={90} step={1} onChange={setInitialSpeed} unit="km/s" /><Control label="Massa" value={particleMass} min={1} max={12} step={0.5} onChange={setParticleMass} unit="×10⁻²⁷ kg" /><div className="source-kind"><span>Sinal da carga</span><div><button className={motionChargeSign > 0 ? 'active' : ''} onClick={() => setMotionChargeSign(1)}>positiva</button><button className={motionChargeSign < 0 ? 'active' : ''} onClick={() => setMotionChargeSign(-1)}>negativa</button></div></div></>}
    {mode === 'work' && <><svg className="uniform-work-stage" viewBox="0 0 480 230" role="img" aria-label="Deslocamento de A para B num campo elétrico uniforme"><path className="work-field-lines" d="M25 40H455M25 90H455M25 140H455M25 190H455" /><text x="420" y="31">E →</text><path className="work-trajectory" d={`M240 70 Q${(240 + pointBX) / 2 - 15} ${(70 + pointBY) / 2 - 22} ${pointBX} ${pointBY}`} /><line className="component-guide" x1="240" y1="70" x2="240" y2={pointBY} /><line className="component-guide" x1="240" y1={pointBY} x2={pointBX} y2={pointBY} /><circle className="point-a" cx="240" cy="70" r="7" /><circle className="point-b" cx={pointBX} cy={pointBY} r="7" /><text x="250" y="66">A</text><text x={pointBX - 18} y={pointBY - 10}>B</text><text className="component-label" x={(240 + pointBX) / 2 - 25} y={pointBY + 18}>Δx={deltaX.toFixed(1)} cm</text><text className="component-label" x="250" y={(70 + pointBY) / 2}>Δy={deltaY.toFixed(1)} cm</text>{forceDirection !== 0 && <><line className="force-vector" x1={pointBX} y1={pointBY - 25} x2={pointBX + forceDirection * 55} y2={pointBY - 25} /><text className="force-label" x={pointBX + forceDirection * 28 - 12} y={pointBY - 33}>Fₑ</text></>}</svg><ResultStrip label="Trabalho da força elétrica" value={`${workEnergy.electricWork.toExponential(2)} J`} formula="W_e=qE\\Delta x" secondary={`Fₑ=${workForce.toExponential(2)} N · Δy não contribui para Wₑ`} /><div className="energy-breakdown"><span><small>ΔU elétrica</small><strong>{(-workEnergy.electricWork).toExponential(2)} J</strong></span><span><small>W gravidade</small><strong>{workEnergy.gravityWork.toExponential(2)} J</strong></span><span><small>ΔU total</small><strong>{workEnergy.totalPotentialChange.toExponential(2)} J</strong></span></div><Control label="Carga q" value={workCharge} min={-6} max={6} step={0.5} onChange={setWorkCharge} unit="×10⁻¹⁵ C" /><Control label="Campo E" value={workField} min={0.5} max={5} step={0.1} onChange={setWorkField} unit="×10³ V/m" /><Control label="Deslocamento horizontal Δx" value={deltaX} min={-8} max={8} step={0.5} onChange={setDeltaX} unit="cm" /><Control label="Deslocamento vertical Δy" value={deltaY} min={-5} max={5} step={0.5} onChange={setDeltaY} unit="cm" /><Control label="Massa" value={workMass} min={0} max={500} step={10} onChange={setWorkMass} unit="×10⁻¹² g" /><p className="balance-note"><strong>Armadilha de exame:</strong> a massa não entra em Wₑ, mas entra na variação da energia potencial total porque existe deslocamento vertical no campo gravítico.</p></>}
  </>
}

/** `motion` com valores físicos (E, q, m, vx, L no URL) ou, sem eles, a versão original com cursores. */
function MotionScenario({ params }: { params: Record<string, string> }) {
  const physical = physicalMotionParams.some((key) => params[key] !== undefined && params[key] !== '')
  return physical ? <TransverseMotion params={params} /> : <UniformFieldSimulator mode="motion" params={params} />
}

export const electroLabs: Partial<Record<FamilyId, LabScenario[]>> = {
  electrostatics: [
    { id: 'charges', label: 'Mapa de cargas', component: Charges },
    { id: 'pendulum', label: 'Pêndulos carregados', component: Pendulum },
    { id: 'symmetry', label: 'Componentes que anulam', component: ({ params }) => <CoulombSimulator mode="symmetry" params={params} /> },
    { id: 'pair', label: 'Duas cargas', component: ({ params }) => <CoulombSimulator mode="pair" params={params} /> },
    { id: 'circle', label: '4 cargas no círculo', component: ({ params }) => <CoulombSimulator mode="circle" params={params} /> },
  ],
  uniform_fields: [
    { id: 'plates', label: 'Campo entre placas', component: ({ params }) => <UniformFieldSimulator mode="plates" params={params} /> },
    { id: 'motion', label: 'Lançamento transversal', component: MotionScenario },
    { id: 'work', label: 'Trabalho A → B', component: ({ params }) => <UniformFieldSimulator mode="work" params={params} /> },
    { id: 'sheets', label: 'Duas placas carregadas', component: Sheets },
    { id: 'release', label: 'Carga abandonada no campo', component: Release },
  ],
}
