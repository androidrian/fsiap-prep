/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { families } from '../data/analysis'
import { diagnosticMastery, updateMastery } from '../domain/mastery/mastery'
import type { Attempt, Confidence, ErrorType, FamilyId, FamilyProgress, MockResult, ProgressState, Settings } from '../domain/types'

const STORAGE_KEY = 'fsiap-prep-progress-v2'

const emptyProgress = (): FamilyProgress => ({ mastery: 0, updatedAt: null, independentSuccesses: 0, hintedSuccesses: 0, failures: 0, nextReviewAt: null })

export const initialState: ProgressState = {
  diagnosed: false,
  mastery: Object.fromEntries(families.map((family) => [family.id, emptyProgress()])) as Record<FamilyId, FamilyProgress>,
  attempts: [],
  mistakes: [],
  mockResults: [],
  settings: {
    passTarget: 10,
    preparationTarget: 13,
    examDate: '2027-01-20',
    dailyMinutes: 30,
  },
}

type Action =
  | { type: 'diagnostic'; results: Array<{ familyId: FamilyId; correct: boolean; confidence: Confidence }> }
  | { type: 'attempt'; familyId: FamilyId; exerciseId: string; prompt: string; correctAnswer: string; correct: boolean; hintsUsed: number; confidence: Confidence; answer: string; errorType?: ErrorType }
  | { type: 'mock'; result: Omit<MockResult, 'id' | 'completedAt'> }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'resolve-mistake'; id: string }
  | { type: 'reset' }

function reducer(state: ProgressState, action: Action): ProgressState {
  if (action.type === 'reset') return initialState
  if (action.type === 'settings') return { ...state, settings: { ...state.settings, ...action.settings } }
  if (action.type === 'diagnostic') {
    const now = new Date().toISOString()
    const mastery = { ...state.mastery }
    for (const result of action.results) {
      const score = diagnosticMastery(result.correct, result.confidence)
      mastery[result.familyId] = {
        ...mastery[result.familyId], mastery: score, updatedAt: now,
        independentSuccesses: result.correct && result.confidence === 'high' ? 1 : 0,
        failures: result.correct ? 0 : 1,
        nextReviewAt: new Date(Date.now() + (result.correct ? 4 : 1) * 86_400_000).toISOString(),
      }
    }
    return { ...state, diagnosed: true, mastery }
  }
  if (action.type === 'attempt') {
    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    const attempt: Attempt = { id, familyId: action.familyId, exerciseId: action.exerciseId, correct: action.correct, hintsUsed: action.hintsUsed, confidence: action.confidence, answer: action.answer, createdAt: now, errorType: action.errorType }
    const mastery = { ...state.mastery, [action.familyId]: updateMastery(state.mastery[action.familyId], { correct: action.correct, hintsUsed: action.hintsUsed, confidence: action.confidence }) }
    const mistakes = action.correct ? state.mistakes : [{
      id: crypto.randomUUID(), attemptId: id, familyId: action.familyId, exerciseId: action.exerciseId,
      prompt: action.prompt, answer: action.answer, correctAnswer: action.correctAnswer,
      errorType: action.errorType ?? 'conceptual', createdAt: now, resolved: false,
    }, ...state.mistakes]
    return { ...state, mastery, attempts: [attempt, ...state.attempts], mistakes }
  }
  if (action.type === 'mock') {
    const result: MockResult = { ...action.result, id: crypto.randomUUID(), completedAt: new Date().toISOString() }
    return { ...state, mockResults: [...state.mockResults, result] }
  }
  if (action.type === 'resolve-mistake') return { ...state, mistakes: state.mistakes.map((mistake) => mistake.id === action.id ? { ...mistake, resolved: true } : mistake) }
  return state
}

function loadState(): ProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? { ...initialState, ...JSON.parse(stored), mastery: { ...initialState.mastery, ...JSON.parse(stored).mastery } } : initialState
  } catch {
    return initialState
  }
}

const ProgressContext = createContext<{ state: ProgressState; dispatch: React.Dispatch<Action> } | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)), [state])
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('useProgress must be used inside ProgressProvider')
  return value
}
