import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, fmt } from './format'
import { releaseInField, sliderRange } from './physics'
import { Arrow, ArrowDefs } from './svg'

const ID = 'release'
const AXIS_Y = 104
const BAR = { x: 120, y: 198, width: 240, height: 12 }

/** Folha 1, exercício 10: protão abandonado em A num campo de 8,0×10⁴ V/m, B a 0,50 m ao longo do campo. */
export function Release({ params }: LabProps) {
  const [initial] = useState(() => ({ E: numberParam(params, 'E', 8.0e4), d: numberParam(params, 'd', 0.5), q: numberParam(params, 'q', 1.6e-19), m: numberParam(params, 'm', 1.67e-27) }))
  const [field, setField] = useState(initial.E)
  const [distance, setDistance] = useState(initial.d)
  const [charge, setCharge] = useState(initial.q)
  const [mass, setMass] = useState(initial.m)
  const [progress, setProgress] = useState(50)
  const range = sliderRange(initial.d, 0.05, 2, 0.05)

  const result = releaseInField(field, distance, charge, mass)
  const fraction = clamp(progress, 0, 100) / 100
  const kineticNow = result.kineticEnergy * fraction
  const speedNow = result.speed * Math.sqrt(fraction)

  // A carga positiva segue o campo (A à esquerda); a negativa sobe o campo (A à direita).
  const direction = charge < 0 ? -1 : 1
  const span = 80 + 180 * Math.max(0, distance) / (Math.max(0, distance) + 0.5)
  const pointA = 240 - direction * span / 2
  const pointB = 240 + direction * span / 2
  const particleX = pointA + (pointB - pointA) * fraction
  const moves = result.force > 0
  // Escala logarítmica: de 10⁻²⁰ N (22 px) a 10⁻¹² N ou mais (50 px).
  const forceLength = moves ? 22 + 3.5 * clamp(Math.log10(result.force) + 20, 0, 8) : 0
  const speedLength = moves ? 40 * Math.sqrt(fraction) : 0
  const linesPerSide = Math.abs(field) > 0 ? clamp(Math.round(Math.log10(Math.abs(field)) / 2), 1, 4) : 0
  const fieldLines = Array.from({ length: linesPerSide }, (_, index) => 26 + (index + 0.5) * 40 / linesPerSide).flatMap((offset) => [offset, 2 * AXIS_Y - offset])

  return <>
    <svg className="lab-electro-stage" viewBox="0 0 480 240" role="img" aria-label={`Carga ${charge < 0 ? 'negativa' : 'positiva'} largada do repouso em A num campo uniforme de ${sig(Math.abs(field))} V/m. Está a ${fmt(progress, 0)} % do caminho até B, com energia cinética de ${sig(kineticNow)} J.`}>
      <ArrowDefs prefix={ID} kinds={['e', 'f', 'v']} />
      <rect className="lab-electro-sheet positive" x="16" y="20" width="10" height="168" />
      <rect className="lab-electro-sheet negative" x="454" y="20" width="10" height="168" />
      {[44, 84, 124, 164].map((y) => <g key={y}><text className="lab-electro-sign" x="21" y={y + 4} textAnchor="middle">+</text><text className="lab-electro-sign" x="459" y={y + 4} textAnchor="middle">−</text></g>)}
      {fieldLines.map((y) => <Arrow key={y} prefix={ID} kind="e" className="lab-electro-fieldline" x1={26} y1={y} x2={454} y2={y} />)}
      {linesPerSide > 0 && <Arrow prefix={ID} kind="e" className="lab-electro-fieldline" x1={26} y1={AXIS_Y} x2={454} y2={AXIS_Y} />}
      {linesPerSide > 0 && <text className="lab-electro-label field" x="440" y="22" textAnchor="end">E</text>}

      <circle className="lab-electro-point" cx={pointA} cy={AXIS_Y} r="3.5" />
      <circle className="lab-electro-point" cx={pointB} cy={AXIS_Y} r="3.5" />
      <text className="lab-electro-name" x={pointA} y={AXIS_Y + 18} textAnchor="middle">A</text>
      <text className="lab-electro-name" x={pointB} y={AXIS_Y + 18} textAnchor="middle">B</text>
      <text className="lab-electro-name" x="240" y={AXIS_Y + 32} textAnchor="middle">d = {sig(distance)} m</text>

      <Arrow prefix={ID} kind="v" className="lab-electro-speed" x1={particleX} y1={AXIS_Y - 14} x2={particleX + direction * speedLength} y2={AXIS_Y - 14} />
      {speedLength >= 6 && <text className="lab-electro-label velocity" x={particleX + direction * (speedLength + 5)} y={AXIS_Y - 10} textAnchor={direction > 0 ? 'start' : 'end'}>v</text>}
      <Arrow prefix={ID} kind="f" thick className="lab-electro-force" x1={particleX} y1={AXIS_Y} x2={particleX + direction * forceLength} y2={AXIS_Y} />
      {moves && <text className="lab-electro-label force" x={particleX + direction * (forceLength + 5)} y={AXIS_Y + 5} textAnchor={direction > 0 ? 'start' : 'end'}>F</text>}
      <circle className={`lab-electro-charge lab-electro-particle ${charge > 0 ? 'positive' : charge < 0 ? 'negative' : 'neutral'}`} cx={particleX} cy={AXIS_Y} r="7" />

      <rect className="lab-electro-energy-potential" x={BAR.x} y={BAR.y} width={BAR.width} height={BAR.height} />
      <rect className="lab-electro-energy-kinetic" x={BAR.x} y={BAR.y} width={BAR.width * (moves ? fraction : 0)} height={BAR.height} />
      <rect className="lab-electro-energy-frame" x={BAR.x} y={BAR.y} width={BAR.width} height={BAR.height} />
      <text className="lab-electro-label velocity" x={BAR.x - 6} y={BAR.y + 10} textAnchor="end">cinética</text>
      <text className="lab-electro-label field" x={BAR.x + BAR.width + 6} y={BAR.y + 10}>potencial</text>
      <text className="lab-electro-name" x="240" y="230" textAnchor="middle">E cinética = {sig(kineticNow)} J · v = {sig(speedNow)} m/s</text>
    </svg>
    <p className="lab-electro-caption">A barra mostra a energia potencial elétrica a converter-se em cinética. A seta da força usa escala logarítmica e a distância A–B uma escala visual saturada; a densidade de linhas cresce com log E.</p>

    <ResultStrip label="Energia cinética ao chegar a B" value={`${sig(result.kineticEnergy)} J`} formula="E_c=|q|\,\Delta V=|q|\,E\,d" secondary={`velocidade em B: ${sig(result.speed)} m/s`} />
    <Metrics items={[
      { label: 'Força elétrica |q|E', value: `${sig(result.force)} N` },
      { label: 'Peso m·g', value: `${sig(result.weight)} N` },
      { label: 'ΔV entre A e B: E·d', value: `${sig(result.deltaV)} V` },
      { label: 'Força elétrica / peso', value: result.forceToWeight > 0 ? `${sig(result.forceToWeight)} ×` : '—' },
    ]} />

    <Control label="Posição entre A e B" value={progress} min={0} max={100} step={1} onChange={setProgress} unit="%" />
    <Control label="Distância d ao longo do campo" value={distance} min={range.min} max={range.max} step={range.step} onChange={setDistance} unit="m" />
    <div className="lab-electro-fields">
      <NumberField label="Campo E" value={field} unit="V/m" onChange={setField} />
      <NumberField label="Carga q" value={charge} unit="C" hint="protão: 1.6e-19 · eletrão: -1.6e-19" onChange={setCharge} />
      <NumberField label="Massa m" value={mass} unit="kg" hint="protão: 1.67e-27 · eletrão: 9.11e-31" onChange={setMass} />
    </div>

    <LabNote title="Armadilha típica:">
      {result.forceToWeight > 1000 ? 'o peso é desprezável ao pé da força elétrica (vê a razão acima), mas tens de o justificar com os dois valores.' : 'aqui o peso não é desprezável: a partícula real também cai enquanto atravessa o campo.'}
      {' '}A energia cinética em B não depende da massa (E_c = |q|·ΔV); a velocidade depende.
      {charge < 0 && ' Uma carga negativa é empurrada contra o campo, para potenciais mais altos — por isso A e B trocam de lado.'}
    </LabNote>
  </>
}
