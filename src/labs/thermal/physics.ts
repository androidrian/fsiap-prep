/**
 * Física dos cenários térmicos. Funções puras, unidades SI salvo indicação em contrário.
 * Os componentes garantem entradas positivas onde a física o exige (espessuras, áreas, massas…).
 */

/** Constante de Stefan–Boltzmann usada nas fichas, W/(m²·K⁴). */
export const SIGMA = 5.6697e-8
/** Constante de Wien, m·K. */
export const WIEN = 2.898e-3
/** Segunda constante de radiação hc/k, m·K. */
export const PLANCK_C2 = 1.4388e-2
/** Joule por caloria. */
export const JOULE_PER_CAL = 4.186
/** Aceleração gravítica, m/s². */
export const GRAVITY = 9.81
/** Zero absoluto em graus Celsius. */
export const ABSOLUTE_ZERO = -273.15

/** Constantes do gelo/água em kcal, kg e K (ficha 5, exercício 6). */
export const WATER = { iceHeat: 0.5, fusion: 79.7, waterHeat: 1 }

/* ---------- Condução ---------- */

export interface Layer {
  /** Espessura, m. */
  thickness: number
  /** Condutividade térmica, W/(m·K). */
  conductivity: number
  name: string
}

/** Lê "L:k:nome;L:k:nome;…" (do lado quente para o frio). Ignora camadas inválidas; no máximo `max`. */
export function parseLayers(text: string, max = 5): Layer[] {
  const layers: Layer[] = []
  for (const chunk of text.split(';')) {
    const [thicknessText, conductivityText, ...nameParts] = chunk.split(':')
    const thickness = Number(thicknessText)
    const conductivity = Number(conductivityText)
    if (!chunk.trim() || !Number.isFinite(thickness) || !Number.isFinite(conductivity) || thickness <= 0 || conductivity <= 0) continue
    const name = nameParts.join(':').trim()
    layers.push({ thickness, conductivity, name: name || `camada ${layers.length + 1}` })
    if (layers.length >= max) break
  }
  return layers
}

export interface SeriesWall {
  /** Resistência de cada camada, K/W. */
  resistances: number[]
  /** Resistência equivalente, K/W. */
  total: number
  /** Fluxo de calor (potência), W. Positivo do lado `hot` para o lado `cold`. */
  flow: number
  /** Fluxo por unidade de área, W/m². */
  flux: number
  /** Temperaturas nas n+1 superfícies (inclui as duas exteriores), °C. */
  temperatures: number[]
  /** Fração da resistência total em cada camada (0–1). */
  shares: number[]
}

/** Parede plana com camadas em série: R_i = L_i/(k_i·A), Q̇ = ΔT/ΣR. */
export function seriesWall(layers: ReadonlyArray<Pick<Layer, 'thickness' | 'conductivity'>>, area: number, hot: number, cold: number): SeriesWall {
  const resistances = layers.map((layer) => layer.thickness / (layer.conductivity * area))
  const total = resistances.reduce((sum, resistance) => sum + resistance, 0)
  const flow = total > 0 ? (hot - cold) / total : 0
  const temperatures = [hot]
  for (const resistance of resistances) temperatures.push(temperatures[temperatures.length - 1] - flow * resistance)
  if (temperatures.length > 1) temperatures[temperatures.length - 1] = cold
  return { resistances, total, flow, flux: area > 0 ? flow / area : 0, temperatures, shares: resistances.map((resistance) => (total > 0 ? resistance / total : 0)) }
}

export interface MixedWallInput {
  /** Área total da parede, m². */
  area: number
  hot: number
  cold: number
  la: number
  ka: number
  /** Espessura comum das camadas b e c, m. */
  lbc: number
  kb: number
  kc: number
  ld: number
  kd: number
}

export interface MixedWall {
  ra: number
  rb: number
  rc: number
  /** R_b ∥ R_c. */
  rbc: number
  rd: number
  total: number
  flow: number
  flowB: number
  flowC: number
  /** Fração do fluxo que passa por b (0–1). */
  shareB: number
  /** Temperatura na interface a | (b, c), °C. */
  t1: number
  /** Temperatura na interface (b, c) | d, °C. */
  t2: number
}

