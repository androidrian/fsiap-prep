import { useEffect, useState } from 'react'
import { Choice, Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { fieldAmplitudes, planeWave } from './physics'
import { ArrowHead, clamp, formatLength, positive, px } from './svg'

const ORIGIN_X = 64
const AXIS_Y = 122
const SPAN = 376
/** Projeção oblíqua do eixo z (aponta para o observador, desenhado para baixo e para a esquerda). */
const Z = [-0.55, 0.4] as const

/** Amplitude desenhada (px): escala logarítmica saturada, para caber qualquer E₀. */
function amplitudePx(electricAmplitude: number) {
  return clamp(22 + 9 * Math.log10(1 + electricAmplitude), 22, 62)
}

/** Número de comprimentos de onda desenhados: cresce devagar com a frequência (escala visual). */
function cyclesShown(frequency: number) {
  return clamp(0.5 + Math.log10(frequency) / 5, 1.1, 3.2)
}

export function Wave({ params }: LabProps) {
  const [frequency, setFrequency] = useState(positive(numberParam(params, 'f', 1e8), 1e8))
  const [amplitude, setAmplitude] = useState(positive(numberParam(params, 'E0', 30), 30))
  const [playing, setPlaying] = useState(false)
  const [phase, setPhase] = useState(0)
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const wave = planeWave(frequency, amplitude)

  useEffect(() => {
    if (!playing || reducedMotion || typeof requestAnimationFrame !== 'function') return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      const elapsed = last === null ? 0 : now - last
      last = now
      setPhase((current) => (current + elapsed / 1000 * 2.4) % (2 * Math.PI))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, reducedMotion])

  const electricPx = amplitudePx(amplitude)
  const wavelengthPx = SPAN / cyclesShown(frequency)
  // Limita B para a curva projetada nunca dobrar sobre si própria.
  const magneticPx = Math.min(electricPx * 1.15, 0.2 * wavelengthPx)
  const field = (offset: number) => Math.cos(2 * Math.PI * offset / wavelengthPx - phase)
  const samples = Array.from({ length: SPAN / 4 + 1 }, (_, index) => index * 4)
  const electricCurve = samples.map((offset) => `${ORIGIN_X + offset},${px(AXIS_Y - electricPx * field(offset))}`).join(' ')
  const magneticCurve = samples.map((offset) => `${px(ORIGIN_X + offset + Z[0] * magneticPx * field(offset))},${px(AXIS_Y + Z[1] * magneticPx * field(offset))}`).join(' ')
  const divisions = wavelengthPx >= 120 ? 8 : wavelengthPx >= 85 ? 6 : 4
  const arrows = Array.from({ length: Math.floor(SPAN / (wavelengthPx / divisions)) + 1 }, (_, index) => index * wavelengthPx / divisions)
  const equationPhase = `${sig(wave.omega)} t − ${sig(wave.waveNumber)} x`

  return <>
    <svg className="lab-waves-stage lab-waves-wave" viewBox="0 0 480 240" role="img" aria-label={`Onda eletromagnética a propagar-se segundo x: campo elétrico de amplitude ${sig(amplitude)} volts por metro no plano vertical e campo magnético de amplitude ${sig(wave.magneticAmplitude)} tesla no plano horizontal, em fase; comprimento de onda ${formatLength(wave.wavelength)}`}>
      <defs><ArrowHead id="waves-wave-axis" tone="muted" /><ArrowHead id="waves-wave-e" tone="e" size={5} /><ArrowHead id="waves-wave-b" tone="b" size={5} /></defs>
      <line className="lab-waves-axis-line" x1="40" y1={AXIS_Y} x2="456" y2={AXIS_Y} markerEnd="url(#waves-wave-axis)" />
      <line className="lab-waves-axis-line" x1={ORIGIN_X} y1="196" x2={ORIGIN_X} y2="34" markerEnd="url(#waves-wave-axis)" />
      <line className="lab-waves-axis-line" x1={ORIGIN_X - Z[0] * 45} y1={AXIS_Y - Z[1] * 45} x2={ORIGIN_X + Z[0] * 100} y2={AXIS_Y + Z[1] * 100} markerEnd="url(#waves-wave-axis)" />
      <text x="462" y="126">x</text>
      <text className="lab-waves-e-label" x="72" y="38">y · E</text>
      <text className="lab-waves-b-label" x="6" y="178">z · B</text>
      <g className="lab-waves-b-vectors">{arrows.map((offset) => { const value = field(offset); return Math.abs(value) * magneticPx * 0.68 >= 9 ? <line key={offset} x1={px(ORIGIN_X + offset)} y1={AXIS_Y} x2={px(ORIGIN_X + offset + Z[0] * magneticPx * value)} y2={px(AXIS_Y + Z[1] * magneticPx * value)} markerEnd="url(#waves-wave-b)" /> : null })}</g>
      <polyline className="lab-waves-b-curve" points={magneticCurve} />
      <g className="lab-waves-e-vectors">{arrows.map((offset) => { const value = field(offset); return Math.abs(value) * electricPx >= 9 ? <line key={offset} x1={px(ORIGIN_X + offset)} y1={AXIS_Y} x2={px(ORIGIN_X + offset)} y2={px(AXIS_Y - electricPx * value)} markerEnd="url(#waves-wave-e)" /> : null })}</g>
      <polyline className="lab-waves-e-curve" points={electricCurve} />
      <path className="lab-waves-dimension" d={`M${ORIGIN_X} 206H${px(ORIGIN_X + wavelengthPx)}M${ORIGIN_X} 201v10M${px(ORIGIN_X + wavelengthPx)} 201v10`} />
      <text className="lab-waves-strong" x={px(ORIGIN_X + wavelengthPx / 2)} y="222" textAnchor="middle">λ = {formatLength(wave.wavelength)}</text>
      <line className="lab-waves-e-curve" x1="330" y1="13" x2="350" y2="13" /><text x="356" y="17">E₀ = {sig(amplitude)} V/m</text>
      <line className="lab-waves-b-curve" x1="330" y1="27" x2="350" y2="27" /><text x="356" y="31">B₀ = {sig(wave.magneticAmplitude)} T</text>
    </svg>
    <ResultStrip label="Comprimento de onda" value={formatLength(wave.wavelength)} formula="\\lambda=\\dfrac{c}{f}" secondary={`f = ${sig(frequency)} Hz · λ = ${sig(wave.wavelength)} m`} />
    <div className="lab-waves-equations" role="group" aria-label="Equações dos campos">
      <p>E<sub>y</sub>(x, t) = {sig(amplitude)} cos({equationPhase}) V/m</p>
      <p>B<sub>z</sub>(x, t) = {sig(wave.magneticAmplitude)} cos({equationPhase}) T</p>
    </div>
    <Metrics items={[
      { label: 'Período (1/f)', value: `${sig(wave.period)} s` },
      { label: 'Frequência angular', value: `${sig(wave.omega)} rad/s` },
      { label: 'Número de onda', value: `${sig(wave.waveNumber)} m⁻¹` },
      { label: 'Campo magnético B₀', value: `${sig(wave.magneticAmplitude)} T` },
    ]} />
    <Metrics items={[
      { label: 'Intensidade média', value: `${sig(wave.intensity)} W/m²` },
      { label: 'Amplitude E₀', value: `${sig(amplitude)} V/m` },
      { label: 'Frequência', value: `${sig(frequency)} Hz` },
    ]} />
    {reducedMotion
      ? <div className="source-kind"><span>Movimento reduzido</span><div><button type="button" onClick={() => setPhase((current) => (current + Math.PI / 4) % (2 * Math.PI))}>Avançar T/8</button></div></div>
      : <Choice<'off' | 'on'> label="Animação" value={playing ? 'on' : 'off'} onChange={(value) => setPlaying(value === 'on')} options={[['off', 'Parada'], ['on', 'Animar']]} />}
    <NumberField label="Frequência f" value={frequency} onChange={(value) => { if (value > 0) setFrequency(value) }} unit="Hz" hint="Aceita notação científica: 1e8 · 1e6 (1 MHz)" />
    <Control label="Expoente de f (log₁₀ f)" value={Math.log10(frequency)} min={3} max={18} step={0.01} onChange={(value) => setFrequency(Number((10 ** value).toPrecision(3)))} unit="" />
    <NumberField label="Amplitude E₀" value={amplitude} onChange={(value) => { if (value > 0) setAmplitude(value) }} unit="V/m" />
    <Control label="Amplitude E₀ (cursor)" value={amplitude} min={1} max={500} step={1} onChange={setAmplitude} unit="V/m" />
    <NumberField label="…ou a intensidade média I" value={Number(wave.intensity.toPrecision(4))} onChange={(value) => { if (value > 0) setAmplitude(Number(fieldAmplitudes(value).electric.toPrecision(4))) }} unit="W/m²" hint="Define E₀ = √(2μ₀cI); ex.: 20 W/m² dá 123 V/m" />
    <LabNote title="Leitura:">E e B oscilam em fase, perpendiculares entre si e à direção de propagação (E × B aponta para +x). O argumento ωt − kx diz que a onda avança no sentido positivo de x. Usa ω = 2πf, k = 2π/λ, B₀ = E₀/c e I = E₀²/(2μ₀c) para a intensidade média. Escala visual: a amplitude desenhada e o número de ciclos crescem devagar (logaritmo) com E₀ e f; B está desenhado na sua própria escala, porque B₀ = E₀/c é numericamente minúsculo.</LabNote>
  </>
}
