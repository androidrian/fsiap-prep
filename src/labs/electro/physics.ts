/**
 * Física dos cenários de eletrostática e campo uniforme.
 * Tudo em unidades SI, sem React. As funções nunca devolvem NaN/Infinity: divisões e raízes estão protegidas.
 */

export const K = 8.99e9
export const EPS0 = 8.854e-12
export const G = 9.81
/** Carga elementar com o valor usado nas fichas (q = 1,6×10⁻¹⁹ C). */
export const E_CHARGE = 1.6e-19

export interface Vec {
  x: number
  y: number
}

export interface PointCharge extends Vec {
  q: number
}

export interface VecInfo extends Vec {
  magnitude: number
  /** Ângulo com +x em graus, em ]−180, 180]. Zero quando o vetor é nulo. */
  angle: number
}

export function vecInfo(x: number, y: number): VecInfo {
  const magnitude = Math.hypot(x, y)
  return { x, y, magnitude, angle: magnitude > 0 ? Math.atan2(y, x) * 180 / Math.PI : 0 }
}

/** Campo criado por uma carga pontual num ponto. Sobre a própria carga devolve zero (singularidade ignorada). */
export function fieldOfCharge(charge: PointCharge, point: Vec): Vec {
  const dx = point.x - charge.x
  const dy = point.y - charge.y
  const r = Math.hypot(dx, dy)
  if (!(r > 0)) return { x: 0, y: 0 }
  const magnitude = K * charge.q / (r * r)
  return { x: magnitude * dx / r, y: magnitude * dy / r }
}

export function fieldAt(charges: PointCharge[], point: Vec): { contributions: VecInfo[]; total: VecInfo } {
  const contributions = charges.map((charge) => {
    const field = fieldOfCharge(charge, point)
    return vecInfo(field.x, field.y)
  })
  const x = contributions.reduce((sum, field) => sum + field.x, 0)
  const y = contributions.reduce((sum, field) => sum + field.y, 0)
  return { contributions, total: vecInfo(x, y) }
}

/** Potencial (soma escalar). `terms[i]` = k·qᵢ/rᵢ; uma carga exatamente no ponto é ignorada (termo 0). */
export function potentialAt(charges: PointCharge[], point: Vec): { terms: number[]; distances: number[]; total: number } {
  const distances = charges.map((charge) => Math.hypot(point.x - charge.x, point.y - charge.y))
  const terms = charges.map((charge, index) => (distances[index] > 0 ? K * charge.q / distances[index] : 0))
  return { terms, distances, total: terms.reduce((sum, term) => sum + term, 0) }
}

/** Força sobre uma carga de prova colocada num ponto. */
export function forceOnTestCharge(charges: PointCharge[], point: Vec, testCharge: number): VecInfo {
  const { total } = fieldAt(charges, point)
  return vecInfo(testCharge * total.x, testCharge * total.y)
}

/** Trabalho da força elétrica quando a carga de prova vai de `from` para `to`: W = q·(V(from) − V(to)). */
export function workBetween(charges: PointCharge[], from: Vec, to: Vec, testCharge: number): number {
  return testCharge * (potentialAt(charges, from).total - potentialAt(charges, to).total)
}

const lengthUnits: Record<string, number> = { m: 1, cm: 1e-2, mm: 1e-3 }
const chargeUnits: Record<string, number> = { C: 1, mC: 1e-3, uC: 1e-6, nC: 1e-9, e: E_CHARGE }

export function lengthUnitFactor(unit: string): number {
  return lengthUnits[unit] ?? 1
}

export function chargeUnitFactor(unit: string): number {
  return chargeUnits[unit] ?? 1
}

export function isLengthUnit(unit: string): boolean {
  return unit in lengthUnits
}

export function isChargeUnit(unit: string): boolean {
  return unit in chargeUnits
}

/** Lê "x,y" (ponto decimal). Devolve null se não forem dois números finitos. */
export function parsePoint(text: string | undefined): Vec | null {
  if (!text) return null
  const parts = text.split(',').map((part) => Number(part.trim()))
  if (parts.length !== 2 || !parts.every(Number.isFinite)) return null
  return { x: parts[0], y: parts[1] }
}

