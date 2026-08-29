export function StatusDot({ status }: { status: 'red' | 'amber' | 'green' }) {
  const labels = { red: 'Lacunas importantes', amber: 'Cobertura em construção', green: 'Meta coberta com consistência' }
  return <span className={`status-dot status-${status}`}><i />{labels[status]}</span>
}
