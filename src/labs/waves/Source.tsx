import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { LIGHT_YEAR, isotropicSource } from './physics'
import { clamp, formatLength, positive, powerOfTen, px } from './svg'

const SOURCE: [number, number] = [64, 150]
const AXIS_ANGLE = -14 * Math.PI / 180
const BAR = { x0: 40, x1: 440, minExponent: -12, maxExponent: 8 }

const presets = [
  { id: 'lamp', label: 'Lâmpada 50 W', power: 50, distance: 3, emission: 'sphere' },
  { id: 'radio', label: 'Rádio 50 kW', power: 5e4, distance: 1e5, emission: 'half' },
  { id: 'star', label: 'Estrela Polar', power: 8.58e29, distance: Number((431 * LIGHT_YEAR).toPrecision(4)), emission: 'sphere' },
] as const

type Emission = 'sphere' | 'half'

/** Posição de uma intensidade na barra logarítmica (saturada nos extremos). */
function barPosition(intensity: number) {
  const exponent = intensity > 0 ? Math.log10(intensity) : BAR.minExponent
  const fraction = clamp((exponent - BAR.minExponent) / (BAR.maxExponent - BAR.minExponent), 0, 1)
  return BAR.x0 + fraction * (BAR.x1 - BAR.x0)
}

