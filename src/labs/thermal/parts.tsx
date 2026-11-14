/** Peças SVG partilhadas pelos cenários térmicos. */

/** Resistência (ziguezague) horizontal centrada em (x, y). */
export function Zigzag({ x, y, width = 36, className = 'lab-thermal-resistor' }: { x: number; y: number; width?: number; className?: string }) {
  const start = x - width / 2
  const step = width / 6
  const points = [`${start},${y}`]
  for (let index = 0; index < 6; index += 1) points.push(`${(start + step * (index + 0.5)).toFixed(1)},${y + (index % 2 === 0 ? -5 : 5)}`)
  points.push(`${start + width},${y}`)
  return <polyline className={className} points={points.join(' ')} />
}

/** Seta horizontal cheia de (x1, y) para (x2, y) com a espessura indicada. */
export function FlowArrow({ x1, x2, y, thickness, className }: { x1: number; x2: number; y: number; thickness: number; className: string }) {
  const direction = x2 >= x1 ? 1 : -1
  const span = Math.abs(x2 - x1)
  const half = thickness / 2
  const head = Math.min(span * 0.5, thickness + 7)
  const neck = x2 - direction * head
  const d = `M${x1.toFixed(1)} ${(y - half).toFixed(1)}H${neck.toFixed(1)}V${(y - half - 4).toFixed(1)}L${x2.toFixed(1)} ${y.toFixed(1)}L${neck.toFixed(1)} ${(y + half + 4).toFixed(1)}V${(y + half).toFixed(1)}H${x1.toFixed(1)}Z`
  return <path className={className} d={d} />
}

/** Ponta de seta para `marker-end`. O id tem de ser único na página. */
export function ArrowMarker({ id, className, size = 7 }: { id: string; className: string; size?: number }) {
  return <marker id={id} className={className} viewBox="0 0 10 10" refX="8" refY="5" markerWidth={size} markerHeight={size} markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" /></marker>
}
