// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import Row from '@/app/components/accounts/AccountTransactionRow'
import { resolveTransactionRow } from '@/app/components/contracts/transactionRow'
import type { AccountTransaction } from '@/data/accountDetails'
import { LIST_SOURCE } from '@/app/components/contracts/listSource'

const pending: AccountTransaction = {
  id: 'list-pending',
  day: '1',
  month: 'OCT',
  monthKey: '2026-10',
  monthTitle: 'October',
  label: 'Transaction details',
  amount: -498,
  type: 'debit',
  category: 'Transfers',
  pfmCategory: 'Transfers',
  pfmSubcategory: 'Transfer',
  status: 'Pending',
  source: 'account',
}
afterEach(cleanup)

describe('List source geometry', () => {
  it('does not advertise an inert transaction as a button', () => {
    render(<Row transaction={pending} formattedAmount="498.00" currency="RON" leadingVisual={<span />} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Transaction details')).toBeVisible()
  })
  it('retains the complete Figma inventory and its independent category counts', () => {
    expect(LIST_SOURCE.variants).toHaveLength(46)
    expect(new Set(LIST_SOURCE.variants.map((v) => v.nodeId)).size).toBe(46)
    expect(new Set(LIST_SOURCE.variants.map((v) => v.key)).size).toBe(46)
    for (const [category, count] of Object.entries({ Default: 2, Special: 23, TRX: 8, Swipe: 13 })) {
      expect(LIST_SOURCE.variants.filter((v) => v.category === category)).toHaveLength(count)
    }
    expect(LIST_SOURCE.variants.find((v) => v.nodeId === '1517:2380')).toMatchObject({
      category: 'TRX',
      type: 'Pending',
      width: 375,
      height: 80,
    })
  })
  it('matches original TRX Pending 1517:2380 at 375 × 80 without changing Evo sizing', () => {
    const options = { pending: true, amount: -498, type: 'debit' as const, formattedAmount: '498.00' }
    expect(resolveTransactionRow(options).height).toBe(80)
    expect(resolveTransactionRow({ ...options, evo2027: true }).minHeight).toBe(92)
    const { container } = render(
      <Row transaction={pending} formattedAmount="498.00" currency="RON" leadingVisual={<span />} onClick={() => {}} />,
    )
    const row = container.querySelector('[data-pending-transaction-row]')!
    expect(row.className).toContain('min-h-[80px]')
    expect(row.className.split(' ')).not.toContain('h-[80px]')
    expect(row.className).not.toContain('h-[92px]')
    expect(row.className).toContain('py-[2px]')
    expect(container.querySelector('[data-pending-status]')?.className).toContain('h-[32px]')
  })

  it('keeps booked baseline geometry and the feature-owned formatted amount intact', () => {
    const state = resolveTransactionRow({ amount: -12, type: 'debit', formattedAmount: '1.234,56' })
    expect(state.height).toBe(80)
    expect(state.parts).toEqual({ integer: '1.234', separator: ',', decimals: '56' })
    expect(state.paddingVertical).toBe(18)
  })
})
