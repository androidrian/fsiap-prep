export type ToolTab = 'calculator' | 'constants' | 'converter'

const EVENT = 'fsiap:tools'

/** Abre a gaveta de ferramentas a partir de qualquer página. */
export function openTools(tab: ToolTab = 'calculator') {
  window.dispatchEvent(new CustomEvent<ToolTab>(EVENT, { detail: tab }))
}

export function onOpenTools(handler: (tab: ToolTab) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<ToolTab>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
