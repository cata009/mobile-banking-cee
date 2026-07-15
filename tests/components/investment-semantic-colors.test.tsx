// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import InvestmentProductCard from '@/app/components/investments/InvestmentProductCard'
import type { InvestmentSecurity } from '@/app/config/investmentsPortfolioConfig'

const INVESTMENT_ROOTS = [
  join(process.cwd(), 'src/app/components/investments'),
  join(process.cwd(), 'src/app/screens/investments'),
]

const FORBIDDEN_STRUCTURAL_LITERALS = [
  '#FFFFFF',
  '#262626',
  '#666666',
  '#3D7D43',
  '#CF3524',
  '#007A91',
  '#F5F5F5',
] as const

const INTENTIONAL_LITERAL_EXCEPTIONS = [
  'src/app/components/investments/InvestmentDistributionChart.tsx:#F2F2F2',
  'src/app/screens/investments/InvestmentsHistoryScreen.tsx:rgba(0,0,0,0.28)',
  'src/app/screens/investments/InvestmentsHistoryScreen.tsx:rgba(0,0,0,0.51)',
] as const

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name)
    if (entry.isDirectory()) return sourceFiles(path)
    return entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') ? [path] : []
  })
}

function investmentSources() {
  return INVESTMENT_ROOTS.flatMap(sourceFiles).map((path) => ({
    path,
    relativePath: relative(process.cwd(), path).replace(/\\/g, '/'),
    source: readFileSync(path, 'utf8'),
  }))
}

const SECURITY: InvestmentSecurity = {
  id: 'security-1',
  title: 'Balanced fund',
  sourceProductName: 'Investment account',
  status: 'active',
  contributionType: 'RECURRENT',
  value: 10_000,
  currency: 'EUR',
  instrumentCurrency: 'EUR',
  localValue: 10_000,
  localCurrency: 'EUR',
  securityAccountId: 'account-1',
  securityAccountName: 'Investments',
  securityAccountCurrency: 'EUR',
  productType: 'Fund',
  assetClass: 'Balanced',
  marketPrice: 100,
  quantity: 100,
  performanceAmount: 420,
  performancePercent: 4.2,
}

function renderProductCard(performancePercent: number) {
  return render(
    <div data-uc-theme="dark">
      <InvestmentProductCard
        security={{ ...SECURITY, performancePercent }}
        valueParts={{ integer: '10 000', decimal: ',00', currency: 'EUR' }}
        performanceParts={{ integer: '420', decimal: ',00', currency: 'EUR' }}
        valueLabel="Portfolio value"
        performanceLabel="Performance amount"
      />
    </div>,
  )
}

afterEach(cleanup)

describe('investment semantic color source contract', () => {
  it('contains no migratable structural, status, or action color literals', () => {
    const violations = investmentSources().flatMap(({ relativePath, source }) =>
      FORBIDDEN_STRUCTURAL_LITERALS.flatMap((literal) => {
        const count = source.match(new RegExp(literal, 'gi'))?.length ?? 0
        return Array.from({ length: count }, () => `${relativePath}:${literal}`)
      }),
    )

    expect(violations).toEqual([])
  })

  it('documents the exact literals intentionally retained for chart geometry and modal overlays', () => {
    const remaining = investmentSources().flatMap(({ relativePath, source }) =>
      Array.from(source.matchAll(/#[0-9a-f]{6}|rgba\([^)]*\)/gi), ([literal]) => `${relativePath}:${literal}`),
    ).sort()

    expect(remaining).toEqual([...INTENTIONAL_LITERAL_EXCEPTIONS].sort())
  })
})

describe('investment semantic color runtime contract', () => {
  it('renders structural and positive colors through theme-adaptive semantic tokens', () => {
    renderProductCard(4.2)

    expect(screen.getByRole('button')).toHaveClass('bg-[var(--uc-surface)]')
    expect(screen.getByText('Balanced fund')).toHaveClass('text-[var(--uc-text)]')
    expect(screen.getByText('+4,2%')).toHaveStyle({ color: 'var(--uc-green-olive)' })
  })

  it('renders negative performance through the semantic status token', () => {
    renderProductCard(-4.2)

    expect(screen.getByText(/4,2%$/)).toHaveStyle({ color: 'var(--uc-status-red)' })
  })
})
