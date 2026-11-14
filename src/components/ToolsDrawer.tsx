import { ArrowRightLeft, Calculator, CornerDownLeft, Delete, Hash, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { unitConversions } from '../data/reference'
import { CalculatorError, calculatorConstants, evaluateExpression, formatResult, type AngleMode } from '../domain/tools/calculator'
import type { ToolTab } from './toolsBus'

const tabs: Array<{ id: ToolTab; label: string; icon: typeof Calculator }> = [
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'constants', label: 'Constantes', icon: Hash },
  { id: 'converter', label: 'Conversor', icon: ArrowRightLeft },
]

const keypad = ['sin(', 'cos(', 'tan(', 'asin(', 'sqrt(', '^', '×10^', 'pi', '(', ')', 'ln(', 'log(']

const prefixes: Array<{ symbol: string; label: string; power: number }> = [
  { symbol: 'p', label: 'pico', power: -12 }, { symbol: 'n', label: 'nano', power: -9 }, { symbol: 'μ', label: 'micro', power: -6 },
  { symbol: 'm', label: 'mili', power: -3 }, { symbol: 'c', label: 'centi', power: -2 }, { symbol: '—', label: 'unidade', power: 0 },
  { symbol: 'k', label: 'quilo', power: 3 }, { symbol: 'M', label: 'mega', power: 6 }, { symbol: 'G', label: 'giga', power: 9 },
]

interface HistoryItem { expression: string; result: string; value: number }

