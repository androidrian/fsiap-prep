import katex from 'katex'
import 'katex/dist/katex.min.css'

export function Formula({ value, display = false }: { value: string; display?: boolean }) {
  return <span className="formula" dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false, displayMode: display }) }} />
}
