import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import katex from 'katex'
import { describe, expect, it } from 'vitest'
import { families } from '../data/analysis'
import { formulaById, formulas } from '../data/formulas'
import { allExercises, sheetExercises } from '../data/library'
import { theoryTopics } from '../data/theory'
import type { StudyExercise } from '../domain/study'
import { labCatalog } from '../labs/catalog'

const familyIds = new Set(families.map((family) => family.id))
const expectedPerSheet: Record<number, number> = { 1: 19, 2: 24, 3: 16, 4: 18, 5: 22, 6: 40 }

/** Devolve as expressões matemáticas em linha ($…$) de um texto; falha se os cifrões não fecham. */
function inlineMath(text: string): string[] {
  const pieces = text.split('$')
  if (pieces.length % 2 === 0) throw new Error(`cifrões desemparelhados em: ${text}`)
  return pieces.filter((_, index) => index % 2 === 1)
}

function renders(expression: string, display: boolean) {
  expect(() => katex.renderToString(expression, { throwOnError: true, displayMode: display, strict: 'ignore' }), expression).not.toThrow()
}

function textsOf(exercise: StudyExercise): string[] {
  return [
    exercise.title, exercise.statement, exercise.strategy ?? '', exercise.note ?? '', ...(exercise.pitfalls ?? []),
    ...(exercise.data ?? []).map((item) => item.value),
    ...exercise.parts.flatMap((part) => [part.question, part.answer, part.hint ?? '', ...part.steps.map((step) => step.text)]),
  ]
}

describe('formula registry', () => {
  it('has unique ids and valid KaTeX', () => {
    expect(new Set(formulas.map((formula) => formula.id)).size).toBe(formulas.length)
    for (const formula of formulas) {
      renders(formula.latex, true)
      for (const text of [formula.legend, formula.when, formula.watch ?? '']) for (const expression of inlineMath(text)) renders(expression, false)
    }
  })
})

describe('theory topics', () => {
  it('reference existing formulas and render', () => {
    expect(new Set(theoryTopics.map((topic) => topic.id)).size).toBe(theoryTopics.length)
    for (const topic of theoryTopics) {
      for (const id of [...topic.formulaIds, ...(topic.highlight ?? [])]) expect(formulaById[id], `${topic.id} → ${id}`).toBeDefined()
      for (const text of [topic.summary, topic.examTip ?? '', ...topic.keyIdeas]) for (const expression of inlineMath(text)) renders(expression, false)
    }
  })
})

describe('exercise library', () => {
  it('has unique ids', () => {
    expect(new Set(allExercises.map((exercise) => exercise.id)).size).toBe(allExercises.length)
  })

  it.each([1, 2, 3, 4, 5, 6])('contains every exercise of sheet %i in order', (sheet) => {
    const numbers = sheetExercises.filter((exercise) => exercise.source.kind === 'sheet' && exercise.source.sheet === sheet).map((exercise) => exercise.source.number)
    expect(numbers).toEqual(Array.from({ length: expectedPerSheet[sheet] }, (_, index) => index + 1))
  })

  it.each(allExercises.map((exercise) => [exercise.id, exercise] as const))('%s is complete and consistent', (_id, exercise) => {
    if (exercise.source.kind === 'sheet') expect(exercise.id).toBe(`f${exercise.source.sheet}-${String(exercise.source.number).padStart(2, '0')}`)
    expect(exercise.title.length).toBeGreaterThan(3)
    expect(exercise.statement.length).toBeGreaterThan(20)
    expect(exercise.familyIds.length).toBeGreaterThan(0)
    for (const family of exercise.familyIds) expect(familyIds.has(family), family).toBe(true)
    expect(exercise.formulaIds.length).toBeGreaterThan(0)
    for (const id of exercise.formulaIds) expect(formulaById[id], `fórmula desconhecida: ${id}`).toBeDefined()
    expect(exercise.parts.length).toBeGreaterThan(0)
    expect(new Set(exercise.parts.map((part) => part.label)).size).toBe(exercise.parts.length)
    for (const part of exercise.parts) {
      expect(part.question.length).toBeGreaterThan(3)
      expect(part.answer.length).toBeGreaterThan(0)
      expect(part.steps.length).toBeGreaterThan(0)
      for (const step of part.steps) if (step.math) renders(step.math, true)
      if (part.check) {
        expect(Number.isFinite(part.check.value)).toBe(true)
        expect(part.check.unit.length).toBeGreaterThan(0)
      }
    }
    for (const item of exercise.data ?? []) renders(item.symbol, false)
    for (const text of textsOf(exercise)) for (const expression of inlineMath(text)) renders(expression, false)
    if (exercise.figure) {
      expect(existsSync(resolve(process.cwd(), 'public', exercise.figure.src)), exercise.figure.src).toBe(true)
      expect(exercise.figure.alt.length).toBeGreaterThan(30)
    }
    for (const link of exercise.labs ?? []) {
      const scenario = labCatalog[link.family]?.find((entry) => entry.id === link.scenario)
      expect(scenario, `cenário desconhecido: ${link.family}/${link.scenario}`).toBeDefined()
      for (const key of Object.keys(link.params ?? {})) expect(Object.keys(scenario!.params), `${link.scenario}: parâmetro desconhecido ${key}`).toContain(key)
    }
  })
})
