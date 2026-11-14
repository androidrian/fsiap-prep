import { useState } from 'react'
import { LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { fmt } from './format'
import { transverseDeflection } from './physics'
import { Arrow, ArrowDefs } from './svg'

const ID = 'motion'
const ENTRY = { x: 70, y: 120 }

/** Folha 1, exercício 6 (impressora de jato de tinta): gota negativa num campo vertical para baixo. */
export function TransverseMotion({ params }: LabProps) {
  const [field, setField] = useState(numberParam(params, 'E', 1.4e6))
  const [charge, setCharge] = useState(numberParam(params, 'q', -1.5e-13))
  const [mass, setMass] = useState(numberParam(params, 'm', 1.3e-10))
  const [speed, setSpeed] = useState(numberParam(params, 'vx', 18))
  const [length, setLength] = useState(numberParam(params, 'L', 0.016))

  const result = transverseDeflection(field, charge, mass, speed, length)
  const up = result.deflection > 0
  const moved = result.deflection !== 0

  // Comprimento das placas e desvio em escala visual saturada (o desvio real é muito menor do que L).
  const plateLength = 200 + 140 * Math.max(0, length) / (Math.max(0, length) + 0.016)
  const exitX = ENTRY.x + plateLength
  const ratio = length > 0 ? Math.abs(result.deflection) / length : 0
  const bend = Math.sign(result.deflection) * 62 * (1 - Math.exp(-12 * ratio))
  const exitY = ENTRY.y - bend
  const afterX = exitX + 40
  const afterY = exitY - 80 * bend / plateLength
  const forceDirection = Math.sign(-charge * field) // +1 = para cima
  const fieldDirection = Math.sign(field) // +1 = para baixo
  const fieldColumns = [0.125, 0.375, 0.625, 0.875].map((part) => ENTRY.x + plateLength * part)
  const plateClass = (top: boolean) => (fieldDirection === 0 ? 'neutral' : (fieldDirection > 0) === top ? 'positive' : 'negative')

  return <>
    <svg className="lab-electro-stage" viewBox="0 0 480 240" role="img" aria-label={`Partícula de carga ${charge < 0 ? 'negativa' : 'positiva'} lançada a ${sig(speed)} m/s entre placas de ${sig(length)} m, com campo de ${sig(Math.abs(field))} N/C para ${field < 0 ? 'cima' : 'baixo'}. ${moved ? `Sai desviada ${sig(Math.abs(result.deflection))} m para ${up ? 'cima' : 'baixo'}.` : 'Não é desviada.'}`}>
      <ArrowDefs prefix={ID} kinds={['e', 'f', 'v']} />
      <rect className={`lab-electro-sheet ${plateClass(true)}`} x={ENTRY.x} y="42" width={plateLength} height="8" />
      <rect className={`lab-electro-sheet ${plateClass(false)}`} x={ENTRY.x} y="190" width={plateLength} height="8" />
      {fieldDirection !== 0 && <>
        <text className="lab-electro-name" x={exitX + 6} y="50">{fieldDirection > 0 ? '+' : '−'}</text>
        <text className="lab-electro-name" x={exitX + 6} y="198">{fieldDirection > 0 ? '−' : '+'}</text>
        {fieldColumns.map((x) => <Arrow key={x} prefix={ID} kind="e" className="lab-electro-fieldline" x1={x} y1={fieldDirection > 0 ? 56 : 184} x2={x} y2={fieldDirection > 0 ? 184 : 56} />)}
        <text className="lab-electro-label field" x={fieldColumns[3] + 7} y="72">E</text>
      </>}

      <line className="lab-electro-guide" x1={ENTRY.x - 56} y1={ENTRY.y} x2={afterX + 14} y2={ENTRY.y} />
      <text className="lab-electro-name" x={afterX + 18} y={ENTRY.y + 4}>x</text>
      <path className="lab-electro-trajectory" d={`M${ENTRY.x} ${ENTRY.y}Q${ENTRY.x + plateLength / 2} ${ENTRY.y} ${exitX} ${round(exitY)}L${afterX} ${round(afterY)}`} />
      {Math.abs(bend) >= 1.5 && <>
        <path className="lab-electro-dimension lab-electro-deflection" d={`M${exitX} ${ENTRY.y}V${round(exitY)}M${exitX - 4} ${round(exitY)}h8`} />
        <text className="lab-electro-label ink" x={exitX + 8} y={ENTRY.y + (up ? 19 : -12)}>y ={sig(Math.abs(result.deflection))} m</text>
      </>}
      <circle className="lab-electro-ghost" cx={exitX} cy={exitY} r="5" />

      <path className="lab-electro-dimension" d={`M${ENTRY.x} 212H${exitX}M${ENTRY.x} 208v8M${exitX} 208v8`} />
      <text className="lab-electro-name" x={(ENTRY.x + exitX) / 2} y="230" textAnchor="middle">L = {sig(length * 100)} cm</text>

      <Arrow prefix={ID} kind="v" x1={ENTRY.x - 52} y1={ENTRY.y} x2={ENTRY.x - 9} y2={ENTRY.y} />
      <text className="lab-electro-label velocity" x={ENTRY.x - 32} y={ENTRY.y + 16} textAnchor="middle">vₓ</text>
      {forceDirection !== 0 && <>
        <Arrow prefix={ID} kind="f" thick className="lab-electro-force" x1={ENTRY.x} y1={ENTRY.y} x2={ENTRY.x} y2={ENTRY.y - forceDirection * 36} />
        <text className="lab-electro-label force" x={ENTRY.x - 8} y={ENTRY.y - forceDirection * 30 + 4} textAnchor="end">Fₑ</text>
      </>}
      <circle className={`lab-electro-charge ${charge > 0 ? 'positive' : charge < 0 ? 'negative' : 'neutral'}`} cx={ENTRY.x} cy={ENTRY.y} r="6" />
    </svg>
    <p className="lab-electro-caption">O desvio desenhado está ampliado (escala visual saturada): o valor real é muito menor do que o comprimento das placas.</p>

    <ResultStrip label="Deflexão vertical à saída das placas (x = L)" value={`${sig(Math.abs(result.deflection))} m`} formula="y=\frac{|q|E}{2m}\left(\frac{L}{v_x}\right)^2" secondary={moved ? `para ${up ? 'cima' : 'baixo'} — ${charge < 0 ? 'carga negativa: força oposta a E' : 'carga positiva: força no sentido de E'}` : 'sem desvio'} />
    <Metrics items={[
      { label: 'Aceleração |q|E/m', value: `${sig(Math.abs(result.acceleration))} m/s²` },
      { label: 'Tempo entre as placas L/vₓ', value: `${sig(result.time)} s` },
      { label: 'Velocidade vertical à saída', value: `${sig(Math.abs(result.exitSpeedY))} m/s` },
      { label: 'Ângulo de saída', value: `${fmt(Math.abs(result.exitAngle), 2)}°` },
    ]} />

    <div className="lab-electro-fields">
      <NumberField label="Campo E" value={field} unit="N/C" hint="positivo = para baixo" onChange={setField} />
      <NumberField label="Carga q" value={charge} unit="C" hint="com sinal" onChange={setCharge} />
      <NumberField label="Massa m" value={mass} unit="kg" onChange={setMass} />
      <NumberField label="Velocidade inicial vₓ" value={speed} unit="m/s" onChange={setSpeed} />
      <NumberField label="Comprimento das placas L" value={length} unit="m" onChange={setLength} />
    </div>

    <LabNote title="Leitura do diagrama:">não há força horizontal, por isso vₓ mantém-se e o tempo entre as placas é L/vₓ. A força elétrica é vertical e constante: parábola dentro das placas, reta depois de sair. Uma carga negativa desvia-se contra o campo.</LabNote>
  </>
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
