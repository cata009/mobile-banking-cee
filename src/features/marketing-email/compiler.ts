import { assertDocument, documentKey, type EmailBlock, type EmailDocument } from './model'
import { isPublicUrl, validateDocument, variablesIn, type EmailIssue } from './validation'

export interface EmailReport {
  compiler: string
  revision: number
  htmlBytes: number
  resources: string[]
  variables: string[]
  issues: EmailIssue[]
  realClientTests: 'not-run'
  tracking: string
}
export interface CompiledEmail {
  revision: number
  sourceKey: string
  html: string
  text: string
  report: EmailReport
}
export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
const lines = (value: string) => escapeHtml(value).replace(/\r?\n/g, '<br />')
/** Never expose unsafe addresses even in an invalid draft's preview. */
function safeUrl(doc: EmailDocument, value: string, image = false) {
  return isPublicUrl(value, doc.config.variables, image ? 'image' : 'link') ? escapeHtml(value) : ''
}
function renderBlock(doc: EmailDocument, b: EmailBlock, columnWidth: number): string {
  const c = b.content,
    s = b.style,
    css = `b-${b.id}`
  const text = (content: string, fontSize = 16) =>
    `<mj-text css-class="${css}" color="${s.text.light}" container-background-color="${s.background.light}" font-size="${fontSize}px" line-height="1.6" padding="12px 16px">${content}</mj-text>`
  const heading = () =>
    text(
      `<h2 style="font-size:24px;line-height:1.25;margin:0;font-weight:bold;word-break:break-word">${escapeHtml(c.title)}</h2>`,
    )
  const button = () => {
    const href = safeUrl(doc, c.url)
    return href
      ? `<mj-button css-class="${css} cta-${b.id}" href="${href}" background-color="${s.accent.light}" color="${s.buttonText.light}" font-size="16px" font-weight="bold" border-radius="4px" inner-padding="16px 24px" padding="12px 16px" container-background-color="${s.background.light}">${escapeHtml(c.label)}</mj-button>`
      : text(escapeHtml(c.label || 'Add a button destination'))
  }
  const image = (url: string, alt: string, width: number, height: number, name: string, hidden = false) => {
    const src = safeUrl(doc, url, true)
    if (!src) return text(`[${escapeHtml(alt || 'Image needs a public URL')}]`)
    const effectiveWidth = Math.min(width, columnWidth - 32)
    const tag = `<mj-image css-class="${css} ${name}" src="${src}" alt="${escapeHtml(alt)}" width="${effectiveWidth}px" height="${Math.max(1, Math.round((height * effectiveWidth) / width))}px" padding="12px 16px" container-background-color="${s.background.light}" />`
    return hidden ? `<mj-raw><!--[if !mso]><!--></mj-raw>${tag}<mj-raw><!--<![endif]--></mj-raw>` : tag
  }
  switch (b.kind) {
    case 'header':
      return (
        (c.imageUrl
          ? image(c.imageUrl, c.alt, c.width, c.height, `light-img-${b.id}`) +
            (c.darkImageUrl ? image(c.darkImageUrl, c.alt, c.width, c.height, `dark-img-${b.id}`, true) : '')
          : text(`<strong>${escapeHtml(doc.config.brand)}</strong>`)) +
        (c.secondaryImageUrl
          ? image(c.secondaryImageUrl, c.secondaryAlt, c.secondaryWidth, c.secondaryHeight, `partner-img-${b.id}`)
          : '') +
        (c.text ? text(lines(c.text), 13) : '')
      )
    case 'icon':
    case 'hero':
      return (
        image(c.imageUrl, c.alt, c.width, c.height, `light-img-${b.id}`) +
        (c.darkImageUrl ? image(c.darkImageUrl, c.alt, c.width, c.height, `dark-img-${b.id}`, true) : '')
      )
    case 'heading':
      return heading()
    case 'text':
      return text(lines(c.text))
    case 'list':
    case 'benefits':
      return (
        (c.title ? heading() : '') +
        text(`<ul style="margin:0;padding-left:24px">${c.items.map((item) => `<li>${lines(item)}</li>`).join('')}</ul>`)
      )
    case 'cta':
      return button()
    case 'offer':
      return heading() + text(lines(c.text)) + button()
    case 'divider':
      return `<mj-divider css-class="${css}" border-color="${s.accent.light}" border-width="1px" padding="16px" container-background-color="${s.background.light}" />`
    case 'spacer':
      return `<mj-spacer css-class="${css}" height="${Math.min(c.height, 200)}px" container-background-color="${s.background.light}" />`
    case 'contact':
      return text(
        `${lines(c.text)}${c.phone ? `<br /><a style="color:${s.accent.light}" href="${safeUrl(doc, `tel:${c.phone}`)}">${escapeHtml(c.phone)}</a>` : ''}${c.email ? `<br /><a style="color:${s.accent.light}" href="${safeUrl(doc, `mailto:${c.email}`)}">${escapeHtml(c.email)}</a>` : ''}`,
      )
    case 'footer': {
      const unsub = safeUrl(doc, doc.config.unsubscribeUrl)
      return text(
        `${lines(c.text)}<br /><br />${escapeHtml(doc.config.brand)}<br />${lines(doc.config.senderAddress)}<br /><br />${lines(doc.config.legalText)}<br /><br />${unsub ? `<a style="color:${s.accent.light};text-decoration:underline" href="${unsub}">Unsubscribe</a>` : 'Add an unsubscribe destination'}`,
        12,
      )
    }
  }
}
function darkRules(doc: EmailDocument): string {
  return (
    `body,.email-body{background-color:#141414!important}` +
    doc.sections
      .map(
        (s) =>
          `.s-${s.id},.s-${s.id}>table{background-color:${s.background.dark}!important}` +
          s.columns
            .flatMap((c) => c.blocks)
            .map((b) => {
              const root = `.b-${b.id}`
              return (
                `${root}{background-color:${b.style.background.dark}!important}${root},${root} div,${root} h2,${root} li{color:${b.style.text.dark}!important}${root} a{color:${b.style.accent.dark}!important}.cta-${b.id} td,.cta-${b.id} a{background-color:${b.style.accent.dark}!important;color:${b.style.buttonText.dark}!important}` +
                (b.kind === 'divider' ? `${root} p{border-color:${b.style.accent.dark}!important}` : '') +
                (b.content.darkImageUrl && isPublicUrl(b.content.darkImageUrl, doc.config.variables, 'image')
                  ? `.light-img-${b.id}{display:none!important}.dark-img-${b.id}{display:table-cell!important;max-height:none!important;overflow:visible!important}`
                  : '')
              )
            })
            .join(''),
      )
      .join('')
  )
}
export function toPlainText(doc: EmailDocument): string {
  const blocks = doc.sections
    .flatMap((s) => s.columns.flatMap((c) => c.blocks))
    .map((b) => {
      const c = b.content
      switch (b.kind) {
        case 'header':
          return [
            doc.config.brand,
            c.text,
            c.imageUrl ? `[${c.alt}] ${c.imageUrl}` : '',
            c.secondaryImageUrl ? `[${c.secondaryAlt}] ${c.secondaryImageUrl}` : '',
          ]
            .filter(Boolean)
            .join('\n')
        case 'icon':
        case 'hero':
          return `[${c.alt}] ${c.imageUrl}`
        case 'heading':
          return c.title
        case 'text':
          return c.text
        case 'list':
        case 'benefits':
          return [c.title, ...c.items.map((item) => `• ${item}`)].filter(Boolean).join('\n')
        case 'cta':
          return `${c.label}: ${c.url}`
        case 'offer':
          return `${c.title}\n${c.text}\n${c.label}: ${c.url}`
        case 'contact':
          return [c.text, c.phone ? `tel:${c.phone}` : '', c.email ? `mailto:${c.email}` : '']
            .filter(Boolean)
            .join('\n')
        case 'footer':
          return [
            c.text,
            doc.config.brand,
            doc.config.senderAddress,
            doc.config.legalText,
            `Unsubscribe: ${doc.config.unsubscribeUrl}`,
          ].join('\n\n')
        case 'divider':
          return '────────────────'
        case 'spacer':
          return ''
      }
    })
    .filter(Boolean)
  return `${doc.subject}\n${doc.preheader}\n\n${blocks.join('\n\n')}\n`
}
export async function compileEmail(doc: EmailDocument): Promise<CompiledEmail> {
  assertDocument(doc)
  const sourceKey = documentKey(doc),
    issues = validateDocument(doc)
  // v4's UMD bundle expects window even inside a worker. No DOM is used by compilation.
  const host = globalThis as unknown as { window?: unknown }
  if (!host.window) host.window = globalThis
  const { default: mjml } = await import('mjml-browser')
  const dark = darkRules(doc)
  const darkHidden = doc.sections
    .flatMap((s) => s.columns.flatMap((c) => c.blocks))
    .filter((b) => b.content.darkImageUrl)
    .map((b) => `.dark-img-${b.id}{display:none;max-height:0;overflow:hidden;mso-hide:all}`)
    .join('')
  const source = `<mjml lang="${escapeHtml(doc.config.language)}"><mj-head><mj-title>${escapeHtml(doc.subject)}</mj-title><mj-preview>${escapeHtml(doc.preheader)}</mj-preview><mj-attributes><mj-all font-family="Arial, Helvetica, sans-serif" /><mj-column padding="0px" /></mj-attributes><mj-raw><meta name="color-scheme" content="light dark" /><meta name="supported-color-schemes" content="light dark" /></mj-raw><mj-style>${darkHidden}@media(prefers-color-scheme:dark){${dark}}[data-ogsc] .email-body{background-color:#141414!important}</mj-style></mj-head><mj-body css-class="email-body" background-color="#f3f3f3" width="600px">${doc.sections.map((s) => `<mj-section css-class="s-${s.id}" background-color="${s.background.light}" padding="${s.padding}px 0px">${s.columns.map((c) => `<mj-column width="${100 / s.columns.length}%">${c.blocks.map((b) => renderBlock(doc, b, 600 / s.columns.length)).join('')}</mj-column>`).join('')}</mj-section>`).join('')}</mj-body></mjml>`
  const result = mjml(source, { validationLevel: 'soft', minify: false, fonts: {} })
  for (const e of result.errors)
    issues.push({ severity: 'error', code: 'compiler', message: e.formattedMessage ?? e.message })
  // Conservative whitespace optimization: preserve text spacing, conditional comments and template tokens.
  let html = result.html.replace(/>\s+</g, '><').trim()
  // Expose deterministic preview rules without a second renderer or a second compilation.
  html = html.replace('</head>', `<style id="email-preview-theme">/*PREVIEW_THEME*/</style></head>`)
  // Explicit HTML dimensions provide a fallback; CSS keeps the original aspect ratio as width shrinks.
  html = html.replace(/(<img\b[^>]*style=")[^"]*("[^>]*>)/g, (tag: string) =>
    tag.replace(/height:\d+px;/, 'height:auto;'),
  )
  const resources = [
    ...new Set(
      doc.sections
        .flatMap((s) =>
          s.columns.flatMap((c) =>
            c.blocks.flatMap((b) => [b.content.imageUrl, b.content.darkImageUrl, b.content.secondaryImageUrl]),
          ),
        )
        .filter(Boolean),
    ),
  ]
  const htmlBytes = new TextEncoder().encode(html).length
  if (htmlBytes > 95_000)
    issues.push({
      severity: 'warning',
      code: 'size',
      message: 'HTML exceeds 95 KB. Check for clipping in your email clients.',
    })
  const variables = [...new Set(variablesIn(source))]
  return {
    revision: doc.revision,
    sourceKey,
    html,
    text: toPlainText(doc),
    report: {
      compiler: 'mjml-browser@4.18.0',
      revision: doc.revision,
      htmlBytes,
      resources,
      variables,
      issues,
      realClientTests: 'not-run',
      tracking: doc.config.trackingNote,
    },
  }
}

export function previewHtml(
  doc: EmailDocument,
  result: CompiledEmail,
  mode: 'light' | 'dark',
  images: boolean,
): string {
  if (result.sourceKey !== documentKey(doc)) throw new Error('Preview belongs to a different revision.')
  const rules =
    mode === 'dark'
      ? darkRules(doc)
      : `:root{color-scheme:light}body,.email-body{background-color:#f3f3f3!important}` +
        doc.sections
          .map(
            (s) =>
              `.s-${s.id},.s-${s.id}>table{background-color:${s.background.light}!important}` +
              s.columns
                .flatMap((c) => c.blocks)
                .map(
                  (b) =>
                    `.b-${b.id}{background-color:${b.style.background.light}!important}.b-${b.id},.b-${b.id} div,.b-${b.id} h2,.b-${b.id} li{color:${b.style.text.light}!important}.b-${b.id} a{color:${b.style.accent.light}!important}.cta-${b.id} td,.cta-${b.id} a{background-color:${b.style.accent.light}!important;color:${b.style.buttonText.light}!important}.light-img-${b.id}{display:table-cell!important}.dark-img-${b.id}{display:none!important}`,
                )
                .join(''),
          )
          .join('')
  let html = result.html.replace('/*PREVIEW_THEME*/', rules)
  html = html.replace(/(<a\b[^>]*?)\bhref="([^"]*)"/g, '$1data-email-href="$2" aria-disabled="true"')
  if (!images) html = html.replace(/(<img\b[^>]*?)\bsrc="[^"]*"/g, '$1src=""')
  // No navigation, forms, network connections or active content in the preview; images are the only optional remote resource.
  return html.replace(
    '<head>',
    `<head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${images ? 'https:' : "'none'"}; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'" />`,
  )
}
