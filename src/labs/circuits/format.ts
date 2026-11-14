import { sig } from '../ui'

const prefixes: ReadonlyArray<readonly [number, string]> = [[-12, 'p'], [-9, 'n'], [-6, 'μ'], [-3, 'm'], [0, ''], [3, 'k'], [6, 'M'], [9, 'G']]

/** Número com `digits` algarismos significativos e sinal menos tipográfico. */
export function num(value: number, digits = 3): string {
  return sig(value, digits).replace(/^-/, '−')
}

/**
 * Valor com prefixo SI escolhido de modo a que a mantissa fique em [low, 1000·low[.
 * `low = 1` dá "632 μC"; `low = 0.1` dá "0,303 J".
 */
export function eng(value: number, unit: string, digits = 3, low = 1): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return `0 ${unit}`
  const magnitude = Math.abs(value)
  let chosen = prefixes[0]
  for (const prefix of prefixes) if (magnitude >= low * 10 ** prefix[0] * (1 - 1e-9)) chosen = prefix
  return `${num(value / 10 ** chosen[0], digits)} ${chosen[1]}${unit}`
}

/** Índice em subscrito Unicode (R₁, C₁₂…). */
export function subscript(index: number): string {
  return String(index).split('').map((digit) => '₀₁₂₃₄₅₆₇₈₉'[Number(digit)] ?? digit).join('')
}
