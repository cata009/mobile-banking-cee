// Shared browser/server boundary. JSON is allowlisted, never accepted as arbitrary HTML.
export function safeSpecLink(value) {
  return (
    typeof value === 'string' &&
    /^(https?:\/\/|mailto:)/i.test(value) &&
    !Array.from(value).some((char) => char.charCodeAt(0) <= 32 || '<>"\''.includes(char))
  )
}

export function validateSpecDocument(value) {
  const fail = () => {
    throw new Error('Invalid specification document. Use supported text, tables and attached images.')
  }
  if (!value || value.type !== 'doc' || !Array.isArray(value.content) || JSON.stringify(value).length > 500_000) fail()
  const children = {
    doc: [
      'paragraph',
      'heading',
      'bulletList',
      'orderedList',
      'blockquote',
      'codeBlock',
      'horizontalRule',
      'table',
      'image',
      'specPanel',
      'specExpand',
    ],
    paragraph: ['text', 'hardBreak', 'specStatus'],
    heading: ['text', 'hardBreak', 'specStatus'],
    bulletList: ['listItem'],
    orderedList: ['listItem'],
    listItem: ['paragraph', 'bulletList', 'orderedList', 'blockquote', 'codeBlock'],
    blockquote: ['paragraph', 'heading', 'bulletList', 'orderedList', 'codeBlock'],
    codeBlock: ['text'],
    table: ['tableRow'],
    tableRow: ['tableCell', 'tableHeader'],
    tableCell: ['paragraph', 'heading', 'bulletList', 'orderedList', 'image', 'blockquote'],
    tableHeader: ['paragraph', 'heading', 'bulletList', 'orderedList'],
    specPanel: ['paragraph', 'heading', 'bulletList', 'orderedList', 'table', 'image'],
    specExpand: ['paragraph', 'heading', 'bulletList', 'orderedList', 'table', 'image'],
    text: [],
    hardBreak: [],
    horizontalRule: [],
    image: [],
    specStatus: [],
  }
  for (const type of ['listItem', 'tableCell', 'tableHeader', 'blockquote']) children[type] = children.doc
  let count = 0
  const visit = (node, depth, parent) => {
    if (
      !node ||
      typeof node !== 'object' ||
      Array.isArray(node) ||
      ++count > 10_000 ||
      depth > 20 ||
      !Object.hasOwn(children, node.type)
    )
      fail()
    if (parent && !children[parent].includes(node.type)) fail()
    if (Object.keys(node).some((k) => !['type', 'text', 'attrs', 'marks', 'content'].includes(k))) fail()
    if (node.type === 'text' && (typeof node.text !== 'string' || !node.text.length)) fail()
    if (node.type !== 'text' && node.text !== undefined) fail()
    const attrs = node.attrs ?? {}
    if (typeof attrs !== 'object' || Array.isArray(attrs)) fail()
    const allowed =
      {
        heading: ['level', 'textAlign'],
        paragraph: ['textAlign'],
        orderedList: ['start', 'type'],
        codeBlock: ['language'],
        tableCell: ['colspan', 'rowspan', 'colwidth', 'align'],
        tableHeader: ['colspan', 'rowspan', 'colwidth', 'align'],
        image: ['assetId', 'alt', 'title', 'width', 'height'],
        specPanel: ['tone'],
        specExpand: ['title'],
        specStatus: ['label', 'tone'],
      }[node.type] ?? []
    if (Object.keys(attrs).some((k) => !allowed.includes(k))) fail()
    if (JSON.stringify(attrs).length > 3000) fail()
    if (node.type === 'heading' && ![1, 2, 3, 4].includes(attrs.level)) fail()
    if (attrs.textAlign != null && !['left', 'center', 'right', 'justify'].includes(attrs.textAlign)) fail()
    if (attrs.align != null && !['left', 'center', 'right', 'justify'].includes(attrs.align)) fail()
    if (node.type === 'image' && (typeof attrs.assetId !== 'string' || !/^img-[a-f0-9]{32}$/.test(attrs.assetId)))
      fail()
    for (const key of ['colspan', 'rowspan', 'start', 'width', 'height'])
      if (attrs[key] != null && (!Number.isInteger(attrs[key]) || attrs[key] < 1 || attrs[key] > 16000)) fail()
    if (
      attrs.colwidth != null &&
      (!Array.isArray(attrs.colwidth) ||
        attrs.colwidth.length > 30 ||
        attrs.colwidth.some((n) => !Number.isInteger(n) || n < 0 || n > 16000))
    )
      fail()
    for (const key of ['alt', 'title', 'label', 'tone', 'language'])
      if (attrs[key] != null && typeof attrs[key] !== 'string') fail()
    if (attrs.tone != null && !['info', 'warning', 'success', 'note'].includes(attrs.tone)) fail()
    if (node.marks !== undefined && !Array.isArray(node.marks)) fail()
    for (const mark of node.marks ?? []) {
      if (
        !mark ||
        !['bold', 'italic', 'underline', 'strike', 'code', 'link', 'highlight', 'specTextColor'].includes(mark.type)
      )
        fail()
      if (Object.keys(mark).some((k) => !['type', 'attrs'].includes(k))) fail()
      if (
        mark.type === 'link' &&
        (!safeSpecLink(mark.attrs?.href) ||
          Object.keys(mark.attrs ?? {}).some((k) => !['href', 'target', 'rel', 'class'].includes(k)))
      )
        fail()
      if (
        mark.type === 'specTextColor' &&
        (!/^#[0-9a-f]{6}$/i.test(String(mark.attrs?.color)) ||
          Object.keys(mark.attrs ?? {}).some((key) => key !== 'color'))
      )
        fail()
      if (!['link', 'specTextColor'].includes(mark.type) && mark.attrs && Object.keys(mark.attrs).length) fail()
    }
    if (node.content !== undefined && !Array.isArray(node.content)) fail()
    if (!children[node.type].length && node.content?.length) fail()
    for (const child of node.content ?? []) visit(child, depth + 1, node.type)
  }
  visit(value, 0, null)
}
