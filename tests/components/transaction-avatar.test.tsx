// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar'
import { getPartyInitials } from '@/app/components/transactions/TransactionPartyAvatar'
import { getAccountTransactions } from '@/data/accountDetails'
import type { AccountTransaction } from '@/data/accountDetails'

const RO_PRIMARY = getAccountTransactions('RO', 0, 'RON')
const RO_SAVINGS = getAccountTransactions('RO', 100, 'RON')

function transaction(label: string, source = RO_PRIMARY): AccountTransaction {
  const found = source.find((candidate) => candidate.label === label)
  if (!found) throw new Error(`Expected a "${label}" transaction in the RO ledger`)
  return found
}

function visual(transactionToRender: AccountTransaction, presentation?: 'identity' | 'category') {
  const { container } = render(
    <TransactionAvatar transaction={transactionToRender} presentation={presentation} />,
  )
  return container
}

afterEach(cleanup)

describe('transaction avatar', () => {
  it('leads an own-account transfer with the payer behind and the destination in front', () => {
    const container = visual(transaction('Transfer to savings'))
    const pair = container.querySelector('[data-transaction-pair]')

    expect(pair).toHaveAttribute('aria-label', 'current account to savings account')
    expect(pair?.querySelector('[data-currency-flag="RON"]')).toBeInTheDocument()
    expect(pair?.querySelector('[data-transaction-pair-endpoint="savings"]')).toHaveClass('bg-[#007A91]', 'text-[var(--uc-static-white)]')
  })

  it('reverses the pair when the money comes back from savings', () => {
    const pair = visual(transaction('Transfer to Primary Account', RO_SAVINGS))
      .querySelector('[data-transaction-pair]')

    expect(pair).toHaveAttribute('aria-label', 'savings account to current account')
  })

  it('shows both flags on a currency exchange', () => {
    const container = visual(transaction('EUR → RON'))

    expect(container.querySelector('[data-transaction-pair]')).toHaveAttribute('aria-label', 'EUR to RON')
    expect(Array.from(container.querySelectorAll('[data-currency-flag]')).map(
      (flag) => flag.getAttribute('data-currency-flag'),
    )).toEqual(['EUR', 'RON'])
  })

  it('marks money sent to a counterparty with initials and an outgoing badge', () => {
    const party = visual(transaction('Apulum Residence')).querySelector('[data-transaction-party]')

    expect(party).toHaveAttribute('data-transaction-party', 'out')
    expect(party).toHaveAttribute('aria-label', 'Apulum Residence, outgoing payment')
    expect(party).toHaveTextContent('AR')
  })

  it('marks money received with an incoming badge', () => {
    const party = visual(transaction('Dante International')).querySelector('[data-transaction-party]')

    expect(party).toHaveAttribute('data-transaction-party', 'in')
    expect(party).toHaveAttribute('aria-label', 'Dante International, incoming payment')
  })

  it('keeps the merchant mark on a card purchase', () => {
    const container = visual(transaction('Carrefour'))

    expect(container.querySelector('[data-merchant-logo]')).toHaveAttribute('data-merchant-logo', 'carrefour')
    expect(container.querySelector('[data-transaction-party]')).toBeNull()
  })

  it('falls back to the category icon when there is no counterparty to show', () => {
    for (const label of ['ATM UniCredit', 'Cash deposit', 'UniCredit Bank Fee', 'Apple Pay Wallet', 'Piata Obor']) {
      const container = visual(transaction(label))

      expect(container.querySelector('[data-transaction-avatar="pfm-category"]'), label).not.toBeNull()
      expect(container.querySelector('[data-transaction-party]'), label).toBeNull()
    }
  })

  it('circles the category fallback so it matches the other identity marks', () => {
    const container = visual(transaction('ATM UniCredit'))

    expect(container.querySelector('[data-pfm-icon-variant]')).toHaveAttribute(
      'data-pfm-icon-variant',
      'category-circle',
    )
  })

  it('forces the category icon on PFM surfaces regardless of the counterparty', () => {
    for (const label of ['Carrefour', 'Transfer to savings', 'Apulum Residence']) {
      const container = visual(transaction(label), 'category')

      expect(container.querySelector('[data-transaction-avatar="pfm-category"]'), label).not.toBeNull()
      expect(container.querySelector('[data-merchant-logo]'), label).toBeNull()
      expect(container.querySelector('[data-transaction-pair]'), label).toBeNull()
    }
  })

  it('builds initials from the first two words of the counterparty name', () => {
    expect(getPartyInitials('Asociatia Proprietari Iancului')).toBe('AP')
    expect(getPartyInitials('Mihai Catalin Iacob')).toBe('MC')
    expect(getPartyInitials('CEZ')).toBe('CE')
  })
})
