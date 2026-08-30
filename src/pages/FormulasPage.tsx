import { ArrowRight, Search, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Formula } from '../components/Formula'
import { ReferenceTabs } from '../components/ReferenceTabs'
import { families } from '../data/analysis'

const avoid: Record<string, string> = {
  thermal_transport: 'Não uses Q=mcΔT para um fluxo estacionário através de camadas.',
  thermal_equilibrium: 'Não uses resistência térmica num sistema isolado que apenas procura equilíbrio.',
  electrostatics: 'Não somes módulos de campo sem considerar direção; potencial é escalar, campo não.',
  uniform_fields: 'E=ΔV/d só é diretamente aplicável a campo aproximadamente uniforme.',
  dc_circuits: 'Não reduzas resistências como série se partilharem apenas um nó com outra derivação.',
  rc_circuits: 'Em t=0 e t→∞ o condensador comporta-se de forma diferente; identifica o instante.',
  magnetic_particles: 'A força qvB só usa a componente de v perpendicular a B.',
  induction_sources: 'Não há FEM induzida se o fluxo magnético não variar.',
  optics: 'Os ângulos da lei de Snell medem-se à normal, não à superfície.',
  em_waves: 'Não uses c=λf dentro de um meio sem substituir c pela velocidade nesse meio.',
}

export function FormulasPage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => families.filter((family) => `${family.name} ${family.description} ${family.recognition}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <div className="page formulas-page">
      <ReferenceTabs />
      <section className="page-heading formula-heading">
        <div><p className="eyebrow">Formulário aplicado</p><h1>Saber quando usar é metade da resposta.</h1><p className="lede">Fórmulas ligadas a sinais do enunciado, erros frequentes e famílias reais.</p></div>
        <label className="formula-search"><Search size={16} /><input placeholder="Procurar tema ou situação…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </section>
      <section className="formula-catalog">
        {filtered.map((family, index) => (
          <article key={family.id}>
            <div className="formula-family-head"><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{family.name}</h2><p>{family.recognition}</p></div><strong>{family.examAppearances}/{family.examCount}</strong></div>
            <div className="applied-formulas">{family.formulas.map((formula) => <div key={formula}><Formula value={formula} display /></div>)}</div>
            <div className="formula-guidance">
              <p><span>Quando usar</span>{family.description}</p>
              <p className="avoid"><span><TriangleAlert size={13} /> Não usar assim</span>{avoid[family.id]}</p>
              <Link to={`/study?family=${family.id}`}>Treinar reconhecimento <ArrowRight size={14} /></Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