/** Lê "x,y,q;x,y,q;…" nas unidades do utilizador. Entradas inválidas são ignoradas. */
export function parseCharges(text: string | undefined): PointCharge[] {
  if (!text) return []
  return text.split(';').flatMap((entry) => {
    const parts = entry.split(',').map((part) => Number(part.trim()))
    if (entry.trim() === '' || parts.length !== 3 || !parts.every(Number.isFinite)) return []
    return [{ x: parts[0], y: parts[1], q: parts[2] }]
  })
}

export interface PairPendulum {
  /** Ângulo de cada fio com a vertical (rad). */
  theta: number
  /** Separação real entre as cargas, x = 2·l·sinθ (m). */
  separation: number
  /** Estimativa para ângulos pequenos, x ≈ (l·q²/(2π·ε₀·m·g))^(1/3) (m). */
  smallAngleSeparation: number
  electricForce: number
  weight: number
  tension: number
}

/**
 * Dois pêndulos iguais suspensos do mesmo ponto: resolve sin²θ·tanθ = k·q²/(4·l²·m·g) por bisseção.
 * Dados inválidos (m, l ≤ 0) dão θ = 0.
 */
export function pairPendulum(mass: number, charge: number, length: number, gravity = G): PairPendulum {
  const weight = Math.max(0, mass) * gravity
  if (!(weight > 0) || !(length > 0) || charge === 0 || !Number.isFinite(charge)) {
    return { theta: 0, separation: 0, smallAngleSeparation: 0, electricForce: 0, weight, tension: weight }
  }
  const target = K * charge * charge / (4 * length * length * weight)
  let low = 0
  let high = Math.PI / 2 - 1e-9
  for (let step = 0; step < 80; step += 1) {
    const middle = (low + high) / 2
    if (Math.sin(middle) ** 2 * Math.tan(middle) < target) low = middle
    else high = middle
  }
  const theta = (low + high) / 2
  const separation = 2 * length * Math.sin(theta)
  const electricForce = separation > 0 ? K * charge * charge / (separation * separation) : 0
  return {
    theta,
    separation,
    smallAngleSeparation: Math.cbrt(2 * K * charge * charge * length / weight),
    electricForce,
    weight,
    tension: Math.hypot(weight, electricForce),
  }
}

export interface PlanePendulum {
  /** Campo do plano infinito, E = |σ|/(2ε₀) (V/m). */
  field: number
  /** Ângulo do fio com o plano vertical (rad). */
  theta: number
  electricForce: number
  weight: number
  tension: number
  /** Distância da carga ao plano, l·sinθ (m). */
  distance: number
}

/** Carga suspensa de um fio preso a um plano vertical infinito com densidade σ (C/m²): tanθ = qE/(mg). */
export function planePendulum(mass: number, charge: number, length: number, sigma: number, gravity = G): PlanePendulum {
  const field = Math.abs(sigma) / (2 * EPS0)
  const weight = Math.max(0, mass) * gravity
  // Só há afastamento do plano quando carga e plano têm o mesmo sinal; caso contrário a carga encosta ao plano.
  const electricForce = charge * sigma > 0 ? Math.abs(charge) * field : 0
  const theta = weight > 0 ? Math.atan(electricForce / weight) : electricForce > 0 ? Math.PI / 2 : 0
  return { field, theta, electricForce, weight, tension: Math.hypot(weight, electricForce), distance: Math.max(0, length) * Math.sin(theta) }
}

export interface SheetsResult {
  /** Campo de cada placa isolada (módulos, N/C). */
  fieldPlus: number
  fieldMinus: number
  /** Componente segundo +x (da placa positiva para a negativa) do campo total em cada região. */
  left: number
  between: number
  right: number
  /** V(placa +) − V(placa −) = E·d (V). */
  deltaV: number
  /** Trabalho da força elétrica ao levar q da placa positiva até à negativa (J). */
  work: number
}