/** Parede a | (b ∥ c) | d, com b e c a ocuparem metade da área cada. */
export function mixedWall({ area, hot, cold, la, ka, lbc, kb, kc, ld, kd }: MixedWallInput): MixedWall {
  const ra = la / (ka * area)
  const rb = lbc / (kb * area / 2)
  const rc = lbc / (kc * area / 2)
  const rbc = (rb * rc) / (rb + rc)
  const rd = ld / (kd * area)
  const total = ra + rbc + rd
  const flow = (hot - cold) / total
  const t1 = hot - flow * ra
  const t2 = cold + flow * rd
  const shareB = rc / (rb + rc)
  return { ra, rb, rc, rbc, rd, total, flow, flowB: (t1 - t2) / rb, flowC: (t1 - t2) / rc, shareB, t1, t2 }
}

/* ---------- Radiação ---------- */

export function celsiusToKelvin(celsius: number): number {
  return celsius - ABSOLUTE_ZERO
}

export function kelvinToCelsius(kelvin: number): number {
  return kelvin + ABSOLUTE_ZERO
}

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * 9 / 5 + 32
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5 / 9
}

/** Potência radiada por uma superfície, W (lei de Stefan–Boltzmann). `kelvin` em K. */
export function radiatedPower(kelvin: number, area: number, emissivity: number): number {
  return emissivity * SIGMA * area * kelvin ** 4
}

/** Comprimento de onda do máximo de emissão, m (lei de Wien). */
export function wienPeak(kelvin: number): number {
  return WIEN / kelvin
}

/** Temperatura (K) necessária para emitir `power` watts. */
export function temperatureForPower(power: number, area: number, emissivity: number): number {
  const denominator = emissivity * SIGMA * area
  return power >= 0 && denominator > 0 ? (power / denominator) ** 0.25 : Number.NaN
}

export interface RadiationBalance {
  kelvin: number
  surroundingsKelvin: number
  emitted: number
  absorbed: number
  /** Perda líquida = emitida − absorvida, W. */
  net: number
  /** λ_max do corpo, m. */
  peak: number
  /** λ_max da vizinhança, m. */
  surroundingsPeak: number
}

export function radiationBalance(celsius: number, surroundingsCelsius: number, area: number, emissivity: number): RadiationBalance {
  const kelvin = celsiusToKelvin(celsius)
  const surroundingsKelvin = celsiusToKelvin(surroundingsCelsius)
  const emitted = radiatedPower(kelvin, area, emissivity)
  const absorbed = radiatedPower(surroundingsKelvin, area, emissivity)
  return { kelvin, surroundingsKelvin, emitted, absorbed, net: emitted - absorbed, peak: wienPeak(kelvin), surroundingsPeak: wienPeak(surroundingsKelvin) }
}

function planckShape(product: number): number {
  // product = λ·T (m·K). Forma de Planck sem constantes: (λT)⁻⁵ / (e^{c₂/(λT)} − 1).
  if (!(product > 0)) return 0
  const value = product ** -5 / Math.expm1(PLANCK_C2 / product)
  return Number.isFinite(value) ? value : 0
}

/**
 * Radiância espetral de um corpo negro a `kelvin`, no comprimento de onda `wavelength` (m),
 * relativa ao máximo da curva de um corpo negro à temperatura `referenceKelvin`.
 */
export function planckRelative(wavelength: number, kelvin: number, referenceKelvin: number): number {
  if (!(kelvin > 0) || !(referenceKelvin > 0)) return 0
  const peak = planckShape(PLANCK_C2 / 4.965114)
  return (kelvin / referenceKelvin) ** 5 * planckShape(wavelength * kelvin) / peak
}

/* ---------- Convecção ---------- */

export interface Convection {
  /** Potência trocada, W (positiva quando a superfície perde calor). */
  flow: number
  /** Fluxo por unidade de área, W/m². */
  flux: number
  /** Resistência convectiva 1/(hA), K/W. */
  resistance: number
  /** Energia trocada numa hora, J. */
  energyHour: number
  /** Potência em kcal/s. */
  flowKcal: number
}

export function convection(h: number, area: number, surface: number, fluid: number): Convection {
  const flow = h * area * (surface - fluid)
  return { flow, flux: h * (surface - fluid), resistance: 1 / (h * area), energyHour: flow * 3600, flowKcal: flow / (JOULE_PER_CAL * 1000) }
}

/* ---------- Calorimetria ---------- */

