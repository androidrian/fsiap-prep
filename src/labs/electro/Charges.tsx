import { useRef, useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, textParam, type LabProps } from '../ui'
import { chargeUnitLabel, clamp, fmt, plain, signed, subscript } from './format'
import { chargeUnitFactor, fieldAt, isChargeUnit, isLengthUnit, lengthUnitFactor, niceStep, parseCharges, parsePoint, potentialAt, type PointCharge, type Vec } from './physics'
import { Arrow, ArrowDefs } from './svg'

const ID = 'charges'
const STAGE = { width: 480, height: 240, left: 44, top: 10, plotWidth: 426, plotHeight: 206 }
const MAX_CHARGES = 8
/** Comprimento (px) da maior seta de campo com os dados iniciais; a seta da força mede esta fração da resultante. */
const REFERENCE_LENGTH = 70
const FORCE_RATIO = 0.65

/** Folha 1, exercício 5: quadrado de lado 5,0 mm, q = e, carga de prova −100 e em P, trabalho P → A. */
const EXERCISE = { charges: '0,5,1;0,0,2;5,0,1', lengthUnit: 'mm', chargeUnit: 'e', probe: { x: 2.5, y: 2.5 }, second: { x: 5, y: 5 }, testCharge: -100, secondName: 'A' }

interface Setup {
  /** Posições em `lengthUnit`, cargas em `chargeUnit`. */
  charges: PointCharge[]
  names: string[]
  lengthUnit: string
  chargeUnit: string
  probe: Vec
  probeName: string
  second: Vec | null
  secondName: string
  testCharge: number
}

function readSetup(params: Record<string, string>): Setup {
  const given = parseCharges(params.c).slice(0, MAX_CHARGES)
  const isExercise = given.length === 0
  const charges = isExercise ? parseCharges(EXERCISE.charges) : given
  const lengthUnit = textParam(params, 'lu', isExercise ? EXERCISE.lengthUnit : 'm')
  const chargeUnit = textParam(params, 'qu', isExercise ? EXERCISE.chargeUnit : 'C')
  const givenNames = textParam(params, 'names', '').split(',').map((name) => name.trim())
  return {
    charges,
    names: charges.map((_, index) => givenNames[index] || `q${subscript(index + 1)}`),
    lengthUnit: isLengthUnit(lengthUnit) ? lengthUnit : 'm',
    chargeUnit: isChargeUnit(chargeUnit) ? chargeUnit : 'C',
    probe: parsePoint(params.p) ?? (isExercise ? EXERCISE.probe : defaultProbe(charges)),
    probeName: textParam(params, 'pn', 'P'),
    second: parsePoint(params.p2) ?? (isExercise ? EXERCISE.second : null),
    secondName: textParam(params, 'p2n', isExercise ? EXERCISE.secondName : 'B'),
    testCharge: numberParam(params, 'qt', isExercise ? EXERCISE.testCharge : 0),
  }
}

/** Sem ponto de prova no URL: centro da distribuição, afastado se coincidir com uma carga. */
function defaultProbe(charges: PointCharge[]): Vec {
  const xs = charges.map((charge) => charge.x)
  const ys = charges.map((charge) => charge.y)
  const centre = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  const onCharge = charges.some((charge) => charge.x === centre.x && charge.y === centre.y)
  return onCharge ? { x: centre.x, y: centre.y + (span > 0 ? span / 2 : 1) } : centre
}

interface View {
  x0: number
  x1: number
  y0: number
  y1: number
  scale: number
  tick: number
  step: number
}

/** Janela do plano com a mesma escala nos dois eixos (os ângulos do desenho são os reais). */
function makeView(points: Vec[]): View {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const [xMin, xMax, yMin, yMax] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const span = Math.max(xMax - xMin, yMax - yMin)
  const pad = span > 0 ? span * 0.3 : Math.max(1, Math.abs(xMin) * 0.5)
  const scale = Math.min(STAGE.plotWidth / (xMax - xMin + 2 * pad), STAGE.plotHeight / (yMax - yMin + 2 * pad))
  const centreX = (xMin + xMax) / 2
  const centreY = (yMin + yMax) / 2
  const halfWidth = STAGE.plotWidth / scale / 2
  const halfHeight = STAGE.plotHeight / scale / 2
  const tick = niceStep(2 * halfWidth / 12)
  return { x0: centreX - halfWidth, x1: centreX + halfWidth, y0: centreY - halfHeight, y1: centreY + halfHeight, scale, tick, step: 10 ** (Math.floor(Math.log10(tick)) - 1) }
}

