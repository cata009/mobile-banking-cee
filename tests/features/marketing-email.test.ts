// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { createDocument, createBlock, createSection } from '@/features/marketing-email/catalog'
import { parseDocument, serializeDocument, assertDocument } from '@/features/marketing-email/model'
import { validateDocument, isPublicUrl } from '@/features/marketing-email/validation'
import {
  moveBlock,
  duplicateBlock,
  createHistory,
  commitHistory,
  undoHistory,
  redoHistory,
  copySection,
  editDocument,
} from '@/features/marketing-email/transforms'
import { compileEmail, previewHtml } from '@/features/marketing-email/compiler'
import { createEmailPackage } from '@/features/marketing-email/export'
import {
  EMAIL_ICON_OPTIONS,
  selectEmailIcon,
  getEmailIconFamilies,
  resolveEmailIcon,
} from '@/features/marketing-email/iconCatalog'
import {
  readDraft,
  saveDraft,
  readLibrary,
  saveLibrary,
  createLibraryEntry,
  insertLibraryEntry,
} from '@/features/marketing-email/storage'

function readyDocument() {
  const doc = createDocument('offer')
  doc.config.unsubscribeUrl = 'https://example.com/unsubscribe'
  doc.config.senderAddress = 'Example Bank, Strada Exemplu 1, București'
  for (const section of doc.sections)
    for (const column of section.columns)
      for (const block of column.blocks) {
        if (block.kind === 'cta' || block.kind === 'offer') block.content.url = 'https://example.com/offer?a=1&b=2'
      }
  return doc
}

