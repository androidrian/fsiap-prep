import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Fragment } from 'react'

function render(expression: string, display: boolean) {
  return katex.renderToString(expression, { throwOnError: false, displayMode: display, strict: 'ignore' })
}

/** Texto com matemática em linha entre cifrões: "o campo $E=kq/r^2$ aponta…". */
export function RichText({ text }: { text: string }) {
  const pieces = text.split('$')
  return <>{pieces.map((piece, index) => index % 2 === 1
    ? <span key={index} className="math-inline" dangerouslySetInnerHTML={{ __html: render(piece, false) }} />
    : <Fragment key={index}>{piece}</Fragment>)}</>
}

/** Expressão em destaque (modo display), com deslocamento horizontal em ecrãs estreitos. */
export function MathBlock({ value }: { value: string }) {
  return <div className="math-block" role="math" aria-label={value} dangerouslySetInnerHTML={{ __html: render(value, true) }} />
}
