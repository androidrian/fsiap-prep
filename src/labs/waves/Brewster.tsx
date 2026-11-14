import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, type LabProps } from '../ui'
import { brewsterAngle, brewsterGeometry } from './physics'
import { AngleArc, ArrowHead, Ray, clamp, degrees, fmt, mediumOpacity, polar, px, type Point } from './svg'

const ORIGIN: Point = [240, 120]
const RAY = 104

/**
 * Marcas de polarização ao longo de um raio: pontos (campo perpendicular à página) e setas duplas
 * (campo paralelo à página). `parallel` (0–1) reduz as setas duplas quando essa componente enfraquece.
 * `from` é sempre o ponto de incidência, para as marcas ficarem fora dos arcos dos ângulos.
 */
function PolarisationMarks({ from, to, parallel }: { from: Point; to: Point; parallel: number }) {
  const dx = to[0] - from[0]; const dy = to[1] - from[1]
  const length = Math.hypot(dx, dy) || 1
  const nx = -dy / length; const ny = dx / length
  const at = (fraction: number): Point => [from[0] + dx * fraction, from[1] + dy * fraction]
  const half = 9 * clamp(parallel, 0, 1)
  return <g className="lab-waves-polarisation">
    {[0.38, 0.7].map((fraction) => { const [x, y] = at(fraction); return <circle key={fraction} className="lab-waves-pol-dot" cx={px(x)} cy={px(y)} r="3.2" /> })}
    {half >= 1 && [0.54, 0.85].map((fraction) => { const [x, y] = at(fraction); return <line key={fraction} className="lab-waves-pol-arrow" x1={px(x - nx * half)} y1={px(y - ny * half)} x2={px(x + nx * half)} y2={px(y + ny * half)} markerStart={half >= 4 ? 'url(#waves-brewster-pol)' : undefined} markerEnd={half >= 4 ? 'url(#waves-brewster-pol)' : undefined} /> })}
  </g>
}

