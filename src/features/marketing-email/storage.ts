import {
  assertDocument,
  clone,
  newId,
  parseDocument,
  serializeDocument,
  type EmailBlock,
  type EmailDocument,
  type EmailSection,
  MAX_JSON_BYTES,
} from './model'
import { createDocument } from './catalog'
import { copyBlock, copySection, editDocument } from './transforms'

export const DRAFT_KEY = 'cee.marketing-email.draft.v1'
export const LIBRARY_KEY = 'cee.marketing-email.library.v1'
export interface LocalStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
export interface StorageResult<T> {
  value: T | null
  error?: string
}
export type LibraryPayload =
  | { type: 'block'; block: EmailBlock }
  | { type: 'section'; section: EmailSection }
  | { type: 'template'; document: EmailDocument }
export interface LibraryEntry {
  id: string
  version: 1
  name: string
  payload: LibraryPayload
}
function storageError(e: unknown): string {
  return `Local storage is unavailable: ${e instanceof Error ? e.message : 'unknown error'}. Export the document JSON to keep your work.`
}
export function readDraft(store: LocalStore): StorageResult<EmailDocument> {
  try {
    const raw = store.getItem(DRAFT_KEY)
    return { value: raw === null ? null : parseDocument(raw) }
  } catch (e) {
    return { value: null, error: storageError(e) }
  }
}
export function saveDraft(store: LocalStore, doc: EmailDocument): StorageResult<EmailDocument> {
  try {
    const serialized = serializeDocument(doc)
    parseDocument(serialized)
    store.setItem(DRAFT_KEY, serialized)
    return { value: doc }
  } catch (e) {
    return { value: null, error: storageError(e) }
  }
}
function assertEntry(value: unknown): asserts value is LibraryEntry {
  if (!value || typeof value !== 'object') throw new Error('Invalid library entry.')
  const entry = value as LibraryEntry
  if (
    Object.keys(entry).some((k) => !['id', 'version', 'name', 'payload'].includes(k)) ||
    typeof entry.id !== 'string' ||
    !/^[\w-]{1,120}$/.test(entry.id) ||
    entry.version !== 1 ||
    typeof entry.name !== 'string' ||
    !entry.name.trim() ||
    entry.name.length > 200 ||
    !entry.payload ||
    typeof entry.payload !== 'object'
  )
    throw new Error('Incompatible library version or structure.')
  const p = entry.payload
  const doc = createDocument('blank')
  if (p.type === 'block' && Object.keys(p).length === 2) doc.sections[0]!.columns[0]!.blocks = [p.block]
  else if (p.type === 'section' && Object.keys(p).length === 2) doc.sections = [p.section]
  else if (p.type === 'template' && Object.keys(p).length === 2) {
    assertDocument(p.document)
    return
  } else throw new Error('Unsupported library entry type.')
  assertDocument(doc)
}
export function parseLibrary(json: string): LibraryEntry[] {
  if (new TextEncoder().encode(json).length > MAX_JSON_BYTES) throw new Error('Library exceeds 1 MB.')
  const data = JSON.parse(json) as { format?: unknown; version?: unknown; entries?: unknown }
  if (
    !data ||
    data.format !== 'marketing-email-library' ||
    data.version !== 1 ||
    !Array.isArray(data.entries) ||
    data.entries.length > 40
  )
    throw new Error('Incompatible library (maximum 40 entries).')
  data.entries.forEach(assertEntry)
  if (new Set(data.entries.map((e) => e.id)).size !== data.entries.length)
    throw new Error('Duplicate library identifiers.')
  return data.entries
}
export function serializeLibrary(entries: LibraryEntry[]): string {
  return JSON.stringify({ format: 'marketing-email-library', version: 1, entries }, null, 2)
}
export function readLibrary(store: LocalStore): StorageResult<LibraryEntry[]> {
  try {
    const raw = store.getItem(LIBRARY_KEY)
    return { value: raw === null ? [] : parseLibrary(raw) }
  } catch (e) {
    return { value: null, error: storageError(e) }
  }
}
export function saveLibrary(store: LocalStore, entries: LibraryEntry[]): StorageResult<LibraryEntry[]> {
  try {
    const json = serializeLibrary(entries)
    parseLibrary(json)
    store.setItem(LIBRARY_KEY, json)
    return { value: entries }
  } catch (e) {
    return { value: null, error: storageError(e) }
  }
}
export function createLibraryEntry(name: string, payload: LibraryPayload): LibraryEntry {
  const entry: LibraryEntry = { id: newId('library'), version: 1, name, payload: clone(payload) }
  assertEntry(entry)
  return entry
}
/** Insertion always snapshots/rekeys; editing a library entry never updates earlier insertions. */
export function insertLibraryEntry(doc: EmailDocument, entry: LibraryEntry, columnId?: string): EmailDocument {
  assertEntry(entry)
  const p = entry.payload,
    origin = { entryId: entry.id, version: entry.version }
  if (p.type === 'template') {
    const result = clone(p.document)
    result.id = newId('email')
    result.revision = doc.revision + 1
    result.sections = result.sections.map((s) => ({ ...copySection(s), origin }))
    return result
  }
  return editDocument(doc, (draft) => {
    if (p.type === 'section') draft.sections.push({ ...copySection(p.section), origin })
    else {
      const col = draft.sections
        .flatMap((s) => s.columns)
        .find((c) => c.id === (columnId ?? draft.sections[0]!.columns[0]!.id))
      if (!col) throw new Error('The insertion column no longer exists.')
      col.blocks.push({ ...copyBlock(p.block), origin })
    }
  })
}
