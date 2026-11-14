import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { LIGHT_SPEED, claddingIndexForAcceptance, fiber } from './physics'
import { AngleArc, ArrowHead, Ray, clamp, degrees, fmt, formatLength, polar, positive, px, type Point } from './svg'

const X0 = 120
const X1 = 476
const AXIS_Y = 118
const CLADDING = 16
const RAD = Math.PI / 180

/** Vértices do ziguezague dentro do núcleo, com os ângulos verdadeiros (o comprimento não está à escala). */
function zigzag(axisAngle: number, halfCore: number) {
  const slope = Math.tan(axisAngle * RAD)
  const points: Point[] = [[X0, AXIS_Y]]
  let x = slope > 1e-4 ? X0 + halfCore / slope : Number.POSITIVE_INFINITY
  let top = true
  while (x < X1 && points.length < 80) {
    points.push([x, top ? AXIS_Y - halfCore : AXIS_Y + halfCore])
    x += 2 * halfCore / slope
    top = !top
  }
  const [lastX, lastY] = points[points.length - 1]
  points.push([X1, lastY + (top ? -1 : 1) * (X1 - lastX) * slope])
  return points
}

export function Fiber({ params }: LabProps) {
  const [coreIndex, setCoreIndex] = useState(clamp(numberParam(params, 'nn', 1.475), 1, 4))
  const [claddingIndex, setCladdingIndex] = useState(clamp(numberParam(params, 'nb', 1.46), 1, 4))
  const [radius, setRadius] = useState(positive(numberParam(params, 'a', 25), 25))
  const [length, setLength] = useState(positive(numberParam(params, 'L', 1000), 1000))
  const [entrance, setEntrance] = useState(() => {
    const limit = fiber(clamp(numberParam(params, 'nn', 1.475), 1, 4), clamp(numberParam(params, 'nb', 1.46), 1, 4), 1, 1, 0).acceptanceAngle
    return clamp(numberParam(params, 'phi', limit), 0, 89)
  })
  const [target, setTarget] = useState(16)
  const result = fiber(coreIndex, claddingIndex, radius * 1e-6, length, entrance)
  const inverseIndex = claddingIndexForAcceptance(coreIndex, target)

  const halfCore = clamp(9 + radius * 0.24, 10, 24)
  const top = AXIS_Y - halfCore
  const bottom = AXIS_Y + halfCore
  const points = zigzag(result.axisAngle, halfCore)
  const firstHit = points.length > 2 ? points[1] : null
  // O arco do ângulo com o eixo não pode passar do primeiro ponto de reflexão.
  const axisArc = firstHit ? Math.min(44, 0.7 * Math.hypot(firstHit[0] - X0, firstHit[1] - AXIS_Y)) : 44
  const coneUpper = polar(X0, AXIS_Y, 100, 180 + result.acceptanceAngle)
  const coneLower = polar(X0, AXIS_Y, 100, 180 - result.acceptanceAngle)
  const incomingStart = polar(X0, AXIS_Y, 104, 180 - entrance)
  const fade = (bounce: number) => result.guided ? 1 : Math.max(0.1, 0.6 ** bounce)
  const visibleSegments = result.guided ? points.length - 1 : Math.min(points.length - 1, 6)
  const leak = result.leakAngle
  const leakRay = (hit: Point): Point => {
    const up = hit[1] < AXIS_Y ? -1 : 1
    const reach = Math.min(CLADDING / Math.max(Math.cos((leak ?? 0) * RAD), 1e-3), 40 / Math.max(Math.sin((leak ?? 0) * RAD), 1e-3))
    return [hit[0] + reach * Math.sin((leak ?? 0) * RAD), hit[1] + up * reach * Math.cos((leak ?? 0) * RAD)]
  }
  const status = !result.guided ? 'θ < θc: parte da luz passa para a bainha' : entrance === 0 ? 'raio axial: não toca nas paredes' : 'guiado por reflexão total (θ ≥ θc)'

  return <>
    <svg className="lab-waves-stage lab-waves-fiber" viewBox="0 0 480 240" role="img" aria-label={`Corte longitudinal de uma fibra ótica com núcleo de índice ${fmt(coreIndex, 3)} e bainha de índice ${fmt(claddingIndex, 3)}; raio a entrar a ${degrees(entrance)} do eixo, ${result.guided ? 'guiado por reflexão total interna' : 'a perder luz para a bainha'}; ângulo máximo de aceitação ${degrees(result.acceptanceAngle)}`}>
      <defs><ArrowHead id="waves-fiber-ray" tone="ray" /></defs>
      <rect className="lab-waves-cladding" x={X0} y={top - CLADDING} width={X1 - X0} height={CLADDING} />
      <rect className="lab-waves-cladding" x={X0} y={bottom} width={X1 - X0} height={CLADDING} />
      <rect className="lab-waves-core" x={X0} y={top} width={X1 - X0} height={px(2 * halfCore)} />
      <line className="lab-waves-axis" x1="14" y1={AXIS_Y} x2={X1} y2={AXIS_Y} />
      {result.acceptanceAngle > 0 && <path className="lab-waves-acceptance" d={`M${X0} ${AXIS_Y}L${px(coneUpper[0])} ${px(coneUpper[1])}L${px(coneLower[0])} ${px(coneLower[1])}Z`} />}
      <Ray className="incident" from={incomingStart} to={[X0, AXIS_Y]} marker="waves-fiber-ray" />
      <g className={`lab-waves-zigzag ${result.guided ? 'guided' : 'leaking'}`}>
        {points.slice(0, visibleSegments).map((point, index) => { const next = points[index + 1]; return <Ray key={index} from={point} to={next} opacity={px(fade(index))} marker={Math.hypot(next[0] - point[0], next[1] - point[1]) > 34 ? 'waves-fiber-ray' : undefined} /> })}
        {leak !== null && points.slice(1, visibleSegments).map((hit, index) => { const end = leakRay(hit); return <line key={index} className="lab-waves-ray leak" opacity={px(Math.max(0.2, fade(index)))} x1={px(hit[0])} y1={px(hit[1])} x2={px(end[0])} y2={px(end[1])} /> })}
      </g>
      {firstHit && <>
        <line className="lab-waves-normal" x1={px(firstHit[0])} y1={top - CLADDING - 8} x2={px(firstHit[0])} y2={px(top + Math.min(2 * halfCore, 26))} />
        <AngleArc cx={firstHit[0]} cy={top} radius={12} from={90} to={180 - result.axisAngle} label={halfCore >= 13 && result.wallAngle >= 30 ? 'θ' : undefined} />
      </>}
      {axisArc >= 14 && <AngleArc cx={X0} cy={AXIS_Y} radius={px(axisArc)} from={0} to={-result.axisAngle} />}
      <AngleArc cx={X0} cy={AXIS_Y} radius={40} from={180} to={180 - entrance} label="φ" />
      <text className="lab-waves-strong" x="10" y="16">{result.criticalAngle === null ? 'sem guiagem: a bainha não é menos refringente' : `cone de aceitação: φmax = ${degrees(result.acceptanceAngle)}`}</text>
      <rect className="lab-waves-core swatch" x="300" y="7" width="10" height="10" /><text x="314" y="16">núcleo {fmt(coreIndex, 3)}</text>
      <rect className="lab-waves-cladding swatch" x="394" y="7" width="10" height="10" /><text x="408" y="16">bainha {fmt(claddingIndex, 3)}</text>
      <text x="10" y="232">ar (n = 1)</text>
      <text className="lab-waves-strong" x="472" y="212" textAnchor="end">{status}</text>
      <text x="472" y="228" textAnchor="end">no núcleo: {degrees(result.axisAngle)} com o eixo · θ = {degrees(result.wallAngle)} com a normal</text>
    </svg>
    <ResultStrip label="Ângulo máximo de aceitação φmax" value={degrees(result.acceptanceAngle)} formula="\\sin\\varphi_{max}=\\sqrt{n_n^2-n_b^2}" secondary={result.guided ? `φ = ${degrees(entrance)} ≤ φmax · raio guiado` : `φ = ${degrees(entrance)} > φmax · perde luz para a bainha`} />
    <Metrics items={[
      { label: 'Ângulo crítico núcleo/bainha', value: degrees(result.criticalAngle) },
      { label: 'Abertura numérica NA', value: fmt(result.numericalAperture, 3) },
      { label: 'Ângulo interno com o eixo', value: degrees(result.axisAngle) },
      { label: 'Incidência na parede (à normal)', value: degrees(result.wallAngle) },
    ]} />
    <Metrics items={[
      { label: 'Distância entre reflexões', value: Number.isFinite(result.bounceSpacing) ? formatLength(result.bounceSpacing) : 'sem reflexões' },
      { label: `Reflexões em ${formatLength(length)}`, value: sig(result.reflections) },
      { label: 'Propagação', value: result.guided ? 'reflexão total' : 'com fugas' },
    ]} />
    <div className="source-kind"><span>Raio limite</span><div><button type="button" className={Math.abs(entrance - result.acceptanceAngle) < 0.06 ? 'active' : ''} onClick={() => setEntrance(Math.min(89, result.acceptanceAngle))}>Ir para φmax</button></div></div>
    <Control label="Ângulo de entrada no ar φ" value={entrance} min={0} max={89} step={0.1} onChange={setEntrance} unit="°" />
    <Control label="Índice do núcleo nₙ" value={coreIndex} min={1.3} max={1.8} step={0.001} onChange={setCoreIndex} unit="" />
    <Control label="Índice da bainha n_b" value={claddingIndex} min={1} max={1.8} step={0.001} onChange={setCladdingIndex} unit="" />
    <Control label="Raio do núcleo a" value={radius} min={1} max={100} step={0.5} onChange={setRadius} unit="μm" />
    <NumberField label="Comprimento da fibra L" value={length} onChange={(value) => { if (value > 0) setLength(value) }} unit="m" hint="Ex.: 1000 (1 km)" />
    <p className="lab-waves-subhead">Problema inverso · que bainha dá o cone pedido?</p>
    <Metrics items={[
      { label: 'Abertura total do cone', value: degrees(2 * target) },
      { label: 'Índice da bainha', value: fmt(inverseIndex, 3) },
      { label: 'Velocidade nessa bainha', value: inverseIndex > 0 ? `${sig(LIGHT_SPEED / inverseIndex)} m/s` : '—' },
    ]} />
    <Control label="Semi-ângulo de aceitação pretendido φmax" value={target} min={1} max={60} step={0.5} onChange={setTarget} unit="°" />
    <LabNote title="Leitura:">os ângulos do desenho são os verdadeiros; o comprimento e o raio do núcleo não estão à escala. O raio só fica preso se bater na parede com θ ≥ θc = arcsin(n_b/nₙ), o que limita o ângulo de entrada a φmax (sin φmax = NA). Entre duas reflexões avança 2a·tan θ ao longo do eixo. No problema inverso, n_b = √(nₙ² − sin²φmax). Armadilha: θc mede-se à normal da parede, φ ao eixo da fibra. No ex. 15 os 32° são a abertura total do cone, por isso φmax = 16°.</LabNote>
  </>
}
