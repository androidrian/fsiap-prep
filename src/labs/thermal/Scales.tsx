import { useState, type CSSProperties } from 'react'
import { Formula } from '../../components/Formula'
import { Control, LabNote, NumberField, ResultStrip, numberParam, type LabProps } from '../ui'
import { clamp, compact, fix, tex } from './format'
import { ABSOLUTE_ZERO, celsiusToFahrenheit, celsiusToKelvin, fahrenheitToCelsius, kelvinToCelsius } from './physics'

const TUBE_LEFT = 40
const TUBE_RIGHT = 440
const SCALE_MAX = 200
const TUBE_TOP = 44
const TUBE_BOTTOM = 60

function tubeX(celsius: number): number {
  return TUBE_LEFT + ((celsius - ABSOLUTE_ZERO) / (SCALE_MAX - ABSOLUTE_ZERO)) * (TUBE_RIGHT - TUBE_LEFT)
}

const CELSIUS_TICKS = [-250, -200, -150, -100, -50, 0, 50, 100, 150, 200]
const FAHRENHEIT_TICKS = [-400, -300, -200, -100, 0, 100, 200, 300]
const KELVIN_TICKS = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450]
const REFERENCES: ReadonlyArray<{ celsius: number; text: string; row: number; anchor: 'start' | 'middle' }> = [
  { celsius: ABSOLUTE_ZERO, text: 'zero absoluto', row: 0, anchor: 'start' },
  { celsius: 0, text: 'água congela', row: 0, anchor: 'middle' },
  { celsius: 37, text: 'corpo 37°', row: 1, anchor: 'middle' },
  { celsius: 100, text: 'água ferve', row: 0, anchor: 'middle' },
]

