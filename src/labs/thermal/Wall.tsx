import { useState, type CSSProperties } from 'react'
import { LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, textParam, type LabProps } from '../ui'
import { compact, fix, positive, watts } from './format'
import { ArrowMarker, Zigzag } from './parts'
import { parseLayers, seriesWall, type Layer } from './physics'

const DEFAULT_LAYERS = '0.15:3.5:pedra;0.05:0.025:espuma;0.02:0.14:madeira'
const MAX_LAYERS = 5
const X0 = 60
const WIDTH = 360
const MIN_WIDTH = 52
const WALL_TOP = 20
const WALL_BOTTOM = 92
const PROFILE_TOP = 114
const PROFILE_BOTTOM = 166
const CIRCUIT_Y = 198

function fitName(name: string, width: number): string {
  const characters = Math.max(Math.floor((width - 6) / 6.4), 1)
  return name.length > characters ? `${name.slice(0, Math.max(characters - 1, 1))}…` : name
}

export function Wall({ params }: LabProps) {
  const [layers, setLayers] = useState<Layer[]>(() => {
    const parsed = parseLayers(textParam(params, 'layers', DEFAULT_LAYERS), MAX_LAYERS)
    return parsed.length > 0 ? parsed : parseLayers(DEFAULT_LAYERS, MAX_LAYERS)
  })
  const [area, setArea] = useState(() => positive(numberParam(params, 'area', 1), 1))
  const [hot, setHot] = useState(() => numberParam(params, 'hot', 35))
  const [cold, setCold] = useState(() => numberParam(params, 'cold', 20))

  const wall = seriesWall(layers, area, hot, cold)
  const totalThickness = layers.reduce((sum, layer) => sum + layer.thickness, 0)
  const widths = layers.map((layer) => MIN_WIDTH + (WIDTH - layers.length * MIN_WIDTH) * (layer.thickness / totalThickness))
  const edges = widths.reduce<number[]>((list, width) => [...list, list[list.length - 1] + width], [X0])
  const upper = Math.max(hot, cold)
  const span = Math.abs(hot - cold)
  const profileY = (temperature: number) => (span > 0 ? PROFILE_TOP + ((upper - temperature) / span) * (PROFILE_BOTTOM - PROFILE_TOP) : (PROFILE_TOP + PROFILE_BOTTOM) / 2)
  const profile = wall.temperatures.map((temperature, index) => `${edges[index].toFixed(1)},${profileY(temperature).toFixed(1)}`).join(' ')
  const steepest = wall.shares.indexOf(Math.max(...wall.shares))
  const firstSide = hot >= cold ? 'hot' : 'cold'
  const lastSide = hot >= cold ? 'cold' : 'hot'
  const interfaces = wall.temperatures.slice(1, -1)

  const update = (index: number, patch: Partial<Layer>) => setLayers((current) => current.map((layer, position) => (position === index ? { ...layer, ...patch } : layer)))
  const addLayer = () => setLayers((current) => (current.length >= MAX_LAYERS ? current : [...current, { thickness: 0.05, conductivity: 0.5, name: `camada ${current.length + 1}` }]))
  const removeLayer = () => setLayers((current) => (current.length <= 1 ? current : current.slice(0, -1)))

  const label = `Parede de ${layers.length} ${layers.length === 1 ? 'camada' : 'camadas'} entre ${compact(hot)} °C e ${compact(cold)} °C: fluxo de ${watts(Math.abs(wall.flow))}${interfaces.length > 0 ? `; interfaces a ${interfaces.map((temperature) => `${fix(temperature, 1)} °C`).join(', ')}` : ''}. A maior queda de temperatura está na camada ${steepest + 1} (${layers[steepest].name}).`

  return <>
    <svg className="lab-thermal-stage lab-thermal-wall" viewBox="0 0 480 240" role="img" aria-label={label}>
      <defs><ArrowMarker id="wall-flow-head" className="lab-thermal-head-flow" /></defs>
      <text x={X0} y="12">largura ∝ espessura (com mínimo)</text>
      <text x={X0 + WIDTH} y="12" textAnchor="end">cor ∝ parte de R_eq</text>
      <rect className={`lab-thermal-side ${firstSide}`} x={X0 - 5} y={WALL_TOP} width="5" height={WALL_BOTTOM - WALL_TOP} />
      <rect className={`lab-thermal-side ${lastSide}`} x={X0 + WIDTH} y={WALL_TOP} width="5" height={WALL_BOTTOM - WALL_TOP} />
      <text className={`lab-thermal-tag ${firstSide}`} x={X0 - 9} y="60" textAnchor="end">{firstSide === 'hot' ? 'quente' : 'frio'}</text>
      <text className={`lab-thermal-tag ${lastSide}`} x={X0 + WIDTH + 9} y="60">{lastSide === 'hot' ? 'quente' : 'frio'}</text>
      {layers.map((layer, index) => {
        const center = edges[index] + widths[index] / 2
        return <g key={index}>
          <rect className="lab-thermal-layer" x={edges[index].toFixed(1)} y={WALL_TOP} width={widths[index].toFixed(1)} height={WALL_BOTTOM - WALL_TOP} style={{ '--share': `${Math.round(8 + 62 * wall.shares[index])}%` } as CSSProperties} />
          <text className="lab-thermal-name" x={center} y="42" textAnchor="middle">{fitName(layer.name, widths[index])}</text>
          <text x={center} y="60" textAnchor="middle">{compact(layer.thickness)} m</text>
          <text x={center} y="78" textAnchor="middle">k {compact(layer.conductivity)}</text>
        </g>
      })}
      {edges.map((edge, index) => <line key={index} className="lab-thermal-guide" x1={edge.toFixed(1)} y1={WALL_BOTTOM} x2={edge.toFixed(1)} y2={CIRCUIT_Y} />)}
      <polyline className="lab-thermal-profile" points={profile} />
      <text className={`lab-thermal-tag ${firstSide}`} x={X0 - 6} y={profileY(hot) + 4} textAnchor="end">{compact(hot)} °C</text>
      <text className={`lab-thermal-tag ${lastSide}`} x={X0 + WIDTH + 6} y={profileY(cold) + 4}>{compact(cold)} °C</text>
      {interfaces.map((temperature, index) => <g key={index}>
        <circle className="lab-thermal-profile-dot" cx={edges[index + 1].toFixed(1)} cy={profileY(temperature).toFixed(1)} r="3" />
        <text className="lab-thermal-value" x={edges[index + 1] + 4} y={profileY(temperature) + (hot >= cold ? -6 : 14)}>{fix(temperature, 1)} °C</text>
      </g>)}
      <line className="lab-thermal-flow-line" x1="12" y1={CIRCUIT_Y} x2="48" y2={CIRCUIT_Y} markerEnd={hot >= cold ? 'url(#wall-flow-head)' : undefined} markerStart={hot < cold ? 'url(#wall-flow-head)' : undefined} />
      <text className="lab-thermal-tag flow" x="30" y={CIRCUIT_Y - 9} textAnchor="middle">Q̇</text>
      <text x={X0 - 6} y={CIRCUIT_Y + 26} textAnchor="end">R (K/W)</text>
      {layers.map((_layer, index) => {
        const center = edges[index] + widths[index] / 2
        return <g key={index}>
          <path className="lab-thermal-wire" d={`M${edges[index].toFixed(1)} ${CIRCUIT_Y}H${(center - 18).toFixed(1)}M${(center + 18).toFixed(1)} ${CIRCUIT_Y}H${edges[index + 1].toFixed(1)}`} />
          <Zigzag x={center} y={CIRCUIT_Y} />
          <text className="lab-thermal-value" x={center} y={CIRCUIT_Y + 26} textAnchor="middle">{sig(wall.resistances[index])}</text>
        </g>
      })}
      {edges.map((edge, index) => <circle key={index} className="lab-thermal-node" cx={edge.toFixed(1)} cy={CIRCUIT_Y} r="3.5" />)}
    </svg>
    <ResultStrip label={hot >= cold ? 'Fluxo de calor' : 'Fluxo de calor (da direita para a esquerda)'} value={watts(Math.abs(wall.flow))} formula="\dot Q=\dfrac{T_q-T_f}{R_{eq}},\quad R_i=\dfrac{L_i}{k_iA}" secondary={interfaces.length > 0 ? `T interface=${interfaces.map((temperature) => `${fix(temperature, 2)} °C`).join(' · ')}` : `R_eq = ${sig(wall.total, 4)} K/W`} />
    <Metrics items={[
      { label: 'Resistência equivalente', value: `${sig(wall.total, 4)} K/W` },
      { label: 'Fluxo por m²', value: `${compact(Math.abs(wall.flux))} W/m²` },
      { label: 'Maior queda de temperatura', value: `${layers[steepest].name} · ${fix(Math.abs(wall.temperatures[steepest] - wall.temperatures[steepest + 1]), 2)} °C` },
    ]} />
    <table className="lab-thermal-table">
      <thead><tr><th>Camada</th><th>R (K/W)</th><th>% de R_eq</th><th>ΔT (°C)</th><th>T à saída (°C)</th></tr></thead>
      <tbody>{layers.map((layer, index) => <tr key={index}>
        <td>{index + 1} · {layer.name}</td>
        <td>{sig(wall.resistances[index])}</td>
        <td>{fix(wall.shares[index] * 100, 1)}</td>
        <td>{fix(wall.temperatures[index] - wall.temperatures[index + 1], 2)}</td>
        <td>{fix(wall.temperatures[index + 1], 2)}</td>
      </tr>)}</tbody>
    </table>
    <div className="source-kind lab-thermal-actions"><span>Camadas · {layers.length} de {MAX_LAYERS}</span><div>
      <button type="button" onClick={removeLayer} disabled={layers.length <= 1}>Remover camada</button>
      <button type="button" onClick={addLayer} disabled={layers.length >= MAX_LAYERS}>Adicionar camada</button>
    </div></div>
    <div className="lab-thermal-fields">
      {layers.map((layer, index) => <div className="lab-thermal-pair" key={index}>
        <NumberField label={`Espessura da camada ${index + 1}`} value={layer.thickness} unit="m" hint={layer.name} onChange={(value) => { if (value > 0) update(index, { thickness: value }) }} />
        <NumberField label={`Condutividade da camada ${index + 1}`} value={layer.conductivity} unit="W/(m·K)" onChange={(value) => { if (value > 0) update(index, { conductivity: value }) }} />
      </div>)}
    </div>
    <div className="lab-thermal-fields">
      <NumberField label="Temperatura do lado quente" value={hot} unit="°C" onChange={setHot} />
      <NumberField label="Temperatura do lado frio" value={cold} unit="°C" onChange={setCold} />
      <NumberField label="Área da parede" value={area} unit="m²" onChange={(value) => { if (value > 0) setArea(value) }} />
    </div>
    <LabNote title="Leitura do perfil.">A corrente de calor é a mesma em todas as camadas, por isso cada uma fica com ΔTᵢ = Q̇·Rᵢ: a reta é mais inclinada onde a resistência é maior, que nem sempre é a camada mais grossa. As temperaturas de interface não dependem da área nem do sistema de unidades, desde que seja coerente. Diferenças na terceira casa face à ficha vêm de ela arredondar R_eq antes de dividir.</LabNote>
  </>
}
