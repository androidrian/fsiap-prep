/** Grandeza representada pela seta: define a cor (ver electro.css). */
export type ArrowKind = 'e' | 'f' | 'v' | 'pos' | 'neg' | 'ink'

const headSizes = { s: 5, m: 9, l: 13 } as const

/** Marcadores de ponta de seta. `prefix` é o id do cenário, para os ids serem únicos na página. */
export function ArrowDefs({ prefix, kinds }: { prefix: string; kinds: ArrowKind[] }) {
  return <defs>{kinds.flatMap((kind) => (Object.keys(headSizes) as Array<keyof typeof headSizes>).map((size) => (
    <marker key={`${kind}-${size}`} id={`${prefix}-head-${kind}-${size}`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth={headSizes[size]} markerHeight={headSizes[size]} markerUnits="userSpaceOnUse" orient="auto">
      <path d="M0 0.6L10 5L0 9.4z" className={`lab-electro-head-${kind}`} />
    </marker>
  )))}</defs>
}

/**
 * Vetor de (x1, y1) até (x2, y2). A linha é encurtada para a ponta do marcador terminar exatamente em (x2, y2).
 * Setas com menos de 1,5 px não são desenhadas.
 */
export function Arrow({ prefix, kind, x1, y1, x2, y2, thick = false, className = '' }: { prefix: string; kind: ArrowKind; x1: number; y1: number; x2: number; y2: number; thick?: boolean; className?: string }) {
  const length = Math.hypot(x2 - x1, y2 - y1)
  if (!Number.isFinite(length) || length < 1.5) return null
  const size: keyof typeof headSizes | null = length < 6 ? null : length < 14 ? 's' : thick ? 'l' : 'm'
  const cut = size ? headSizes[size] * 0.9 : 0
  const endX = x2 - (x2 - x1) / length * cut
  const endY = y2 - (y2 - y1) / length * cut
  return <line className={`lab-electro-arrow lab-electro-arrow-${kind}${thick ? ' lab-electro-thick' : ''} ${className}`.trim()} x1={round(x1)} y1={round(y1)} x2={round(endX)} y2={round(endY)} markerEnd={size ? `url(#${prefix}-head-${kind}-${size})` : undefined} />
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
