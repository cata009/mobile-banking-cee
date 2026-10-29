/** Channel-independent content. No React, Tools or experience imports. */
export const BLOCK_KINDS = [
  'header',
  'hero',
  'icon',
  'heading',
  'text',
  'list',
  'cta',
  'offer',
  'benefits',
  'divider',
  'spacer',
  'contact',
  'footer',
] as const
export type BlockKind = (typeof BLOCK_KINDS)[number]
export interface ColorPair {
  light: string
  dark: string
}
export interface EmailStyle {
  background: ColorPair
  text: ColorPair
  accent: ColorPair
  buttonText: ColorPair
}
export interface BlockContent {
  title: string
  text: string
  label: string
  url: string
  imageUrl: string
  darkImageUrl: string
  alt: string
  width: number
  height: number
  items: string[]
  secondaryImageUrl: string
  secondaryAlt: string
  secondaryWidth: number
  secondaryHeight: number
  phone: string
  email: string
}
export interface Origin {
  entryId: string
  version: number
}
export interface EmailBlock {
  id: string
  kind: BlockKind
  content: BlockContent
  style: EmailStyle
  origin?: Origin
  icon?: { variantId: string; size: number }
}
export interface EmailColumn {
  id: string
  blocks: EmailBlock[]
}
export interface EmailSection {
  id: string
  columns: EmailColumn[]
  background: ColorPair
  padding: number
  origin?: Origin
}
export interface EmailConfig {
  country: string
  language: string
  brand: string
  senderAddress: string
  legalText: string
  unsubscribeUrl: string
  variables: string[]
  trackingNote: string
}
export interface EmailDocument {
  format: 'marketing-email'
  version: 1
  id: string
  revision: number
  name: string
  subject: string
  preheader: string
  config: EmailConfig
  sections: EmailSection[]
}
export const MAX_JSON_BYTES = 1_000_000
export const MAX_BLOCKS = 250
export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
export function serializeDocument(doc: EmailDocument): string {
  return JSON.stringify(doc, null, 2)
}
export function documentKey(doc: EmailDocument): string {
  return JSON.stringify(doc)
}

function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some((k) => !keys.includes(k)))
    throw new Error('Unsupported document structure.')
  return value as Record<string, unknown>
}
function string(value: unknown, max = 10000): asserts value is string {
  if (typeof value !== 'string' || value.length > max) throw new Error('Invalid or oversized text field.')
}
function number(value: unknown, min: number, max: number): asserts value is number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max)
    throw new Error('Invalid dimension or revision.')
}
function array(value: unknown, min: number, max: number): asserts value is unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max)
    throw new Error('Unsupported structure or item count.')
}
function pair(value: unknown) {
  const p = record(value, ['light', 'dark'])
  for (const color of [p.light, p.dark])
    if (typeof color !== 'string' || !/^#[\da-f]{6}$/i.test(color)) throw new Error('Invalid color. Use #RRGGBB.')
}
export function assertDocument(value: unknown): asserts value is EmailDocument {
  const d = record(value, ['format', 'version', 'id', 'revision', 'name', 'subject', 'preheader', 'config', 'sections'])
  if (d.format !== 'marketing-email' || d.version !== 1)
    throw new Error('Incompatible document format or version. Version 1 is supported.')
  const ids = new Set<string>()
  const id = (v: unknown) => {
    string(v, 120)
    if (!/^[\w-]+$/.test(v) || ids.has(v)) throw new Error('Missing, invalid or duplicate identifier.')
    ids.add(v)
  }
  const origin = (v: unknown) => {
    if (v === undefined) return
    const o = record(v, ['entryId', 'version'])
    string(o.entryId, 120)
    number(o.version, 1, 1_000_000)
  }
  id(d.id)
  number(d.revision, 0, Number.MAX_SAFE_INTEGER)
  for (const key of ['name', 'subject', 'preheader']) string(d[key], 500)
  const c = record(d.config, [
    'country',
    'language',
    'brand',
    'senderAddress',
    'legalText',
    'unsubscribeUrl',
    'variables',
    'trackingNote',
  ])
  for (const key of ['country', 'language', 'brand', 'senderAddress', 'legalText', 'unsubscribeUrl', 'trackingNote'])
    string(c[key])
  array(c.variables, 0, 50)
  for (const v of c.variables) {
    string(v, 80)
    if (!/^[a-zA-Z_][\w.]*$/.test(v)) throw new Error('Invalid variable name.')
  }
  if (new Set(c.variables).size !== c.variables.length) throw new Error('Duplicate variables.')
  array(d.sections, 1, 40)
  let blocks = 0
  for (const raw of d.sections) {
    const s = record(raw, ['id', 'columns', 'background', 'padding', 'origin'])
    id(s.id)
    origin(s.origin)
    pair(s.background)
    number(s.padding, 0, 64)
    array(s.columns, 1, 2)
    for (const rawCol of s.columns) {
      const col = record(rawCol, ['id', 'blocks'])
      id(col.id)
      array(col.blocks, 0, MAX_BLOCKS)
      for (const rawBlock of col.blocks) {
        if (++blocks > MAX_BLOCKS) throw new Error('Too many blocks. The limit is 250.')
        const b = record(rawBlock, ['id', 'kind', 'content', 'style', 'origin', 'icon'])
        id(b.id)
        origin(b.origin)
        if (!BLOCK_KINDS.includes(b.kind as BlockKind)) throw new Error('Unsupported block type.')
        if (b.icon !== undefined) {
          const icon = record(b.icon, ['variantId', 'size'])
          string(icon.variantId, 120)
          number(icon.size, 12, 128)
        }
        const content = record(b.content, [
          'title',
          'text',
          'label',
          'url',
          'imageUrl',
          'darkImageUrl',
          'alt',
          'width',
          'height',
          'items',
          'secondaryImageUrl',
          'secondaryAlt',
          'secondaryWidth',
          'secondaryHeight',
          'phone',
          'email',
        ])
        for (const key of [
          'title',
          'text',
          'label',
          'url',
          'imageUrl',
          'darkImageUrl',
          'alt',
          'secondaryImageUrl',
          'secondaryAlt',
          'phone',
          'email',
        ])
          string(content[key])
        for (const key of ['width', 'height', 'secondaryWidth', 'secondaryHeight']) number(content[key], 1, 2400)
        array(content.items, 0, 30)
        content.items.forEach((item) => string(item, 1000))
        const style = record(b.style, ['background', 'text', 'accent', 'buttonText'])
        Object.values(style).forEach(pair)
        if (Object.keys(style).length !== 4) throw new Error('Incomplete style.')
      }
    }
  }
  if (new TextEncoder().encode(JSON.stringify(value, null, 2)).length > MAX_JSON_BYTES)
    throw new Error('Document too large (maximum 1 MB in editable format).')
}
export function parseDocument(json: string): EmailDocument {
  if (new TextEncoder().encode(json).length > MAX_JSON_BYTES) throw new Error('File too large (maximum 1 MB).')
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON. Your current draft has been preserved.')
  }
  assertDocument(value)
  return value
}
