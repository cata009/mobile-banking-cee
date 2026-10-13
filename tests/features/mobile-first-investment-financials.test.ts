// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  getItalyInvestmentWealth,
  valuePosition,
  allocateValues,
  getInvestmentOverview,
  getFundPositions,
  getSecurityPositions,
} from '@/features/investments/mobileFirstValuation'
import {
  securities,
  initialSecuritiesState,
  submitSecurityOrder,
  cancelSecurityOrder,
  executeSecurityOrder,
  ensureSecurityCashReservations,
  validateSecurityTrade,
  securityOrderPeriodRange,
  type SecurityOrder,
} from '@/features/investments/mobileFirstSecurities'
import {
  getItalyFinancialSnapshot,
  resetItalyFinancialState,
  selectAccountBalance,
} from '@/features/finance/italyFinancials'
import {
  investmentFunds,
  availableInvestmentFunds,
  fundOperationMoney,
  defaultPacParameters,
} from '@/features/investments/mobileFirstFunds'
import {
  subscribeSavingsProduct,
  getFiscalSummary,
  investmentFiscalRecords,
  fiscalRecordProfitCents,
} from '@/features/investments/mobileFirstInvestmentServices'
import {
  submitFundOrder,
  cancelFundOrder,
  executeFundOrder,
  type FundsStoredState,
} from '@/features/investments/mobileFirstFundsState'
import { buildLoanPortfolio, loanInstallments } from '@/features/credit/mobileFirstLoans'

