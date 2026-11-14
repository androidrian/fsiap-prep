import { useState } from 'react'
import { Formula } from '../../components/Formula'
import { Choice, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { directionWords, formatVec, texNumber } from './format'
import { lorentz, norm, parseVec3, type LorentzResult, type Vec3 } from './physics'
import { Arrow, ArrowHeads, type Tone } from './svg'

type ViewId = 'front' | 'iso' | 'side'

const views: Record<ViewId, { azimuth: number; elevation: number }> = {
  front: { azimuth: 20, elevation: 22 },
  iso: { azimuth: 45, elevation: 35.264 },
  side: { azimuth: 70, elevation: 22 },
}
const viewOptions = [['front', 'x para a frente'], ['iso', 'isométrica'], ['side', 'y para a frente']] as const
const axisLabels = ['x', 'y', 'z'] as const
const ORIGIN: readonly [number, number] = [240, 120]
const UNIT = 96
const MIN_FORCE_LENGTH = 0.3

interface DrawnVector {
  key: string
  tone: Tone
  label: string
  /** Ponta do vetor em unidades do desenho 3D (1 = comprimento de um eixo). */
  tip: Vec3
  thin?: boolean
  thick?: boolean
}

function withComponent(vector: Vec3, index: number, value: number): Vec3 {
  const next = [vector[0], vector[1], vector[2]]
  next[index] = value
  return [next[0], next[1], next[2]]
}

function direction(vector: Vec3, length: number): Vec3 {
  const size = norm(vector)
  return size > 0 ? [vector[0] / size * length, vector[1] / size * length, vector[2] / size * length] : [0, 0, 0]
}

type Point2 = [number, number]

/** Projeção ortográfica: câmara no azimute/elevação da vista, z para cima, sistema direto. */
function projector(view: ViewId): (point: Vec3) => Point2 {
  const phi = views[view].azimuth * Math.PI / 180
  const theta = views[view].elevation * Math.PI / 180
  const right: Vec3 = [-Math.sin(phi), Math.cos(phi), 0]
  const up: Vec3 = [-Math.sin(theta) * Math.cos(phi), -Math.sin(theta) * Math.sin(phi), Math.cos(theta)]
  return (point) => [
    ORIGIN[0] + UNIT * (point[0] * right[0] + point[1] * right[1] + point[2] * right[2]),
    ORIGIN[1] - UNIT * (point[0] * up[0] + point[1] * up[1] + point[2] * up[2]),
  ]
}

/** Vetores a desenhar: v, B e E com comprimento fixo; forças à mesma escala entre si, com mínimo visível. */
function drawnVectors(velocity: Vec3, magneticField: Vec3, electricField: Vec3, result: LorentzResult): DrawnVector[] {
  const hasElectric = norm(electricField) > 0
  const forceScale = Math.max(norm(result.magnetic), norm(result.electric), norm(result.total))
  const forceTip = (force: Vec3): Vec3 => {
    const size = norm(force)
    return forceScale > 0 && size > 0 ? direction(force, Math.max(MIN_FORCE_LENGTH, size / forceScale)) : [0, 0, 0]
  }
  const fields: DrawnVector[] = [
    { key: 'v', tone: 'v', label: 'v', tip: direction(velocity, 0.85) },
    { key: 'B', tone: 'b', label: 'B', tip: direction(magneticField, 0.75) },
  ]
  if (!hasElectric) return [...fields, { key: 'Fm', tone: 'f', label: 'F', tip: forceTip(result.magnetic) }]
  return [
    ...fields,
    { key: 'E', tone: 'e', label: 'E', tip: direction(electricField, 0.62) },
    { key: 'Fm', tone: 'f', label: 'Fₘ', tip: forceTip(result.magnetic), thin: true },
    { key: 'Fe', tone: 'f', label: 'Fₑ', tip: forceTip(result.electric), thin: true },
    { key: 'F', tone: 'ink', label: 'F', tip: forceTip(result.total), thick: true },
  ]
}

/** Vista inicial: a que deixa os vetores menos encurtados pela perspetiva. */
function clearestView(vectors: DrawnVector[]): ViewId {
  const score = (view: ViewId) => {
    const project = projector(view)
    return vectors.reduce((sum, vector) => {
      const [x, y] = project(vector.tip)
      return sum + Math.hypot(x - ORIGIN[0], y - ORIGIN[1])
    }, 0)
  }
  return (Object.keys(views) as ViewId[]).reduce((best, view) => (score(view) > score(best) + 1e-6 ? view : best), 'front' as ViewId)
}

function distanceToSegment(point: Point2, from: Point2, to: Point2): number {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared > 0 ? Math.max(0, Math.min(1, ((point[0] - from[0]) * dx + (point[1] - from[1]) * dy) / lengthSquared)) : 0
  return Math.hypot(point[0] - from[0] - t * dx, point[1] - from[1] - t * dy)
}

/** Deslocamentos candidatos da etiqueta: [ao longo do vetor, perpendicular], em px. */
const labelOffsets: Point2[] = [[14, 0], [3, 14], [3, -14], [12, 11], [12, -11], [24, 0], [4, 22], [4, -22], [20, 16], [20, -16]]

/**
 * Coloca cada etiqueta junto à ponta do seu vetor, no primeiro sítio livre: sem tapar outra etiqueta,
 * sem ficar em cima de outra seta e dentro do palco.
 */
function placeLabels(tips: Array<{ key: string; tip: Point2 }>, segments: Array<[Point2, Point2]>, taken: Point2[]): Record<string, Point2> {
  const placed = [...taken]
  const positions: Record<string, Point2> = {}
  for (const { key, tip } of tips) {
    const dx = tip[0] - ORIGIN[0]
    const dy = tip[1] - ORIGIN[1]
    const size = Math.hypot(dx, dy)
    const along: Point2 = size > 0 ? [dx / size, dy / size] : [0, -1]
    const across: Point2 = [-along[1], along[0]]
    let best: Point2 = tip
    let bestPenalty = Infinity
    for (const [a, b] of labelOffsets) {
      const candidate: Point2 = [tip[0] + along[0] * a + across[0] * b, tip[1] + along[1] * a + across[1] * b]
      const outside = candidate[0] < 14 || candidate[0] > 466 || candidate[1] < 12 || candidate[1] > 230
      // Penalizações: fora do palco, em cima de outra etiqueta, perto de uma seta e (pouco) longe da ponta.
      const penalty = (outside ? 1000 : 0)
        + placed.filter(([px, py]) => Math.abs(px - candidate[0]) < 26 && Math.abs(py - candidate[1]) < 14).length * 100
        + segments.reduce((sum, [from, to]) => sum + Math.max(0, 14 - distanceToSegment(candidate, from, to)), 0)
        + Math.hypot(a, b) * 0.15
      if (penalty < bestPenalty) {
        best = candidate
        bestPenalty = penalty
      }
    }
    placed.push(best)
    positions[key] = best
  }
  return positions
}

/** Produto vetorial v × B em perspetiva, com força elétrica, total e aceleração (ficha 3, ex. 2, 10 e 14). */
export function Vectors({ params }: LabProps) {
  const configured = ['v', 'B', 'E', 'q'].some((key) => params[key] !== undefined && params[key] !== '')
  const [velocity, setVelocity] = useState<Vec3>(parseVec3(params.v, [3, 0, 0]))
  const [magneticField, setMagneticField] = useState<Vec3>(parseVec3(params.B, [1, -2, 3]))
  const [electricField, setElectricField] = useState<Vec3>(parseVec3(params.E, configured ? [0, 0, 0] : [-1, -3, 0]))
  const [charge, setCharge] = useState(numberParam(params, 'q', 3))
  const [mass, setMass] = useState(Math.abs(numberParam(params, 'm', configured ? 0 : 0.3)))
  const [gravity, setGravity] = useState(numberParam(params, 'g', configured ? 0 : 10))
  const result = lorentz(charge, velocity, magneticField, electricField, mass, gravity)
  const hasElectric = norm(electricField) > 0
  const magneticSize = norm(result.magnetic)
  const totalSize = norm(result.total)
  const vectors = drawnVectors(velocity, magneticField, electricField, result)
  const [view, setView] = useState<ViewId>(() => clearestView(vectors))
  const project = projector(view)

  const axisTips = axisLabels.map((_, index) => project(withComponent([0, 0, 0], index, 1.14)))
  const origin: Point2 = [ORIGIN[0], ORIGIN[1]]
  const labelPositions = placeLabels(
    vectors.map((vector) => ({ key: vector.key, tip: project(vector.tip) })),
    [...vectors.map((vector): [Point2, Point2] => [origin, project(vector.tip)]), ...axisLabels.map((_, index): [Point2, Point2] => [origin, project(withComponent([0, 0, 0], index, 1))])],
    axisTips,
  )

  const guides = vectors.flatMap((vector) => {
    const [x, y, z] = vector.tip
    const size = norm(vector.tip)
    const tiny = size * 0.03
    if (size === 0) return []
    const foot: Vec3 = [x, y, 0]
    if (Math.abs(z) > tiny && (Math.abs(x) > tiny || Math.abs(y) > tiny)) return [{ key: `${vector.key}-drop`, tone: vector.tone, points: [project(vector.tip), project(foot), project([0, 0, 0])] }]
    if (Math.abs(z) <= tiny && Math.abs(x) > tiny && Math.abs(y) > tiny) return [{ key: `${vector.key}-plane`, tone: vector.tone, points: [project([x, 0, 0]), project(foot), project([0, y, 0])] }]
    return []
  })

  const determinant = `\\vec v\\times\\vec B=\\begin{vmatrix}\\hat\\imath&\\hat\\jmath&\\hat k\\\\ ${velocity.map((value) => texNumber(value)).join('&')}\\\\ ${magneticField.map((value) => texNumber(value)).join('&')}\\end{vmatrix}=(${result.product.map((value) => texNumber(value)).join(';\\ ')})\\ \\mathrm{T\\,m/s}`
  const productIsZero = norm(result.product) === 0
  const thumb = productIsZero
    ? 'v e B são paralelos (ou um deles é nulo): v × B = 0 e não há força magnética.'
    : `aponta os dedos da mão direita segundo v (${directionWords(velocity)}) e roda-os para B (${directionWords(magneticField)}) pelo ângulo mais curto: o polegar fica segundo v × B, isto é, ${directionWords(result.product)}. ${charge > 0 ? 'Como q > 0, a força magnética tem o sentido do polegar.' : charge < 0 ? `Como q < 0, a força magnética é oposta ao polegar: aponta para ${directionWords(result.magnetic)}.` : 'Com q = 0 não há força.'}`

  const row = (name: string, vector: Vec3, setter: (next: Vec3) => void, unit: string) => axisLabels.map((axis, index) => <NumberField key={`${name}${axis}`} label={`${name}${axis}`} value={vector[index]} onChange={(value) => setter(withComponent(vector, index, value))} unit={unit} />)

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-vectors" viewBox="0 0 480 240" role="img" aria-label={`Eixos x, y e z em perspetiva com a velocidade ${formatVec(velocity)} m/s, o campo magnético ${formatVec(magneticField)} T e a força magnética ${formatVec(result.magnetic)} N`}>
      <defs><ArrowHeads prefix="vectors" tones={['v', 'b', 'e', 'f', 'ink', 'muted']} /></defs>
      {axisLabels.map((axis, index) => {
        const negative = project(withComponent([0, 0, 0], index, -0.55))
        const positive = project(withComponent([0, 0, 0], index, 1))
        return <g key={axis}>
          <line className="lab-magnetism-axis faint" x1={ORIGIN[0]} y1={ORIGIN[1]} x2={negative[0]} y2={negative[1]} />
          <line className="lab-magnetism-axis" x1={ORIGIN[0]} y1={ORIGIN[1]} x2={positive[0]} y2={positive[1]} markerEnd="url(#vectors-head-muted)" />
          <text className="lab-magnetism-axis-label" x={axisTips[index][0]} y={axisTips[index][1] + 4} textAnchor="middle">{axis}</text>
        </g>
      })}
      {guides.map((guide) => <polyline key={guide.key} className={`lab-magnetism-proj lab-magnetism-tone-${guide.tone}`} points={guide.points.map((point) => point.join(',')).join(' ')} />)}
      {vectors.map((vector) => <Arrow key={vector.key} prefix="vectors" tone={vector.tone} className={`lab-magnetism-vector-${vector.key}${vector.thick ? ' thick' : ''}`} thin={vector.thin} from={ORIGIN} to={project(vector.tip)} />)}
      {vectors.map((vector) => <text key={vector.key} className={`lab-magnetism-label lab-magnetism-tone-${vector.tone}`} x={labelPositions[vector.key][0]} y={labelPositions[vector.key][1] + 4} textAnchor="middle">{vector.label}</text>)}
      <circle className={`lab-magnetism-particle ${charge < 0 ? 'negative' : 'positive'}`} cx={ORIGIN[0]} cy={ORIGIN[1]} r="5" />
    </svg>
    <p className="lab-magnetism-caption">v, B e E: só a direção conta (comprimento fixo) · as forças estão à mesma escala entre si (com um mínimo visível) · tracejado: projeção no plano xy.</p>

    <ResultStrip label="Força magnética" value={`${formatVec(result.magnetic)} N`} formula="\vec F_m=q\,\vec v\times\vec B" secondary={`|Fₘ| = ${sig(magneticSize)} N`} />
    <div className="lab-magnetism-determinant"><Formula value={determinant} display /></div>
    <Metrics items={[
      { label: 'Força elétrica q·E', value: hasElectric ? `${formatVec(result.electric)} N` : 'sem campo elétrico' },
      { label: 'Força total', value: `${formatVec(result.total)} N` },
      { label: 'Módulo da força total', value: `${sig(totalSize)} N` },
    ]} />
    <Metrics items={[
      { label: gravity !== 0 ? 'Aceleração F/m + g' : 'Aceleração F/m', value: result.acceleration ? `${formatVec(result.acceleration)} m/s²` : 'indica a massa' },
      { label: 'Módulo da aceleração', value: result.acceleration ? `${sig(norm(result.acceleration))} m/s²` : '—' },
      { label: 'Ângulo entre v e B', value: `${sig(result.angle)}°` },
    ]} />

    <Choice label="Ponto de vista" value={view} onChange={setView} options={viewOptions} />
    <div className="lab-magnetism-fields">
      {row('v', velocity, setVelocity, 'm/s')}
      {row('B', magneticField, setMagneticField, 'T')}
      {row('E', electricField, setElectricField, 'V/m')}
      <NumberField label="Carga q (com sinal)" value={charge} onChange={setCharge} unit="C" />
      <NumberField label="Massa m" value={mass} onChange={(value) => setMass(Math.abs(value))} unit="kg" hint="0 = não calcular a aceleração" />
      <NumberField label="Gravidade g" value={gravity} onChange={setGravity} unit="m/s²" hint="segundo −z" />
    </div>
    <LabNote title="Regra da mão direita:">{thumb} A força magnética é sempre perpendicular a v e a B; a elétrica tem a direção de E.</LabNote>
  </>
}
