/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { compositeThermalConduction } from '../domain/exercises/calculators'
import type { FamilyId } from '../domain/types'
import './thermal.css'
import { Convection } from './thermal/Convection'
import { Expansion } from './thermal/Expansion'
import { positive, widen } from './thermal/format'
import { Heating } from './thermal/Heating'
import { Joule } from './thermal/Joule'
import { Mixed } from './thermal/Mixed'
import { Mixing } from './thermal/Mixing'
import { Radiation } from './thermal/Radiation'
import { Scales } from './thermal/Scales'
import { Wall } from './thermal/Wall'
import { Control, ResultStrip, numberParam, type LabScenario } from './ui'

function ThermalSimulator({ mode, params }: { mode: 'layers' | 'single' | 'network'; params: Record<string, string> }) {
  const initialThickness = positive(numberParam(params, 'l1', 0.08), 0.08); const initialK = positive(numberParam(params, 'k1', 0.8), 0.8)
  const initialThickness2 = positive(numberParam(params, 'l2', 0.12), 0.12); const initialK2 = positive(numberParam(params, 'k2', 0.2), 0.2)
  const [thickness, setThickness] = useState(initialThickness); const [k, setK] = useState(initialK)
  const [thickness2, setThickness2] = useState(initialThickness2); const [k2, setK2] = useState(initialK2)
  const [hotBoundary, setHotBoundary] = useState(100); const [steelLength, setSteelLength] = useState(0.24)
  const area = positive(numberParam(params, 'area', 2), 2); const hot = numberParam(params, 'hot', 40); const cold = numberParam(params, 'cold', 15)
  const r1 = thickness / (k * area); const r2 = thickness2 / (k2 * area)
  const resistance = mode === 'layers' ? r1 + r2 : r1
  const value = mode === 'layers' ? compositeThermalConduction(area, hot - cold, [{ thickness, conductivity: k }, { thickness: thickness2, conductivity: k2 }]) : (hot - cold) / resistance
  const interfaceTemp = hot - value * r1
  const networkArea = 2e-4
  const copperResistance = 0.13 / (401 * networkArea); const brassResistance = 0.18 / (109 * networkArea); const steelResistance = steelLength / (14 * networkArea)
  const junctionTemp = (hotBoundary / copperResistance) / (1 / copperResistance + 1 / brassResistance + 1 / steelResistance)
  const copperFlow = (hotBoundary - junctionTemp) / copperResistance; const brassFlow = junctionTemp / brassResistance; const steelFlow = junctionTemp / steelResistance
  return <>
    {mode !== 'network' && <><div className="wall-stage composite"><span className="hot">{hot}°C</span><div className="wall layer-one" style={{ width: `${45 + Math.min(thickness, 0.3) * 420}px` }}><small>k₁</small></div>{mode === 'layers' && <><i>{interfaceTemp.toFixed(1)}°</i><div className="wall layer-two" style={{ width: `${45 + Math.min(thickness2, 0.3) * 420}px` }}><small>k₂</small></div></>}<div className="heat-arrows">→ →</div><span className="cold">{cold}°C</span></div><ResultStrip label="Fluxo de calor estacionário" value={`${value.toFixed(1)} W`} formula={mode === 'layers' ? 'R_{eq}=L_1/(k_1A)+L_2/(k_2A)' : '\\dot Q=kA\\Delta T/L'} secondary={mode === 'layers' ? `T interface=${interfaceTemp.toFixed(1)} °C · maior queda na maior resistência` : `Rth=${r1.toFixed(3)} K/W · A=${area} m²`} /><Control label="Espessura L₁" value={thickness} {...widen(initialThickness, 0.005, 0.2, 0.005)} onChange={setThickness} unit="m" /><Control label="Condutividade k₁" value={k} {...widen(initialK, 0.04, 1, 0.01)} onChange={setK} unit="W/(m·K)" />{mode === 'layers' && <><Control label="Espessura L₂" value={thickness2} {...widen(initialThickness2, 0.005, 0.2, 0.005)} onChange={setThickness2} unit="m" /><Control label="Condutividade k₂" value={k2} {...widen(initialK2, 0.04, 1, 0.01)} onChange={setK2} unit="W/(m·K)" /></>}</>}
    {mode === 'network' && <><svg className="thermal-network-stage" viewBox="0 0 480 230" role="img" aria-label="Três barras térmicas ligadas numa junção em Y"><path className="copper-rod" d="M55 40L240 120" /><path className="brass-rod" d="M240 120L425 40" /><path className="steel-rod" d="M240 120L240 210" /><circle cx="240" cy="120" r="12" /><text x="25" y="28">cobre · {hotBoundary}°C</text><text x="350" y="28">latão · 0°C</text><text x="255" y="213">aço · 0°C</text><text className="junction-label" x="255" y="114">Tⱼ={junctionTemp.toFixed(1)}°C</text><text className="flow-label" x="92" y="130">{copperFlow.toFixed(1)} W → nó</text><text className="flow-label" x="330" y="130">nó → {brassFlow.toFixed(1)} W</text><text className="flow-label" x="152" y="184">nó → {steelFlow.toFixed(1)} W</text></svg><ResultStrip label="Temperatura da junção" value={`${junctionTemp.toFixed(2)} °C`} formula="\\dot Q_{in}=\\dot Q_{out}" secondary={`Rcobre=${copperResistance.toFixed(2)} · Rlatão=${brassResistance.toFixed(2)} · Raço=${steelResistance.toFixed(2)} K/W`} /><Control label="Temperatura no cobre" value={hotBoundary} min={20} max={150} step={5} onChange={setHotBoundary} unit="°C" /><Control label="Comprimento do aço" value={steelLength} min={0.08} max={0.5} step={0.01} onChange={setSteelLength} unit="m" /><p className="balance-note">Verificação do nó: {copperFlow.toFixed(2)} W entram; {(brassFlow + steelFlow).toFixed(2)} W saem.</p></>}
  </>
}

export const thermalLabs: Partial<Record<FamilyId, LabScenario[]>> = {
  thermal_transport: [
    { id: 'wall', label: 'Parede de N camadas', component: Wall },
    { id: 'layers', label: 'Parede composta', component: ({ params }) => <ThermalSimulator mode="layers" params={params} /> },
    { id: 'single', label: 'Camada única', component: ({ params }) => <ThermalSimulator mode="single" params={params} /> },
    { id: 'mixed', label: 'Série + paralelo', component: Mixed },
    { id: 'network', label: 'Rede térmica em Y', component: ({ params }) => <ThermalSimulator mode="network" params={params} /> },
    { id: 'radiation', label: 'Radiação térmica', component: Radiation },
    { id: 'convection', label: 'Convecção', component: Convection },
  ],
  thermal_equilibrium: [
    { id: 'mixing', label: 'Calorímetro', component: Mixing },
    { id: 'heating', label: 'Curva de aquecimento', component: Heating },
    { id: 'expansion', label: 'Dilatação térmica', component: Expansion },
    { id: 'scales', label: 'Escalas de temperatura', component: Scales },
    { id: 'joule', label: 'Experiência de Joule', component: Joule },
  ],
}