beforeEach(() => {
  localStorage.clear()
  resetItalyFinancialState()
})
describe('Italy investment and loan numerical authority', () => {
  it('rounds the position after multiplying full precision quotes', () => {
    expect(valuePosition(36, 0.1158)).toBe(417)
    expect(valuePosition(34, 5.196)).toBe(17666)
  })
  it('does not reserve expired seed orders and validates against the demo date', () => {
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
    ensureSecurityCashReservations(initialSecuritiesState())
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345')).toEqual(before)
    expect(getItalyFinancialSnapshot().reservations).toHaveLength(0)
    expect(
      validateSecurityTrade(
        {
          action: 'buy',
          depositId: 'main',
          subdepositId: '00',
          quantity: '1',
          price: '204.75',
          priceType: 'Al limite',
          market: 'NASDAQ',
          quantityCondition: 'Senza condizione',
          validUntil: '2025-02-27',
          conditional: false,
          triggerPrice: '',
        },
        securities[0]!,
      ),
    ).toContain('fine validità')
  })
  it('uses distinct rolling calendar windows through the canonical demo date', () => {
    expect(securityOrderPeriodRange('1M')).toEqual({ from: '2025-01-28', to: '2025-02-28' })
    expect(securityOrderPeriodRange('3M')).toEqual({ from: '2024-11-28', to: '2025-02-28' })
    expect(securityOrderPeriodRange('6M')).toEqual({ from: '2024-08-28', to: '2025-02-28' })
    expect(securityOrderPeriodRange('12M')).toEqual({ from: '2024-02-28', to: '2025-02-28' })
    expect(securityOrderPeriodRange('1M', '2025-03-31').from).toBe('2025-02-28')
  })
  it('keeps unknown security acquisition basis unavailable and uses explicit fund PMC', () => {
    const apple = getSecurityPositions().find((position) => position.id === 'apple')!
    expect(apple.valueCents).toBe(2538900)
    expect(apple.costCents).toBeUndefined()
    expect(apple.averageCost).toBeUndefined()
    expect(apple.profitCents).toBeUndefined()
    const fund = getFundPositions().find((position) => position.id === 'pic')!
    expect(fund.pmc).toBeCloseTo(8.29, 8)
    expect(fund.profit).toBeCloseTo(fund.shares * fund.nav - Math.round(fund.shares * 8.29 * 100) / 100, 2)
  })
  it('keeps fiscal totals and latest date within the canonical demo snapshot', () => {
    const fiscal = getFiscalSummary()
    expect(fiscal.records).toHaveLength(2)
    expect(fiscal.accumulatedCents).toBe(870)
    expect(fiscal.latestDate).toBe('2024-12-08')
    expect(getFiscalSummary('2025').records).toHaveLength(0)
    expect(getFiscalSummary(undefined, undefined, '2024-11-01').accumulatedCents).toBe(435)
  })
  it('reconciles source securities and funds to wealth and allocation totals', () => {
    const wealth = getItalyInvestmentWealth()
    expect(wealth.find((p) => p.id === 'securities')?.valueCents).toBe(
      securities.reduce((sum, p) => sum + Math.round(p.quantity * p.price * 100), 0),
    )
    expect(wealth.find((p) => p.id === 'funds')?.valueCents).toBe(
      investmentFunds.reduce((sum, p) => sum + Math.round(p.shares * p.nav * 100), 0),
    )
    expect(getInvestmentOverview('full').totalCents).toBe(wealth.reduce((sum, p) => sum + p.valueCents, 0))
    expect(getInvestmentOverview('zero').totalCents).toBe(0)
    expect(getInvestmentOverview('single').allocations).toHaveLength(1)
    expect(getInvestmentOverview('edge').totalCents).toBe(
      getInvestmentOverview('edge').allocations.reduce((sum, p) => sum + p.valueCents, 0),
    )
  })
  it('apportions rounding remainders and handles empty allocations', () => {
    expect(
      allocateValues([
        { name: 'a', valueCents: 1 },
        { name: 'b', valueCents: 1 },
        { name: 'c', valueCents: 1 },
      ]).reduce((sum, p) => sum + p.percent, 0),
    ).toBe(100)
    expect(allocateValues([{ name: 'empty', valueCents: 0 }])[0]?.percent).toBe(0)
  })
  it('reconciles every installment and fully repays without negative balances', () => {
    for (const loan of buildLoanPortfolio({ mortgages: 3, loans: 4 })) {
      const rows = Array.from({ length: 16 }, (_, i) => loanInstallments(2025 + i, loan)).flat()
      expect(Math.round(rows.reduce((sum, row) => sum + row.capital, 0) * 100)).toBe(Math.round(loan.outstanding * 100))
      for (const row of rows) {
        expect(Math.round(row.amount * 100)).toBe(Math.round((row.capital + row.interest + row.other) * 100))
        expect(row.outstanding).toBeGreaterThanOrEqual(0)
      }
      expect(rows.at(-1)?.outstanding).toBe(0)
    }
  })
  it('reserves fee-inclusive cash and releases cancellations without changing book balance', () => {
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
    const order: SecurityOrder = {
      id: 'MF-test',
      securityId: 'apple',
      action: 'Acquisto',
      quantity: 10,
      price: 204.75,
      market: 'NASDAQ',
      status: 'Inviato',
      date: '2025-02-25',
      validUntil: '2025-03-01',
      priceType: 'Al meglio',
      quantityCondition: 'Senza condizione',
    }
    const submitted = submitSecurityOrder({ ...initialSecuritiesState(), orders: [] }, order)
    expect(submitted.error).toBeNull()
    const reserved = selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
    expect(before.availableCents - reserved.availableCents).toBe(204750 + 307)
    expect(reserved.bookBalanceCents).toBe(before.bookBalanceCents)
    expect(submitSecurityOrder(submitted.state, { ...order, id: 'MF-too-large', quantity: 1000 }).error).toBeTruthy()
    const cancelled = cancelSecurityOrder(submitted.state, order.id)
    expect(cancelled.orders[0]?.status).toBe('Annullato')
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents).toBe(before.availableCents)
  })
  it('executes once and reserves shares against repeated pending sales', () => {
    const order: SecurityOrder = {
      id: 'MF-sale',
      securityId: 'apple',
      action: 'Vendita',
      quantity: 100,
      price: 204.75,
      market: 'NASDAQ',
      status: 'Inviato',
      date: '2025-02-25',
      validUntil: '2025-03-01',
      priceType: 'Al meglio',
      quantityCondition: 'Senza condizione',
    }
    const submitted = submitSecurityOrder({ ...initialSecuritiesState(), orders: [] }, order)
    expect(submitted.error).toBeNull()
    expect(submitSecurityOrder(submitted.state, { ...order, id: 'MF-second-sale', quantity: 25 }).error).toBeTruthy()
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents
    const executed = executeSecurityOrder(submitted.state, order.id)
    expect(executed.error).toBeNull()
    expect(getItalyInvestmentWealth().find((p) => p.id === 'securities')!.valueCents).toBe(
      securities.reduce((sum, p) => sum + Math.round(p.quantity * p.price * 100), 0) - 2047500,
    )
    expect(executeSecurityOrder(executed.state, order.id).state).toEqual(executed.state)
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents - before).toBe(
      2047500 - 1950,
    )
  })
  it('reserves fund subscriptions and both switch legs settle exactly once', () => {
    const state: FundsStoredState = {
      version: 1,
      fund: 'pic',
      pac: { amount: 100, installments: 74, initial: 1200, day: 4 },
      savings: { average: 4000, lower: 2500, upper: 5000, maximum: 0, day: 1 },
      pacStatus: 'active',
      savingsStatus: 'inactive',
      orders: [],
    }
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
    const buy = submitFundOrder(state, {
      id: 'MF-fund-buy',
      fund: 'Pioneer SF - Equity Plan 60',
      action: 'Sottoscrizione fondi',
      amount: 1000,
      shares: 1000 / 569.37,
      date: '2025-02-25',
      status: 'Caricato',
    })
    expect(buy.error).toBeNull()
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents).toBe(
      before.availableCents - 101500,
    )
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents).toBe(
      before.bookBalanceCents,
    )
    const cancelled = cancelFundOrder(buy.state, 'MF-fund-buy')
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents).toBe(before.availableCents)
    const switchOrder = submitFundOrder(cancelled, {
      id: 'MF-fund-switch',
      fund: 'Pioneer SF - Equity Plan 60',
      action: 'Switch fondo',
      amount: 569.37,
      shares: 1,
      targetFund: 'allianz',
      targetShares: 569.37 / 109.39,
      date: '2025-02-25',
      status: 'Caricato',
    })
    expect(switchOrder.error).toBeNull()
    const initialWealth = getItalyInvestmentWealth().find((p) => p.id === 'funds')!.valueCents
    const executed = executeFundOrder(switchOrder.state, 'MF-fund-switch')
    expect(executed.error).toBeNull()
    expect(getItalyInvestmentWealth().find((p) => p.id === 'funds')!.valueCents).toBe(initialWealth)
    expect(executeFundOrder(executed.state, 'MF-fund-switch').state).toEqual(executed.state)
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents).toBe(
      before.bookBalanceCents,
    )
  })
  it('creates a funded savings position once and reconciles recorded fiscal totals', () => {
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents
    const wealth = getItalyInvestmentWealth().find((p) => p.id === 'savings')!.valueCents
    expect(subscribeSavingsProduct(5000, 'savings-demo').error).toBeNull()
    expect(subscribeSavingsProduct(5000, 'savings-demo').error).toBeNull()
    expect(getItalyInvestmentWealth().find((p) => p.id === 'savings')!.valueCents).toBe(wealth + 500000)
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents).toBe(before - 500000)
    expect(subscribeSavingsProduct(100000, 'too-large').error).toBeTruthy()
    expect(getFiscalSummary().accumulatedCents).toBe(
      investmentFiscalRecords.reduce(
        (sum, record) => sum + Math.max(0, -fiscalRecordProfitCents(record)) - record.usedLossCents,
        0,
      ),
    )
  })
  it('converts auction nominal values into units and preserves weighted acquisition basis', () => {
    const state = { ...initialSecuritiesState(), orders: [] }
    const order: SecurityOrder = {
      id: 'MF-auction',
      securityId: 'bot',
      action: 'Sottoscrizione',
      quantity: 1000,
      price: 1,
      market: 'Mercato primario',
      status: 'Inviato',
      date: '2025-02-25',
      validUntil: '2025-03-01',
      priceType: 'Al meglio',
      quantityCondition: 'Senza condizione',
    }
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents
    const submitted = submitSecurityOrder(state, order)
    const executed = executeSecurityOrder(submitted.state, order.id)
    expect(executed.error).toBeNull()
    expect(getSecurityPositions().find((position) => position.id === 'bot')).toMatchObject({
      quantity: 10,
      valueCents: 100000,
      costCents: 100000,
      averageCost: 100,
    })
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents).toBe(before - 100150)
  })
  it('rejects stale execution after a sale was cancelled', () => {
    const state = { ...initialSecuritiesState(), orders: [] }
    const order: SecurityOrder = {
      id: 'MF-cancelled-sale',
      securityId: 'apple',
      action: 'Vendita',
      quantity: 100,
      price: 204.75,
      market: 'NASDAQ',
      status: 'Inviato',
      date: '2025-02-25',
      validUntil: '2025-03-01',
      priceType: 'Al meglio',
      quantityCondition: 'Senza condizione',
    }
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents
    const submitted = submitSecurityOrder(state, order)
    cancelSecurityOrder(submitted.state, order.id)
    expect(executeSecurityOrder(submitted.state, order.id).error).toBeTruthy()
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').bookBalanceCents).toBe(before)
  })
  it('reserves redemption quantities and retains exact requested shares after money rounding', () => {
    const state: FundsStoredState = {
      version: 1,
      fund: 'pic',
      pac: { ...defaultPacParameters },
      savings: { average: 4000, lower: 2500, upper: 5000, maximum: 0, day: 1 },
      pacStatus: 'active',
      savingsStatus: 'inactive',
      orders: [],
    }
    const money = fundOperationMoney({
      action: 'redeem',
      amount: 34,
      unit: 'shares',
      nav: 569.37,
      contract: 'PIC',
      pac: defaultPacParameters,
    })
    expect(money.shares).toBe(34)
    const order = {
      id: 'MF-redeem-all',
      fund: 'Pioneer SF - Equity Plan 60',
      action: 'Rimborso fondo',
      amount: money.principalCents / 100,
      shares: money.shares,
      date: '2025-02-25',
      status: 'Caricato' as const,
    }
    const submitted = submitFundOrder(state, order)
    expect(
      submitFundOrder(submitted.state, { ...order, id: 'MF-excess-redemption', shares: 1, amount: 569.37 }).error,
    ).toBeTruthy()
    const executed = executeFundOrder(submitted.state, order.id)
    expect(executed.error).toBeNull()
    expect(getFundPositions().find((fund) => fund.id === 'pic')).toMatchObject({ shares: 0, value: 0, profit: 0 })
  })
  it('funds new catalogue positions and keeps plan lifecycle commands separate from money', () => {
    const state: FundsStoredState = {
      version: 1,
      fund: 'pic',
      pac: { ...defaultPacParameters },
      savings: { average: 4000, lower: 2500, upper: 5000, maximum: 0, day: 1 },
      pacStatus: 'active',
      savingsStatus: 'inactive',
      orders: [],
    }
    const catalog = availableInvestmentFunds.find((fund) => fund.id === 'news-0')!
    const submitted = submitFundOrder(state, {
      id: 'MF-catalogue',
      fund: catalog.name,
      action: 'Sottoscrizione fondi',
      amount: 100,
      shares: 100 / catalog.nav,
      date: '2025-02-25',
      status: 'Caricato',
    })
    const executed = executeFundOrder(submitted.state, 'MF-catalogue')
    expect(executed.error).toBeNull()
    expect(getFundPositions().find((fund) => fund.id === catalog.id)?.value).toBe(100)
    const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents
    const lifecycle = submitFundOrder(executed.state, {
      id: 'MF-pac-suspend',
      fund: 'Pioneer SF - Euro Strat. Bond',
      action: 'Sospensione PAC',
      amount: 0,
      shares: 0,
      date: '2025-02-25',
      status: 'Caricato',
    })
    expect(lifecycle.error).toBeNull()
    expect(selectAccountBalance(getItalyFinancialSnapshot(), '000012345').availableCents).toBe(before)
    expect(
      fundOperationMoney({
        action: 'subscribe',
        amount: 100,
        unit: 'amount',
        nav: catalog.nav,
        contract: 'PAC',
        pac: defaultPacParameters,
      }).principalCents,
    ).toBe(120000)
  })
})
