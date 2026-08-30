import { describe, expect, it } from 'vitest'
import type { CoAppingRichBlock } from '../../package/mobile-pi-coapping-chat-package/src'
import { resolveCzCardReply } from '@/app/chat/cz/handlers/cards'

const creditLimitOfferBlock = { type: 'credit-limit-offer' } as unknown as CoAppingRichBlock
const context = {
  primaryCardName: 'Premium Card',
  creditLimit: '10,000 CZK',
  proposedCreditLimit: '15,000 CZK',
  creditLimitOfferBlock,
}

describe('CZ card chat handler', () => {
  it('keeps offer review and not-now actions ordered', () => {
    expect(resolveCzCardReply('show my credit limit offer', context)).toMatchObject({
      richBlocks: [creditLimitOfferBlock],
      followUps: [{ id: 'cz-limit-impact' }, { id: 'cz-limit-review' }, { id: 'cz-limit-not-now' }],
    })
  })

  it('declines non-card prompts', () => {
    expect(resolveCzCardReply('show recent messages', context)).toBeNull()
  })
})
