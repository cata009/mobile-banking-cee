import { afterEach, describe, expect, it } from 'vitest'
import {
  DEMO_UNREAD_MESSAGES,
  homeHeaderUsesContact,
  needsCurrentAccountFallback,
  sortPendingActions,
} from '@/features/products/homeSurfaces'
import {
  canShareAccountDetails,
  classifySlovenianAccount,
  formatIbanGroups,
  getAccountCapabilities,
  getAccountFacts,
  getAccountIdentifiers,
  getCardCapabilities,
  getCreditCardFacts,
  getLinkedAccountIds,
  isCardExpired,
} from '@/features/products/productFacts'
import { clearLinkedAccountOverrides, setLinkedAccountOverride } from '@/features/products/cardLinkedAccounts'

describe('account facts', () => {
  const account = { id: 'a', type: 'current_account', balance: 30000, currency: 'EUR' } as const

  it('derives a consistent ledger balance from the available funds', () => {
    const facts = getAccountFacts(account, 'SK')
    // The demo overdraft equals the 20 000 uplift of the baseline available funds.
    expect(facts.availableFunds).toBe(30000)
    expect(facts.overdraftLimit).toBe(20000)
    expect(facts.ledgerBalance).toBe(30000 - facts.overdraftLimit + facts.blockedAmount)
    expect(facts.status).toBe('ACTIVE')
    expect(getAccountFacts(account, 'SK', { blocked: true }).status).toBe('BLOCKED')
  })

  it('shows debit interest only when an overdraft exists and tiers only in CZ and SK', () => {
    expect(getAccountFacts(account, 'SK').interest.debit).not.toBeNull()
    expect(getAccountFacts(account, 'SK').interest.credit).toHaveLength(2)
    expect(getAccountFacts(account, 'HU').interest.credit).toHaveLength(1)
    const savings = getAccountFacts({ ...account, type: 'saving_account' }, 'SK')
    expect(savings.interest.debit).toBeNull()
    expect(savings.overdraftLimit).toBe(0)
  })
})

describe('credit card facts', () => {
  it('splits the drawn amount into statement due, minimum due and total due', () => {
    const facts = getCreditCardFacts({ creditLimit: 1000, availableCredit: 400, currency: 'EUR' })
    expect(facts).toMatchObject({ drawn: 600, statementDue: 150, minimumDue: 30, totalDue: 600 })
  })
})

describe('account identifiers', () => {
  const iban = 'RO44BACX1234567890123402'

  it('spaces the IBAN by four and copies it without spaces', () => {
    expect(formatIbanGroups(iban)).toBe('RO44 BACX 1234 5678 9012 3402')
    expect(getAccountIdentifiers('RO', iban)).toEqual([
      { key: 'iban', label: 'IBAN', value: 'RO44 BACX 1234 5678 9012 3402', copyValue: iban },
    ])
  })

  it('adds the local number in CZ, HU and RS and the BBAN in BIH', () => {
    expect(getAccountIdentifiers('CZ', iban).map((item) => item.key)).toEqual(['accountNumber', 'iban'])
    expect(getAccountIdentifiers('CZ', iban)[0]!.value).toMatch(/^000000-\d{10}\/2700$/)
    expect(getAccountIdentifiers('HU', iban)[0]!.value).toMatch(/^HUOBUD-\d{8}$/)
    expect(getAccountIdentifiers('RS', iban)[0]!.value).toMatch(/^\d{18}$/)
    expect(getAccountIdentifiers('BA', iban).map((item) => item.key)).toEqual(['bban', 'iban'])
  })

  it('hides the IBAN in BIH when the identifier is only a 16-digit BBAN', () => {
    expect(getAccountIdentifiers('BA', '1234567890123456').map((item) => item.key)).toEqual(['bban'])
  })

  it('classifies Slovenian SI56 accounts as current accounts', () => {
    expect(classifySlovenianAccount('SI56BACX2900000000123456')).toBe('current_account')
    expect(classifySlovenianAccount('SI12BACX2900000000123456')).toBe('saving_account')
  })
})

