import { describe, expect, it } from 'vitest'
import { creditLimitOpportunityNudge } from '@/features/cards/credit-limit/opportunityNudge'
import type { CreditCard, CurrentAccount } from '@/data/products'

const card: CreditCard = {
  id: 'credit-1',
  type: 'credit_card',
  name: 'Credit card',
  accountNumber: '5173000000000001',
  balance: 100,
  currency: 'CZK',
  cardType: 'Standard',
  cardNumber: '5173000000000001',
  expiryDate: '12/28',
  creditLimit: 10000,
  availableCredit: 9900,
}
const account: CurrentAccount = {
  id: 'account-1',
  type: 'current_account',
  name: 'Account',
  accountNumber: '12345',
  balance: 200,
  currency: 'CZK',
}

describe('the existing CZ credit opportunity policy', () => {
  it('offers the exact existing Source content only on eligible cards', () => {
    expect(creditLimitOpportunityNudge(true, card)).toMatchObject({
      title: 'Upgrade your credit limit to 15 000 CZK',
      ctaLabel: 'FIND OUT MORE',
    })
    expect(creditLimitOpportunityNudge(false, card)).toBeNull()
    expect(creditLimitOpportunityNudge(true, account)).toBeNull()
    expect(creditLimitOpportunityNudge(true, null)).toBeNull()
  })
  it('suppresses an already accepted card override, including zero, without affecting another card', () => {
    expect(creditLimitOpportunityNudge(true, card, { [card.id]: 15000 })).toBeNull()
    expect(creditLimitOpportunityNudge(true, card, { [card.id]: 0 })).toBeNull()
    expect(creditLimitOpportunityNudge(true, card, { unrelated: 15000 })).not.toBeNull()
    expect(card.creditLimit).toBe(10000)
  })
})
