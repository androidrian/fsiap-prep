import { ExternalLink, FileCheck2, TriangleAlert } from 'lucide-react'
import { Formula } from '../components/Formula'
import { ReferenceTabs } from '../components/ReferenceTabs'
import { officialConstants, officialFormulaGroups } from '../data/reference'

const pdfUrl = `${import.meta.env.BASE_URL}docs/Formulario_FSIAP_2025-2026.pdf`

export function OfficialFormulaPage() {
  const relationCount = officialFormulaGroups.reduce((sum, group) => sum + group.formulas.length, 0)

  return (
    <div className="page official-formula-page">
      <ReferenceTabs />
      <section className="page-heading official-formula-heading">
        <div>
          <p className="eyebrow">Documento fornecido · 2025/2026</p>
          <h1>O formulário do exame, sem distrações.</h1>
          <p className="lede">Transcrição navegável das duas páginas do documento oficial, organizada por tema.</p>
        </div>
        <a className="button button-primary" href={pdfUrl} target="_blank" rel="noreferrer">Abrir PDF original <ExternalLink size={16} /></a>
      </section>

      <section className="formula-source-strip">
        <span><FileCheck2 size={15} /> Formulario_FSIAP.pdf</span>
        <strong>2 páginas</strong><strong>2025/2026</strong><strong>{relationCount} relações</strong>
      </section>

      <section className="official-groups">
        {officialFormulaGroups.map((group, index) => (
          <article key={group.id} id={`formula-${group.id}`}>
            <header>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{group.title}</h2>
              <small>{group.formulas.length} fórmulas</small>
            </header>
            <div className="official-formula-grid">
              {group.formulas.map((formula) => <div key={formula}><Formula value={formula} display /></div>)}
            </div>
          </article>
        ))}
      </section>

      <section className="official-constants">
        <div className="section-heading-row"><div><span className="section-label">Página 2</span><h2>Constantes físicas</h2></div></div>
        <div>
          {officialConstants.map((constant) => (
            <article key={constant.label}>
              <Formula value={constant.formula} />
              <span>{constant.label}</span>
              {constant.note && <p><TriangleAlert size={13} /> {constant.note}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
