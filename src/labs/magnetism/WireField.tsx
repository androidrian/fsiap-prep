import { useState } from 'react'
import { Control, LabNote, Metrics, ResultStrip, numberParam, sig, type LabProps } from '../ui'
import { spanFor } from './format'
import { wireInExternalField, wireResultantAt } from './physics'
import { Arrow, ArrowHeads } from './svg'

const CX = 240
const CY = 120
const POINTS = 8
const ARROW = 26

/** Fio perpendicular à página num campo uniforme externo: soma vetorial em vários pontos (ficha 3, ex. 4). */
export function WireField({ params }: LabProps) {
  const [current, setCurrent] = useState(numberParam(params, 'I', 1))
  const [external, setExternal] = useState(Math.abs(numberParam(params, 'Bext', 20)))
  const [distance, setDistance] = useState(Math.max(0.01, Math.abs(numberParam(params, 'r', 1))))
  const [currentRange] = useState(() => spanFor(current, -10, 10))
  const [externalRange] = useState(() => spanFor(external, 0, 100))
  const [distanceRange] = useState(() => spanFor(distance, 0.2, 10))

  const metres = distance / 100
  const tesla = external * 1e-6
  const result = wireInExternalField(current, metres, tesla)
  const strongest = Math.max(result.wire, tesla)
  const pxPerTesla = strongest > 0 ? ARROW / strongest : 0
  // Distância em escala visual saturada: aproxima-se de 84 px para r grande.
  const ring = 58 + 26 * (1 - Math.exp(-distance / 2))
  const samples = Array.from({ length: POINTS }, (_, index) => {
    const angle = index * 2 * Math.PI / POINTS
    const fields = wireResultantAt(current, metres, tesla, angle)
    const size = Math.hypot(fields.total[0], fields.total[1])
    return { index, x: CX + ring * Math.cos(angle), y: CY - ring * Math.sin(angle), ...fields, size }
  })
  const addsBelow = current > 0
  const maxY = current === 0 ? null : addsBelow ? CY + ring : CY - ring
  const minY = current === 0 ? null : addsBelow ? CY - ring : CY + ring
  const labelY = (y: number) => (y > CY ? y + 26 : y - 16)
  const microtesla = (value: number) => `${sig(value * 1e6)} μT`

  return <>
    <svg className="lab-magnetism-stage lab-magnetism-wirefield" viewBox="0 0 480 240" role="img" aria-label={`Fio perpendicular à página com corrente de ${sig(Math.abs(current))} A ${current > 0 ? 'a sair' : current < 0 ? 'a entrar' : 'nula'} num campo externo de ${sig(external)} μT para a direita. A ${sig(distance)} cm do fio o campo resultante varia entre ${microtesla(result.min)} e ${microtesla(result.max)}`}>
      <defs><ArrowHeads prefix="wirefield" tones={['b', 'blue', 'ink']} /></defs>
      <g className="lab-magnetism-legend">
        <line className="lab-magnetism-arrow thin lab-magnetism-tone-b" x1="16" y1="18" x2="36" y2="18" /><text x="42" y="22">campo do fio</text>
        <line className="lab-magnetism-arrow thin lab-magnetism-tone-blue" x1="16" y1="34" x2="36" y2="34" /><text x="42" y="38">campo externo</text>
        <line className="lab-magnetism-arrow thick lab-magnetism-tone-ink" x1="16" y1="50" x2="36" y2="50" /><text x="42" y="54">resultante</text>
      </g>
      {external > 0 && [92, 120, 148].flatMap((y) => [16, 424].map((x) => <Arrow key={`${x}-${y}`} prefix="wirefield" tone="blue" thin className="lab-magnetism-faint" from={[x, y]} to={[x + 40, y]} />))}
      {external > 0 && <text className="lab-magnetism-label lab-magnetism-tone-blue" x="16" y="172">B ext →</text>}

      <circle className="lab-magnetism-aux lab-magnetism-wirefield-ring" cx={CX} cy={CY} r={ring} />
      <line className="lab-magnetism-aux" x1={CX} y1={CY} x2={CX + ring} y2={CY} />
      <text className="lab-magnetism-strong" x={CX + ring / 2 + 6} y={CY - 6} textAnchor="middle">r</text>

      {samples.map((sample) => <g key={sample.index} className="lab-magnetism-wirefield-sample">
        <Arrow prefix="wirefield" tone="blue" thin from={[sample.x, sample.y]} to={[sample.x + pxPerTesla * tesla, sample.y]} />
        <Arrow prefix="wirefield" tone="b" thin from={[sample.x, sample.y]} to={[sample.x + pxPerTesla * sample.wire[0], sample.y - pxPerTesla * sample.wire[1]]} />
        <g opacity={strongest > 0 ? 0.4 + 0.6 * Math.min(1, sample.size / (result.max || 1)) : 1}>
          <Arrow prefix="wirefield" tone="ink" className="thick lab-magnetism-wirefield-total" from={[sample.x, sample.y]} to={[sample.x + pxPerTesla * sample.total[0], sample.y - pxPerTesla * sample.total[1]]} />
        </g>
        <circle className="lab-magnetism-centre" cx={sample.x} cy={sample.y} r="2.5" />
      </g>)}

      {maxY !== null && <>
        <circle className="lab-magnetism-mark max" cx={CX} cy={maxY} r="9" />
        <text className="lab-magnetism-label lab-magnetism-tone-red" x={CX} y={labelY(maxY)} textAnchor="middle">B máx = {microtesla(result.max)}</text>
      </>}
      {minY !== null && <>
        <circle className="lab-magnetism-mark min" cx={CX} cy={minY} r="9" />
        <text className="lab-magnetism-strong" x={CX} y={labelY(minY)} textAnchor="middle">B mín = {microtesla(result.min)}</text>
      </>}

      <circle className="lab-magnetism-wire" cx={CX} cy={CY} r="11" />
      {current > 0 && <circle className="lab-magnetism-wire-glyph dot" cx={CX} cy={CY} r="3.2" />}
      {current < 0 && <path className="lab-magnetism-wire-glyph" d={`M${CX - 5} ${CY - 5}l10 10m0-10l-10 10`} />}
      <text className="lab-magnetism-strong" x={CX} y={CY + 28} textAnchor="middle">I {current > 0 ? '⊙' : current < 0 ? '⊗' : '= 0'}</text>
    </svg>

    <ResultStrip label="Campo do fio à distância r" value={microtesla(result.wire)} formula="B_{fio}=\dfrac{\mu_0 I}{2\pi r}" secondary={current === 0 ? 'sem corrente só existe o campo externo, igual em todos os pontos' : `os campos somam-se ${addsBelow ? 'abaixo' : 'acima'} do fio e subtraem-se ${addsBelow ? 'acima' : 'abaixo'}`} />
    <Metrics items={[
      { label: 'Campo máximo B fio + B ext', value: `${sig(result.max)} T` },
      { label: 'Campo mínimo |B fio − B ext|', value: `${sig(result.min)} T` },
      { label: 'Distância a que se anulam', value: Number.isFinite(result.cancelDistance) && current !== 0 ? `${sig(result.cancelDistance * 100)} cm` : 'não se anulam' },
    ]} />

    <Control label="Corrente I" value={current} min={currentRange.min} max={currentRange.max} step={0.1} onChange={setCurrent} unit="A" />
    <Control label="Campo externo" value={external} min={externalRange.min} max={externalRange.max} step={1} onChange={setExternal} unit="μT" />
    <Control label="Distância ao fio r" value={distance} min={distanceRange.min} max={distanceRange.max} step={0.1} onChange={setDistance} unit="cm" />
    <LabNote title="Leitura do diagrama:">o campo do fio é tangente à circunferência (regra da mão direita: polegar segundo I, dedos dão o sentido). No ponto em que é paralelo ao campo externo os módulos somam-se; no ponto diametralmente oposto subtraem-se e, se forem iguais, o campo anula-se. As setas estão todas à mesma escala; a distância r está em escala visual.</LabNote>
  </>
}
