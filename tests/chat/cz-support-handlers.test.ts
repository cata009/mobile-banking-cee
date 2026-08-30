import { describe, expect, it } from 'vitest'
import type { CoAppingRichBlock } from '../../package/mobile-pi-coapping-chat-package/src'
import { resolveCzSupportReply } from '@/app/chat/cz/handlers/support'

const documentBlock = { type: 'document-list' } as unknown as CoAppingRichBlock
const productsBlock = { type: 'products' } as unknown as CoAppingRichBlock

describe('CZ support chat handler', () => {
  it('routes message questions to messages, documents, and payment proof', () => {
    const reply = resolveCzSupportReply('help with a specific inbox message', { documentBlock, productsBlock })

    expect(reply).toMatchObject({
      richBlocks: [documentBlock],
      followUps: [
        { id: 'cz-open-messages', label: 'Open Messages' },
        { id: 'cz-open-documents', label: 'Open Documents' },
        { id: 'cz-find-confirmation', label: 'Find payment proof' },
      ],
    })
  })

  it('keeps the product context when explaining the card-before-documents order', () => {
    expect(resolveCzSupportReply('why this order', { documentBlock, productsBlock })).toMatchObject({
      richBlocks: [productsBlock],
      followUps: [
        { id: 'cz-open-card', label: 'Open Card' },
        { id: 'cz-open-documents', label: 'Open Documents' },
      ],
    })
  })

  it('declines prompts owned by another domain', () => {
    expect(resolveCzSupportReply('show my latest investment order', { documentBlock, productsBlock })).toBeNull()
  })
})
