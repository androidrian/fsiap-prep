import { describe, expect, it } from 'vitest'
import { families } from '../data/analysis'
import { calculateCoverage } from '../domain/analytics/coverage'
import { compositeThermalConduction, coulombForce, fourChargeCircle, magneticOrbitRadius, malusIntensity, rcChargeVoltage, rcDischargeVoltage, refractionAngle, seriesCapacitorDischarge, solenoidParticleDynamics, symmetricElectricField, thermalConduction, twoMeshCurrents, uniformElectricForce, uniformFieldEnergyChange, unpolarizedThroughPolarizers, withinTolerance } from '../domain/exercises/calculators'
import { exerciseTemplateCount, generateExercise, generateMixedSet } from '../domain/exercises/generator'
import { currentConfidence, learningState, updateMastery } from '../domain/mastery/mastery'
import { DEFAULT_EXAM_DATE, daysUntilExam } from '../domain/study/examDate'
import { recommendNext, studyPriority } from '../domain/study/studyEngine'
import type { FamilyId, FamilyProgress, ProgressState } from '../domain/types'
import { initialState } from '../storage/ProgressContext'

const progress = (overrides: Partial<FamilyProgress> = {}): FamilyProgress => ({ mastery: 0, updatedAt: null, independentSuccesses: 0, hintedSuccesses: 0, failures: 0, nextReviewAt: null, ...overrides })

function stateWith(scores: Partial<Record<FamilyId, number>>): ProgressState {
  const at = new Date('2026-08-29T10:00:00Z').toISOString()
  return {
    ...initialState,
    diagnosed: true,
    mastery: Object.fromEntries(families.map((family) => [family.id, progress({ mastery: scores[family.id] ?? 0, updatedAt: at, independentSuccesses: (scores[family.id] ?? 0) >= 0.82 ? 3 : 0 })])) as ProgressState['mastery'],
  }
}

describe('exercise calculators', () => {
  it('obeys inverse square scaling for Coulomb force', () => {
    expect(coulombForce(2e-6, -3e-6, 4)).toBeCloseTo(coulombForce(2e-6, -3e-6, 2) / 4, 10)
  })
  it('reaches 63.2% after one RC time constant', () => {
    expect(rcChargeVoltage(10, 2, 2)).toBeCloseTo(6.3212, 3)
  })
  it('halves thermal conduction when thickness doubles', () => {
    expect(thermalConduction(0.8, 2, 25, 0.16)).toBeCloseTo(thermalConduction(0.8, 2, 25, 0.08) / 2)
  })
  it('rejects invalid geometry and unsafe answers', () => {
    expect(() => coulombForce(1, 1, 0)).toThrow(RangeError)
    expect(withinTolerance(Number.NaN, 4)).toBe(false)
    expect(withinTolerance(9.9, 10, 0.02)).toBe(true)
  })
  it('applies Malus successively to three polarizers', () => {
    expect(malusIntensity(100, 90)).toBeCloseTo(0, 10)
    const threeFilters = unpolarizedThroughPolarizers(80, [0, 45, 90])
    expect(threeFilters).toHaveLength(4)
    expect(threeFilters[1]).toBeCloseTo(40, 10)
    expect(threeFilters[2]).toBeCloseTo(20, 10)
    expect(threeFilters[3]).toBeCloseTo(10, 10)
    expect(unpolarizedThroughPolarizers(80, [0, 90]).at(-1)).toBeCloseTo(0, 10)
  })
  it('keeps every advanced simulator relation physically consistent', () => {
    expect(compositeThermalConduction(2, 25, [{ thickness: .08, conductivity: .8 }, { thickness: .12, conductivity: .2 }])).toBeLessThan(thermalConduction(.8, 2, 25, .08))
    expect(rcDischargeVoltage(10, 1, 1)).toBeCloseTo(3.6788, 3)
    expect(magneticOrbitRadius(4e-25, 45_000, 1.602e-19, 8e-3)).toBeCloseTo(magneticOrbitRadius(4e-25, 45_000, 1.602e-19, 4e-3) / 2)
    expect(symmetricElectricField(3e-6, 1.5, 2).horizontal).toBe(0)
    expect(twoMeshCurrents(12, 6, 6, 12, 4).shared).toBeGreaterThan(0)
    expect(refractionAngle(60, 1.5, 1)).toBeNull()
    expect(refractionAngle(30, 1, 1.5)).toBeCloseTo(19.47, 1)
  })
  it('separates electric and gravitational work in the 2016/17 path', () => {
    expect(uniformElectricForce(3e-15, 2e3)).toBeCloseTo(6e-12, 20)
    const energy = uniformFieldEnergyChange(3e-15, 2e3, -.04, -.03, 200e-15)
    expect(energy.electricWork).toBeCloseTo(-2.4e-13, 20)
    expect(energy.gravityWork).toBeCloseTo(5.88e-14, 20)
    expect(energy.totalPotentialChange).toBeCloseTo(1.812e-13, 20)
  })
  it('reproduces the four-charge circle exercise component by component', () => {
    const result = fourChargeCircle([6e-6, 5e-6, 5e-6, -6e-6], 6)
    expect(result.centerPotential).toBeCloseTo(2.9967e4, 0)
    expect(result.forceOnFirst.x).toBeCloseTo(-8.626e-3, 5)
    expect(result.forceOnFirst.y).toBeCloseTo(8.626e-3, 5)
    expect(result.forceOnFirst.magnitude).toBeCloseTo(1.22e-2, 4)
    expect(result.externalWorkToCenter).toBeCloseTo(-1.278e-3, 5)
  })
  it('reproduces the series-capacitor discharge network at 18 microseconds', () => {
    const result = seriesCapacitorDischarge(20e-6, 90e-6, 20, 10, 15, 5, 18e-6)
    expect(result.equivalentCapacitance).toBeCloseTo(16.364e-6, 9)
    expect(result.initialCharge).toBeCloseTo(327.273e-6, 8)
    expect(result.equivalentResistance).toBe(11)
    expect(result.timeConstant).toBeCloseTo(180e-6, 9)
    expect(result.maxCurrentInSecondBranch).toBeCloseTo(.72727, 5)
    expect(result.chargeAtTime).toBeCloseTo(296.129e-6, 8)
  })
  it('combines magnetic force and gravity for the particle inside the solenoid', () => {
    const result = solenoidParticleDynamics(840, .6, 22, 2.5 * 1.60217653e-19, 6450, 2 * 1.673e-27, 25)
    expect(result.magneticField).toBeCloseTo(.0387044, 6)
    expect(result.resultant.magnitude).toBeCloseTo(9.9993e-17, 20)
    expect(result.acceleration / 1e10).toBeCloseTo(2.98844132, 7)
    expect(result.instantaneousRadius).toBeCloseTo(1.392e-3, 6)
  })
})

