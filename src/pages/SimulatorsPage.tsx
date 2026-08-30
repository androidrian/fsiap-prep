import { Activity, Atom, CircuitBoard, Flame, FlaskConical, Magnet, Move3d, Orbit, Radio, Waves } from 'lucide-react'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Formula } from '../components/Formula'
import { familyById } from '../data/analysis'
import { compositeThermalConduction, fourChargeCircle, magneticOrbitRadius, malusIntensity, rcDischargeVoltage, refractionAngle, seriesCapacitorDischarge, solenoidParticleDynamics, symmetricElectricField, twoMeshCurrents, uniformElectricForce, uniformFieldEnergyChange, unpolarizedThroughPolarizers } from '../domain/exercises/calculators'
import type { FamilyId } from '../domain/types'

interface SimulatorConfig {
  id: FamilyId
  label: string
  icon: ComponentType<{ size?: number }>
  question: string
  predictions: string[]
}

const simulators: SimulatorConfig[] = [
  { id: 'thermal_transport', label: 'Transferência térmica', icon: Flame, question: 'Se duplicares a espessura, o fluxo aumenta ou diminui?', predictions: ['Aumenta', 'Diminui', 'Mantém-se', 'Não sei'] },
  { id: 'thermal_equilibrium', label: 'Calorimetria', icon: FlaskConical, question: 'Se houver mais água fria, a temperatura final aproxima-se de que lado?', predictions: ['Da água fria', 'Da água quente', 'Fica igual', 'Não sei'] },
  { id: 'electrostatics', label: 'Eletrostática', icon: Atom, question: 'Se duplicares a distância entre cargas, o que acontece à força?', predictions: ['Fica a metade', 'Fica a um quarto', 'Duplica', 'Não sei'] },
  { id: 'uniform_fields', label: 'Campo uniforme', icon: Move3d, question: 'Se mantiveres ΔV e reduzires a distância, o campo fica…', predictions: ['Maior', 'Menor', 'Igual', 'Não sei'] },
  { id: 'dc_circuits', label: 'Circuitos DC', icon: CircuitBoard, question: 'Adicionar um ramo em paralelo faz Req…', predictions: ['Aumentar', 'Diminuir', 'Ficar igual', 'Não sei'] },
  { id: 'rc_circuits', label: 'Circuitos RC', icon: Activity, question: 'Ao fim de uma constante de tempo, Vc está mais perto de 5 V ou 10 V?', predictions: ['5 V', '10 V', 'É 0 V', 'Não sei'] },
  { id: 'magnetic_particles', label: 'Partículas em B', icon: Orbit, question: 'Se duplicares B, mantendo tudo o resto, o raio…', predictions: ['Duplica', 'Fica metade', 'Quadruplica', 'Não sei'] },
  { id: 'induction_sources', label: 'Indução', icon: Magnet, question: 'Se duplicares o número de espiras, a FEM induzida…', predictions: ['Duplica', 'Fica metade', 'Não muda', 'Não sei'] },
  { id: 'optics', label: 'Ótica', icon: Waves, question: 'Ao entrar num meio com maior índice, o raio aproxima-se de quê?', predictions: ['Da normal', 'Da superfície', 'Não desvia', 'Não sei'] },
  { id: 'em_waves', label: 'Polarizadores e ondas', icon: Radio, question: 'P₁=0°, P₂=45° e P₃=90°. Para luz não polarizada, que fração de I₀ chega ao fim?', predictions: ['I₀/8', 'Zero', 'I₀/4', 'I₀/2'] },
]

