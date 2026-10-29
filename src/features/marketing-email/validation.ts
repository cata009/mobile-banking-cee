import { assertDocument, type EmailDocument } from './model'
import { resolveEmailIcon } from './iconCatalog'

export interface EmailIssue {
  severity: 'error' | 'warning'
  code: string
  message: string
  blockId?: string
}
export function variablesIn(value: string): string[] {
  return [...value.matchAll(/\{\{([a-zA-Z_][\w.]*)\}\}/g)].map((m) => m[1]!)
}
/** Only declared simple {{name}} tokens are supported. Arbitrary platform syntax is never interpreted. */
export function isPublicUrl(value: string, variables: string[], purpose: 'image' | 'link' = 'link'): boolean {
  if (!value || value !== value.trim() || /[\s<>"'`\\]/.test(value) || [...value].some((c) => c.charCodeAt(0) < 32))
    return false
  const tokens = variablesIn(value)
  if (tokens.some((t) => !variables.includes(t))) return false
  const replaced = value.replace(/\{\{[a-zA-Z_][\w.]*\}\}/g, 'placeholder')
  if (/[{}]/.test(replaced)) return false
  if (purpose === 'link' && /^\{\{[a-zA-Z_][\w.]*\}\}$/.test(value)) return true
  if (purpose === 'link' && /^mailto:[^@?]+@[^@?]+\.[a-z]{2,}$/i.test(value)) return true
  if (purpose === 'link' && /^tel:\+?[\d()-]{5,25}$/.test(value)) return true
  try {
    const u = new URL(replaced)
    const host = u.hostname.toLowerCase().replace(/\.+$/, '')
    if (
      u.protocol !== 'https:' ||
      u.username ||
      u.password ||
      !host.includes('.') ||
      /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host)
    )
      return false
    if (/^\d+(?:\.\d+){3}$/.test(host)) {
      const [a = 0, b = 0, c = 0] = host.split('.').map(Number)
      if (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        a >= 224 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)) || (b === 88 && c === 99))) ||
        (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
        (a === 203 && b === 0 && c === 113)
      )
        return false
    }
    return true
  } catch {
    return false
  }
}
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const c = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
    return c[0]! * 0.2126 + c[1]! * 0.7152 + c[2]! * 0.0722
  }
  const l = [lum(a), lum(b)].sort((x, y) => y - x)
  return (l[0]! + 0.05) / (l[1]! + 0.05)
}
export function validateDocument(doc: EmailDocument): EmailIssue[] {
  const issues: EmailIssue[] = []
  const add = (severity: EmailIssue['severity'], code: string, message: string, blockId?: string) =>
    issues.push({ severity, code, message, ...(blockId ? { blockId } : {}) })
  try {
    assertDocument(doc)
  } catch (e) {
    return [{ severity: 'error', code: 'structure', message: e instanceof Error ? e.message : 'Invalid structure.' }]
  }
  const required = (v: string, message: string, id?: string) => {
    if (!v.trim()) add('error', 'required', message, id)
  }
  required(doc.name, 'A document name is required.')
  required(doc.subject, 'A subject is required.')
  required(doc.config.brand, 'A brand name is required.')
  required(doc.config.country, 'A country is required.')
  if (!/^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(doc.config.language))
    add('error', 'language', 'Invalid language code. Use en or a code such as en-GB.')
  required(doc.config.senderAddress, 'Add the sender postal address.')
  required(doc.config.legalText, 'Add the approved legal copy.')
  const url = (v: string, purpose: 'image' | 'link', message: string, id?: string) => {
    if (!isPublicUrl(v, doc.config.variables, purpose))
      add('error', purpose === 'image' ? 'resource' : 'url', message, id)
  }
  const unsubscribe = doc.config.unsubscribeUrl
  const wholeVariable = /^\{\{[a-zA-Z_][\w.]*\}\}$/.test(unsubscribe) && isPublicUrl(unsubscribe, doc.config.variables)
  if (!wholeVariable && !isPublicUrl(unsubscribe, doc.config.variables, 'image'))
    add('error', 'url', 'Unsubscribe must use HTTPS or a declared variable.')
  if (!doc.preheader.trim()) add('warning', 'preheader', 'The preheader is empty.')
  let footers = 0
  for (const section of doc.sections) {
    if (section.columns.every((c) => c.blocks.length === 0)) add('warning', 'empty-section', 'A section is empty.')
    for (const col of section.columns)
      for (const b of col.blocks) {
        const c = b.content
        if (b.kind === 'footer') footers++
        if (b.kind === 'heading' || b.kind === 'offer') required(c.title, 'Add a heading.', b.id)
        if (['text', 'contact', 'footer'].includes(b.kind)) required(c.text, 'Add body copy.', b.id)
        if (b.kind === 'cta' || b.kind === 'offer') {
          required(c.label, 'Add a button label.', b.id)
          url(c.url, 'link', 'The button needs a safe, valid destination.', b.id)
        }
        if (b.kind === 'list' || b.kind === 'benefits') {
          if (!c.items.length || c.items.some((item) => !item.trim()))
            add('error', 'required', 'Add at least one non-empty list item.', b.id)
        }
        if (b.kind === 'icon' && (!b.icon || !resolveEmailIcon(b.icon.variantId)))
          add('error', 'icon', 'Choose an available icon from the design system.', b.id)
        if (b.kind === 'hero' || b.kind === 'icon' || (b.kind === 'header' && c.imageUrl)) {
          url(c.imageUrl, 'image', 'Images need public HTTPS URLs. Local or blob resources cannot be exported.', b.id)
          required(c.alt, 'Add an image description.', b.id)
          if (c.darkImageUrl) url(c.darkImageUrl, 'image', 'The dark image needs a public HTTPS URL.', b.id)
          else add('warning', 'dark-image', 'Check image and logo contrast in dark mode.', b.id)
        }
        if (b.kind === 'header' && c.secondaryImageUrl) {
          url(c.secondaryImageUrl, 'image', 'The partner logo needs a public HTTPS URL.', b.id)
          required(c.secondaryAlt, 'Add a partner logo description.', b.id)
          add('warning', 'dark-image', 'Check the partner logo in dark mode.', b.id)
        }
        if (b.kind === 'contact') {
          if (c.phone)
            url(`tel:${c.phone}`, 'link', 'Invalid phone number. Use an international format without spaces.', b.id)
          if (c.email) url(`mailto:${c.email}`, 'link', 'Invalid contact email address.', b.id)
        }
        for (const mode of ['light', 'dark'] as const) {
          if (
            contrast(b.style.text[mode], b.style.background[mode]) < 4.5 ||
            (['cta', 'offer'].includes(b.kind) && contrast(b.style.accent[mode], b.style.buttonText[mode]) < 4.5)
          )
            add('warning', 'contrast', `Contrast below 4.5:1 in ${mode} mode. Check text and button colors.`, b.id)
        }
      }
  }
  if (footers !== 1) add('error', 'footer', 'The document must contain exactly one footer.')
  const strings = [
    doc.subject,
    doc.preheader,
    ...Object.values(doc.config).filter((v): v is string => typeof v === 'string'),
    ...doc.sections.flatMap((s) =>
      s.columns.flatMap((c) =>
        c.blocks.flatMap((b) => [
          ...Object.values(b.content).filter((v): v is string => typeof v === 'string'),
          ...b.content.items,
        ]),
      ),
    ),
  ]
  for (const value of strings) {
    if (
      variablesIn(value).some((name) => !doc.config.variables.includes(name)) ||
      /\{\{|\}\}|\{%|%\}/.test(value.replace(/\{\{[a-zA-Z_][\w.]*\}\}/g, ''))
    )
      add('error', 'variable', 'Undeclared variable or unsupported syntax. Declare names explicitly using {{name}}.')
  }
  if (strings.some((v) => variablesIn(v).length))
    add(
      'warning',
      'platform-variables',
      'Variables remain literal. Test substitution, destinations and unsubscribe in your marketing platform before sending.',
    )
  add(
    'warning',
    'client-tests',
    'Automated checks only. Rendering and unsubscribe have not been tested in Gmail, Outlook or Apple Mail.',
  )
  return issues
}
