import { sig } from '../ui'

/** Número com casas decimais fixas e vírgula decimal. */
export function fix(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '—'
  const text = roundHalfUp(value, decimals).toFixed(decimals)
  return (Number(text) === 0 ? text.replace('-', '') : text).replace('.', ',')
}

/** Arredonda pela representação decimal (273,15 → 273,2 e não 273,1 por erro binário). */
function roundHalfUp(value: number, decimals: number): number {
  const digits = String(Math.abs(value))
  if (digits.includes('e')) return value
  const rounded = Number(`${Math.round(Number(`${digits}e${decimals}`))}e-${decimals}`)
  return value < 0 ? -rounded : rounded
}

/** Número curto (até `digits` algarismos significativos, sem zeros à direita) com vírgula decimal. */
export function compact(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const magnitude = Math.abs(value)
  if (magnitude < 1e-3 || magnitude >= 1e5) return sig(value, digits)
  return String(Number(value.toPrecision(digits))).replace('.', ',')
}

/** Notação científica sempre (ex.: 7,65×10⁻²), como nas soluções das fichas. */
export function sci(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
  const power = [...String(Number(exponent))].map((character) => (character === '-' ? '⁻' : superscriptDigits[Number(character)])).join('')
  return `${mantissa.replace('.', ',')}×10${power}`
}

/** Potência legível: W até 10 kW, depois kW, depois notação científica. */
export function watts(value: number, digits = 3): string {
  const magnitude = Math.abs(value)
  if (!Number.isFinite(value)) return '—'
  if (magnitude < 1e4) return `${compact(value, digits)} W`
  if (magnitude < 1e7) return `${compact(value / 1e3, digits)} kW`
  return `${sig(value, digits)} W`
}

/** Comprimento legível em m, mm ou μm. */
export function length(value: number, digits = 3): string {
  const magnitude = Math.abs(value)
  if (!Number.isFinite(value)) return '—'
  if (magnitude === 0) return '0 m'
  if (magnitude >= 1) return `${compact(value, digits)} m`
  if (magnitude >= 1e-3) return `${compact(value * 1e3, digits)} mm`
  return `${compact(value * 1e6, digits)} μm`
}

/** Valor estritamente positivo, ou o valor de recurso. */
export function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Alarga a gama de um cursor para caber o valor inicial vindo do URL. */
export function widen(value: number, min: number, max: number, step: number): { min: number; max: number; step: number } {
  if (!Number.isFinite(value)) return { min, max, step }
  if (value < min) return { min: value, max, step: value > 0 ? Math.min(step, value) : step }
  if (value > max) return { min, max: value, step }
  return { min, max, step }
}

/** Prepara um número já formatado para entrar numa fórmula KaTeX. */
export function tex(text: string): string {
  return text.replace(/,/g, '{,}').replace(/×10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, (_match, exponent: string) => `\\times10^{${fromSuperscript(exponent)}}`)
}

const superscriptDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹'
function fromSuperscript(text: string): string {
  return [...text].map((character) => (character === '⁻' ? '-' : String(superscriptDigits.indexOf(character)))).join('')
}
