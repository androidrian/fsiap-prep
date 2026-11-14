import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { SPECTRUM_BANDS, VISIBLE_MAX_WAVELENGTH, VISIBLE_MIN_WAVELENGTH, antennaLengths, radioService, spectrumBand, visibleColour } from './physics'
import { clamp, formatLength, positive, powerOfTen, px } from './svg'

const AXIS = { x0: 30, x1: 450, minExponent: 3, maxExponent: 22 }
const ZOOM = { x0: 110, x1: 370 }

/** Posição horizontal de uma frequência na banda logarítmica (saturada nos extremos). */
function frequencyX(frequency: number) {
  const exponent = clamp(Math.log10(frequency), AXIS.minExponent, AXIS.maxExponent)
  return AXIS.x0 + (exponent - AXIS.minExponent) / (AXIS.maxExponent - AXIS.minExponent) * (AXIS.x1 - AXIS.x0)
}

/** Posição de um comprimento de onda no zoom do visível: 750 nm à esquerda, 380 nm à direita. */
function wavelengthX(wavelength: number) {
  return ZOOM.x0 + (VISIBLE_MAX_WAVELENGTH - wavelength) / (VISIBLE_MAX_WAVELENGTH - VISIBLE_MIN_WAVELENGTH) * (ZOOM.x1 - ZOOM.x0)
}

const bandNames: Record<string, { x: number; y: number; anchor: 'middle' | 'end' }> = {
  radio: { x: 90, y: 80, anchor: 'middle' },
  microwave: { x: 184, y: 93, anchor: 'middle' },
  infrared: { x: 244, y: 80, anchor: 'middle' },
  visible: { x: 289, y: 93, anchor: 'middle' },
  ultraviolet: { x: 322, y: 80, anchor: 'middle' },
  xray: { x: 361, y: 93, anchor: 'middle' },
  gamma: { x: 450, y: 80, anchor: 'end' },
}

const rainbow = [
  ['red-deep', 0], ['red', 0.2], ['orange', 0.39], ['yellow', 0.46], ['green', 0.6], ['cyan', 0.7], ['blue', 0.78], ['violet', 0.9], ['violet-deep', 1],
] as const

const presets: ReadonlyArray<readonly [number, string]> = [[520e3, 'AM 520 kHz'], [1e6, '1000 kHz'], [88e6, 'FM 88 MHz'], [900e6, '900 MHz'], [430e12, '430 THz'], [760e12, '760 THz']]

const sine = Array.from({ length: 61 }, (_, index) => `${40 + index * 3},${px(200 - 15 * Math.sin(index / 60 * 2 * Math.PI))}`).join(' ')

