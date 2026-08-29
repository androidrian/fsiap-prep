import type { Confidence, FamilyProgress, LearningState } from '../types'

const DAY = 86_400_000

export function currentConfidence(progress: FamilyProgress, now = new Date()): number {
  if (!progress.updatedAt) return 0
  const elapsedDays = Math.max(0, (now.getTime() - new Date(progress.updatedAt).getTime()) / DAY)
  const halfLifeDays = 18 + progress.mastery * 42
  return Math.max(0, Math.min(1, progress.mastery * Math.pow(0.5, elapsedDays / halfLifeDays)))
}

export function learningState(progress: FamilyProgress, now = new Date()): LearningState {
  if (!progress.updatedAt) return 'not_started'
  const confidence = currentConfidence(progress, now)
  if (progress.nextReviewAt && new Date(progress.nextReviewAt) <= now && progress.mastery >= 0.55) return 'review_due'
  if (progress.mastery >= 0.82 && progress.independentSuccesses >= 3 && confidence >= 0.7) return 'mastered'
  if (progress.mastery >= 0.62 && progress.independentSuccesses >= 2) return 'independent'
  if (progress.mastery >= 0.35) return 'with_help'
  return 'learning'
}

export interface MasteryOutcome {
  correct: boolean
  hintsUsed: number
  confidence: Confidence
  at?: Date
}

export function updateMastery(previous: FamilyProgress, outcome: MasteryOutcome): FamilyProgress {
  const at = outcome.at ?? new Date()
  const confidenceFactor = { low: 0.72, medium: 0.87, high: 1 }[outcome.confidence]
  const autonomyFactor = Math.max(0.45, 1 - outcome.hintsUsed * 0.14)
  const target = outcome.correct ? confidenceFactor * autonomyFactor : outcome.confidence === 'high' ? 0.05 : 0.16
  const learningRate = outcome.correct ? (outcome.hintsUsed === 0 ? 0.24 : 0.13) : 0.3
  const mastery = Math.max(0, Math.min(1, previous.mastery + learningRate * (target - previous.mastery)))
  const baseInterval = !outcome.correct ? 1 : outcome.hintsUsed > 0 ? 2 : outcome.confidence === 'high' ? 14 : outcome.confidence === 'medium' ? 7 : 4
  const intervalDays = Math.max(1, Math.round(baseInterval * (0.7 + mastery)))

  return {
    mastery,
    updatedAt: at.toISOString(),
    independentSuccesses: previous.independentSuccesses + (outcome.correct && outcome.hintsUsed === 0 ? 1 : 0),
    hintedSuccesses: previous.hintedSuccesses + (outcome.correct && outcome.hintsUsed > 0 ? 1 : 0),
    failures: previous.failures + (outcome.correct ? 0 : 1),
    nextReviewAt: new Date(at.getTime() + intervalDays * DAY).toISOString(),
  }
}

export function diagnosticMastery(correct: boolean, confidence: Confidence): number {
  if (!correct) return confidence === 'high' ? 0.08 : confidence === 'medium' ? 0.16 : 0.22
  return confidence === 'high' ? 0.66 : confidence === 'medium' ? 0.52 : 0.38
}