export function SimulatorsPage() {
  const [searchParams] = useSearchParams()
  const requestedFamily = searchParams.get('family') as FamilyId | null
  const initialFamily = requestedFamily && familyById[requestedFamily] ? requestedFamily : 'thermal_transport'
  const [active, setActive] = useState<FamilyId>(initialFamily)
  const [prediction, setPrediction] = useState<string | null>(null)
  const config = simulators.find((simulator) => simulator.id === active)!
  const switchSimulator = (id: FamilyId) => { setActive(id); setPrediction(null) }
  useEffect(() => {
    if (requestedFamily && familyById[requestedFamily]) {
      setActive(requestedFamily)
      setPrediction(null)
    }
  }, [requestedFamily])

  return (
    <div className="page simulators-page">
      <section className="page-heading simulator-heading"><div><p className="eyebrow">10 famílias · 29 cenários</p><h1>Vê a física a acontecer.</h1><p className="lede">Cada diagrama reage aos dados e cobre decisões geométricas, vetoriais e temporais recorrentes nas provas.</p></div><div className="sim-count"><strong>29</strong><span>cenários interativos</span></div></section>
      <section className="simulator-lab">
        <nav className="simulator-index" aria-label="Simuladores por família">
          {simulators.map(({ id, label, icon: Icon }, index) => <button key={id} className={active === id ? 'active' : ''} onClick={() => switchSimulator(id)}><span>{String(index + 1).padStart(2, '0')}</span><Icon size={16} /><strong>{label}</strong></button>)}
        </nav>
        <div className="simulator-main">
          <div className="simulator-title"><div><span className="section-label">Família do exame</span><h2>{familyById[active].name}</h2></div><small>{familyById[active].examAppearances}/{familyById[active].examCount} exames</small></div>
          <div className="simulator-workspace expanded">
            <div className="sim-question">
              <span className="section-label">Pergunta rápida · laboratório já aberto</span><h2>{config.question}</h2>
              <div className="prediction-options">{config.predictions.map((option) => <button className={prediction === option ? 'selected' : ''} onClick={() => setPrediction(option)} key={option}>{option}</button>)}</div>
              <p className="sim-evidence">{familyById[active].recognition}</p>
            </div>
            <div className="sim-visual revealed">
              <Simulator key={`${active}-${searchParams.toString()}`} active={active} scenario={searchParams.get('scenario')} params={Object.fromEntries(searchParams.entries())} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Simulator({ active, scenario, params }: { active: FamilyId; scenario: string | null; params: Record<string, string> }) {
  if (active === 'thermal_transport') return <ThermalSimulator initialMode={scenario} params={params} />
  if (active === 'thermal_equilibrium') return <CalorimetrySimulator />
  if (active === 'electrostatics') return <CoulombSimulator initialMode={scenario} params={params} />
  if (active === 'uniform_fields') return <UniformFieldSimulator initialMode={scenario} params={params} />
  if (active === 'dc_circuits') return <DCSimulator initialMode={scenario} />
  if (active === 'rc_circuits') return <RCSimulator initialMode={scenario} params={params} />
  if (active === 'magnetic_particles') return <MagneticParticleSimulator initialMode={scenario} params={params} />
  if (active === 'induction_sources') return <InductionSimulator initialMode={scenario} />
  if (active === 'optics') return <OpticsSimulator initialMode={scenario} />
  return <EMWaveSimulator initialMode={scenario} params={params} />
}

function Control({ label, value, min, max, step, onChange, unit }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; unit: string }) {
  const decimals = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0
  return <label className="sim-control"><span>{label}<strong>{value.toFixed(decimals)} {unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function ResultStrip({ label, value, formula, secondary }: { label: string; value: string; formula: string; secondary?: string }) {
  return <div className="sim-result"><span>{label}</span><strong>{value}</strong>{secondary && <small>{secondary}</small>}<Formula value={formula} /></div>
}

function ScenarioTabs<T extends string>({ value, onChange, options }: { value: T; onChange: (value: T) => void; options: readonly (readonly [T, string])[] }) {
  return <div className="scenario-tabs">{options.map(([id, label]) => <button key={id} className={value === id ? 'active' : ''} onClick={() => onChange(id)}>{label}</button>)}</div>
}

function numberParam(params: Record<string, string>, key: string, fallback: number) {
  const parsed = Number(params[key])
  return Number.isFinite(parsed) ? parsed : fallback
}

function ThermalSimulator({ initialMode, params }: { initialMode: string | null; params: Record<string, string> }) {
  const [mode, setMode] = useState<'layers' | 'single' | 'network'>(initialMode === 'network' ? 'network' : initialMode === 'single' ? 'single' : 'layers')
  const [thickness, setThickness] = useState(numberParam(params, 'l1', 0.08)); const [k, setK] = useState(numberParam(params, 'k1', 0.8))
  const [thickness2, setThickness2] = useState(numberParam(params, 'l2', 0.12)); const [k2, setK2] = useState(numberParam(params, 'k2', 0.2))
  const [hotBoundary, setHotBoundary] = useState(100); const [steelLength, setSteelLength] = useState(0.24)
  const area = numberParam(params, 'area', 2); const hot = numberParam(params, 'hot', 40); const cold = numberParam(params, 'cold', 15)
  const r1 = thickness / (k * area); const r2 = thickness2 / (k2 * area)
  const resistance = mode === 'layers' ? r1 + r2 : r1
  const value = mode === 'layers' ? compositeThermalConduction(area, hot - cold, [{ thickness, conductivity: k }, { thickness: thickness2, conductivity: k2 }]) : (hot - cold) / resistance
  const interfaceTemp = hot - value * r1
  const networkArea = 2e-4
  const copperResistance = 0.13 / (401 * networkArea); const brassResistance = 0.18 / (109 * networkArea); const steelResistance = steelLength / (14 * networkArea)
  const junctionTemp = (hotBoundary / copperResistance) / (1 / copperResistance + 1 / brassResistance + 1 / steelResistance)
  const copperFlow = (hotBoundary - junctionTemp) / copperResistance; const brassFlow = junctionTemp / brassResistance; const steelFlow = junctionTemp / steelResistance
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'layers', 'Parede composta'], ['single', 'Camada única'], ['network', 'Rede térmica em Y']]} />
    {mode !== 'network' && <><div className="wall-stage composite"><span className="hot">{hot}°C</span><div className="wall layer-one" style={{ width: `${45 + thickness * 420}px` }}><small>k₁</small></div>{mode === 'layers' && <><i>{interfaceTemp.toFixed(1)}°</i><div className="wall layer-two" style={{ width: `${45 + thickness2 * 420}px` }}><small>k₂</small></div></>}<div className="heat-arrows">→ →</div><span className="cold">{cold}°C</span></div><ResultStrip label="Fluxo de calor estacionário" value={`${value.toFixed(1)} W`} formula={mode === 'layers' ? 'R_{eq}=L_1/(k_1A)+L_2/(k_2A)' : '\\dot Q=kA\\Delta T/L'} secondary={mode === 'layers' ? `T interface=${interfaceTemp.toFixed(1)} °C · maior queda na maior resistência` : `Rth=${r1.toFixed(3)} K/W`} /><Control label="Espessura L₁" value={thickness} min={0.005} max={0.2} step={0.005} onChange={setThickness} unit="m" /><Control label="Condutividade k₁" value={k} min={0.04} max={1} step={0.01} onChange={setK} unit="W/(m·K)" />{mode === 'layers' && <><Control label="Espessura L₂" value={thickness2} min={0.005} max={0.2} step={0.005} onChange={setThickness2} unit="m" /><Control label="Condutividade k₂" value={k2} min={0.04} max={1} step={0.01} onChange={setK2} unit="W/(m·K)" /></>}</>}
    {mode === 'network' && <><svg className="thermal-network-stage" viewBox="0 0 480 230" role="img" aria-label="Três barras térmicas ligadas numa junção em Y"><path className="copper-rod" d="M55 40L240 120" /><path className="brass-rod" d="M240 120L425 40" /><path className="steel-rod" d="M240 120L240 210" /><circle cx="240" cy="120" r="12" /><text x="25" y="28">cobre · {hotBoundary}°C</text><text x="350" y="28">latão · 0°C</text><text x="255" y="213">aço · 0°C</text><text className="junction-label" x="255" y="114">Tⱼ={junctionTemp.toFixed(1)}°C</text><text className="flow-label" x="92" y="130">{copperFlow.toFixed(1)} W → nó</text><text className="flow-label" x="330" y="130">nó → {brassFlow.toFixed(1)} W</text><text className="flow-label" x="152" y="184">nó → {steelFlow.toFixed(1)} W</text></svg><ResultStrip label="Temperatura da junção" value={`${junctionTemp.toFixed(2)} °C`} formula="\\dot Q_{in}=\\dot Q_{out}" secondary={`Rcobre=${copperResistance.toFixed(2)} · Rlatão=${brassResistance.toFixed(2)} · Raço=${steelResistance.toFixed(2)} K/W`} /><Control label="Temperatura no cobre" value={hotBoundary} min={20} max={150} step={5} onChange={setHotBoundary} unit="°C" /><Control label="Comprimento do aço" value={steelLength} min={0.08} max={0.5} step={0.01} onChange={setSteelLength} unit="m" /><p className="balance-note">Verificação do nó: {copperFlow.toFixed(2)} W entram; {(brassFlow + steelFlow).toFixed(2)} W saem.</p></>}
  </>
}

function CalorimetrySimulator() {
  const [hotMass, setHotMass] = useState(1); const [coldMass, setColdMass] = useState(2); const [hotTemp, setHotTemp] = useState(70); const coldTemp = 15; const final = (hotMass * hotTemp + coldMass * coldTemp) / (hotMass + coldMass)
  return <><div className="beaker-stage"><div className="beaker hot-beaker" style={{ height: `${70 + hotMass * 30}px` }}><span>{hotTemp}°</span></div><strong>+</strong><div className="beaker cold-beaker" style={{ height: `${70 + coldMass * 30}px` }}><span>{coldTemp}°</span></div><strong>→</strong><div className="beaker mixed-beaker"><span>{final.toFixed(1)}°C</span></div></div><ResultStrip label="Temperatura de equilíbrio" value={`${final.toFixed(1)} °C`} formula="\\sum Q=0" secondary="mesmo material · sem perdas" /><Control label="Massa quente" value={hotMass} min={0.2} max={3} step={0.1} onChange={setHotMass} unit="kg" /><Control label="Massa fria" value={coldMass} min={0.2} max={3} step={0.1} onChange={setColdMass} unit="kg" /><Control label="Temperatura quente" value={hotTemp} min={30} max={95} step={1} onChange={setHotTemp} unit="°C" /></>
}

