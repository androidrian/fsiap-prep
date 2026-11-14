import { useState } from 'react'
import { Choice, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, textParam, type LabProps } from '../ui'
import { ATOMIC_MASS_UNIT, chargeForLanding, curveSide, massForLanding, niceCeil, niceFloor, orbit, radiusForLanding, type ArcKind } from './physics'
import { Arrow, ArrowHeads, FieldPattern, ScaleBar } from './svg'

const arcOptions = [['quarter', '¼ de volta'], ['half', '½ volta'], ['full', 'volta completa']] as const
const arcNames: Record<ArcKind, string> = { quarter: '¼ de volta', half: '½ volta', full: 'uma volta completa' }
const fieldOptions = [['out', 'B ⊙ a sair'], ['in', 'B ⊗ a entrar']] as const

function parseArc(text: string): ArcKind {
  return text === 'quarter' || text === 'full' ? text : 'half'
}

/** Espectrómetro de massa / arco circular com valores reais (ficha 3, ex. 1, 9, 13 e 15). */
export function Orbit({ params }: LabProps) {
  const initialField = numberParam(params, 'B', 0.08)
  const [mass, setMass] = useState(Math.abs(numberParam(params, 'm', 3.3863e-25)))
  const [charge, setCharge] = useState(numberParam(params, 'q', 1.6022e-19))
  const [speed, setSpeed] = useState(Math.abs(numberParam(params, 'v', 30761.722)))
  const [field, setField] = useState(Math.abs(initialField))
  const [fieldSense, setFieldSense] = useState<'out' | 'in'>(initialField < 0 ? 'in' : 'out')
  const [arc, setArc] = useState<ArcKind>(parseArc(textParam(params, 'arc', 'half')))
  const result = orbit(mass, charge, speed, field, arc)
  const [target, setTarget] = useState(() => {
    const initial = result.chord > 0 ? result.chord : result.radius * 2
    return Number.isFinite(initial) && initial > 0 ? Number(initial.toPrecision(5)) : 1
  })

  const curved = Number.isFinite(result.radius) && result.radius > 0
  const out = fieldSense === 'out'
  const side = curveSide(charge, out)
  const sideName = side > 0 ? 'direita' : 'esquerda'

  // Escala automática: o raio ocupa entre ⅔ e a totalidade do espaço disponível.
  const maxRadius = arc === 'full' ? 84 : 132
  const span = niceCeil(curved ? result.radius : 1)
  const pxPerMetre = maxRadius / span
  const r = curved ? result.radius * pxPerMetre : 0
  const ey = arc === 'full' ? 120 : 178
  const ex = curved ? 240 - side * (arc === 'quarter' ? r / 2 : r) : 240
  const cx = ex + side * r
  const sweep = side > 0 ? 1 : 0
  const exit: [number, number] = arc === 'quarter' ? [cx, ey - r] : arc === 'half' ? [ex + 2 * side * r, ey] : [ex, ey]
  const trajectory = !curved
    ? `M${ex} ${ey}V24`
    : arc === 'full'
      ? `M${ex} ${ey}A${r} ${r} 0 1 ${sweep} ${ex + 2 * side * r} ${ey}A${r} ${r} 0 1 ${sweep} ${ex} ${ey}`
      : `M${ex} ${ey}A${r} ${r} 0 0 ${sweep} ${exit[0]} ${exit[1]}`
  const radiusTip: [number, number] = arc === 'quarter' ? [cx, ey - r] : [cx + side * r * Math.cos(50 * Math.PI / 180), ey - r * Math.sin(50 * Math.PI / 180)]
  const barReal = niceFloor(span / 2)
  const barLength = barReal * pxPerMetre
  const regionBottom = arc === 'full' ? 228 : ey

  const targetRadius = radiusForLanding(target, arc)
  const neededMass = massForLanding(charge, speed, field, target, arc)
  const neededCharge = chargeForLanding(mass, speed, field, target, arc)
  const chordText = arc === 'full' ? '0 m (regressa à entrada)' : `${sig(result.chord, 5)} m`

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-orbit" viewBox="0 0 480 240" role="img" aria-label={`Partícula ${charge < 0 ? 'negativa' : 'positiva'} entra a subir num campo magnético ${out ? 'a sair da' : 'a entrar na'} página e descreve ${arcNames[arc]} de raio ${sig(result.radius, 5)} m, curvando para a ${sideName}`}>
      <defs>
        <FieldPattern id="orbit-field" out={out} />
        <ArrowHeads prefix="orbit" tones={['v', 'f', 'ink']} />
      </defs>
      <rect className="lab-magnetism-region" x="24" y="14" width="432" height={regionBottom - 14} />
      <rect className="lab-magnetism-region-fill" x="24" y="14" width="432" height={regionBottom - 14} fill="url(#orbit-field)" />
      {arc !== 'full' && <path className="lab-magnetism-plate" d={`M24 ${ey}H${ex - 10}M${ex + 10} ${ey}H456`} />}
      <text className="lab-magnetism-label lab-magnetism-tone-b" x="34" y="34">B {out ? '⊙' : '⊗'}</text>
      <ScaleBar x={405 - barLength / 2} y={28} length={barLength} label={`${sig(barReal)} m`} />

      <path className="lab-magnetism-track" d={`M${ex} ${ey + 54}V${ey}`} />
      <Arrow prefix="orbit" tone="v" from={[ex, ey + 50]} to={[ex, ey + 22]} label="v" labelShift={[-side * 12, 20]} />
      <path className="lab-magnetism-path lab-magnetism-orbit-path" d={trajectory} markerEnd="url(#orbit-head-v)" />

      {curved && <>
        <line className="lab-magnetism-aux lab-magnetism-orbit-radius" x1={cx} y1={ey} x2={radiusTip[0]} y2={radiusTip[1]} />
        <text className="lab-magnetism-strong" x={(cx + radiusTip[0]) / 2 + side * 9} y={(ey + radiusTip[1]) / 2 + (arc === 'quarter' ? 4 : 14)} textAnchor="middle">r</text>
        <circle className="lab-magnetism-centre" cx={cx} cy={ey} r="3" />
        <Arrow prefix="orbit" tone="f" className="lab-magnetism-orbit-force" from={[ex, ey]} to={[ex + side * 46, ey]} label="F" labelShift={[-side * 12, -14]} />
        {arc === 'half' && <>
          <path className="lab-magnetism-dim" d={`M${ex} ${ey + 8}V${ey + 18}M${ex} ${ey + 13}H${exit[0]}M${exit[0]} ${ey + 8}V${ey + 18}`} />
          <text className="lab-magnetism-strong" x={cx} y={ey + 32} textAnchor="middle">x = 2r = {sig(result.chord, 5)} m</text>
        </>}
        {arc === 'quarter' && <>
          <line className="lab-magnetism-aux" x1={ex} y1={ey} x2={exit[0]} y2={exit[1]} />
          <text className="lab-magnetism-strong" x={ex + side * 22} y={ey + 32} textAnchor={side > 0 ? 'start' : 'end'}>corda d = r√2 = {sig(result.chord, 5)} m</text>
        </>}
        {arc !== 'full' && <>
          <circle className="lab-magnetism-landing" cx={exit[0]} cy={exit[1]} r="5" />
          <text className="lab-magnetism-strong" x={exit[0] + side * 12} y={exit[1] - 9} textAnchor="middle">P</text>
        </>}
      </>}
      <circle className={`lab-magnetism-particle ${charge < 0 ? 'negative' : 'positive'}`} cx={ex} cy={ey} r="7" />
      <text className="lab-magnetism-sign" x={ex} y={ey + 4} textAnchor="middle">{charge < 0 ? '−' : '+'}</text>
    </svg>

    <ResultStrip label="Raio da trajetória" value={`${sig(result.radius, 5)} m`} formula="r=\dfrac{mv}{|q|B}" secondary={curved ? `curva para a ${sideName} · F = q v × B aponta sempre para o centro` : 'sem carga, sem campo ou em repouso não há trajetória circular'} />
    <Metrics items={[
      { label: 'Distância entrada–saída', value: chordText },
      { label: 'Força magnética |q|vB', value: `${sig(result.force, 5)} N` },
      { label: 'Período T = 2πm/(|q|B)', value: `${sig(result.period, 5)} s` },
      { label: `Tempo em ${arcNames[arc]}`, value: `${sig(result.arcTime, 5)} s` },
    ]} />
    <Metrics items={[
      { label: 'Energia cinética (constante)', value: `${sig(result.kineticEnergy, 5)} J` },
      { label: 'Trabalho da força magnética', value: '0 J' },
      { label: 'Massa em unidades atómicas', value: `${sig(mass / ATOMIC_MASS_UNIT, 5)} u` },
    ]} />

    <Choice label="Arco descrito" value={arc} onChange={setArc} options={arcOptions} />
    <Choice label="Sentido de B" value={fieldSense} onChange={setFieldSense} options={fieldOptions} />
    <div className="lab-magnetism-fields">
      <NumberField label="Massa m" value={mass} onChange={(value) => setMass(Math.abs(value))} unit="kg" />
      <NumberField label="Carga q (com sinal)" value={charge} onChange={setCharge} unit="C" />
      <NumberField label="Velocidade v" value={speed} onChange={(value) => setSpeed(Math.abs(value))} unit="m/s" />
      <NumberField label="Campo B" value={field} onChange={(value) => { setField(Math.abs(value)); if (value < 0) setFieldSense('in') }} unit="T" />
      <NumberField label="Distância de impacto pretendida" value={target} onChange={(value) => setTarget(Math.abs(value))} unit="m" hint="para o problema inverso" />
    </div>
    <p className="lab-magnetism-inverse">
      <strong>Problema inverso:</strong>{' '}
      {arc === 'full'
        ? 'numa volta completa a partícula regressa ao ponto de entrada; escolhe ¼ ou ½ volta para impor um ponto de impacto.'
        : <>para sair a {sig(target, 5)} m da entrada após {arcNames[arc]} é preciso r = {sig(targetRadius, 5)} m. Com esta v e este B: m = {sig(neededMass, 5)} kg ({sig(neededMass / ATOMIC_MASS_UNIT, 5)} u) mantendo q, ou |q| = {sig(neededCharge, 5)} C mantendo m.</>}
    </p>
    <LabNote title="Leitura do diagrama:">o arco está à escala (vê a barra no canto). A força magnética é perpendicular a v em todos os pontos, por isso muda a direção mas não o módulo da velocidade: a energia cinética mantém-se e o trabalho é nulo. Trocar o sinal de q ou o sentido de B inverte o lado da curva.</LabNote>
  </>
}
