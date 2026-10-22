import { describe, expect, it } from 'vitest'
import { resolveSectionDivider } from '@/app/components/contracts/sectionDivider'
import { resolveTransactionDivider } from '@/app/components/contracts/transactionDivider'
import { resolveNavigationRow } from '@/app/components/contracts/navigationRow'
import { resolveCardNavigationRow } from '@/app/components/contracts/cardNavigationRow'

describe('baseline row contracts', () => {
  it('keeps light, large and section widths and typography distinct', () => {
    expect(resolveSectionDivider()).toMatchObject({ width: undefined, fontSize: 14, lineMarginTop: 8 })
    expect(resolveSectionDivider({ variant: 'light-date' })).toMatchObject({
      width: 343,
      height: 24,
      titleToken: '--uc-action',
    })
    expect(resolveSectionDivider({ variant: 'large-two-line-title' })).toMatchObject({
      width: 375,
      fontSize: 20,
      hasLine: false,
    })
    expect(resolveSectionDivider({ variant: 'action-date-checkbox' })).toMatchObject({
      checkbox: true,
      minHeight: 53,
      paddingHorizontal: 24,
    })
    expect(resolveSectionDivider({ variant: 'with-counter', count: 0, secondaryText: 'unused' }).rightText).toBe('0')
  })
  it('retains date/month line and type differences', () => {
    expect(resolveTransactionDivider()).toMatchObject({ fontSize: 16, hasLine: true, hasTotal: false })
    expect(resolveTransactionDivider({ dateSeparator: true, total: '0' })).toMatchObject({
      fontSize: 14,
      hasLine: false,
      hasTotal: true,
    })
  })
  it('keeps nested and inert controls out of a row button', () => {
    expect(resolveNavigationRow({ hasOnClick: true }).rootKind).toBe('button')
    for (const options of [{ hasOnLinkClick: true }, { trailingAccessory: 'toggle' as const }, { hasTrailing: true }])
      expect(resolveNavigationRow({ hasOnClick: true, ...options }).rootKind).toBe('div')
    expect(resolveNavigationRow().rootKind).toBe('div')
  })
  it('preserves the shipped physical card art mapping', () => {
    expect(resolveCardNavigationRow().artVariant).toBe('mc-debit-gold')
    expect(resolveCardNavigationRow({ type: 'debit_card', id: 'card-3' }).artVariant).toBe('mc-debit-standard')
    expect(resolveCardNavigationRow({ type: 'credit_card', id: 'card-2' }).artVariant).toBe(
      'mc-credit-partner-standard',
    )
  })
})
