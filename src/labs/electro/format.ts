/** Número com vírgula decimal e casas fixas; nunca escreve NaN/Infinity nem "−0". */
export function fmt(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '—'
  const text = value.toFixed(decimals)
  return (Number(text) === 0 ? (0).toFixed(decimals) : text).replace('.', ',')
}

/** Número "como foi escrito" (até 6 algarismos significativos), com vírgula decimal. */
export function plain(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const magnitude = Math.abs(value)
  if (magnitude !== 0 && (magnitude >= 1e6 || magnitude < 1e-4)) return value.toExponential(2).replace('.', ',')
  return String(Number(value.toPrecision(6))).replace('.', ',')
}

/** Igual a `plain`, mas com sinal + explícito nos valores positivos (cargas). */
export function signed(value: number): string {
  return value > 0 ? `+${plain(value)}` : plain(value)
}

const subscripts = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

export function subscript(index: number): string {
  return String(index).split('').map((digit) => subscripts[Number(digit)] ?? digit).join('')
}

/** Etiqueta legível da unidade de carga usada no URL. */
export function chargeUnitLabel(unit: string): string {
  return unit === 'uC' ? 'μC' : unit
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
