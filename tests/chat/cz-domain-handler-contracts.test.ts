import { readFileSync } from 'node:fs'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { CHAT_INTENTS } from '@/app/chat/nlu'
import { buildCzChatNormalizedContext } from '@/app/chat/cz/normalizedContext'
import { buildCzChatRequest, CZ_CHAT_ORDERED_HANDLERS, resolveCzChatDomainReply } from '@/app/chat/cz/orderedHandlers'
import type { CzChatSmartReplyOptions } from '@/app/chat/cz/helpers'
import type { CoAppingReplyResult } from '../../package/mobile-pi-coapping-chat-package/src'
import { selectedInvestmentSecurity } from '../fixtures/chat/cz-chat-profile'

// This table pins actual canonical dispatch, including the legacy broad
// settings predicate that precedes generic card-security and support replies.
const expectedIntentHandlers = {
  'save-capacity': 'SavingsPlan',
  'home-overview': 'HomeOverview',
  'product-shelf': 'ProductShelf',
  'latest-transactions': 'AccountActivity',
  'unusual-spending': 'AccountActivity',
  'available-vs-owed': 'AccountActivity',
  'spending-month': 'Spending',
  subscriptions: 'Spending',
  'spending-categories': 'Spending',
  'reduce-spending': 'Spending',
  'new-payment': 'Payments',
  'payment-limits-fees': 'Payments',
  'payment-confirmation': 'Documents',
  'recurring-vs-template': 'Payments',
  'products-compare': 'ProductChoices',
  'products-savings-investing': 'ProductChoices',
  'products-borrowing': 'ProductChoices',
  'credit-limit-offer': 'credit-limits',
  'card-security': 'CardServicing',
  'card-limits': 'CardServicing',
  'card-transactions': 'CardServicing',
  'account-balance': 'AccountDetail',
  'account-details': 'AccountDetail',
  'account-filter': 'AccountDetail',
  'savings-interest': 'SavingsDetail',
  'loan-early-repay': 'Borrowing',
  'investment-goal': 'InvestmentGoal',
  'investment-portfolio': 'InvestmentPortfolio',
  'investment-orders': 'InvestmentPortfolio',
  'investment-next-move': 'InvestmentPortfolio',
  'documents-find': 'Documents',
  'documents-legal': 'Documents',
  messages: 'prime-messages-contacts-support',
  'contact-support': 'Settings',
  'settings-security': 'Settings',
} as const

// The protected input used the 7 October 2026 civil day; portfolio fixtures
// derive their price date at module evaluation. Freeze only Date for this suite.
vi.hoisted(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-07T12:00:00Z'))
})
afterAll(() => vi.useRealTimers())

const contracts = JSON.parse(
  readFileSync(new URL('../fixtures/chat/cz-reply-contracts.json', import.meta.url), 'utf8'),
) as {
  profiles: Record<string, CzChatSmartReplyOptions>
  rows: { profile: string; input: string; reply: CoAppingReplyResult }[]
}
const options = contracts.profiles.selected
if (!options) throw new Error('Missing selected profile')
const context = buildCzChatNormalizedContext(options)

it('covers every implemented catalog intent explicitly', () => {
  expect(Object.keys(expectedIntentHandlers).sort()).toEqual(CHAT_INTENTS.map((intent) => intent.id).sort())
})

for (const intent of CHAT_INTENTS)
  it(`independent handler for ${intent.id} preserves its full canonical reply`, () => {
    const request = buildCzChatRequest(intent.canonicalPrompt, [], context)
    const firstMatch = CZ_CHAT_ORDERED_HANDLERS.find((handler) => handler.resolve(request, context) !== null)
    expect(firstMatch?.id).toBe(expectedIntentHandlers[intent.id as keyof typeof expectedIntentHandlers])
    const expected = contracts.rows.find((row) => row.profile === 'selected' && row.input === intent.canonicalPrompt)
    expect(expected).toBeDefined()
    expect(JSON.parse(JSON.stringify(firstMatch?.resolve(request, context)))).toEqual(expected?.reply)
  })

for (const handler of CZ_CHAT_ORDERED_HANDLERS)
  it(`${handler.id} allows later domains to handle unrelated input`, () => {
    const request = buildCzChatRequest('a completely unrelated greeting', [], context)
    expect(handler.resolve(request, context)).toBeNull()
  })

it('returns no match from the pipeline so the public NLU and fallback can run', () => {
  expect(resolveCzChatDomainReply(buildCzChatRequest('hello there', [], context), context)).toBeNull()
})

describe('overlapping domain precedence', () => {
  const rows = [
    ['financial overview credit limit offer', 'credit-limits'],
    ['card security settings', 'Settings'],
    ['signing investment orders', 'Payments'],
    ['legal notices payment limits', 'Documents'],
    ['saving account and term deposit account details', 'SavingsPlan'],
    ['recurring payments investment orders', 'Spending'],
    ['interest rate next investment step', 'Borrowing'],
  ] as const
  for (const [input, owner] of rows)
    it(`${input} keeps the original first match`, () => {
      const request = buildCzChatRequest(input, [], context)
      const firstMatch = CZ_CHAT_ORDERED_HANDLERS.find((handler) => handler.resolve(request, context) !== null)
      expect(firstMatch?.id).toBe(owner)
      expect(resolveCzChatDomainReply(request, context)).toEqual(firstMatch?.resolve(request, context))
    })
})

it('freezes its own selected data without freezing caller-owned objects', () => {
  const security = { ...selectedInvestmentSecurity }
  const account = {
    id: 'snapshot-account',
    type: 'current_account' as const,
    name: 'Snapshot account',
    accountNumber: '1234',
    balance: 500,
    currency: 'CZK' as const,
  }
  const categories = [{ key: 'accounts' as const, title: 'Accounts', products: [account] }]
  const snapshot = buildCzChatNormalizedContext({
    country: 'CZ',
    categories,
    selectedAccountProduct: account,
    selectedCardProduct: null,
    creditCardForOpportunity: null,
    selectedInvestmentSecurity: security,
  })
  expect(Object.isFrozen(snapshot)).toBe(true)
  expect(Object.isFrozen(snapshot.selectedInvestmentSecurity)).toBe(true)
  expect(Object.isFrozen(snapshot.categories)).toBe(true)
  expect(Object.isFrozen(snapshot.currentAccounts[0])).toBe(true)
  expect(Object.isFrozen(snapshot.homeSnapshotBlock)).toBe(true)
  expect(Object.isFrozen(snapshot.documentBlock)).toBe(true)
  expect(Object.isFrozen(security)).toBe(false)
  expect(Object.isFrozen(categories)).toBe(false)
  expect(Object.isFrozen(account)).toBe(false)
  account.balance = 0
  expect(snapshot.currentAccounts[0]?.balance).toBe(500)
  expect(snapshot.accountBalance).toBe('500,00 CZK')
})
