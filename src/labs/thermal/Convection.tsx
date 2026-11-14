import { useState, type CSSProperties } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, compact, positive, sci, watts, widen } from './format'
import { ArrowMarker } from './parts'
import { JOULE_PER_CAL, convection } from './physics'

const SURFACE_TOP = 176
const PLUME_TOP = 100
const FLUX_PER_ARROW = 30 // W/m²
const MAX_ARROWS = 14

export function Convection({ params }: LabProps) {
  const initialH = positive(numberParam(params, 'h', 7.12), 7.12)
  const initialArea = positive(numberParam(params, 'A', 1.5), 1.5)
  const initialSurface = numberParam(params, 'Ts', 30)
  const initialFluid = numberParam(params, 'Tinf', 0)
  const [h, setH] = useState(initialH)
  const [area, setArea] = useState(initialArea)
  const [surface, setSurface] = useState(initialSurface)
  const [fluid, setFluid] = useState(initialFluid)

  const result = convection(h, area, surface, fluid)
  const losing = result.flow >= 0
  const count = result.flux === 0 ? 0 : clamp(Math.round(Math.abs(result.flux) / FLUX_PER_ARROW), 1, MAX_ARROWS)
  const width = clamp(110 + 86 * area, 120, 400)
  const left = 240 - width / 2
  const warmth = Math.round(clamp(Math.abs(surface - fluid) / 60, 0, 1) * 60 + 15)
  const plumes = Array.from({ length: count }, (_unused, index) => left + ((index + 0.5) * width) / count)
  const side = losing ? 'hot' : 'cold'
  const kcal = Math.abs(result.flowKcal)

  const label = `Superfície de ${compact(area)} m² a ${compact(surface)} °C num fluido a ${compact(fluid)} °C: ${losing ? 'perde' : 'recebe'} ${watts(Math.abs(result.flow))} por convecção, representados por ${count} ${count === 1 ? 'seta' : 'setas'} de calor.`

  return <>
    <svg className="lab-thermal-stage lab-thermal-convection" viewBox="0 0 480 240" role="img" aria-label={label}>
      <defs>
        <ArrowMarker id="convection-heat-head" className={`lab-thermal-head-${side}`} />
        <ArrowMarker id="convection-stream-head" className="lab-thermal-head-stream" />
      </defs>
      <text className="lab-thermal-tag cold" x="14" y="18">fluido · T∞ = {compact(fluid)} °C</text>
      <text className={`lab-thermal-tag ${side}`} x="466" y="18" textAnchor="end">{losing ? 'perde' : 'recebe'} Q̇ = {watts(Math.abs(result.flow))}</text>
      {[36, 58, 80].map((y) => <path key={y} className="lab-thermal-stream" d={`M14 ${y}q28 -8 56 0t56 0t56 0t56 0t56 0t56 0t56 0t56 0`} markerEnd="url(#convection-stream-head)" />)}
      {plumes.map((x, index) => <path key={index} className={`lab-thermal-plume ${side}`} d={losing ? `M${x.toFixed(1)} ${SURFACE_TOP - 4}q7 -12 0 -24t0 -24t0 -24` : `M${x.toFixed(1)} ${PLUME_TOP}q7 12 0 24t0 24t0 24`} markerEnd="url(#convection-heat-head)" />)}
      <rect className={`lab-thermal-surface ${side}`} x={left.toFixed(1)} y={SURFACE_TOP} width={width.toFixed(1)} height="24" rx="3" style={{ '--warmth': `${warmth}%` } as CSSProperties} />
      <text className="lab-thermal-name" x="240" y={SURFACE_TOP + 16} textAnchor="middle">Tₛ = {compact(surface)} °C</text>
      <text x="240" y={SURFACE_TOP + 40} textAnchor="middle">A = {compact(area)} m² · h = {compact(h)} W/(m²·K)</text>
      <text x="240" y="236" textAnchor="middle">1 seta ≈ {FLUX_PER_ARROW} W/m² (satura em {MAX_ARROWS} setas)</text>
    </svg>
    <ResultStrip label={losing ? 'Calor perdido por convecção' : 'Calor recebido por convecção'} value={watts(Math.abs(result.flow))} formula="\dot Q=hA\,(T_s-T_\infty)" secondary={`= ${kcal >= 0.1 && kcal < 1e4 ? compact(kcal) : sci(kcal)} kcal/s`} />
    <Metrics items={[
      { label: 'Resistência convectiva', value: `${sig(result.resistance)} K/W` },
      { label: 'Fluxo por m²', value: `${compact(Math.abs(result.flux))} W/m²` },
      { label: 'Energia numa hora', value: `${sig(Math.abs(result.energyHour))} J = ${compact(Math.abs(result.energyHour) / (JOULE_PER_CAL * 1000))} kcal` },
      { label: 'Coeficiente em kcal', value: `${sig(h / (JOULE_PER_CAL * 1000))} kcal/(s·m²·K)` },
    ]} />
    <Control label="Coeficiente de convecção h" value={h} {...widen(initialH, 1, 100, 0.01)} onChange={setH} unit="W/(m²·K)" />
    <Control label="Área A" value={area} {...widen(initialArea, 0.1, 5, 0.05)} onChange={setArea} unit="m²" />
    <Control label="Temperatura da superfície" value={surface} {...widen(initialSurface, -20, 120, 0.5)} onChange={setSurface} unit="°C" />
    <Control label="Temperatura do fluido" value={fluid} {...widen(initialFluid, -30, 60, 0.5)} onChange={setFluid} unit="°C" />
    <LabNote title="Leitura do diagrama.">A convecção é proporcional à diferença de temperatura (e não a T⁴, como a radiação): duplicar ΔT, h ou A duplica o calor trocado. Se o fluido estiver mais quente do que a superfície, as setas invertem-se. 1 kcal = 4186 J, por isso h = 1,7×10⁻³ kcal/(s·m²·K) equivale a 7,12 W/(m²·K).</LabNote>
  </>
}
