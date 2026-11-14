import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, compact, fix, positive, widen } from './format'
import { mixing, unknownSpecificHeat } from './physics'

const WATER_HEAT = 4186

function joules(value: number): string {
  return `${sig(Math.abs(value), 4)} J`
}

export function Mixing({ params }: LabProps) {
  const initialMass1 = positive(numberParam(params, 'm1', 1), 1)
  const initialMass2 = positive(numberParam(params, 'm2', 2), 2)
  const initialTemp1 = numberParam(params, 'T1', 70)
  const initialTemp2 = numberParam(params, 'T2', 15)
  const [mass1, setMass1] = useState(initialMass1)
  const [mass2, setMass2] = useState(initialMass2)
  const [heat1, setHeat1] = useState(() => positive(numberParam(params, 'c1', WATER_HEAT), WATER_HEAT))
  const [heat2, setHeat2] = useState(() => positive(numberParam(params, 'c2', WATER_HEAT), WATER_HEAT))
  const [temp1, setTemp1] = useState(initialTemp1)
  const [temp2, setTemp2] = useState(initialTemp2)
  const [measured, setMeasured] = useState<number | null>(null)

  const result = mixing(mass1, heat1, temp1, mass2, heat2, temp2)
  const finalText = fix(result.final, 1)
  const measuredFinal = measured ?? Number(result.final.toFixed(2))
  const unknown = unknownSpecificHeat(mass1, temp1, mass2, heat2, temp2, measured ?? result.final)
  const possible = Number.isFinite(unknown) && unknown > 0
  const sameMaterial = heat1 === heat2
  const warmer = temp1 >= temp2 ? 1 : 2
  const beaker = (mass: number) => `${clamp(70 + mass * 30, 75, 160).toFixed(0)}px`

  const label = `Corpo 1 com ${compact(mass1)} kg a ${compact(temp1)} °C e corpo 2 com ${compact(mass2)} kg a ${compact(temp2)} °C trocam calor até ficarem a ${finalText} °C.`

  return <>
    <div className="beaker-stage" role="img" aria-label={label}>
      <div className={`beaker ${warmer === 1 ? 'hot-beaker' : 'cold-beaker'}`} style={{ height: beaker(mass1) }}><span>{compact(temp1)}°</span></div>
      <strong>+</strong>
      <div className={`beaker ${warmer === 1 ? 'cold-beaker' : 'hot-beaker'}`} style={{ height: beaker(mass2) }}><span>{compact(temp2)}°</span></div>
      <strong>→</strong>
      <div className="beaker mixed-beaker"><span>{finalText}°C</span></div>
    </div>
    <ResultStrip label="Temperatura de equilíbrio" value={`${finalText} °C`} formula="T_f=\dfrac{m_1c_1T_1+m_2c_2T_2}{m_1c_1+m_2c_2}" secondary={sameMaterial ? 'mesmo material · sem perdas · ΣQ = 0' : 'sem perdas · ΣQ = 0'} />
    <Metrics items={[
      { label: `Corpo 1 ${result.heat1 <= 0 ? 'cede' : 'recebe'}`, value: joules(result.heat1) },
      { label: `Corpo 2 ${result.heat2 < 0 ? 'cede' : 'recebe'}`, value: joules(result.heat2) },
      { label: 'Capacidades térmicas', value: `${sig(mass1 * heat1)} e ${sig(mass2 * heat2)} J/K` },
    ]} />
    <Control label="Massa quente" value={mass1} {...widen(initialMass1, 0.2, 3, 0.1)} onChange={setMass1} unit="kg" />
    <Control label="Massa fria" value={mass2} {...widen(initialMass2, 0.2, 3, 0.1)} onChange={setMass2} unit="kg" />
    <Control label="Temperatura quente" value={temp1} {...widen(initialTemp1, 30, 95, 1)} onChange={setTemp1} unit="°C" />
    <Control label="Temperatura fria" value={temp2} {...widen(initialTemp2, 0, 40, 1)} onChange={setTemp2} unit="°C" />
    <div className="lab-thermal-fields">
      <NumberField label="Calor específico do corpo quente c₁" value={heat1} unit="J/(kg·K)" hint="água: 4186" onChange={(value) => { if (value > 0) setHeat1(value) }} />
      <NumberField label="Calor específico do corpo frio c₂" value={heat2} unit="J/(kg·K)" hint="água: 4186" onChange={(value) => { if (value > 0) setHeat2(value) }} />
      <NumberField label="Temperatura final medida" value={measuredFinal} unit="°C" hint="problema inverso" onChange={setMeasured} />
    </div>
    <p className="lab-thermal-inverse"><strong>Inverso.</strong> Se a temperatura final medida for {compact(measuredFinal, 4)} °C, o calor específico do corpo quente é c₁ = m₂c₂(T_f − T₂) / [m₁(T₁ − T_f)] = <strong>{possible ? `${sig(unknown, 4)} J/(kg·K)` : '—'}</strong>{possible ? '.' : ' (a temperatura final tem de ficar entre T₂ e T₁).'}</p>
    <LabNote title="Leitura.">O calor cedido por um corpo é igual ao recebido pelo outro. A temperatura final é a média das temperaturas pesada pelas capacidades térmicas m·c: fica mais perto do corpo com maior m·c, não necessariamente do mais pesado.</LabNote>
  </>
}
