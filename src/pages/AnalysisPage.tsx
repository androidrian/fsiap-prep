import { ArrowDown, FileCheck2, Info, ScanSearch } from 'lucide-react'
import { useState } from 'react'
import { Formula } from '../components/Formula'
import { analysisSummary, assessments, families, questionSources } from '../data/analysis'

export function AnalysisPage() {
  const [expanded, setExpanded] = useState<string | null>('thermal_transport')
  return (
    <div className="page analysis-page">
      <section className="page-heading">
        <div><p className="eyebrow">Fonte de verdade · documentos locais</p><h1>Mapa real do exame</h1><p className="lede">A taxonomia resulta do método de resolução, não apenas das palavras do enunciado.</p></div>
      </section>

      <section className="analysis-stats">
        <div><strong>{analysisSummary.uniqueAssessments}</strong><span>avaliações únicas</span><small>{analysisSummary.fullExams} exames + {analysisSummary.midterms} testes</small></div>
        <div><strong>{analysisSummary.primaryQuestions}</strong><span>problemas principais</span><small>{analysisSummary.subquestions} subquestões</small></div>
        <div><strong>{analysisSummary.families}</strong><span>famílias de raciocínio</span><small>pesos sem duplicados</small></div>
      </section>

      <div className="method-banner"><Info size={17} /><p><strong>Como ler os valores:</strong> {analysisSummary.coverageMethod} A parte teórica de escolha múltipla aparece em branco nos PDFs e não foi inventada.</p></div>

      <section className="family-analysis">
        <div className="section-heading-row"><div><span className="section-label">Famílias por retorno histórico</span><h2>O padrão que se repete</h2></div><span className="table-key">presença · contribuição média /20</span></div>
        <div className="family-table">
          {families.map((family, index) => {
            const sources = questionSources.filter((question) => question.allocations[family.id])
            const isOpen = expanded === family.id
            return (
              <article className={`family-entry ${isOpen ? 'is-open' : ''}`} key={family.id}>
                <button className="family-row" onClick={() => setExpanded(isOpen ? null : family.id)}>
                  <span className="family-rank">{String(index + 1).padStart(2, '0')}</span>
                  <div className="family-main"><strong>{family.name}</strong><span>{family.description}</span></div>
                  <div className="frequency-cell"><div><i style={{ width: `${family.examAppearances / family.examCount * 100}%` }} /></div><strong>{family.examAppearances}/{family.examCount}</strong></div>
                  <div className="value-cell"><strong>{family.historicalPoints.toFixed(1)}</strong><span>val.</span></div>
                  <ArrowDown size={17} />
                </button>
                {isOpen && (
                  <div className="family-detail">
                    <div><span className="section-label">Como reconhecer</span><p>{family.recognition}</p><span className="section-label">Processo reutilizável</span><ol>{family.strategy.map((step) => <li key={step}>{step}</li>)}</ol></div>
                    <div><span className="section-label">Fórmulas nucleares</span><div className="formula-list">{family.formulas.map((formula) => <Formula key={formula} value={formula} />)}</div><span className="section-label">Exames onde aparece</span><div className="source-tags">{sources.map((source) => <span key={source.id}>{assessments.find((assessment) => assessment.id === source.assessmentId)?.label} · P{source.number}</span>)}</div></div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>

      <section className="source-register">
        <div><ScanSearch size={22} /><span><strong>Controlo de duplicados</strong>Hash dos ficheiros usado para não contar cópias em pastas diferentes.</span></div>
        <div><FileCheck2 size={22} /><span><strong>Validação visual</strong>As duas provas digitalizadas foram renderizadas e lidas página a página.</span></div>
      </section>
    </div>
  )
}
