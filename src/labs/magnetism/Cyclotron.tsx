import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, spanFor } from './format'
import { LIGHT_SPEED, cyclotron, niceCeil, niceFloor } from './physics'
import { Arrow, ArrowHeads, FieldPattern, ScaleBar } from './svg'

const CX = 240
const CY = 112
const MAX_RADIUS = 86
const GAP = 6
const HALF_TURNS = 12

/** Ciclotrão visto de cima: dois D, fenda com campo alternado e espiral (ficha 3, ex. 3). */
export function Cyclotron({ params }: LabProps) {
  const [frequency, setFrequency] = useState(Math.abs(numberParam(params, 'f', 12)))
  const [radius, setRadius] = useState(Math.abs(numberParam(params, 'R', 0.53)))
  const [mass, setMass] = useState(Math.abs(numberParam(params, 'm', 3.34e-27)))
  const [charge, setCharge] = useState(numberParam(params, 'q', 1.6022e-19))
  const [frequencyRange] = useState(() => spanFor(frequency, 1, 60))
  const [radiusRange] = useState(() => spanFor(radius, 0.05, 2))

  const result = cyclotron(frequency * 1e6, radius, mass, charge)
  const sense = charge < 0 ? -1 : 1
  const span = niceCeil(radius > 0 ? radius : 1)
  const pxPerMetre = MAX_RADIUS / span
  const dee = Math.max(20, radius * pxPerMetre)
  const half = Math.sqrt(dee * dee - GAP * GAP)
  const outer = dee - 7

  // Cada passagem na fenda dá a mesma energia: r ∝ √k, por isso as voltas apertam para fora.
  let y = CY - 0.2 * outer
  let spiral = `M${CX} ${y}`
  for (let k = 1; k <= HALF_TURNS; k += 1) {
    const r = outer * Math.sqrt(k / HALF_TURNS)
    y += (k % 2 === 1 ? 1 : -1) * 2 * r
    spiral += `A${r} ${r} 0 0 ${sense > 0 ? 1 : 0} ${CX} ${y}`
  }
  const exitLength = 26 + 34 * Math.min(1, result.maxSpeed / LIGHT_SPEED)
  const fieldSpacing = clamp(36 - 12 * Math.log10(1 + 9 * (Number.isFinite(result.field) ? result.field : 0)), 12, 36)
  const sourceY = CY + dee + 20
  const leadTop = CY + Math.sqrt(Math.max(0, dee * dee - 46 * 46))
  const barReal = niceFloor(span / 2)
  const lightFraction = result.maxSpeed / LIGHT_SPEED

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-cyclotron" viewBox="0 0 480 240" role="img" aria-label={`Ciclotrão visto de cima com dois D de raio ${sig(radius)} m e campo magnético de ${sig(result.field)} T a sair da página. A partícula ${sense > 0 ? 'positiva' : 'negativa'} descreve uma espiral ${sense > 0 ? 'no sentido horário' : 'no sentido anti-horário'} e sai a ${sig(result.maxSpeed, 4)} m/s`}>
      <defs>
        <FieldPattern id="cyclotron-field" out spacing={fieldSpacing} />
        <ArrowHeads prefix="cyclotron" tones={['v', 'e']} />
      </defs>
      {[-1, 1].map((sideOfGap) => {
        const x = CX + sideOfGap * GAP
        const shape = `M${x} ${CY - half}A${dee} ${dee} 0 0 ${sideOfGap > 0 ? 1 : 0} ${x} ${CY + half}Z`
        return <g key={sideOfGap}>
          <path className="lab-magnetism-dee" d={shape} />
          <path className="lab-magnetism-region-fill" d={shape} fill="url(#cyclotron-field)" />
        </g>
      })}
      <path className="lab-magnetism-path thin lab-magnetism-cyclotron-spiral" d={spiral} />
      <Arrow prefix="cyclotron" tone="v" className="lab-magnetism-cyclotron-exit" from={[CX, y]} to={[CX + sense * exitLength, y]} label="v final" />
      <circle className={`lab-magnetism-particle ${sense < 0 ? 'negative' : 'positive'}`} cx={CX} cy={CY - 0.2 * outer} r="4" />

      <line className="lab-magnetism-arrow lab-magnetism-tone-e" x1={CX - 14} y1={CY - dee - 7} x2={CX + 14} y2={CY - dee - 7} markerStart="url(#cyclotron-head-e)" markerEnd="url(#cyclotron-head-e)" />
      <text className="lab-magnetism-label lab-magnetism-tone-e" x={CX - sense * 20} y={CY - dee - 3} textAnchor={sense > 0 ? 'end' : 'start'}>E alternado na fenda</text>
      <text className="lab-magnetism-label lab-magnetism-tone-b" x="28" y="30">B ⊙</text>
      <text x={CX - dee * 0.62 - 12} y={CY + dee * 0.86 + 4} textAnchor="end">D₁</text>
      <text x={CX + dee * 0.62 + 12} y={CY + dee * 0.86 + 4}>D₂</text>

      <path className="lab-magnetism-dim" d={`M${CX - dee - 12} ${CY}V${CY - dee}M${CX - dee - 17} ${CY}h10M${CX - dee - 17} ${CY - dee}h10`} />
      <text className="lab-magnetism-strong" x={CX - dee - 20} y={CY - dee / 2 + 4} textAnchor="end">R = {sig(radius)} m</text>

      <path className="lab-magnetism-lead" d={`M${CX - 9} ${sourceY}H${CX - 46}V${leadTop}M${CX + 9} ${sourceY}H${CX + 46}V${leadTop}`} />
      <circle className="lab-magnetism-source" cx={CX} cy={sourceY} r="9" />
      <text className="lab-magnetism-strong" x={CX} y={sourceY + 4} textAnchor="middle">~</text>
      <text x={CX + 54} y={sourceY + 4}>f = {sig(frequency)} MHz</text>
      <ScaleBar x={30} y={206} length={barReal * pxPerMetre} label={`${sig(barReal)} m`} />
    </svg>

    <ResultStrip label="Campo magnético necessário" value={`${sig(result.field)} T`} formula="f=\dfrac{|q|B}{2\pi m}\;\Rightarrow\;B=\dfrac{2\pi m f}{|q|}" secondary="condição de sincronismo: a frequência não depende da velocidade nem do raio" />
    <Metrics items={[
      { label: 'Velocidade final 2πfR', value: `${sig(result.maxSpeed, 4)} m/s` },
      { label: 'Energia cinética final', value: `${sig(result.kineticEnergy)} J` },
      { label: 'Energia em MeV', value: `${sig(result.kineticEnergyMeV)} MeV` },
      { label: 'Período T = 1/f', value: `${sig(result.period)} s` },
    ]} />

    <Control label="Frequência f" value={frequency} min={frequencyRange.min} max={frequencyRange.max} step={0.5} onChange={setFrequency} unit="MHz" />
    <Control label="Raio do D" value={radius} min={radiusRange.min} max={radiusRange.max} step={0.01} onChange={setRadius} unit="m" />
    <div className="lab-magnetism-fields">
      <NumberField label="Massa m" value={mass} onChange={(value) => setMass(Math.abs(value))} unit="kg" />
      <NumberField label="Carga q (com sinal)" value={charge} onChange={setCharge} unit="C" />
    </div>
    <LabNote title="Leitura do diagrama:">em cada passagem pela fenda a partícula ganha a mesma energia, logo o raio cresce com √(n.º de passagens) e as voltas ficam cada vez mais juntas. A velocidade final só depende de f e do raio do D: v = 2πfR. {lightFraction >= 1 ? 'Com estes valores v ultrapassaria c — o modelo clássico deixa de ter sentido.' : `Aqui v ≈ ${sig(lightFraction * 100, 2)} % de c${lightFraction > 0.3 ? ', já fora do domínio em que o cálculo clássico é fiável' : ''}.`} O número de voltas desenhado é ilustrativo e a densidade de pontos acompanha B.</LabNote>
  </>
}
