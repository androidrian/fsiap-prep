export type FamilyId =
  | 'thermal_transport'
  | 'thermal_equilibrium'
  | 'electrostatics'
  | 'uniform_fields'
  | 'dc_circuits'
  | 'rc_circuits'
  | 'magnetic_particles'
  | 'induction_sources'
  | 'optics'
  | 'em_waves'

export type LearningState =
  | 'not_started'
  | 'learning'
  | 'with_help'
  | 'independent'
  | 'mastered'
  | 'review_due'

export type Confidence = 'low' | 'medium' | 'high'
export type ErrorType =
  | 'conceptual'
  | 'wrong_formula'
  | 'calculation'
  | 'units'
  | 'sign'
  | 'interpretation'
  | 'rounding'
  | 'forgotten'
  | 'cannot_start'

export interface Family {
  id: FamilyId
  name: string
  shortName: string
  description: string
  examAppearances: number
  examCount: number
  historicalPoints: number
  recentAppearances: number
  prerequisites: FamilyId[]
  formulas: string[]
  recognition: string
  strategy: string[]
  accent: string
}

export interface QuestionSource {
  id: string
  assessmentId: string
  number: number
  subquestions: number
  observedPoints: number
  allocations: Partial<Record<FamilyId, number>>
  summary: string
  difficulty: 1 | 2 | 3 | 4 | 5
}

export interface Assessment {
  id: string
  label: string
  year: number
  season: string
  kind: 'exam' | 'midterm'
  durationMinutes: number | null
  questionCount: number
  subquestionCount: number
  practicalPoints: number
  sourcePath: string
  note?: string
}

export interface FamilyProgress {
  mastery: number
  updatedAt: string | null
  independentSuccesses: number
  hintedSuccesses: number
  failures: number
  nextReviewAt: string | null
}

export interface Attempt {
  id: string
  familyId: FamilyId
  exerciseId: string
  correct: boolean
  hintsUsed: number
  confidence: Confidence
  answer: string
  createdAt: string
  errorType?: ErrorType
}

export interface Mistake {
  id: string
  attemptId: string
  familyId: FamilyId
  exerciseId: string
  prompt: string
  answer: string
  correctAnswer: string
  errorType: ErrorType
  createdAt: string
  resolved: boolean
}

export interface MockResult {
  id: string
  score: number
  completedAt: string
  familyLosses: Partial<Record<FamilyId, number>>
}

export interface Settings {
  passTarget: number
  preparationTarget: number
  examDate: string
  dailyMinutes: number
}

export interface ProgressState {
  diagnosed: boolean
  mastery: Record<FamilyId, FamilyProgress>
  attempts: Attempt[]
  mistakes: Mistake[]
  mockResults: MockResult[]
  settings: Settings
}
