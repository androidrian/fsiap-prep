import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, ResultStrip, numberParam, sig, textParam, type LabProps } from '../ui'
import { fmt } from './format'
import { pairPendulum, planePendulum, sliderRange } from './physics'
import { Arrow, ArrowDefs } from './svg'

const ID = 'pendulum'
const PIVOT_Y = 22
type Mode = 'pair' | 'plane'

/** Valores por omissão: plano = Folha 1, exercício 19; par = exemplo com ângulo bem visível (exercício 3 é literal). */
const DEFAULTS: Record<Mode, { m: number; q: number; l: number }> = { plane: { m: 40, q: 75, l: 7 }, pair: { m: 1, q: 100, l: 20 } }

export function Pendulum({ params }: LabProps) {
  const [mode, setMode] = useState<Mode>(textParam(params, 'mode', 'plane') === 'pair' ? 'pair' : 'plane')
  const [initial] = useState(() => {
    const start: Mode = textParam(params, 'mode', 'plane') === 'pair' ? 'pair' : 'plane'
    return { m: numberParam(params, 'm', DEFAULTS[start].m), q: numberParam(params, 'q', DEFAULTS[start].q), l: numberParam(params, 'l', DEFAULTS[start].l), sigma: numberParam(params, 'sigma', 22) }
  })
  const [mass, setMass] = useState(initial.m)
  const [charge, setCharge] = useState(initial.q)
  const [length, setLength] = useState(initial.l)
  const [sigma, setSigma] = useState(initial.sigma)
  const ranges = { m: sliderRange(initial.m, 0.5, 100, 0.5), q: sliderRange(initial.q, 0, 300, 1), l: sliderRange(initial.l, 1, 50, 0.5), sigma: sliderRange(initial.sigma, 0, 50, 0.5) }

  // SI: g → kg, nC → C, cm → m, nC/cm² → C/m².
  const pair = pairPendulum(mass * 1e-3, charge * 1e-9, length * 1e-2)
  const plane = planePendulum(mass * 1e-3, charge * 1e-9, length * 1e-2, sigma * 1e-9 / 1e-4)
  const state = mode === 'pair' ? pair : plane
  const theta = state.theta
  const degrees = theta * 180 / Math.PI

  // Geometria do desenho: o ângulo é o real; o comprimento do fio usa uma escala saturada.
  const pivotX = mode === 'pair' ? 240 : 330
  const stringLength = 80 + 60 * Math.max(0, length) / (Math.max(0, length) + 7)
  const side = mode === 'pair' ? 1 : -1 // lado para onde a carga desenhada com forças se afasta
  const bobX = pivotX + side * stringLength * Math.sin(theta)
  const bobY = PIVOT_Y + stringLength * Math.cos(theta)
  const forceScale = state.tension > 0 ? Math.min(46, stringLength - 46) / state.tension : 0
  const weightLength = state.weight * forceScale
  const electricLength = state.electricForce * forceScale
  const tensionLength = state.tension * forceScale
  const tensionTip = { x: bobX - side * Math.sin(theta) * tensionLength, y: bobY - Math.cos(theta) * tensionLength }
  // Perpendicular ao fio, para o lado de fora do ângulo θ.
  const outward = { x: side * Math.cos(theta), y: -Math.sin(theta) }
  const arcRadius = 24
  const arcEnd = { x: pivotX + side * arcRadius * Math.sin(theta), y: PIVOT_Y + arcRadius * Math.cos(theta) }
  const thetaLabel = degrees >= 25
    ? { x: pivotX + side * 38 * Math.sin(theta / 2), y: PIVOT_Y + 38 * Math.cos(theta / 2) }
    : { x: pivotX + side * 34 * Math.sin(theta) + outward.x * 12, y: PIVOT_Y + 34 * Math.cos(theta) + outward.y * 12 }
  const fieldLength = sigma > 0 ? 14 + 30 * plane.field / (plane.field + 1.2e7) : 0
  const marks = sigma > 0 ? Math.min(12, Math.round(2 + sigma / 3)) : 0
  const otherX = 2 * pivotX - bobX
  const dimensionY = bobY + 22

  const description = mode === 'pair'
    ? `Dois pêndulos carregados com ${fmt(charge, 0)} nC em equilíbrio: cada fio faz ${fmt(degrees, 1)}° com a vertical e as cargas ficam a ${sig(pair.separation * 100)} cm uma da outra.`
    : `Carga de ${fmt(charge, 0)} nC suspensa de um plano vertical com ${fmt(sigma, 1)} nC/cm²: o fio faz ${fmt(degrees, 1)}° com o plano.`

  return <>
    <svg className="lab-electro-stage" viewBox="0 0 480 240" role="img" aria-label={description}>
      <ArrowDefs prefix={ID} kinds={['e', 'f', 'ink']} />
      {mode === 'plane' && <>
        <rect className={`lab-electro-sheet ${sigma > 0 ? 'positive' : 'neutral'}`} x="330" y="8" width="14" height="224" />
        {Array.from({ length: marks }, (_, index) => <text key={index} className="lab-electro-sign" x="337" y={50 + (index + 0.5) * 176 / marks + 4} textAnchor="middle">+</text>)}
        <text className="lab-electro-name" x="352" y="26">fio l = {fmt(length, 1)} cm</text>
        <text className="lab-electro-name" x="352" y="228">σ = {fmt(sigma, 1)} nC/cm²</text>
        {fieldLength > 0 && [70, 130, 190].map((y) => <g key={y}>
          <Arrow prefix={ID} kind="e" className="lab-electro-plane-field" x1={352} y1={y} x2={352 + fieldLength} y2={y} />
          <Arrow prefix={ID} kind="e" x1={110} y1={y} x2={110 - fieldLength} y2={y} />
        </g>)}
        {fieldLength > 0 && <>
          <text className="lab-electro-label field" x={352 + fieldLength + 12} y="74">E</text>
          <text className="lab-electro-label field" x={110 - fieldLength - 12} y="74" textAnchor="end">E</text>
        </>}
      </>}
      {mode === 'pair' && <>
        <line className="lab-electro-ceiling" x1="180" y1={PIVOT_Y} x2="300" y2={PIVOT_Y} />
        <path className="lab-electro-hatch" d={Array.from({ length: 11 }, (_, index) => `M${186 + index * 11} ${PIVOT_Y}l8 -9`).join('')} />
        <line className="lab-electro-guide" x1={pivotX} y1={PIVOT_Y} x2={pivotX} y2={bobY + 12} />
        <line className="lab-electro-string" x1={pivotX} y1={PIVOT_Y} x2={otherX} y2={bobY} />
        <circle className={`lab-electro-bob ${charge !== 0 ? 'positive' : 'neutral'}`} cx={otherX} cy={bobY} r="8" />
        {theta > 0.01 && <path className="lab-electro-angle" d={`M${pivotX} ${PIVOT_Y + arcRadius}A${arcRadius} ${arcRadius} 0 0 1 ${2 * pivotX - arcEnd.x} ${arcEnd.y}`} />}
        <text className="lab-electro-name" x={(pivotX + otherX) / 2 - outward.x * 12} y={(PIVOT_Y + bobY) / 2 + outward.y * 12 + 4} textAnchor="end">l = {fmt(length, 1)} cm</text>
        <path className="lab-electro-dimension" d={`M${otherX} ${dimensionY}H${bobX}M${otherX} ${dimensionY - 4}v8M${bobX} ${dimensionY - 4}v8`} />
        <text className="lab-electro-name" x={otherX - 8} y={dimensionY + 4} textAnchor="end">x = {sig(pair.separation * 100)} cm</text>
      </>}

      <line className="lab-electro-string" x1={pivotX} y1={PIVOT_Y} x2={bobX} y2={bobY} />
      {theta > 0.01 && <path className="lab-electro-angle" d={`M${pivotX} ${PIVOT_Y + arcRadius}A${arcRadius} ${arcRadius} 0 0 ${side > 0 ? 0 : 1} ${arcEnd.x} ${arcEnd.y}`} />}
      <text className="lab-electro-label ink" x={thetaLabel.x} y={thetaLabel.y + 4} textAnchor="middle">θ</text>

      <Arrow prefix={ID} kind="ink" className="lab-electro-weight" x1={bobX} y1={bobY} x2={bobX} y2={bobY + weightLength} />
      <Arrow prefix={ID} kind="f" className="lab-electro-electric" x1={bobX} y1={bobY} x2={bobX + side * electricLength} y2={bobY} />
      <Arrow prefix={ID} kind="ink" className="lab-electro-tension" x1={bobX} y1={bobY} x2={tensionTip.x} y2={tensionTip.y} />
      <circle className={`lab-electro-bob ${charge !== 0 ? 'positive' : 'neutral'}`} cx={bobX} cy={bobY} r="8" />
      {weightLength >= 1.5 && <text className="lab-electro-label ink" x={bobX + side * 9} y={bobY + weightLength + 2} textAnchor={side > 0 ? 'start' : 'end'}>P</text>}
      {electricLength >= 1.5 && <text className="lab-electro-label force" x={bobX + side * (electricLength + 4)} y={bobY - 7} textAnchor={side > 0 ? 'start' : 'end'}>Fₑ</text>}
      {tensionLength >= 1.5 && <text className="lab-electro-label ink" x={tensionTip.x + outward.x * 11} y={tensionTip.y + outward.y * 11 + 4} textAnchor="middle">T</text>}
    </svg>
    <p className="lab-electro-caption">O ângulo desenhado é o real. As três forças estão à mesma escala entre si; o comprimento do fio usa uma escala visual saturada.</p>

    {mode === 'plane'
      ? <ResultStrip label="Ângulo do fio com o plano" value={`${fmt(degrees, 1)}°`} formula="\tan\theta=\frac{qE}{mg},\quad E=\frac{\sigma}{2\varepsilon_0}" secondary={`campo do plano E = ${sig(plane.field)} V/m`} />
      : <ResultStrip label="Ângulo de equilíbrio de cada fio" value={`${fmt(degrees, 1)}°`} formula="\sin^2\theta\,\tan\theta=\frac{k\,q^2}{4\,l^2\,m\,g}" secondary={`separação x = 2·l·sinθ = ${sig(pair.separation * 100)} cm`} />}
    {mode === 'plane'
      ? <Metrics items={[{ label: 'Força elétrica qE', value: `${sig(plane.electricForce)} N` }, { label: 'Peso mg', value: `${sig(plane.weight)} N` }, { label: 'Tensão no fio', value: `${sig(plane.tension)} N` }, { label: 'Distância ao plano', value: `${sig(plane.distance * 100)} cm` }]} />
      : <Metrics items={[{ label: 'Separação real x', value: `${sig(pair.separation * 100)} cm` }, { label: 'Estimativa (ângulos pequenos)', value: `${sig(pair.smallAngleSeparation * 100)} cm` }, { label: 'Força elétrica', value: `${sig(pair.electricForce)} N` }, { label: 'Tensão no fio', value: `${sig(pair.tension)} N` }]} />}

    <Choice label="Montagem" value={mode} onChange={setMode} options={[['pair', 'Dois pêndulos'], ['plane', 'Plano carregado']] as const} />
    <Control label="Massa m" value={mass} min={ranges.m.min} max={ranges.m.max} step={ranges.m.step} onChange={setMass} unit="g" />
    <Control label="Carga q" value={charge} min={ranges.q.min} max={ranges.q.max} step={ranges.q.step} onChange={setCharge} unit="nC" />
    <Control label="Comprimento do fio l" value={length} min={ranges.l.min} max={ranges.l.max} step={ranges.l.step} onChange={setLength} unit="cm" />
    {mode === 'plane' && <Control label="Densidade de carga σ" value={sigma} min={ranges.sigma.min} max={ranges.sigma.max} step={ranges.sigma.step} onChange={setSigma} unit="nC/cm²" />}

    {mode === 'plane'
      ? <LabNote title="Armadilha típica:">o campo de um plano infinito é σ/(2ε₀) — não σ/ε₀ — e não depende da distância ao plano. Por isso o ângulo não muda com o comprimento do fio: só com q, σ e m.</LabNote>
      : <LabNote title="Leitura do diagrama:">a força elétrica depende da separação, e a separação depende do ângulo; por isso a equação só se resolve à mão com sinθ ≈ tanθ. A estimativa x ≈ (l·q²/(2πε₀·m·g))^(1/3) afasta-se do valor real à medida que θ cresce.</LabNote>}
  </>
}
