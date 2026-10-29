import {
  clone,
  newId,
  assertDocument,
  documentKey,
  type EmailBlock,
  type EmailColumn,
  type EmailDocument,
  type EmailSection,
} from './model'

export interface BlockLocation {
  section: EmailSection
  column: EmailColumn
  block: EmailBlock
  index: number
}
export function locateBlock(doc: EmailDocument, id: string): BlockLocation | undefined {
  for (const section of doc.sections)
    for (const column of section.columns) {
      const index = column.blocks.findIndex((b) => b.id === id)
      const block = column.blocks[index]
      if (block) return { section, column, block, index }
    }
}
export function editDocument(doc: EmailDocument, edit: (draft: EmailDocument) => void): EmailDocument {
  const draft = clone(doc)
  edit(draft)
  if (documentKey(draft) === documentKey(doc)) return doc
  draft.revision = doc.revision + 1
  assertDocument(draft)
  return draft
}
export function copyBlock(block: EmailBlock): EmailBlock {
  return { ...clone(block), id: newId('block') }
}
export function copySection(section: EmailSection): EmailSection {
  return {
    ...clone(section),
    id: newId('section'),
    columns: section.columns.map((c) => ({ id: newId('column'), blocks: c.blocks.map(copyBlock) })),
  }
}
export function moveBlock(doc: EmailDocument, id: string, columnId: string, index: number): EmailDocument {
  const source = locateBlock(doc, id)
  const target = doc.sections.flatMap((s) => s.columns).find((c) => c.id === columnId)
  if (!source || !target || !Number.isInteger(index) || index < 0 || index > target.blocks.length) return doc
  if (source.column.id === columnId && index === source.index) return doc
  return editDocument(doc, (draft) => {
    const from = locateBlock(draft, id)!
    from.column.blocks.splice(from.index, 1)
    draft.sections
      .flatMap((s) => s.columns)
      .find((c) => c.id === columnId)!
      .blocks.splice(index, 0, from.block)
  })
}
export function duplicateBlock(doc: EmailDocument, id: string): EmailDocument {
  if (!locateBlock(doc, id)) return doc
  return editDocument(doc, (draft) => {
    const loc = locateBlock(draft, id)!
    loc.column.blocks.splice(loc.index + 1, 0, copyBlock(loc.block))
  })
}
export interface History {
  past: EmailDocument[]
  present: EmailDocument
  future: EmailDocument[]
}
export function createHistory(doc: EmailDocument): History {
  return { past: [], present: doc, future: [] }
}
export function commitHistory(h: History, next: EmailDocument): History {
  return next === h.present ? h : { past: [...h.past.slice(-49), h.present], present: next, future: [] }
}
export function undoHistory(h: History): History {
  const previous = h.past.at(-1)
  return previous ? { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] } : h
}
export function redoHistory(h: History): History {
  const next = h.future[0]
  return next ? { past: [...h.past, h.present], present: next, future: h.future.slice(1) } : h
}