export function ToolsDrawer({ open, tab, onTab, onClose }: { open: boolean; tab: ToolTab; onTab: (tab: ToolTab) => void; onClose: () => void }) {
  const [expression, setExpression] = useState('')
  const [angleMode, setAngleMode] = useState<AngleMode>('deg')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [prefixValue, setPrefixValue] = useState('1')
  const [fromPower, setFromPower] = useState(-6)
  const [toPower, setToPower] = useState(0)
  const [exponent, setExponent] = useState(1)
  const [conversionId, setConversionId] = useState(unitConversions[0].id)
  const [conversionValue, setConversionValue] = useState('1')

  useEffect(() => {
    if (open && tab === 'calculator') inputRef.current?.focus()
  }, [open, tab])

  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open, onClose])

  if (!open) return null

  const last = history[0]
  const insert = (text: string) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? expression.length
    const end = input?.selectionEnd ?? expression.length
    const value = expression.slice(0, start) + text + expression.slice(end)
    setExpression(value)
    setError('')
    requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + text.length, start + text.length) })
  }
  const calculate = (event: FormEvent) => {
    event.preventDefault()
    try {
      const value = evaluateExpression(expression, angleMode, last ? { ans: last.value } : {})
      setHistory((items) => [{ expression, result: formatResult(value), value }, ...items].slice(0, 8))
      setExpression('')
      setError('')
    } catch (caught) {
      setError(caught instanceof CalculatorError ? caught.message : 'Expressão inválida.')
    }
  }

  const prefixNumber = Number(prefixValue.replace(',', '.'))
  const prefixResult = Number.isFinite(prefixNumber) ? prefixNumber * 10 ** ((fromPower - toPower) * exponent) : null
  const conversion = unitConversions.find((item) => item.id === conversionId)!
  const conversionNumber = Number(conversionValue.replace(',', '.'))

  return (
    <aside className="tools-drawer" role="dialog" aria-label="Ferramentas de cálculo">
      <header>
        <nav role="tablist" aria-label="Ferramentas">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => onTab(id)}><Icon size={15} /> {label}</button>)}
        </nav>
        <button type="button" className="icon-button" aria-label="Fechar ferramentas" onClick={onClose}><X size={18} /></button>
      </header>

      {tab === 'calculator' && (
        <div className="tool-panel">
          <form onSubmit={calculate} className="calc-form">
            <label htmlFor="calc-input">Expressão</label>
            <div className="calc-input">
              <input id="calc-input" ref={inputRef} autoComplete="off" spellCheck={false} placeholder="k*(1,6e-19)^2/(4e-15)^2" value={expression} onChange={(event) => { setExpression(event.target.value); setError('') }} aria-describedby="calc-error" />
              <button type="button" aria-label="Apagar expressão" onClick={() => { setExpression(''); setError(''); inputRef.current?.focus() }}><Delete size={16} /></button>
              <button type="submit" className="calc-equals" aria-label="Calcular"><CornerDownLeft size={16} /></button>
            </div>
            <p id="calc-error" className="calc-error" role="alert">{error}</p>
          </form>
          <div className="calc-mode" role="radiogroup" aria-label="Unidade dos ângulos">
            <button type="button" role="radio" aria-checked={angleMode === 'deg'} className={angleMode === 'deg' ? 'active' : ''} onClick={() => setAngleMode('deg')}>Graus</button>
            <button type="button" role="radio" aria-checked={angleMode === 'rad'} className={angleMode === 'rad' ? 'active' : ''} onClick={() => setAngleMode('rad')}>Radianos</button>
          </div>
          <div className="calc-keys">{keypad.map((key) => <button key={key} type="button" onClick={() => insert(key === '×10^' ? '*10^' : key)}>{key}</button>)}{last && <button type="button" onClick={() => insert('ans')}>ans</button>}</div>
          <div className="calc-constants">{calculatorConstants.slice(0, 10).map((constant) => <button key={constant.symbol} type="button" title={`${constant.label} = ${formatResult(constant.value)} ${constant.unit}`} onClick={() => insert(constant.symbol)}>{constant.symbol}</button>)}</div>
          <ol className="calc-history" aria-label="Resultados anteriores">
            {history.map((item, index) => <li key={`${item.expression}-${index}`}><button type="button" onClick={() => insert(String(item.value))} title="Inserir este resultado"><small>{item.expression}</small><strong>= {item.result}</strong></button></li>)}
            {history.length === 0 && <li className="calc-empty">Escreve a conta como no papel. Vírgula ou ponto decimal, <code>e</code> para potências de 10 e as constantes pelo símbolo (k, eps0, mu0, c, qe, me, mp, g, sigma).</li>}
          </ol>
        </div>
      )}

      {tab === 'constants' && (
        <div className="tool-panel">
          <table className="constants-table">
            <thead><tr><th scope="col">Símbolo</th><th scope="col">Constante</th><th scope="col">Valor</th></tr></thead>
            <tbody>{calculatorConstants.map((constant) => <tr key={constant.symbol}><td><button type="button" onClick={() => { onTab('calculator'); insert(constant.symbol) }} title="Usar na calculadora">{constant.symbol}</button></td><td>{constant.label}</td><td>{formatResult(constant.value)} <small>{constant.unit}</small></td></tr>)}</tbody>
          </table>
          <p className="tool-note">Valores do formulário oficial. Clica no símbolo para o usar na calculadora.</p>
        </div>
      )}

      {tab === 'converter' && (
        <div className="tool-panel">
          <h3>Prefixos SI</h3>
          <div className="converter-row">
            <label><span>Valor</span><input inputMode="decimal" value={prefixValue} onChange={(event) => setPrefixValue(event.target.value)} /></label>
            <label><span>De</span><select value={fromPower} onChange={(event) => setFromPower(Number(event.target.value))}>{prefixes.map((prefix) => <option key={prefix.power} value={prefix.power}>{prefix.symbol} · {prefix.label}</option>)}</select></label>
            <label><span>Para</span><select value={toPower} onChange={(event) => setToPower(Number(event.target.value))}>{prefixes.map((prefix) => <option key={prefix.power} value={prefix.power}>{prefix.symbol} · {prefix.label}</option>)}</select></label>
            <label><span>Dimensão</span><select value={exponent} onChange={(event) => setExponent(Number(event.target.value))}><option value={1}>linear (m)</option><option value={2}>área (m²)</option><option value={3}>volume (m³)</option></select></label>
          </div>
          <p className="converter-result" role="status">{prefixResult === null ? 'Escreve um número.' : <>= <strong>{formatResult(prefixResult)}</strong> <small>fator 10^{(fromPower - toPower) * exponent}</small></>}</p>

          <h3>Conversões frequentes</h3>
          <div className="converter-row">
            <label className="wide"><span>Conversão</span><select value={conversionId} onChange={(event) => setConversionId(event.target.value)}>{unitConversions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label><span>Valor ({conversion.from})</span><input inputMode="decimal" value={conversionValue} onChange={(event) => setConversionValue(event.target.value)} /></label>
          </div>
          <p className="converter-result" role="status">{Number.isFinite(conversionNumber) ? <>= <strong>{formatResult(conversion.convert(conversionNumber))}</strong> {conversion.to} <small>regra: {conversion.rule}</small></> : 'Escreve um número.'}</p>
          <p className="tool-note">Converte sempre antes de elevar ao quadrado: 1 cm² = 10⁻⁴ m², 1 mm² = 10⁻⁶ m².</p>
        </div>
      )}
    </aside>
  )
}
