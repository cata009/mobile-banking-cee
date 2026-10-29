import {
  newId,
  clone,
  type BlockKind,
  type EmailBlock,
  type EmailDocument,
  type EmailSection,
  type EmailStyle,
} from './model'
import { EMAIL_ICON_OPTIONS, selectEmailIcon } from './iconCatalog'

export const BLOCK_LABELS: Record<BlockKind, string> = {
  header: 'Header & logos',
  hero: 'Hero image',
  icon: 'Icon',
  heading: 'Heading',
  text: 'Text',
  list: 'List',
  cta: 'Button',
  offer: 'Product offer',
  benefits: 'Benefits',
  divider: 'Divider',
  spacer: 'Spacer',
  contact: 'Contact',
  footer: 'Footer',
}
export const DEFAULT_STYLE: EmailStyle = {
  background: { light: '#ffffff', dark: '#202020' },
  text: { light: '#262626', dark: '#f5f5f5' },
  accent: { light: '#007a91', dark: '#90d8e5' },
  buttonText: { light: '#ffffff', dark: '#202020' },
}
export function createBlock(kind: BlockKind): EmailBlock {
  const block: EmailBlock = {
    id: newId('block'),
    kind,
    style: clone(DEFAULT_STYLE),
    content: {
      title: '',
      text: '',
      label: '',
      url: '',
      imageUrl: '',
      darkImageUrl: '',
      alt: '',
      width: 600,
      height: 300,
      items: [],
      secondaryImageUrl: '',
      secondaryAlt: '',
      secondaryWidth: 120,
      secondaryHeight: 40,
      phone: '',
      email: '',
    },
  }
  const c = block.content
  switch (kind) {
    case 'header':
      c.text = 'Made for your next move'
      c.width = 160
      c.height = 48
      break
    case 'hero':
      c.alt = 'Describe the offer image'
      break
    case 'icon':
      selectEmailIcon(block, EMAIL_ICON_OPTIONS[0]!.variantId, 32)
      break
    case 'heading':
      c.title = 'Make room for what comes next'
      break
    case 'text':
      c.text = 'A clear message, a useful idea, and a reason to take the next step.'
      break
    case 'list':
    case 'benefits':
      c.title = kind === 'benefits' ? 'The details that make a difference' : ''
      c.items = ['A benefit that matters', 'Clear terms, from the start']
      break
    case 'cta':
      c.label = 'Explore the offer'
      break
    case 'offer':
      c.title = 'An offer for your next chapter'
      c.text = 'Introduce the product, its terms, and the offer period.'
      c.label = 'See the details'
      break
    case 'contact':
      c.text = 'A question? We are here to help.'
      c.phone = ''
      c.email = 'contact@example.com'
      break
    case 'footer':
      c.text = 'You are receiving this email based on your communication preferences.'
      break
    case 'spacer':
      c.height = 24
      break
    case 'divider':
      c.height = 1
      break
  }
  return block
}
export function createSection(columns: 1 | 2 = 1, kinds: BlockKind[] = []): EmailSection {
  return {
    id: newId('section'),
    background: clone(DEFAULT_STYLE.background),
    padding: 16,
    columns: Array.from({ length: columns }, (_, i) => ({
      id: newId('column'),
      blocks: i === 0 ? kinds.map(createBlock) : [],
    })),
  }
}
export type TemplateId = 'blank' | 'offer' | 'newsletter'
export const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: 'blank', label: 'Essential message' },
  { id: 'offer', label: 'Product spotlight' },
  { id: 'newsletter', label: 'Two-column newsletter' },
]
export function createDocument(template: TemplateId = 'offer'): EmailDocument {
  const doc: EmailDocument = {
    format: 'marketing-email',
    version: 1,
    id: newId('email'),
    revision: 0,
    name: TEMPLATES.find((t) => t.id === template)?.label ?? 'Email',
    subject: 'Something for your next chapter',
    preheader: 'A few details worth a closer look.',
    config: {
      country: 'CEE',
      language: 'en',
      brand: 'UniCredit',
      senderAddress: '',
      legalText: 'Draft content. Replace this with the legal copy approved for this communication.',
      unsubscribeUrl: '',
      variables: [],
      trackingNote: 'No tracking added automatically.',
    },
    sections: [createSection(1, ['header', 'heading', 'text'])],
  }
  if (template === 'offer') doc.sections.push(createSection(1, ['offer', 'benefits', 'cta']))
  if (template === 'newsletter') {
    const two = createSection(2, ['offer'])
    two.columns[1]!.blocks.push(createBlock('benefits'))
    doc.sections.push(two, createSection(1, ['cta']))
  }
  doc.sections.push(createSection(1, ['contact', 'footer']))
  return doc
}
