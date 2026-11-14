import type { StudyExercise } from '../../domain/study'
import { folha2a } from './folha2.a'
import { folha2b } from './folha2.b'
import { folha2c } from './folha2.c'
import { folha2d } from './folha2.d'

/** Ficha 2 — Circuitos elétricos em corrente contínua (24 exercícios). */
export const folha2: StudyExercise[] = [...folha2a, ...folha2b, ...folha2c, ...folha2d]