export function Scales({ params }: LabProps) {
  const [celsius, setCelsius] = useState(() => Math.max(numberParam(params, 'C', -71), ABSOLUTE_ZERO))
  const fahrenheit = celsiusToFahrenheit(celsius)
  const kelvin = celsiusToKelvin(celsius)
  const level = tubeX(clamp(celsius, ABSOLUTE_ZERO, SCALE_MAX))
  const offScale = celsius > SCALE_MAX
  const warmth = Math.round(clamp((celsius + 40) / 140, 0, 1) * 100)
  const update = (value: number) => setCelsius(Math.max(value, ABSOLUTE_ZERO))
  const cText = fix(celsius, 1)
  const fText = fix(fahrenheit, 1)
  const kText = fix(kelvin, 2)

  const label = `Termómetro com três escalas: ${cText} graus Celsius correspondem a ${fText} graus Fahrenheit e a ${kText} kelvin${offScale ? ' (acima do topo da escala desenhada)' : ''}.`

  return <>
    <svg className="lab-thermal-stage lab-thermal-scales" viewBox="0 0 480 240" role="img" aria-label={label} style={{ '--warmth': `${warmth}%` } as CSSProperties}>
      {REFERENCES.map((reference) => <g key={reference.text}>
        <line className="lab-thermal-guide" x1={tubeX(reference.celsius).toFixed(1)} y1={reference.row === 0 ? 17 : 31} x2={tubeX(reference.celsius).toFixed(1)} y2={TUBE_TOP} />
        <text x={tubeX(reference.celsius)} y={reference.row === 0 ? 13 : 28} textAnchor={reference.anchor}>{reference.text}</text>
      </g>)}
      <rect className="lab-thermal-tube" x={TUBE_LEFT - 14} y={TUBE_TOP} width={TUBE_RIGHT - TUBE_LEFT + 22} height={TUBE_BOTTOM - TUBE_TOP} rx="8" />
      <circle className="lab-thermal-bulb" cx={TUBE_LEFT - 14} cy={(TUBE_TOP + TUBE_BOTTOM) / 2} r="13" />
      <rect className="lab-thermal-mercury" x={TUBE_LEFT - 14} y={TUBE_TOP + 4} width={(level - TUBE_LEFT + 14).toFixed(1)} height={TUBE_BOTTOM - TUBE_TOP - 8} rx="4" />
      <line className="lab-thermal-reading" x1={level.toFixed(1)} y1={TUBE_TOP - 4} x2={level.toFixed(1)} y2="158" />
      {CELSIUS_TICKS.map((value) => <g key={value}>
        <line className="lab-thermal-axis" x1={tubeX(value).toFixed(1)} y1={TUBE_BOTTOM} x2={tubeX(value).toFixed(1)} y2={TUBE_BOTTOM + 6} />
        <text x={tubeX(value)} y="80" textAnchor="middle">{value}</text>
      </g>)}
      <text className="lab-thermal-name" x="452" y="80">°C</text>
      <line className="lab-thermal-axis" x1={TUBE_LEFT} y1="94" x2={TUBE_RIGHT} y2="94" />
      {FAHRENHEIT_TICKS.map((value) => <g key={value}>
        <line className="lab-thermal-axis" x1={tubeX(fahrenheitToCelsius(value)).toFixed(1)} y1="94" x2={tubeX(fahrenheitToCelsius(value)).toFixed(1)} y2="100" />
        <text x={tubeX(fahrenheitToCelsius(value))} y="114" textAnchor="middle">{value}</text>
      </g>)}
      <text className="lab-thermal-name" x="452" y="114">°F</text>
      <line className="lab-thermal-axis" x1={TUBE_LEFT} y1="128" x2={TUBE_RIGHT} y2="128" />
      {KELVIN_TICKS.map((value) => <g key={value}>
        <line className="lab-thermal-axis" x1={tubeX(kelvinToCelsius(value)).toFixed(1)} y1="128" x2={tubeX(kelvinToCelsius(value)).toFixed(1)} y2="134" />
        <text x={tubeX(kelvinToCelsius(value))} y="148" textAnchor="middle">{value}</text>
      </g>)}
      <text className="lab-thermal-name" x="452" y="148">K</text>
      <text className="lab-thermal-readout" x="86" y="200" textAnchor="middle">{cText} °C</text>
      <text className="lab-thermal-readout" x="240" y="200" textAnchor="middle">{fText} °F</text>
      <text className="lab-thermal-readout" x="394" y="200" textAnchor="middle">{kText} K</text>
      <text x="163" y="200" textAnchor="middle">=</text>
      <text x="317" y="200" textAnchor="middle">=</text>
      <text x="240" y="230" textAnchor="middle">{offScale ? 'valor acima do topo da escala desenhada (200 °C)' : 'a coluna de mercúrio acompanha a temperatura nas três escalas'}</text>
    </svg>
    <ResultStrip label="A mesma temperatura" value={`${cText} °C = ${fText} °F = ${kText} K`} formula="T_F=\tfrac95\,T_C+32,\quad T_K=T_C+273{,}15" />
    <div className="lab-thermal-steps">
      <Formula value={`T_F=\\tfrac95\\,(${tex(compact(celsius, 5))})+32=${tex(fText)}\\ ^\\circ\\mathrm{F}`} />
      <Formula value={`T_K=${tex(compact(celsius, 5))}+273{,}15=${tex(kText)}\\ \\mathrm{K}`} />
      <Formula value={`T_C=\\tfrac59\\,(${tex(compact(fahrenheit, 5))}-32)=${tex(cText)}\\ ^\\circ\\mathrm{C}`} />
    </div>
    <Control label="Temperatura" value={celsius} min={ABSOLUTE_ZERO} max={SCALE_MAX} step={0.05} onChange={update} unit="°C" />
    <div className="lab-thermal-fields">
      <NumberField label="Temperatura em °C" value={celsius} unit="°C" onChange={update} />
      <NumberField label="Temperatura em °F" value={Number(fahrenheit.toFixed(4))} unit="°F" onChange={(value) => update(fahrenheitToCelsius(value))} />
      <NumberField label="Temperatura em K" value={Number(kelvin.toFixed(4))} unit="K" onChange={(value) => update(kelvinToCelsius(value))} />
    </div>
    <LabNote title="Armadilha.">Um intervalo de 1 °C vale 1 K mas 1,8 °F: as escalas Celsius e Kelvin só diferem na origem, a Fahrenheit difere na origem e no tamanho do grau. No SI regista-se em kelvin (sem o símbolo de grau) e nenhuma temperatura fica abaixo de 0 K = −273,15 °C = −459,67 °F.</LabNote>
  </>
}