export function Source({ params }: LabProps) {
  const [power, setPower] = useState(positive(numberParam(params, 'P', 50), 50))
  const [distance, setDistance] = useState(positive(numberParam(params, 'r', 3), 3))
  const [emission, setEmission] = useState<Emission>('sphere')
  const result = isotropicSource(power, distance, emission === 'half' ? 0.5 : 1)

  const ux = Math.cos(AXIS_ANGLE); const uy = Math.sin(AXIS_ANGLE)
  const along = (length: number, offset: number): [number, number] => [SOURCE[0] + ux * length + uy * offset, SOURCE[1] + uy * length - ux * offset]
  const patch = (length: number, half: number) => { const [ax, ay] = along(length, half); const [bx, by] = along(length, -half); return { x1: px(ax), y1: px(ay), x2: px(bx), y2: px(by) } }
  const [coneTopX, coneTopY] = along(300, 32); const [coneBottomX, coneBottomY] = along(300, -32)
  const glow = 7 + clamp(Math.log10(power) + 1, 0, 31) * 0.45
  const marker = barPosition(result.intensity)
  const markerDouble = barPosition(result.intensityAtDouble)
  const brightness = 0.25 + 0.75 * (marker - BAR.x0) / (BAR.x1 - BAR.x0)
  const fronts = Array.from({ length: 13 }, (_, index) => 34 * (index + 1))
  const ticks = [-12, -8, -4, 0, 4, 8]
  const activePreset = presets.find((preset) => preset.power === power && preset.distance === distance && preset.emission === emission)?.id ?? ''
  const areaSymbol = emission === 'half' ? '2\\pi r^2' : '4\\pi r^2'

  return <>
    <svg className="lab-waves-stage lab-waves-source" viewBox="0 0 480 240" role="img" aria-label={`Fonte de ${sig(power)} watts a emitir ${emission === 'half' ? 'para uma semiesfera' : 'em todas as direções'}; à distância de ${sig(distance)} metros a intensidade é ${sig(result.intensity)} watts por metro quadrado`}>
      <defs>
        <clipPath id="waves-source-clip"><rect x="0" y="0" width="480" height={emission === 'half' ? SOURCE[1] : 178} /></clipPath>
        <linearGradient id="waves-source-bar" x1="0" x2="1" y1="0" y2="0"><stop className="lab-waves-bar-stop low" offset="0" /><stop className="lab-waves-bar-stop high" offset="1" /></linearGradient>
      </defs>
      <g clipPath="url(#waves-source-clip)">{fronts.map((radius) => <circle className="lab-waves-front" key={radius} cx={SOURCE[0]} cy={SOURCE[1]} r={radius} opacity={px(clamp(0.08 + 22 / radius, 0.1, 0.75))} />)}</g>
      {emission === 'half' && <path className="lab-waves-ground" d={`M8 ${SOURCE[1]}H132`} />}
      <path className="lab-waves-cone" d={`M${SOURCE[0]} ${SOURCE[1]}L${px(coneTopX)} ${px(coneTopY)}L${px(coneBottomX)} ${px(coneBottomY)}Z`} />
      <line className="lab-waves-patch" {...patch(150, 16)} opacity={px(brightness)} />
      <line className="lab-waves-patch far" {...patch(300, 32)} opacity={px(brightness * 0.45)} />
      <circle className="lab-waves-glow" cx={SOURCE[0]} cy={SOURCE[1]} r={px(glow)} />
      <circle className="lab-waves-lamp" cx={SOURCE[0]} cy={SOURCE[1]} r="5" />
      <text className="lab-waves-strong" x="10" y="118">P = {sig(power)} W</text>
      <text className="lab-waves-strong" x="213" y="146" textAnchor="middle">r = {formatLength(distance)}</text>
      <text x="213" y="160" textAnchor="middle">I = {sig(result.intensity)} W/m²</text>
      <text className="lab-waves-strong" x="366" y="126" textAnchor="middle">2r · área ×4</text>
      <text x="366" y="140" textAnchor="middle">I/4 = {sig(result.intensityAtDouble)} W/m²</text>
      <rect className="lab-waves-bar" x={BAR.x0} y="196" width={BAR.x1 - BAR.x0} height="10" fill="url(#waves-source-bar)" />
      {ticks.map((exponent) => { const x = BAR.x0 + (exponent - BAR.minExponent) / (BAR.maxExponent - BAR.minExponent) * (BAR.x1 - BAR.x0); return <g key={exponent}><line className="lab-waves-tick" x1={x} y1="206" x2={x} y2="210" /><text x={x} y="221" textAnchor="middle">{powerOfTen(exponent)}</text></g> })}
      <path className="lab-waves-bar-marker ghost" d={`M${px(markerDouble)} 195l-5 -8h10z`} />
      <path className="lab-waves-bar-marker" d={`M${px(marker)} 195l-5 -8h10zM${px(marker)} 195v12`} />
      <text x="240" y="235" textAnchor="middle">intensidade I em W/m² · escala logarítmica (▼ a r, ▽ a 2r)</text>
    </svg>
    <ResultStrip label="Intensidade à distância r" value={`${sig(result.intensity)} W/m²`} formula={`I=\\dfrac{P}{${areaSymbol}}`} secondary={`área atravessada = ${sig(result.area)} m²`} />
    <Metrics items={[
      { label: 'Campo elétrico Eₘ', value: `${sig(result.electric)} V/m` },
      { label: 'Campo magnético Bₘ', value: `${sig(result.magnetic)} T` },
      { label: 'E eficaz (Eₘ/√2)', value: `${sig(result.electricRms)} V/m` },
      { label: 'Intensidade a 2r (¼)', value: `${sig(result.intensityAtDouble)} W/m²` },
    ]} />
    <div className="lab-waves-presets"><Choice label="Exemplos da ficha" value={activePreset} onChange={(id) => { const preset = presets.find((entry) => entry.id === id); if (preset) { setPower(preset.power); setDistance(preset.distance); setEmission(preset.emission) } }} options={presets.map((preset) => [preset.id, preset.label] as const)} /></div>
    <Choice<Emission> label="A potência espalha-se por" value={emission} onChange={setEmission} options={[['sphere', 'Esfera 4πr²'], ['half', 'Semiesfera 2πr²']]} />
    <NumberField label="Potência emitida P" value={power} onChange={(value) => { if (value > 0) setPower(value) }} unit="W" hint="Aceita notação científica: 50 · 5e4 · 8.58e29" />
    <Control label="Expoente de P (log₁₀ P)" value={Math.log10(power)} min={-3} max={31} step={0.1} onChange={(value) => setPower(Number((10 ** value).toPrecision(3)))} unit="" />
    <NumberField label="Distância r" value={distance} onChange={(value) => { if (value > 0) setDistance(value) }} unit="m" hint="Ex.: 3 · 1e5 (100 km) · 4.078e18 (431 anos-luz)" />
    <Control label="Expoente de r (log₁₀ r)" value={Math.log10(distance)} min={-2} max={20} step={0.1} onChange={(value) => setDistance(Number((10 ** value).toPrecision(3)))} unit="" />
    <LabNote title="Leitura:">Eₘ = √(2μ₀cI) e Bₘ = Eₘ/c. A mesma potência atravessa superfícies cada vez maiores: a 2r a área é 4× maior e a intensidade cai para ¼. Como E ∝ √I, os campos só caem para metade. O desenho é esquemático; a posição na barra é logarítmica, por isso duplicar r quase não desloca o marcador. Um emissor no solo (ex. 4) só irradia para a semiesfera de cima.</LabNote>
  </>
}
