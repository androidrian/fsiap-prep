import { useMemo, useState } from 'react'
import { NetParseError, parseNetwork, type NetNode } from './physics'

function tryParse(text: string): { tree: NetNode | null; error: string | null } {
  try {
    return { tree: parseNetwork(text), error: null }
  } catch (error) {
    if (error instanceof NetParseError) return { tree: null, error: error.message }
    throw error
  }
}

/**
 * Estado de uma expressão s(…)/p(…) editável: guarda o texto escrito e a última árvore válida,
 * para o esquema não desaparecer enquanto a expressão está a meio.
 */
export function useNetExpression(initialText: string, fallbackText: string) {
  const [text, setText] = useState(initialText)
  const [tree, setTree] = useState<NetNode>(() => tryParse(initialText).tree ?? parseNetwork(fallbackText))
  const error = useMemo(() => tryParse(text).error, [text])
  const change = (next: string) => {
    setText(next)
    const parsed = tryParse(next)
    if (parsed.tree) setTree(parsed.tree)
  }
  return { text, tree, error, change }
}
