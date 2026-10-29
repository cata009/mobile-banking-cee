import type { SpecAsset, SpecDocument, SpecNode } from '@/features/flow-spec/types'
import { safeSpecLink } from '@/features/flow-spec/schema.mjs'

interface RichDocxContext {
  image(asset: SpecAsset, alt: string, width?: number): string
  link(href: string): string
  list(ordered: boolean, start: number, depth: number): number
}
const xml = (value: string) =>
  Array.from(value)
    .filter((char) => char.charCodeAt(0) >= 32 || ['\t', '\n', '\r'].includes(char))
    .join('')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** Semantic OOXML, preserving editable text and original attachment bytes. */
export function renderRichDocx(doc: SpecDocument, assets: readonly SpecAsset[], context: RichDocxContext): string {
  const inline = (node: SpecNode): string => {
    if (node.type === 'hardBreak') return '<w:r><w:br/></w:r>'
    if (node.type === 'specStatus')
      return `<w:r><w:rPr><w:b/></w:rPr><w:t>${xml(String(node.attrs?.label ?? 'Status'))}</w:t></w:r>`
    const properties = (node.marks ?? [])
      .map(
        (m) =>
          ({
            bold: '<w:b/>',
            italic: '<w:i/>',
            underline: '<w:u w:val="single"/>',
            strike: '<w:strike/>',
            code: '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>',
            highlight: '<w:highlight w:val="yellow"/>',
          })[m.type] ??
          (m.type === 'specTextColor' && /^#[0-9a-f]{6}$/i.test(String(m.attrs?.color))
            ? `<w:color w:val="${String(m.attrs?.color).slice(1)}"/>`
            : ''),
      )
      .join('')
    let run = `<w:r>${properties ? `<w:rPr>${properties}</w:rPr>` : ''}<w:t xml:space="preserve">${xml(node.text ?? '')}</w:t></w:r>`
    const link = node.marks?.find((m) => m.type === 'link')
    if (link && safeSpecLink(link.attrs?.href))
      run = `<w:hyperlink r:id="${context.link(link.attrs.href)}">${run}</w:hyperlink>`
    return run
  }
  const render = (node: SpecNode, list?: { id: number; depth: number }): string => {
    const children = () => (node.content ?? []).map((n) => render(n, list)).join('')
    if (node.type === 'doc') return children()
    if (['paragraph', 'heading', 'codeBlock'].includes(node.type)) {
      const style = node.type === 'heading' ? `<w:pStyle w:val="Heading${node.attrs?.level ?? 2}"/>` : ''
      const align = ['left', 'right', 'center', 'justify'].includes(String(node.attrs?.textAlign))
        ? `<w:jc w:val="${node.attrs?.textAlign === 'justify' ? 'both' : node.attrs?.textAlign}"/>`
        : ''
      const num = list
        ? `<w:numPr><w:ilvl w:val="${Math.min(8, list.depth)}"/><w:numId w:val="${list.id}"/></w:numPr>`
        : ''
      return `<w:p><w:pPr>${style}${align}${num}</w:pPr>${(node.content ?? []).map(inline).join('')}</w:p>`
    }
    if (['bulletList', 'orderedList'].includes(node.type)) {
      const depth = Math.min(8, list ? list.depth + 1 : 0)
      const id = context.list(node.type === 'orderedList', Number(node.attrs?.start) || 1, depth)
      return (node.content ?? []).map((n) => render(n, { id, depth })).join('')
    }
    if (node.type === 'listItem') return children()
    if (node.type === 'table') {
      const columns = Math.max(
        1,
        ...(node.content ?? []).map((row) =>
          (row.content ?? []).reduce((sum, cell) => sum + Number(cell.attrs?.colspan ?? 1), 0),
        ),
      )
      const rows = node.content ?? []
      const pending: { remaining: number; span: number }[] = []
      const body = rows
        .map((row) => {
          let col = 0
          const cells: string[] = []
          const continueMerged = () => {
            while (pending[col]?.remaining) {
              const entry = pending[col]!
              cells.push(
                `<w:tc><w:tcPr>${entry.span > 1 ? `<w:gridSpan w:val="${entry.span}"/>` : ''}<w:vMerge/></w:tcPr><w:p/></w:tc>`,
              )
              entry.remaining--
              col += entry.span
            }
          }
          for (const cell of row.content ?? []) {
            continueMerged()
            const span = Number(cell.attrs?.colspan ?? 1),
              rowspan = Number(cell.attrs?.rowspan ?? 1)
            const props = `${span > 1 ? `<w:gridSpan w:val="${span}"/>` : ''}${rowspan > 1 ? '<w:vMerge w:val="restart"/>' : ''}${cell.type === 'tableHeader' ? '<w:shd w:fill="E8EFF2"/>' : ''}`
            cells.push(
              `<w:tc><w:tcPr>${props}</w:tcPr>${(cell.content ?? []).map((n) => render(cell.attrs?.align && ['paragraph', 'heading'].includes(n.type) ? { ...n, attrs: { ...n.attrs, textAlign: n.attrs?.textAlign ?? cell.attrs.align } } : n)).join('')}<w:p/></w:tc>`,
            )
            if (rowspan > 1) pending[col] = { remaining: rowspan - 1, span }
            col += span
          }
          continueMerged()
          return `<w:tr>${cells.join('')}</w:tr>`
        })
        .join('')
      return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((side) => `<w:${side} w:val="single" w:sz="4" w:color="CCD5DA"/>`).join('')}</w:tblBorders></w:tblPr><w:tblGrid>${'<w:gridCol w:w="2400"/>'.repeat(columns)}</w:tblGrid>${body}</w:tbl><w:p/>`
    }
    if (node.type === 'image') {
      const asset = assets.find((a) => a.id === node.attrs?.assetId)
      if (!asset) throw new Error('An image attachment is missing. Reload before exporting.')
      return context.image(asset, String(node.attrs?.alt ?? asset.name), Number(node.attrs?.width) || undefined)
    }
    if (node.type === 'horizontalRule')
      return '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4"/></w:pBdr></w:pPr></w:p>'
    if (node.type === 'specPanel' || node.type === 'specExpand') {
      const label =
        node.type === 'specExpand' ? String(node.attrs?.title ?? 'Details') : String(node.attrs?.tone ?? 'Info')
      return `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${xml(label)}</w:t></w:r></w:p>${children()}`
    }
    if (node.type === 'blockquote') return children()
    throw new Error(`Unsupported Word block: ${node.type}`)
  }
  return render(doc)
}
