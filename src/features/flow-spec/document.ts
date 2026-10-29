import type { AnalysisSeed, SpecAsset, SpecDocument, SpecNode } from './types'
import { safeSpecLink } from './schema.mjs'

export const textNode = (text: string): SpecNode[] => (text ? [{ type: 'text', text }] : [])
const paragraph = (text: string): SpecNode => ({ type: 'paragraph', content: textNode(text) })
const heading = (text: string, level = 2): SpecNode => ({ type: 'heading', attrs: { level }, content: textNode(text) })
const table = (rows: readonly (readonly string[])[]): SpecNode => ({
  type: 'table',
  content: rows.map((row) => ({
    type: 'tableRow',
    content: row.map((text) => ({ type: 'tableCell', content: [paragraph(text)] })),
  })),
})

export function seedAnalysisDocument(analysis: AnalysisSeed): SpecDocument {
  const content: SpecNode[] = [heading('General information')]
  if (analysis.generalInformation.length)
    content.push(table(analysis.generalInformation.map((x) => [x.label, x.value])))
  if (analysis.versionContext) content.push(paragraph(analysis.versionContext))
  if (analysis.versionHistory.length)
    content.push(
      heading('Document history', 3),
      table(analysis.versionHistory.map((x) => [x.version, x.date, x.detail])),
    )
  content.push(heading('Open issues'))
  if (analysis.openIssues.length)
    content.push(
      table([
        ['Ref', 'Status', 'Issue', 'Detail'],
        ...analysis.openIssues.map((x) => [x.reference, x.status, x.title, x.detail]),
      ]),
    )
  for (const [label, sections] of [
    ['Requirement', analysis.requirements],
    ['Current status', analysis.currentStatus],
    ['Proposed solution', analysis.proposedSolution],
    ['Non-functional requirements', analysis.nonFunctionalRequirements],
  ] as const) {
    content.push(heading(label))
    for (const section of sections) {
      content.push(heading(section.title, 3))
      if (section.description) content.push(paragraph(section.description))
      if (section.items.length)
        content.push({
          type: 'bulletList',
          content: section.items.map((item) => ({ type: 'listItem', content: [paragraph(item)] })),
        })
    }
  }
  return { type: 'doc', content }
}

export function documentText(node: SpecNode): string {
  return (
    node.text ??
    (node.type === 'image'
      ? String(node.attrs?.alt ?? 'Image')
      : node.type === 'specStatus'
        ? String(node.attrs?.label ?? 'Status')
        : (node.content ?? []).map(documentText).join(['paragraph', 'heading'].includes(node.type) ? '' : '\n'))
  )
}

export function dehydrateDocument(doc: SpecDocument): SpecDocument {
  const clean = (node: SpecNode): SpecNode => {
    const attrs = node.attrs ? { ...node.attrs } : undefined
    if (node.type === 'image' && attrs) delete attrs.src
    return { ...node, ...(attrs ? { attrs } : {}), ...(node.content ? { content: node.content.map(clean) } : {}) }
  }
  return clean(doc) as SpecDocument
}

export function hydrateDocument(doc: SpecDocument, assets: readonly SpecAsset[]): SpecDocument {
  const visit = (node: SpecNode): SpecNode => ({
    ...node,
    ...(node.type === 'image'
      ? { attrs: { ...node.attrs, src: assets.find((a) => a.id === node.attrs?.assetId)?.dataUrl ?? '' } }
      : {}),
    ...(node.content ? { content: node.content.map(visit) } : {}),
  })
  return visit(doc) as SpecDocument
}

