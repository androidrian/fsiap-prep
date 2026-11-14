/* eslint-disable react-refresh/only-export-components */
import { sig } from '../ui'

/**
 * Utilitários de desenho partilhados pelos cenários de ondas/ótica.
 * Ângulos de ecrã em graus, medidos a partir de +x e a crescer no sentido horário (y aponta para baixo):
 * direita = 0, baixo = 90, esquerda = 180, cima = −90.
 */

export type Point = [number, number]

const RAD = Math.PI / 180

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Devolve o valor se for finito e positivo; caso contrário o valor de recurso. */
export function positive(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

/** Arredonda para manter os atributos SVG curtos. */
export function px(value: number) {
  return Math.round(value * 100) / 100
}

/** Opacidade de um meio no desenho: quanto maior o índice de refração, mais carregado. */
export function mediumOpacity(index: number) {
  return px(0.03 + clamp((index - 1) * 0.24, 0, 0.42))
}

/** Número com vírgula decimal e casas fixas. */
export function fmt(value: number, decimals = 1) {
  return Number.isFinite(value) ? value.toFixed(decimals).replace('.', ',') : '—'
}

/** Ângulo em graus com vírgula decimal; «—» quando não existe. */
export function degrees(value: number | null, decimals = 1) {
  return value === null || !Number.isFinite(value) ? '—' : `${fmt(value, decimals)}°`
}

const superscripts: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/** Potência de dez para marcas de eixos logarítmicos: 10³, 10⁻¹², 1. */
export function powerOfTen(exponent: number) {
  return exponent === 0 ? '1' : `10${String(exponent).split('').map((character) => superscripts[character] ?? character).join('')}`
}

/** Comprimento com a unidade mais legível (km … pm). */
export function formatLength(metres: number) {
  if (!Number.isFinite(metres)) return '—'
  const size = Math.abs(metres)
  if (size >= 1e7 || size < 1e-13) return `${sig(metres)} m`
  if (size >= 1e4) return `${sig(metres / 1e3)} km`
  if (size >= 0.1) return `${sig(metres)} m`
  if (size >= 1e-2) return `${sig(metres * 1e2)} cm`
  if (size >= 1e-3) return `${sig(metres * 1e3)} mm`
  if (size >= 1e-6) return `${sig(metres * 1e6)} μm`
  if (size >= 1e-10) return `${sig(metres * 1e9)} nm`
  return `${sig(metres * 1e12)} pm`
}

export function polar(cx: number, cy: number, radius: number, angle: number): Point {
  return [cx + radius * Math.cos(angle * RAD), cy + radius * Math.sin(angle * RAD)]
}

export function arcPath(cx: number, cy: number, radius: number, from: number, to: number) {
  const [x0, y0] = polar(cx, cy, radius, from)
  const [x1, y1] = polar(cx, cy, radius, to)
  const large = Math.abs(to - from) > 180 ? 1 : 0
  const sweep = to > from ? 1 : 0
  return `M${px(x0)} ${px(y0)}A${radius} ${radius} 0 ${large} ${sweep} ${px(x1)} ${px(y1)}`
}

/** Ponta de seta reutilizável. `tone` escolhe a cor (ver waves.css). */
export function ArrowHead({ id, tone, size = 7 }: { id: string; tone: 'ray' | 'e' | 'b' | 'ink' | 'muted'; size?: number }) {
  return <marker id={id} className={`lab-waves-head ${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth={size} markerHeight={size} markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 1L10 5L0 9z" /></marker>
}

/**
 * Arco de ângulo com etiqueta. A etiqueta fica na bissetriz; quando o ângulo é estreito passa para
 * fora, do lado de `to` (o chamador ordena from/to para que esse lado esteja livre), ou para `labelAt`.
 */
export function AngleArc({ cx, cy, radius, from, to, label, labelAt, className = '' }: { cx: number; cy: number; radius: number; from: number; to: number; label?: string; labelAt?: Point; className?: string }) {
  const span = Math.abs(to - from)
  const direction = to >= from ? 1 : -1
  const labelRadius = radius + 13
  const narrow = span < 30
  const outside = Math.asin(Math.min(1, 14 / labelRadius)) / RAD
  const [lx, ly] = labelAt ?? polar(cx, cy, labelRadius, narrow ? to + direction * outside : (from + to) / 2)
  return <g className={`lab-waves-angle ${className}`}>
    {span > 0.5 && <path className="lab-waves-arc" d={arcPath(cx, cy, radius, from, to)} />}
    {label && <text className="lab-waves-arc-label" x={px(lx)} y={px(ly)} dy=".35em" textAnchor="middle">{label}</text>}
  </g>
}

/** Raio de luz de `from` para `to`, com uma ponta de seta a meio (fração `arrowAt` do percurso). */
export function Ray({ from, to, marker, arrowAt = 0.55, className = '', opacity }: { from: Point; to: Point; marker?: string; arrowAt?: number; className?: string; opacity?: number }) {
  const mx = from[0] + (to[0] - from[0]) * arrowAt
  const my = from[1] + (to[1] - from[1]) * arrowAt
  return <path className={`lab-waves-ray ${className}`} opacity={opacity} markerMid={marker ? `url(#${marker})` : undefined} d={`M${px(from[0])} ${px(from[1])}L${px(mx)} ${px(my)}L${px(to[0])} ${px(to[1])}`} />
}
