import { useEffect, useState } from 'react'
import { Choice, Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, spanFor } from './format'
import { generator } from './physics'
import { Arrow, ArrowHeads } from './svg'

const playOptions = [['off', 'parada'], ['on', 'a rodar']] as const
const LOOP: readonly [number, number] = [108, 120]
const PLOT_X = 250
const PLOT_WIDTH = 212
const FLUX_Y = 62
const EMF_Y = 168
const AMPLITUDE = 34
const PERIODS = 2

const snap = (value: number) => (Math.abs(value) < 1e-9 ? 0 : value)

function curve(baseline: number, wave: (angle: number) => number): string {
  return Array.from({ length: 97 }, (_, index) => {
    const fraction = index / 96
    return `${(PLOT_X + PLOT_WIDTH * fraction).toFixed(1)},${(baseline - AMPLITUDE * wave(fraction * PERIODS * 2 * Math.PI)).toFixed(1)}`
  }).join(' ')
}

const fluxCurve = curve(FLUX_Y, Math.cos)
const emfCurve = curve(EMF_Y, Math.sin)

/** Espira a rodar num campo uniforme: fluxo, FEM e corrente sinusoidais (ficha 3, ex. 8). */
export function Generator({ params }: LabProps) {
  const [field, setField] = useState(Math.abs(numberParam(params, 'B', 0.63)))
  const [radius, setRadius] = useState(Math.abs(numberParam(params, 'r', 0.11)))
  const [turns, setTurns] = useState(Math.max(1, Math.round(Math.abs(numberParam(params, 'N', 1)))))
  const [angularSpeed, setAngularSpeed] = useState(Math.abs(numberParam(params, 'w', 250)))
  const [resistance, setResistance] = useState(Math.abs(numberParam(params, 'R', 10)))
  const [phase, setPhase] = useState(0.125)
  const [playing, setPlaying] = useState<'off' | 'on'>('off')
  const [fieldRange] = useState(() => spanFor(field, 0.05, 2))
  const [radiusRange] = useState(() => spanFor(radius, 0.01, 0.5))
  const [turnsRange] = useState(() => spanFor(turns, 1, 200))
  const [speedRange] = useState(() => spanFor(angularSpeed, 10, 1000))
  const [resistanceRange] = useState(() => spanFor(resistance, 0.5, 100))

  useEffect(() => {
    if (playing !== 'on') return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      if (last !== null) {
        const elapsed = now - last
        setPhase((value) => (value + elapsed / 4000) % PERIODS)
      }
      last = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  const result = generator(field, radius, turns, angularSpeed, resistance)
  const angle = phase * 2 * Math.PI
  const cosine = snap(Math.cos(angle))
  const sine = snap(Math.sin(angle))
  const time = Number.isFinite(result.period) ? phase * result.period : 0
  const flux = result.fluxAmplitude * cosine
  const emf = result.emfAmplitude * sine
  const currentNow = Number.isFinite(result.currentAmplitude) ? result.currentAmplitude * sine : 0
  const degrees = Math.round(phase * 360) % 360

  // Vista de perfil: a espira é um segmento perpendicular à normal n, que faz o ângulo ωt com B (→).
  const halfLength = 22 + 26 * (1 - Math.exp(-radius / 0.15))
  const normal: [number, number] = [Math.cos(angle), -Math.sin(angle)]
  const along: [number, number] = [Math.sin(angle), Math.cos(angle)]
  const drawnTurns = clamp(turns, 1, 5)
  const fieldLines = clamp(Math.round(3 + 4 * (1 - Math.exp(-field / 0.6))), 3, 7)
  const reduced = angle % (2 * Math.PI)
  const arcEnd: [number, number] = [LOOP[0] + 20 * normal[0], LOOP[1] + 20 * normal[1]]
  const markerX = PLOT_X + PLOT_WIDTH * phase / PERIODS
  const expression = (amplitude: number, unit: string) => `${sig(amplitude)} sen(${sig(angularSpeed)} t) ${unit}`

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-generator" viewBox="0 0 480 240" role="img" aria-label={`Espira de ${turns} ${turns === 1 ? 'volta' : 'voltas'} e raio ${sig(radius)} m a rodar a ${sig(angularSpeed)} rad/s num campo de ${sig(field)} T. A normal faz ${degrees} graus com o campo; fluxo ${sig(flux)} Wb e força eletromotriz ${sig(emf)} V neste instante`}>
      <defs><ArrowHeads prefix="generator" tones={['b', 'ink']} /></defs>
      <rect className="lab-magnetism-pole north" x="8" y="62" width="24" height="116" /><text className="lab-magnetism-pole-label" x="20" y="124" textAnchor="middle">N</text>
      <rect className="lab-magnetism-pole south" x="184" y="62" width="24" height="116" /><text className="lab-magnetism-pole-label" x="196" y="124" textAnchor="middle">S</text>
      {Array.from({ length: fieldLines }, (_, index) => {
        const y = 72 + index * 96 / (fieldLines - 1)
        return <Arrow key={index} prefix="generator" tone="b" thin className="lab-magnetism-faint lab-magnetism-generator-field" from={[40, y]} to={[176, y]} />
      })}
      <text className="lab-magnetism-label lab-magnetism-tone-b" x="44" y="52">B →</text>
      {Array.from({ length: drawnTurns }, (_, index) => {
        const offset = (index - (drawnTurns - 1) / 2) * 3
        const x = LOOP[0] + normal[0] * offset
        const y = LOOP[1] + normal[1] * offset
        return <line key={index} className="lab-magnetism-loop" x1={x - along[0] * halfLength} y1={y - along[1] * halfLength} x2={x + along[0] * halfLength} y2={y + along[1] * halfLength} />
      })}
      <line className="lab-magnetism-aux" x1={LOOP[0]} y1={LOOP[1]} x2={LOOP[0] + 30} y2={LOOP[1]} />
      {reduced > 0.12 && <>
        <path className="lab-magnetism-angle" d={`M${LOOP[0] + 20} ${LOOP[1]}A20 20 0 ${reduced > Math.PI ? 1 : 0} 0 ${arcEnd[0]} ${arcEnd[1]}`} />
        <text className="lab-magnetism-strong" x={LOOP[0] + 34 * Math.cos(reduced / 2)} y={LOOP[1] - 34 * Math.sin(reduced / 2) + 4} textAnchor="middle">ωt</text>
      </>}
      <Arrow prefix="generator" tone="ink" thin className="lab-magnetism-generator-normal" from={LOOP} to={[LOOP[0] + 46 * normal[0], LOOP[1] + 46 * normal[1]]} label="n" />
      <circle className="lab-magnetism-centre" cx={LOOP[0]} cy={LOOP[1]} r="3" />
      <text x="108" y="204" textAnchor="middle">vista de perfil · ωt = {degrees}°</text>
      <text x="108" y="220" textAnchor="middle">{turns > 5 ? `${turns} voltas (5 desenhadas)` : `${turns} ${turns === 1 ? 'volta' : 'voltas'}`}</text>

      <path className="lab-magnetism-plot-axis" d={`M${PLOT_X} ${FLUX_Y - AMPLITUDE - 6}V${FLUX_Y + AMPLITUDE + 6}M${PLOT_X} ${FLUX_Y}H${PLOT_X + PLOT_WIDTH}M${PLOT_X} ${EMF_Y - AMPLITUDE - 6}V${EMF_Y + AMPLITUDE + 6}M${PLOT_X} ${EMF_Y}H${PLOT_X + PLOT_WIDTH}`} />
      <polyline className="lab-magnetism-plot flux" points={fluxCurve} />
      <polyline className="lab-magnetism-plot emf" points={emfCurve} />
      <text className="lab-magnetism-label lab-magnetism-tone-b" x={PLOT_X + 4} y="18">Φ(t)</text>
      <text x={PLOT_X + PLOT_WIDTH} y="18" textAnchor="end">Φ₀ = {sig(result.fluxAmplitude)} Wb</text>
      <text className="lab-magnetism-label lab-magnetism-tone-blue" x={PLOT_X + 4} y="124">ℰ(t)</text>
      <text x={PLOT_X + PLOT_WIDTH} y="124" textAnchor="end">ℰ₀ = {sig(result.emfAmplitude)} V</text>
      <path className="lab-magnetism-plot-axis" d={`M${PLOT_X + PLOT_WIDTH / 2} ${EMF_Y - 4}v8M${PLOT_X + PLOT_WIDTH} ${EMF_Y - 4}v8`} />
      <text x={PLOT_X + PLOT_WIDTH / 2} y="222" textAnchor="middle">T</text>
      <text x={PLOT_X + PLOT_WIDTH} y="222" textAnchor="end">2T = {sig(2 * result.period)} s</text>
      <path className="lab-magnetism-aux lab-magnetism-generator-time" d={`M${markerX} ${FLUX_Y - AMPLITUDE - 4}V${FLUX_Y + AMPLITUDE + 4}M${markerX} ${EMF_Y - AMPLITUDE - 4}V${EMF_Y + AMPLITUDE + 4}`} />
      <circle className="lab-magnetism-marker flux" cx={markerX} cy={FLUX_Y - AMPLITUDE * cosine} r="4.5" />
      <circle className="lab-magnetism-marker emf" cx={markerX} cy={EMF_Y - AMPLITUDE * sine} r="4.5" />
    </svg>

    <ResultStrip label="FEM induzida ℰ(t)" value={expression(result.emfAmplitude, 'V')} formula="\mathcal E(t)=-\dfrac{d\Phi}{dt}=NBA\omega\,\mathrm{sen}(\omega t)" secondary={`i(t) = ${expression(result.currentAmplitude, 'A')}`} />
    <Metrics items={[
      { label: 'Amplitude ℰ₀ = NBAω', value: `${sig(result.emfAmplitude)} V` },
      { label: 'Corrente máxima ℰ₀/R', value: `${sig(result.currentAmplitude)} A` },
      { label: 'Período 2π/ω', value: `${sig(result.period)} s` },
      { label: 'Área da espira πr²', value: `${sig(result.area)} m²` },
    ]} />
    <Metrics items={[
      { label: 'Instante t', value: `${sig(time)} s` },
      { label: 'Fluxo Φ(t) = NBA cos ωt', value: `${sig(flux)} Wb` },
      { label: 'FEM neste instante', value: `${sig(emf)} V` },
      { label: 'Corrente neste instante', value: `${sig(currentNow)} A` },
    ]} />

    <Control label="Instante t" value={phase} min={0} max={PERIODS} step={0.01} onChange={setPhase} unit="T" />
    <Choice label="Animação (câmara lenta)" value={playing} onChange={setPlaying} options={playOptions} />
    <Control label="Campo B" value={field} min={fieldRange.min} max={fieldRange.max} step={0.01} onChange={setField} unit="T" />
    <Control label="Raio da espira" value={radius} min={radiusRange.min} max={radiusRange.max} step={0.005} onChange={setRadius} unit="m" />
    <Control label="Número de voltas N" value={turns} min={turnsRange.min} max={turnsRange.max} step={1} onChange={setTurns} unit="" />
    <Control label="Velocidade angular ω" value={angularSpeed} min={speedRange.min} max={speedRange.max} step={5} onChange={setAngularSpeed} unit="rad/s" />
    <Control label="Resistência R" value={resistance} min={resistanceRange.min} max={resistanceRange.max} step={0.5} onChange={setResistance} unit="Ω" />
    <LabNote title="Leitura do diagrama:">o fluxo é máximo quando a normal n é paralela a B (ωt = 0) e nesse instante a FEM é nula; a FEM é máxima quando o plano da espira contém B (ωt = 90°), porque é aí que o fluxo varia mais depressa — as duas curvas estão desfasadas de um quarto de período. As curvas estão normalizadas às amplitudes Φ₀ e ℰ₀ e a animação não está em tempo real.</LabNote>
  </>
}