const tidy = (value: number) => Number(value.toPrecision(12))

function ticks(from: number, to: number, tick: number): number[] {
  const values: number[] = []
  for (let index = Math.ceil(from / tick - 1e-9); index * tick <= to + tick * 1e-9 && values.length < 60; index += 1) values.push(tidy(index * tick))
  return values
}

function vectorText(x: number, y: number, unit: string): string {
  return `(${sig(x)} êₓ ${y < 0 ? '−' : '+'} ${sig(Math.abs(y))} êᵧ) ${unit}`
}

/** Mantém o arrasto a seguir o ponteiro fora do SVG; onde a captura não existe ou falha, o arrasto continua a funcionar dentro dele. */
function capturePointer(element: Element, pointerId: number) {
  try {
    element.setPointerCapture?.(pointerId)
  } catch {
    // ponteiro já libertado: nada a fazer
  }
}

function angularGap(a: number, b: number): number {
  const difference = Math.abs(a - b) % (2 * Math.PI)
  return difference > Math.PI ? 2 * Math.PI - difference : difference
}

/** Entre os ângulos candidatos (graus, no ecrã: 0 = direita, 90 = baixo), o mais afastado das direções ocupadas (rad). */
function freestAngle(candidates: number[], busy: number[]): number {
  const room = (angle: number) => Math.min(...busy.map((direction) => angularGap(direction, angle)), Math.PI)
  return candidates.map((degrees) => degrees * Math.PI / 180).reduce((best, candidate) => (room(candidate) > room(best) + 1e-9 ? candidate : best))
}

