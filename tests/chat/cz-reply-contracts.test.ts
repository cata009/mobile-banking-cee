import { readFileSync } from 'node:fs'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { buildCzChatSmartReplyResolver } from '@/app/chat/czChatOrchestration'
import type { CzChatSmartReplyOptions } from '@/app/chat/cz/helpers'
import type { CoAppingChatMessage, CoAppingReplyResult } from '../../package/mobile-pi-coapping-chat-package/src'
import { selectedInvestmentSecurity } from '../fixtures/chat/cz-chat-profile'

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
  rows: { profile: string; input: string; messages: CoAppingChatMessage[]; reply: CoAppingReplyResult }[]
}

describe('current-input Czech reply equivalence', () => {
  const resolvers = Object.fromEntries(
    Object.entries(contracts.profiles).map(([id, options]) => [id, buildCzChatSmartReplyResolver(options)]),
  )
  for (const row of contracts.rows)
    it(`${row.profile}: ${row.input}`, async () => {
      const resolver = resolvers[row.profile]
      if (!resolver) throw new Error(`Missing characterized profile: ${row.profile}`)
      const result = await resolver(row.input, row.messages)
      expect(JSON.parse(JSON.stringify(result))).toEqual(row.reply)
    })
})

it('keeps the selected security snapshot stable when the caller mutates its input', async () => {
  const security = { ...selectedInvestmentSecurity }
  const resolver = buildCzChatSmartReplyResolver({
    country: 'CZ',
    categories: [],
    selectedAccountProduct: null,
    selectedCardProduct: null,
    creditCardForOpportunity: null,
    selectedInvestmentSecurity: security,
  })
  const input = 'Explain this product.'
  const before = await resolver(input, [])
  security.title = 'Caller replacement security'
  security.marketPrice = 1
  const after = await resolver(input, [])
  expect(after).toEqual(before)
})
