import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { fmt } from './format'
import { chargedSheets, sliderRange } from './physics'
import { Arrow, ArrowDefs, type ArrowKind } from './svg'

const ID = 'sheets'
const CENTRE = 262
const ROWS = { plus: 62, minus: 104, total: 150 }

/** Folha 1, exercício 11: σ₊ = 6,8 μC/m², |σ₋| = 4,3 μC/m², d = 5 mm, q = −3,5 μC de A (placa +) para B (placa −). */
export function Sheets({ params }: LabProps) {
  const [initial] = useState(() => ({ sp: numberParam(params, 'sp', 6.8), sm: Math.abs(numberParam(params, 'sm', 4.3)), d: numberParam(params, 'd', 5), q: numberParam(params, 'q', -3.5) }))
  const [sigmaPlus, setSigmaPlus] = useState(initial.sp)
  const [sigmaMinus, setSigmaMinus] = useState(initial.sm)
  const [separation, setSeparation] = useState(initial.d)
  const [charge, setCharge] = useState(initial.q)
  const ranges = { sp: sliderRange(initial.sp, 0, 20, 0.1), sm: sliderRange(initial.sm, 0, 20, 0.1), d: sliderRange(initial.d, 1, 50, 0.5), q: sliderRange(initial.q, -10, 10, 0.1) }

  // SI: μC/m² → C/m², mm → m, μC → C.
  const result = chargedSheets(sigmaPlus * 1e-6, sigmaMinus * 1e-6, separation * 1e-3, charge * 1e-6)

  const gap = 70 + 130 * Math.max(0, separation) / (Math.max(0, separation) + 5)
  const plusX = CENTRE - gap / 2
  const minusX = CENTRE + gap / 2
  const regions = [
    { name: 'left', centre: (58 + plusX - 8) / 2, plus: -1, minus: 1, total: result.left },
    { name: 'between', centre: CENTRE, plus: 1, minus: 1, total: result.between },
    { name: 'right', centre: (minusX + 8 + 474) / 2, plus: 1, minus: -1, total: result.right },
  ]
  // Todas as setas à mesma escala: a maior (campo total entre as placas) mede 56 px.
  const scale = result.between > 0 ? 56 / result.between : 0
  const arrow = (key: string, kind: ArrowKind, centre: number, y: number, signedField: number, thick = false, className = '') => {
    const half = signedField * scale / 2
    if (Math.abs(half) < 0.75) return <text key={key} className="lab-electro-name lab-electro-zero" x={centre} y={y + 4} textAnchor="middle">0</text>
    return <Arrow key={key} prefix={ID} kind={kind} thick={thick} className={className} x1={centre - half} y1={y} x2={centre + half} y2={y} />
  }
  const forceDirection = Math.sign(charge) * (result.between > 0 ? 1 : 0)
  const outside = Math.abs(result.left)

  return <>
    <svg className="lab-electro-stage" viewBox="0 0 480 240" role="img" aria-label={`Duas placas paralelas infinitas com σ₊ = ${fmt(sigmaPlus, 1)} e σ₋ = −${fmt(sigmaMinus, 1)} μC/m², separadas de ${fmt(separation, 1)} mm. Campo entre as placas: ${sig(result.between)} N/C, da placa positiva para a negativa; fora das placas: ${sig(outside)} N/C.`}>
      <ArrowDefs prefix={ID} kinds={['e', 'f', 'pos', 'neg']} />
      <text className="lab-electro-label positive" x="6" y={ROWS.plus + 4}>E₊</text>
      <text className="lab-electro-label negative" x="6" y={ROWS.minus + 4}>E₋</text>
      <text className="lab-electro-label field" x="6" y={ROWS.total + 4}>E total</text>

      <rect className={`lab-electro-sheet ${sigmaPlus > 0 ? 'positive' : 'neutral'}`} x={plusX - 8} y="30" width="8" height="166" />
      <rect className={`lab-electro-sheet ${sigmaMinus > 0 ? 'negative' : 'neutral'}`} x={minusX} y="30" width="8" height="166" />
      <text className="lab-electro-name" x={plusX} y="20" textAnchor="end">σ₊ = +{fmt(sigmaPlus, 1)} μC/m²</text>
      <text className="lab-electro-name" x={minusX} y="20">σ₋ = −{fmt(sigmaMinus, 1)} μC/m²</text>

      {regions.map((region) => <g key={region.name} className={`lab-electro-region-${region.name}`}>
        {arrow('plus', 'pos', region.centre, ROWS.plus, region.plus * result.fieldPlus)}
        {arrow('minus', 'neg', region.centre, ROWS.minus, region.minus * result.fieldMinus)}
        {arrow('total', 'e', region.centre, ROWS.total, region.total, true, 'lab-electro-e-total')}
      </g>)}

      <path className="lab-electro-dimension" d={`M${plusX} 184H${minusX}M${plusX} 180v8M${minusX} 180v8`} />
      <text className="lab-electro-name" x={CENTRE} y="178" textAnchor="middle">d = {fmt(separation, 1)} mm</text>

      <line className="lab-electro-guide lab-electro-path" x1={plusX + 6} y1="216" x2={minusX - 6} y2="216" />
      <circle className="lab-electro-point" cx={minusX - 6} cy="216" r="3.5" />
      <text className="lab-electro-name" x={plusX + 6} y="236" textAnchor="middle">A</text>
      <text className="lab-electro-name" x={minusX - 6} y="236" textAnchor="middle">B</text>
      {forceDirection !== 0 && <>
        <Arrow prefix={ID} kind="f" className="lab-electro-force" x1={plusX + 6} y1={216} x2={plusX + 6 + forceDirection * 34} y2={216} />
        <text className="lab-electro-label force" x={plusX + 6 + forceDirection * 30} y="207" textAnchor="middle">F</text>
      </>}
      <circle className={`lab-electro-charge ${charge > 0 ? 'positive' : charge < 0 ? 'negative' : 'neutral'}`} cx={plusX + 6} cy="216" r="6" />
    </svg>
    <p className="lab-electro-caption">Cada linha mostra um campo nas três regiões, à mesma escala: o de cada placa sozinha e a soma. A distância entre placas usa uma escala visual saturada.</p>

    <ResultStrip label="Campo entre as placas" value={`${sig(result.between)} N/C`} formula="E=\frac{\sigma_+ + |\sigma_-|}{2\,\varepsilon_0}" secondary={`fora das placas: ${sig(outside)} N/C`} />
    <Metrics items={[
      { label: 'Placa + sozinha: σ₊/2ε₀', value: `${sig(result.fieldPlus)} N/C` },
      { label: 'Placa − sozinha: |σ₋|/2ε₀', value: `${sig(result.fieldMinus)} N/C` },
      { label: 'ΔV = E·d', value: result.deltaV >= 1000 ? `${sig(result.deltaV / 1000)} kV` : `${sig(result.deltaV)} V` },
      { label: 'Trabalho A → B: q·ΔV', value: `${sig(result.work * 1e3)} mJ` },
    ]} />

    <Control label="Placa positiva σ₊" value={sigmaPlus} min={ranges.sp.min} max={ranges.sp.max} step={ranges.sp.step} onChange={setSigmaPlus} unit="μC/m²" />
    <Control label="Placa negativa |σ₋|" value={sigmaMinus} min={ranges.sm.min} max={ranges.sm.max} step={ranges.sm.step} onChange={setSigmaMinus} unit="μC/m²" />
    <Control label="Separação d" value={separation} min={ranges.d.min} max={ranges.d.max} step={ranges.d.step} onChange={setSeparation} unit="mm" />
    <Control label="Carga transportada q" value={charge} min={ranges.q.min} max={ranges.q.max} step={ranges.q.step} onChange={setCharge} unit="μC" />

    <LabNote title="Leitura do diagrama:">cada placa cria σ/(2ε₀) para os dois lados. Entre as placas os dois campos têm o mesmo sentido e somam-se; fora têm sentidos opostos e só se anulam por completo se σ₊ = |σ₋|. O troço do trajeto paralelo às placas não realiza trabalho: só conta a distância d ao longo do campo.</LabNote>
  </>
}
