import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAccountLedgerMovements,
  getAccountLedgerRecord,
  getMovementCategoryTrend,
  saveAccountMovementChanges,
} from '@/features/accounts-payments/mobileFirstAccounts'
import {
  resetItalyFinancialState,
  getItalyFinancialSnapshot,
  selectAccountBalance,
  selectCardBalance,
  rechargePrepaidCard,
  repayCreditCard,
  registerCardInstallmentPlan,
  toCents,
} from '@/features/finance/italyFinancials'
import {
  getCardLedgerMovements,
  getCardLedgerRecord,
  createInstallmentSchedule,
} from '@/features/cards/mobileFirstCards'
import { ACCOUNT_DIRECTORY } from '@/experiences/pi/it/mobile-first/accountContent'
import { ITALY_CARDS } from '@/experiences/pi/it/mobile-first/cardsContent'
import { createAccountExcel } from '@/features/accounts-payments/mobileFirstAccountExports'
import { createCardMovementsExport } from '@/features/cards/mobileFirstCardsExport'
import { strFromU8, unzipSync } from 'fflate'
beforeEach(resetItalyFinancialState)

describe('Italian account and card financial adapters', () => {
  it('scopes movements and coherent available balances to each actual account', () => {
    const first = getAccountLedgerRecord(ACCOUNT_DIRECTORY[0]!)
    const second = getAccountLedgerRecord(ACCOUNT_DIRECTORY[1]!)
    expect(first.balance).not.toBe(second.balance)
    expect(first.listBalance).toBe(first.balance)
    expect(getAccountLedgerMovements(first.number)).not.toEqual(getAccountLedgerMovements(second.number))
  })
  it('reconstructs book and available balances from opening amounts, postings, and holds', () => {
    const snapshot = getItalyFinancialSnapshot()
    for (const account of snapshot.accounts) {
      const record = getAccountLedgerRecord({ ...account, balance: 999999 }, snapshot)
      const settled = snapshot.postings
        .filter((posting) => posting.ledgerId === `account:${account.number}` && posting.status === 'settled')
        .reduce((sum, posting) => sum + posting.amountCents, 0)
      expect(toCents(record.bookBalance)).toBe(account.openingBalanceCents + settled)
      expect(toCents(record.openingBalance) + toCents(record.settledNet)).toBe(toCents(record.bookBalance))
      expect(toCents(record.balance)).toBe(
        toCents(record.bookBalance) -
          toCents(record.pendingDebits) -
          toCents(record.otherUnavailable) +
          toCents(record.overdraft),
      )
    }
  })
  it('scopes card movements and prevents salary fixtures on card statements', () => {
    const credit = getCardLedgerRecord(ITALY_CARDS.find((c) => c.id === 'flexia')!)
    const rows = getCardLedgerMovements(credit.id)
    expect(rows.some((row) => row.name === 'Accredito stipendio')).toBe(false)
    expect(rows).not.toEqual(getCardLedgerMovements('genius'))
    expect(credit.available).toBeLessThanOrEqual(credit.limit)
    expect(credit.debt).toBeGreaterThanOrEqual(0)
  })
  it('preserves every cent of installment principal and models fees in its APR', () => {
    const plan = createInstallmentSchedule(100001, 3, 100)
    expect(plan.principalCents).toEqual([33333, 33333, 33335])
    expect(plan.paymentCents).toEqual([33433, 33433, 33435])
    expect(plan.principalCents.reduce((sum, n) => sum + n, 0)).toBe(100001)
    expect(plan.totalFeeCents).toBe(300)
    expect(plan.tan).toBe(0)
    expect(plan.taeg).toBeGreaterThan(0)
    expect(createInstallmentSchedule(100001, 3, 0).taeg).toBeCloseTo(0, 8)
  })
  it('exports pending and authorization statuses with the same dates and cents', () => {
    const account = createAccountExcel([
      {
        id: 'hold',
        name: 'Pending purchase',
        category: 'Shopping',
        date: '2025-02-28',
        amount: -10.01,
        icon: 'expenses',
        pending: true,
      },
    ])
    const card = createCardMovementsExport(
      [{ name: 'Authorization', category: 'Shopping', date: '2025-02-28', amount: -10.01, status: 'authorization' }],
      'xlsx',
    )
    for (const [bytes, status] of [
      [account, 'Da contabilizzare'],
      [card.bytes, 'Pre Autorizzazione'],
    ] as const) {
      const sheet = strFromU8(unzipSync(bytes)['xl/worksheets/sheet1.xml']!)
      expect(sheet).toContain('2025-02-28')
      expect(sheet).toContain('<v>-10.01</v>')
      expect(sheet).toContain(status)
    }
  })
  it('charts only settled category allocations and respects exclusions', () => {
    const rows = [
      { date: '2025-02-01', category: 'Shopping', amount: -10.01, pending: false },
      { date: '2025-02-02', category: 'Shopping', amount: -50, pending: true },
      { date: '2025-02-03', category: 'Shopping', amount: -20, excluded: true },
      {
        date: '2025-02-04',
        category: 'Shopping',
        amount: -100,
        splits: [
          { category: 'Shopping', amount: '30.01' },
          { category: 'Casa', amount: '69.99' },
        ],
      },
    ]
    const trend = getMovementCategoryTrend(rows, 'Shopping', '2025-02-28')
    expect(trend).toHaveLength(12)
    expect(trend.at(-1)).toMatchObject({ month: '2025-02', totalCents: 4002 })
    expect(trend.slice(0, -1).every((month) => month.totalCents === 0)).toBe(true)
  })
  it('updates shared annotations without changing event identity or ledger cents', () => {
    const before = getItalyFinancialSnapshot()
    const row = getAccountLedgerMovements('000012345').find((row) => row.id === '0-2')!
    saveAccountMovementChanges('000012345', row.id, {
      ...row,
      note: 'Saved on account',
      excluded: true,
      splits: [
        { category: 'Shopping', amount: '3.33' },
        { category: 'Casa', amount: '6.67' },
      ],
    })
    const after = getItalyFinancialSnapshot()
    expect(after.events.map((row) => row.id)).toEqual(before.events.map((row) => row.id))
    expect(selectAccountBalance(after, '000012345').bookBalanceCents).toBe(
      selectAccountBalance(before, '000012345').bookBalanceCents,
    )
    const cardRow = getCardLedgerMovements('my-one').find((row) => row.id === 'spotify')!
    expect(cardRow).toMatchObject({ note: 'Saved on account', excluded: true, splits: [-3.33, -6.67] })
    expect(getCardLedgerMovements('etica').find((row) => row.id === 'spotify')?.excluded).not.toBe(true)
  })
  it('posts paired funding and card entries only once for each approved operation', () => {
    const before = getItalyFinancialSnapshot()
    const accountCents = selectAccountBalance(before, '000012345').availableCents
    const prepaid = selectCardBalance(before, 'genius').availableCents
    expect(rechargePrepaidCard('genius', '000012345', 10001, 'adapter-topup').ok).toBe(true)
    expect(rechargePrepaidCard('genius', '000012345', 10001, 'adapter-topup').ok).toBe(true)
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents).toBe(accountCents - 10001)
    expect(selectCardBalance(getItalyFinancialSnapshot(), 'genius').availableCents).toBe(prepaid + 10001)
    const debt = selectCardBalance(getItalyFinancialSnapshot(), 'flexia').debtCents
    expect(repayCreditCard('flexia', '000012345', 3333, 'adapter-repayment').ok).toBe(true)
    expect(repayCreditCard('flexia', '000012345', 3333, 'adapter-repayment').ok).toBe(true)
    expect(selectCardBalance(getItalyFinancialSnapshot(), 'flexia').debtCents).toBe(debt - 3333)
  })
  it('allocates posted purchase principal without duplicating debt', () => {
    const before = getItalyFinancialSnapshot()
    const rows = getCardLedgerMovements('flexia').filter((row) => row.kind === 'purchase' && row.status === 'settled')
    const result = registerCardInstallmentPlan(
      'flexia',
      rows.map((row) => row.id),
      3,
    )
    expect(result.ok).toBe(true)
    expect(selectCardBalance(getItalyFinancialSnapshot(), 'flexia').debtCents).toBe(
      selectCardBalance(before, 'flexia').debtCents,
    )
    expect(result.plan?.schedule.reduce((sum, payment) => sum + payment.principalCents, 0)).toBe(
      result.plan?.principalCents,
    )
  })
  it('refuses debit installment plans and releases fully repaid premium principal and fees', () => {
    const debitRows = getCardLedgerMovements('my-one').filter(
      (row) => row.kind === 'purchase' && row.status === 'settled',
    )
    expect(
      registerCardInstallmentPlan(
        'my-one',
        debitRows.map((row) => row.id),
        3,
      ).ok,
    ).toBe(false)
    const creditRows = getCardLedgerMovements('flexia').filter(
      (row) => row.kind === 'purchase' && row.status === 'settled',
    )
    expect(
      registerCardInstallmentPlan(
        'flexia',
        creditRows.map((row) => row.id),
        3,
      ).ok,
    ).toBe(true)
    const debt = selectCardBalance(getItalyFinancialSnapshot(), 'flexia').debtCents
    expect(repayCreditCard('flexia', '000012345', debt, 'premium-full-payoff').ok).toBe(true)
    const card = getCardLedgerRecord(ITALY_CARDS.find((card) => card.id === 'flexia')!)
    expect(card.debt).toBe(0)
    expect(card.plans.reduce((sum, plan) => sum + plan.total, 0)).toBe(0)
    expect(card.availableCents).toBe(card.limitCents - card.pendingDebitCents)
  })
})