function CoulombSimulator({ initialMode, params }: { initialMode: string | null; params: Record<string, string> }) {
  const [mode, setMode] = useState<'symmetry' | 'pair' | 'circle'>(initialMode === 'pair' || initialMode === 'circle' ? initialMode : 'symmetry')
  const [distance, setDistance] = useState(2); const [q1, setQ1] = useState(2); const [q2, setQ2] = useState(-3)
  const [side, setSide] = useState(1.5); const [height, setHeight] = useState(2); const [symmetricCharge, setSymmetricCharge] = useState(3)
  const value = 8.99e-3 * Math.abs(q1 * q2) / distance ** 2
  const vectorDistance = Math.hypot(side, height)
  const verticalField = Math.abs(symmetricElectricField(symmetricCharge * 1e-6, side, height).vertical)
  const vectorScale = 42
  const dx = side / vectorDistance * vectorScale; const dy = height / vectorDistance * vectorScale
  if (mode === 'circle') return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'symmetry', 'Componentes que anulam'], ['pair', 'Duas cargas'], ['circle', '4 cargas no círculo']]} /><FourChargeCircleScenario params={params} /></>
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'symmetry', 'Componentes que anulam'], ['pair', 'Duas cargas'], ['circle', '4 cargas no círculo']]} />
    {mode === 'pair' && <><div className="particle-stage"><div className={`charge ${q1 >= 0 ? 'positive' : 'negative'}`}>{q1 > 0 ? '+' : ''}{q1}</div><div className="distance-line" style={{ width: `${80 + distance * 35}px` }}><span>{distance.toFixed(1)} m</span></div><div className={`charge ${q2 >= 0 ? 'positive' : 'negative'}`}>{q2 > 0 ? '+' : ''}{q2}</div></div><ResultStrip label="Força" value={`${value.toFixed(4)} N`} formula="F=k|q_1q_2|/r^2" secondary={q1 * q2 < 0 ? 'atração' : 'repulsão'} /><Control label="Distância r" value={distance} min={0.5} max={5} step={0.1} onChange={setDistance} unit="m" /><Control label="Carga q₁" value={q1} min={-6} max={6} step={1} onChange={setQ1} unit="μC" /><Control label="Carga q₂" value={q2} min={-6} max={6} step={1} onChange={setQ2} unit="μC" /></>}
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

function UniformFieldSimulator({ initialMode, params }: { initialMode: string | null; params: Record<string, string> }) {
  const [mode, setMode] = useState<'plates' | 'motion' | 'work'>(initialMode === 'motion' || initialMode === 'work' ? initialMode : 'plates')
  const [voltage, setVoltage] = useState(100); const [distance, setDistance] = useState(0.1); const [charge, setCharge] = useState(-2)
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
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'plates', 'Campo entre placas'], ['motion', 'Lançamento transversal'], ['work', 'Trabalho A → B']]} />
    {mode === 'plates' && <><div className="plate-stage"><div className="plate positive-plate">+</div><div className="field-space"><span>E → → →</span><i>{charge > 0 ? '+' : charge < 0 ? '−' : '0'}</i><b className={charge < 0 ? 'force-left' : charge > 0 ? 'force-right' : 'force-zero'}>{charge === 0 ? 'F = 0' : `F ${charge > 0 ? '→' : '←'}`}</b></div><div className="plate negative-plate">−</div></div><ResultStrip label="Campo e força" value={`${field.toFixed(0)} V/m`} formula="\\vec F=q\\vec E" secondary={charge === 0 ? 'q=0: o campo existe, mas a partícula neutra não sente força elétrica' : `F=${force.toExponential(2)} N · ${charge > 0 ? 'mesmo sentido de E' : 'sentido oposto a E'}`} /><Control label="Diferença de potencial" value={voltage} min={20} max={300} step={5} onChange={setVoltage} unit="V" /><Control label="Separação" value={distance} min={0.02} max={0.3} step={0.01} onChange={setDistance} unit="m" /><Control label="Carga" value={charge} min={-6} max={6} step={1} onChange={setCharge} unit="μC" /></>}
    {mode === 'motion' && <><svg className="electric-motion-stage transverse" viewBox="0 0 480 220" role="img" aria-label="Partícula lançada transversalmente num campo elétrico uniforme"><rect className="positive-electric-plate" x="25" y="15" width="430" height="14" /><rect className="negative-electric-plate" x="25" y="191" width="430" height="14" /><text x="235" y="26">+</text><text x="235" y="203">−</text><path className="electric-field-lines" d="M90 45V175M170 45V175M250 45V175M330 45V175M410 45V175" /><text x="420" y="75">E ↓</text><path className="particle-path" d={`M60 105 Q240 105 420 ${105 + bend}`} /><circle className="moving-charge" cx="60" cy="105" r="7" /><text x="70" y="94">vₓ →</text></svg><ResultStrip label="Desvio após 2,0 cm na horizontal" value={`${(verticalDeflection * 1000).toFixed(2)} mm`} formula="y=\\frac{qE}{2m}(L/v_x)^2" secondary={`aᵧ=${acceleration.toExponential(2)} m/s² · t=${(flightTime * 1e6).toFixed(2)} μs · vₓ mantém-se constante`} /><Control label="Diferença de potencial" value={voltage} min={20} max={300} step={5} onChange={setVoltage} unit="V" /><Control label="Separação das placas" value={distance} min={0.02} max={0.3} step={0.01} onChange={setDistance} unit="m" /><Control label="Velocidade horizontal" value={initialSpeed} min={5} max={90} step={1} onChange={setInitialSpeed} unit="km/s" /><Control label="Massa" value={particleMass} min={1} max={12} step={0.5} onChange={setParticleMass} unit="×10⁻²⁷ kg" /><div className="source-kind"><span>Sinal da carga</span><div><button className={motionChargeSign > 0 ? 'active' : ''} onClick={() => setMotionChargeSign(1)}>positiva</button><button className={motionChargeSign < 0 ? 'active' : ''} onClick={() => setMotionChargeSign(-1)}>negativa</button></div></div></>}
    {mode === 'work' && <><svg className="uniform-work-stage" viewBox="0 0 480 230" role="img" aria-label="Deslocamento de A para B num campo elétrico uniforme"><path className="work-field-lines" d="M25 40H455M25 90H455M25 140H455M25 190H455" /><text x="420" y="31">E →</text><path className="work-trajectory" d={`M240 70 Q${(240 + pointBX) / 2 - 15} ${(70 + pointBY) / 2 - 22} ${pointBX} ${pointBY}`} /><line className="component-guide" x1="240" y1="70" x2="240" y2={pointBY} /><line className="component-guide" x1="240" y1={pointBY} x2={pointBX} y2={pointBY} /><circle className="point-a" cx="240" cy="70" r="7" /><circle className="point-b" cx={pointBX} cy={pointBY} r="7" /><text x="250" y="66">A</text><text x={pointBX - 18} y={pointBY - 10}>B</text><text className="component-label" x={(240 + pointBX) / 2 - 25} y={pointBY + 18}>Δx={deltaX.toFixed(1)} cm</text><text className="component-label" x="250" y={(70 + pointBY) / 2}>Δy={deltaY.toFixed(1)} cm</text>{forceDirection !== 0 && <><line className="force-vector" x1={pointBX} y1={pointBY - 25} x2={pointBX + forceDirection * 55} y2={pointBY - 25} /><text className="force-label" x={pointBX + forceDirection * 28 - 12} y={pointBY - 33}>Fₑ</text></>}</svg><ResultStrip label="Trabalho da força elétrica" value={`${workEnergy.electricWork.toExponential(2)} J`} formula="W_e=qE\\Delta x" secondary={`Fₑ=${workForce.toExponential(2)} N · Δy não contribui para Wₑ`} /><div className="energy-breakdown"><span><small>ΔU elétrica</small><strong>{(-workEnergy.electricWork).toExponential(2)} J</strong></span><span><small>W gravidade</small><strong>{workEnergy.gravityWork.toExponential(2)} J</strong></span><span><small>ΔU total</small><strong>{workEnergy.totalPotentialChange.toExponential(2)} J</strong></span></div><Control label="Carga q" value={workCharge} min={-6} max={6} step={0.5} onChange={setWorkCharge} unit="×10⁻¹⁵ C" /><Control label="Campo E" value={workField} min={0.5} max={5} step={0.1} onChange={setWorkField} unit="×10³ V/m" /><Control label="Deslocamento horizontal Δx" value={deltaX} min={-8} max={8} step={0.5} onChange={setDeltaX} unit="cm" /><Control label="Deslocamento vertical Δy" value={deltaY} min={-5} max={5} step={0.5} onChange={setDeltaY} unit="cm" /><Control label="Massa" value={workMass} min={0} max={500} step={10} onChange={setWorkMass} unit="×10⁻¹² g" /><p className="balance-note"><strong>Armadilha de exame:</strong> a massa não entra em Wₑ, mas entra na variação da energia potencial total porque existe deslocamento vertical no campo gravítico.</p></>}
  </>
}

