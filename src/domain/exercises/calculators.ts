export function coulombForce(q1: number, q2: number, distance: number): number {
  if (distance <= 0) throw new RangeError('distance must be positive')
  return 8.99e9 * Math.abs(q1 * q2) / distance ** 2
}

export function fourChargeCircle(charges: [number, number, number, number], diameter: number): {
  centerPotential: number
  forceOnFirst: { x: number; y: number; magnitude: number }
  externalWorkToCenter: number
} {
  if (diameter <= 0 || charges.some((charge) => !Number.isFinite(charge))) throw new RangeError('charges must be finite and diameter positive')
  const k = 8.99e9
  const radius = diameter / 2
  const offset = radius / Math.sqrt(2)
  const positions = [[-offset, offset], [offset, offset], [-offset, -offset], [offset, -offset]] as const
  const centerPotential = k * charges.reduce((sum, charge) => sum + charge, 0) / radius
  const [x1, y1] = positions[0]
  let forceX = 0
  let forceY = 0
  let potentialAtFirstFromOthers = 0
  let potentialAtCenterFromOthers = 0
  for (let index = 1; index < positions.length; index += 1) {
    const [xj, yj] = positions[index]
    const dx = x1 - xj
    const dy = y1 - yj
    const distance = Math.hypot(dx, dy)
    const factor = k * charges[0] * charges[index] / distance ** 3
    forceX += factor * dx
    forceY += factor * dy
    potentialAtFirstFromOthers += k * charges[index] / distance
    potentialAtCenterFromOthers += k * charges[index] / radius
  }
  return {
    centerPotential,
    forceOnFirst: { x: forceX, y: forceY, magnitude: Math.hypot(forceX, forceY) },
    externalWorkToCenter: charges[0] * (potentialAtCenterFromOthers - potentialAtFirstFromOthers),
  }
}

export function rcChargeVoltage(finalVoltage: number, time: number, tau: number): number {
  if (tau <= 0 || time < 0) throw new RangeError('tau must be positive and time cannot be negative')
  return finalVoltage * (1 - Math.exp(-time / tau))
}

export function rcDischargeVoltage(initialVoltage: number, time: number, tau: number): number {
  if (tau <= 0 || time < 0) throw new RangeError('tau must be positive and time cannot be negative')
  return initialVoltage * Math.exp(-time / tau)
}

export function seriesCapacitorDischarge(capacitance1: number, capacitance2: number, initialVoltage: number, parallelResistance1: number, parallelResistance2: number, seriesResistance: number, time: number): {
  equivalentCapacitance: number
  parallelResistance: number
  equivalentResistance: number
  initialCharge: number
  timeConstant: number
  maxCurrentInSecondBranch: number
  chargeAtTime: number
} {
  if ([capacitance1, capacitance2, parallelResistance1, parallelResistance2, seriesResistance].some((value) => value <= 0) || initialVoltage < 0 || time < 0) throw new RangeError('circuit values must be positive and time non-negative')
  const equivalentCapacitance = capacitance1 * capacitance2 / (capacitance1 + capacitance2)
  const parallelResistance = parallelResistance1 * parallelResistance2 / (parallelResistance1 + parallelResistance2)
  const equivalentResistance = seriesResistance + parallelResistance
  const initialCharge = equivalentCapacitance * initialVoltage
  const timeConstant = equivalentResistance * equivalentCapacitance
  const parallelVoltageAtStart = initialVoltage * parallelResistance / equivalentResistance
  return {
    equivalentCapacitance,
    parallelResistance,
    equivalentResistance,
    initialCharge,
    timeConstant,
    maxCurrentInSecondBranch: parallelVoltageAtStart / parallelResistance2,
    chargeAtTime: initialCharge * Math.exp(-time / timeConstant),
  }
}

export function thermalConduction(k: number, area: number, deltaTemperature: number, thickness: number): number {
  if (k <= 0 || area <= 0 || thickness <= 0) throw new RangeError('material and geometry values must be positive')
  return k * area * deltaTemperature / thickness
}

export function compositeThermalConduction(area: number, deltaTemperature: number, layers: Array<{ thickness: number; conductivity: number }>): number {
  if (area <= 0 || layers.length === 0 || layers.some((layer) => layer.thickness <= 0 || layer.conductivity <= 0)) throw new RangeError('layers and area must be positive')
  const resistance = layers.reduce((sum, layer) => sum + layer.thickness / (layer.conductivity * area), 0)
  return deltaTemperature / resistance
}

export function magneticOrbitRadius(mass: number, speed: number, chargeMagnitude: number, magneticField: number): number {
  if (mass <= 0 || speed < 0 || chargeMagnitude <= 0 || magneticField <= 0) throw new RangeError('particle values must be positive')
  return mass * speed / (chargeMagnitude * magneticField)
}

