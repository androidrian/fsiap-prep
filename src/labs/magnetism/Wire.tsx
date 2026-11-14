import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { spanFor } from './format'
import { chargeBesideWire } from './physics'
import { Arrow, ArrowHeads } from './svg'

const MIN_DISTANCE = 0.001
const MAX_DISTANCE = 0.2

/** Campo de um fio longo e força sobre um protão que viaja paralelo ao fio, no sentido da corrente (ficha 3, ex. 16). */
export function Wire({ params }: LabProps) {
  const [current, setCurrent] = useState(numberParam(params, 'I', 5))
  const [distance, setDistance] = useState(Math.max(MIN_DISTANCE, Math.abs(numberParam(params, 'r', 0.004))))
  const [speed, setSpeed] = useState(Math.abs(numberParam(params, 'v', 1500)))
  const [currentRange] = useState(() => spanFor(current, -15, 15))
  const [distanceRange] = useState(() => spanFor(distance, MIN_DISTANCE, MAX_DISTANCE))
  const [speedRange] = useState(() => spanFor(speed, 100, 5000))

  const result = chargeBesideWire(current, distance, speed)
  const sampleRadius = 48 + Math.min(1, (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE)) * 112
  const px = 240 + sampleRadius
  const sense = current > 0 ? 1 : -1
  const symbol = current > 0 ? '⊙' : current < 0 ? '⊗' : '0'

  return <>
    <svg className={`field-source-stage lab-magnetism-wire-stage ${current === 0 ? 'zero-field' : ''}`} viewBox="0 0 480 210" role="img" aria-label={`Fio perpendicular à página com corrente de ${sig(Math.abs(current))} A ${current > 0 ? 'a sair' : current < 0 ? 'a entrar' : 'nula'}; a ${sig(distance)} m o campo vale ${sig(result.field)} T e um protão que viaja no sentido da corrente é puxado para o fio com ${sig(result.force)} N`}>
      <defs><ArrowHeads prefix="wire" tones={['b', 'f', 'e']} /></defs>
      <circle className="field-ring ring-a" cx="240" cy="105" r="48" /><circle className="field-ring ring-b" cx="240" cy="105" r="92" /><circle className="field-ring ring-c" cx="240" cy="105" r="140" />
      <circle className="wire-core" cx="240" cy="105" r="18" />
      <text className="wire-symbol" x="234" y="112">{symbol}</text>
      {current !== 0 && <text className={current > 0 ? 'field-sense' : 'field-sense reverse'} x="160" y="62">{current > 0 ? '↺' : '↻'}</text>}
      <line className="radius-guide" x1="240" y1="105" x2={px} y2="105" />
      <text x={240 + sampleRadius / 2} y="121" textAnchor="middle">r</text>
      <text x="250" y="22">regra da mão direita</text>
      {current !== 0 && <>
        <Arrow prefix="wire" tone="b" className="lab-magnetism-wire-b" from={[px, 105]} to={[px, 105 - sense * 36]} label="B" />
        <Arrow prefix="wire" tone="f" className="lab-magnetism-wire-f" from={[px, 105]} to={[px - 30, 105]} label="F" labelShift={[8, -13]} />
        <Arrow prefix="wire" tone="e" className="lab-magnetism-wire-e" from={[px, 105]} to={[px + 30, 105]} label="E" labelShift={[0, -9]} />
        <text x={px + 9} y="123">protão, v {symbol}</text>
      </>}
      <circle className="sample-point" cx={px} cy="105" r="5" />
    </svg>
    <ResultStrip label="Campo à distância r" value={`${(result.field * 1e6).toFixed(2)} μT`} formula="B=\mu_0I/(2\pi r)" secondary={current === 0 ? 'I=0: não existe campo magnético criado pelo fio' : `sentido ${current > 0 ? 'anti-horário' : 'horário'} · as circunferências não mudam; muda o ponto de medição`} />
    <Metrics items={[
      { label: 'Força no protão e·v·B', value: `${sig(result.force)} N` },
      { label: 'Sentido da força', value: current === 0 ? 'sem força' : 'para o fio' },
      { label: 'Campo E que a anula (E = vB)', value: `${sig(result.balancingField)} N/C` },
    ]} />
    <Control label="Corrente I" value={current} min={currentRange.min} max={currentRange.max} step={0.5} onChange={setCurrent} unit="A" />
    <Control label="Distância r" value={distance} min={distanceRange.min} max={distanceRange.max} step={0.001} onChange={setDistance} unit="m" />
    <Control label="Velocidade do protão" value={speed} min={speedRange.min} max={speedRange.max} step={50} onChange={setSpeed} unit="m/s" />
    <LabNote title="Protão paralelo ao fio:">o protão viaja no sentido da corrente (perpendicular à página). F = q v × B aponta para o fio — tal como duas correntes paralelas, atraem-se. Para seguir sempre paralelo ao fio é preciso um campo elétrico com sentido oposto ao da força (a afastar do fio) e módulo E = vB. As setas indicam só direções e sentidos; não estão à escala.</LabNote>
  </>
}