/** Dois planos infinitos paralelos: σ₊ à esquerda, −|σ₋| à direita, separados de d. */
export function chargedSheets(sigmaPlus: number, sigmaMinus: number, separation: number, charge: number): SheetsResult {
  const fieldPlus = Math.abs(sigmaPlus) / (2 * EPS0)
  const fieldMinus = Math.abs(sigmaMinus) / (2 * EPS0)
  const between = fieldPlus + fieldMinus
  const deltaV = between * Math.max(0, separation)
  return { fieldPlus, fieldMinus, left: fieldMinus - fieldPlus, between, right: fieldPlus - fieldMinus, deltaV, work: charge * deltaV }
}

export interface ReleaseResult {
  force: number
  weight: number
  /** Quantas vezes a força elétrica é maior do que o peso (0 se a massa for nula). */
  forceToWeight: number
  deltaV: number
  kineticEnergy: number
  speed: number
  acceleration: number
}

/** Carga abandonada do repouso num campo uniforme e que percorre d ao longo das linhas de campo. */
export function releaseInField(field: number, distance: number, charge: number, mass: number, gravity = G): ReleaseResult {
  const fieldModulus = Math.abs(field)
  const path = Math.max(0, distance)
  const force = Math.abs(charge) * fieldModulus
  const weight = Math.max(0, mass) * gravity
  const deltaV = fieldModulus * path
  const kineticEnergy = Math.abs(charge) * deltaV
  const speed = mass > 0 ? Math.sqrt(2 * kineticEnergy / mass) : 0
  return { force, weight, forceToWeight: weight > 0 ? force / weight : 0, deltaV, kineticEnergy, speed, acceleration: mass > 0 ? force / mass : 0 }
}

export interface DeflectionResult {
  /** Aceleração vertical, positiva para cima (m/s²). */
  acceleration: number
  /** Tempo entre as placas (s). */
  time: number
  /** Deflexão vertical em x = L, positiva para cima (m). */
  deflection: number
  /** Velocidade vertical à saída, positiva para cima (m/s). */
  exitSpeedY: number
  /** Ângulo da velocidade à saída com a horizontal (graus, positivo para cima). */
  exitAngle: number
}

/**
 * Lançamento perpendicular a um campo uniforme. `fieldDown` é o campo com sentido positivo para baixo,
 * por isso uma carga negativa num campo para baixo sobe: y = −q·E/(2m)·(L/vₓ)².
 */
export function transverseDeflection(fieldDown: number, charge: number, mass: number, speed: number, length: number): DeflectionResult {
  if (!(mass > 0) || !(speed > 0) || !(length >= 0)) return { acceleration: 0, time: 0, deflection: 0, exitSpeedY: 0, exitAngle: 0 }
  const acceleration = -charge * fieldDown / mass
  const time = length / speed
  const exitSpeedY = acceleration * time
  return { acceleration, time, deflection: 0.5 * acceleration * time * time, exitSpeedY, exitAngle: Math.atan2(exitSpeedY, speed) * 180 / Math.PI }
}

/** Passo "redondo" (1, 2 ou 5 × 10ⁿ) imediatamente acima de `raw`. */
export function niceStep(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1
  const exponent = Math.floor(Math.log10(raw))
  const base = 10 ** exponent
  const mantissa = raw / base
  return (mantissa <= 1 ? 1 : mantissa <= 2 ? 2 : mantissa <= 5 ? 5 : 10) * base
}

/**
 * Alarga a gama de um cursor para incluir um valor vindo do URL em vez de o cortar, e afina o passo
 * (até 1000× mais fino) quando o valor não é múltiplo do passo.
 */
export function sliderRange(value: number, min: number, max: number, step: number): { min: number; max: number; step: number } {
  if (!Number.isFinite(value)) return { min, max, step }
  let fineStep = step
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ratio = value / fineStep
    if (Math.abs(ratio - Math.round(ratio)) < 1e-6) break
    fineStep /= 10
  }
  const clean = (edge: number) => Number(edge.toPrecision(12))
  const lower = value < 0 ? value * 1.5 : value / 2
  const upper = value > 0 ? value * 1.5 : value / 2
  return {
    min: value < min ? clean(Math.floor(lower / fineStep + 1e-9) * fineStep) : min,
    max: value > max ? clean(Math.ceil(upper / fineStep - 1e-9) * fineStep) : max,
    step: fineStep,
  }
}
