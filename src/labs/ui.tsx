/* eslint-disable react-refresh/only-export-components */
import type { ComponentType, ReactNode } from 'react'
import { Formula } from '../components/Formula'

/** Propriedades recebidas por todos os cenários de laboratório. `params` vem da query string. */
export interface LabProps {
  params: Record<string, string>
}

export interface LabScenario {
  /** Identificador usado no URL (?scenario=…) e no catálogo. */
  id: string
  /** Texto do separador. */
  label: string
  component: ComponentType<LabProps>
}

/** Cursor com etiqueta e valor atual. Usa-o para todas as grandezas ajustáveis. */
export function Control({ label, value, min, max, step, onChange, unit }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; unit: string }) {
  const decimals = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0
  return <label className="sim-control"><span>{label}<strong>{value.toFixed(decimals)} {unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

/**
 * Campo numérico livre (aceita notação científica, ex.: 1.6e-19). Usa-o quando a gama de valores
 * é demasiado larga para um cursor (cargas elementares, massas de partículas, potências de estrelas…).
 */
export function NumberField({ label, value, onChange, unit, hint }: { label: string; value: number; onChange: (value: number) => void; unit: string; hint?: string }) {
  return <label className="sim-number"><span>{label}</span><div><input type="text" inputMode="decimal" defaultValue={String(value)} key={value} aria-label={label} onBlur={(event) => { const parsed = Number(event.target.value.replace(',', '.')); if (Number.isFinite(parsed)) onChange(parsed); else event.target.value = String(value) }} onKeyDown={(event) => { if (event.key === 'Enter') (event.target as HTMLInputElement).blur() }} /><em>{unit}</em></div>{hint && <small>{hint}</small>}</label>
}

/** Resultado principal do cenário, com a fórmula que o produz. */
export function ResultStrip({ label, value, formula, secondary }: { label: string; value: string; formula: string; secondary?: string }) {
  // Em atributos JSX a barra invertida não é escape: "\\Delta" chegaria ao KaTeX como quebra de linha + "Delta".
  return <div className="sim-result"><span>{label}</span><strong>{value}</strong>{secondary && <small>{secondary}</small>}<Formula value={formula.replaceAll('\\\\', '\\')} /></div>
}

/** Grelha de resultados secundários (2 a 4 por linha). */
export function Metrics({ items }: { items: Array<{ label: string; value: string }> }) {
  const columns = items.length >= 4 ? 'four' : items.length === 3 ? 'three' : 'two'
  return <div className={`exam-metrics ${columns}`}>{items.map((item) => <span key={item.label}><small>{item.label}</small><strong>{item.value}</strong></span>)}</div>
}

/** Nota pedagógica por baixo dos controlos (armadilha, leitura do diagrama, sequência de cálculo). */
export function LabNote({ title, children }: { title: string; children: ReactNode }) {
  return <p className="balance-note"><strong>{title}</strong> {children}</p>
}

/** Grupo de botões para escolhas discretas (sinal da carga, sentido do campo…). */
export function Choice<T extends string | number>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: ReadonlyArray<readonly [T, string]> }) {
  return <div className="source-kind"><span>{label}</span><div>{options.map(([id, text]) => <button type="button" key={String(id)} className={value === id ? 'active' : ''} onClick={() => onChange(id)}>{text}</button>)}</div></div>
}

export function numberParam(params: Record<string, string>, key: string, fallback: number) {
  if (params[key] === undefined || params[key] === '') return fallback
  const parsed = Number(params[key])
  return Number.isFinite(parsed) ? parsed : fallback
}

export function textParam(params: Record<string, string>, key: string, fallback: string) {
  return params[key] === undefined || params[key] === '' ? fallback : params[key]
}

/** Escreve um número com 3 algarismos significativos, em notação científica quando é muito grande/pequeno. */
export function sig(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const magnitude = Math.abs(value)
  if (magnitude >= 1e4 || magnitude < 1e-2) {
    const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
    return `${mantissa.replace('.', ',')}×10${superscript(Number(exponent))}`
  }
  return Number(value.toPrecision(digits)).toLocaleString('pt-PT', { maximumSignificantDigits: digits })
}

const superscripts: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
function superscript(exponent: number) {
  return String(exponent).split('').map((character) => superscripts[character] ?? character).join('')
}
