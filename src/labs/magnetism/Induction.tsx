import { useState } from 'react'
import { Control, LabNote, Metrics, NumberField, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { clamp, spanFor } from './format'
import { MU0, faradayEmf, motionalEmf, solenoidField } from './physics'
import { ArrowHeads, FieldPattern } from './svg'

/** Espira num campo variável: FEM de Faraday e corrente induzida (ficha 3, ex. 6). */
export function Faraday({ params }: LabProps) {
  const [turns, setTurns] = useState(Math.max(1, Math.round(Math.abs(numberParam(params, 'N', 1)))))
  const [radius, setRadius] = useState(Math.abs(numberParam(params, 'r', 0.1)))
  const [rate, setRate] = useState(Math.abs(numberParam(params, 'rate', 0.1)))
  const [resistance, setResistance] = useState(Math.abs(numberParam(params, 'R', 2)))
  const [turnsRange] = useState(() => spanFor(turns, 1, 40))
  const [radiusRange] = useState(() => spanFor(radius, 0.02, 0.2))
  const [rateRange] = useState(() => spanFor(rate, 0.05, 8))
  const [resistanceRange] = useState(() => spanFor(resistance, 0.5, 50))

  const emf = faradayEmf(turns, radius, rate)
  const current = resistance > 0 ? emf / resistance : 0
  const area = Math.PI * radius * radius
  // Raio em escala visual saturada (aproxima-se de 90 px).
  const loop = 30 + 60 * (1 - Math.exp(-radius / 0.08))
  const drawn = clamp(turns, 1, 6)
  const sense = loop + 12
  const from = [240 + sense * Math.cos(-0.7), 120 - sense * Math.sin(-0.7)]
  const to = [240 + sense * Math.cos(0.7), 120 - sense * Math.sin(0.7)]

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-faraday" viewBox="0 0 480 240" role="img" aria-label={`Espira circular de ${turns} ${turns === 1 ? 'volta' : 'voltas'} e raio ${sig(radius)} m num campo magnético a entrar na página que aumenta ${sig(rate)} tesla por segundo; a corrente induzida de ${sig(current)} A circula no sentido anti-horário`}>
      <defs>
        <FieldPattern id="faraday-field" out={false} />
        <ArrowHeads prefix="faraday" tones={['blue']} />
      </defs>
      <rect className="lab-magnetism-region" x="24" y="14" width="432" height="212" />
      <rect className="lab-magnetism-region-fill" x="24" y="14" width="432" height="212" fill="url(#faraday-field)" />
      <text className="lab-magnetism-label lab-magnetism-tone-b" x="34" y="34">B ⊗ a aumentar</text>
      <text x="34" y="52">dB/dt = {sig(rate)} T/s</text>
      {Array.from({ length: drawn }, (_, index) => <circle key={index} className="lab-magnetism-loop lab-magnetism-faraday-loop" cx="240" cy="120" r={Math.max(6, loop - index * 3.5)} />)}
      <rect className="lab-magnetism-resistor" x="228" y={120 + loop - 7} width="24" height="14" />
      <text className="lab-magnetism-strong" x="240" y={120 + loop + 22} textAnchor="middle">R</text>
      <line className="lab-magnetism-aux" x1="240" y1="120" x2={240 - loop} y2="120" />
      <text className="lab-magnetism-strong" x={240 - loop / 2} y="114" textAnchor="middle">r</text>
      <path className="lab-magnetism-arrow lab-magnetism-tone-blue" d={`M${from[0]} ${from[1]}A${sense} ${sense} 0 0 0 ${to[0]} ${to[1]}`} markerEnd="url(#faraday-head-blue)" />
      <text className="lab-magnetism-label lab-magnetism-tone-blue" x={240 + sense + 8} y="124">i induzida</text>
      <text x="446" y="216" textAnchor="end">{turns > 6 ? `${turns} voltas (6 desenhadas)` : `${turns} ${turns === 1 ? 'volta' : 'voltas'}`}</text>
    </svg>
    <ResultStrip label="FEM induzida" value={`${sig(emf)} V`} formula="|\mathcal E|=N\pi r^2\left|\dfrac{dB}{dt}\right|" secondary="Lenz: a corrente induzida cria um campo a sair da página, contrário ao aumento do fluxo" />
    <Metrics items={[
      { label: 'Corrente induzida ℰ/R', value: `${sig(current)} A` },
      { label: 'Área da espira πr²', value: `${sig(area)} m²` },
      { label: 'Potência dissipada ℰ²/R', value: `${sig(emf * current)} W` },
    ]} />
    <Control label="Espiras N" value={turns} min={turnsRange.min} max={turnsRange.max} step={1} onChange={setTurns} unit="" />
    <Control label="Raio" value={radius} min={radiusRange.min} max={radiusRange.max} step={0.01} onChange={setRadius} unit="m" />
    <Control label="Variação do campo" value={rate} min={rateRange.min} max={rateRange.max} step={0.05} onChange={setRate} unit="T/s" />
    <Control label="Resistência R" value={resistance} min={resistanceRange.min} max={resistanceRange.max} step={0.5} onChange={setResistance} unit="Ω" />
    <LabNote title="Armadilha típica:">a FEM depende da taxa de variação do campo, não do valor de B. A resistência não altera a FEM, só a corrente. O raio da espira está em escala visual.</LabNote>
  </>
}

/** Barra condutora a mover-se num campo uniforme: ℰ = Bℓv (ficha 3, ex. 7). */
export function Motional({ params }: LabProps) {
  const [field, setField] = useState(Math.abs(numberParam(params, 'B', 1.2)))
  const [rodLength, setRodLength] = useState(Math.abs(numberParam(params, 'l', 0.25)))
  const [speed, setSpeed] = useState(Math.abs(numberParam(params, 'v', 10)))
  const [fieldRange] = useState(() => spanFor(field, 0.1, 2))
  const [lengthRange] = useState(() => spanFor(rodLength, 0.05, 1))
  const [speedRange] = useState(() => spanFor(speed, 0.5, 30))

  const emf = motionalEmf(field, rodLength, speed)
  const rodHalfHeight = 22 + Math.min(1.15, rodLength) * 58
  const arrowEnd = 250 + Math.min(1, speed / 30) * 90

  return <>
    <svg className="induction-stage lab-magnetism-legacy" viewBox="0 0 480 210" role="img" aria-label={`Barra condutora de ${sig(rodLength)} m a mover-se para a direita a ${sig(speed)} m/s num campo de ${sig(field)} T a entrar na página; força eletromotriz de ${sig(emf)} V com o topo positivo`}>
      <defs><pattern id="motion-crosses" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M8 8l8 8m0-8l-8 8" /></pattern></defs>
      <rect x="35" y="12" width="410" height="186" fill="url(#motion-crosses)" />
      <line className="moving-rod" x1="220" y1={105 - rodHalfHeight} x2="220" y2={105 + rodHalfHeight} />
      <path className="motion-arrow" d={`M170 105H${arrowEnd}`} />
      <text x={arrowEnd + 7} y="109">v →</text>
      <text x="50" y="35">B ⊗</text>
      <text x="203" y={101 - rodHalfHeight}>+</text>
      <text x="203" y={119 + rodHalfHeight}>−</text>
      <text x="232" y={Math.max(24, 97 - rodHalfHeight)}>ℓ = {sig(rodLength)} m</text>
    </svg>
    <ResultStrip label="FEM de movimento" value={`${emf.toFixed(2)} V`} formula="|\mathcal E|=B\ell v" secondary="q(v×B) separa as cargas; aumentar ℓ alonga a barra sem mudar a posição" />
    <Metrics items={[
      { label: 'Força por unidade de carga vB', value: `${sig(speed * field)} N/C` },
      { label: 'Área varrida por segundo ℓv', value: `${sig(rodLength * speed)} m²/s` },
      { label: 'Polaridade', value: 'topo +, base −' },
    ]} />
    <Control label="Campo B" value={field} min={fieldRange.min} max={fieldRange.max} step={0.1} onChange={setField} unit="T" />
    <Control label="Comprimento da barra" value={rodLength} min={lengthRange.min} max={lengthRange.max} step={0.05} onChange={setRodLength} unit="m" />
    <Control label="Velocidade" value={speed} min={speedRange.min} max={speedRange.max} step={0.5} onChange={setSpeed} unit="m/s" />
    <LabNote title="Leitura do diagrama:">a FEM é a variação de fluxo por segundo: B vezes a área que a barra varre em cada segundo (ℓ·v). Numa espira que entra no campo, só o lado que está dentro do campo contribui.</LabNote>
  </>
}

/** Campo no interior de um solenoide longo (ficha 3, ex. 5). */
export function Solenoid({ params }: LabProps) {
  const [turns, setTurns] = useState(Math.max(1, Math.round(Math.abs(numberParam(params, 'N', 1200)))))
  const [length, setLength] = useState(Math.max(0.01, Math.abs(numberParam(params, 'L', 2.4))))
  const [current, setCurrent] = useState(numberParam(params, 'I', 2400))
  const [wanted, setWanted] = useState(1.5)
  const [turnsRange] = useState(() => spanFor(turns, 10, 2000))
  const [lengthRange] = useState(() => spanFor(length, 0.1, 3))

  const field = solenoidField(turns, length, current)
  const density = turns / length
  const neededCurrent = wanted * length / (MU0 * turns)
  // Largura e passo em escala visual: o passo encolhe com o logaritmo de N/L.
  const width = 150 + 260 * Math.min(1, length / 3)
  const start = 240 - width / 2
  const pitch = clamp(40 - 9 * Math.log10(Math.max(1, density)), 6, 40)
  const visibleTurns = Math.max(2, Math.round(width / pitch))
  const samples = visibleTurns * 16
  const points = Array.from({ length: samples + 1 }, (_, index) => `${(start + index * width / samples).toFixed(1)},${(105 - Math.sin(index / samples * Math.PI * 2 * visibleTurns) * 45).toFixed(1)}`).join(' ')

  return <>
    <svg className="solenoid-stage lab-magnetism-legacy" viewBox="0 0 480 210" role="img" aria-label={`Solenoide com ${turns} espiras em ${sig(length)} m percorrido por ${sig(current)} A; campo de ${sig(field)} T no interior, paralelo ao eixo`}>
      <polyline className="solenoid-wire" points={points} />
      <path className="axis-field" d="M35 105H445" />
      <text x="240" y="26" textAnchor="middle">N = {turns} · L = {length.toFixed(2)} m</text>
      <text x="240" y="192" textAnchor="middle">B → no interior · densidade visual acompanha N/L (escala logarítmica)</text>
    </svg>
    <ResultStrip label="Campo no interior" value={`${sig(field)} T`} formula="B=\mu_0\dfrac{N}{L}I" secondary="aproximação de solenoide longo; o desenho mostra a densidade relativa de espiras" />
    <Metrics items={[
      { label: 'Espiras por metro N/L', value: `${sig(density)} m⁻¹` },
      { label: 'Espessura por espira L/N', value: `${sig(length / turns * 1000)} mm` },
      { label: `Corrente para ${sig(wanted)} T`, value: `${sig(neededCurrent)} A` },
    ]} />
    <Control label="Espiras N" value={turns} min={turnsRange.min} max={turnsRange.max} step={10} onChange={setTurns} unit="" />
    <Control label="Comprimento L" value={length} min={lengthRange.min} max={lengthRange.max} step={0.05} onChange={setLength} unit="m" />
    <div className="lab-magnetism-fields">
      <NumberField label="Corrente I" value={current} onChange={setCurrent} unit="A" />
      <NumberField label="Campo pretendido" value={wanted} onChange={(value) => setWanted(Math.abs(value))} unit="T" hint="para calcular a corrente necessária" />
    </div>
    <LabNote title="Leitura do enunciado:">se o fio está enrolado encostado, a espessura do fio dá o número de espiras: N = L / espessura. O campo só depende de N/L e de I, não do diâmetro do solenoide.</LabNote>
  </>
}
