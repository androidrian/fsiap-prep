import { BODY, layoutNetwork } from './netLayout'
import type { NetQuantity, NetSolution, SolvedNode } from './physics'

interface NetDiagramProps {
  solution: NetSolution
  quantity: NetQuantity
  ariaLabel: string
  /** Linha de resumo no topo do esquema (tensão, fluxo total, equivalente). */
  header: string
  valueLabel: (node: SolvedNode) => string
  flowLabel: (node: SolvedNode) => string
}

/**
 * Esquema gerado a partir da árvore: série = elementos em linha, paralelo = ramos empilhados entre
 * duas calhas, ponte = dois ramos com um elemento vertical a ligar os pontos intermédios.
 * A espessura do traço de cada componente cresce com a fração do fluxo total que o atravessa.
 */
export function NetDiagram({ solution, quantity, ariaLabel, header, valueLabel, flowLabel }: NetDiagramProps) {
  const layout = layoutNetwork(solution.root)
  const width = Math.max(480, layout.width + 100)
  const height = Math.max(240, layout.height + 64)
  const x0 = (width - layout.width) / 2
  const y0 = 40 + (height - 64 - layout.height) / 2
  const middle = layout.height / 2
  const stroke = (node: SolvedNode) => 1.5 + 2.5 * (solution.flow > 0 ? Math.min(1, Math.max(0, node.flow / solution.flow)) : 0)

  return (
    <svg className="lab-circuits-stage lab-circuits-net" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      <text className="lab-circuits-header" x="12" y="20">{header}</text>
      <g transform={`translate(${x0} ${y0})`}>
        <path className="lab-circuits-wire" d={`M-28 ${middle}H0M${layout.width} ${middle}H${layout.width + 28}${layout.wires}`} />
        <path className="lab-circuits-arrowhead" d={`M-6 ${middle}l-9 -5v10z`} />
        {layout.junctions.map(([x, y], index) => <circle key={index} className="lab-circuits-node" cx={x} cy={y} r="2.6" />)}
        <circle className="lab-circuits-terminal" cx={-32} cy={middle} r="4" />
        <circle className="lab-circuits-terminal" cx={layout.width + 32} cy={middle} r="4" />
        <text className="lab-circuits-terminal-label" x={-44} y={middle + 4} textAnchor="middle">A</text>
        <text className="lab-circuits-terminal-label" x={layout.width + 44} y={middle + 4} textAnchor="middle">B</text>
        {layout.elements.map(({ node, cx, cy, from, to, vertical }) => {
          // Em `style` (e não como atributo) para prevalecer sobre a espessura por omissão do CSS.
          const weight = { strokeWidth: Number(stroke(node).toFixed(2)) }
          const key = `${vertical ? 'v' : 'h'}-${cx}-${cy}`
          if (vertical) {
            return (
              <g key={key} className="lab-circuits-element">
                {quantity === 'resistance'
                  ? <><path className="lab-circuits-lead" style={weight} d={`M${cx} ${from}V${cy - 17}M${cx} ${cy + 17}V${to}`} /><rect className="lab-circuits-box" x={cx - 9} y={cy - 17} width="18" height="34" rx="2" style={weight} /></>
                  : <><path className="lab-circuits-lead" style={weight} d={`M${cx} ${from}V${cy - 4}M${cx} ${cy + 4}V${to}`} /><path className="lab-circuits-plates" d={`M${cx - 11} ${cy - 4}H${cx + 11}M${cx - 11} ${cy + 4}H${cx + 11}`} /></>}
                <text x={cx + 15} y={cy - 2}>{valueLabel(node)}</text>
                <text className="lab-circuits-flow" x={cx + 15} y={cy + 11}>{node.flow > 0 ? (node.reversed ? '↑ ' : '↓ ') : ''}{flowLabel(node)}</text>
              </g>
            )
          }
          return (
            <g key={key} className="lab-circuits-element">
              {quantity === 'resistance'
                ? <><path className="lab-circuits-lead" style={weight} d={`M${from} ${cy}H${cx - BODY}M${cx + BODY} ${cy}H${to}`} /><rect className="lab-circuits-box" x={cx - BODY} y={cy - 9} width={2 * BODY} height="18" rx="2" style={weight} /></>
                : <><path className="lab-circuits-lead" style={weight} d={`M${from} ${cy}H${cx - 4}M${cx + 4} ${cy}H${to}`} /><path className="lab-circuits-plates" d={`M${cx - 4} ${cy - 11}V${cy + 11}M${cx + 4} ${cy - 11}V${cy + 11}`} /></>}
              <text x={cx} y={cy - 14} textAnchor="middle">{valueLabel(node)}</text>
              <text className="lab-circuits-flow" x={cx} y={cy + 23} textAnchor="middle">{flowLabel(node)}</text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