function DCSimulator({ initialMode }: { initialMode: string | null }) {
  const [mode, setMode] = useState<'parallel' | 'meshes'>(initialMode === 'meshes' ? 'meshes' : 'parallel')
  const [voltage, setVoltage] = useState(12); const [r1, setR1] = useState(6); const [r2, setR2] = useState(12)
  const [source2, setSource2] = useState(6); const [r3, setR3] = useState(4)
  const req = r1 * r2 / (r1 + r2); const total = voltage / req
  const { mesh1, mesh2, shared } = twoMeshCurrents(voltage, source2, r1, r2, r3)
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'parallel', 'Ramos em paralelo'], ['meshes', '2 malhas · 2 fontes']]} />
    {mode === 'parallel' && <><svg className="circuit-stage" viewBox="0 0 480 190"><path d="M50 35H180M180 35V75M180 35V150M180 75H330M180 150H330M330 75V150M330 115H420M420 115V35H50" /><rect x="220" y="63" width="70" height="24" /><rect x="220" y="138" width="70" height="24" /><line x1="45" y1="18" x2="45" y2="52" /><line x1="35" y1="25" x2="35" y2="45" /><text x="238" y="80">R₁ {r1}Ω</text><text x="238" y="155">R₂ {r2}Ω</text><text x="62" y="25">{voltage}V</text></svg><ResultStrip label="Resistência e corrente total" value={`${req.toFixed(2)} Ω`} formula="R_{eq}=R_1R_2/(R_1+R_2)" secondary={`It=${total.toFixed(2)} A · I₁=${(voltage/r1).toFixed(2)} A · I₂=${(voltage/r2).toFixed(2)} A`} /><Control label="Fonte" value={voltage} min={3} max={24} step={1} onChange={setVoltage} unit="V" /><Control label="R₁" value={r1} min={2} max={30} step={1} onChange={setR1} unit="Ω" /><Control label="R₂" value={r2} min={2} max={30} step={1} onChange={setR2} unit="Ω" /></>}
    {mode === 'meshes' && <><svg className="mesh-stage" viewBox="0 0 500 220"><path d="M55 35H245V185H55ZM245 35H445V185H245" /><rect x="120" y="23" width="65" height="24" /><rect x="315" y="23" width="65" height="24" /><rect x="232" y="83" width="26" height="64" /><line x1="43" y1="85" x2="67" y2="85" /><line x1="48" y1="98" x2="62" y2="98" /><line x1="433" y1="85" x2="457" y2="85" /><line x1="438" y1="98" x2="452" y2="98" /><text x="137" y="40">R₁</text><text x="332" y="40">R₂</text><text x="237" y="118">R₃</text><text x="77" y="118">E₁ {voltage}V</text><text x="370" y="118">E₂ {source2}V</text><text className="current-direction" x="151" y="151">{mesh1 >= 0 ? '→' : '←'}</text><text className="current-direction" x="344" y="151">{mesh2 >= 0 ? '→' : '←'}</text><text x="128" y="172">I₁ = {mesh1.toFixed(2)} A</text><text x="319" y="172">I₂ = {mesh2.toFixed(2)} A</text></svg><ResultStrip label="Corrente no ramo comum" value={`${shared.toFixed(3)} A`} formula="I_{R3}=I_1-I_2" secondary={`I₁=${mesh1.toFixed(2)} A · I₂=${mesh2.toFixed(2)} A · sinal define o sentido`} /><Control label="Fonte E₁" value={voltage} min={1} max={24} step={1} onChange={setVoltage} unit="V" /><Control label="Fonte E₂" value={source2} min={1} max={24} step={1} onChange={setSource2} unit="V" /><Control label="R₁" value={r1} min={2} max={20} step={1} onChange={setR1} unit="Ω" /><Control label="R₂" value={r2} min={2} max={20} step={1} onChange={setR2} unit="Ω" /><Control label="Ramo comum R₃" value={r3} min={1} max={15} step={1} onChange={setR3} unit="Ω" /></>}
  </>
}

function RCSimulator({ initialMode, params }: { initialMode: string | null; params: Record<string, string> }) {
  const [mode, setMode] = useState<'charge' | 'discharge' | 'network'>(initialMode === 'discharge' || initialMode === 'network' ? initialMode : 'charge')
  const [time, setTime] = useState(1); const [tau, setTau] = useState(1); const [voltage, setVoltage] = useState(10)
  const value = mode === 'charge' ? voltage * (1 - Math.exp(-time / tau)) : rcDischargeVoltage(voltage, time, tau)
  const points = Array.from({ length: 41 }, (_, index) => { const t = index / 10; const y = mode === 'charge' ? voltage * (1 - Math.exp(-t / tau)) : voltage * Math.exp(-t / tau); return `${index * 10},${150 - y / voltage * 120}` }).join(' ')
  if (mode === 'network') return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'charge', 'Carga'], ['discharge', 'Descarga'], ['network', '2 condensadores · rede']]} /><CapacitorNetworkScenario params={params} /></>
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'charge', 'Carga'], ['discharge', 'Descarga'], ['network', '2 condensadores · rede']]} /><svg className="rc-chart" viewBox="0 0 420 180" role="img" aria-label={`Curva de ${mode === 'charge' ? 'carga' : 'descarga'} de um condensador`}><path d="M10 150H410M10 150V10" /><polyline points={points} /><circle cx={Math.min(410,time * 100 + 10)} cy={150 - value / voltage * 120} r="6" /><text x="18" y="20">{mode === 'charge' ? 'Vf' : 'V0'}</text><text x="382" y="168">t</text></svg><ResultStrip label="Tensão no condensador" value={`${value.toFixed(2)} V`} formula={mode === 'charge' ? 'V_C=V_f(1-e^{-t/\\tau})' : 'V_C=V_0e^{-t/\\tau}'} secondary={`${(value / voltage * 100).toFixed(1)}% de ${voltage} V · em 1τ: ${mode === 'charge' ? '63,2%' : '36,8%'}`} /><Control label="Tempo t" value={time} min={0} max={4} step={0.1} onChange={setTime} unit="s" /><Control label="Constante τ=RC" value={tau} min={0.3} max={3} step={0.1} onChange={setTau} unit="s" /><Control label={mode === 'charge' ? 'Tensão final' : 'Tensão inicial'} value={voltage} min={3} max={24} step={1} onChange={setVoltage} unit="V" /></>
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

