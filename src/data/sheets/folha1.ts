import type { StudyExercise } from '../../domain/study'
import { folha1a } from './folha1.a'
import { folha1b } from './folha1.b'
import { folha1c } from './folha1.c'
import { folha1d } from './folha1.d'

/** Ficha 1 — Cargas, forças, campos e potencial elétrico (19 exercícios). */
export const folha1: StudyExercise[] = [...folha1a, ...folha1b, ...folha1c, ...folha1d]
