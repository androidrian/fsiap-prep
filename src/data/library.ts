import type { LabLink, StudyExercise } from '../domain/study'
import type { FamilyId } from '../domain/types'
import { examStudyExercises } from './exams'
import { folha1 } from './sheets/folha1'
import { folha2 } from './sheets/folha2'
import { folha3 } from './sheets/folha3'
import { folha4 } from './sheets/folha4'
import { folha5 } from './sheets/folha5'

export const sheetExercises: StudyExercise[] = [...folha1, ...folha2, ...folha3, ...folha4, ...folha5]
export const allExercises: StudyExercise[] = [...sheetExercises, ...examStudyExercises]

export const exerciseById: Record<string, StudyExercise> = Object.fromEntries(allExercises.map((exercise) => [exercise.id, exercise]))

export function exercisesForFormula(formulaId: string): StudyExercise[] {
  return allExercises.filter((exercise) => exercise.formulaIds.includes(formulaId))
}

export function exercisesForFamily(familyId: FamilyId): StudyExercise[] {
  return allExercises.filter((exercise) => exercise.familyIds.includes(familyId))
}

export function exercisesForLab(family: FamilyId, scenario: string): Array<{ exercise: StudyExercise; link: LabLink }> {
  return allExercises.flatMap((exercise) => (exercise.labs ?? [])
    .filter((link) => link.family === family && link.scenario === scenario)
    .map((link) => ({ exercise, link })))
}

/** Exercício anterior e seguinte dentro da mesma coleção (ficha ou exame). */
export function neighbours(exercise: StudyExercise): { previous?: StudyExercise; next?: StudyExercise } {
  const group = allExercises.filter((candidate) => candidate.source.kind === exercise.source.kind
    && (candidate.source.kind === 'sheet' && exercise.source.kind === 'sheet'
      ? candidate.source.sheet === exercise.source.sheet
      : candidate.source.kind === 'exam' && exercise.source.kind === 'exam' && candidate.source.exam === exercise.source.exam))
  const index = group.findIndex((candidate) => candidate.id === exercise.id)
  return { previous: group[index - 1], next: group[index + 1] }
}
