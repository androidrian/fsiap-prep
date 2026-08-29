import { families } from '../../data/analysis'
import { currentConfidence, learningState } from '../mastery/mastery'
import type { FamilyId, ProgressState } from '../types'

export interface CoverageBreakdown {
  effective: number
  mastered: number
  learning: number
  notStudied: number
  target: number
  preparationRatio: number
  status: 'red' | 'amber' | 'green'
}

export function calculateCoverage(state: ProgressState, now = new Date()): CoverageBreakdown {
  let effective = 0
  let mastered = 0
  let learning = 0
  let notStudied = 0

  for (const family of families) {
    const progress = state.mastery[family.id]
    const confidence = currentConfidence(progress, now)
    effective += family.historicalPoints * confidence
    const status = learningState(progress, now)
    if (status === 'mastered' || status === 'independent') mastered += family.historicalPoints
    else if (status === 'not_started') notStudied += family.historicalPoints
    else learning += family.historicalPoints
  }

  const target = state.settings.preparationTarget
  const preparationRatio = Math.min(1, effective / target)
  const criticalWeak = families.filter(
    (family) => family.examAppearances / family.examCount >= 0.65 && currentConfidence(state.mastery[family.id], now) < 0.62,
  ).length
  const passedMocks = state.mockResults.filter((result) => result.score >= state.settings.passTarget).length
  const status = effective >= target && criticalWeak === 0 && passedMocks >= 2 ? 'green' : effective >= state.settings.passTarget * 0.75 ? 'amber' : 'red'

  return { effective, mastered, learning, notStudied, target, preparationRatio, status }
}

export function familyCoverage(state: ProgressState, familyId: FamilyId, now = new Date()): number {
  const family = families.find((candidate) => candidate.id === familyId)
  return family ? family.historicalPoints * currentConfidence(state.mastery[familyId], now) : 0
}