describe('marketing email document and editing policies', () => {
  it.each(['10183:65738', '10183:65741', '10183:65744', '10183:65748', '10183:65751', '10183:65754'])(
    'preserves a saved legacy DS alias %s without duplicating picker tiles',
    async (variantId) => {
      const doc = readyDocument(),
        icon = createBlock('icon')
      selectEmailIcon(icon, variantId, 32)
      icon.content.imageUrl = 'https://example.com/legacy-education.png'
      doc.sections[0]!.columns[0]!.blocks.push(icon)
      expect(
        resolveEmailIcon(parseDocument(serializeDocument(doc)).sections[0]!.columns[0]!.blocks.at(-1)!.icon!.variantId),
      ).toBeDefined()
      expect(getEmailIconFamilies().some((source) => source.icon.includes('compatibility'))).toBe(false)
      expect((await compileEmail(doc)).report.issues.filter((issue) => issue.severity === 'error')).toHaveLength(0)
    },
  )
  it('offers the actual DS application, PFM and composite collections with source-aware filtering and stable IDs', async () => {
    expect(getEmailIconFamilies().length).toBeGreaterThanOrEqual(200)
    expect(EMAIL_ICON_OPTIONS.length).toBeGreaterThanOrEqual(300)
    expect(resolveEmailIcon('10183:65552')?.kind).toBe('canonical')
    expect(resolveEmailIcon('app:payment-scan-qr')?.kind).toBe('app')
    expect(resolveEmailIcon('pfm:income:category-circle')?.kind).toBe('pfm')
    expect(resolveEmailIcon('9382:18711')?.kind).toBe('canonical')
    expect(
      getEmailIconFamilies({ query: 'scan qr', theme: 'light', source: 'app' }).some(
        (i) => i.variantId === 'app:payment-scan-qr',
      ),
    ).toBe(true)
    expect(
      getEmailIconFamilies({ query: 'scan qr', theme: 'dark', source: 'app' }).some(
        (i) => i.variantId === 'app:payment-scan-qr',
      ),
    ).toBe(true)
    expect(getEmailIconFamilies({ source: 'pfm' })).toHaveLength(19)
    const doc = readyDocument(),
      icon = createBlock('icon')
    selectEmailIcon(icon, 'app:payment-scan-qr', 48)
    icon.content.imageUrl = 'https://example.com/qr.png'
    doc.sections[0]!.columns[0]!.blocks.push(icon)
    expect(parseDocument(serializeDocument(doc)).sections[0]!.columns[0]!.blocks.at(-1)!.icon?.variantId).toBe(
      'app:payment-scan-qr',
    )
    const compiled = await compileEmail(doc)
    expect(compiled.report.issues.filter((i) => i.severity === 'error')).toHaveLength(0)
    expect(createEmailPackage(doc, compiled).length).toBeGreaterThan(0)
  })
  it('rejects a draft that could no longer round trip through the 1 MB editable format', () => {
    const doc = readyDocument()
    const col = doc.sections[0]!.columns[0]!
    for (let i = 0; i < 110; i++) {
      const b = createBlock('text')
      b.content.text = 'x'.repeat(10000)
      col.blocks.push(b)
    }
    expect(() => assertDocument(doc)).toThrow(/large/i)
  })
  it.each([
    'https://localhost./image.png',
    'https://assets.local./image.png',
    'https://100.64.0.1/a.png',
    'https://198.18.0.1/a.png',
    'https://192.0.2.4/a.png',
    'https://224.0.0.1/a.png',
  ])('rejects non-public asset address %s', (url) => {
    expect(isPublicUrl(url, [], 'image')).toBe(false)
  })
  it('requires HTTPS or a declared whole variable for unsubscribe regardless of scheme case', () => {
    const doc = readyDocument()
    doc.config.unsubscribeUrl = 'MAILTO:a@example.com'
    expect(validateDocument(doc).some((i) => i.severity === 'error' && i.code === 'url')).toBe(true)
    doc.config.unsubscribeUrl = '{{unsubscribe_url}}'
    doc.config.variables = ['unsubscribe_url']
    expect(validateDocument(doc).filter((i) => i.severity === 'error')).toHaveLength(0)
  })
  it('keeps canonical DS icon identity and size, rejects unknown artwork and requires a public email asset', async () => {
    const doc = readyDocument(),
      icon = createBlock('icon')
    const source = EMAIL_ICON_OPTIONS[0]!
    selectEmailIcon(icon, source.variantId, 64)
    doc.sections[0]!.columns[0]!.blocks.push(icon)
    expect(icon.icon).toEqual({ variantId: source.variantId, size: 64 })
    expect(icon.content.width).toBe(64)
    expect(validateDocument(doc).some((i) => i.blockId === icon.id && i.code === 'resource')).toBe(true)
    icon.content.imageUrl = 'https://example.com/approved-icon.png'
    icon.content.alt = `${source.icon} approved description`
    selectEmailIcon(icon, source.variantId, 64)
    expect(icon.content.alt).toBe(`${source.icon} approved description`)
    expect(icon.content.imageUrl).toBe('https://example.com/approved-icon.png')
    expect(parseDocument(serializeDocument(doc)).sections[0]!.columns[0]!.blocks.at(-1)!.icon).toEqual(icon.icon)
    const result = await compileEmail(doc)
    expect(result.html).toContain('width="64"')
    expect(result.text).toContain(source.icon)
    expect(() => selectEmailIcon(icon, 'missing', 32)).toThrow()
    icon.icon!.variantId = 'missing'
    expect(validateDocument(doc).some((i) => i.code === 'icon')).toBe(true)
  })
  it('round trips a bounded versioned document with stable IDs and rejects future versions', () => {
    const doc = createDocument('offer')
    expect(parseDocument(serializeDocument(doc))).toEqual(doc)
    expect(() => parseDocument(JSON.stringify({ ...doc, version: 99 }))).toThrow(/version/i)
    expect(() => parseDocument('{')).toThrow()
    const duplicate = structuredClone(doc)
    duplicate.sections[0]!.columns[0]!.blocks.push(duplicate.sections[0]!.columns[0]!.blocks[0]!)
    expect(() => parseDocument(JSON.stringify(duplicate))).toThrow(/identifier/i)
    expect(() => parseDocument(JSON.stringify({ ...doc, sections: [{ ...doc.sections[0], columns: [] }] }))).toThrow()
    expect(() => parseDocument(' '.repeat(1_000_001))).toThrow(/large/i)
    const nested = structuredClone(doc)
    Object.assign(nested.sections[0]!.columns[0]!.blocks[0]!, { children: [] })
    expect(() => parseDocument(JSON.stringify(nested))).toThrow()
  })

  it('moves between columns, preserves identity and order, duplicates with fresh IDs and tracks undo/redo', () => {
    const doc = readyDocument()
    const unchanged = editDocument(doc, (draft) => {
      draft.subject = doc.subject
    })
    expect(unchanged).toBe(doc)
    expect(commitHistory(createHistory(doc), unchanged).past).toHaveLength(0)
    const source = doc.sections[0]!.columns[0]!
    const id = source.blocks[0]!.id
    const section = createSection(2)
    doc.sections.push(section)
    const moved = moveBlock(doc, id, section.columns[1]!.id, 0)
    expect(moved.sections.at(-1)!.columns[1]!.blocks[0]!.id).toBe(id)
    expect(moved.sections[0]!.columns[0]!.blocks.some((b) => b.id === id)).toBe(false)
    const duplicated = duplicateBlock(moved, id)
    expect(duplicated.sections.at(-1)!.columns[1]!.blocks).toHaveLength(2)
    expect(new Set(duplicated.sections.at(-1)!.columns[1]!.blocks.map((b) => b.id)).size).toBe(2)
    const history = commitHistory(createHistory(doc), moved)
    expect(undoHistory(history).present).toEqual(doc)
    expect(redoHistory(undoHistory(history)).present).toEqual(moved)
    expect(commitHistory(undoHistory(history), duplicated).future).toHaveLength(0)
    expect(copySection(doc.sections[0]!).id).not.toBe(doc.sections[0]!.id)
    expect(moveBlock(doc, 'missing', section.columns[0]!.id, 0)).toBe(doc)
  })

  it('blocks missing CTA/unsubscribe and unsafe or local resources; distinguishes warnings and variables', () => {
    expect(validateDocument(createDocument('offer')).some((i) => i.severity === 'error')).toBe(true)
    const doc = readyDocument()
    expect(validateDocument(doc).filter((i) => i.severity === 'error')).toHaveLength(0)
    const image = createBlock('hero')
    image.content.imageUrl = 'blob:local'
    image.content.alt = 'Ofertă'
    doc.sections[0]!.columns[0]!.blocks.push(image)
    expect(validateDocument(doc).some((i) => i.code === 'resource' && i.blockId === image.id)).toBe(true)
    image.content.imageUrl = 'https://example.com/hero.png'
    image.content.darkImageUrl = 'javascript:alert(1)'
    expect(validateDocument(doc).some((i) => i.code === 'resource')).toBe(true)
    image.content.darkImageUrl = ''
    doc.config.unsubscribeUrl = '{{unsubscribe_url}}'
    expect(validateDocument(doc).some((i) => i.code === 'variable')).toBe(true)
    doc.config.variables = ['unsubscribe_url']
    expect(validateDocument(doc).filter((i) => i.severity === 'error')).toHaveLength(0)
    expect(validateDocument(doc).some((i) => i.severity === 'warning')).toBe(true)
    image.content.imageUrl = 'https://localhost/hero.png'
    expect(validateDocument(doc).some((i) => i.code === 'resource')).toBe(true)
  })
})

