/**
 * Física dos cenários de magnetismo e indução (unidades SI, sem React).
 * Todas as funções devolvem números finitos ou `Infinity`/`NaN` protegidos pelo chamador com `Number.isFinite`.
 */

export const MU0 = 4 * Math.PI * 1e-7
export const ELEMENTARY_CHARGE = 1.6022e-19
export const ATOMIC_MASS_UNIT = 1.6605e-27
export const LIGHT_SPEED = 2.998e8

export type Vec3 = readonly [number, number, number]

export const ZERO3: Vec3 = [0, 0, 0]

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function scale(a: Vec3, factor: number): Vec3 {
  return [a[0] * factor, a[1] * factor, a[2] * factor]
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function norm(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2])
}

/** Remove ruído numérico: componentes desprezáveis face ao módulo passam a zero. */
export function tidy(a: Vec3): Vec3 {
  const limit = norm(a) * 1e-12
  const clean = (component: number) => (Math.abs(component) <= limit ? 0 : component)
  return [clean(a[0]), clean(a[1]), clean(a[2])]
}

/** Ângulo entre dois vetores em graus (0 se algum for nulo). */
export function angleBetween(a: Vec3, b: Vec3): number {
  const sizes = norm(a) * norm(b)
  if (sizes === 0) return 0
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / sizes))) * 180 / Math.PI
}

/** Lê "x,y,z" (ou "x;y;z"); devolve `fallback` se não tiver três números finitos. */
export function parseVec3(text: string | undefined, fallback: Vec3): Vec3 {
  if (!text) return fallback
  const parts = text.split(/[;,]/).map((part) => Number(part.trim()))
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return fallback
  return [parts[0], parts[1], parts[2]]
}

/* ---------- Partícula em campo uniforme: trajetória circular ---------- */

export type ArcKind = 'quarter' | 'half' | 'full'

export const arcFraction: Record<ArcKind, number> = { quarter: 0.25, half: 0.5, full: 1 }

/** Razão entre a distância entrada–saída e o raio: r√2 (¼), 2r (½), 0 (volta completa). */
export const chordFactor: Record<ArcKind, number> = { quarter: Math.SQRT2, half: 2, full: 0 }

export interface OrbitResult {
  radius: number
  period: number
  arcTime: number
  /** Distância em linha reta entre o ponto de entrada e o de saída. */
  chord: number
  force: number
  kineticEnergy: number
  angularFrequency: number
}

export function orbit(mass: number, charge: number, speed: number, field: number, arc: ArcKind): OrbitResult {
  const q = Math.abs(charge)
  const b = Math.abs(field)
  const m = Math.abs(mass)
  const v = Math.abs(speed)
  const valid = q > 0 && b > 0 && m > 0
  const radius = valid ? m * v / (q * b) : Infinity
  const period = valid ? 2 * Math.PI * m / (q * b) : Infinity
  return {
    radius,
    period,
    arcTime: period * arcFraction[arc],
    chord: radius * chordFactor[arc],
    force: q * v * b,
    kineticEnergy: 0.5 * m * v * v,
    angularFrequency: valid ? q * b / m : 0,
  }
}

/**
 * Lado para onde a partícula curva quando entra a subir (+y) com B perpendicular ao plano.
 * +1 = direita (+x), −1 = esquerda. F = q v × B: ŷ × ẑ = +x̂.
 */
export function curveSide(charge: number, fieldOutOfPage: boolean): 1 | -1 {
  const sign = (charge < 0 ? -1 : 1) * (fieldOutOfPage ? 1 : -1)
  return sign > 0 ? 1 : -1
}

/** Raio necessário para que a saída fique à distância `distance` da entrada. */
export function radiusForLanding(distance: number, arc: ArcKind): number {
  const factor = chordFactor[arc]
  return factor > 0 ? Math.abs(distance) / factor : Infinity
}

export function massForLanding(charge: number, speed: number, field: number, distance: number, arc: ArcKind): number {
  const radius = radiusForLanding(distance, arc)
  if (!Number.isFinite(radius) || speed === 0) return Infinity
  return Math.abs(charge) * Math.abs(field) * radius / Math.abs(speed)
}

export function chargeForLanding(mass: number, speed: number, field: number, distance: number, arc: ArcKind): number {
  const radius = radiusForLanding(distance, arc)
  if (!Number.isFinite(radius) || radius === 0 || field === 0) return Infinity
  return Math.abs(mass) * Math.abs(speed) / (Math.abs(field) * radius)
}

