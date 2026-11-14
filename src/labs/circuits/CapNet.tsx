import { useState } from 'react'
import { Choice, LabNote, Metrics, NumberField, ResultStrip, numberParam, textParam, type LabProps } from '../ui'
import { ExpressionField } from './ExpressionField'
import { eng, num, subscript } from './format'
import { NetDiagram } from './NetDiagram'
import { scaleNetwork, solveNetwork, type ReductionStep, type SolvedNode } from './physics'
import { useNetExpression } from './useNetExpression'

/** Folha 2, exercício 21. */
const DEFAULT_NET = 'p(s(4,15),12)'

type CapUnit = 'uF' | 'nF' | 'pF'
const units: Record<CapUnit, { factor: number; label: string }> = {
  uF: { factor: 1e-6, label: 'μF' },
  nF: { factor: 1e-9, label: 'nF' },
  pF: { factor: 1e-12, label: 'pF' },
}

const stepKind: Record<ReductionStep['kind'], string> = {
  series: 'série · 1/C = Σ 1/Cᵢ (mesma carga)',
  parallel: 'paralelo · C = Σ Cᵢ (mesma tensão)',
  bridge: 'ponte · não se reduz por série/paralelo: conservação da carga nos nós',
}

export function CapNet({ params }: LabProps) {
  const { text, tree, error, change } = useNetExpression(textParam(params, 'net', DEFAULT_NET), DEFAULT_NET)
  const requestedUnit = textParam(params, 'unit', 'uF')
  const [unit, setUnit] = useState<CapUnit>(requestedUnit === 'nF' || requestedUnit === 'pF' ? requestedUnit : 'uF')
  const [voltage, setVoltage] = useState(Math.abs(numberParam(params, 'V', 200)))

  const { factor, label } = units[unit]
  const solution = solveNetwork(scaleNetwork(tree, factor), 'capacitance', { voltage })
  const farads = (value: number) => `${num(value / factor, 4)} ${label}`
  const coulombs = (value: number) => eng(value, 'C')
  const joules = (value: number) => eng(value, 'J', 3, 0.1)
  const volts = (value: number) => `${num(value)} V`
  const name = (node: SolvedNode) => `C${subscript(node.id)}`

  const describe = (step: ReductionStep) => {
    const values = step.operands.map(farads)
    if (step.kind === 'series') return `${values.join(' em série com ')} = ${farads(step.result)}`
    if (step.kind === 'parallel') return `${values.join(' + ')} = ${farads(step.result)}`
    return `ponte [${values[0]} → ${values[1]} em cima; ${values[2]} → ${values[3]} em baixo; ${values[4]} ao meio] = ${farads(step.result)}`
  }

  return (
    <>
      <NetDiagram
        solution={solution}
        quantity="capacitance"
        ariaLabel={`Associação de ${solution.leaves.length} condensadores entre A e B: capacidade equivalente ${farads(solution.equivalent)}, tensão ${volts(voltage)}, carga total ${coulombs(solution.flow)}`}
        header={`V = ${volts(voltage)} · Q = ${coulombs(solution.flow)} · Ceq = ${farads(solution.equivalent)}`}
        valueLabel={(node) => (node.kind === 'leaf' ? `${name(node)} · ${farads(node.value)}` : `eq. ${farads(node.value)}`)}
        flowLabel={(node) => coulombs(node.flow)}
      />
      <ResultStrip label="Capacidade equivalente entre A e B" value={farads(solution.equivalent)} formula="C_{p}=\sum C_i\qquad \dfrac{1}{C_{s}}=\sum\dfrac{1}{C_i}" secondary={`Q total = ${coulombs(solution.flow)} · energia = ${joules(solution.work)}`} />
      <Metrics items={[
        { label: 'Carga total fornecida', value: coulombs(solution.flow) },
        { label: 'Energia total armazenada', value: joules(solution.work) },
        { label: 'Tensão entre A e B', value: volts(voltage) },
      ]} />
      <ExpressionField label="Associação entre A e B" value={text} onChange={change} error={error} hint={`s(…) = série, p(…) = paralelo, b(a,b,c,d,m) = ponte. Valores em ${label}, com ponto decimal.`} />
      <Choice label="Unidade das capacidades" value={unit} onChange={setUnit} options={[['uF', 'μF'], ['nF', 'nF'], ['pF', 'pF']] as const} />
      <NumberField label="Tensão aplicada entre A e B" value={voltage} onChange={(value) => setVoltage(Math.abs(value))} unit="V" />

      <div className="lab-circuits-panel">
        <h3>Redução passo a passo</h3>
        {solution.steps.length === 0
          ? <p>Só há um condensador: Ceq = {farads(solution.equivalent)}.</p>
          : <ol className="lab-circuits-steps">{solution.steps.map((step, index) => <li key={index}><span>{describe(step)}</span><small>{stepKind[step.kind]}</small></li>)}</ol>}
      </div>
      <div className="lab-circuits-panel">
        <h3>Tensão, carga e energia em cada condensador</h3>
        <div className="lab-circuits-table-wrap">
          <table className="lab-circuits-table">
            <thead><tr><th scope="col">Condensador</th><th scope="col">Capacidade</th><th scope="col">Tensão</th><th scope="col">Carga</th><th scope="col">Energia</th></tr></thead>
            <tbody>{solution.leaves.map((leaf) => <tr key={leaf.id}><th scope="row">{name(leaf)}</th><td>{farads(leaf.value)}</td><td>{volts(leaf.voltage)}</td><td>{coulombs(leaf.flow)}</td><td>{joules(leaf.work)}</td></tr>)}</tbody>
            <tfoot><tr><th scope="row">Total</th><td>{farads(solution.equivalent)}</td><td>{volts(voltage)}</td><td>{coulombs(solution.flow)}</td><td>{joules(solution.work)}</td></tr></tfoot>
          </table>
        </div>
      </div>
      <LabNote title="Armadilha:">os condensadores associam-se ao contrário das resistências — em paralelo somam-se as capacidades, em série somam-se os inversos. Condensadores em série têm todos a mesma carga (a do equivalente) e repartem a tensão: o de menor capacidade fica com a maior tensão.</LabNote>
    </>
  )
}