export interface HeatingStages {
  /** Aquecer o gelo até 0 °C (ou até Tf, se Tf < 0), kcal. */
  ice: number
  /** Fundir o gelo, kcal. */
  fusion: number
  /** Aquecer a água de 0 °C a Tf, kcal. */
  water: number
  total: number
  /** Temperaturas efetivamente usadas (T0 ≤ 0; Tf ≥ T0), °C. */
  start: number
  end: number
}

/** Energia (kcal) para levar `mass` kg de gelo de `start` °C (≤ 0) até `end` °C. */
export function heatingStages(mass: number, start: number, end: number): HeatingStages {
  const t0 = Math.min(start, 0)
  const tf = Math.max(end, t0)
  const melts = tf >= 0
  const ice = mass * WATER.iceHeat * ((melts ? 0 : tf) - t0)
  const fusion = melts ? mass * WATER.fusion : 0
  const water = melts ? mass * WATER.waterHeat * tf : 0
  return { ice, fusion, water, total: ice + fusion + water, start: t0, end: tf }
}

export interface HeatingState {
  phase: 'ice' | 'melting' | 'water'
  temperature: number
  /** Fração de gelo já fundida (0–1). */
  melted: number
}

/** Estado do sistema depois de receber `energy` kcal (limitado ao total do percurso). */
export function heatingState(mass: number, start: number, end: number, energy: number): HeatingState {
  const stages = heatingStages(mass, start, end)
  const supplied = Math.min(Math.max(energy, 0), stages.total)
  if (supplied < stages.ice || stages.fusion === 0) {
    const rise = mass > 0 ? supplied / (mass * WATER.iceHeat) : 0
    return { phase: 'ice', temperature: Math.min(stages.start + rise, stages.fusion === 0 ? stages.end : 0), melted: 0 }
  }
  if (supplied < stages.ice + stages.fusion || stages.water === 0) {
    return { phase: 'melting', temperature: 0, melted: Math.min((supplied - stages.ice) / stages.fusion, 1) }
  }
  const rise = (supplied - stages.ice - stages.fusion) / (mass * WATER.waterHeat)
  return { phase: 'water', temperature: Math.min(rise, stages.end), melted: 1 }
}

export interface Mixing {
  /** Temperatura final de equilíbrio, °C. */
  final: number
  /** Calor recebido pelo corpo 1, J (negativo se cede). */
  heat1: number
  /** Calor recebido pelo corpo 2, J. */
  heat2: number
}

/** Dois corpos isolados do exterior: m₁c₁(Tf − T₁) + m₂c₂(Tf − T₂) = 0. */
export function mixing(m1: number, c1: number, t1: number, m2: number, c2: number, t2: number): Mixing {
  const capacity1 = m1 * c1
  const capacity2 = m2 * c2
  const final = (capacity1 * t1 + capacity2 * t2) / (capacity1 + capacity2)
  return { final, heat1: capacity1 * (final - t1), heat2: capacity2 * (final - t2) }
}

/** Calor específico do corpo 1 a partir da temperatura final medida, J/(kg·K). */
export function unknownSpecificHeat(m1: number, t1: number, m2: number, c2: number, t2: number, final: number): number {
  const denominator = m1 * (t1 - final)
  return denominator !== 0 ? (m2 * c2 * (final - t2)) / denominator : Number.NaN
}

/* ---------- Dilatação ---------- */

export interface Expansion {
  /** Variação de comprimento, m. */
  deltaLength: number
  /** ΔL/L. */
  strain: number
  /** ΔV/V ≈ 3αΔT. */
  volumeStrain: number
  /** Δρ/ρ ≈ −3αΔT. */
  densityChange: number
}

/** Dilatação linear. `alpha` em K⁻¹. */
export function expansion(length: number, alpha: number, deltaTemperature: number): Expansion {
  const strain = alpha * deltaTemperature
  return { deltaLength: length * strain, strain, volumeStrain: 3 * strain, densityChange: -3 * strain }
}

/* ---------- Experiência de Joule ---------- */

export interface JouleExperiment {
  /** Trabalho mecânico total, J. */
  work: number
  /** Calor recebido pela água, cal. */
  heat: number
  /** Equivalente mecânico obtido, J/cal. */
  ratio: number
}

/** `waterGrams` em g; calor específico da água 1 cal/(g·°C). */
export function jouleExperiment(mass: number, height: number, drops: number, waterGrams: number, deltaTemperature: number): JouleExperiment {
  const work = drops * mass * GRAVITY * height
  const heat = waterGrams * deltaTemperature
  return { work, heat, ratio: heat > 0 ? work / heat : Number.NaN }
}