describe('parameterized exercise bank', () => {
  it('covers every family with three distinct exercise templates', () => {
    expect(exerciseTemplateCount).toBe(families.length * 3)
    for (const family of families) {
      const templates = new Set(Array.from({ length: 30 }, (_, seed) => generateExercise(family.id, seed + 1, 3).templateId))
      expect(templates.size).toBe(3)
    }
  })

  it('always generates four valid choices and a reachable answer', () => {
    for (const family of families) {
      for (let seed = 1; seed <= 40; seed += 1) {
        const exercise = generateExercise(family.id, seed * 7919, (seed % 6) + 1)
        expect(exercise.options).toHaveLength(4)
        expect(exercise.correctIndex).toBeGreaterThanOrEqual(0)
        expect(exercise.correctIndex).toBeLessThan(4)
        expect(exercise.options[exercise.correctIndex]).toBe(exercise.correctAnswer)
        expect(`${exercise.prompt} ${exercise.options.join(' ')}`).not.toMatch(/NaN|Infinity/)
      }
    }
  })

  it('changes the statement across variants and mixes families', () => {
    const variants = new Set(Array.from({ length: 12 }, (_, seed) => generateExercise('optics', seed + 1, 4).prompt))
    expect(variants.size).toBeGreaterThan(3)
    const mixed = generateMixedSet(8, 90210)
    expect(new Set(mixed.map((exercise) => exercise.familyId)).size).toBeGreaterThanOrEqual(6)
  })
})

describe('mastery and scheduling', () => {
  it('uses the confirmed 2 September 2026 exam date and counts calendar days', () => {
    expect(DEFAULT_EXAM_DATE).toBe('2026-09-02')
    expect(daysUntilExam(DEFAULT_EXAM_DATE, new Date('2026-08-30T23:59:59+01:00'))).toBe(3)
    expect(daysUntilExam(DEFAULT_EXAM_DATE, new Date('2026-09-02T08:00:00+01:00'))).toBe(0)
  })

  it('discounts a hinted answer versus an autonomous answer', () => {
    const base = progress({ mastery: 0.35, updatedAt: '2026-08-29T10:00:00Z' })
    const autonomous = updateMastery(base, { correct: true, hintsUsed: 0, confidence: 'high', at: new Date('2026-08-29T10:00:00Z') })
    const hinted = updateMastery(base, { correct: true, hintsUsed: 3, confidence: 'high', at: new Date('2026-08-29T10:00:00Z') })
    expect(autonomous.mastery).toBeGreaterThan(hinted.mastery)
    expect(new Date(autonomous.nextReviewAt!).getTime()).toBeGreaterThan(new Date(hinted.nextReviewAt!).getTime())
  })
  it('decays current confidence without erasing historical mastery', () => {
    const item = progress({ mastery: 0.85, updatedAt: '2026-06-01T10:00:00Z', independentSuccesses: 4 })
    expect(currentConfidence(item, new Date('2026-08-29T10:00:00Z'))).toBeLessThan(item.mastery)
    expect(learningState(item, new Date('2026-08-29T10:00:00Z'))).toBe('independent')
  })
})

describe('coverage and adaptive selection', () => {
  const now = new Date('2026-08-29T10:00:00Z')
  it('normalizes all observed practical families to exactly 20 values', () => {
    expect(families.reduce((sum, family) => sum + family.historicalPoints, 0)).toBeCloseTo(20, 1)
  })
  it('never reports more than target progress', () => {
    const state = stateWith(Object.fromEntries(families.map((family) => [family.id, 1])) as Partial<Record<FamilyId, number>>)
    expect(calculateCoverage(state, now).preparationRatio).toBe(1)
  })
  it('prioritizes a frequent weak family over a rare equally weak family', () => {
    const state = stateWith({ thermal_transport: 0.3, induction_sources: 0.3 })
    const thermal = families.find((family) => family.id === 'thermal_transport')!
    const induction = families.find((family) => family.id === 'induction_sources')!
    expect(studyPriority(thermal, state, now)).toBeGreaterThan(studyPriority(induction, state, now))
  })
  it('returns a transparent recommendation with reasons', () => {
    const recommendation = recommendNext(stateWith({}), 10, now)
    expect(recommendation.minutes).toBe(10)
    expect(recommendation.reasons.length).toBeGreaterThanOrEqual(3)
  })
})
