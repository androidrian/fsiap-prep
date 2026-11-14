/**
 * Física dos cenários de ondas eletromagnéticas e ótica (Folha 4).
 * Funções puras, unidades SI, ângulos em graus. Constantes com os valores usados nas fichas.
 */

export const LIGHT_SPEED = 3e8
export const MU_0 = 4 * Math.PI * 1e-7
export const LIGHT_YEAR = 9.461e15

const toRad = (degrees: number) => degrees * Math.PI / 180
const toDeg = (radians: number) => radians * 180 / Math.PI

/* ---------- Ondas eletromagnéticas ---------- */

/** Amplitudes dos campos de uma onda plana com intensidade média I: E = √(2μ₀cI), B = E/c. */
export function fieldAmplitudes(intensity: number) {
  const electric = Math.sqrt(2 * MU_0 * LIGHT_SPEED * Math.max(0, intensity))
  return { electric, magnetic: electric / LIGHT_SPEED, electricRms: electric / Math.SQRT2 }
}

/** Intensidade média de uma onda plana com amplitude E₀: I = E₀²/(2μ₀c). */
export function intensityFromField(electricAmplitude: number) {
  return electricAmplitude ** 2 / (2 * MU_0 * LIGHT_SPEED)
}

/**
 * Fonte pontual que espalha a potência por uma esfera (fraction = 1) ou por uma semiesfera
 * (fraction = 0.5, emissor junto ao solo).
 */
export function isotropicSource(power: number, distance: number, fraction = 1) {
  const area = 4 * Math.PI * distance ** 2 * fraction
  const intensity = area > 0 ? Math.max(0, power) / area : 0
  return { area, intensity, intensityAtDouble: intensity / 4, ...fieldAmplitudes(intensity) }
}

/** Grandezas de uma onda plana no vazio com frequência f e amplitude E₀. */
export function planeWave(frequency: number, electricAmplitude: number) {
  const wavelength = LIGHT_SPEED / frequency
  return {
    wavelength,
    period: 1 / frequency,
    omega: 2 * Math.PI * frequency,
    waveNumber: 2 * Math.PI / wavelength,
    magneticAmplitude: electricAmplitude / LIGHT_SPEED,
    intensity: intensityFromField(electricAmplitude),
  }
}

export interface SpectrumBand {
  id: 'radio' | 'microwave' | 'infrared' | 'visible' | 'ultraviolet' | 'xray' | 'gamma'
  label: string
  /** Frequência mínima (Hz). */
  min: number
  /** Frequência máxima (Hz). */
  max: number
}

export const VISIBLE_MAX_WAVELENGTH = 750e-9
export const VISIBLE_MIN_WAVELENGTH = 380e-9

export const SPECTRUM_BANDS: SpectrumBand[] = [
  { id: 'radio', label: 'rádio', min: 0, max: 3e8 },
  { id: 'microwave', label: 'micro-ondas', min: 3e8, max: 3e11 },
  { id: 'infrared', label: 'infravermelho', min: 3e11, max: LIGHT_SPEED / VISIBLE_MAX_WAVELENGTH },
  { id: 'visible', label: 'visível', min: LIGHT_SPEED / VISIBLE_MAX_WAVELENGTH, max: LIGHT_SPEED / VISIBLE_MIN_WAVELENGTH },
  { id: 'ultraviolet', label: 'ultravioleta', min: LIGHT_SPEED / VISIBLE_MIN_WAVELENGTH, max: 3e16 },
  { id: 'xray', label: 'raios X', min: 3e16, max: 3e19 },
  { id: 'gamma', label: 'raios gama', min: 3e19, max: Number.MAX_VALUE },
]

export function spectrumBand(frequency: number): SpectrumBand {
  return SPECTRUM_BANDS.find((band) => frequency >= band.min && frequency < band.max) ?? SPECTRUM_BANDS[SPECTRUM_BANDS.length - 1]
}

/** Serviço de radiodifusão a que a frequência pertence (bandas da ficha 4, exercício 3). */
export function radioService(frequency: number): 'AM' | 'FM' | null {
  if (frequency >= 520e3 && frequency <= 1610e3) return 'AM'
  if (frequency >= 88e6 && frequency <= 108e6) return 'FM'
  return null
}

export interface VisibleColour {
  id: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet'
  label: string
  /** Comprimento de onda mínimo (m). */
  min: number
  /** Comprimento de onda máximo (m). */
  max: number
}