export function Spectrum({ params }: LabProps) {
  const [frequency, setFrequency] = useState(positive(numberParam(params, 'f', 1e6), 1e6))
  const antenna = antennaLengths(frequency)
  const band = spectrumBand(frequency)
  const service = radioService(frequency)
  const colour = visibleColour(antenna.wavelength)
  const markerX = frequencyX(frequency)
  const anchor = markerX < 170 ? 'start' : markerX > 310 ? 'end' : 'middle'
  const bandText = `${band.label}${service ? ` (${service})` : ''}${colour ? ` · ${colour.label}` : ''}`
  const zoomX = clamp(wavelengthX(antenna.wavelength), ZOOM.x0, ZOOM.x1)
  const ticks = [3, 6, 9, 12, 15, 18, 21]

  return <>
    <svg className="lab-waves-stage lab-waves-spectrum" viewBox="0 0 480 240" role="img" aria-label={`Espetro eletromagnético em escala logarítmica; a frequência ${sig(frequency)} hertz fica na banda ${bandText}, com comprimento de onda ${formatLength(antenna.wavelength)}`}>
      <defs>
        <linearGradient id="waves-spectrum-rainbow" x1="0" x2="1" y1="0" y2="0">{rainbow.map(([name, offset]) => <stop key={name} className={`lab-waves-rainbow ${name}`} offset={offset} />)}</linearGradient>
      </defs>
      <text className="lab-waves-strong" x={px(markerX)} y="13" textAnchor={anchor}>f = {sig(frequency)} Hz · λ = {formatLength(antenna.wavelength)}</text>
      {SPECTRUM_BANDS.map((entry) => { const x0 = frequencyX(Math.max(entry.min, 1e3)); const x1 = frequencyX(Math.min(entry.max, 1e22)); return <rect key={entry.id} className={`lab-waves-band ${entry.id}${entry.id === band.id ? ' active' : ''}`} x={px(x0)} y="28" width={px(x1 - x0)} height="22" fill={entry.id === 'visible' ? 'url(#waves-spectrum-rainbow)' : undefined} /> })}
      {ticks.map((exponent) => { const x = px(frequencyX(10 ** exponent)); return <g key={exponent}><line className="lab-waves-tick" x1={x} y1="50" x2={x} y2="54" /><text x={x} y="66" textAnchor="middle">{powerOfTen(exponent)}</text></g> })}
      <text x="472" y="66" textAnchor="end">Hz</text>
      {SPECTRUM_BANDS.map((entry) => <text key={entry.id} className={entry.id === band.id ? 'lab-waves-strong' : undefined} x={bandNames[entry.id].x} y={bandNames[entry.id].y} textAnchor={bandNames[entry.id].anchor}>{entry.label}</text>)}
      <path className="lab-waves-spectrum-marker" d={`M${px(markerX)} 27l-5 -9h10zM${px(markerX)} 27v26`} />

      <text x="240" y="113" textAnchor="middle">zoom do visível</text>
      <rect className={`lab-waves-zoom${colour ? ' active' : ''}`} x={ZOOM.x0} y="120" width={ZOOM.x1 - ZOOM.x0} height="18" fill="url(#waves-spectrum-rainbow)" />
      <text x={ZOOM.x0 - 6} y="133" textAnchor="end">750 nm</text>
      <text x={ZOOM.x1 + 6} y="133">380 nm</text>
      {colour
        ? <><path className="lab-waves-spectrum-marker" d={`M${px(zoomX)} 119l-4 -6h8zM${px(zoomX)} 119v20`} /><text className="lab-waves-strong" x={px(clamp(zoomX, 150, 330))} y="153" textAnchor="middle">{formatLength(antenna.wavelength)} · {colour.label}</text></>
        : <text x="240" y="153" textAnchor="middle">{antenna.wavelength > VISIBLE_MAX_WAVELENGTH ? 'f abaixo do visível: λ maior que 750 nm' : 'f acima do visível: λ menor que 380 nm'}</text>}

      <polyline className="lab-waves-antenna-wave" points={sine} />
      <path className="lab-waves-dimension" d="M40 222H220M40 217v10M220 217v10" />
      <text className="lab-waves-strong" x="130" y="236" textAnchor="middle">λ = {formatLength(antenna.wavelength)}</text>
      <path className="lab-waves-antenna" d="M262 190H304M310 190H352" />
      <text x="362" y="194">λ/2 = {formatLength(antenna.half)}</text>
      <path className="lab-waves-antenna" d="M262 214H307" />
      <path className="lab-waves-ground" d="M256 204V224" />
      <text x="317" y="218">λ/4 = {formatLength(antenna.quarter)}</text>
      <text x="262" y="176">antenas à escala de λ</text>
    </svg>
    <ResultStrip label="Comprimento de onda" value={formatLength(antenna.wavelength)} formula="\\lambda=\\dfrac{c}{f}" secondary={`${bandText} · λ = ${sig(antenna.wavelength)} m`} />
    <Metrics items={[
      { label: 'Banda', value: bandText },
      { label: 'Antena de meia onda', value: formatLength(antenna.half) },
      { label: 'Antena de quarto de onda', value: formatLength(antenna.quarter) },
      { label: 'Período (1/f)', value: `${sig(1 / frequency)} s` },
    ]} />
    <div className="lab-waves-presets"><Choice<number> label="Exemplos da ficha" value={frequency} onChange={setFrequency} options={presets} /></div>
    <NumberField label="Frequência f" value={frequency} onChange={(value) => { if (value > 0) setFrequency(value) }} unit="Hz" hint="Aceita notação científica: 1e6 (1000 kHz) · 9e8 (900 MHz) · 4.3e14 (430 THz)" />
    <Control label="Expoente de f (log₁₀ f)" value={Math.log10(frequency)} min={3} max={22} step={0.01} onChange={(value) => setFrequency(Number((10 ** value).toPrecision(3)))} unit="" />
    <LabNote title="Leitura:">a banda de cima é logarítmica: cada marca vale mil vezes a anterior, e o visível é uma fatia muito estreita. No vazio λ = c/f, por isso frequências baixas pedem antenas enormes (75 m para 1000 kHz em quarto de onda) e um telemóvel a 900 MHz resolve-se com poucos centímetros. Dentro de um meio usa v = c/n em vez de c.</LabNote>
  </>
}
