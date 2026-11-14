import { Activity, BookOpenCheck, BookOpenText, CalendarRange, ChartNoAxesCombined, Dumbbell, FileCheck2, FileText, FlaskConical, Gauge, ListX, Ruler, TimerReset, type LucideIcon } from 'lucide-react'

export interface NavigationLink {
  to: string
  label: string
  icon: LucideIcon
  /** Palavras extra para a pesquisa global. */
  keywords?: string
}

export interface NavigationGroup {
  label: string
  links: NavigationLink[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Estudar',
    links: [
      { to: '/', label: 'Visão geral', icon: Gauge, keywords: 'início dashboard progresso' },
      { to: '/exercises', label: 'Exercícios resolvidos', icon: FileCheck2, keywords: 'fichas tp exames resolução' },
      { to: '/theory', label: 'Teoria e fórmulas', icon: BookOpenText, keywords: 'aulas teóricas formulário resumo' },
      { to: '/simulators', label: 'Laboratório', icon: FlaskConical, keywords: 'simuladores cenários visualizar' },
    ],
  },
  {
    label: 'Treinar',
    links: [
      { to: '/study', label: 'Sessão adaptativa', icon: BookOpenCheck, keywords: 'estudar próxima ação' },
      { to: '/practice', label: 'Banco de treino', icon: Dumbbell, keywords: 'variantes escolha múltipla' },
      { to: '/mock-exam', label: 'Simulado', icon: TimerReset, keywords: 'exame cronometrado' },
      { to: '/diagnostic', label: 'Diagnóstico', icon: Activity },
      { to: '/mistakes', label: 'Caderno de erros', icon: ListX },
    ],
  },
  {
    label: 'Consultar',
    links: [
      { to: '/formula-sheet', label: 'Formulário oficial', icon: FileText, keywords: 'pdf constantes' },
      { to: '/units', label: 'Guia de unidades', icon: Ruler, keywords: 'conversão si' },
      { to: '/analysis', label: 'Mapa do exame', icon: ChartNoAxesCombined, keywords: 'cobertura famílias histórico' },
      { to: '/study-plan', label: 'Plano de estudo', icon: CalendarRange },
    ],
  },
]