export const VISIBLE_COLOURS: VisibleColour[] = [
  { id: 'red', label: 'vermelho', min: 620e-9, max: 750e-9 },
  { id: 'orange', label: 'laranja', min: 590e-9, max: 620e-9 },
  { id: 'yellow', label: 'amarelo', min: 570e-9, max: 590e-9 },
  { id: 'green', label: 'verde', min: 495e-9, max: 570e-9 },
  { id: 'blue', label: 'azul', min: 450e-9, max: 495e-9 },
  { id: 'violet', label: 'violeta', min: 380e-9, max: 450e-9 },
]

/** Cor percebida para um comprimento de onda no vazio, ou null fora do visível. */
export function visibleColour(wavelength: number): VisibleColour | null {
  if (wavelength > VISIBLE_MAX_WAVELENGTH || wavelength < VISIBLE_MIN_WAVELENGTH) return null
  return VISIBLE_COLOURS.find((colour) => wavelength >= colour.min && wavelength <= colour.max) ?? null
}

/** Comprimento de onda no vazio e comprimentos das antenas de meia onda e de quarto de onda. */
export function antennaLengths(frequency: number) {
  const wavelength = LIGHT_SPEED / frequency
  return { wavelength, half: wavelength / 2, quarter: wavelength / 4 }
}

/* ---------- Refração ---------- */

/** Ângulo refratado (à normal) pela lei de Snell; null quando há reflexão total. */
export function snellAngle(angle: number, n1: number, n2: number): number | null {
  const sine = n1 / n2 * Math.sin(toRad(angle))
  return sine > 1 ? null : toDeg(Math.asin(sine))
}

/** Ângulo crítico para luz que vai de nFrom para nTo; null se nFrom ≤ nTo (não há reflexão total). */
export function criticalAngle(nFrom: number, nTo: number): number | null {
  return nFrom > nTo ? toDeg(Math.asin(nTo / nFrom)) : null
}

/** Ângulo de Brewster: tan θ_B = n₂/n₁. */
export function brewsterAngle(n1: number, n2: number) {
  return toDeg(Math.atan2(n2, n1))
}

/**
 * Refletâncias de Fresnel para as componentes perpendicular (s, ⟂ ao plano de incidência)
 * e paralela (p, ∥ ao plano de incidência). Em reflexão total valem ambas 1.
 */
export function fresnelReflectance(angle: number, n1: number, n2: number) {
  const cosIncident = Math.cos(toRad(angle))
  const sinRefracted = n1 / n2 * Math.sin(toRad(angle))
  if (sinRefracted >= 1) return { perpendicular: 1, parallel: 1 }
  const cosRefracted = Math.sqrt(1 - sinRefracted ** 2)
  const denominatorS = n1 * cosIncident + n2 * cosRefracted
  const denominatorP = n2 * cosIncident + n1 * cosRefracted
  const s = denominatorS > 0 ? (n1 * cosIncident - n2 * cosRefracted) / denominatorS : 1
  const p = denominatorP > 0 ? (n2 * cosIncident - n1 * cosRefracted) / denominatorP : 1
  return { perpendicular: s ** 2, parallel: p ** 2 }
}

/** Geometria da reflexão/refração numa interface, com a condição de Brewster. */
export function brewsterGeometry(angle: number, n1: number, n2: number) {
  const brewster = brewsterAngle(n1, n2)
  const refracted = snellAngle(angle, n1, n2)
  const sum = refracted === null ? null : angle + refracted
  return {
    brewster,
    refracted,
    /** θ₁ + θ₂ (vale 90° no ângulo de Brewster). */
    sum,
    /** Ângulo entre o raio refletido e o refratado: 180° − θ₁ − θ₂. */
    between: sum === null ? null : 180 - sum,
    reflectance: fresnelReflectance(angle, n1, n2),
  }
}

/** Comprimento de onda e velocidade num meio de índice n, para um comprimento de onda no vazio. */
export function lightInMedium(vacuumWavelength: number, index: number) {
  return { wavelength: vacuumWavelength / index, speed: LIGHT_SPEED / index, frequency: LIGHT_SPEED / vacuumWavelength }
}

/* ---------- Fibra ótica ---------- */

/**
 * Fibra de índice em degrau no ar. `coreRadius` e `length` em metros, `entranceAngle` (φ) em graus,
 * medido no ar em relação ao eixo da fibra; o raio entra pelo centro da face.
 */
