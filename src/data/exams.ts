import type { StudyExercise } from '../domain/study'
import { examsA } from './exams.a'
import { examsB } from './exams.b'
import { examsC } from './exams.c'

/** Os 14 exercícios de exame resolvidos, pela mesma ordem de src/data/examExercises.ts. */
export const examStudyExercises: StudyExercise[] = [...examsA, ...examsB, ...examsC]
