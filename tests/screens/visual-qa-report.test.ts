import { unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { buildVisualQaDocument, buildVisualQaHtml, buildVisualQaWord } from '@/app/screens/tools/visualQaReport'

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aWQAAAAASUVORK5CYII='
const report = {
  context: 'Romania · Cards',
  screenshotName: 'credit-card.png',
  observations: ['1. Installments plan appears in the app only'],
  notes: 'Review against approved design.',
  description: 'The card title is misplaced.',
  expectedBehavior: 'The title is aligned with the card.',
  actualBehavior: 'The title overlaps the card.',
  referencePng: png,
  actualPng: png,
}

describe('visual QA reports', () => {
  it('includes the aligned comparison and preserves the original screenshot when alignment changes', async () => {
    const alignedReport = { ...report, alignedActualPng: png }
    const document = buildVisualQaDocument(alignedReport)
    expect(document.blocks.filter((block) => block.kind === 'image')).toHaveLength(3)
    const html = buildVisualQaHtml(alignedReport)
    expect(html).toContain('App screenshot with alignment')
    expect(html).toContain('Original app screenshot')
    expect(html).toContain('App screenshot with alignment and markers')
    expect(html).not.toContain('Demo reference with markers')
    expect(html.match(/data:image\/png;base64,/g)).toHaveLength(3)
    const files = unzipSync(new Uint8Array(await buildVisualQaWord(alignedReport).arrayBuffer()))
    expect(Object.keys(files).filter((name) => name.startsWith('word/media/'))).toHaveLength(3)
  })
  it('includes manual observations and the two screenshots in an editable Word document', async () => {
    const document = buildVisualQaDocument(report)
    expect(document.blocks.filter((block) => block.kind === 'image')).toHaveLength(2)
    const blob = buildVisualQaWord(report)
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()))
    const xml = new TextDecoder().decode(files['word/document.xml'])
    expect(xml).toContain('Installments plan appears in the app only')
    expect(xml).toContain('The title is aligned with the card.')
    expect(xml).toContain('The title overlaps the card.')
    expect(Object.keys(files).filter((name) => name.startsWith('word/media/'))).toHaveLength(2)
    expect(xml).not.toContain('Pixel differences')
  })

  it('escapes notes in HTML and includes the evidence images', () => {
    const html = buildVisualQaHtml({ ...report, description: '<script>not markup</script>' })
    expect(html).toContain('&lt;script&gt;not markup&lt;/script&gt;')
    expect(html.match(/data:image\/png;base64,/g)).toHaveLength(2)
    expect(html).not.toContain('Pixel differences')
    expect(html).toContain('Installments plan appears in the app only')
    expect(html).toContain('The title is aligned with the card.')
    expect(html).toContain('The title overlaps the card.')
    expect(html).toContain('App screenshot with markers')
    expect(html).not.toContain('Demo reference with markers')
  })
})
