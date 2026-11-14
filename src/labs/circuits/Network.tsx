import { useState } from 'react'
import { Choice, LabNote, Metrics, NumberField, ResultStrip, numberParam, textParam, type LabProps } from '../ui'
import { ExpressionField } from './ExpressionField'
import { num, subscript } from './format'
import { NetDiagram } from './NetDiagram'
import { solveNetwork, type ReductionStep, type SolvedNode } from './physics'
import { useNetExpression } from './useNetExpression'

/** Folha 2, exercício 23. */
const DEFAULT_NET = 'p(s(4,p(10,s(5,10))),s(5,p(10,10)))'

const stepKind: Record<ReductionStep['kind'], string> = {
  series: 'série · R = Σ Rᵢ',
  parallel: 'paralelo · 1/R = Σ 1/Rᵢ',
  bridge: 'ponte · não se reduz por série/paralelo: leis dos nós',
}

export function Network({ params }: LabProps) {
  const { text, tree, error, change } = useNetExpression(textParam(params, 'net', DEFAULT_NET), DEFAULT_NET)
  const currentGiven = Boolean(params.I) && !params.V
  const [given, setGiven] = useState<'V' | 'I'>(currentGiven ? 'I' : 'V')
  const [voltage, setVoltage] = useState(Math.abs(numberParam(params, 'V', 12)))
  const [current, setCurrent] = useState(Math.abs(numberParam(params, 'I', 1)))
  const [unit, setUnit] = useState<'ohm' | 'kohm'>(textParam(params, 'unit', 'ohm') === 'kohm' ? 'kohm' : 'ohm')

  const solution = solveNetwork(tree, 'resistance', given === 'V' ? { voltage } : { flow: current })
  const kilo = unit === 'kohm'
  const ohms = (value: number) => (kilo ? `${num(value / 1e3)} kΩ` : `${num(value)} Ω`)
  const amps = (value: number) => (kilo ? `${num(value * 1e3)} mA` : `${num(value)} A`)
  const volts = (value: number) => `${num(value)} V`
  const watts = (value: number) => (kilo ? `${num(value * 1e3)} mW` : `${num(value)} W`)
  const name = (node: SolvedNode) => `R${subscript(node.id)}`

  const describe = (step: ReductionStep) => {
    const values = step.operands.map(ohms)
    if (step.kind === 'series') return `${values.join(' + ')} = ${ohms(step.result)}`
    if (step.kind === 'parallel') return `${values.join(' ∥ ')} = ${ohms(step.result)}`
    return `ponte [${values[0]} → ${values[1]} em cima; ${values[2]} → ${values[3]} em baixo; ${values[4]} ao meio] = ${ohms(step.result)}`
  }

  const changeGiven = (next: 'V' | 'I') => {
    // Mantém o mesmo ponto de funcionamento ao trocar o dado do problema.
    if (next === 'I') setCurrent(Number(solution.flow.toPrecision(6)))
    else setVoltage(Number(solution.voltage.toPrecision(6)))
    setGiven(next)
  }

  return (
    <>
      <NetDiagram
        solution={solution}
        quantity="resistance"
        ariaLabel={`Associação de ${solution.leaves.length} resistências entre A e B: resistência equivalente ${ohms(solution.equivalent)}, tensão total ${volts(solution.voltage)}, corrente total ${amps(solution.flow)}`}
        header={`V = ${volts(solution.voltage)} · I = ${amps(solution.flow)} · Req = ${ohms(solution.equivalent)}`}
        valueLabel={(node) => (node.kind === 'leaf' ? `${name(node)} · ${ohms(node.value)}` : `eq. ${ohms(node.value)}`)}
        flowLabel={(node) => amps(node.flow)}
      />
      <ResultStrip label="Resistência equivalente entre A e B" value={ohms(solution.equivalent)} formula="R_{s}=\sum R_i\qquad \dfrac{1}{R_{p}}=\sum\dfrac{1}{R_i}" secondary={`I total = ${amps(solution.flow)} · V = ${volts(solution.voltage)}`} />
      <Metrics items={[
        { label: 'Corrente total', value: amps(solution.flow) },
        { label: 'Tensão entre A e B', value: volts(solution.voltage) },
        { label: 'Potência total dissipada', value: watts(solution.work) },
      ]} />
      <ExpressionField label="Associação entre A e B" value={text} onChange={change} error={error} hint="s(…) = série, p(…) = paralelo, b(a,b,c,d,m) = ponte. Valores em Ω com ponto decimal; aceita 2k e 1.5M." />
      <Choice label="Dado do problema" value={given} onChange={changeGiven} options={[['V', 'Tensão total'], ['I', 'Corrente total']] as const} />
      {given === 'V'
        ? <NumberField label="Tensão aplicada entre A e B" value={voltage} onChange={(value) => setVoltage(Math.abs(value))} unit="V" />
        : <NumberField label="Corrente total que entra em A" value={current} onChange={(value) => setCurrent(Math.abs(value))} unit="A" hint="Ex.: 1 mA = 0.001" />}
      <Choice label="Unidades" value={unit} onChange={setUnit} options={[['ohm', 'Ω · A'], ['kohm', 'kΩ · mA']] as const} />

      <div className="lab-circuits-panel">
        <h3>Redução passo a passo</h3>
        {solution.steps.length === 0
          ? <p>Só há uma resistência: Req = {ohms(solution.equivalent)}.</p>
          : <ol className="lab-circuits-steps">{solution.steps.map((step, index) => <li key={index}><span>{describe(step)}</span><small>{stepKind[step.kind]}</small></li>)}</ol>}
      </div>
      <div className="lab-circuits-panel">
        <h3>Tensão, corrente e potência em cada resistência</h3>
        <div className="lab-circuits-table-wrap">
          <table className="lab-circuits-table">
            <thead><tr><th scope="col">Resistência</th><th scope="col">Valor</th><th scope="col">Tensão</th><th scope="col">Corrente</th><th scope="col">Potência</th></tr></thead>
            <tbody>{solution.leaves.map((leaf) => <tr key={leaf.id}><th scope="row">{name(leaf)}</th><td>{ohms(leaf.value)}</td><td>{volts(leaf.voltage)}</td><td>{amps(leaf.flow)}</td><td>{watts(leaf.work)}</td></tr>)}</tbody>
            <tfoot><tr><th scope="row">Total</th><td>{ohms(solution.equivalent)}</td><td>{volts(solution.voltage)}</td><td>{amps(solution.flow)}</td><td>{watts(solution.work)}</td></tr></tfoot>
          </table>
        </div>
      </div>
      <LabNote title="Leitura do esquema:">elementos em linha estão em série (mesma corrente, tensões somam); ramos empilhados entre duas calhas estão em paralelo (mesma tensão, correntes somam). O traço mais grosso leva mais corrente. Reduz sempre de dentro para fora e depois volta atrás: a tensão de um grupo em paralelo é a que reparte a corrente pelos ramos.</LabNote>
    </>
  )
}
