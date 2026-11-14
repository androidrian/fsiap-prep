/* eslint-disable react-refresh/only-export-components */
import { Radio } from 'lucide-react'
import { useState } from 'react'
import { malusIntensity, unpolarizedThroughPolarizers } from '../domain/exercises/calculators'
import type { FamilyId } from '../domain/types'
import { Control, ResultStrip, numberParam, type LabScenario } from './ui'
import { Block } from './waves/Block'
import { Brewster } from './waves/Brewster'
import { Fiber } from './waves/Fiber'
import { Critical, Snell } from './waves/Refraction'
import { Source } from './waves/Source'
import { Spectrum } from './waves/Spectrum'
import { Wave } from './waves/Wave'
import './waves.css'

function SlabSimulator() {
  const [angle, setAngle] = useState(40); const [n2, setN2] = useState(1.5); const [slabThickness, setSlabThickness] = useState(1)
  const incidentRad = angle * Math.PI / 180
  const slabAngle = Math.asin(Math.sin(incidentRad) / n2)
  const lateralShift = slabThickness * Math.sin(incidentRad - slabAngle) / Math.cos(slabAngle)
  const slabDepth = 70 + slabThickness * 35
  const slabExitX = 190 + slabDepth * Math.tan(slabAngle)
  const incidentLeg = Math.min(65, 165 / Math.max(Math.tan(incidentRad), .01)); const exitLeg = Math.max(0, Math.min(65, (460 - slabExitX) / Math.max(Math.tan(incidentRad), .01)))
  return <><svg className="optics-stage slab-stage" viewBox="0 0 480 260"><rect x="0" y="80" width="480" height={slabDepth} /><line x1="0" y1="80" x2="480" y2="80" /><line x1="0" y1={80 + slabDepth} x2="480" y2={80 + slabDepth} /><line className="normal" x1="190" y1="18" x2="190" y2={95 + slabDepth} /><line className="normal" x1={slabExitX} y1={65 + slabDepth} x2={slabExitX} y2="250" /><path d={`M${190 - incidentLeg * Math.tan(incidentRad)} ${80 - incidentLeg} L190 80 L${slabExitX} ${80 + slabDepth} L${slabExitX + exitLeg * Math.tan(incidentRad)} ${80 + slabDepth + exitLeg}`} /><path className="ghost-ray" d={`M190 80L${190 + slabDepth * Math.tan(incidentRad)} ${80 + slabDepth}`} /><text x="18" y="35">ar · θ₁={angle}°</text><text x="18" y="112">lâmina n={n2.toFixed(2)}</text><text x="325" y="242">raios emergentes paralelos</text></svg><ResultStrip label="Desvio lateral" value={`${lateralShift.toFixed(3)} m`} formula="d=t\\sin(\\theta_1-\\theta_2)/\\cos\\theta_2" secondary={`θ₂=${(slabAngle*180/Math.PI).toFixed(1)}° · ângulo de saída = ${angle}°`} /><Control label="Ângulo com a normal" value={angle} min={5} max={75} step={1} onChange={setAngle} unit="°" /><Control label="Índice da lâmina" value={n2} min={1.1} max={1.8} step={0.05} onChange={setN2} unit="" /><Control label="Espessura t" value={slabThickness} min={0.2} max={2} step={0.1} onChange={setSlabThickness} unit="m" /></>
}

