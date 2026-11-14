import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, type LabProps } from '../ui'
import { eng, num } from './format'
import { parallelPlate } from './physics'

const CENTER = { x: 240, y: 120 }
const THICKNESS = 8

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

export function Capacitor({ params }: LabProps) {
  const [area, setArea] = useState(Math.abs(numberParam(params, 'A', 4.91)))
  const [separation, setSeparation] = useState(Math.max(0.01, numberParam(params, 'd', 0.2)))
  const [dielectric, setDielectric] = useState(Math.max(1, numberParam(params, 'er', 2.3)))
  const [voltage, setVoltage] = useState(Math.abs(numberParam(params, 'V', 80)))
  const [limits] = useState(() => ({ separation: Math.max(10, Math.ceil(separation)), dielectric: Math.max(10, Math.ceil(dielectric)), voltage: Math.max(500, Math.ceil(voltage)) }))

  const state = parallelPlate(area, separation * 1e-3, dielectric, voltage)
  // Escalas logarítmicas: d de 0,01 a 100 mm → 24 a 250 px; A de 10⁻⁶ a 10 m² → 60 a 170 px.
  const gap = 24 + 226 * clamp((Math.log10(separation) + 2) / 4, 0, 1)
  const plate = 60 + 110 * (area > 0 ? clamp((Math.log10(area) + 6) / 7, 0, 1) : 0)
  const left = CENTER.x - gap / 2
  const right = CENTER.x + gap / 2
  const top = CENTER.y - plate / 2
  const lines = state.field > 0 ? clamp(Math.round(1 + 2.4 * Math.log10(1 + state.field / 1e3)), 1, 13) : 0
  const force = state.electronForce > 0 ? clamp(10 + 6 * Math.log10(1 + state.electronForce / 1e-17), 10, gap / 2 - 6) : 0
  const tint = Math.round(45 * (1 - 1 / dielectric))
  const dimension = CENTER.y + plate / 2 + 14

  return (
    <>
      <svg className="lab-circuits-stage lab-circuits-capacitor" viewBox="0 0 480 240" role="img" aria-label={`Condensador plano com placas de ${num(area)} m² separadas por ${num(separation)} mm e dielétrico de constante ${num(dielectric)}, ligado a ${num(voltage)} V: capacidade ${eng(state.capacitance, 'F', 3, 0.1)}, campo ${num(state.field)} V/m, ${lines} linhas de campo desenhadas`}>
        <defs>
          <marker id="rc-capacitor-field" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path className="lab-circuits-field-head" d="M0 0L10 5L0 10z" /></marker>
          <marker id="rc-capacitor-force" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path className="lab-circuits-force-head" d="M0 0L10 5L0 10z" /></marker>
        </defs>
        <text x="12" y="20">εr = {num(dielectric)}{dielectric === 1 ? ' (vazio)' : ''}</text>
        <text className="lab-circuits-field-label" x={CENTER.x} y="20" textAnchor="middle">E = {num(state.field)} V/m →</text>
        <rect className="lab-circuits-dielectric" x={left.toFixed(1)} y={top.toFixed(1)} width={gap.toFixed(1)} height={plate.toFixed(1)} style={{ fill: `color-mix(in srgb, var(--blue) ${tint}%, transparent)` }} />
        {Array.from({ length: lines }, (_, index) => {
          const y = (top + (index + 0.5) * plate / lines).toFixed(1)
          return <path key={index} className="lab-circuits-field-line" d={`M${left.toFixed(1)} ${y}H${CENTER.x}H${right.toFixed(1)}`} markerMid="url(#rc-capacitor-field)" />
        })}
        <rect className="lab-circuits-plate-positive" x={(left - THICKNESS).toFixed(1)} y={top.toFixed(1)} width={THICKNESS} height={plate.toFixed(1)} />
        <rect className="lab-circuits-plate-negative" x={right.toFixed(1)} y={top.toFixed(1)} width={THICKNESS} height={plate.toFixed(1)} />
        <text className="lab-circuits-charge-plus" x={(left - THICKNESS - 6).toFixed(1)} y={CENTER.y + 4} textAnchor="end">+{eng(state.charge, 'C')}</text>
        <text className="lab-circuits-charge-minus" x={(right + THICKNESS + 6).toFixed(1)} y={CENTER.y + 4}>−{eng(state.charge, 'C')}</text>
        {force > 0 && <line className="lab-circuits-force" x1={CENTER.x} y1={CENTER.y} x2={(CENTER.x - force).toFixed(1)} y2={CENTER.y} markerEnd="url(#rc-capacitor-force)" />}
        <circle className="lab-circuits-electron" cx={CENTER.x} cy={CENTER.y} r="5" />
        {gap >= 110
          ? <text className="lab-circuits-force-label" x={CENTER.x + 9} y={CENTER.y - 8}>e⁻{force > 0 ? ' · F ←' : ''}</text>
          : <text className="lab-circuits-force-label" x={(right + THICKNESS + 6).toFixed(1)} y={CENTER.y - 12}>e⁻{force > 0 ? ' · F ←' : ''}</text>}
        <path className="lab-circuits-axis" d={`M${left.toFixed(1)} ${dimension}H${right.toFixed(1)}M${left.toFixed(1)} ${dimension - 4}V${dimension + 4}M${right.toFixed(1)} ${dimension - 4}V${dimension + 4}`} />
        <text x={CENTER.x} y={dimension + 15} textAnchor="middle">d = {num(separation)} mm</text>
        <text x="12" y="232">desenho em escala logarítmica</text>
      </svg>
      <ResultStrip label="Capacidade" value={eng(state.capacitance, 'F', 3, 0.1)} formula="C=\varepsilon_r\varepsilon_0\dfrac{A}{d}\qquad E=\dfrac{V}{d}\qquad U=\tfrac{1}{2}CV^2" secondary={`Q = C·V = ${eng(state.charge, 'C')}`} />
      <Metrics items={[
        { label: 'Carga em cada placa', value: eng(state.charge, 'C') },
        { label: 'Campo entre as placas', value: `${num(state.field)} V/m` },
        { label: 'Energia armazenada', value: `${num(state.energy)} J` },
        { label: 'Força sobre um eletrão', value: `${num(state.electronForce)} N` },
      ]} />
      <Control label="Separação d" value={separation} min={0.01} max={limits.separation} step={0.01} onChange={setSeparation} unit="mm" />
      <Control label="Constante dielétrica εr" value={dielectric} min={1} max={limits.dielectric} step={0.1} onChange={setDielectric} unit="" />
      <Control label="Tensão V" value={voltage} min={0} max={limits.voltage} step={1} onChange={setVoltage} unit="V" />
      <NumberField label="Área de cada placa A" value={area} onChange={(value) => setArea(Math.abs(value))} unit="m²" hint="100 mm² = 1e-4 m²" />
      <LabNote title="Leitura do diagrama:">aproximar as placas aumenta a capacidade e, com a mesma tensão, o campo E = V/d (mais linhas). O dielétrico multiplica a capacidade por εr sem alterar E. O eletrão é puxado para a placa positiva, contra o sentido de E. As distâncias e o número de linhas estão em escala logarítmica.</LabNote>
    </>
  )
}
