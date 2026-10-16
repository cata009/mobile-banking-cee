import { describe, expect, it } from 'vitest'
import { auditCardDetailsFlow, readCardDetailsAuditSources } from '../../scripts/audit-card-details-flow.mjs'

const sources = await readCardDetailsAuditSources()

describe('Native card security audit', () => {
  it('accepts the actual shared Native owner and compatibility entries', () => {
    expect(() => auditCardDetailsFlow(sources)).not.toThrow()
  })

  it.each([
    ['an ungated reveal', 'card', 'if (active.current && authCard === card.id)', 'if (true)'],
    ['a second reveal path', 'card', 'setSensitiveCard(null)', 'setSensitiveCard(card.id)'],
    ['sensitive data in direct information', 'info', 'Card status', 'Card CVV2/CVC2'],
    ['copying a masked value', 'card', "copyCard(card.cardNumber, 'Card number')", "copyCard('****', 'Card number')"],
    [
      'a clipped carousel shadow',
      'card',
      'rail: { paddingHorizontal: 24, gap: 24, paddingTop: 8, paddingBottom: 28 }',
      'rail: { paddingHorizontal: 24, gap: 24, paddingTop: 8, paddingBottom: 0 }',
    ],
  ])('rejects %s', (_label, key, before, after) => {
    expect(sources[key]).toContain(before)
    const corrupted = { ...sources, [key]: sources[key].replace(before, after) }
    expect(() => auditCardDetailsFlow(corrupted)).toThrow()
  })
})
