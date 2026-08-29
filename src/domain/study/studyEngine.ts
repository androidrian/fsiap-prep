import { families, familyById } from '../../data/analysis'
import { currentConfidence, learningState } from '../mastery/mastery'
import type { Family, FamilyId, ProgressState } from '../types'

export interface StudyRecommendation {
  family: Family
  score: number
  activity: 'learn' | 'guided' | 'practice' | 'review'
  minutes: number
  reasons: string[]
}

export function studyPriority(family: Family, state: ProgressState, now = new Date()): number {
  const progress = state.mastery[family.id]
  const confidence = currentConfidence(progress, now)
  const frequency = family.examAppearances / family.examCount
  const value = family.historicalPoints / Math.max(...families.map((candidate) => candidate.historicalPoints))
  const recent = family.recentAppearances / 5
  const examImportance = 0.48 * frequency + 0.34 * value + 0.18 * recent
  const weakness = 1 - confidence
  const due = progress.nextReviewAt && new Date(progress.nextReviewAt) <= now ? 0.5 : 0
  const forgettingRisk = Math.max(0, progress.mastery - confidence) + due
  const unmetPrerequisite = family.prerequisites.some((id) => currentConfidence(state.mastery[id], now) < 0.42)
  const prerequisiteFactor = unmetPrerequisite ? 0.58 : 1
  const dependentBoost = families
    .filter((candidate) => candidate.prerequisites.includes(family.id))
    .reduce((sum, child) => sum + (child.examAppearances / child.examCount) * (1 - currentConfidence(state.mastery[child.id], now)) * 0.18, 0)

  return examImportance * (0.5 + 0.5 * weakness) * (1 + forgettingRisk) * prerequisiteFactor + dependentBoost
}

export function recommendNext(state: ProgressState, requestedMinutes?: number, now = new Date()): StudyRecommendation {
  const ranked = families
    .map((family) => ({ family, score: studyPriority(family, state, now) }))
    .sort((a, b) => b.score - a.score)
  const best = ranked[0]
  const progress = state.mastery[best.family.id]
  const confidence = currentConfidence(progress, now)
  const status = learningState(progress, now)
  const activity = status === 'review_due' ? 'review' : confidence < 0.25 ? 'learn' : confidence < 0.55 ? 'guided' : 'practice'
  const minutes = requestedMinutes ?? (activity === 'learn' ? 20 : activity === 'guided' ? 20 : 15)
  const reasons = [
    `aparece em ${best.family.examAppearances} de ${best.family.examCount} exames completos`,
    `representa em média ${best.family.historicalPoints.toFixed(1)} valores normalizados`,
    progress.updatedAt ? `confiança atual estimada em ${Math.round(confidence * 100)}%` : 'ainda não foi diagnosticada',
  ]
  if (best.family.recentAppearances >= 4) reasons.push(`surgiu em ${best.family.recentAppearances}/5 provas recentes`)
  if (best.family.prerequisites.length) {
    const weak = best.family.prerequisites.find((id) => currentConfidence(state.mastery[id], now) < 0.42)
    if (weak) reasons.push(`convém consolidar primeiro: ${familyById[weak].shortName}`)
  }

  return { family: best.family, score: best.score, activity, minutes, reasons }
}

export function rankFamilies(state: ProgressState, now = new Date()): Array<{ id: FamilyId; score: number }> {
  return families
    .map((family) => ({ id: family.id, score: studyPriority(family, state, now) }))
    .sort((a, b) => b.score - a.score)
}