function PolarizerSimulator({ mode, params }: { mode: 'three' | 'malus' | 'single'; params: Record<string, string> }) {
  const [intensity, setIntensity] = useState(80)
  const [polarizedInput, setPolarizedInput] = useState(false)
  const [sourceAngle, setSourceAngle] = useState(0)
  const [angle1, setAngle1] = useState(mode === 'three' ? numberParam(params, 'a1', 0) : 0)
  const [angle2, setAngle2] = useState(mode === 'three' ? numberParam(params, 'a2', numberParam(params, 'angle2', 45)) : numberParam(params, 'angle2', 45))
  const [angle3, setAngle3] = useState(mode === 'three' ? numberParam(params, 'a3', 90) : 90)
  const axes = mode === 'single' ? [angle1] : mode === 'malus' ? [angle1, angle2] : [angle1, angle2, angle3]
  const values = polarizedInput
    ? axes.reduce<number[]>((items, axis, index) => [...items, malusIntensity(items.at(-1)!, axis - (index === 0 ? sourceAngle : axes[index - 1]))], [intensity])
    : unpolarizedThroughPolarizers(intensity, axes)
  const finalIntensity = values.at(-1)!
  const fraction = intensity === 0 ? 0 : finalIntensity / intensity
  const transmission = fraction * 100
  const fieldAmplitude = Math.sqrt(2 * finalIntensity / (3e8 * 8.854e-12))
  const formula = polarizedInput
    ? 'I_n=I_0\\prod\\cos^2(\\Delta\\theta)'
    : axes.length === 1 ? 'I_1=I_0/2' : 'I_n=\\frac{I_0}{2}\\prod_{k=2}^{n}\\cos^2(\\theta_k-\\theta_{k-1})'

  return <>
    <div className="source-kind"><span>Feixe incidente</span><div><button className={!polarizedInput ? 'active' : ''} onClick={() => setPolarizedInput(false)}>Não polarizado</button><button className={polarizedInput ? 'active' : ''} onClick={() => setPolarizedInput(true)}>Polarizado</button></div></div>
    <div className="polarizer-stage" role="img" aria-label={`${axes.length} polarizadores; intensidade final ${finalIntensity.toFixed(2)} watts por metro quadrado`}>
      <div className="light-source"><Radio size={20} /><span>{polarizedInput ? `θ₀ ${sourceAngle}°` : 'não pol.'}</span></div>
      {axes.map((axis, index) => <div className="filter-step" key={`${index}-${axis}`}><div className="light-beam"><i style={{ opacity: Math.max(.08, values[index] / intensity) }} /></div><div className="polarizer-disc"><i style={{ transform: `rotate(${axis}deg)` }} /><b>P{index + 1}</b><span>{axis}°</span></div></div>)}
      <div className="light-beam output-beam"><i style={{ opacity: Math.max(.05, finalIntensity / intensity) }} /></div><div className="detector"><strong>I{axes.length}</strong><span>{transmission.toFixed(1)}%</span></div>
    </div>
    <div className="intensity-steps">{values.map((value, index) => <span key={index}><small>I{index}</small><strong>{value.toFixed(2)}</strong></span>)}</div>
    <ResultStrip label={`Intensidade após P${axes.length}`} value={`${finalIntensity.toFixed(2)} W/m²`} formula={formula} secondary={`I${axes.length} = ${fraction.toFixed(3).replace('.', ',')} I₀ · Transmissão ${transmission.toFixed(1)}% · E₀ final=${fieldAmplitude.toFixed(1)} V/m`} />
    <Control label="Intensidade inicial I₀" value={intensity} min={10} max={200} step={5} onChange={setIntensity} unit="W/m²" />
    {polarizedInput && <Control label="Eixo inicial θ₀" value={sourceAngle} min={0} max={180} step={5} onChange={setSourceAngle} unit="°" />}
    <Control label="Eixo de P₁" value={angle1} min={0} max={180} step={5} onChange={setAngle1} unit="°" />
    {axes.length >= 2 && <Control label="Eixo de P₂" value={angle2} min={0} max={180} step={5} onChange={setAngle2} unit="°" />}
    {axes.length === 3 && <Control label="Eixo de P₃" value={angle3} min={0} max={180} step={5} onChange={setAngle3} unit="°" />}
    {mode === 'three' && <p className="polarizer-insight"><strong>Repara:</strong> com P₁ e P₃ cruzados sairia zero sem P₂. A orientação intermédia pode voltar a deixar passar luz. Só contam os ângulos entre eixos consecutivos: no ex. 8 da ficha 4 são 60° e 30°, logo I₃ = ½·cos²60°·cos²30°·I₀.</p>}
  </>
}

export const waveLabs: Partial<Record<FamilyId, LabScenario[]>> = {
  optics: [
    { id: 'slab', label: 'Faces paralelas', component: () => <SlabSimulator /> },
    { id: 'snell', label: 'Lei de Snell', component: Snell },
    { id: 'critical', label: 'Ângulo crítico', component: Critical },
    { id: 'fiber', label: 'Fibra ótica', component: Fiber },
    { id: 'block', label: 'Bloco com parede lateral', component: Block },
  ],
  em_waves: [
    { id: 'wave', label: 'Onda EM', component: Wave },
    { id: 'source', label: 'Fonte isotrópica', component: Source },
    { id: 'spectrum', label: 'Espetro e antenas', component: Spectrum },
    { id: 'three', label: '3 polarizadores', component: ({ params }) => <PolarizerSimulator mode="three" params={params} /> },
    { id: 'malus', label: 'Lei de Malus', component: ({ params }) => <PolarizerSimulator mode="malus" params={params} /> },
    { id: 'single', label: '1.º polarizador', component: ({ params }) => <PolarizerSimulator mode="single" params={params} /> },
    { id: 'brewster', label: 'Ângulo de Brewster', component: Brewster },
  ],
}