export function escapeSpecHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderSpecHtml(doc: SpecDocument, assets: readonly SpecAsset[], includeImages = true): string {
  const esc = escapeSpecHtml
  const render = (node: SpecNode): string => {
    const body = (node.content ?? []).map(render).join('')
    if (node.type === 'text') {
      let value = esc(node.text ?? '')
      for (const mark of node.marks ?? []) {
        const tag = (
          { bold: 'strong', italic: 'em', underline: 'u', strike: 's', code: 'code', highlight: 'mark' } as Record<
            string,
            string
          >
        )[mark.type]
        if (tag) value = `<${tag}>${value}</${tag}>`
        else if (mark.type === 'specTextColor' && /^#[0-9a-f]{6}$/i.test(String(mark.attrs?.color)))
          value = `<span style="color:${mark.attrs?.color}">${value}</span>`
        else if (mark.type === 'link' && safeSpecLink(mark.attrs?.href))
          value = `<a href="${esc(mark.attrs.href)}" rel="noopener noreferrer">${value}</a>`
      }
      return value
    }
    if (node.type === 'image') {
      if (!includeImages) return `<p>[Image: ${esc(String(node.attrs?.alt ?? 'See Word export'))}]</p>`
      const asset = assets.find((a) => a.id === node.attrs?.assetId)
      if (!asset) throw new Error('An image is missing. Reload attachments before exporting.')
      return `<figure><img src="${esc(asset.dataUrl)}" alt="${esc(String(node.attrs?.alt ?? asset.name))}"${node.attrs?.width ? ` width="${Number(node.attrs.width)}"` : ''} /><figcaption>${esc(String(node.attrs?.alt ?? asset.name))}</figcaption></figure>`
    }
    if (node.type === 'hardBreak') return '<br />'
    if (node.type === 'horizontalRule') return '<hr />'
    if (node.type === 'specStatus')
      return `<span data-spec-status="" data-tone="${esc(String(node.attrs?.tone ?? 'info'))}">${esc(String(node.attrs?.label ?? 'Status'))}</span>`
    if (node.type === 'specPanel')
      return `<aside data-tone="${esc(String(node.attrs?.tone ?? 'info'))}">${body}</aside>`
    if (node.type === 'specExpand')
      return `<details open><summary>${esc(String(node.attrs?.title ?? 'Details'))}</summary>${body}</details>`
    if (node.type === 'codeBlock') return `<pre><code>${body}</code></pre>`
    if (node.type === 'doc') return body
    const tag =
      node.type === 'heading'
        ? `h${Math.min(4, Math.max(1, Number(node.attrs?.level) || 2))}`
        : (
            {
              paragraph: 'p',
              bulletList: 'ul',
              orderedList: 'ol',
              listItem: 'li',
              table: 'table',
              tableRow: 'tr',
              tableCell: 'td',
              tableHeader: 'th',
              blockquote: 'blockquote',
            } as Record<string, string>
          )[node.type]
    if (!tag) throw new Error(`Unsupported specification block: ${node.type}`)
    let attrs = ['tableCell', 'tableHeader'].includes(node.type)
      ? `${node.attrs?.colspan ? ` colspan="${Number(node.attrs.colspan)}"` : ''}${node.attrs?.rowspan ? ` rowspan="${Number(node.attrs.rowspan)}"` : ''}`
      : ''
    if (
      ['paragraph', 'heading'].includes(node.type) &&
      ['left', 'center', 'right', 'justify'].includes(String(node.attrs?.textAlign))
    )
      attrs += ` style="text-align:${node.attrs?.textAlign}"`
    if (
      ['tableCell', 'tableHeader'].includes(node.type) &&
      ['left', 'center', 'right', 'justify'].includes(String(node.attrs?.align))
    )
      attrs += ` style="text-align:${node.attrs?.align}"`
    if (node.type === 'orderedList' && Number(node.attrs?.start) > 1) attrs += ` start="${Number(node.attrs?.start)}"`
    return `<${tag}${attrs}>${body}</${tag}>`
  }
  return render(doc)
}

export function specOutline(doc: SpecDocument): { title: string; index: number; level: number }[] {
  return doc.content.flatMap((node, index) =>
    node.type === 'heading' ? [{ title: documentText(node), index, level: Number(node.attrs?.level) || 2 }] : [],
  )
}

export function renderSpecWiki(doc: SpecDocument): string {
  const esc = (s: string) => s.replace(/([{}[\]|])/g, '\\$1')
  const render = (node: SpecNode, depth = 0): string => {
    const body = (node.content ?? []).map((n) => render(n, depth)).join('')
    if (node.type === 'text') {
      let text = esc(node.text ?? '')
      for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') text = `*${text}*`
        if (mark.type === 'italic') text = `_${text}_`
        if (mark.type === 'underline') text = `+${text}+`
        if (mark.type === 'strike') text = `-${text}-`
        if (mark.type === 'code') text = `{{${text}}}`
        if (mark.type === 'specTextColor' && /^#[0-9a-f]{6}$/i.test(String(mark.attrs?.color)))
          text = `{color:${mark.attrs?.color}}${text}{color}`
        if (mark.type === 'link' && safeSpecLink(mark.attrs?.href)) text = `[${text}|${mark.attrs.href}]`
      }
      return text
    }
    if (node.type === 'heading') return `h${node.attrs?.level ?? 2}. ${body}\n\n`
    if (node.type === 'paragraph') return body + '\n'
    if (node.type === 'image') return `[Image: ${esc(String(node.attrs?.alt ?? 'See Word export'))}]\n`
    if (node.type === 'table') return body + '\n'
    if (node.type === 'tableRow') return '|' + (node.content ?? []).map((n) => render(n).trim()).join('|') + '|\n'
    if (['bulletList', 'orderedList'].includes(node.type))
      return (node.content ?? [])
        .map((n) => `${(node.type === 'orderedList' ? '#' : '*').repeat(depth + 1)} ${render(n, depth + 1).trim()}\n`)
        .join('')
    if (node.type === 'specStatus') return esc(String(node.attrs?.label ?? 'Status'))
    if (node.type === 'specExpand') return `h3. ${esc(String(node.attrs?.title ?? 'Details'))}\n${body}`
    if (node.type === 'hardBreak') return '\\\\'
    return body
  }
  return render(doc)
}
