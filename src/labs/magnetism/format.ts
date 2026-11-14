import { sig } from '../ui'
import { norm, type Vec3 } from './physics'

/** Vetor por componentes, ex.: "(0; -27; -18)". */
export function formatVec(vector: Vec3, digits = 3): string {
  return `(${vector.map((component) => sig(component, digits)).join('; ')})`
}

/** Número em TeX com vírgula decimal e potência de 10 quando é muito grande/pequeno. */
export function texNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '\\text{—}'
  if (value === 0) return '0'
  const magnitude = Math.abs(value)
  if (magnitude >= 1e4 || magnitude < 1e-2) {
    const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
    const trimmed = mantissa.includes('.') ? mantissa.replace(/0+$/, '').replace(/\.$/, '') : mantissa
    return `${trimmed.replace('.', '{,}')}\\times10^{${Number(exponent)}}`
  }
  return String(Number(value.toPrecision(digits))).replace('.', '{,}')
}

const axisNames = ['x', 'y', 'z'] as const

/** Direção em palavras: "−y e −z", "+x"… Componentes abaixo de 5 % da maior são ignoradas. */
export function directionWords(vector: Vec3): string {
  const size = norm(vector)
  if (size === 0) return 'nenhuma direção (vetor nulo)'
  const largest = Math.max(...vector.map(Math.abs))
  const parts = vector.flatMap((component, index) => (Math.abs(component) >= largest * 0.05 ? [`${component < 0 ? '−' : '+'}${axisNames[index]}`] : []))
  if (parts.length === 1) return parts[0]
  return `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`
}

/** Intervalo de um cursor alargado para conter o valor inicial vindo do URL. */
export function spanFor(value: number, min: number, max: number): { min: number; max: number } {
  return { min: Math.min(min, value), max: Math.max(max, value) }
}

/** Limita um valor a um intervalo. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
