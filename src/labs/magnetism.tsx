/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { magneticOrbitRadius, solenoidParticleDynamics } from '../domain/exercises/calculators'
import type { FamilyId } from '../domain/types'
import { Cyclotron } from './magnetism/Cyclotron'
import { Generator } from './magnetism/Generator'
import { Faraday, Motional, Solenoid } from './magnetism/Induction'
import { Orbit } from './magnetism/Orbit'
import { Selector } from './magnetism/Selector'
import { Transformer } from './magnetism/Transformer'
import { Vectors } from './magnetism/Vectors'
import { Wire } from './magnetism/Wire'
import { WireField } from './magnetism/WireField'
import { Control, ResultStrip, numberParam, type LabScenario } from './ui'
import './magnetism.css'

function MagneticParticleSimulator({ mode, params }: { mode: 'particle' | 'loop' | 'solenoid-particle'; params: Record<string, string> }) {
  const [velocity, setVelocity] = useState(numberParam(params, 'v', 45000) / 1000); const [field, setField] = useState(numberParam(params, 'B', 4)); const [mass, setMass] = useState(numberParam(params, 'mass', 4))
  const [chargeSign, setChargeSign] = useState(1); const [fieldDirection, setFieldDirection] = useState(-1)
  const [turns, setTurns] = useState(20); const [loopRadius, setLoopRadius] = useState(0.12); const [loopCurrent, setLoopCurrent] = useState(5); const [loopDirection, setLoopDirection] = useState(1)
  const radius = magneticOrbitRadius(mass * 1e-25, velocity * 1000, 1.602e-19, field * 1e-3)
  const normalized = Math.max(0, Math.min(1, (Math.log10(radius) + .3) / 2.8))
  const arcRadius = 35 + normalized * 100
  const direction = chargeSign * fieldDirection
  const arcEndX = 240 + direction * arcRadius
  const arcEndY = 188 - arcRadius
  const loopField = 4 * Math.PI * 1e-7 * turns * loopCurrent / (2 * loopRadius)

  if (mode === 'solenoid-particle') return <><SolenoidParticleScenario params={params} /></>
  return <>
    {mode === 'particle' && <><div className="source-kind"><span>Orientações</span><div><button className={chargeSign > 0 ? 'active' : ''} onClick={() => setChargeSign(1)}>q positiva</button><button className={chargeSign < 0 ? 'active' : ''} onClick={() => setChargeSign(-1)}>q negativa</button><button className={fieldDirection < 0 ? 'active' : ''} onClick={() => setFieldDirection(-1)}>B ⊗</button><button className={fieldDirection > 0 ? 'active' : ''} onClick={() => setFieldDirection(1)}>B ⊙</button></div></div><svg className="orbit-stage" viewBox="0 0 480 210"><defs><pattern id="crosses" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M8 8l8 8m0-8l-8 8" /></pattern></defs><rect x="35" y="18" width="410" height="170" fill="url(#crosses)" /><path d={`M240 188 A${arcRadius} ${arcRadius} 0 0 ${direction > 0 ? 1 : 0} ${arcEndX} ${arcEndY}`} /><circle cx="240" cy="188" r="6" /><text x="250" y="178">v ↑</text><text x="48" y="40">B {fieldDirection < 0 ? '⊗' : '⊙'}</text><text x={arcEndX + (direction > 0 ? 5 : -24)} y={arcEndY - 5}>r visual</text></svg><ResultStrip label="Raio da trajetória" value={`${radius.toFixed(2)} m`} formula="r=mv/(|q|B)" secondary={`curvatura para ${direction > 0 ? 'a direita' : 'a esquerda'} · escala visual logarítmica`} /><Control label="Velocidade" value={velocity} min={0.5} max={90} step={0.25} onChange={setVelocity} unit="km/s" /><Control label="Campo B" value={field} min={0.1} max={12} step={0.05} onChange={setField} unit="mT" /><Control label="Massa" value={mass} min={0.01} max={10} step={0.01} onChange={setMass} unit="×10⁻²⁵ kg" /></>}
    {mode === 'loop' && <><div className="source-kind"><span>Sentido da corrente</span><div><button className={loopDirection > 0 ? 'active' : ''} onClick={() => setLoopDirection(1)}>anti-horário</button><button className={loopDirection < 0 ? 'active' : ''} onClick={() => setLoopDirection(-1)}>horário</button></div></div><svg className="field-source-stage" viewBox="0 0 480 210"><ellipse className="loop-wire" cx="240" cy="105" rx={70 + loopRadius * 300} ry="45" /><ellipse className="loop-wire faint" cx="240" cy="105" rx={62 + loopRadius * 300} ry="38" /><path className="axis-field" d="M80 105H400" /><path className={loopDirection > 0 ? 'field-arrow' : 'field-arrow reverse'} d={loopDirection > 0 ? 'M195 52c35-22 75-18 98 4' : 'M293 56c-35-22-75-18-98-4'} /><text x="92" y="92">B no centro {loopDirection > 0 ? '⊙' : '⊗'}</text><text x="210" y="112">{turns} espiras</text></svg><ResultStrip label="Campo no centro" value={`${(loopField * 1e6).toFixed(2)} μT`} formula="B=\mu_0NI/(2R)" secondary={`B ${loopDirection > 0 ? 'sai do plano' : 'entra no plano'} pela regra da mão direita`} /><Control label="Corrente I" value={loopCurrent} min={1} max={15} step={1} onChange={setLoopCurrent} unit="A" /><Control label="Número de espiras" value={turns} min={1} max={80} step={1} onChange={setTurns} unit="" /><Control label="Raio R" value={loopRadius} min={0.04} max={0.25} step={0.01} onChange={setLoopRadius} unit="m" /></>}
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

export const magnetismLabs: Partial<Record<FamilyId, LabScenario[]>> = {
  magnetic_particles: [
    { id: 'particle', label: 'Partícula em B', component: ({ params }) => <MagneticParticleSimulator mode="particle" params={params} /> },
    { id: 'orbit', label: 'Espectrómetro / arco', component: Orbit },
    { id: 'vectors', label: 'Produto vetorial v × B', component: Vectors },
    { id: 'selector', label: 'Seletor de velocidades', component: Selector },
    { id: 'cyclotron', label: 'Ciclotrão', component: Cyclotron },
    { id: 'wire', label: 'Campo de um fio', component: Wire },
    { id: 'wire-field', label: 'Fio num campo externo', component: WireField },
    { id: 'loop', label: 'Campo de uma espira', component: ({ params }) => <MagneticParticleSimulator mode="loop" params={params} /> },
    { id: 'solenoid-particle', label: 'Partícula no solenoide', component: ({ params }) => <MagneticParticleSimulator mode="solenoid-particle" params={params} /> },
  ],
  induction_sources: [
    { id: 'faraday', label: 'Fluxo variável', component: Faraday },
    { id: 'motional', label: 'Barra em movimento', component: Motional },
    { id: 'solenoid', label: 'Solenoide', component: Solenoid },
    { id: 'generator', label: 'Espira a rodar', component: Generator },
    { id: 'transformer', label: 'Transformador ideal', component: Transformer },
  ],
}
