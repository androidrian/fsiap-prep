import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { LIGHT_SPEED, criticalAngle, lightInMedium, snellAngle } from './physics'
import { AngleArc, ArrowHead, Ray, clamp, degrees, fmt, formatLength, mediumOpacity, polar, px, type Point } from './svg'

const ORIGIN: Point = [240, 120]
const RAY = 100

/** Refração numa interface plana. `mode` escolhe o destaque: lei de Snell ou ângulo crítico. */
function Refraction({ params, mode }: LabProps & { mode: 'snell' | 'critical' }) {
  const critical = mode === 'critical'
  const [angle, setAngle] = useState(clamp(numberParam(params, 'angle', 40), 0, 89))
  const [n1, setN1] = useState(clamp(numberParam(params, 'n1', critical ? 1.34 : 1), 1, 4))
  const [n2, setN2] = useState(clamp(numberParam(params, 'n2', critical ? 1 : 1.5), 1, 4))
  const [vacuumWavelength, setVacuumWavelength] = useState(633)
  const refracted = snellAngle(angle, n1, n2)
  const limit = criticalAngle(n1, n2)
  const total = refracted === null
  const first = lightInMedium(vacuumWavelength * 1e-9, n1)
  const second = lightInMedium(vacuumWavelength * 1e-9, n2)
  const [ox, oy] = ORIGIN
  const incidentStart = polar(ox, oy, RAY, -90 - angle)
  const reflectedEnd = polar(ox, oy, RAY, -90 + angle)
  const refractedEnd = refracted === null ? null : polar(ox, oy, RAY, 90 - refracted)
  const criticalStart = limit === null ? null : polar(ox, oy, RAY + 8, -90 - limit)
  const criticalLabel = limit === null ? null : polar(ox, oy, RAY + 20, -90 - limit)
  const outcome = total ? 'reflexão total' : limit !== null && Math.abs(angle - limit) < 0.05 ? 'raio rasante' : 'há transmissão'

  return <>
    <svg className={`lab-waves-stage lab-waves-refraction ${mode}`} viewBox="0 0 480 240" role="img" aria-label={`Raio a incidir a ${degrees(angle)} da normal, de um meio de índice ${fmt(n1, 2)} para um meio de índice ${fmt(n2, 2)}; ${total ? 'reflexão total interna' : `raio refratado a ${degrees(refracted)}`}${limit === null ? '' : `; ângulo crítico ${degrees(limit)}`}`}>
      <defs><ArrowHead id={`waves-${mode}-ray`} tone="ray" /></defs>
      <rect className="lab-waves-medium" x="0" y="0" width="480" height="120" fillOpacity={mediumOpacity(n1)} />
      <rect className="lab-waves-medium" x="0" y="120" width="480" height="120" fillOpacity={mediumOpacity(n2)} />
      <line className="lab-waves-interface" x1="0" y1="120" x2="480" y2="120" />
      <line className="lab-waves-normal" x1="240" y1="8" x2="240" y2="232" />
      {critical && criticalStart && criticalLabel && <>
        <line className="lab-waves-guide" x1={px(criticalStart[0])} y1={px(criticalStart[1])} x2={ox} y2={oy} />
        <text className="lab-waves-guide-label" x={px(criticalLabel[0])} y={px(Math.max(12, criticalLabel[1]))} dy=".35em" textAnchor="middle">θc</text>
      </>}
      <Ray className="incident" from={incidentStart} to={ORIGIN} marker={`waves-${mode}-ray`} />
      <Ray className={`reflected${total ? '' : ' weak'}`} from={ORIGIN} to={reflectedEnd} marker={`waves-${mode}-ray`} />
      {refractedEnd && <Ray className="refracted" from={ORIGIN} to={refractedEnd} marker={`waves-${mode}-ray`} />}
      <AngleArc cx={ox} cy={oy} radius={30} from={-90} to={-90 - angle} label="θ₁" />
      {refracted !== null && <AngleArc cx={ox} cy={oy} radius={36} from={90} to={90 - refracted} label="θ₂" />}
      {total && <AngleArc cx={ox} cy={oy} radius={30} from={-90} to={-90 + angle} label="θ₁" />}
      <circle className="lab-waves-point" cx={ox} cy={oy} r="3" />
      <text className="lab-waves-strong" x="14" y="20">n₁ = {fmt(n1, 2)}</text>
      <text x="14" y="34">v₁ = {sig(first.speed)} m/s</text>
      {critical && <text x="14" y="48">λ₁ = {formatLength(first.wavelength)}</text>}
      <text className="lab-waves-strong" x="14" y={critical ? 200 : 214}>n₂ = {fmt(n2, 2)}</text>
      <text x="14" y={critical ? 214 : 228}>v₂ = {sig(second.speed)} m/s</text>
      {critical && <text x="14" y="228">λ₂ = {formatLength(second.wavelength)}</text>}
      <text className="lab-waves-strong" x="466" y="20" textAnchor="end">{limit === null ? 'sem ângulo crítico (n₁ ≤ n₂)' : `θc = ${degrees(limit)}`}</text>
      {total && <text className="lab-waves-strong" x="466" y="214" textAnchor="end">reflexão total interna</text>}
    </svg>
    {critical
      ? <ResultStrip label="Ângulo crítico" value={limit === null ? 'não existe' : degrees(limit)} formula="\\sin\\theta_c=\\dfrac{n_2}{n_1}" secondary={limit === null ? 'só há reflexão total quando n₁ > n₂' : `θ₁ = ${degrees(angle)} · ${outcome}${refracted === null ? '' : ` (θ₂ = ${degrees(refracted)})`}`} />
      : <ResultStrip label={total ? 'Reflexão total interna' : 'Ângulo refratado'} value={total ? 'θ₁ > θc' : degrees(refracted)} formula="n_1\\sin\\theta_1=n_2\\sin\\theta_2" secondary={limit === null ? 'n₁ ≤ n₂: o raio aproxima-se da normal' : `θc = ${degrees(limit)} · ${outcome}`} />}
    {critical
      ? <Metrics items={[
        { label: 'C. de onda no meio 1', value: formatLength(first.wavelength) },
        { label: 'C. de onda no meio 2', value: formatLength(second.wavelength) },
        { label: 'Velocidade no meio 1', value: `${sig(first.speed)} m/s` },
        { label: 'Velocidade no meio 2', value: `${sig(second.speed)} m/s` },
      ]} />
      : <Metrics items={[
        { label: 'Ângulo crítico', value: limit === null ? 'não existe' : degrees(limit) },
        { label: 'Desvio do raio', value: refracted === null ? '—' : degrees(Math.abs(angle - refracted)) },
        { label: 'Velocidade no meio 1', value: `${sig(LIGHT_SPEED / n1)} m/s` },
        { label: 'Velocidade no meio 2', value: `${sig(LIGHT_SPEED / n2)} m/s` },
      ]} />}
    <Control label="Ângulo medido à normal" value={angle} min={0} max={89} step={0.5} onChange={setAngle} unit="°" />
    <Control label="Índice n₁" value={n1} min={1} max={2.5} step={0.01} onChange={setN1} unit="" />
    <Control label="Índice n₂" value={n2} min={1} max={2.5} step={0.01} onChange={setN2} unit="" />
    {critical && <Control label="Comprimento de onda no vazio λ₀" value={vacuumWavelength} min={380} max={750} step={1} onChange={setVacuumWavelength} unit="nm" />}
    {critical
      ? <LabNote title="Leitura:">só existe ângulo crítico quando a luz vai do meio mais refringente para o menos refringente (n₁ &gt; n₂). Acima de θc não há raio refratado. A frequência f = c/λ₀ = {sig(first.frequency)} Hz é a mesma nos dois meios; o que muda é a velocidade e o comprimento de onda (ambos divididos por n).</LabNote>
      : <LabNote title="Armadilha:">os ângulos medem-se sempre à normal (linha a tracejado), não à superfície. Ao entrar num meio com maior índice o raio aproxima-se da normal; ao sair, afasta-se, até deixar de haver raio refratado.</LabNote>}
  </>
}

export function Snell({ params }: LabProps) {
  return <Refraction params={params} mode="snell" />
}

export function Critical({ params }: LabProps) {
  return <Refraction params={params} mode="critical" />
}