/* ---------- Força de Lorentz com vetores ---------- */

export interface LorentzResult {
  /** v × B (sem a carga). */
  product: Vec3
  magnetic: Vec3
  electric: Vec3
  total: Vec3
  /** Ângulo entre v e B (graus). */
  angle: number
  /** a = F/m + g (g segundo −z); `null` se a massa não foi dada. */
  acceleration: Vec3 | null
}

export function lorentz(charge: number, velocity: Vec3, magneticField: Vec3, electricField: Vec3 = ZERO3, mass = 0, gravity = 0): LorentzResult {
  const product = tidy(cross(velocity, magneticField))
  const magnetic = tidy(scale(product, charge))
  const electric = tidy(scale(electricField, charge))
  const total = tidy(add(magnetic, electric))
  const acceleration = mass > 0 ? tidy(add(scale(total, 1 / mass), [0, 0, -gravity])) : null
  return { product, magnetic, electric, total, angle: angleBetween(velocity, magneticField), acceleration }
}

/* ---------- Seletor de velocidades ---------- */

export interface SelectorResult {
  /** Velocidade que passa sem desvio, E/B. */
  selectedSpeed: number
  /** Força elétrica por unidade de carga (V/m). */
  electricPerCharge: number
  /** Força magnética por unidade de carga, vB (V/m). */
  magneticPerCharge: number
  /** −1 a 1: >0 domina a força elétrica, <0 domina a magnética, 0 equilíbrio. */
  imbalance: number
}

export function velocitySelector(electricField: number, magneticField: number, speed: number): SelectorResult {
  const e = Math.abs(electricField)
  const b = Math.abs(magneticField)
  const magnetic = Math.abs(speed) * b
  const total = e + magnetic
  const raw = total > 0 ? (e - magnetic) / total : 0
  return {
    selectedSpeed: b > 0 ? e / b : Infinity,
    electricPerCharge: e,
    magneticPerCharge: magnetic,
    imbalance: Math.abs(raw) < 1e-9 ? 0 : raw,
  }
}

/* ---------- Ciclotrão ---------- */

export interface CyclotronResult {
  field: number
  maxSpeed: number
  kineticEnergy: number
  kineticEnergyMeV: number
  period: number
}

export function cyclotron(frequencyHz: number, radius: number, mass: number, charge: number): CyclotronResult {
  const q = Math.abs(charge)
  const f = Math.abs(frequencyHz)
  const maxSpeed = 2 * Math.PI * f * Math.abs(radius)
  const kineticEnergy = 0.5 * Math.abs(mass) * maxSpeed * maxSpeed
  return {
    field: q > 0 ? 2 * Math.PI * Math.abs(mass) * f / q : Infinity,
    maxSpeed,
    kineticEnergy,
    kineticEnergyMeV: kineticEnergy / ELEMENTARY_CHARGE / 1e6,
    period: f > 0 ? 1 / f : Infinity,
  }
}

/* ---------- Fio retilíneo ---------- */

/** Módulo do campo de um fio longo à distância r. */
export function wireField(current: number, distance: number): number {
  if (distance <= 0) return Infinity
  return MU0 * Math.abs(current) / (2 * Math.PI * distance)
}

export interface WireExternalResult {
  wire: number
  max: number
  min: number
  /** Distância ao fio a que os dois campos têm o mesmo módulo (ponto de campo nulo). */
  cancelDistance: number
}

export function wireInExternalField(current: number, distance: number, external: number): WireExternalResult {
  const wire = wireField(current, distance)
  const ext = Math.abs(external)
  const difference = Math.abs(wire - ext)
  return {
    wire,
    max: wire + ext,
    min: difference <= Math.max(wire, ext) * 1e-9 ? 0 : difference,
    cancelDistance: ext > 0 ? MU0 * Math.abs(current) / (2 * Math.PI * ext) : Infinity,
  }
}

/**
 * Campo resultante (componentes x, y com y para cima) no ponto à distância r do fio e ângulo polar `angle` (rad),
 * com o campo externo segundo +x. Corrente positiva sai da página (campo anti-horário).
 */
