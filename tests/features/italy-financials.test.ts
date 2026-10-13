// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as finance from '@/features/finance/italyFinancials'

beforeEach(() => finance.resetItalyFinancialState())
afterEach(() => finance.resetItalyFinancialState())

describe('Italy canonical financial ledger', () => {
  it('reconstructs account books and availability from opening, postings and reservations', () => {
    const state = finance.getItalyFinancialSnapshot()
    for (const account of state.accounts) {
      const balance = finance.selectAccountBalance(state, account.number)
      expect(balance.bookBalanceCents).toBe(account.openingBalanceCents + balance.settledNetCents)
      expect(balance.availableCents).toBe(
        balance.bookBalanceCents - balance.pendingDebitCents - account.otherUnavailableCents + account.overdraftCents,
      )
    }
    expect(finance.selectAccountBalance(state, '000012345').availableCents).toBe(5355027)
    expect(finance.selectAccountBalance(state, '000067890').availableCents).toBe(1805000)
  })
  it('uses one economic identity for a debit-card purchase and its account posting', () => {
    const state = finance.getItalyFinancialSnapshot()
    const bank = finance.getFinanceEventForMovement(state, 'account', '000012345', '0-2')!
    const card = finance.getFinanceEventForMovement(state, 'card', 'my-one', 'spotify')!
    expect(bank.id).toBe(card.id)
    expect(state.postings.filter((p) => p.eventId === bank.id)).toHaveLength(1)
    expect(finance.selectCardBalance(state, 'my-one').availableCents).toBe(
      finance.selectAccountBalance(state, '000012345').availableCents,
    )
    expect(finance.getAccountFinanceMovements(state, '000011223')).toEqual([])
  })
  it('recharges once, moving equal cents between account and prepaid without an expense', () => {
    const before = finance.getItalyFinancialSnapshot()
    const bank = finance.selectAccountBalance(before, '000012345').bookBalanceCents
    const prepaid = finance.selectCardBalance(before, 'genius').bookBalanceCents
    expect(finance.rechargePrepaidCard('genius', '000012345', 12345, 'topup-test').ok).toBe(true)
    expect(finance.rechargePrepaidCard('genius', '000012345', 12345, 'topup-test').ok).toBe(true)
    const after = finance.getItalyFinancialSnapshot()
    expect(finance.selectAccountBalance(after, '000012345').bookBalanceCents).toBe(bank - 12345)
    expect(finance.selectCardBalance(after, 'genius').bookBalanceCents).toBe(prepaid + 12345)
    expect(after.events.find((e) => e.id === 'topup-test')).toMatchObject({ kind: 'topup', amountCents: 0 })
  })
  it('reserves fee-inclusive investment cash, releases or settles without debiting twice', () => {
    const before = finance.selectAccountBalance(finance.getItalyFinancialSnapshot(), '000012345')
    expect(finance.reserveAccountFunds('000012345', 10015, 'order-a', 'Acquisto titolo', { feeCents: 15 }).ok).toBe(
      true,
    )
    const held = finance.selectAccountBalance(finance.getItalyFinancialSnapshot(), '000012345')
    expect(held.bookBalanceCents).toBe(before.bookBalanceCents)
    expect(held.availableCents).toBe(before.availableCents - 10015)
    expect(finance.settleFinancialReservation('order-a').ok).toBe(true)
    expect(finance.settleFinancialReservation('order-a').ok).toBe(true)
    const state = finance.getItalyFinancialSnapshot()
    expect(finance.selectAccountBalance(state, '000012345').bookBalanceCents).toBe(before.bookBalanceCents - 10015)
    expect(finance.selectAccountBalance(state, '000012345').availableCents).toBe(before.availableCents - 10015)
    expect(state.events.find((e) => e.id === 'order-a:fee')).toMatchObject({ kind: 'fee', amountCents: -15 })
    expect(finance.releaseFinancialReservation('order-a').ok).toBe(false)
    finance.reserveAccountFunds('000012345', 9000, 'order-b', 'Ordine')
    expect(finance.releaseFinancialReservation('order-b').ok).toBe(true)
    expect(finance.releaseFinancialReservation('order-b').ok).toBe(true)
    expect(finance.selectAccountBalance(finance.getItalyFinancialSnapshot(), '000012345').availableCents).toBe(
      before.availableCents - 10015,
    )
  })
  it('rejects overspending, invalid cents and installment plans on debit cards', () => {
    expect(finance.reserveAccountFunds('000012345', 999999999, 'too-large', 'Ordine').ok).toBe(false)
    expect(finance.rechargePrepaidCard('genius', '000012345', 1.5, 'fraction').ok).toBe(false)
    expect(finance.registerCardInstallmentPlan('my-one', ['paypal', 'paypal-feb', 'netflix-feb'], 3).ok).toBe(false)
    expect(finance.changeCreditLimit('my-one', 400000).ok).toBe(false)
  })
  it('conserves split cents and propagates one annotation to linked views', () => {
    expect(finance.setEventAnnotations('primary:0-2', { splits: [{ category: 'Casa', amountCents: 999 }] }).ok).toBe(
      false,
    )
    expect(
      finance.setEventAnnotations('primary:0-2', {
        category: 'Tempo libero',
        excluded: true,
        splits: [
          { category: 'Casa', amountCents: 600 },
          { category: 'Tempo libero', amountCents: 400 },
        ],
      }).ok,
    ).toBe(true)
    const state = finance.getItalyFinancialSnapshot()
    expect(finance.getAccountFinanceMovements(state, '000012345').find((m) => m.id === '0-2')).toMatchObject({
      category: 'Tempo libero',
      excluded: true,
    })
    expect(finance.getCardFinanceMovements(state, 'my-one').find((m) => m.id === 'spotify')).toMatchObject({
      category: 'Tempo libero',
      excluded: true,
    })
  })
  it('allocates repayments to outstanding plans and removes unaccrued fees at full payoff', () => {
    const result = finance.registerCardInstallmentPlan('flexia', ['edison', 'paypal', 'paypal-feb'], 3)
    expect(result.ok).toBe(true)
    const before = finance.selectCardBalance(finance.getItalyFinancialSnapshot(), 'flexia')
    expect(result.plan!.schedule.reduce((s, r) => s + r.principalCents, 0)).toBe(result.plan!.principalCents)
    expect(result.plan!.schedule.reduce((s, r) => s + r.paymentCents, 0)).toBe(result.plan!.principalCents + 300)
    finance.repayCreditCard('flexia', '000012345', before.debtCents, 'payoff')
    const after = finance.selectCardBalance(finance.getItalyFinancialSnapshot(), 'flexia')
    expect(after.debtCents).toBe(0)
    expect(after.plans.reduce((s, p) => s + (p.remainingPrincipalCents ?? p.principalCents), 0)).toBe(0)
    expect(after.availableCents).toBe(after.limitCents - after.pendingDebitCents)
  })
  it('does not turn already paid purchases into new installment debt', () => {
    const debt = finance.selectCardBalance(finance.getItalyFinancialSnapshot(), 'flexia').debtCents
    finance.repayCreditCard('flexia', '000012345', debt, 'full-pay-before-plan')
    expect(finance.registerCardInstallmentPlan('flexia', ['edison', 'paypal', 'paypal-feb'], 3).ok).toBe(false)
    expect(finance.selectCardBalance(finance.getItalyFinancialSnapshot(), 'flexia').debtCents).toBe(0)
    expect(finance.getItalyFinancialSnapshot().plans).toHaveLength(0)
  })
  it('excludes a partially repaid purchase while retaining later unpaid purchases', () => {
    // Opening debt €846.98 is repaid first, then €30 of the oldest €130 PayPal purchase.
    finance.repayCreditCard('flexia', '000012345', 87698, 'partial-pay')
    const state = finance.getItalyFinancialSnapshot()
    expect(finance.getCardUnpaidPurchaseCents(state, 'flexia', 'paypal-feb')).toBe(10000)
    expect(finance.getCardUnpaidPurchaseCents(state, 'flexia', 'edison')).toBe(10000)
    expect(finance.registerCardInstallmentPlan('flexia', ['edison', 'paypal', 'paypal-feb'], 3).ok).toBe(false)
    expect(finance.selectCardBalance(state, 'flexia').debtCents).toBe(37000)
  })
  it('restores cash and reservations alongside persisted investment positions after reload', async () => {
    finance.reserveAccountFunds('000012345', 12345, 'reload-order', 'Ordine')
    finance.settleFinancialReservation('reload-order')
    const before = finance.selectAccountBalance(finance.getItalyFinancialSnapshot(), '000012345').bookBalanceCents
    vi.resetModules()
    const reloaded = await import('@/features/finance/italyFinancials')
    expect(reloaded.selectAccountBalance(reloaded.getItalyFinancialSnapshot(), '000012345').bookBalanceCents).toBe(
      before,
    )
    expect(reloaded.settleFinancialReservation('reload-order').ok).toBe(true)
    expect(reloaded.selectAccountBalance(reloaded.getItalyFinancialSnapshot(), '000012345').bookBalanceCents).toBe(
      before,
    )
    reloaded.resetItalyFinancialState()
  })
  it('releases only obsolete historical security holds when restoring an older snapshot', async () => {
    finance.reserveAccountFunds('000012345', 12318, 'it-security:91198960', 'Ordine storico')
    finance.reserveAccountFunds('000012345', 12318, 'it-security:91198961', 'Ordine storico')
    finance.reserveAccountFunds('000012345', 5000, 'current-order', 'Ordine corrente')
    const book = finance.selectAccountBalance(finance.getItalyFinancialSnapshot(), '000012345').bookBalanceCents
    vi.resetModules()
    const restored = await import('@/features/finance/italyFinancials')
    const state = restored.getItalyFinancialSnapshot()
    expect(restored.selectAccountBalance(state, '000012345').availableCents).toBe(book - 9000 - 5000)
    expect(state.reservations.find((r) => r.key === 'current-order')?.status).toBe('reserved')
    expect(state.reservations.find((r) => r.key === 'it-security:91198960')?.status).toBe('released')
    restored.resetItalyFinancialState()
  })
})
