import { BookOpenCheck, FileText, Ruler } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const references = [
  { to: '/formula-sheet', label: 'Formulário oficial', icon: FileText },
  { to: '/units', label: 'Guia de unidades', icon: Ruler },
  { to: '/formulas', label: 'Formulário aplicado', icon: BookOpenCheck },
]

export function ReferenceTabs() {
  return (
    <nav className="reference-tabs" aria-label="Referências de exame">
      {references.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to}><Icon size={15} />{label}</NavLink>
      ))}
    </nav>
  )
}