export function wireResultantAt(current: number, distance: number, external: number, angle: number): { wire: [number, number]; total: [number, number] } {
  const size = wireField(current, distance) * (current < 0 ? -1 : 1)
  const wire: [number, number] = [-size * Math.sin(angle), size * Math.cos(angle)]
  return { wire, total: [wire[0] + external, wire[1]] }
}

/** Força sobre uma carga que se move paralelamente ao fio e campo elétrico que a equilibra (E = vB). */
export function chargeBesideWire(current: number, distance: number, speed: number, charge = ELEMENTARY_CHARGE): { field: number; force: number; balancingField: number } {
  const field = wireField(current, distance)
  return { field, force: Math.abs(charge) * Math.abs(speed) * field, balancingField: Math.abs(speed) * field }
}

/* ---------- Indução ---------- */

export function faradayEmf(turns: number, radius: number, rate: number): number {
  return Math.abs(turns) * Math.PI * radius * radius * Math.abs(rate)
}

export function motionalEmf(field: number, length: number, speed: number): number {
  return Math.abs(field * length * speed)
}

export function solenoidField(turns: number, length: number, current: number): number {
  if (length <= 0) return Infinity
  return MU0 * turns * current / length
}

export interface GeneratorResult {
  area: number
  fluxAmplitude: number
  emfAmplitude: number
  currentAmplitude: number
  period: number
}

export function generator(field: number, radius: number, turns: number, angularSpeed: number, resistance: number): GeneratorResult {
  const area = Math.PI * radius * radius
  const fluxAmplitude = Math.abs(turns * field) * area
  const emfAmplitude = fluxAmplitude * Math.abs(angularSpeed)
  return {
    area,
    fluxAmplitude,
    emfAmplitude,
    currentAmplitude: resistance > 0 ? emfAmplitude / resistance : Infinity,
    period: angularSpeed !== 0 ? 2 * Math.PI / Math.abs(angularSpeed) : Infinity,
  }
}

export interface TransformerResult {
  ratio: number
  power: number
  primaryCurrent: number
  secondaryCurrent: number
  loadResistance: number
  /** Resistência vista do primário, Vp/Ip = Rs (Np/Ns)². */
  reflectedResistance: number
}

export function transformer(primaryVoltage: number, secondaryVoltage: number, load: { power: number } | { resistance: number }): TransformerResult {
  const vp = Math.abs(primaryVoltage)
  const vs = Math.abs(secondaryVoltage)
  const ratio = vs > 0 ? vp / vs : Infinity
  const secondaryCurrent = 'power' in load ? (vs > 0 ? Math.abs(load.power) / vs : Infinity) : (load.resistance > 0 ? vs / load.resistance : Infinity)
  const power = 'power' in load ? Math.abs(load.power) : vs * secondaryCurrent
  const primaryCurrent = vp > 0 ? power / vp : Infinity
  return {
    ratio,
    power,
    primaryCurrent,
    secondaryCurrent,
    loadResistance: secondaryCurrent > 0 ? vs / secondaryCurrent : Infinity,
    reflectedResistance: primaryCurrent > 0 ? vp / primaryCurrent : Infinity,
  }
}

/** Número de espiras a desenhar em cada enrolamento (limitado a `cap`) para uma razão Np/Ns. */
export function drawnTurns(ratio: number, cap = 16): { primary: number; secondary: number; capped: boolean } {
  if (!Number.isFinite(ratio) || ratio <= 0) return { primary: 2, secondary: 2, capped: false }
  const k = Math.max(ratio, 1 / ratio)
  const small = k <= cap / 2 ? 2 : 1
  const wanted = Math.round(small * k)
  const large = Math.max(small, Math.min(cap, wanted))
  return ratio >= 1 ? { primary: large, secondary: small, capped: wanted > cap } : { primary: small, secondary: large, capped: wanted > cap }
}

/* ---------- Escalas de desenho ---------- */

const niceSteps = [1, 1.5, 2, 3, 5, 7.5, 10]

/** Menor valor "redondo" (1; 1,5; 2; 3; 5; 7,5 × 10ⁿ) maior ou igual a `value`. */
export function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const mantissa = value / power
  const step = niceSteps.find((candidate) => candidate >= mantissa - 1e-9) ?? 10
  return step * power
}

/** Maior valor 1, 2 ou 5 × 10ⁿ menor ou igual a `value` (para barras de escala). */
export function niceFloor(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(value))
  const mantissa = value / power
  return (mantissa >= 5 ? 5 : mantissa >= 2 ? 2 : 1) * power
}
