// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import {
  selectPfmSummary,
  getPfmWealthSummary,
  getPfmDateRange,
  selectPfmCategoryTransactions,
} from '@/features/analytics/mobileFirstPfm'
import { getPfmBudgetSnapshot, savePfmBudget, resetPfmBudget } from '@/features/analytics/mobileFirstPfmState'
import { getItalyPfmFinancialInput } from '@/experiences/pi/it/mobile-first/pfmFinancialContent'
import {
  getItalyFinancialSnapshot,
  resetItalyFinancialState,
  selectAccountBalance,
  selectCardBalance,
} from '@/features/finance/italyFinancials'
import { buildLoanPortfolio } from '@/features/credit/mobileFirstLoans'
import { getItalyInvestmentWealth } from '@/features/investments/mobileFirstValuation'

const event = (id: string, amountCents: number, date = '2025-02-28') => ({
  id,
  name: id,
  amountCents,
  date,
  status: 'settled' as const,
  kind: amountCents > 0 ? ('income' as const) : ('purchase' as const),
  category: 'Casa',
  accountNumbers: ['a'],
  cardIds: ['c'],
})
const input = { accountNumbers: ['a'], cardIds: ['c'], wealth: [] }
describe('Italian canonical PFM selectors', () => {
  it('rejects invalid budget cents and restores saved targets after reload', async () => {
    resetPfmBudget()
    const initial = getPfmBudgetSnapshot()
    savePfmBudget({ targetCents: NaN })
    expect(getPfmBudgetSnapshot()).toEqual(initial)
    savePfmBudget({ categoryTargets: { Casa: -1 } })
    expect(getPfmBudgetSnapshot()).toEqual(initial)
    savePfmBudget({ targetCents: 90001, categoryTargets: { Casa: 10001 } })
    vi.resetModules()
    const restored = await import('@/features/analytics/mobileFirstPfmState')
    expect(restored.getPfmBudgetSnapshot()).toMatchObject({ targetCents: 90001, categoryTargets: { Casa: 10001 } })
    restored.resetPfmBudget()
    resetPfmBudget()
  })
  it('includes prepaid card holdings independently of meal-card counts', () => {
    resetItalyFinancialState()
    resetPfmBudget()
    const counts = {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 0,
      savingsAccounts: 0,
      loans: 0,
      mortgages: 0,
      investments: 0,
    }
    expect(getItalyPfmFinancialInput(getItalyFinancialSnapshot(), counts).cardIds).toContain('genius')
    expect(
      getItalyPfmFinancialInput(getItalyFinancialSnapshot(), { ...counts, debitCards: 0, creditCards: 0, mealCards: 3 })
        .cardIds,
    ).not.toContain('genius')
  })
  it('counts linked account/card events once and conserves splits', () => {
    const snapshot = {
      asOf: '2025-02-28',
      events: [
        event('rent', -10001),
        {
          ...event('split', -1000),
          splits: [
            { category: 'Casa', amountCents: 333 },
            { category: 'Trasporti', amountCents: 667 },
          ],
        },
        event('salary', 100000),
      ],
    }
    const summary = selectPfmSummary(snapshot, input)
    expect(summary.spendCents).toBe(11001)
    expect(summary.categoryRows.reduce((sum, row) => sum + row.amountCents, 0)).toBe(summary.spendCents)
    expect(summary.incomeCents).toBe(100000)
    expect(summary.transactions).toHaveLength(3)
    expect(
      selectPfmCategoryTransactions(
        snapshot.events.filter((event) => event.amountCents < 0),
        'Casa',
      ).reduce((sum, event) => sum - event.amountCents, 0),
    ).toBe(10334)
    expect(selectPfmCategoryTransactions(snapshot.events, 'Trasporti')[0]?.amountCents).toBe(-667)
  })
  it('filters exclusions, pending events, internal transfers and ISO date boundaries', () => {
    const snapshot = {
      asOf: '2025-02-28',
      events: [
        event('last', -100),
        event('before', -200, '2025-01-31'),
        { ...event('excluded', -500), excluded: true },
        { ...event('pending', -500), status: 'pending' as const },
        { ...event('transfer', -500), kind: 'transfer' as const },
      ],
    }
    const summary = selectPfmSummary(snapshot, input, { month: '2025-02' })
    expect(summary.spendCents).toBe(100)
    expect(summary.excluded).toHaveLength(1)
    expect(selectPfmSummary(snapshot, { ...input, accountNumbers: [], cardIds: [] }).spendCents).toBe(0)
    expect(getPfmDateRange('2025-02-28', { period: '3M' })).toEqual({ start: '2024-12-01', end: '2025-02-28' })
  })
  it('normalizes refund categories and derives report groups from the same rows', () => {
    const snapshot = {
      asOf: '2025-02-28',
      events: [
        { ...event('refund', 500), kind: 'refund' as const, category: 'Rimborso' },
        event('one', -200),
        event('two', -300),
      ],
    }
    const result = selectPfmSummary(snapshot, input)
    expect(result.incomeRows[0]?.name).toBe('Rimborsi')
    expect(result.dayRows.reduce((sum, row) => sum + row.amountCents, 0)).toBe(result.spendCents)
    expect(result.merchantRows.reduce((sum, row) => sum + row.amountCents, 0)).toBe(result.spendCents)
  })
  it('derives wealth, debt, net worth and exact allocation shares for a selected year', () => {
    const wealth = [
      {
        id: 'cash',
        label: 'Liquidità',
        category: 'Liquidità',
        valueCents: 10000,
        date: '2025-02-28',
        liability: false,
      },
      { id: 'fund', label: 'Fondo', category: 'Investimenti', valueCents: 20000, date: '2025-02-28', liability: false },
      {
        id: 'loan',
        label: 'Prestito',
        category: 'Mutuo e prestito',
        valueCents: 5000,
        date: '2025-02-28',
        liability: true,
      },
    ]
    const summary = getPfmWealthSummary({ wealth }, { year: '2025' })
    expect(summary.assetsCents).toBe(30000)
    expect(summary.liabilitiesCents).toBe(5000)
    expect(summary.netWorthCents).toBe(25000)
    expect(summary.assetRows.reduce((sum, row) => sum + row.share, 0)).toBe(100)
    expect(getPfmWealthSummary({ wealth }, { year: '2024' }).assetsCents).toBe(0)
  })
  it('persists only budget targets and derives remaining from selected transactions', () => {
    resetPfmBudget()
    savePfmBudget({ targetCents: 100000, categoryTargets: { Casa: 20000 } })
    const summary = selectPfmSummary({ asOf: '2025-02-28', events: [event('rent', -10001)] }, input)
    expect(getPfmBudgetSnapshot().targetCents - summary.spendCents).toBe(89999)
    expect(getPfmBudgetSnapshot().categoryTargets.Casa! - summary.categoryRows[0]!.amountCents).toBe(9999)
    resetPfmBudget()
  })
  it('provides Home and PFM one source for cash, investments, debt and transaction totals', () => {
    resetItalyFinancialState()
    resetPfmBudget()
    const snapshot = getItalyFinancialSnapshot()
    const counts = {
      accounts: 2,
      debitCards: 1,
      creditCards: 2,
      mealCards: 1,
      deposits: 1,
      savingsAccounts: 0,
      loans: 1,
      mortgages: 1,
      investments: 1,
    }
    const financial = getItalyPfmFinancialInput(snapshot, counts)
    const summary = selectPfmSummary(snapshot, financial)
    expect(summary.categoryRows.reduce((sum, row) => sum + row.amountCents, 0)).toBe(summary.spendCents)
    expect(summary.transactions.map((event) => event.id).filter((id) => id === 'primary:0-2')).toHaveLength(1)
    const wealth = getPfmWealthSummary(financial, { year: '2025' })
    const cash = financial.accountNumbers.reduce(
      (sum, number) => sum + selectAccountBalance(snapshot, number).bookBalanceCents,
      0,
    )
    expect(financial.cardIds).toContain('blocked')
    expect(financial.cardIds).toContain('suspended')
    const prepaid = snapshot.cards
      .filter((card) => card.kind === 'prepaid')
      .reduce((sum, card) => sum + selectCardBalance(snapshot, card.id).bookBalanceCents, 0)
    const investments = getItalyInvestmentWealth().reduce((sum, item) => sum + item.valueCents, 0)
    const loans = buildLoanPortfolio(counts).reduce((sum, loan) => sum + Math.round(loan.outstanding * 100), 0)
    const credit = financial.cardIds.reduce((sum, id) => sum + selectCardBalance(snapshot, id).debtCents, 0)
    expect(wealth.assetsCents).toBe(cash + prepaid + investments)
    expect(wealth.liabilitiesCents).toBe(loans + credit)
    expect(wealth.netWorthCents).toBe(wealth.assetsCents - wealth.liabilitiesCents)
    expect(getPfmWealthSummary(getItalyPfmFinancialInput(snapshot, { ...counts, deposits: 0 })).assetsCents).toBe(
      wealth.assetsCents,
    )
    expect(
      getItalyPfmFinancialInput(snapshot, { ...counts, investments: 0 }).wealth.some(
        (item) => item.category === 'Investimenti',
      ),
    ).toBe(false)
    savePfmBudget({
      relationshipIds: ['account:000012345'],
      manualWealth: [
        {
          id: 'manual-car',
          label: 'Auto',
          category: 'Mezzi di trasporto',
          date: '2025-02-28',
          valueCents: 20000,
          liability: false,
        },
      ],
    })
    const selected = getItalyPfmFinancialInput(snapshot, counts)
    expect(selected.accountNumbers).toEqual(['000012345'])
    expect(selected.cardIds).toEqual([])
    expect(selected.wealth.filter((item) => item.id === 'manual-car')).toHaveLength(1)
    expect(selectPfmSummary(snapshot, selected).spendCents).toBe(
      snapshot.events
        .filter(
          (event) =>
            event.status === 'settled' &&
            event.amountCents < 0 &&
            event.accountNumbers.includes('000012345') &&
            !['transfer', 'topup', 'repayment'].includes(event.kind),
        )
        .reduce((sum, event) => sum - event.amountCents, 0),
    )
    resetPfmBudget()
  })
})
