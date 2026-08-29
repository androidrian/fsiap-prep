import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { familyById } from '../data/analysis'
import { rankFamilies } from '../domain/study/studyEngine'
import { useProgress } from '../storage/ProgressContext'

export function StudyPlanPage() {
  const { state } = useProgress()
  const daysLeft = Math.max(1, Math.ceil((new Date(`${state.settings.examDate}T12:00:00`).getTime() - Date.now()) / 86_400_000))
  const ranked = rankFamilies(state)
  const days = Array.from({ length: Math.min(7, daysLeft) }, (_, index) => {
    const family = familyById[ranked[index % Math.min(5, ranked.length)].id]
    const activity = index === 6 ? 'Simulado completo e correção' : index === 5 ? 'Modo misto + caderno de erros' : index >= 3 ? 'Prática autónoma e retenção' : 'Compreender + variantes guiadas'
    return { number: index + 1, family, activity, minutes: state.settings.dailyMinutes }
  })
  return <div className="page plan-page"><section className="page-heading"><div><p className="eyebrow">Plano adaptado ao tempo disponível</p><h1>Os próximos sete dias, decididos.</h1><p className="lede">O plano reorganiza-se com o domínio, revisões vencidas e resultados dos simulados.</p></div></section><section className="plan-overview"><div><CalendarDays size={18} /><span>Exame em<strong>{daysLeft} dias</strong></span></div><div><Clock3 size={18} /><span>Ritmo diário<strong>{state.settings.dailyMinutes} minutos</strong></span></div><div><Target size={18} /><span>Meta de cobertura<strong>{state.settings.preparationTarget}/20</strong></span></div></section><section className="week-plan"><div className="week-line" />{days.map((day) => <article key={day.number}><span className="day-number">D{String(day.number).padStart(2, '0')}</span><div><small>{day.activity}</small><h2>{day.family.name}</h2><p>{day.family.recognition}</p></div><div className="day-time"><Clock3 size={14} /> {day.minutes} min</div><Link to={day.number === 7 ? '/mock-exam' : `/study?family=${day.family.id}`}>Começar <ArrowRight size={14} /></Link></article>)}</section><div className="plan-footer"><CheckCircle2 size={18} /><p><strong>Critério de conclusão:</strong> não basta abrir a sessão. O dia conta quando resolves uma variante nova sem ajuda ou completas a revisão agendada.</p></div></div>
}