function MagneticParticleSimulator({ initialMode, params }: { initialMode: string | null; params: Record<string, string> }) {
  const [mode, setMode] = useState<'particle' | 'wire' | 'loop' | 'solenoid-particle'>(initialMode === 'wire' || initialMode === 'loop' || initialMode === 'solenoid-particle' ? initialMode : 'particle')
  const [velocity, setVelocity] = useState(numberParam(params, 'v', 45000) / 1000); const [field, setField] = useState(numberParam(params, 'B', 4)); const [mass, setMass] = useState(numberParam(params, 'mass', 4))
  const [chargeSign, setChargeSign] = useState(1); const [fieldDirection, setFieldDirection] = useState(-1)
  const [current, setCurrent] = useState(numberParam(params, 'I', 8)); const [wireDistance, setWireDistance] = useState(numberParam(params, 'r', 0.08))
  const [turns, setTurns] = useState(20); const [loopRadius, setLoopRadius] = useState(0.12); const [loopCurrent, setLoopCurrent] = useState(5); const [loopDirection, setLoopDirection] = useState(1)
  const radius = magneticOrbitRadius(mass * 1e-25, velocity * 1000, 1.602e-19, field * 1e-3)
  const normalized = Math.max(0, Math.min(1, (Math.log10(radius) + .3) / 2.8))
  const arcRadius = 35 + normalized * 100
  const direction = chargeSign * fieldDirection
  const arcEndX = 240 + direction * arcRadius
  const arcEndY = 188 - arcRadius
  const wireField = 2e-7 * Math.abs(current) / wireDistance
  const loopField = 4 * Math.PI * 1e-7 * turns * loopCurrent / (2 * loopRadius)
  const sampleRadius = 48 + (wireDistance - 0.005) / 0.195 * 112

  if (mode === 'solenoid-particle') return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'particle', 'Partícula em B'], ['wire', 'Campo de um fio'], ['loop', 'Campo de uma espira'], ['solenoid-particle', 'Partícula no solenoide']]} /><SolenoidParticleScenario params={params} /></>
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'particle', 'Partícula em B'], ['wire', 'Campo de um fio'], ['loop', 'Campo de uma espira'], ['solenoid-particle', 'Partícula no solenoide']]} />
    {mode === 'particle' && <><div className="source-kind"><span>Orientações</span><div><button className={chargeSign > 0 ? 'active' : ''} onClick={() => setChargeSign(1)}>q positiva</button><button className={chargeSign < 0 ? 'active' : ''} onClick={() => setChargeSign(-1)}>q negativa</button><button className={fieldDirection < 0 ? 'active' : ''} onClick={() => setFieldDirection(-1)}>B ⊗</button><button className={fieldDirection > 0 ? 'active' : ''} onClick={() => setFieldDirection(1)}>B ⊙</button></div></div><svg className="orbit-stage" viewBox="0 0 480 210"><defs><pattern id="crosses" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M8 8l8 8m0-8l-8 8" /></pattern></defs><rect x="35" y="18" width="410" height="170" fill="url(#crosses)" /><path d={`M240 188 A${arcRadius} ${arcRadius} 0 0 ${direction > 0 ? 1 : 0} ${arcEndX} ${arcEndY}`} /><circle cx="240" cy="188" r="6" /><text x="250" y="178">v ↑</text><text x="48" y="40">B {fieldDirection < 0 ? '⊗' : '⊙'}</text><text x={arcEndX + (direction > 0 ? 5 : -24)} y={arcEndY - 5}>r visual</text></svg><ResultStrip label="Raio da trajetória" value={`${radius.toFixed(2)} m`} formula="r=mv/(|q|B)" secondary={`curvatura para ${direction > 0 ? 'a direita' : 'a esquerda'} · escala visual logarítmica`} /><Control label="Velocidade" value={velocity} min={0.5} max={90} step={0.25} onChange={setVelocity} unit="km/s" /><Control label="Campo B" value={field} min={0.1} max={12} step={0.05} onChange={setField} unit="mT" /><Control label="Massa" value={mass} min={0.01} max={10} step={0.01} onChange={setMass} unit="×10⁻²⁵ kg" /></>}
    {mode === 'wire' && <><svg className={`field-source-stage ${current === 0 ? 'zero-field' : ''}`} viewBox="0 0 480 210"><circle className="field-ring ring-a" cx="240" cy="105" r="48" /><circle className="field-ring ring-b" cx="240" cy="105" r="92" /><circle className="field-ring ring-c" cx="240" cy="105" r="140" /><circle className="wire-core" cx="240" cy="105" r="18" /><text className="wire-symbol" x="234" y="112">{current > 0 ? '⊙' : current < 0 ? '⊗' : '0'}</text>{current !== 0 && <text className={current > 0 ? 'field-sense' : 'field-sense reverse'} x="300" y="62">{current > 0 ? '↺' : '↻'}</text>}<line className="radius-guide" x1="240" y1="105" x2={240 + sampleRadius} y2="105" /><circle className="sample-point" cx={240 + sampleRadius} cy="105" r="5" /><text x="260" y="28">regra da mão direita</text><text x={245 + sampleRadius / 2} y="98">r</text></svg><ResultStrip label="Campo à distância r" value={`${(wireField * 1e6).toFixed(2)} μT`} formula="B=\\mu_0I/(2\\pi r)" secondary={current === 0 ? 'I=0: não existe campo magnético criado pelo fio' : `sentido ${current > 0 ? 'anti-horário' : 'horário'} · as circunferências não mudam; muda o ponto de medição`} /><Control label="Corrente I" value={current} min={-15} max={15} step={0.5} onChange={setCurrent} unit="A" /><Control label="Distância r" value={wireDistance} min={0.005} max={0.2} step={0.005} onChange={setWireDistance} unit="m" /></>}
    {mode === 'loop' && <><div className="source-kind"><span>Sentido da corrente</span><div><button className={loopDirection > 0 ? 'active' : ''} onClick={() => setLoopDirection(1)}>anti-horário</button><button className={loopDirection < 0 ? 'active' : ''} onClick={() => setLoopDirection(-1)}>horário</button></div></div><svg className="field-source-stage" viewBox="0 0 480 210"><ellipse className="loop-wire" cx="240" cy="105" rx={70 + loopRadius * 300} ry="45" /><ellipse className="loop-wire faint" cx="240" cy="105" rx={62 + loopRadius * 300} ry="38" /><path className="axis-field" d="M80 105H400" /><path className={loopDirection > 0 ? 'field-arrow' : 'field-arrow reverse'} d={loopDirection > 0 ? 'M195 52c35-22 75-18 98 4' : 'M293 56c-35-22-75-18-98-4'} /><text x="92" y="92">B no centro {loopDirection > 0 ? '⊙' : '⊗'}</text><text x="210" y="112">{turns} espiras</text></svg><ResultStrip label="Campo no centro" value={`${(loopField * 1e6).toFixed(2)} μT`} formula="B=\\mu_0NI/(2R)" secondary={`B ${loopDirection > 0 ? 'sai do plano' : 'entra no plano'} pela regra da mão direita`} /><Control label="Corrente I" value={loopCurrent} min={1} max={15} step={1} onChange={setLoopCurrent} unit="A" /><Control label="Número de espiras" value={turns} min={1} max={80} step={1} onChange={setTurns} unit="" /><Control label="Raio R" value={loopRadius} min={0.04} max={0.25} step={0.01} onChange={setLoopRadius} unit="m" /></>}
  </>
}

function SolenoidParticleScenario({ params }: { params: Record<string, string> }) {
  const [turns, setTurns] = useState(numberParam(params, 'N', 840)); const [length, setLength] = useState(numberParam(params, 'L', .6)); const [current, setCurrent] = useState(numberParam(params, 'I', 22))
  const [chargeInE, setChargeInE] = useState(numberParam(params, 'qE', 2.5)); const [speed, setSpeed] = useState(numberParam(params, 'v', 6450)); const [massInProtons, setMassInProtons] = useState(numberParam(params, 'mP', 2)); const [theta, setTheta] = useState(numberParam(params, 'theta', 25))
  const protonMass = 1.673e-27
  const result = solenoidParticleDynamics(turns, length, current, chargeInE * 1.60217653e-19, speed, massInProtons * protonMass, theta)
  const thetaRad = theta * Math.PI / 180
  const magneticEnd = { x: 240 - Math.cos(thetaRad) * 78, y: 108 - Math.sin(thetaRad) * 78 }
  const resultAngle = Math.atan2(result.resultant.y, result.resultant.x)
  const resultantEnd = { x: 240 + Math.cos(resultAngle) * 92, y: 108 - Math.sin(resultAngle) * 92 }
  return <>
    <svg className="solenoid-particle-stage" viewBox="0 0 480 245" role="img" aria-label="Partícula negativa no interior de um solenoide vista de perfil">
      <defs><pattern id="solenoid-dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="2" /></pattern></defs>
      <circle className="solenoid-shell" cx="240" cy="116" r="100" /><circle className="solenoid-inner" cx="240" cy="116" r="89" /><circle className="solenoid-field" cx="240" cy="116" r="82" fill="url(#solenoid-dots)" />
      <text className="solenoid-b-label" x="307" y="185">B ⊙</text><circle className="solenoid-particle" cx="240" cy="108" r="8" /><text x="248" y="103">q = −{chargeInE.toFixed(1)}e</text>
      <line className="angle-reference" x1="240" y1="108" x2="145" y2="108" /><path className="theta-arc" d={`M205 108 A35 35 0 0 1 ${240 - Math.cos(thetaRad) * 35} ${108 - Math.sin(thetaRad) * 35}`} /><text className="theta-label" x="194" y="94">θ={theta.toFixed(0)}°</text>
      <line className="magnetic-vector" x1="240" y1="108" x2={magneticEnd.x} y2={magneticEnd.y} /><circle className="magnetic-tip" cx={magneticEnd.x} cy={magneticEnd.y} r="4" /><text className="magnetic-caption" x={magneticEnd.x + 5} y={magneticEnd.y + 17}>Fₘ</text>
      <line className="gravity-vector" x1="240" y1="108" x2="240" y2="158" /><circle className="gravity-tip" cx="240" cy="158" r="4" /><text className="gravity-caption" x="248" y="157">P=mg</text>
      <line className="resultant-vector" x1="240" y1="108" x2={resultantEnd.x} y2={resultantEnd.y} /><circle className="resultant-tip" cx={resultantEnd.x} cy={resultantEnd.y} r="4" /><text className="resultant-caption" x={resultantEnd.x - 24} y={resultantEnd.y - 10}>F⃗R</text>
      <path className="trajectory-hint" d="M240 108Q205 52 170 71" /><text x="24" y="225">vetores desenhados para leitura; comprimentos não estão à mesma escala</text>
    </svg>
    <ResultStrip label="Resultante das forças" value={`${result.resultant.magnitude.toExponential(3)} N`} formula="\vec F_R=\vec F_m+m\vec g" secondary={`B=${(result.magneticField * 1000).toFixed(3)} mT · Fm/Fg=${(result.magneticForce / result.weight).toExponential(2)}`} />
    <div className="exam-metrics four"><span><small>Campo do solenoide</small><strong>{(result.magneticField * 1000).toFixed(3)} mT</strong></span><span><small>Força magnética</small><strong>{result.magneticForce.toExponential(3)} N</strong></span><span><small>Aceleração</small><strong>{result.acceleration.toExponential(3)} m/s²</strong></span><span><small>Raio instantâneo</small><strong>{(result.instantaneousRadius * 1000).toFixed(3)} mm</strong></span></div>
    <Control label="Espiras N" value={turns} min={100} max={1400} step={20} onChange={setTurns} unit="" /><Control label="Comprimento do solenoide" value={length} min={0.2} max={1.2} step={0.05} onChange={setLength} unit="m" /><Control label="Corrente I" value={current} min={2} max={35} step={1} onChange={setCurrent} unit="A" /><Control label="Módulo da carga" value={chargeInE} min={0.5} max={6} step={0.5} onChange={setChargeInE} unit="e" /><Control label="Velocidade" value={speed} min={1000} max={15000} step={250} onChange={setSpeed} unit="m/s" /><Control label="Massa" value={massInProtons} min={0.5} max={8} step={0.5} onChange={setMassInProtons} unit="mₚ" /><Control label="Ângulo θ" value={theta} min={0} max={90} step={1} onChange={setTheta} unit="°" />
    <p className="balance-note"><strong>Escala física:</strong> com os valores do enunciado, Fm é cerca de três mil milhões de vezes maior do que o peso. A gravidade entra na soma, mas quase não altera o módulo nem o raio.</p>
  </>
}

function InductionSimulator({ initialMode }: { initialMode: string | null }) {
  const [mode, setMode] = useState<'faraday' | 'motional' | 'solenoid'>(initialMode === 'motional' || initialMode === 'solenoid' ? initialMode : 'faraday')
  const [turns, setTurns] = useState(10); const [radius, setRadius] = useState(0.05); const [rate, setRate] = useState(2)
  const [field, setField] = useState(0.8); const [rodLength, setRodLength] = useState(0.4); const [speed, setSpeed] = useState(3)
  const [current, setCurrent] = useState(4); const [solenoidLength, setSolenoidLength] = useState(0.5)
  const emf = turns * Math.PI * radius ** 2 * rate
  const motionalEmf = field * rodLength * speed
  const solenoidField = 4 * Math.PI * 1e-7 * turns * current / solenoidLength
  const rodHalfHeight = 22 + rodLength * 58
  const visibleTurns = Math.max(4, Math.min(18, Math.round(turns / 15)))
  const solenoidVisualWidth = 190 + solenoidLength * 125; const solenoidStart = 240 - solenoidVisualWidth / 2
  const solenoidPoints = Array.from({ length: 121 }, (_, index) => `${solenoidStart + index * solenoidVisualWidth / 120},${105 - Math.sin(index / 120 * Math.PI * 2 * visibleTurns) * 45}`).join(' ')
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'faraday', 'Fluxo variável'], ['motional', 'Barra em movimento'], ['solenoid', 'Solenoide']]} />
    {mode === 'faraday' && <><div className="coil-stage"><div className="coil" style={{ boxShadow: `0 0 0 ${Math.min(28,turns)}px color-mix(in srgb, var(--blue) 8%, transparent)` }}><Magnet size={45} /><span>{turns} espiras</span></div><div className="flux-lines">↓ ↓ ↓<small>dB/dt</small></div></div><ResultStrip label="FEM induzida" value={`${emf.toFixed(3)} V`} formula="|\\mathcal E|=NA|dB/dt|" secondary={`A=${(Math.PI*radius**2).toFixed(4)} m² · Lenz fixa o sentido`} /><Control label="Espiras N" value={turns} min={1} max={40} step={1} onChange={setTurns} unit="" /><Control label="Raio" value={radius} min={0.02} max={0.12} step={0.01} onChange={setRadius} unit="m" /><Control label="Variação do campo" value={rate} min={0.2} max={8} step={0.2} onChange={setRate} unit="T/s" /></>}
    {mode === 'motional' && <><svg className="induction-stage" viewBox="0 0 480 210"><defs><pattern id="motion-crosses" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M8 8l8 8m0-8l-8 8" /></pattern></defs><rect x="35" y="12" width="410" height="186" fill="url(#motion-crosses)" /><line className="moving-rod" x1="220" y1={105 - rodHalfHeight} x2="220" y2={105 + rodHalfHeight} /><path className="motion-arrow" d="M170 105H285" /><text x="292" y="108">v →</text><text x="50" y="35">B ⊗</text><text x="205" y={97 - rodHalfHeight}>+</text><text x="205" y={119 + rodHalfHeight}>−</text><text x="230" y="52">ℓ altera o tamanho</text></svg><ResultStrip label="FEM de movimento" value={`${motionalEmf.toFixed(2)} V`} formula="|\\mathcal E|=B\\ell v" secondary="q(v×B) separa as cargas; aumentar ℓ alonga a barra sem mudar a posição" /><Control label="Campo B" value={field} min={0.1} max={2} step={0.1} onChange={setField} unit="T" /><Control label="Comprimento da barra" value={rodLength} min={0.1} max={1} step={0.05} onChange={setRodLength} unit="m" /><Control label="Velocidade" value={speed} min={0.5} max={10} step={0.5} onChange={setSpeed} unit="m/s" /></>}
    {mode === 'solenoid' && <><svg className="solenoid-stage" viewBox="0 0 480 210"><polyline className="solenoid-wire" points={solenoidPoints} /><path className="axis-field" d="M35 105H445" /><text x="180" y="25">N={turns} · L={solenoidLength.toFixed(2)} m</text><text x="190" y="112">B → interior</text><text x="145" y="184">densidade visual acompanha N/L</text></svg><ResultStrip label="Campo no interior" value={`${(solenoidField*1e3).toFixed(3)} mT`} formula="B=\\mu_0(N/L)I" secondary="aproximação de solenoide longo; o desenho mostra a densidade relativa de espiras" /><Control label="Espiras N" value={turns} min={10} max={300} step={5} onChange={setTurns} unit="" /><Control label="Comprimento L" value={solenoidLength} min={0.1} max={1.5} step={0.05} onChange={setSolenoidLength} unit="m" /><Control label="Corrente I" value={current} min={0.5} max={12} step={0.5} onChange={setCurrent} unit="A" /></>}
  </>
}

function OpticsSimulator({ initialMode }: { initialMode: string | null }) {
  const [mode, setMode] = useState<'slab' | 'snell' | 'critical'>(initialMode === 'snell' || initialMode === 'critical' ? initialMode : 'slab')
  const [angle, setAngle] = useState(40); const [n1, setN1] = useState(1); const [n2, setN2] = useState(1.5); const [slabThickness, setSlabThickness] = useState(1)
  const incidentRad = angle * Math.PI / 180
  const refracted = refractionAngle(angle, n1, n2); const tir = refracted === null
  const x1 = 240 - 130 * Math.sin(incidentRad); const y1 = 100 - 130 * Math.cos(incidentRad); const x2 = refracted === null ? 370 : 240 + 130 * Math.sin(refracted * Math.PI / 180); const y2 = refracted === null ? 70 : 100 + 130 * Math.cos(refracted * Math.PI / 180)
  const criticalAngle = n1 > n2 ? Math.asin(n2 / n1) * 180 / Math.PI : null
  const slabAngle = Math.asin(Math.sin(incidentRad) / n2)
  const lateralShift = slabThickness * Math.sin(incidentRad - slabAngle) / Math.cos(slabAngle)
  const slabDepth = 70 + slabThickness * 35
  const slabExitX = 190 + slabDepth * Math.tan(slabAngle)
  const incidentLeg = Math.min(65, 165 / Math.max(Math.tan(incidentRad), .01)); const exitLeg = Math.max(0, Math.min(65, (460 - slabExitX) / Math.max(Math.tan(incidentRad), .01)))
  return <><ScenarioTabs value={mode} onChange={setMode} options={[[ 'slab', 'Faces paralelas'], ['snell', 'Lei de Snell'], ['critical', 'Ângulo crítico']]} />
    {mode === 'slab' && <><svg className="optics-stage slab-stage" viewBox="0 0 480 260"><rect x="0" y="80" width="480" height={slabDepth} /><line x1="0" y1="80" x2="480" y2="80" /><line x1="0" y1={80 + slabDepth} x2="480" y2={80 + slabDepth} /><line className="normal" x1="190" y1="18" x2="190" y2={95 + slabDepth} /><line className="normal" x1={slabExitX} y1={65 + slabDepth} x2={slabExitX} y2="250" /><path d={`M${190 - incidentLeg * Math.tan(incidentRad)} ${80 - incidentLeg} L190 80 L${slabExitX} ${80 + slabDepth} L${slabExitX + exitLeg * Math.tan(incidentRad)} ${80 + slabDepth + exitLeg}`} /><path className="ghost-ray" d={`M190 80L${190 + slabDepth * Math.tan(incidentRad)} ${80 + slabDepth}`} /><text x="18" y="35">ar · θ₁={angle}°</text><text x="18" y="112">lâmina n={n2.toFixed(2)}</text><text x="325" y="242">raios emergentes paralelos</text></svg><ResultStrip label="Desvio lateral" value={`${lateralShift.toFixed(3)} m`} formula="d=t\\sin(\\theta_1-\\theta_2)/\\cos\\theta_2" secondary={`θ₂=${(slabAngle*180/Math.PI).toFixed(1)}° · ângulo de saída = ${angle}°`} /><Control label="Ângulo com a normal" value={angle} min={5} max={75} step={1} onChange={setAngle} unit="°" /><Control label="Índice da lâmina" value={n2} min={1.1} max={1.8} step={0.05} onChange={setN2} unit="" /><Control label="Espessura t" value={slabThickness} min={0.2} max={2} step={0.1} onChange={setSlabThickness} unit="m" /></>}
    {mode !== 'slab' && <><svg className="optics-stage" viewBox="0 0 480 240"><rect y="100" width="480" height="140" /><line x1="0" y1="100" x2="480" y2="100" /><line className="normal" x1="240" y1="10" x2="240" y2="220" /><path d={`M${x1} ${y1} L240 100 L${x2} ${y2}`} /><circle cx="240" cy="100" r="5" /><text x="20" y="35">n₁={n1.toFixed(2)}</text><text x="20" y="135">n₂={n2.toFixed(2)}</text>{criticalAngle && <text x="320" y="35">θc={criticalAngle.toFixed(1)}°</text>}</svg><ResultStrip label={tir ? 'Reflexão total interna' : mode === 'critical' ? 'Comparação com θ crítico' : 'Ângulo refratado'} value={tir ? 'θ₁ > θc' : `${refracted!.toFixed(1)}°`} formula="n_1\\sin\\theta_1=n_2\\sin\\theta_2" secondary={criticalAngle ? `θc=${criticalAngle.toFixed(1)}° · ${angle > criticalAngle ? 'há RTI' : 'há transmissão'}` : `v₂=${(3e8/n2).toExponential(2)} m/s`} /><Control label="Ângulo medido à normal" value={angle} min={0} max={85} step={1} onChange={setAngle} unit="°" /><Control label="Índice n₁" value={n1} min={1} max={1.8} step={0.05} onChange={setN1} unit="" /><Control label="Índice n₂" value={n2} min={1} max={1.8} step={0.05} onChange={setN2} unit="" /></>}
  </>
}

function EMWaveSimulator({ initialMode, params }: { initialMode: string | null; params: Record<string, string> }) {
  const [mode, setMode] = useState<'three' | 'malus' | 'single' | 'wave'>(initialMode === 'malus' || initialMode === 'single' || initialMode === 'wave' ? initialMode : 'three')
  const [frequency, setFrequency] = useState(3); const [amplitude, setAmplitude] = useState(2); const wavelength = 300 / frequency
  const points = useMemo(() => Array.from({ length: 81 }, (_, index) => `${index * 5},${100 - Math.sin(index / 80 * Math.PI * frequency) * amplitude * 25}`).join(' '), [frequency, amplitude])
  return <><div className="polarizer-mode-tabs" aria-label="Cenário de ondas e polarização">{([['three', '3 polarizadores'], ['malus', 'Lei de Malus'], ['single', '1.º polarizador'], ['wave', 'Onda EM']] as const).map(([id, label]) => <button className={mode === id ? 'active' : ''} onClick={() => setMode(id)} key={id}>{label}</button>)}</div>{mode === 'wave' ? <><svg className="wave-stage" viewBox="0 0 420 200"><path d="M10 100H410" /><polyline points={points} /><text x="15" y="25">E</text><text x="392" y="92">x</text></svg><ResultStrip label="Comprimento de onda" value={`${wavelength.toFixed(1)} m`} formula="c=\\lambda f" secondary={`E₀=${amplitude.toFixed(1)} V/m · B₀=${(amplitude/3e8*1e9).toFixed(2)} nT`} /><Control label="Frequência" value={frequency} min={0.5} max={12} step={0.5} onChange={setFrequency} unit="MHz" /><Control label="Amplitude E₀" value={amplitude} min={0.5} max={4} step={0.1} onChange={setAmplitude} unit="V/m" /></> : <PolarizerSimulator mode={mode} initialAngle2={numberParam(params, 'angle2', 45)} />}</>
}

function PolarizerSimulator({ mode, initialAngle2 }: { mode: 'three' | 'malus' | 'single'; initialAngle2: number }) {
  const [intensity, setIntensity] = useState(80)
  const [polarizedInput, setPolarizedInput] = useState(false)
  const [sourceAngle, setSourceAngle] = useState(0)
  const [angle1, setAngle1] = useState(0)
  const [angle2, setAngle2] = useState(initialAngle2)
  const [angle3, setAngle3] = useState(90)
  const axes = mode === 'single' ? [angle1] : mode === 'malus' ? [angle1, angle2] : [angle1, angle2, angle3]
  const values = polarizedInput
    ? axes.reduce<number[]>((items, axis, index) => [...items, malusIntensity(items.at(-1)!, axis - (index === 0 ? sourceAngle : axes[index - 1]))], [intensity])
    : unpolarizedThroughPolarizers(intensity, axes)
  const finalIntensity = values.at(-1)!
  const transmission = intensity === 0 ? 0 : finalIntensity / intensity * 100
  const fieldAmplitude = Math.sqrt(2 * finalIntensity / (3e8 * 8.854e-12))
  const formula = polarizedInput
    ? 'I_n=I_0\\prod\\cos^2(\\Delta\\theta)'
    : axes.length === 1 ? 'I_1=I_0/2' : 'I_n=\\frac{I_0}{2}\\prod_{k=2}^{n}\\cos^2(\\theta_k-\\theta_{k-1})'

  return <>
    <div className="source-kind"><span>Feixe incidente</span><div><button className={!polarizedInput ? 'active' : ''} onClick={() => setPolarizedInput(false)}>Não polarizado</button><button className={polarizedInput ? 'active' : ''} onClick={() => setPolarizedInput(true)}>Polarizado</button></div></div>
    <div className="polarizer-stage" role="img" aria-label={`${axes.length} polarizadores; intensidade final ${finalIntensity.toFixed(2)} watts por metro quadrado`}>
      <div className="light-source"><Radio size={20} /><span>{polarizedInput ? `θ₀ ${sourceAngle}°` : 'não pol.'}</span></div>
      {axes.map((axis, index) => <div className="filter-step" key={`${index}-${axis}`}><div className="light-beam"><i style={{ opacity: Math.max(.08, values[index] / intensity) }} /></div><div className="polarizer-disc"><i style={{ transform: `rotate(${axis}deg)` }} /><b>P{index + 1}</b><span>{axis}°</span></div></div>)}
      <div className="light-beam output-beam"><i style={{ opacity: Math.max(.05, finalIntensity / intensity) }} /></div><div className="detector"><strong>I{axes.length}</strong><span>{transmission.toFixed(1)}%</span></div>
    </div>
    <div className="intensity-steps">{values.map((value, index) => <span key={index}><small>I{index}</small><strong>{value.toFixed(2)}</strong></span>)}</div>
    <ResultStrip label={`Intensidade após P${axes.length}`} value={`${finalIntensity.toFixed(2)} W/m²`} formula={formula} secondary={`Transmissão ${transmission.toFixed(1)}% · E₀ final=${fieldAmplitude.toFixed(1)} V/m`} />
    <Control label="Intensidade inicial I₀" value={intensity} min={10} max={200} step={5} onChange={setIntensity} unit="W/m²" />
    {polarizedInput && <Control label="Eixo inicial θ₀" value={sourceAngle} min={0} max={180} step={5} onChange={setSourceAngle} unit="°" />}
    <Control label="Eixo de P₁" value={angle1} min={0} max={180} step={5} onChange={setAngle1} unit="°" />
    {axes.length >= 2 && <Control label="Eixo de P₂" value={angle2} min={0} max={180} step={5} onChange={setAngle2} unit="°" />}
    {axes.length === 3 && <Control label="Eixo de P₃" value={angle3} min={0} max={180} step={5} onChange={setAngle3} unit="°" />}
    {mode === 'three' && <p className="polarizer-insight"><strong>Repara:</strong> com P₁ e P₃ cruzados sairia zero sem P₂. A orientação intermédia pode voltar a deixar passar luz.</p>}
  </>
}
