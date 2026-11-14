import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, compact, length, positive, widen } from './format'
import { expansion } from './physics'

/** Coeficientes de dilatação linear da tabela do exercício 2 (×10⁻⁶ /°C). */
const MATERIALS: ReadonlyArray<readonly [number, string]> = [
  [51, 'gelo'], [29, 'chumbo'], [23, 'alumínio'], [19, 'latão'], [17, 'cobre'],
  [11, 'aço'], [9, 'vidro'], [3.2, 'pyrex'], [1.3, 'diamante'], [0.5, 'quartzo'],
]
const EXAGGERATION = 200
const BAR_X = 40
const BAR_LENGTH = 220
const CUBE_X = 50
const CUBE_BASE = 226
const CUBE_SIDE = 56

function percent(value: number): string {
  return `${value > 0 ? '+' : ''}${sig(value * 100)} %`
}

function cubePath(side: number): string {
  const depth = side * 0.3
  const top = CUBE_BASE - side
  return `M${CUBE_X} ${CUBE_BASE}h${side.toFixed(1)}v${(-side).toFixed(1)}h${(-side).toFixed(1)}zM${CUBE_X} ${top.toFixed(1)}l${depth.toFixed(1)} ${(-depth).toFixed(1)}h${side.toFixed(1)}l${(-depth).toFixed(1)} ${depth.toFixed(1)}M${(CUBE_X + side + depth).toFixed(1)} ${(top - depth).toFixed(1)}v${side.toFixed(1)}l${(-depth).toFixed(1)} ${depth.toFixed(1)}`
}

export function Expansion({ params }: LabProps) {
  const initialAlpha = positive(numberParam(params, 'alpha', 12.7), 12.7)
  const initialDelta = numberParam(params, 'dT', 40)
  const [initialLength, setInitialLength] = useState(() => positive(numberParam(params, 'L0', 2000), 2000))
  const [alpha, setAlpha] = useState(initialAlpha)
  const [delta, setDelta] = useState(initialDelta)

  const result = expansion(initialLength, alpha * 1e-6, delta)
  const visual = clamp(result.strain * EXAGGERATION, -0.5, 0.6)
  const saturated = Math.abs(result.strain * EXAGGERATION) > Math.abs(visual)
  const barEnd = BAR_X + BAR_LENGTH * (1 + visual)
  const originalEnd = BAR_X + BAR_LENGTH
  const closest = MATERIALS.reduce((best, material) => (Math.abs(material[0] - alpha) < Math.abs(best[0] - alpha) ? material : best))
  const verb = result.strain > 0 ? 'dilata' : result.strain < 0 ? 'contrai' : 'não varia'

  const label = `Barra de ${compact(initialLength)} m com α = ${compact(alpha)}×10⁻⁶ por kelvin e ΔT = ${compact(delta)} K: ${verb} ${length(Math.abs(result.deltaLength))}. O desenho exagera a variação ${EXAGGERATION} vezes.`

  return <>
    <svg className="lab-thermal-stage lab-thermal-expansion" viewBox="0 0 480 240" role="img" aria-label={label}>
      <text x={BAR_X} y="14">antes (tracejado) e depois · variação exagerada {EXAGGERATION}×{saturated ? ' (saturada)' : ''}</text>
      <rect className={`lab-thermal-bar after${result.strain < 0 ? ' cool' : ''}`} x={BAR_X} y="58" width={(barEnd - BAR_X).toFixed(1)} height="22" />
      <rect className="lab-thermal-bar before" x={BAR_X} y="26" width={BAR_LENGTH} height="22" />
      <text className="lab-thermal-name" x={BAR_X + 6} y="41">L₀ = {compact(initialLength, 4)} m</text>
      <text className="lab-thermal-name" x={BAR_X + 6} y="73">L₀ + ΔL</text>
      <line className="lab-thermal-guide" x1={originalEnd} y1="22" x2={originalEnd} y2="96" />
      <path className="lab-thermal-dimension" d={`M${originalEnd} 90H${barEnd.toFixed(1)}M${originalEnd} 85v10M${barEnd.toFixed(1)} 85v10`} />
      <text className="lab-thermal-value" x={Math.max(originalEnd, barEnd) + 6} y="94">ΔL = {length(result.deltaLength)}</text>
      <path className={`lab-thermal-cube after${result.strain < 0 ? ' cool' : ''}`} d={cubePath(CUBE_SIDE * (1 + visual))} />
      <path className="lab-thermal-cube before" d={cubePath(CUBE_SIDE)} />
      <text className="lab-thermal-value" x="200" y="150">ΔV/V ≈ 3αΔT = {percent(result.volumeStrain)}</text>
      <text className="lab-thermal-value" x="200" y="172">Δρ/ρ ≈ −3αΔT = {percent(result.densityChange)}</text>
      <text x="200" y="194">em %, o volume varia 3× o comprimento</text>
      <text x="200" y="216">a massa não muda: ρ {result.strain > 0 ? 'diminui' : result.strain < 0 ? 'aumenta' : 'mantém-se'}</text>
    </svg>
    <ResultStrip label="Variação de comprimento" value={length(result.deltaLength)} formula="\Delta L=\alpha L_0\,\Delta T" secondary={`L = ${compact(initialLength + result.deltaLength, 7)} m`} />
    <Metrics items={[
      { label: 'Comprimento ΔL/L', value: percent(result.strain) },
      { label: 'Volume ΔV/V', value: percent(result.volumeStrain) },
      { label: 'Massa específica', value: percent(result.densityChange) },
      { label: 'Material mais próximo', value: `${closest[1]} (${compact(closest[0])})` },
    ]} />
    <div className="lab-thermal-materials"><Choice label="Material (α em 10⁻⁶ /°C)" value={alpha} onChange={setAlpha} options={MATERIALS.map(([value, name]) => [value, `${name} ${compact(value)}`] as const)} /></div>
    <Control label="Coeficiente linear α" value={alpha} {...widen(initialAlpha, 0.5, 60, 0.1)} onChange={setAlpha} unit="×10⁻⁶ K⁻¹" />
    <Control label="Variação de temperatura ΔT" value={delta} {...widen(initialDelta, -100, 200, 1)} onChange={setDelta} unit="K" />
    <div className="lab-thermal-fields">
      <NumberField label="Comprimento inicial L₀" value={initialLength} unit="m" onChange={(value) => { if (value > 0) setInitialLength(value) }} />
    </div>
    <LabNote title="Leitura do diagrama.">Num material isotrópico cada dimensão cresce αΔT, por isso a área cresce 2αΔT e o volume 3αΔT. A massa mantém-se, logo a massa específica varia −3αΔT. No exercício 2, ΔL/L = 0,23 % em 100 °C dá α = 23×10⁻⁶ /°C (alumínio) e Δρ/ρ = −0,69 %.</LabNote>
  </>
}
