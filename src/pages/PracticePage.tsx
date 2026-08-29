import { ArrowRight, Dices, Shuffle, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { families } from '../data/analysis'
import { exerciseTemplateCount, generateExercise } from '../domain/exercises/generator'
import { currentConfidence } from '../domain/mastery/mastery'
import type { FamilyId } from '../domain/types'
import { useProgress } from '../storage/ProgressContext'

export function PracticePage() {
  const { state } = useProgress()
  const [previewFamily, setPreviewFamily] = useState<FamilyId>('thermal_transport')
  const [seed, setSeed] = useState(4201)
  const preview = useMemo(() => generateExercise(previewFamily, seed, 3), [previewFamily, seed])

  return (
    <div className="page practice-page">
      <section className="page-heading"><div><p className="eyebrow">Banco parametrizado</p><h1>Não há duas sessões iguais.</h1><p className="lede">Escolhe uma família ou deixa o motor decidir. Os dados, resultados e distrações são recalculados em cada variante.</p></div></section>
      <section className="practice-summary"><div><strong>{exerciseTemplateCount}</strong><span>tipos de problema</span></div><div><strong>∞</strong><span>combinações de dados</span></div><div><strong>6</strong><span>níveis progressivos</span></div><Link className="button button-primary" to="/study"><Sparkles size={16} /> Deixar o motor escolher</Link></section>
      <section className="variant-preview">
        <div className="preview-meta"><span className="section-label">Exemplo gerado agora</span><select value={previewFamily} onChange={(event) => setPreviewFamily(event.target.value as FamilyId)}>{families.map((family) => <option key={family.id} value={family.id}>{family.shortName}</option>)}</select></div>
        <h2>{preview.prompt}</h2>
        <div className="preview-data">{preview.parameters.map((parameter) => <span key={parameter.label}><small>{parameter.label}</small>{parameter.value}</span>)}</div>
        <button onClick={() => setSeed((value) => value + 7919)}><Dices size={16} /> Gerar outro enunciado</button>
      </section>
      <section className="practice-families">
        <div className="section-heading-row"><div><span className="section-label">Treino direcionado</span><h2>Escolher uma família</h2></div><span className="table-key">3 templates por família</span></div>
        {families.map((family, index) => {
          const confidence = currentConfidence(state.mastery[family.id])
          return <article key={family.id}><span className="family-rank">{String(index + 1).padStart(2, '0')}</span><div><strong>{family.name}</strong><small>{family.examAppearances}/{family.examCount} exames · {family.historicalPoints.toFixed(1)} valores</small></div><div className="practice-mastery"><i><b style={{ width: `${confidence * 100}%` }} /></i><span>{Math.round(confidence * 100)}%</span></div><Link to={`/study?family=${family.id}`}>Treinar <ArrowRight size={15} /></Link></article>
        })}
      </section>
      <Link className="mixed-strip" to="/mock-exam"><Shuffle size={19} /><span><strong>Modo misto</strong>Intercala famílias sem revelar o método antes da pergunta.</span><ArrowRight size={17} /></Link>
    </div>
  )
}