export function fiber(coreIndex: number, claddingIndex: number, coreRadius: number, length: number, entranceAngle: number) {
  const guiding = coreIndex > claddingIndex
  const numericalAperture = guiding ? Math.sqrt(coreIndex ** 2 - claddingIndex ** 2) : 0
  const sinEntrance = Math.sin(toRad(entranceAngle))
  const axisAngle = toDeg(Math.asin(Math.min(1, sinEntrance / coreIndex)))
  const wallAngle = 90 - axisAngle
  const guided = guiding && sinEntrance <= numericalAperture + 1e-9
  const tanAxis = Math.tan(toRad(axisAngle))
  const sinLeak = coreIndex * Math.sin(toRad(wallAngle)) / claddingIndex
  return {
    /** Ângulo crítico na interface núcleo/bainha (à normal da parede); null se a bainha não for menos refringente. */
    criticalAngle: criticalAngle(coreIndex, claddingIndex),
    numericalAperture,
    /** Semi-ângulo máximo do cone de aceitação no ar. */
    acceptanceAngle: toDeg(Math.asin(Math.min(1, numericalAperture))),
    /** Ângulo do raio com o eixo, dentro do núcleo. */
    axisAngle,
    /** Ângulo de incidência na parede núcleo/bainha, medido à normal. */
    wallAngle,
    guided,
    /** Distância axial entre reflexões sucessivas: 2a·tanθ (infinita para um raio axial). */
    bounceSpacing: tanAxis > 1e-12 ? 2 * coreRadius / tanAxis : Number.POSITIVE_INFINITY,
    /** Número de reflexões ao longo do comprimento L. */
    reflections: coreRadius > 0 ? length * tanAxis / (2 * coreRadius) : 0,
    /** Ângulo (à normal) do raio que passa para a bainha quando não há reflexão total. */
    leakAngle: guided || sinLeak > 1 ? null : toDeg(Math.asin(sinLeak)),
  }
}

/** Problema inverso: índice da bainha que dá o semi-ângulo de aceitação pedido. */
export function claddingIndexForAcceptance(coreIndex: number, acceptanceAngle: number) {
  return Math.sqrt(Math.max(0, coreIndex ** 2 - Math.sin(toRad(acceptanceAngle)) ** 2))
}

/* ---------- Bloco com parede lateral ---------- */

/**
 * Raio que entra do ar pelo topo de um bloco (índice n) com ângulo θ₁ à normal e atinge a parede
 * lateral vertical, a uma distância horizontal `distance` (m), para lá da qual o meio tem índice nOut.
 */
export function blockRay(theta1: number, index: number, outsideIndex: number, distance: number) {
  const sinTheta1 = Math.sin(toRad(theta1))
  const sinRefracted = Math.min(1, sinTheta1 / index)
  const refracted = toDeg(Math.asin(sinRefracted))
  const wallIncidence = 90 - refracted
  const sinTransmitted = index * Math.cos(toRad(refracted)) / outsideIndex
  const totalReflection = sinTransmitted >= 1 - 1e-12
  const pathLength = sinRefracted > 1e-9 ? distance / sinRefracted : Number.POSITIVE_INFINITY
  return {
    /** Ângulo de refração no topo (à normal). */
    refracted,
    /** Ângulo de incidência na parede lateral: 90° − θr. */
    wallIncidence,
    /** Ângulo crítico da parede; null se o exterior for mais refringente. */
    criticalAngle: criticalAngle(index, outsideIndex),
    totalReflection,
    /** Ângulo transmitido para o meio exterior (à normal da parede); null em reflexão total. */
    transmitted: totalReflection ? null : toDeg(Math.asin(sinTransmitted)),
    /** Índice mínimo do bloco para reflexão total na parede com este θ₁. */
    minIndex: Math.sqrt(outsideIndex ** 2 + sinTheta1 ** 2),
    /** Percurso dentro do bloco, do ponto de entrada à parede: L/sin θr. */
    pathLength,
    /** Profundidade a que o raio atinge a parede: L/tan θr. */
    depth: sinRefracted > 1e-9 ? distance / Math.tan(toRad(refracted)) : Number.POSITIVE_INFINITY,
    /** Tempo de viagem do ponto de entrada à parede: n·percurso/c. */
    travelTime: index * pathLength / LIGHT_SPEED,
  }
}
