import type { StudyExercise } from '../../domain/study'
import { folha6a } from './folha6.a'
import { folha6b } from './folha6.b'
import { folha6c } from './folha6.c'
import { folha6d } from './folha6.d'
import { folha6e } from './folha6.e'
import { folha6f } from './folha6.f'
import { folha6g } from './folha6.g'

/** Folha de preparação para o teste intercalar — matéria das fichas 1 a 4. (40 exercícios) */
export const folha6: StudyExercise[] = [...folha6a, ...folha6b, ...folha6c, ...folha6d, ...folha6e, ...folha6f, ...folha6g]
