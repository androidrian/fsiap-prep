import type { FamilyId, StudyStatus } from './types'

/**
 * Modelo único para exercícios resolvidos (fichas TP e exames).
 *
 * Convenções de texto:
 *  - `text`, `question`, `answer`, `statement`, `hint`, `strategy`, `pitfalls` e `note`
 *    aceitam matemática em linha entre cifrões: "o campo $E=kq/r^2$ aponta…".
 *  - `math` é sempre KaTeX em modo display (sem cifrões).
 *  - Escreve as strings com LaTeX em String.raw`…` para não duplicar barras.
 */

/** Um passo da resolução: explicação curta + (opcional) a conta em destaque. */
export interface SolutionStep {
  /** Rótulo curto do passo, ex.: "Dados em SI", "Lei de Coulomb", "Soma vetorial". */
  title?: string
  /** Explicação em português; aceita $matemática em linha$. */
  text: string
  /** Expressão KaTeX em display com a substituição numérica e o resultado. */
  math?: string
}

/** Alvo numérico para o aluno conferir a sua resposta. */
export interface AnswerCheck {
  /** Valor esperado na unidade indicada em `unit` (resultado calculado, não arredondado em excesso). */
  value: number
  /** Unidade em que o aluno deve escrever a resposta, ex.: "N", "mA", "°C". */
  unit: string
  /** Tolerância relativa aceite (por omissão 0.03 = 3%). */
  tolerance?: number
}

export interface ExercisePart {
  /** 'a', 'b', … ou '' quando o exercício tem uma única pergunta. */
  label: string
  question: string
  /** Resposta final calculada por nós, com unidades (aceita $…$). */
  answer: string
  /** Solução impressa na ficha ("R:"), transcrita tal como está. Omitir se a ficha não a dá. */
  official?: string
  /** Empurrão inicial (sem revelar a conta) mostrado antes da resolução. */
  hint?: string
  steps: SolutionStep[]
  check?: AnswerCheck
}

export interface LabLink {
  family: FamilyId
  /** Identificador do cenário no laboratório (ver src/labs/catalog.ts). */
  scenario: string
  /** Texto do botão, ex.: "Ver as três cargas no triângulo". */
  label: string
  /** 'direct' = abre já com os dados do exercício; 'concept' = apoio conceptual. */
  coverage: 'direct' | 'concept'
  params?: Record<string, string>
}

export interface ExerciseFigure {
  /** Caminho relativo à raiz pública, ex.: "figures/f1-05.png". */
  src: string
  /** Descrição completa da figura para leitores de ecrã e para quem estuda sem a imagem. */
  alt: string
  caption?: string
}

export interface ExerciseTable {
  caption?: string
  headers: string[]
  rows: string[][]
}

/** 1–5 são as fichas TP; 6 é a folha de preparação para o teste intercalar (matéria das fichas 1 a 4). */
export type SheetNumber = 1 | 2 | 3 | 4 | 5 | 6

export const sheetNumbers: readonly SheetNumber[] = [1, 2, 3, 4, 5, 6]

export type ExerciseSource =
  | { kind: 'sheet'; sheet: SheetNumber; number: number }
  | { kind: 'exam'; exam: string; number: number; path: string }

export interface StudyExercise {
  /** 'f1-05' para fichas (ficha 1, exercício 5; 'f6-…' é a folha de preparação); ids existentes para exames. */
  id: string
  source: ExerciseSource
  /** Título curto e reconhecível, ex.: "Três cargas num triângulo equilátero". */
  title: string
  familyIds: FamilyId[]
  /** 1 = aplicação direta · 2 = vários passos · 3 = exige estratégia/geometria. */
  difficulty: 1 | 2 | 3
  /** Enunciado fiel ao original (aceita $…$). */
  statement: string
  /** Dados do enunciado já organizados: símbolo em KaTeX e valor com unidade. */
  data?: Array<{ symbol: string; value: string }>
  figure?: ExerciseFigure
  /** true quando o original tem figura mas não a temos (descrever no enunciado). */
  missingFigure?: boolean
  table?: ExerciseTable
  parts: ExercisePart[]
  /** Ids do registo de fórmulas (src/data/formulas.ts) usadas na resolução. */
  formulaIds: string[]
  /** Como reconhecer o tipo de problema e o plano de ataque (1–3 frases). */
  strategy?: string
  /** Erros típicos a evitar neste exercício. */
  pitfalls?: string[]
  /** Observações: discrepâncias com a solução da ficha, hipóteses assumidas, etc. */
  note?: string
  labs?: LabLink[]
}

export const sheetTitles: Record<SheetNumber, string> = {
  1: 'Cargas, forças, campos e potencial elétrico',
  2: 'Circuitos elétricos em corrente contínua',
  3: 'Força eletromagnética e indução',
  4: 'Radiação, ótica e fibra ótica',
  5: 'Térmica e transferência de calor',
  6: 'Preparação para o teste: matéria das fichas 1 a 4',
}

/** Nome curto da coleção: "Ficha 3" para as fichas TP, "Preparação" para a folha de preparação. */
export function sheetLabel(sheet: SheetNumber): string {
  return sheet === 6 ? 'Preparação' : `Ficha ${sheet}`
}

export const statusLabels: Record<StudyStatus, string> = { todo: 'Por fazer', done: 'Feito', review: 'A rever', doubt: 'Dúvida' }
export const difficultyLabels: Record<1 | 2 | 3, string> = { 1: 'Aplicação direta', 2: 'Vários passos', 3: 'Exige estratégia' }

export function exerciseLabel(exercise: StudyExercise): string {
  return exercise.source.kind === 'sheet'
    ? `${sheetLabel(exercise.source.sheet)} · Ex. ${exercise.source.number}`
    : `${exercise.source.exam} · P.${exercise.source.number}`
}