describe('country capabilities', () => {
  it('disables nickname changes in HU and RS and limits CZ and SK to 20 characters', () => {
    expect(getAccountCapabilities('HU').nickname.enabled).toBe(false)
    expect(getAccountCapabilities('RS').nickname.enabled).toBe(false)
    expect(getAccountCapabilities('CZ').nickname).toEqual({ enabled: true, maxLength: 20 })
    expect(getAccountCapabilities('SK').nickname).toEqual({ enabled: true, maxLength: 20 })
    expect(getAccountCapabilities('SI').nickname.maxLength).toBe(30)
  })

  it('allows sharing per country and product type', () => {
    expect(canShareAccountDetails('RO', 'loan')).toBe(true)
    expect(canShareAccountDetails('RO', 'term_deposit')).toBe(true)
    expect(canShareAccountDetails('CZ', 'term_deposit')).toBe(false)
    expect(canShareAccountDetails('HU', 'term_deposit')).toBe(true)
    expect(canShareAccountDetails('HU', 'loan')).toBe(false)
    expect(getAccountCapabilities('CZ').share.fieldSelection).toBe(true)
  })

  it('supports multi-account debit cards only in CZ and SK', () => {
    expect(getCardCapabilities('CZ')).toEqual({ multiAccountLinking: true, spendFromAccount: true })
    expect(getCardCapabilities('RO')).toEqual({ multiAccountLinking: false, spendFromAccount: false })
  })
})

describe('linked accounts of a debit card', () => {
  afterEach(() => clearLinkedAccountOverrides())
  const ids = ['acc-1', 'acc-2']

  it('links the first card to every current account in CZ and SK, to its own account elsewhere', () => {
    expect(getLinkedAccountIds({ id: 'c', linkedAccountId: 'acc-1' }, ids, 'CZ')).toEqual(['acc-1', 'acc-2'])
    expect(getLinkedAccountIds({ id: 'c', linkedAccountId: 'acc-2' }, ids, 'CZ')).toEqual(['acc-2'])
    expect(getLinkedAccountIds({ id: 'c', linkedAccountId: 'acc-1' }, ids, 'RO')).toEqual(['acc-1'])
  })

  it('follows the debit priority saved with "Spend from account" and keeps at least one account', () => {
    expect(setLinkedAccountOverride('c', ['acc-2', 'acc-1'])).toBe(true)
    expect(getLinkedAccountIds({ id: 'c', linkedAccountId: 'acc-1' }, ids, 'CZ')).toEqual(['acc-2', 'acc-1'])
    expect(setLinkedAccountOverride('c', [])).toBe(false)
  })
})

describe('card expiry', () => {
  it('expires a card after the last day of its MM/YY month', () => {
    expect(isCardExpired('12/29', new Date(2026, 10, 16))).toBe(false)
    expect(isCardExpired('10/26', new Date(2026, 10, 16))).toBe(true)
    expect(isCardExpired('11/26', new Date(2026, 10, 30))).toBe(false)
    expect(isCardExpired('11/26', new Date(2026, 11, 1))).toBe(true)
  })
})

describe('Home surfaces', () => {
  it('shows Contact instead of Profile only in Slovenia and Bosnia', () => {
    expect(homeHeaderUsesContact('SI')).toBe(true)
    expect(homeHeaderUsesContact('BA')).toBe(true)
    expect(homeHeaderUsesContact('BA_BL')).toBe(true)
    for (const country of ['RO', 'CZ', 'SK', 'HU', 'RS'] as const) expect(homeHeaderUsesContact(country)).toBe(false)
    expect(DEMO_UNREAD_MESSAGES).toBeGreaterThan(0)
  })

  it('sorts pending actions: 3DS, PSD2 refusals, signatures, then the rest', () => {
    const order = sortPendingActions([
      { kind: 'signature' },
      { kind: 'secondary-identifiers' },
      { kind: '3ds' },
      { kind: 'psd2-refusal' },
    ]).map((action) => action.kind)
    expect(order).toEqual(['3ds', 'psd2-refusal', 'signature', 'secondary-identifiers'])
  })

  it('falls back for a single non-current product only', () => {
    expect(needsCurrentAccountFallback([{ type: 'loan' }])).toBe(true)
    expect(needsCurrentAccountFallback([{ type: 'current_account' }])).toBe(false)
    expect(needsCurrentAccountFallback([{ type: 'loan' }, { type: 'debit_card' }])).toBe(false)
  })
})