describe('marketing email compiler and exports', () => {
  it('applies the dark divider accent to its visible border', async () => {
    const doc = readyDocument(),
      divider = createBlock('divider')
    divider.style.accent.dark = '#fedcba'
    doc.sections[0]!.columns[0]!.blocks.push(divider)
    const result = await compileEmail(doc)
    expect(previewHtml(doc, result, 'dark', true)).toContain(`.b-${divider.id} p{border-color:#fedcba!important}`)
  })
  it('uses the intended smaller footer text without duplicate MJML attributes', async () => {
    const doc = readyDocument(),
      result = await compileEmail(doc)
    const footer = doc.sections.at(-1)!.columns[0]!.blocks.find((b) => b.kind === 'footer')!
    const html = new DOMParser().parseFromString(result.html, 'text/html')
    expect((html.querySelector(`.b-${footer.id} div`) as HTMLElement).style.fontSize).toBe('12px')
  })
  it('renders all supported blocks and preserves real image dimensions and alternate dark sources', async () => {
    const doc = readyDocument()
    const hero = createBlock('hero')
    hero.content.imageUrl = 'https://example.com/hero.png'
    hero.content.darkImageUrl = 'https://example.com/dark.png'
    hero.content.width = 600
    hero.content.height = 300
    const header = doc.sections[0]!.columns[0]!.blocks[0]!
    header.content.imageUrl = 'https://example.com/logo.png'
    header.content.alt = 'Logo'
    header.content.secondaryImageUrl = 'https://example.com/partner.png'
    header.content.secondaryAlt = 'Partener'
    doc.sections[0]!.columns[0]!.blocks.push(hero, createBlock('divider'), createBlock('spacer'), createBlock('list'))
    const result = await compileEmail(doc)
    const parsed = new DOMParser().parseFromString(result.html, 'text/html')
    const img = parsed.querySelector('img[src="https://example.com/hero.png"]')!
    expect(img.getAttribute('height')).toMatch(/^\d+$/)
    expect(img.getAttribute('alt')).toBe(hero.content.alt)
    expect(result.report.resources).toHaveLength(4)
    expect(result.report.issues.filter((i) => i.code === 'compiler')).toHaveLength(0)
    expect(previewHtml(doc, result, 'dark', true)).toContain('display:table-cell!important')
    expect(previewHtml(doc, result, 'light', false)).not.toContain('src="https://example.com/hero.png"')
  })
  it('compiles escaped responsive HTML with dark theme, conditional comments, real links and matching text/ZIP', async () => {
    const doc = readyDocument()
    const text = createBlock('text')
    text.content.text = '<script>alert(1)</script> & {{first_name}}'
    doc.config.variables = ['first_name']
    doc.sections[0]!.columns[0]!.blocks.push(text)
    const result = await compileEmail(doc)
    expect(result.html).toContain('&lt;script&gt;')
    expect(result.html).not.toContain('<script>')
    expect(result.html).toContain('{{first_name}}')
    expect(result.html).toContain('prefers-color-scheme')
    expect(result.html).toContain('color-scheme')
    expect(result.html).toContain('<!--[if mso')
    expect(result.html).toContain('a=1&amp;b=2')
    const preview = new DOMParser().parseFromString(previewHtml(doc, result, 'light', true), 'text/html')
    expect([...preview.querySelectorAll('a')].every((anchor) => !anchor.hasAttribute('href'))).toBe(true)
    expect(result.text).toContain('https://example.com/unsubscribe')
    expect(result.report.htmlBytes).toBe(new TextEncoder().encode(result.html).length)
    expect(result.report.realClientTests).toBe('not-run')
    const zip = unzipSync(createEmailPackage(doc, result))
    expect(Object.keys(zip)).toEqual(['email.html', 'email.txt', 'document.json', 'report.json'])
    expect(strFromU8(zip['email.html']!)).toBe(result.html)
    expect(parseDocument(strFromU8(zip['document.json']!))).toEqual(doc)
    doc.subject = 'Later edit'
    expect(() => createEmailPackage(doc, result)).toThrow(/revision/i)
  })

  it('refuses final export with validation errors even when compilation is available for editing', async () => {
    const doc = createDocument('offer')
    const result = await compileEmail(doc)
    expect(() => createEmailPackage(doc, result)).toThrow(/errors/i)
    expect(result.report.issues.some((i) => i.severity === 'error')).toBe(true)
  })
})

