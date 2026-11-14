/** Peças SVG partilhadas pelos cenários de magnetismo: pontas de seta, setas etiquetadas, padrões ⊙/⊗ e barra de escala. */

export type Tone = 'v' | 'b' | 'e' | 'f' | 'ink' | 'muted' | 'blue' | 'red' | 'amber'

type Point = readonly [number, number]

/** Marcadores de ponta de seta; usar dentro de `<defs>`. Os ids ficam `${prefix}-head-${tone}`. */
export function ArrowHeads({ prefix, tones }: { prefix: string; tones: readonly Tone[] }) {
  return <>{tones.map((tone) => <marker key={tone} id={`${prefix}-head-${tone}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path className={`lab-magnetism-head lab-magnetism-tone-${tone}`} d="M0 1L10 5L0 9z" /></marker>)}</>
}

/**
 * Seta com etiqueta junto à ponta. `labelShift` desloca a etiqueta para evitar sobreposições.
 * Vetores com menos de 1,5 px são desenhados como um ponto (módulo nulo ou perpendicular ao ecrã).
 */
export function Arrow({ prefix, tone, from, to, label, labelShift = [0, 0], thin = false, dashed = false, className = '' }: { prefix: string; tone: Tone; from: Point; to: Point; label?: string; labelShift?: Point; thin?: boolean; dashed?: boolean; className?: string }) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const length = Math.hypot(dx, dy)
  const ux = length > 0 ? dx / length : 0
  const uy = length > 0 ? dy / length : -1
  const anchor = ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle'
  const labelX = to[0] + ux * 7 + labelShift[0]
  const labelY = to[1] + uy * 11 + 4 + labelShift[1]
  const classes = `lab-magnetism-arrow lab-magnetism-tone-${tone}${thin ? ' thin' : ''}${dashed ? ' dashed' : ''} ${className}`.trim()
  return <g>
    {length >= 1.5
      ? <line className={classes} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} markerEnd={`url(#${prefix}-head-${tone})`} />
      : <circle className={`lab-magnetism-null lab-magnetism-tone-${tone} ${className}`.trim()} cx={from[0]} cy={from[1]} r="3" />}
    {label && <text className={`lab-magnetism-label lab-magnetism-tone-${tone}`} x={labelX} y={labelY} textAnchor={anchor}>{label}</text>}
  </g>
}

/** Padrão de campo perpendicular à página: pontos (a sair, ⊙) ou cruzes (a entrar, ⊗). */
export function FieldPattern({ id, out, spacing = 28 }: { id: string; out: boolean; spacing?: number }) {
  const centre = spacing / 2
  return <pattern id={id} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
    {out
      ? <circle className="lab-magnetism-glyph dot" cx={centre} cy={centre} r="2" />
      : <path className="lab-magnetism-glyph" d={`M${centre - 3.5} ${centre - 3.5}l7 7m0-7l-7 7`} />}
  </pattern>
}

/** Barra de escala horizontal com o comprimento real escrito por baixo. */
export function ScaleBar({ x, y, length, label }: { x: number; y: number; length: number; label: string }) {
  return <g className="lab-magnetism-scale">
    <path d={`M${x} ${y - 4}V${y + 4}M${x} ${y}H${x + length}M${x + length} ${y - 4}V${y + 4}`} />
    <text x={x + length / 2} y={y + 17} textAnchor="middle">{label}</text>
  </g>
}
