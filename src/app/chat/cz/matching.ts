/** Scripted matching deliberately keeps its original whitespace/case semantics; NLU has separate normalization. */
export const normalizeCzChatInput = (input: string) => input.toLowerCase().replace(/\s+/g, ' ').trim()
export const hasCzChatTerm = (normalized: string, terms: readonly string[]) =>
  terms.some((term) => normalized.includes(term))
