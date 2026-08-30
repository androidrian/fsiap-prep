import { ArrowRight, Calculator, Search, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Formula } from '../components/Formula'
import { ReferenceTabs } from '../components/ReferenceTabs'
import { referenceCategories, unitConversions, unitQuantities, type ReferenceCategory } from '../data/reference'

function formatResult(value: number) {
  if (!Number.isFinite(value)) return '—'
  if (value !== 0 && (Math.abs(value) < 1e-4 || Math.abs(value) >= 1e7)) return value.toExponential(6).replace('.', ',')
  return value.toLocaleString('pt-PT', { maximumFractionDigits: 10 })
}

export function UnitsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | ReferenceCategory>('all')
  const [conversionId, setConversionId] = useState(unitConversions[0].id)
  const [input, setInput] = useState('1')
  const conversion = unitConversions.find((item) => item.id === conversionId)!
  const numericInput = Number(input.replace(',', '.'))
  const result = conversion.convert(numericInput)
  const categoryNames = Object.fromEntries(referenceCategories.map((item) => [item.id, item.label]))

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pt-PT')
    return unitQuantities.filter((item) => (
      (category === 'all' || item.category === category)
      && (!normalized || `${item.name} ${item.symbol} ${item.si} ${item.equivalent} ${item.common} ${item.warning}`.toLocaleLowerCase('pt-PT').includes(normalized))
    ))
  }, [category, query])

  return (
    <div className="page units-page">
      <ReferenceTabs />
      <section className="page-heading units-heading">
        <div>
          <p className="eyebrow">Guia de unidades SI</p>
          <h1>Antes da fórmula, põe tudo a falar a mesma língua.</h1>
          <p className="lede">Unidades, equivalências e armadilhas para as grandezas calculadas nos exercícios e simuladores.</p>
        </div>
        <div className="unit-count"><strong>{unitQuantities.length}</strong><span>grandezas verificadas</span></div>
      </section>

      <section className="prefix-strip">
        <span className="section-label">Prefixos que tens de reconhecer</span>
        {[['p', '10⁻¹²'], ['n', '10⁻⁹'], ['μ', '10⁻⁶'], ['m', '10⁻³'], ['k', '10³'], ['M', '10⁶']].map(([prefix, power]) => <div key={prefix}><strong>{prefix}</strong><span>{power}</span></div>)}
      </section>

      <section className="unit-converter">
        <div><span className="section-label"><Calculator size={13} /> Conversor rápido</span><h2>Confirma a potência de dez.</h2></div>
        <label><span>Conversão</span><select value={conversionId} onChange={(event) => setConversionId(event.target.value)}>{unitConversions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <div className="conversion-equation">
          <label><span>Valor</span><div><input aria-label="Valor a converter" inputMode="decimal" value={input} onChange={(event) => setInput(event.target.value)} /><small>{conversion.from}</small></div></label>
          <ArrowRight size={18} />
          <div><span>Resultado</span><strong>{formatResult(result)}</strong><small>{conversion.to}</small></div>
        </div>
        <p>{conversion.rule}</p>
      </section>

      <section className="unit-tools">
        <label><Search size={16} /><input aria-label="Procurar grandeza" placeholder="Procurar grandeza, símbolo ou unidade…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>Todas</button>{referenceCategories.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
      </section>

      <section className="unit-register">
        <header><span>Grandeza</span><span>Unidade SI</span><span>Equivalência / uso comum</span><span>Armadilha</span></header>
        {filtered.map((item) => (
          <article key={item.id}>
            <div><small>{categoryNames[item.category]}</small><strong>{item.name}</strong><Formula value={item.symbol} /></div>
            <div><Formula value={item.si} /><small>{item.equivalent.includes('\\') ? <Formula value={item.equivalent} /> : item.equivalent}</small></div>
            <div>{item.common}</div>
            <p><TriangleAlert size={13} />{item.warning}</p>
          </article>
        ))}
        {!filtered.length && <div className="unit-empty">Nenhuma grandeza corresponde à pesquisa.</div>}
      </section>

      <section className="dimension-check">
        <span className="section-label">Verificações de 10 segundos</span>
        <h2>Se as unidades não fecham, o cálculo ainda não acabou.</h2>
        <div><p><strong>Energia</strong> N·m = J, nunca W.</p><p><strong>Campo elétrico</strong> N/C = V/m.</p><p><strong>Constante RC</strong> Ω·F = s.</p><p><strong>Fluxo magnético</strong> T·m² = Wb.</p></div>
      </section>
    </div>
  )
}