describe('marketing email local persistence and copy library', () => {
  it('handles absent, corrupt, incompatible and unavailable storage without overwriting data', () => {
    localStorage.clear()
    expect(readDraft(localStorage).value).toBeNull()
    const doc = readyDocument()
    expect(saveDraft(localStorage, doc).error).toBeUndefined()
    expect(readDraft(localStorage).value).toEqual(doc)
    const storage = {
      getItem: () => '{bad',
      setItem: () => {
        throw new Error('quota')
      },
    }
    expect(readDraft(storage).error).toBeTruthy()
    expect(saveDraft(storage, doc).error).toBeTruthy()
    expect(
      readDraft({
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {},
      }).error,
    ).toBeTruthy()
  })

  it('stores independent versioned copies of blocks, sections and templates and rekeys insertion', () => {
    localStorage.clear()
    const doc = readyDocument()
    const block = doc.sections[0]!.columns[0]!.blocks[0]!
    const entry = createLibraryEntry('Header saved', { type: 'block', block })
    block.content.text = 'Changed later'
    expect(entry.payload.type === 'block' && entry.payload.block.content.text).not.toBe('Changed later')
    expect(saveLibrary(localStorage, [entry]).error).toBeUndefined()
    const restored = readLibrary(localStorage).value!
    const inserted = insertLibraryEntry(doc, restored[0]!, doc.sections[0]!.columns[0]!.id)
    const copy = inserted.sections[0]!.columns[0]!.blocks.at(-1)!
    expect(copy.id).not.toBe(block.id)
    expect(copy.origin).toEqual({ entryId: entry.id, version: 1 })
    const sectionEntry = createLibraryEntry('Secțiune', { type: 'section', section: doc.sections[0]! })
    expect(insertLibraryEntry(doc, sectionEntry).sections).toHaveLength(doc.sections.length + 1)
    const templateEntry = createLibraryEntry('Template', { type: 'template', document: doc })
    expect(insertLibraryEntry(doc, templateEntry).id).not.toBe(doc.id)
    expect(() => insertLibraryEntry(doc, entry, 'missing')).toThrow()
  })
})