export function solenoidParticleDynamics(turns: number, length: number, current: number, chargeMagnitude: number, speed: number, mass: number, forceAngleDegrees: number, gravity = 9.81): {
  magneticField: number
  magneticForce: number
  weight: number
  resultant: { x: number; y: number; magnitude: number }
  acceleration: number
  instantaneousRadius: number
} {
  if ([turns, length, current, chargeMagnitude, speed, mass].some((value) => value <= 0) || !Number.isFinite(forceAngleDegrees) || gravity < 0) throw new RangeError('solenoid and particle values must be positive')
  const magneticField = 4 * Math.PI * 1e-7 * turns * current / length
  const magneticForce = chargeMagnitude * speed * magneticField
  const weight = mass * gravity
  const angle = forceAngleDegrees * Math.PI / 180
  const x = -magneticForce * Math.cos(angle)
  const y = magneticForce * Math.sin(angle) - weight
  const magnitude = Math.hypot(x, y)
  const normalForce = Math.abs(magneticForce - weight * Math.sin(angle))
  return {
    magneticField,
    magneticForce,
    weight,
    resultant: { x, y, magnitude },
    acceleration: magnitude / mass,
    instantaneousRadius: mass * speed ** 2 / normalForce,
  }
}

export function symmetricElectricField(charge: number, halfSeparation: number, height: number): { horizontal: number; vertical: number } {
  if (halfSeparation <= 0 || height < 0) throw new RangeError('geometry must be positive')
  const distance = Math.hypot(halfSeparation, height)
  const oneField = 8.99e9 * Math.abs(charge) / distance ** 2
  return { horizontal: 0, vertical: 2 * oneField * height / distance * Math.sign(charge) }
}

export function uniformElectricForce(charge: number, electricField: number): number {
  if (!Number.isFinite(charge) || !Number.isFinite(electricField)) throw new RangeError('charge and field must be finite')
  return charge * electricField
}

export function uniformFieldEnergyChange(charge: number, electricField: number, deltaX: number, deltaY = 0, mass = 0, gravity = 9.8): { electricWork: number; gravityWork: number; totalPotentialChange: number } {
  if (![charge, electricField, deltaX, deltaY, mass, gravity].every(Number.isFinite) || mass < 0 || gravity < 0) throw new RangeError('field, displacement and mass values must be finite and non-negative where applicable')
  const electricWork = charge * electricField * deltaX
  const gravityWork = -mass * gravity * deltaY
  return { electricWork, gravityWork, totalPotentialChange: -(electricWork + gravityWork) }
}

export function twoMeshCurrents(source1: number, source2: number, resistance1: number, resistance2: number, sharedResistance: number): { mesh1: number; mesh2: number; shared: number } {
  if ([resistance1, resistance2, sharedResistance].some((value) => value <= 0)) throw new RangeError('resistances must be positive')
  const determinant = (resistance1 + sharedResistance) * (resistance2 + sharedResistance) - sharedResistance ** 2
  const mesh1 = (source1 * (resistance2 + sharedResistance) + sharedResistance * source2) / determinant
  const mesh2 = (source2 * (resistance1 + sharedResistance) + sharedResistance * source1) / determinant
  return { mesh1, mesh2, shared: mesh1 - mesh2 }
}

export function refractionAngle(angleDegrees: number, index1: number, index2: number): number | null {
  if (index1 <= 0 || index2 <= 0) throw new RangeError('indices must be positive')
  const sine = index1 / index2 * Math.sin(angleDegrees * Math.PI / 180)
  return Math.abs(sine) > 1 ? null : Math.asin(sine) * 180 / Math.PI
}

export function malusIntensity(incidentIntensity: number, angleDifferenceDegrees: number): number {
  if (incidentIntensity < 0) throw new RangeError('intensity cannot be negative')
  const angle = angleDifferenceDegrees * Math.PI / 180
  return incidentIntensity * Math.cos(angle) ** 2
}

export function unpolarizedThroughPolarizers(incidentIntensity: number, axesDegrees: number[]): number[] {
  if (incidentIntensity < 0) throw new RangeError('intensity cannot be negative')
  if (axesDegrees.length === 0) return [incidentIntensity]
  const intensities = [incidentIntensity, incidentIntensity / 2]
  for (let index = 1; index < axesDegrees.length; index += 1) {
    intensities.push(malusIntensity(intensities.at(-1)!, axesDegrees[index] - axesDegrees[index - 1]))
  }
  return intensities
}

export function withinTolerance(answer: number, expected: number, relativeTolerance = 0.02): boolean {
  if (!Number.isFinite(answer) || !Number.isFinite(expected)) return false
  const scale = Math.max(Math.abs(expected), 1e-12)
  return Math.abs(answer - expected) / scale <= relativeTolerance
}
