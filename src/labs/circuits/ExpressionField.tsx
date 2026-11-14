/** Campo de texto para a expressão s(…)/p(…), com mensagem de validação. */
export function ExpressionField({ label, value, onChange, error, hint }: { label: string; value: string; onChange: (value: string) => void; error: string | null; hint: string }) {
  return (
    <label className="lab-circuits-expr">
      <span>{label}</span>
      <input type="text" value={value} spellCheck={false} autoComplete="off" autoCapitalize="off" aria-label={label} aria-invalid={error ? true : undefined} onChange={(event) => onChange(event.target.value)} />
      {error
        ? <small className="lab-circuits-expr-error" role="alert">{error} O esquema mostra a última associação válida.</small>
        : <small>{hint}</small>}
    </label>
  )
}
