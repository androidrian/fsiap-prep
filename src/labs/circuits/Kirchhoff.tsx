import { useState } from 'react'
import { Choice, Control, LabNote, Metrics, ResultStrip, numberParam, type LabProps } from '../ui'
import { num, subscript } from './format'
import { solveBranches } from './physics'

const TOP = 44
const BOTTOM = 204
const COLUMNS = [100, 240, 380]

const clean = (value: number) => (Math.abs(value) < 1e-9 ? 0 : value)
const bracket = (value: number) => (value < 0 ? `(${num(value)})` : num(value))

/** Folha 2, exercício 20: 10 V + 6 Ω | 2 Ω | 14 V + 4 Ω. */
const defaults = [{ emf: -10, resistance: 6 }, { emf: 0, resistance: 2 }, { emf: 14, resistance: 4 }]

export function Kirchhoff({ params }: LabProps) {
  const [branches, setBranches] = useState(() => defaults.map((branch, index) => ({
    emf: numberParam(params, `e${index + 1}`, branch.emf),
    resistance: Math.max(0.1, numberParam(params, `r${index + 1}`, branch.resistance)),
  })))
  const requestedOpen = numberParam(params, 'open', 0)
  const [open, setOpen] = useState<0 | 1 | 2 | 3>(requestedOpen === 1 || requestedOpen === 2 || requestedOpen === 3 ? requestedOpen : 0)
  // Limites dos cursores: alargados uma vez para caberem os valores do enunciado.
  const [limits] = useState(() => branches.map((branch) => ({
    emf: Math.max(24, Math.ceil(Math.abs(branch.emf))),
    resistance: Math.max(20, Math.ceil(branch.resistance)),
    step: Number.isInteger(branch.resistance * 2) && Number.isInteger(branch.emf * 2) ? 0.5 : 0.1,
  })))

  const update = (index: number, change: Partial<{ emf: number; resistance: number }>) => setBranches((current) => current.map((branch, position) => (position === index ? { ...branch, ...change } : branch)))
  const solution = solveBranches(branches, open)
  const vab = clean(solution.vab)
  const currents = solution.currents.map(clean)
  const largest = Math.max(...currents.map(Math.abs))
  const sum = clean(currents.reduce((total, current) => total + current, 0))
  const sense = (current: number) => (current > 0 ? 'de b para a' : current < 0 ? 'de a para b' : 'sem corrente')

  return (
    <>
      <svg className="lab-circuits-stage lab-circuits-kirchhoff" viewBox="0 0 480 240" role="img" aria-label={`Três ramos entre os nós a e b, Vab = ${num(vab)} V. ${currents.map((current, index) => `Ramo ${index + 1}: ${open === index + 1 ? 'aberto' : `${num(Math.abs(current))} A ${sense(current)}`}`).join('; ')}`}>
        <defs><marker id="dc-kirchhoff-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path className="lab-circuits-current-head" d="M0 0L10 5L0 10z" /></marker></defs>
        <text className="lab-circuits-header" x="14" y="22">Vab = Va − Vb = {num(vab)} V</text>
        <path className="lab-circuits-wire" d={`M${COLUMNS[0]} ${TOP}H${COLUMNS[2]}M${COLUMNS[0]} ${BOTTOM}H${COLUMNS[2]}`} />
        {branches.map((branch, index) => {
          const x = COLUMNS[index]
          const isOpen = open === index + 1
          const current = currents[index]
          const hasSource = branch.emf !== 0
          const plusOnTop = branch.emf > 0
          const length = largest > 0 ? 12 + 30 * Math.abs(current) / largest : 0
          const up = current > 0
          const label = subscript(index + 1)
          return (
            <g key={index} className={`lab-circuits-branch${isOpen ? ' is-open' : ''}`} data-branch={index + 1}>
              <path className="lab-circuits-wire" d={`M${x} ${TOP}V62M${x} 104V${isOpen ? 112 : 140}${isOpen ? `M${x} 130V140` : ''}${hasSource ? `M${x} 150V${BOTTOM}` : `M${x} 140V${BOTTOM}`}`} />
              <path className="lab-circuits-zigzag" d={`M${x} 62l7 3.5l-14 7l14 7l-14 7l14 7l-14 7l7 3.5`} />
              {isOpen && <><path className="lab-circuits-switch" d={`M${x} 130L${x + 13} 113`} /><circle className="lab-circuits-terminal" cx={x} cy="112" r="2.8" /><circle className="lab-circuits-terminal" cx={x} cy="130" r="2.8" /></>}
              {hasSource && <>
                <line className="lab-circuits-plate-long" x1={x - 13} x2={x + 13} y1={plusOnTop ? 140 : 150} y2={plusOnTop ? 140 : 150} />
                <line className="lab-circuits-plate-short" x1={x - 7} x2={x + 7} y1={plusOnTop ? 150 : 140} y2={plusOnTop ? 150 : 140} />
                <text className="lab-circuits-polarity" x={x - 24} y={plusOnTop ? 138 : 160}>+</text>
                <text x={x + 18} y="149">ε{label} = {num(Math.abs(branch.emf))} V</text>
              </>}
              <text x={x + 14} y="87">R{label} = {num(branch.resistance)} Ω</text>
              {isOpen
                ? <text className="lab-circuits-flow" x={x - 12} y="87" textAnchor="end">aberto</text>
                : <>
                  {length > 0 && current !== 0 && <line className="lab-circuits-current" x1={x - 16} x2={x - 16} y1={up ? 83 + length / 2 : 83 - length / 2} y2={up ? 83 - length / 2 : 83 + length / 2} markerEnd="url(#dc-kirchhoff-arrow)" />}
                  <text className="lab-circuits-flow" x={x - 24} y="87" textAnchor="end">{num(Math.abs(current))} A</text>
                </>}
            </g>
          )
        })}
        <circle className="lab-circuits-node-halo" cx={COLUMNS[1]} cy={TOP} r="9" /><circle className="lab-circuits-node" cx={COLUMNS[1]} cy={TOP} r="4" />
        <circle className="lab-circuits-node-halo" cx={COLUMNS[1]} cy={BOTTOM} r="9" /><circle className="lab-circuits-node" cx={COLUMNS[1]} cy={BOTTOM} r="4" />
        <text className="lab-circuits-node-label" x={COLUMNS[1] + 14} y={TOP - 8}>a</text>
        <text className="lab-circuits-node-label" x={COLUMNS[1] + 14} y={BOTTOM + 20}>b</text>
      </svg>
      <ResultStrip label="Tensão entre os nós a e b" value={`${num(vab)} V`} formula="V_{ab}=\dfrac{\sum \varepsilon_i/R_i}{\sum 1/R_i}\qquad I_i=\dfrac{\varepsilon_i-V_{ab}}{R_i}" secondary="correntes positivas: de b para a através do ramo" />
      <Metrics items={currents.map((current, index) => ({ label: `Corrente no ramo ${index + 1}`, value: open === index + 1 ? 'ramo aberto' : `${num(current)} A · ${sense(current)}` }))} />

      {branches.map((branch, index) => (
        <div key={index} className="lab-circuits-pair">
          <Control label={`f.e.m. do ramo ${index + 1}`} value={branch.emf} min={-limits[index].emf} max={limits[index].emf} step={limits[index].step} onChange={(emf) => update(index, { emf })} unit="V" />
          <Control label={`Resistência do ramo ${index + 1}`} value={branch.resistance} min={limits[index].step} max={limits[index].resistance} step={limits[index].step} onChange={(resistance) => update(index, { resistance })} unit="Ω" />
        </div>
      ))}
      <Choice label="Interruptor aberto" value={open} onChange={setOpen} options={[[0, 'nenhum'], [1, 'ramo 1'], [2, 'ramo 2'], [3, 'ramo 3']] as const} />

      <div className="lab-circuits-panel">
        <h3>Lei dos nós (nó a)</h3>
        <p className="lab-circuits-equation">I₁ + I₂ + I₃ = {currents.map(bracket).join(' + ')} = {num(sum)} A</p>
        <h3>Lei das malhas (cada ramo, de b até a)</h3>
        <ul className="lab-circuits-equations">
          {branches.map((branch, index) => {
            const label = subscript(index + 1)
            return <li key={index}>{open === index + 1
              ? `Ramo ${index + 1}: aberto, I${label} = 0 — não entra na soma.`
              : `Ramo ${index + 1}: Vab = ε${label} − R${label}·I${label} = ${num(branch.emf)} − ${num(branch.resistance)} × ${bracket(currents[index])} = ${num(clean(branch.emf - branch.resistance * currents[index]))} V`}</li>
          })}
        </ul>
      </div>
      <div className="lab-circuits-panel">
        <h3>Balanço de potência</h3>
        <div className="lab-circuits-table-wrap">
          <table className="lab-circuits-table">
            <thead><tr><th scope="col">Ramo</th><th scope="col">Fonte (ε·I)</th><th scope="col">Resistência (R·I²)</th></tr></thead>
            <tbody>{branches.map((branch, index) => {
              const power = clean(solution.sourcePower[index])
              return <tr key={index}><th scope="row">{index + 1}</th><td>{branch.emf === 0 ? 'sem fonte' : power > 0 ? `fornece ${num(power)} W` : power < 0 ? `absorve ${num(-power)} W` : '0 W'}</td><td>dissipa {num(clean(solution.resistorPower[index]))} W</td></tr>
            })}</tbody>
            <tfoot><tr><th scope="row">Total</th><td>{num(clean(solution.delivered))} W</td><td>{num(clean(solution.dissipated))} W</td></tr></tfoot>
          </table>
        </div>
        <p className="lab-circuits-equation">Verificação: Σ ε·I = {num(clean(solution.delivered))} W = Σ R·I² = {num(clean(solution.dissipated))} W</p>
      </div>
      <LabNote title="Convenção de sinais:">ε &gt; 0 quando o terminal + da fonte fica virado para o nó a (empurra corrente de b para a). Uma corrente negativa desce de a para b. Se a corrente atravessa uma fonte contra a sua f.e.m., essa fonte está a absorver energia. Com um ramo aberto sobra uma única malha.</LabNote>
    </>
  )
}
