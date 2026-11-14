import type { AnswerCheck } from '../study'

const superscriptDigits: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' }

/**
 * Lê um número escrito como um aluno o escreve: "1,2e-3", "1.2×10^-3", "1,2 x 10⁻³", "−4,5", "3/5".
 * Devolve null se não conseguir interpretar.
 */
export function parseStudentNumber(raw: string): number | null {
  let text = raw.trim().toLowerCase()
  if (!text) return null
  text = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (match) => `^${match.split('').map((character) => superscriptDigits[character]).join('')}`)
  text = text.replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/,/g, '.')
  text = text.replace(/(?:[×x*·])10\^?\(?([+-]?\d+)\)?/g, 'e$1')
  text = text.replace(/^10\^\(?([+-]?\d+)\)?$/, '1e$1')
  const fraction = text.match(/^([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\/(\d*\.?\d+(?:e[+-]?\d+)?)$/)
  if (fraction) {
    const denominator = Number(fraction[2])
    return denominator === 0 ? null : Number(fraction[1]) / denominator
  }
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(text)) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

export type CheckVerdict = 'correct' | 'sign' | 'power' | 'close' | 'wrong' | 'invalid'

export interface CheckResult {
  verdict: CheckVerdict
  /** Desvio relativo em relação ao valor esperado (quando aplicável). */
  deviation?: number
}

/** Compara a resposta do aluno com o alvo e classifica o tipo de erro mais provável. */
export function checkAnswer(raw: string, target: AnswerCheck): CheckResult {
  const value = parseStudentNumber(raw)
  if (value === null) return { verdict: 'invalid' }
  const tolerance = target.tolerance ?? 0.05
  const expected = target.value
  if (expected === 0) return { verdict: Math.abs(value) < 1e-9 ? 'correct' : 'wrong' }
  const deviation = Math.abs(value - expected) / Math.abs(expected)
  if (deviation <= tolerance) return { verdict: 'correct', deviation }
  if (Math.abs(value + expected) / Math.abs(expected) <= tolerance) return { verdict: 'sign', deviation }
  if (value !== 0 && Math.sign(value) === Math.sign(expected)) {
    const ratio = Math.log10(Math.abs(value / expected))
    const rounded = Math.round(ratio)
    if (rounded !== 0 && Math.abs(ratio - rounded) < Math.log10(1 + tolerance)) return { verdict: 'power', deviation }
  }
  if (deviation <= 0.15) return { verdict: 'close', deviation }
  return { verdict: 'wrong', deviation }
}

export const verdictMessage: Record<CheckVerdict, string> = {
  correct: 'Certo.',
  sign: 'O valor está certo, mas o sinal está trocado. Revê o sentido (carga negativa? eixo? trabalho do campo ou externo?).',
  power: 'Os algarismos estão certos, mas a potência de 10 não. Revê as conversões de unidades (cm, mm, μ, n, k…).',
  close: 'Estás perto. Pode ser arredondamento a meio das contas ou uma constante diferente.',
  wrong: 'Ainda não. Confirma a fórmula, os dados em SI e o que é pedido.',
  invalid: 'Não consegui ler o número. Exemplos: 0,0012 · 1,2e-3 · 1,2×10^-3',
}
