import { describe, expect, it } from 'vitest'
import { changeVirtualCardPicture, issueVirtualCard, readVirtualCards } from '@/features/cards/virtual-card/model'
import type { CurrentAccount } from '@/data/products'

const account: CurrentAccount = {
  id: 'a1',
  type: 'current_account',
  name: 'Primary Account',
  accountNumber: 'RO57BACX0000007913550000',
  currency: 'RON',
  balance: 120,
}
const scope = { country: 'RO' as const, bankingScenario: 'retail-single-account' as const }

describe('Romanian virtual cards', () => {
  it('issues a linked card only with an eligible account and accepted terms', () => {
    expect(issueVirtualCard({}, scope, { account, design: 'blue', termsAccepted: false })).toEqual({})
    const state = issueVirtualCard({}, scope, { account, design: 'blue', termsAccepted: true })
    expect(readVirtualCards(state, scope)).toMatchObject([{ linkedAccountId: 'a1', design: 'blue', currency: 'RON' }])
    expect(readVirtualCards(state, { ...scope, country: 'CZ' })).toEqual([])
    expect(
      readVirtualCards(issueVirtualCard(state, scope, { account, design: 'clean-green', termsAccepted: true }), scope),
    ).toHaveLength(2)
  })

  it('changes only the selected issued virtual card', () => {
    const state = issueVirtualCard({}, scope, { account, design: 'blue', termsAccepted: true })
    const id = readVirtualCards(state, scope)[0]!.id
    expect(readVirtualCards(changeVirtualCardPicture(state, scope, id, 'clean-green'), scope)[0]!.design).toBe(
      'clean-green',
    )
    expect(changeVirtualCardPicture(state, scope, 'unknown', 'clean-green')).toBe(state)
  })

  it('rejects ineligible currency and limits issue to two cards per day', () => {
    const draft = { account, design: 'blue' as const, termsAccepted: true, issuedOn: '2026-10-29' }
    expect(
      readVirtualCards(issueVirtualCard({}, scope, { ...draft, account: { ...account, currency: 'USD' } }), scope),
    ).toHaveLength(1)
    expect(issueVirtualCard({}, scope, { ...draft, account: { ...account, currency: 'GBP' } })).toEqual({})
    const once = issueVirtualCard({}, scope, draft)
    const twice = issueVirtualCard(once, scope, draft)
    expect(issueVirtualCard(twice, scope, draft)).toBe(twice)
    expect(readVirtualCards(issueVirtualCard(twice, scope, { ...draft, issuedOn: '2026-10-30' }), scope)).toHaveLength(
      3,
    )
  })

  it('allows issuing and changing between Ferrari photographic designs', () => {
    const issued = issueVirtualCard({}, scope, { account, design: 'ferrari-evening', termsAccepted: true })
    const card = readVirtualCards(issued, scope)[0]!
    expect(card.design).toBe('ferrari-evening')
    expect(
      readVirtualCards(changeVirtualCardPicture(issued, scope, card.id, 'ferrari-mountain'), scope)[0]!.design,
    ).toBe('ferrari-mountain')
  })

  it('keeps a Gold card Gold and excludes Standard-only Ferrari designs', () => {
    const gold = issueVirtualCard({}, scope, { account, design: 'cat', tier: 'Gold', termsAccepted: true })
    const card = readVirtualCards(gold, scope)[0]!
    expect(card.cardType).toBe('Gold')
    expect(changeVirtualCardPicture(gold, scope, card.id, 'ferrari-evening')).toBe(gold)
    expect(readVirtualCards(changeVirtualCardPicture(gold, scope, card.id, 'tennis'), scope)[0]!.cardType).toBe('Gold')
    expect(
      issueVirtualCard({}, scope, { account, design: 'ferrari-evening', tier: 'Gold', termsAccepted: true }),
    ).toEqual({})
  })
})
