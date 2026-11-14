/**
 * Física dos cenários de circuitos (DC e RC). Funções puras, unidades SI, sem React.
 */

export const ELEMENTARY_CHARGE = 1.602176634e-19
export const EPSILON_0 = 8.8541878128e-12

// ─────────────────────────────────────────────────────────────────────────────
// Associações série/paralelo: expressão → árvore
// ─────────────────────────────────────────────────────────────────────────────

export type GroupKind = 'series' | 'parallel' | 'bridge'

/** Folha = um componente (resistência ou condensador); grupo = associação dos filhos. */
export type NetNode =
  | { kind: 'leaf'; value: number; id: number }
  | { kind: GroupKind; children: NetNode[] }

export class NetParseError extends Error {
  /** Índice (base 0) do carácter onde o erro foi detetado. */
  position: number

  constructor(message: string, position: number) {
    super(message)
    this.name = 'NetParseError'
    this.position = position
  }
}

export const MAX_NETWORK_LEAVES = 24

const groupKinds: Record<string, GroupKind> = { s: 'series', p: 'parallel', b: 'bridge' }
const numberPattern = /(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/iy

/**
 * Lê uma expressão como `p(s(4,p(10,s(5,10))),s(5,p(10,10)))`.
 *
 * Gramática: `elemento := número | s(elemento, …) | p(elemento, …) | b(a, b, c, d, m)`.
 * - `s(…)` série, `p(…)` paralelo, com dois ou mais elementos;
 * - `b(a,b,c,d,m)` ponte (não redutível por série/paralelo): `a` e `b` em série no ramo de cima,
 *   `c` e `d` em série no ramo de baixo, `m` a ligar os dois pontos intermédios;
 * - números com ponto decimal, notação científica (`4.7e3`) e sufixos `k` (×10³) e `M` (×10⁶).
 *
 * As folhas são numeradas (id 1, 2, …) pela ordem em que aparecem. Lança `NetParseError`.
 */
export function parseNetwork(text: string): NetNode {
  let position = 0
  let leaves = 0

  function skipSpaces() { while (position < text.length && /\s/.test(text[position])) position += 1 }
  function fail(message: string, at = position): never { throw new NetParseError(message, at) }

  function element(): NetNode {
    skipSpaces()
    if (position >= text.length) fail('A expressão acabou cedo: falta um valor ou um grupo.')
    const letter = text[position].toLowerCase()
    const kind = groupKinds[letter]
    if (kind) return group(kind, letter)
    if (text[position] === '-') fail(`Os valores têm de ser positivos (posição ${position + 1}).`)
    numberPattern.lastIndex = position
    const match = numberPattern.exec(text)
    if (!match) fail(`Esperava um número, s(…), p(…) ou b(…) na posição ${position + 1}, mas encontrei "${text[position]}".`)
    const start = position
    position += match[0].length
    let value = Number(match[0])
    if (text[position] === 'k' || text[position] === 'K') { value *= 1e3; position += 1 }
    else if (text[position] === 'M') { value *= 1e6; position += 1 }
    if (!Number.isFinite(value) || value <= 0) fail(`Os valores têm de ser positivos (posição ${start + 1}).`, start)
    leaves += 1
    if (leaves > MAX_NETWORK_LEAVES) fail(`Demasiados componentes: o máximo é ${MAX_NETWORK_LEAVES}.`, start)
    return { kind: 'leaf', value, id: leaves }
  }

  function group(kind: GroupKind, letter: string): NetNode {
    const start = position
    position += 1
    skipSpaces()
    if (text[position] !== '(') fail(`Falta "(" depois de "${letter}" (posição ${position + 1}).`)
    position += 1
    const children: NetNode[] = []
    for (;;) {
      skipSpaces()
      if (text[position] === ')' && children.length === 0) fail(`O grupo ${letter}(…) da posição ${start + 1} está vazio.`)
      children.push(element())
      skipSpaces()
      if (text[position] === ',') { position += 1; continue }
      if (text[position] === ')') { position += 1; break }
      if (position >= text.length) fail(`Falta fechar com ")" o grupo ${letter}(… aberto na posição ${start + 1}.`)
      fail(`Esperava "," ou ")" na posição ${position + 1}, mas encontrei "${text[position]}".`)
    }
    if (kind === 'bridge' && children.length !== 5) fail(`A ponte b(a,b,c,d,m) precisa de exatamente 5 elementos; tem ${children.length} (posição ${start + 1}).`, start)
    if (kind !== 'bridge' && children.length < 2) fail(`O grupo ${letter}(…) da posição ${start + 1} precisa de pelo menos dois elementos.`, start)
    return { kind, children }
  }

  skipSpaces()
  if (position >= text.length) fail('Escreve uma associação, por exemplo s(4,p(10,15)).')
  const root = element()
  skipSpaces()
  if (position < text.length) {
    if (text[position] === ',') fail(`Vários elementos soltos: junta-os com s(…) ou p(…) (posição ${position + 1}).`)
    fail(`Texto a mais a partir da posição ${position + 1}: "${text.slice(position, position + 12)}".`)
  }
  return root
}

/** Multiplica todos os valores da árvore por `factor` (ex.: μF → F). */
export function scaleNetwork(node: NetNode, factor: number): NetNode {
  return node.kind === 'leaf' ? { ...node, value: node.value * factor } : { kind: node.kind, children: node.children.map((child) => scaleNetwork(child, factor)) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Associações série/paralelo: resolução
// ─────────────────────────────────────────────────────────────────────────────

/** Resistências (fluxo = corrente) ou condensadores (fluxo = carga). */
export type NetQuantity = 'resistance' | 'capacitance'

export interface SolvedNode {
  kind: 'leaf' | GroupKind
  /** Folhas: número de ordem (1, 2, …). Grupos: 0. */
  id: number
  /** Resistência (Ω) ou capacidade (F): valor próprio da folha ou equivalente do grupo. */
  value: number
  /** Tensão aos terminais (V), sempre ≥ 0. */
  voltage: number
  /** Corrente (A) nas resistências; carga (C) nos condensadores. */
  flow: number
  /** Potência dissipada (W) nas resistências; energia armazenada (J) nos condensadores. */
  work: number
  /** Só no elemento central de uma ponte: verdadeiro se o fluxo vai do ramo de baixo para o de cima. */
  reversed: boolean
  children: SolvedNode[]
}

export interface ReductionStep {
  kind: GroupKind
  /** Valores (equivalentes) dos elementos associados neste passo. */
  operands: number[]
  result: number
}

export interface NetSolution {
  root: SolvedNode
  equivalent: number
  voltage: number
  flow: number
  work: number
  /** Componentes pela ordem em que aparecem na expressão. */
  leaves: SolvedNode[]
  /** Passos de redução, dos grupos mais interiores para o exterior. */
  steps: ReductionStep[]
}

interface Draft {
  node: NetNode
  /** "Condutância generalizada": 1/R nas resistências, C nos condensadores (fluxo = g·V). */
  g: number
  children: Draft[]
}

/** Nós internos de uma ponte com condutâncias ga (entrada→X), gb (X→saída), gc (entrada→Y), gd (Y→saída), gm (X–Y). */
export function solveBridge(ga: number, gb: number, gc: number, gd: number, gm: number, voltage: number) {
  const top = ga + gb + gm
  const bottom = gc + gd + gm
  const determinant = top * bottom - gm * gm
  if (!(determinant > 0)) return { upper: 0, lower: 0, flow: 0 }
  const upper = voltage * (ga * bottom + gm * gc) / determinant
  const lower = voltage * (gc * top + gm * ga) / determinant
  return { upper, lower, flow: ga * (voltage - upper) + gc * (voltage - lower) }
}

function toConductance(value: number, quantity: NetQuantity) {
  return quantity === 'resistance' ? 1 / value : value
}

function draft(node: NetNode, quantity: NetQuantity): Draft {
  if (node.kind === 'leaf') return { node, g: toConductance(node.value, quantity), children: [] }
  const children = node.children.map((child) => draft(child, quantity))
  const gs = children.map((child) => child.g)
  if (node.kind === 'parallel') return { node, g: gs.reduce((sum, g) => sum + g, 0), children }
  if (node.kind === 'series') return { node, g: 1 / gs.reduce((sum, g) => sum + 1 / g, 0), children }
  return { node, g: solveBridge(gs[0], gs[1], gs[2], gs[3], gs[4], 1).flow, children }
}

function assign(item: Draft, voltage: number, quantity: NetQuantity, reversed = false): SolvedNode {
  const flow = item.g * voltage
  const base = {
    kind: item.node.kind,
    id: item.node.kind === 'leaf' ? item.node.id : 0,
    value: item.node.kind === 'leaf' ? item.node.value : toConductance(item.g, quantity),
    voltage,
    flow,
    work: quantity === 'resistance' ? voltage * flow : 0.5 * voltage * flow,
    reversed,
  }
  if (item.node.kind === 'leaf') return { ...base, children: [] }
  if (item.node.kind === 'parallel') return { ...base, children: item.children.map((child) => assign(child, voltage, quantity)) }
  if (item.node.kind === 'series') return { ...base, children: item.children.map((child) => assign(child, flow / child.g, quantity)) }
  const [a, b, c, d, m] = item.children
  const { upper, lower } = solveBridge(a.g, b.g, c.g, d.g, m.g, voltage)
  return {
    ...base,
    children: [
      assign(a, voltage - upper, quantity),
      assign(b, upper, quantity),
      assign(c, voltage - lower, quantity),
      assign(d, lower, quantity),
      assign(m, Math.abs(upper - lower), quantity, lower > upper),
    ],
  }
}

function collect(node: SolvedNode, leaves: SolvedNode[], steps: ReductionStep[]) {
  if (node.kind === 'leaf') { leaves.push(node); return }
  node.children.forEach((child) => collect(child, leaves, steps))
  steps.push({ kind: node.kind, operands: node.children.map((child) => child.value), result: node.value })
}

/**
 * Resolve a associação com tensão total imposta (`{ voltage }`) ou fluxo total imposto
 * (`{ flow }`: corrente total nas resistências, carga total nos condensadores).
 */
export function solveNetwork(root: NetNode, quantity: NetQuantity, drive: { voltage: number } | { flow: number }): NetSolution {
  const tree = draft(root, quantity)
  const voltage = 'voltage' in drive ? drive.voltage : drive.flow / tree.g
  const solved = assign(tree, Number.isFinite(voltage) ? voltage : 0, quantity)
  const leaves: SolvedNode[] = []
  const steps: ReductionStep[] = []
  collect(solved, leaves, steps)
  leaves.sort((first, second) => first.id - second.id)
  return { root: solved, equivalent: solved.value, voltage: solved.voltage, flow: solved.flow, work: solved.work, leaves, steps }
}

// ─────────────────────────────────────────────────────────────────────────────
// Três ramos entre dois nós (Kirchhoff / Millman)
// ─────────────────────────────────────────────────────────────────────────────

export interface Branch {
  /** f.e.m. (V); positiva quando empurra corrente de b para a através do ramo. */
  emf: number
  /** Resistência total do ramo (Ω). */
  resistance: number
}

export interface BranchSolution {
  /** V_a − V_b (V). */
  vab: number
  /** Corrente em cada ramo, de b para a através do ramo (A). Zero no ramo aberto. */
  currents: number[]
  /** Potência fornecida por cada fonte (W); negativa quando a fonte absorve. */
  sourcePower: number[]
  /** Potência dissipada em cada resistência (W). */
  resistorPower: number[]
  delivered: number
  dissipated: number
}

/** Ramos em paralelo entre os nós a e b; `open` (1, 2, 3…) retira esse ramo do circuito. */
export function solveBranches(branches: Branch[], open = 0): BranchSolution {
  const closed = branches.map((branch, index) => index + 1 !== open && branch.resistance > 0)
  const conductance = branches.reduce((sum, branch, index) => sum + (closed[index] ? 1 / branch.resistance : 0), 0)
  const drive = branches.reduce((sum, branch, index) => sum + (closed[index] ? branch.emf / branch.resistance : 0), 0)
  const vab = conductance > 0 ? drive / conductance : 0
  const currents = branches.map((branch, index) => (closed[index] ? (branch.emf - vab) / branch.resistance : 0))
  const sourcePower = branches.map((branch, index) => branch.emf * currents[index])
  const resistorPower = branches.map((branch, index) => branch.resistance * currents[index] ** 2)
  return {
    vab,
    currents,
    sourcePower,
    resistorPower,
    delivered: sourcePower.reduce((sum, power) => sum + power, 0),
    dissipated: resistorPower.reduce((sum, power) => sum + power, 0),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fonte real
// ─────────────────────────────────────────────────────────────────────────────

/** Fonte com f.e.m. e resistência interna ligada a uma carga R. */
export function realSource(emf: number, internal: number, load: number) {
  const total = internal + load
  const current = total > 0 ? emf / total : 0
  const loadPower = load * current ** 2
  const internalPower = internal * current ** 2
  return {
    current,
    terminalVoltage: load * current,
    loadPower,
    internalPower,
    efficiency: total > 0 ? load / total : 0,
    /** Máximo de P(R), atingido em R = Rin. */
    maxPower: internal > 0 ? emf ** 2 / (4 * internal) : 0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Voltímetro real num divisor de tensão
// ─────────────────────────────────────────────────────────────────────────────

/** Divisor r2 (série) + r1 (medida); o voltímetro de resistência `meter` fica em paralelo com r1. */
export function loadedDivider(source: number, measured: number, series: number, meter: number) {
  const ideal = !(meter > 0) || !Number.isFinite(meter)
  const parallel = ideal ? measured : measured * meter / (measured + meter)
  const trueVoltage = measured + series > 0 ? source * measured / (measured + series) : 0
  const measuredVoltage = parallel + series > 0 ? source * parallel / (parallel + series) : 0
  return {
    trueVoltage,
    measuredVoltage,
    /** Resistência de r1 ∥ voltímetro. */
    parallel,
    /** Desvio relativo do valor medido, em percentagem (negativo: lê a menos). */
    errorPercent: trueVoltage !== 0 ? (measuredVoltage - trueVoltage) / trueVoltage * 100 : 0,
    /** Corrente desviada pelo voltímetro (A). */
    meterCurrent: ideal ? 0 : measuredVoltage / meter,
    /** Corrente na resistência medida com o voltímetro ligado (A). */
    resistorCurrent: measured > 0 ? measuredVoltage / measured : 0,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fio condutor
// ─────────────────────────────────────────────────────────────────────────────

/** Fio cilíndrico: diâmetro (m), resistividade (Ω·m), corrente (A), densidade de portadores (m⁻³). */
export function wireProperties(diameter: number, resistivity: number, current: number, carrierDensity: number) {
  const area = Math.PI * diameter ** 2 / 4
  const resistancePerMetre = area > 0 ? resistivity / area : 0
  return {
    area,
    resistancePerMetre,
    powerPerMetre: resistancePerMetre * current ** 2,
    driftSpeed: area > 0 && carrierDensity > 0 ? current / (carrierDensity * ELEMENTARY_CHARGE * area) : 0,
  }
}

/** Corrente máxima para não ultrapassar `powerLimit` (W/m) num fio com `resistancePerMetre` (Ω/m). */
export function wireMaxCurrent(resistancePerMetre: number, powerLimit: number) {
  return resistancePerMetre > 0 && powerLimit >= 0 ? Math.sqrt(powerLimit / resistancePerMetre) : 0
}

/** Diâmetro mínimo (m) para transportar `current` dissipando no máximo `powerLimit` (W/m). */
export function wireMinDiameter(resistivity: number, current: number, powerLimit: number) {
  return powerLimit > 0 && resistivity >= 0 ? 2 * Math.abs(current) * Math.sqrt(resistivity / (Math.PI * powerLimit)) : 0
}

// ─────────────────────────────────────────────────────────────────────────────
// RC com comutador
// ─────────────────────────────────────────────────────────────────────────────

/** Condensador C (F) que carrega por `chargeR` a partir de uma fonte e descarrega por `dischargeR`. */
export function rcSwitch(capacitance: number, source: number, chargeR: number, dischargeR: number) {
  return {
    tauCharge: chargeR * capacitance,
    tauDischarge: dischargeR * capacitance,
    initialChargeCurrent: chargeR > 0 ? source / chargeR : 0,
    initialDischargeCurrent: dischargeR > 0 ? source / dischargeR : 0,
    /** Corrente quando a carga é metade do máximo: metade da corrente inicial, em qualquer das fases. */
    halfChargeCurrent: chargeR > 0 ? source / (2 * chargeR) : 0,
    halfDischargeCurrent: dischargeR > 0 ? source / (2 * dischargeR) : 0,
    finalCharge: capacitance * source,
    energy: 0.5 * capacitance * source ** 2,
  }
}

/** Estado no instante `time` (s) da fase de carga (a partir de 0 V) ou de descarga (a partir de `source`). */
export function rcState(phase: 'charge' | 'discharge', source: number, resistance: number, capacitance: number, time: number) {
  const tau = resistance * capacitance
  const decay = tau > 0 ? Math.exp(-Math.max(0, time) / tau) : 0
  const voltage = phase === 'charge' ? source * (1 - decay) : source * decay
  return {
    voltage,
    current: resistance > 0 ? source / resistance * decay : 0,
    charge: capacitance * voltage,
    /** Fração da carga máxima (0…1). */
    fraction: phase === 'charge' ? 1 - decay : decay,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Condensador plano
// ─────────────────────────────────────────────────────────────────────────────

/** Área (m²), separação (m), constante dielétrica e tensão (V). */
export function parallelPlate(area: number, separation: number, dielectric: number, voltage: number) {
  const capacitance = separation > 0 ? dielectric * EPSILON_0 * area / separation : 0
  const field = separation > 0 ? voltage / separation : 0
  return {
    capacitance,
    charge: capacitance * voltage,
    field,
    energy: 0.5 * capacitance * voltage ** 2,
    /** Módulo da força sobre um eletrão entre as placas (N). */
    electronForce: ELEMENTARY_CHARGE * Math.abs(field),
  }
}