export function Charges({ params }: LabProps) {
  const [setup] = useState(() => readSetup(params))
  const [values, setValues] = useState(() => setup.charges.map((charge) => charge.q))
  const [probe, setProbe] = useState(setup.probe)
  const [testCharge, setTestCharge] = useState(setup.testCharge)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  const lengthFactor = lengthUnitFactor(setup.lengthUnit)
  const chargeFactor = chargeUnitFactor(setup.chargeUnit)
  const unit = chargeUnitLabel(setup.chargeUnit)
  const toSI = (point: Vec): Vec => ({ x: point.x * lengthFactor, y: point.y * lengthFactor })
  const chargesSI = (list: number[]): PointCharge[] => setup.charges.map((charge, index) => ({ ...toSI(charge), q: list[index] * chargeFactor }))

  // Janela e escala de referência das setas: fixadas com os dados do exercício, para se ver o campo crescer/diminuir
  // sem o plano mudar de escala. A janela inclui as pontas das setas iniciais, para as etiquetas caberem.
  const [{ view, reference }] = useState(() => {
    const points = [...setup.charges, setup.probe, ...(setup.second ? [setup.second] : [])]
    const start = fieldAt(chargesSI(setup.charges.map((charge) => charge.q)), toSI(setup.probe))
    const strongest = Math.max(start.total.magnitude, ...start.contributions.map((contribution) => contribution.magnitude))
    const first = makeView(points)
    if (!(strongest > 0)) return { view: first, reference: strongest }
    const reach = REFERENCE_LENGTH / first.scale / strongest
    const tips = [start.total, ...start.contributions].map((vector) => ({ x: setup.probe.x + vector.x * reach, y: setup.probe.y + vector.y * reach }))
    const forceReach = Math.sign(setup.testCharge) * FORCE_RATIO * reach
    return { view: makeView([...points, ...tips, { x: setup.probe.x + start.total.x * forceReach, y: setup.probe.y + start.total.y * forceReach }]), reference: strongest }
  })

  const sources = chargesSI(values)
  const probeSI = toSI(probe)
  const field = fieldAt(sources, probeSI)
  const potential = potentialAt(sources, probeSI)
  const testChargeSI = testCharge * chargeFactor
  const force = { x: testChargeSI * field.total.x, y: testChargeSI * field.total.y, magnitude: Math.abs(testChargeSI) * field.total.magnitude, angle: testChargeSI < 0 && field.total.magnitude > 0 ? Math.atan2(-field.total.y, -field.total.x) * 180 / Math.PI : field.total.angle }
  const hasForce = testChargeSI !== 0
  const secondPotential = setup.second ? potentialAt(sources, toSI(setup.second)).total : 0
  const work = testChargeSI * (potential.total - secondPotential)
  const onCharge = potential.distances.some((distance) => !(distance > 0))

  const toX = (x: number) => STAGE.left + (x - view.x0) * view.scale
  const toY = (y: number) => STAGE.top + (view.y1 - y) * view.scale
  const sliderX = { min: tidy(Math.ceil(view.x0 / view.step) * view.step), max: tidy(Math.floor(view.x1 / view.step) * view.step) }
  const sliderY = { min: tidy(Math.ceil(view.y0 / view.step) * view.step), max: tidy(Math.floor(view.y1 / view.step) * view.step) }
  const snap = (value: number, range: { min: number; max: number }) => clamp(tidy(Math.round(value / view.step) * view.step), range.min, range.max)

  const moveTo = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    const measured = rect !== undefined && rect.width > 0 && rect.height > 0
    const ratio = measured ? Math.min(rect.width / STAGE.width, rect.height / STAGE.height) : 1
    const originX = measured ? rect.left + (rect.width - STAGE.width * ratio) / 2 : 0
    const originY = measured ? rect.top + (rect.height - STAGE.height * ratio) / 2 : 0
    const stageX = (clientX - originX) / ratio
    const stageY = (clientY - originY) / ratio
    if (!Number.isFinite(stageX) || !Number.isFinite(stageY)) return
    setProbe({ x: snap(view.x0 + (stageX - STAGE.left) / view.scale, sliderX), y: snap(view.y1 - (stageY - STAGE.top) / view.scale, sliderY) })
  }

  const reset = () => {
    setValues(setup.charges.map((charge) => charge.q))
    setProbe(setup.probe)
    setTestCharge(setup.testCharge)
  }

  // Setas de campo: todas à mesma escala (a soma vetorial vê-se no desenho); a maior fica entre 30 e 95 px.
  const largest = Math.max(field.total.magnitude, ...field.contributions.map((contribution) => contribution.magnitude))
  const arrowScale = largest > 0 ? clamp(reference > 0 ? REFERENCE_LENGTH * largest / reference : REFERENCE_LENGTH, 30, 95) / largest : 0
  const px = toX(probe.x)
  const py = toY(probe.y)
  const tip = (vector: Vec, scale: number) => ({ x: px + vector.x * scale, y: py - vector.y * scale })
  const totalTip = tip(field.total, arrowScale)
  const totalLength = field.total.magnitude * arrowScale
  const forceLength = hasForce && field.total.magnitude > 0 ? Math.max(20, totalLength * FORCE_RATIO) : 0
  const forceTip = tip({ x: Math.sign(testChargeSI) * field.total.x, y: Math.sign(testChargeSI) * field.total.y }, field.total.magnitude > 0 ? forceLength / field.total.magnitude : 0)

  // Nome de cada carga: do lado mais afastado das linhas para o ponto de prova e para as outras cargas
  // (calculado com a posição inicial do ponto, para as etiquetas não saltarem ao arrastar).
  const xs = setup.charges.map((charge) => charge.x)
  const middleX = (Math.min(...xs) + Math.max(...xs)) / 2
  const chargeLabels = setup.charges.map((charge, index) => {
    const towards = (other: Vec) => Math.atan2(-(other.y - charge.y), other.x - charge.x)
    const lines = [setup.probe, ...setup.charges.filter((_, position) => position !== index)].filter((other) => other.x !== charge.x || other.y !== charge.y).map(towards)
    const angle = freestAngle(charge.x < middleX ? [180, 270, 90, 0] : [0, 270, 90, 180], lines)
    return { horizontal: Math.round(Math.cos(angle)), vertical: Math.round(Math.sin(angle)) }
  })

  // Etiquetas junto às pontas das setas, afastadas das cargas, dos nomes das cargas e umas das outras.
  const placed: Vec[] = setup.charges.flatMap((charge, index) => {
    const centre = { x: toX(charge.x), y: toY(charge.y) }
    const { horizontal, vertical } = chargeLabels[index]
    const text = horizontal !== 0
      ? [22, 44, 66, 88].map((offset) => ({ x: centre.x + horizontal * offset, y: centre.y }))
      : [-30, 0, 30].map((offset) => ({ x: centre.x + offset, y: centre.y + (vertical < 0 ? -19 : 20) }))
    return [centre, ...text]
  })
  const place = (end: Vec, side: number, length: number) => {
    if (length < 1.5) return null
    const ux = (end.x - px) / length
    const uy = (end.y - py) / length
    const base = { x: end.x + ux * 9 - uy * side, y: end.y + uy * 9 + ux * side }
    const shifts: Array<[number, number]> = [[0, 0], [0, 14], [0, -14], [14, 0], [0, 27], [0, -27], [27, 0]]
    const options = shifts.map(([along, across]) => ({ x: base.x + ux * along - uy * across, y: base.y + uy * along + ux * across }))
    const spot = options.find((option) => placed.every((other) => Math.abs(other.x - option.x) >= 20 || Math.abs(other.y - option.y) >= 13)) ?? base
    placed.push(spot)
    return spot
  }
  const totalLabel = place(totalTip, -9, totalLength)
  const contributionLabels = field.contributions.map((contribution) => place(tip(contribution, arrowScale), 7, contribution.magnitude * arrowScale))
  const forceLabel = place(forceTip, 0, forceLength)

  // Nome do ponto de prova: na direção mais livre de setas e linhas auxiliares.
  const busy = [
    ...setup.charges.map((charge) => Math.atan2(toY(charge.y) - py, toX(charge.x) - px)),
    ...field.contributions.filter((contribution) => contribution.magnitude * arrowScale >= 1.5).map((contribution) => Math.atan2(-contribution.y, contribution.x)),
    ...(totalLength >= 1.5 ? [Math.atan2(-field.total.y, field.total.x)] : []),
    ...(forceLength > 0 ? [Math.atan2(forceTip.y - py, forceTip.x - px)] : []),
    ...(setup.second ? [Math.atan2(toY(setup.second.y) - py, toX(setup.second.x) - px)] : []),
  ]
  const nameAngle = freestAngle([45, 135, 225, 315, 90, 270, 0, 180], busy)

  const cancelling = field.contributions.flatMap((first, i) => field.contributions.slice(i + 1).flatMap((second, offset) => (
    first.magnitude > 0 && Math.hypot(first.x + second.x, first.y + second.y) < 1e-9 * first.magnitude ? [[i, i + 1 + offset] as const] : []
  )))
  const tickDecimals = Math.max(0, -Math.floor(Math.log10(view.tick)))
  const xTicks = ticks(view.x0, view.x1, view.tick)
  const angleText = field.total.magnitude > 0 ? `${fmt(field.total.angle, 1)}°` : '—'
  const metrics = [
    { label: `Potencial em ${setup.probeName}`, value: `${sig(potential.total)} V` },
    { label: 'Ângulo de E com +x', value: angleText },
    ...(hasForce ? [{ label: `Força sobre q₀ em ${setup.probeName}`, value: `${sig(force.magnitude)} N` }] : []),
    ...(setup.second ? [hasForce ? { label: `Trabalho ${setup.probeName} → ${setup.secondName}`, value: `${sig(work)} J` } : { label: `Potencial em ${setup.secondName}`, value: `${sig(secondPotential)} V` }] : []),
  ]

  return <>
    <svg
      ref={svgRef}
      className="lab-electro-stage lab-electro-map"
      viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
      role="img"
      aria-label={`Mapa de ${setup.charges.length} cargas pontuais. Ponto ${setup.probeName} em (${plain(probe.x)}; ${plain(probe.y)}) ${setup.lengthUnit}: campo de ${sig(field.total.magnitude)} N/C${field.total.magnitude > 0 ? ` a ${angleText} do eixo x` : ''}, potencial de ${sig(potential.total)} V.`}
      onPointerDown={(event) => { dragging.current = true; capturePointer(event.currentTarget, event.pointerId); moveTo(event.clientX, event.clientY) }}
      onPointerMove={(event) => { if (dragging.current) moveTo(event.clientX, event.clientY) }}
      onPointerUp={() => { dragging.current = false }}
      onPointerCancel={() => { dragging.current = false }}
      onClick={(event) => moveTo(event.clientX, event.clientY)}
    >
      <ArrowDefs prefix={ID} kinds={['e', 'f', 'pos', 'neg', 'ink']} />
      <rect className="lab-electro-plot" x={STAGE.left} y={STAGE.top} width={STAGE.plotWidth} height={STAGE.plotHeight} />
      {xTicks.map((value) => <g key={`x${value}`}>
        <line className={value === 0 ? 'lab-electro-axis' : 'lab-electro-grid'} x1={toX(value)} y1={STAGE.top} x2={toX(value)} y2={STAGE.top + STAGE.plotHeight} />
        {(xTicks.length <= 7 || Math.round(value / view.tick) % 2 === 0) && toX(value) < STAGE.left + STAGE.plotWidth - 44 &&<text className="lab-electro-tick" x={toX(value)} y={STAGE.top + STAGE.plotHeight + 14} textAnchor="middle">{fmt(value, tickDecimals)}</text>}
      </g>)}
      {ticks(view.y0, view.y1, view.tick).map((value) => <g key={`y${value}`}>
        <line className={value === 0 ? 'lab-electro-axis' : 'lab-electro-grid'} x1={STAGE.left} y1={toY(value)} x2={STAGE.left + STAGE.plotWidth} y2={toY(value)} />
        {toY(value) > STAGE.top + 16 && <text className="lab-electro-tick" x={STAGE.left - 5} y={toY(value) + 4} textAnchor="end">{fmt(value, tickDecimals)}</text>}
      </g>)}
      <text className="lab-electro-tick" x={STAGE.left + STAGE.plotWidth} y={STAGE.top + STAGE.plotHeight + 14} textAnchor="end">x / {setup.lengthUnit}</text>
      <text className="lab-electro-tick" x={STAGE.left - 5} y={STAGE.top + 9} textAnchor="end">y / {setup.lengthUnit}</text>

      {setup.charges.map((charge, index) => <line key={`guide${index}`} className="lab-electro-guide" x1={toX(charge.x)} y1={toY(charge.y)} x2={px} y2={py} />)}
      {setup.second && <>
        <line className="lab-electro-guide lab-electro-path" x1={px} y1={py} x2={toX(setup.second.x)} y2={toY(setup.second.y)} />
        <circle className="lab-electro-point" cx={toX(setup.second.x)} cy={toY(setup.second.y)} r="3.5" />
        <text className="lab-electro-name" x={toX(setup.second.x) + 8} y={toY(setup.second.y) - 6}>{setup.secondName}</text>
      </>}

      <Arrow prefix={ID} kind="e" thick className="lab-electro-e-total" x1={px} y1={py} x2={totalTip.x} y2={totalTip.y} />
      {field.contributions.map((contribution, index) => {
        const end = tip(contribution, arrowScale)
        return <Arrow key={`e${index}`} prefix={ID} kind={values[index] >= 0 ? 'pos' : 'neg'} className="lab-electro-e-part" x1={px} y1={py} x2={end.x} y2={end.y} />
      })}
      {forceLength > 0 && <Arrow prefix={ID} kind="f" className="lab-electro-force" x1={px} y1={py} x2={forceTip.x} y2={forceTip.y} />}

      {setup.charges.map((charge, index) => {
        const cx = toX(charge.x)
        const cy = toY(charge.y)
        const { horizontal, vertical } = chargeLabels[index]
        const value = values[index]
        return <g key={`charge${index}`}>
          <circle className={`lab-electro-charge ${value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'}`} cx={cx} cy={cy} r="9" />
          <text className="lab-electro-sign" x={cx} y={cy + 4} textAnchor="middle">{value > 0 ? '+' : value < 0 ? '−' : '0'}</text>
          <text className="lab-electro-name" x={cx + horizontal * 14} y={vertical < 0 ? cy - 15 : vertical > 0 ? cy + 24 : cy + 4} textAnchor={horizontal === 0 ? 'middle' : horizontal < 0 ? 'end' : 'start'}>{setup.names[index]} = {signed(value)} {unit}</text>
        </g>
      })}

      <circle className="lab-electro-probe" cx={px} cy={py} r="4.5" />
      <text className="lab-electro-name" x={px + Math.cos(nameAngle) * 15} y={py + Math.sin(nameAngle) * 15 + 4} textAnchor="middle">{setup.probeName}</text>
      {contributionLabels.map((spot, index) => spot && <text key={`label${index}`} className={`lab-electro-label ${values[index] >= 0 ? 'positive' : 'negative'}`} x={spot.x} y={spot.y + 4} textAnchor="middle">E{subscript(index + 1)}</text>)}
      {totalLabel && <text className="lab-electro-label field" x={totalLabel.x} y={totalLabel.y + 4} textAnchor="middle">E</text>}
      {forceLabel && <text className="lab-electro-label force" x={forceLabel.x} y={forceLabel.y + 4} textAnchor="middle">F</text>}
    </svg>
    <p className="lab-electro-caption">Clica ou arrasta no plano para mover {setup.probeName}. As setas de campo estão todas à mesma escala (E é a soma das setas finas); F indica só direção e sentido.</p>

    <ResultStrip label={`Campo elétrico em ${setup.probeName}`} value={`${sig(field.total.magnitude)} N/C`} formula="\vec E=\sum_i \frac{k\,q_i}{r_i^2}\,\hat r_i" secondary={`E = ${vectorText(field.total.x, field.total.y, 'N/C')}`} />
    <Metrics items={metrics} />

    <table className="lab-electro-terms">
      <thead><tr><th>Carga</th><th>r ({setup.lengthUnit})</th><th>|Eᵢ| = k|qᵢ|/rᵢ² (N/C)</th><th>Vᵢ = k·qᵢ/rᵢ (V)</th></tr></thead>
      <tbody>
        {setup.charges.map((_, index) => <tr key={index}><th>{setup.names[index]}</th><td>{sig(potential.distances[index] / lengthFactor)}</td><td>{sig(field.contributions[index].magnitude)}</td><td>{sig(potential.terms[index])}</td></tr>)}
        <tr className="lab-electro-sum"><th>Soma</th><td>—</td><td>vetorial: {sig(field.total.magnitude)}</td><td>escalar: {sig(potential.total)}</td></tr>
      </tbody>
    </table>
    {hasForce && <p className="lab-electro-readout"><strong>Força sobre q₀ = {signed(testCharge)} {unit}:</strong> F = q₀E = {vectorText(force.x, force.y, 'N')} · |F| = {sig(force.magnitude)} N{force.magnitude > 0 && <> · ângulo com +x: {fmt(force.angle, 1)}° ({testChargeSI < 0 ? 'oposta a E' : 'no sentido de E'})</>}</p>}
    {setup.second && <p className="lab-electro-readout"><strong>De {setup.probeName} para {setup.secondName}:</strong> V({setup.secondName}) = {sig(secondPotential)} V{hasForce && <> · W = q₀·(V({setup.probeName}) − V({setup.secondName})) = {sig(work)} J</>}</p>}

    <Control label={`Posição x de ${setup.probeName}`} value={probe.x} min={sliderX.min} max={sliderX.max} step={view.step} onChange={(x) => setProbe((current) => ({ ...current, x: tidy(x) }))} unit={setup.lengthUnit} />
    <Control label={`Posição y de ${setup.probeName}`} value={probe.y} min={sliderY.min} max={sliderY.max} step={view.step} onChange={(y) => setProbe((current) => ({ ...current, y: tidy(y) }))} unit={setup.lengthUnit} />
    <div className="lab-electro-fields">
      {setup.charges.map((charge, index) => <NumberField key={index} label={`Carga ${setup.names[index]}`} value={values[index]} unit={unit} hint={`em (${plain(charge.x)}; ${plain(charge.y)}) ${setup.lengthUnit}`} onChange={(value) => setValues((current) => current.map((old, position) => (position === index ? value : old)))} />)}
      <NumberField label={`Carga de prova q₀ em ${setup.probeName}`} value={testCharge} unit={unit} hint="0 = sem carga de prova" onChange={setTestCharge} />
    </div>
    <button type="button" className="lab-electro-reset" onClick={reset}>Repor dados do exercício</button>

    <LabNote title="Leitura do diagrama:">
      o campo soma-se seta a seta (vetores), o potencial soma-se como números com sinal. A força sobre q₀ tem o sentido de E se q₀ &gt; 0 e o oposto se q₀ &lt; 0; o trabalho da força elétrica só depende do potencial nos extremos.
      {cancelling.map(([first, second]) => <span key={`${first}-${second}`}> Aqui os campos de {setup.names[first]} e {setup.names[second]} são iguais e opostos: anulam-se.</span>)}
      {onCharge && <span> O ponto está em cima de uma carga: essa contribuição foi ignorada, porque o campo de uma carga pontual diverge em r = 0.</span>}
    </LabNote>
  </>
}
