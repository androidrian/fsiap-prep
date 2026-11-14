import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { blockRay } from './physics'
import { AngleArc, ArrowHead, Ray, clamp, degrees, fmt, formatLength, mediumOpacity, polar, positive, px, type Point } from './svg'

const WALL_X = 150
const TOP_Y = 56
const BOTTOM_Y = 232
const RIGHT_X = 440
const RAD = Math.PI / 180

/** Comprimento «redondo» (1, 2 ou 5 × 10ᵏ cm) que ocupa cerca de 50 px à escala dada. */
function scaleUnit(pixelsPerCm: number) {
  const raw = 50 / pixelsPerCm
  const exponent = Math.floor(Math.log10(raw))
  const mantissa = raw / 10 ** exponent
  return (mantissa >= 5 ? 5 : mantissa >= 2 ? 2 : 1) * 10 ** exponent
}

export function Block({ params }: LabProps) {
  const [theta1, setTheta1] = useState(clamp(numberParam(params, 'theta1', 45), 1, 89))
  const [index, setIndex] = useState(clamp(numberParam(params, 'n', 1.54), 1, 4))
  const [outside, setOutside] = useState(clamp(numberParam(params, 'nout', 1.41), 1, 4))
  const [distance, setDistance] = useState(positive(numberParam(params, 'L', 50), 50))
  const result = blockRay(theta1, index, outside, distance / 100)

  // Escala verdadeira: cabe sempre a distância L (até 185 px) e a profundidade do ponto B (até 85 px).
  const depthCm = result.depth * 100
  const scale = Math.min(185 / distance, 85 / depthCm)
  const entry: Point = [WALL_X + distance * scale, TOP_Y]
  const wall: Point = [WALL_X, TOP_Y + depthCm * scale]
  const mirror: Point = [entry[0], TOP_Y + 2 * depthCm * scale]
  const refractedRad = result.refracted * RAD
  const incidentStart = polar(entry[0], entry[1], Math.min(60, 46 / Math.cos(theta1 * RAD)), -90 + theta1)
  const reflectedReach = Math.min((BOTTOM_Y - wall[1]) / Math.cos(refractedRad), (RIGHT_X - WALL_X) / Math.sin(refractedRad))
  const reflectedEnd: Point = [wall[0] + reflectedReach * Math.sin(refractedRad), wall[1] + reflectedReach * Math.cos(refractedRad)]
  const transmittedRad = (result.transmitted ?? 0) * RAD
  const transmittedReach = Math.min(86, (WALL_X - 28) / Math.max(Math.cos(transmittedRad), 0.05), (200 - wall[1]) / Math.max(Math.sin(transmittedRad), 0.05))
  const transmittedEnd: Point = [wall[0] - transmittedReach * Math.cos(transmittedRad), wall[1] + transmittedReach * Math.sin(transmittedRad)]
  const unit = scaleUnit(scale)
  const lengthPx = entry[0] - WALL_X

  return <>
    <svg className="lab-waves-stage lab-waves-block" viewBox="0 0 480 240" role="img" aria-label={`Raio a entrar pelo topo de um bloco de índice ${fmt(index, 2)} a ${degrees(theta1)} da normal, refratado a ${degrees(result.refracted)}; atinge a parede lateral a ${degrees(result.wallIncidence)} da normal, ${result.totalReflection ? 'onde sofre reflexão total' : `onde parte da luz sai para o meio exterior a ${degrees(result.transmitted)}`}`}>
      <defs><ArrowHead id="waves-block-ray" tone="ray" /></defs>
      <rect className="lab-waves-medium outside" x="20" y={TOP_Y} width={WALL_X - 20} height={BOTTOM_Y - TOP_Y} fillOpacity={mediumOpacity(outside)} />
      <rect className="lab-waves-medium block" x={WALL_X} y={TOP_Y} width={RIGHT_X - WALL_X} height={BOTTOM_Y - TOP_Y} fillOpacity={mediumOpacity(index)} />
      <path className="lab-waves-interface" d={`M${WALL_X} ${BOTTOM_Y}V${TOP_Y}H${RIGHT_X}V${BOTTOM_Y}`} />
      <line className="lab-waves-normal entry" x1={px(entry[0])} y1={TOP_Y - 48} x2={px(entry[0])} y2={px(mirror[1])} />
      <line className="lab-waves-normal wall" x1={WALL_X - 64} y1={px(wall[1])} x2={WALL_X + 64} y2={px(wall[1])} />
      <path className="lab-waves-dimension" d={`M${WALL_X} ${TOP_Y - 8}H${px(entry[0])}M${WALL_X} ${TOP_Y - 13}v10M${px(entry[0])} ${TOP_Y - 13}v10`} />
      {lengthPx >= 24 ? <text className="lab-waves-strong" x={px(WALL_X + lengthPx / 2)} y={TOP_Y - 13} textAnchor="middle">L</text> : <text className="lab-waves-strong" x={WALL_X - 6} y={TOP_Y - 5} textAnchor="end">L</text>}
      <Ray className="incident" from={incidentStart} to={entry} marker="waves-block-ray" />
      <Ray className="refracted" from={entry} to={wall} marker="waves-block-ray" />
      <Ray className={`reflected${result.totalReflection ? '' : ' weak'}`} from={wall} to={reflectedEnd} marker="waves-block-ray" arrowAt={0.35} />
      {!result.totalReflection && <Ray className="transmitted" from={wall} to={transmittedEnd} marker="waves-block-ray" arrowAt={0.7} />}
      <AngleArc cx={entry[0]} cy={entry[1]} radius={22} from={-90} to={-90 + theta1} label="θ₁" />
      <AngleArc cx={entry[0]} cy={entry[1]} radius={26} from={90} to={90 + result.refracted} label="θr" labelAt={result.refracted < 30 ? [entry[0] + 13, TOP_Y + 34] : undefined} />
      <AngleArc cx={wall[0]} cy={wall[1]} radius={24} from={0} to={-result.wallIncidence} label="θi" />
      <AngleArc cx={wall[0]} cy={wall[1]} radius={18} from={0} to={result.wallIncidence} />
      {result.transmitted !== null && <AngleArc cx={wall[0]} cy={wall[1]} radius={24} from={180} to={180 - result.transmitted} label="θt" />}
      <circle className="lab-waves-point" cx={px(entry[0])} cy={entry[1]} r="2.6" /><text className="lab-waves-strong" x={px(entry[0] + 6)} y={TOP_Y + 13}>A</text>
      <circle className="lab-waves-point" cx={wall[0]} cy={px(wall[1])} r="2.6" /><text className="lab-waves-strong" x={WALL_X - 8} y={px(wall[1] - 7)} textAnchor="end">B</text>
      <circle className="lab-waves-point" cx={px(mirror[0])} cy={px(mirror[1])} r="2.6" /><text className="lab-waves-strong" x={px(mirror[0] + 7)} y={px(mirror[1] - 6)}>C</text>
      <text x="24" y="12">θ₁ = {degrees(theta1)}</text>
      <text x="24" y="24">θr = {degrees(result.refracted)}</text>
      <text x="24" y="36">θi = {degrees(result.wallIncidence)}</text>
      <text className="lab-waves-strong" x="24" y="48">{result.transmitted === null ? 'reflexão total' : `θt = ${degrees(result.transmitted)}`}</text>
      <text x={RIGHT_X - 8} y={TOP_Y + 16} textAnchor="end">bloco n = {fmt(index, 2)}</text>
      <text x="26" y="226">exterior n = {fmt(outside, 2)}</text>
      <path className="lab-waves-dimension" d={`M${px(470 - unit * scale)} 20H470M${px(470 - unit * scale)} 16v8M470 16v8`} />
      <text x="470" y="12" textAnchor="end">{formatLength(unit / 100)}</text>
    </svg>
    <ResultStrip label="Índice mínimo para reflexão total em B" value={fmt(result.minIndex, 2)} formula="n_{min}=\\sqrt{n_{out}^2+\\sin^2\\theta_1}" secondary={result.totalReflection ? `n = ${fmt(index, 2)} ≥ n_min · reflexão total na parede` : `n = ${fmt(index, 2)} < n_min · parte da luz sai pela parede`} />
    <Metrics items={[
      { label: 'Refração no topo', value: degrees(result.refracted) },
      { label: 'Incidência na parede', value: degrees(result.wallIncidence) },
      { label: 'Ângulo crítico da parede', value: result.criticalAngle === null ? 'não existe' : degrees(result.criticalAngle) },
      { label: 'Transmitido (à normal)', value: result.transmitted === null ? 'reflexão total' : degrees(result.transmitted) },
    ]} />
    <Metrics items={[
      { label: 'Percurso A→B', value: formatLength(result.pathLength) },
      { label: 'Tempo A→B', value: `${sig(result.travelTime)} s` },
      { label: 'Tempo A→B→C (com a reflexão)', value: `${sig(2 * result.travelTime)} s` },
    ]} />
    <Control label="Ângulo de incidência θ₁" value={theta1} min={5} max={85} step={0.5} onChange={setTheta1} unit="°" />
    <Control label="Índice do bloco n" value={index} min={1} max={2.5} step={0.01} onChange={setIndex} unit="" />
    <Control label="Índice do meio exterior n_out" value={outside} min={1} max={2} step={0.01} onChange={setOutside} unit="" />
    <Control label="Distância L à parede" value={distance} min={5} max={200} step={1} onChange={setDistance} unit="cm" />
    <LabNote title="Armadilha:">a normal da parede lateral é horizontal, por isso o ângulo de incidência em B é 90° − θr e não θr. Há reflexão total quando n·cos θr ≥ n_out, ou seja n ≥ √(n_out² + sin²θ₁). O percurso de A a B é d = L/sin θr e demora n·d/c. O desenho mantém as proporções verdadeiras (vê a régua no canto); o raio refletido volta à vertical de A no ponto C, pelo que o percurso A→B→C é o dobro de A→B (é esse o tempo pedido no ex. 18). Na figura do ex. 18, θ₂ = 14° está medido à parede: à normal são 76°.</LabNote>
  </>
}
