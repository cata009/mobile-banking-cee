// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import {
  calculateInvestmentPortfolioPerformance,
  buildInvestmentSecurities,
} from '@/app/config/investmentsPortfolioConfig'
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting'
import InvestmentsPortfolioScreen from '@/app/screens/investments/InvestmentsPortfolioScreen'
import { renderBankingScreen } from '../../helpers/coverageProviders'

const previews = vi.hoisted(() => ({ calls: [] as unknown[] }))

vi.mock('@/app/components/demo/NativeScreenPreview', async () => {
  const { useDemo, useProductData } = await import('@/app/state/demoStore')
  return {
    NativeScreenPreview: (props: unknown) => {
      const demo = useDemo()
      const products = useProductData()
      previews.calls.push({
        props,
        country: demo.country,
        release: demo.release,
        amountsHidden: demo.amountsHidden,
        productCounts: products.resolvedProductCounts,
      })
      return null
    },
  }
})

function latestPreview() {
  return previews.calls.at(-1) as {
    props: NativeScreenPreviewProps
    country: string
    release: string
    amountsHidden: boolean
    productCounts: { accounts: number; investments: number }
  }
}

function mountEmptyPortfolio(amountsHidden = false) {
  return renderBankingScreen(
    <InvestmentsPortfolioScreen onBack={() => undefined} />,
    {
      country: 'RS',
      state: {
        release: 'release-future-rs-future-gain',
        amountsHidden,
        productCounts: {
          accounts: 1,
          debitCards: 0,
          creditCards: 0,
          mealCards: 0,
          deposits: 0,
          savingsAccounts: 0,
          loans: 0,
          mortgages: 0,
          investments: 0,
        },
      },
    },
  )
}

beforeEach(() => {
  previews.calls = []
})

afterEach(cleanup)

describe('RS empty investments Source route contract', () => {
  // Native empty-state rendering and Invest are covered by baseline-investments-overview.test.tsx.
  it('requests the empty RS portfolio in the Native investments entry', () => {
    mountEmptyPortfolio()

    const capture = latestPreview()
    expect(capture.props.route).toEqual({
      screen: 'investments',
      params: { entry: 'portfolio' },
    })
    expect(capture.props.snapshot?.primaryNavigationVisible).toBe(false)
    expect(capture.country).toBe('RS')
    expect(capture.release).toBe('release-future-rs-future-gain')
    expect(capture.productCounts).toMatchObject({ accounts: 1, investments: 0 })

    const securities = buildInvestmentSecurities([], 'RS')
    const performance = calculateInvestmentPortfolioPerformance(securities)
    expect(securities).toHaveLength(0)
    expect(performance).toEqual({
      totalValue: 0,
      performanceAmount: 0,
      performancePercent: 0,
    })
    expect(formatInvestmentMoney(performance.totalValue, 'RS', 'RSD')).toBe(
      '0,00 RSD',
    )
  })

  it('preserves amount privacy in the Native route context for the empty RS portfolio', () => {
    mountEmptyPortfolio(true)

    const capture = latestPreview()
    expect(capture.props.route).toEqual({
      screen: 'investments',
      params: { entry: 'portfolio' },
    })
    expect(capture.country).toBe('RS')
    expect(capture.productCounts).toMatchObject({ accounts: 1, investments: 0 })
    expect(capture.amountsHidden).toBe(true)
    expect(formatInvestmentMoney(0, 'RS', 'RSD', true)).not.toContain('0,00')
  })
})
