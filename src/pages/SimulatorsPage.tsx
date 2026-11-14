import { Activity, Atom, CircuitBoard, Flame, FlaskConical, Magnet, Move3d, Orbit, Radio, Waves } from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { familyById } from '../data/analysis'
import { exercisesForLab } from '../data/library'
import { exerciseLabel } from '../domain/study'
import type { FamilyId } from '../domain/types'
import { catalogScenario } from '../labs/catalog'
import { labRegistry, labScenarioCount } from '../labs/registry'

interface SimulatorConfig {
  id: FamilyId
  label: string
  icon: ComponentType<{ size?: number }>
  question: string
  predictions: string[]
  answer: string
}

const simulators: SimulatorConfig[] = [
  { id: 'thermal_transport', label: 'Transferência térmica', icon: Flame, question: 'Se duplicares a espessura, o fluxo aumenta ou diminui?', predictions: ['Aumenta', 'Diminui', 'Mantém-se', 'Não sei'], answer: 'Diminui' },
  { id: 'thermal_equilibrium', label: 'Calorimetria', icon: FlaskConical, question: 'Se houver mais água fria, a temperatura final aproxima-se de que lado?', predictions: ['Da água fria', 'Da água quente', 'Fica igual', 'Não sei'], answer: 'Da água fria' },
  { id: 'electrostatics', label: 'Eletrostática', icon: Atom, question: 'Se duplicares a distância entre cargas, o que acontece à força?', predictions: ['Fica a metade', 'Fica a um quarto', 'Duplica', 'Não sei'], answer: 'Fica a um quarto' },
  { id: 'uniform_fields', label: 'Campo uniforme', icon: Move3d, question: 'Se mantiveres ΔV e reduzires a distância, o campo fica…', predictions: ['Maior', 'Menor', 'Igual', 'Não sei'], answer: 'Maior' },
  { id: 'dc_circuits', label: 'Circuitos DC', icon: CircuitBoard, question: 'Adicionar um ramo em paralelo faz Req…', predictions: ['Aumentar', 'Diminuir', 'Ficar igual', 'Não sei'], answer: 'Diminuir' },
  { id: 'rc_circuits', label: 'Circuitos RC', icon: Activity, question: 'Ao fim de uma constante de tempo, Vc está mais perto de 5 V ou 10 V?', predictions: ['5 V', '10 V', 'É 0 V', 'Não sei'], answer: '5 V' },
  { id: 'magnetic_particles', label: 'Partículas em B', icon: Orbit, question: 'Se duplicares B, mantendo tudo o resto, o raio…', predictions: ['Duplica', 'Fica metade', 'Quadruplica', 'Não sei'], answer: 'Fica metade' },
  { id: 'induction_sources', label: 'Indução', icon: Magnet, question: 'Se duplicares o número de espiras, a FEM induzida…', predictions: ['Duplica', 'Fica metade', 'Não muda', 'Não sei'], answer: 'Duplica' },
  { id: 'optics', label: 'Ótica', icon: Waves, question: 'Ao entrar num meio com maior índice, o raio aproxima-se de quê?', predictions: ['Da normal', 'Da superfície', 'Não desvia', 'Não sei'], answer: 'Da normal' },
  { id: 'em_waves', label: 'Polarizadores e ondas', icon: Radio, question: 'P₁=0°, P₂=45° e P₃=90°. Para luz não polarizada, que fração de I₀ chega ao fim?', predictions: ['I₀/8', 'Zero', 'I₀/4', 'I₀/2'], answer: 'I₀/8' },
]

export function SimulatorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedFamily = searchParams.get('family') as FamilyId | null
  const active: FamilyId = requestedFamily && familyById[requestedFamily] ? requestedFamily : 'thermal_transport'
  const scenarios = labRegistry[active]
  const requestedScenario = searchParams.get('scenario')
  const scenario = scenarios.find((entry) => entry.id === requestedScenario) ?? scenarios[0]
  const config = simulators.find((simulator) => simulator.id === active)!
  const [prediction, setPrediction] = useState<{ family: FamilyId; option: string } | null>(null)
  const chosen = prediction?.family === active ? prediction.option : null
  const details = catalogScenario(active, scenario.id)
  const related = exercisesForLab(active, scenario.id)
  const params = Object.fromEntries(searchParams.entries())
  const Scenario = scenario.component

  return (
    <div className="page simulators-page">
      <section className="page-heading simulator-heading"><div><p className="eyebrow">10 famílias · {labScenarioCount} cenários</p><h1>Vê a física a acontecer.</h1><p className="lede">Cada diagrama reage aos dados. Abre um cenário a partir de um exercício para o ver já com os valores do enunciado, ou explora livremente.</p></div><div className="sim-count"><strong>{labScenarioCount}</strong><span>cenários interativos</span></div></section>
      <section className="simulator-lab">
        <nav className="simulator-index" aria-label="Simuladores por família">
          {simulators.map(({ id, label, icon: Icon }, index) => <button key={id} className={active === id ? 'active' : ''} aria-current={active === id ? 'true' : undefined} onClick={() => setSearchParams({ family: id })}><span>{String(index + 1).padStart(2, '0')}</span><Icon size={16} /><strong>{label}</strong><em>{labRegistry[id].length}</em></button>)}
        </nav>
        <div className="simulator-main">
          <div className="simulator-title"><div><span className="section-label">Família do exame</span><h2>{familyById[active].name}</h2></div><small>{familyById[active].examAppearances}/{familyById[active].examCount} exames</small></div>
          <div className="scenario-tabs" role="group" aria-label="Cenários desta família">{scenarios.map((entry) => <button key={entry.id} aria-pressed={scenario.id === entry.id} className={scenario.id === entry.id ? 'active' : ''} onClick={() => setSearchParams({ family: active, scenario: entry.id })}>{entry.label}</button>)}</div>
          {details?.summary && <p className="scenario-summary">{details.summary}</p>}
          <div className="simulator-workspace expanded">
            <div className="sim-question">
              <span className="section-label">Pergunta rápida · prevê antes de mexer</span><h2>{config.question}</h2>
              <div className="prediction-options">{config.predictions.map((option) => <button className={chosen === option ? `selected ${option === config.answer ? 'right' : 'wrong'}` : ''} onClick={() => setPrediction({ family: active, option })} key={option}>{option}</button>)}</div>
              {chosen && <p className={`prediction-feedback ${chosen === config.answer ? 'right' : 'wrong'}`} role="status">{chosen === config.answer ? 'Certo — confirma no diagrama.' : `Resposta: ${config.answer}. Mexe nos controlos para veres porquê.`}</p>}
              <p className="sim-evidence">{familyById[active].recognition}</p>
              {related.length > 0 && <div className="sim-related"><span className="section-label">Exercícios que usam este cenário</span><ul>{related.filter(({ exercise }, position) => related.findIndex((item) => item.exercise.id === exercise.id) === position).slice(0, 10).map(({ exercise }) => <li key={exercise.id}><Link to={`/exercises/${exercise.id}`}>{exerciseLabel(exercise)}<small>{exercise.title}</small></Link></li>)}</ul></div>}
            </div>
            <div className="sim-visual revealed">
              <Scenario key={`${active}-${searchParams.toString()}`} params={params} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
