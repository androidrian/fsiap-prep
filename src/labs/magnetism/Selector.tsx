import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { spanFor } from './format'
import { ELEMENTARY_CHARGE, velocitySelector } from './physics'
import { Arrow, ArrowHeads, FieldPattern } from './svg'

const signOptions = [[1, 'q positiva'], [-1, 'q negativa']] as const
const fieldOptions = [['in', 'B ⊗ a entrar'], ['out', 'B ⊙ a sair']] as const

const ENTRY: readonly [number, number] = [240, 204]
const CONTROL_Y = 122
const WALL_Y = 40

/** Seletor de velocidades: campos E e B cruzados (exame 2022/23 Recurso; ficha 3, ex. 10 b). */
export function Selector({ params }: LabProps) {
  const [electric, setElectric] = useState(Math.abs(numberParam(params, 'E', 39000)) / 1000)
  const [magnetic, setMagnetic] = useState(Math.abs(numberParam(params, 'B', 0.15)) * 1000)
  const [speed, setSpeed] = useState(Math.abs(numberParam(params, 'v', 260000)) / 1000)
  const [sign, setSign] = useState<1 | -1>(numberParam(params, 'q', 1) < 0 ? -1 : 1)
  const [fieldSense, setFieldSense] = useState<'in' | 'out'>('in')
  const [electricRange] = useState(() => spanFor(electric, 0.5, 100))
  const [magneticRange] = useState(() => spanFor(magnetic, 5, 500))
  const [speedRange] = useState(() => spanFor(speed, 10, 1000))

  const result = velocitySelector(electric * 1000, magnetic / 1000, speed * 1000)
  const total = result.electricPerCharge + result.magneticPerCharge
  // Sentidos segundo x (para a direita, de + para −): a partícula sobe, ŷ × ẑ = +x̂.
  const magneticSense = fieldSense === 'out' ? 1 : -1
  const net = total > 0 ? (result.electricPerCharge + magneticSense * result.magneticPerCharge) / total : 0
  const balanced = Math.abs(net) < 1e-6
  const deflection = balanced ? 0 : sign * Math.sign(net) * 80 * Math.abs(net) ** 0.6
  const passes = Math.abs(deflection) <= 8
  const endY = passes ? 22 : WALL_Y + 2
  const trajectory = `M${ENTRY[0]} ${ENTRY[1] + 30}V${ENTRY[1]}Q${ENTRY[0]} ${CONTROL_Y} ${ENTRY[0] + deflection} ${endY}`
  const t = 0.15
  const particle: [number, number] = [ENTRY[0] + deflection * t * t, ENTRY[1] * (1 - t) ** 2 + 2 * CONTROL_Y * t * (1 - t) + endY * t * t]
  const strongest = Math.max(result.electricPerCharge, result.magneticPerCharge)
  const electricLength = strongest > 0 ? 64 * result.electricPerCharge / strongest : 0
  const magneticLength = strongest > 0 ? 64 * result.magneticPerCharge / strongest : 0
  const sideName = deflection > 0 ? 'direita (placa −)' : 'esquerda (placa +)'
  const ratio = Number.isFinite(result.selectedSpeed) && result.selectedSpeed > 0 ? speed * 1000 / result.selectedSpeed : 0
  const outcome = balanced
    ? 'v = v₀: as forças equilibram-se e a partícula segue em linha reta'
    : fieldSense === 'out'
      ? `com B a sair, as duas forças têm o mesmo sentido: desvia sempre para a ${sideName}`
      : `v ${ratio < 1 ? '<' : '>'} v₀: domina a força ${ratio < 1 ? 'elétrica' : 'magnética'} e desvia para a ${sideName}${passes ? ' (ainda cabe na fenda)' : ''}`

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-selector" viewBox="0 0 480 240" role="img" aria-label={`Seletor de velocidades com campo elétrico de ${sig(electric * 1000)} V/m para a direita e campo magnético de ${sig(magnetic / 1000)} T ${fieldSense === 'in' ? 'a entrar na' : 'a sair da'} página. Partícula ${sign > 0 ? 'positiva' : 'negativa'} a ${sig(speed * 1000)} m/s: ${outcome}`}>
      <defs>
        <FieldPattern id="selector-field" out={fieldSense === 'out'} spacing={30} />
        <ArrowHeads prefix="selector" tones={['v', 'e', 'f']} />
      </defs>
      <rect className="lab-magnetism-region" x="150" y={WALL_Y} width="180" height={ENTRY[1] - WALL_Y} />
      <rect className="lab-magnetism-region-fill" x="150" y={WALL_Y} width="180" height={ENTRY[1] - WALL_Y} fill="url(#selector-field)" />
      <rect className="lab-magnetism-plate-positive" x="140" y={WALL_Y} width="10" height={ENTRY[1] - WALL_Y} />
      <rect className="lab-magnetism-plate-negative" x="330" y={WALL_Y} width="10" height={ENTRY[1] - WALL_Y} />
      <path className="lab-magnetism-plate" d={`M150 ${WALL_Y}H232M248 ${WALL_Y}H330`} />
      {[72, 122, 172].map((y) => <text key={`p${y}`} className="lab-magnetism-plate-sign positive" x="128" y={y + 4} textAnchor="middle">+</text>)}
      {[72, 122, 172].map((y) => <text key={`n${y}`} className="lab-magnetism-plate-sign negative" x="352" y={y + 4} textAnchor="middle">−</text>)}
      <Arrow prefix="selector" tone="e" thin className="lab-magnetism-selector-e" from={[160, 70]} to={[320, 70]} />
      <Arrow prefix="selector" tone="e" thin className="lab-magnetism-selector-e" from={[160, 130]} to={[320, 130]} />
      <text className="lab-magnetism-label lab-magnetism-tone-e" x="318" y="62" textAnchor="end">E</text>
      <text className="lab-magnetism-label lab-magnetism-tone-b" x="160" y="62">B {fieldSense === 'in' ? '⊗' : '⊙'}</text>
      <text x="240" y="14" textAnchor="middle">fenda de saída</text>

      <line className="lab-magnetism-aux" x1={ENTRY[0]} y1={ENTRY[1]} x2={ENTRY[0]} y2="22" />
      <path className="lab-magnetism-path lab-magnetism-selector-path" d={trajectory} markerEnd="url(#selector-head-v)" />
      <text className="lab-magnetism-label lab-magnetism-tone-v" x={ENTRY[0] + 10} y={ENTRY[1] + 24}>v</text>

      <Arrow prefix="selector" tone="f" className="lab-magnetism-selector-fe" from={[particle[0], particle[1] - 5]} to={[particle[0] + sign * electricLength, particle[1] - 5]} label="Fₑ" labelShift={[0, -6]} />
      <Arrow prefix="selector" tone="f" className="lab-magnetism-selector-fm" from={[particle[0], particle[1] + 5]} to={[particle[0] + sign * magneticSense * magneticLength, particle[1] + 5]} label="Fₘ" labelShift={[0, 6]} />
      <circle className={`lab-magnetism-particle ${sign < 0 ? 'negative' : 'positive'}`} cx={particle[0]} cy={particle[1]} r="7" />
      <text className="lab-magnetism-sign" x={particle[0]} y={particle[1] + 4} textAnchor="middle">{sign < 0 ? '−' : '+'}</text>
      <text className="lab-magnetism-strong" x="366" y="34">{passes ? 'passa' : 'bloqueada'}</text>
    </svg>

    <ResultStrip label="Velocidade selecionada" value={`${sig(result.selectedSpeed)} m/s`} formula="qE=qv_0B\;\Rightarrow\;v_0=\dfrac{E}{B}" secondary={outcome} />
    <Metrics items={[
      { label: 'Força elétrica (|q| = e)', value: `${sig(ELEMENTARY_CHARGE * result.electricPerCharge)} N` },
      { label: 'Força magnética (|q| = e)', value: `${sig(ELEMENTARY_CHARGE * result.magneticPerCharge)} N` },
      { label: 'v·B, a comparar com E', value: `${sig(result.magneticPerCharge)} V/m` },
      { label: 'v / v₀', value: sig(ratio) },
    ]} />

    <Control label="Campo elétrico E" value={electric} min={electricRange.min} max={electricRange.max} step={0.5} onChange={setElectric} unit="kV/m" />
    <Control label="Campo magnético B" value={magnetic} min={magneticRange.min} max={magneticRange.max} step={5} onChange={setMagnetic} unit="mT" />
    <Control label="Velocidade v" value={speed} min={speedRange.min} max={speedRange.max} step={5} onChange={setSpeed} unit="km/s" />
    <Choice label="Sinal da carga" value={sign} onChange={setSign} options={signOptions} />
    <Choice label="Sentido de B" value={fieldSense} onChange={setFieldSense} options={fieldOptions} />
    <LabNote title="Armadilha típica:">v₀ = E/B não depende da carga nem da massa. Trocar o sinal de q inverte as duas forças ao mesmo tempo, por isso o equilíbrio mantém-se. As setas das forças estão à mesma escala; o desvio da trajetória está em escala visual saturada (qualitativa).</LabNote>
  </>
}