export function Brewster({ params }: LabProps) {
  const [n1, setN1] = useState(clamp(numberParam(params, 'n1', 1), 1, 4))
  const [n2, setN2] = useState(clamp(numberParam(params, 'n2', 1.5), 1, 4))
  const [angle, setAngle] = useState(() => brewsterAngle(clamp(numberParam(params, 'n1', 1), 1, 4), clamp(numberParam(params, 'n2', 1.5), 1, 4)))
  const geometry = brewsterGeometry(angle, n1, n2)
  const atBrewster = Math.abs(angle - geometry.brewster) < 0.06
  const [ox, oy] = ORIGIN

  const incidentStart = polar(ox, oy, RAY, -90 - angle)
  const reflectedEnd = polar(ox, oy, RAY, -90 + angle)
  const refractedEnd = geometry.refracted === null ? null : polar(ox, oy, RAY, 90 - geometry.refracted)
  const { perpendicular, parallel } = geometry.reflectance
  const reflectedParallel = atBrewster || perpendicular <= 0 ? 0 : Math.sqrt(parallel / perpendicular)
  const betweenFrom = -90 + angle
  const betweenTo = geometry.refracted === null ? betweenFrom : 90 - geometry.refracted
  const [labelX, rawLabelY] = polar(ox, oy, atBrewster ? 46 : 70, (betweenFrom + betweenTo) / 2)
  const labelY = Math.abs(rawLabelY - oy) < 12 ? oy + (rawLabelY >= oy ? 12 : -12) : rawLabelY
  const corner = (first: number, second: number) => { const [ax, ay] = polar(0, 0, 14, first); const [bx, by] = polar(0, 0, 14, second); return `M${px(ox + ax)} ${px(oy + ay)}L${px(ox + ax + bx)} ${px(oy + ay + by)}L${px(ox + bx)} ${px(oy + by)}` }
  const percent = (value: number) => `${fmt(value * 100, 1)} %`

  return <>
    <svg className="lab-waves-stage lab-waves-brewster" viewBox="0 0 480 240" role="img" aria-label={`Raio a incidir a ${degrees(angle)} numa interface entre índices ${fmt(n1, 2)} e ${fmt(n2, 2)}; ângulo de Brewster ${degrees(geometry.brewster)}${geometry.refracted === null ? '; reflexão total' : `; raio refratado a ${degrees(geometry.refracted)}`}${atBrewster ? '; raio refletido totalmente polarizado' : ''}`}>
      <defs><ArrowHead id="waves-brewster-ray" tone="ray" /><ArrowHead id="waves-brewster-pol" tone="e" size={5} /></defs>
      <rect className="lab-waves-medium" x="0" y="0" width="480" height="120" fillOpacity={mediumOpacity(n1)} />
      <rect className="lab-waves-medium" x="0" y="120" width="480" height="120" fillOpacity={mediumOpacity(n2)} />
      <line className="lab-waves-interface" x1="0" y1="120" x2="480" y2="120" />
      <line className="lab-waves-normal" x1="240" y1="8" x2="240" y2="232" />
      <Ray className="incident" from={incidentStart} to={ORIGIN} marker="waves-brewster-ray" arrowAt={0.9} />
      <Ray className="reflected" from={ORIGIN} to={reflectedEnd} marker="waves-brewster-ray" arrowAt={0.97} />
      {refractedEnd && <Ray className="refracted" from={ORIGIN} to={refractedEnd} marker="waves-brewster-ray" arrowAt={0.97} />}
      <PolarisationMarks from={ORIGIN} to={incidentStart} parallel={1} />
      <g className="lab-waves-reflected-marks"><PolarisationMarks from={ORIGIN} to={reflectedEnd} parallel={reflectedParallel} /></g>
      {refractedEnd && <PolarisationMarks from={ORIGIN} to={refractedEnd} parallel={1} />}
      <AngleArc cx={ox} cy={oy} radius={28} from={-90} to={-90 - angle} label="θ₁" />
      <AngleArc cx={ox} cy={oy} radius={28} from={-90} to={-90 + angle} label="θ₁" />
      {geometry.refracted !== null && <AngleArc cx={ox} cy={oy} radius={34} from={90} to={90 - geometry.refracted} label="θ₂" labelAt={geometry.refracted < 30 ? polar(ox, oy, 47, 106) : undefined} />}
      {geometry.between !== null && (atBrewster
        ? <path className="lab-waves-right-angle" d={corner(betweenFrom, betweenTo)} />
        : <path className="lab-waves-arc between" d={`M${polar(ox, oy, 48, betweenFrom).map(px).join(' ')}A48 48 0 0 1 ${polar(ox, oy, 48, betweenTo).map(px).join(' ')}`} />)}
      {geometry.between !== null && <text className="lab-waves-strong" x={px(labelX)} y={px(labelY)} dy=".35em" textAnchor="middle">{degrees(geometry.between)}</text>}
      {geometry.refracted === null && <text className="lab-waves-strong" x="256" y="200">reflexão total: não há raio refratado</text>}
      <text x="14" y="20">n₁ = {fmt(n1, 2)}</text>
      <text x="14" y="228">n₂ = {fmt(n2, 2)}</text>
      <circle className="lab-waves-pol-dot" cx="346" cy="14" r="3.2" /><text x="356" y="18">⟂ à página</text>
      <line className="lab-waves-pol-arrow" x1="337" y1="30" x2="351" y2="30" markerStart="url(#waves-brewster-pol)" markerEnd="url(#waves-brewster-pol)" /><text x="356" y="34">∥ à página</text>
    </svg>
    <ResultStrip label="Ângulo de Brewster" value={degrees(geometry.brewster)} formula="\\tan\\theta_B=\\dfrac{n_2}{n_1}" secondary={atBrewster ? 'θ₁ = θ_B · luz refletida totalmente polarizada (só ●)' : `θ₁ = ${degrees(angle)} · luz refletida parcialmente polarizada`} />
    <Metrics items={[
      { label: 'Ângulo refratado', value: geometry.refracted === null ? 'reflexão total' : degrees(geometry.refracted) },
      { label: 'Incidente + refratado', value: degrees(geometry.sum) },
      { label: 'Entre refletido e refratado', value: degrees(geometry.between) },
      { label: 'Refletância ⟂ / ∥', value: `${percent(perpendicular)} / ${percent(parallel)}` },
    ]} />
    <div className="source-kind"><span>Condição de Brewster</span><div><button type="button" className={atBrewster ? 'active' : ''} onClick={() => setAngle(brewsterAngle(n1, n2))}>Ir para θ_B</button></div></div>
    <Control label="Ângulo de incidência θ₁" value={angle} min={0} max={89} step={0.1} onChange={setAngle} unit="°" />
    <Control label="Índice n₁ (incidência)" value={n1} min={1} max={2.5} step={0.01} onChange={setN1} unit="" />
    <Control label="Índice n₂ (transmissão)" value={n2} min={1} max={2.5} step={0.01} onChange={setN2} unit="" />
    <LabNote title="Leitura:">a luz natural tem as duas componentes (● perpendicular à página, ↔ paralela). Em θ_B o raio refletido e o refratado fazem 90°: a componente paralela não é refletida e o raio refletido fica só com ●. Como θ₁ + θ₂ = 90°, sin θ₂ = cos θ_B e a lei de Snell dá tan θ_B = n₂/n₁. As setas duplas do raio refletido encolhem à medida que te aproximas de θ_B.</LabNote>
  </>
}
