/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { loadProgress, saveProgress } from '../auth/api'
import { families } from '../data/analysis'
import { diagnosticMastery, updateMastery } from '../domain/mastery/mastery'
import { DEFAULT_EXAM_DATE } from '../domain/study/examDate'
import type { Attempt, Confidence, ErrorType, FamilyId, FamilyProgress, MockResult, ProgressState, Settings } from '../domain/types'

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
    examDate: DEFAULT_EXAM_DATE,
    dailyMinutes: 30,
  },
}

type Action =
  | { type: 'hydrate'; state: ProgressState }
  | { type: 'diagnostic'; results: Array<{ familyId: FamilyId; correct: boolean; confidence: Confidence }> }
  | { type: 'attempt'; familyId: FamilyId; exerciseId: string; prompt: string; correctAnswer: string; correct: boolean; hintsUsed: number; confidence: Confidence; answer: string; errorType?: ErrorType }
  | { type: 'mock'; result: Omit<MockResult, 'id' | 'completedAt'> }
  | { type: 'settings'; settings: Partial<Settings> }
  | { type: 'resolve-mistake'; id: string }
  | { type: 'reset' }

function reducer(state: ProgressState, action: Action): ProgressState {
  if (action.type === 'hydrate') return action.state
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

function normalizeState(parsed: Partial<ProgressState>): ProgressState {
  const settings = { ...initialState.settings, ...parsed.settings }
  return {
    ...initialState,
    ...parsed,
    settings,
    mastery: { ...initialState.mastery, ...parsed.mastery },
  }
}

type SyncStatus = 'loading' | 'saving' | 'saved' | 'error'

interface ProgressValue {
  state: ProgressState
  dispatch: React.Dispatch<Action>
  ready: boolean
  syncStatus: SyncStatus
  flush: () => Promise<void>
}

const ProgressContext = createContext<ProgressValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(reducer, initialState)
  const [ready, setReady] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')
  const stateRef = useRef(state)
  const loadVersion = useRef(0)
  const saveVersion = useRef(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveQueue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => { stateRef.current = state }, [state])

  useEffect(() => {
    const version = ++loadVersion.current
    setReady(false)
    setSyncStatus('loading')
    if (!user) {
      dispatch({ type: 'hydrate', state: initialState })
      return
    }

    loadProgress()
      .then((progress) => {
        if (version !== loadVersion.current) return
        dispatch({ type: 'hydrate', state: progress ? normalizeState(progress) : initialState })
        setReady(true)
        setSyncStatus('saved')
      })
      .catch(() => {
        if (version !== loadVersion.current) return
        dispatch({ type: 'hydrate', state: initialState })
        setReady(true)
        setSyncStatus('error')
      })
  }, [user])

  const persist = useCallback(async (snapshot: ProgressState) => {
    if (!user) return
    const version = ++saveVersion.current
    setSyncStatus('saving')
    const operation = saveQueue.current.catch(() => undefined).then(() => saveProgress(snapshot))
    saveQueue.current = operation
    try {
      await operation
      if (version === saveVersion.current) setSyncStatus('saved')
    } catch {
      if (version === saveVersion.current) setSyncStatus('error')
      throw new Error('Não foi possível sincronizar o progresso.')
    }
  }, [user])

  useEffect(() => {
    if (!ready || !user) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => { void persist(state) }, 350)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [persist, ready, state, user])

  const flush = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (ready && user) await persist(stateRef.current)
  }, [persist, ready, user])

  const value = useMemo(() => ({ state, dispatch, ready, syncStatus, flush }), [flush, ready, state, syncStatus])
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('useProgress must be used inside ProgressProvider')
  return value
}
