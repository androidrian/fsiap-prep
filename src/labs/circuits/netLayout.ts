import type { SolvedNode } from './physics'

/** Geometria do esquema gerado a partir da árvore: série = em linha, paralelo = ramos empilhados entre duas calhas. */

export const LEAF_WIDTH = 86
export const LEAF_HEIGHT = 52
/** Meia-largura do símbolo do componente (caixa da resistência / placas do condensador). */
export const BODY = 22
const STUB = 14
const BRIDGE_GAP = 36
const BRIDGE_MIDDLE = 30

interface Box {
  node: SolvedNode
  width: number
  height: number
  children: Box[]
}

export interface ElementShape {
  node: SolvedNode
  /** Centro do símbolo. */
  cx: number
  cy: number
  /** Extremos dos fios de ligação (horizontal: x; vertical: y). */
  from: number
  to: number
  vertical: boolean
}

export interface NetLayout {
  width: number
  height: number
  /** Segmentos de fio comuns (calhas e ligações), como `d` de um path. */
  wires: string
  elements: ElementShape[]
  junctions: Array<[number, number]>
}

function measure(node: SolvedNode): Box {
  if (node.kind === 'leaf') return { node, width: LEAF_WIDTH, height: LEAF_HEIGHT, children: [] }
  const children = node.children.map(measure)
  if (node.kind === 'series') return { node, width: children.reduce((sum, child) => sum + child.width, 0), height: Math.max(...children.map((child) => child.height)), children }
  if (node.kind === 'parallel') return { node, width: Math.max(...children.map((child) => child.width)) + 2 * STUB, height: children.reduce((sum, child) => sum + child.height, 0), children }
  const [a, b, c, d] = children
  return {
    node,
    width: 2 * STUB + Math.max(a.width, c.width) + BRIDGE_MIDDLE + Math.max(b.width, d.width),
    height: Math.max(a.height, b.height) + BRIDGE_GAP + Math.max(c.height, d.height),
    children,
  }
}

/** Calcula posições para a árvore resolvida, com o canto superior esquerdo em (0, 0). */
export function layoutNetwork(root: SolvedNode): NetLayout {
  const wires: string[] = []
  const elements: ElementShape[] = []
  const junctions: Array<[number, number]> = []

  function place(box: Box, x: number, y: number) {
    const middle = y + box.height / 2
    if (box.node.kind === 'leaf') {
      elements.push({ node: box.node, cx: x + box.width / 2, cy: middle, from: x, to: x + box.width, vertical: false })
      return
    }
    if (box.node.kind === 'series') {
      let cursor = x
      for (const child of box.children) {
        place(child, cursor, y + (box.height - child.height) / 2)
        cursor += child.width
      }
      return
    }
    const left = x + STUB
    const right = x + box.width - STUB
    wires.push(`M${x} ${middle}H${left}`, `M${right} ${middle}H${x + box.width}`)
    junctions.push([left, middle], [right, middle])
    if (box.node.kind === 'parallel') {
      let cursor = y
      const rows: number[] = []
      for (const child of box.children) {
        const row = cursor + child.height / 2
        const start = left + (right - left - child.width) / 2
        if (start > left) wires.push(`M${left} ${row}H${start}`, `M${start + child.width} ${row}H${right}`)
        place(child, start, cursor)
        rows.push(row)
        cursor += child.height
      }
      wires.push(`M${left} ${rows[0]}V${rows[rows.length - 1]}`, `M${right} ${rows[0]}V${rows[rows.length - 1]}`)
      return
    }
    // Ponte: a, b em cima; c, d em baixo; m na vertical entre os dois pontos intermédios.
    const [a, b, c, d, m] = box.children
    const leftWidth = Math.max(a.width, c.width)
    const rightWidth = Math.max(b.width, d.width)
    const upperHeight = Math.max(a.height, b.height)
    const lowerHeight = Math.max(c.height, d.height)
    const upper = y + upperHeight / 2
    const lower = y + upperHeight + BRIDGE_GAP + lowerHeight / 2
    const joint = left + leftWidth
    const resume = joint + BRIDGE_MIDDLE
    const row = (first: Box, second: Box, line: number, rowHeight: number, top: number) => {
      const firstStart = left + (leftWidth - first.width) / 2
      const secondStart = resume + (rightWidth - second.width) / 2
      if (firstStart > left) wires.push(`M${left} ${line}H${firstStart}`, `M${firstStart + first.width} ${line}H${joint}`)
      wires.push(`M${joint} ${line}H${secondStart}`)
      if (secondStart + second.width < right) wires.push(`M${secondStart + second.width} ${line}H${right}`)
      place(first, firstStart, top + (rowHeight - first.height) / 2)
      place(second, secondStart, top + (rowHeight - second.height) / 2)
    }
    row(a, b, upper, upperHeight, y)
    row(c, d, lower, lowerHeight, y + upperHeight + BRIDGE_GAP)
    wires.push(`M${left} ${upper}V${lower}`, `M${right} ${upper}V${lower}`)
    junctions.push([joint, upper], [joint, lower])
    elements.push({ node: m.node, cx: joint, cy: (upper + lower) / 2, from: upper, to: lower, vertical: true })
  }

  const box = measure(root)
  place(box, 0, 0)
  return { width: box.width, height: box.height, wires: wires.join(''), elements, junctions }
}
