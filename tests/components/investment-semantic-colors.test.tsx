// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { readdirSync, readFileSync } from 'node:fs'
import postcss from 'postcss'
import { dirname, join, relative } from 'node:path'
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

// Reviewed exact exceptions preserve authored pixels pending a separate palette change.
const INTENTIONAL_LITERAL_EXCEPTIONS = [
  { path: 'src/app/components/investments/InvestmentActionBar.tsx', literal: 'rgba(0,0,0,0.15)', count: 1, reason: 'Authored action-bar shadow alpha' },
  { path: 'src/app/components/investments/InvestmentDistributionChart.tsx', literal: '#F2F2F2', count: 1, reason: 'Authored chart separator geometry' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#00A3E0', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#074861', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#535453', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#5BC199', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#885BC1', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#D6579C', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentsHistoryScreen.tsx', literal: 'rgba(0,0,0,0.28)', count: 1, reason: 'Authored interval modal overlay alpha' },
  { path: 'src/app/screens/investments/InvestmentsHistoryScreen.tsx', literal: 'rgba(0,0,0,0.51)', count: 1, reason: 'Authored filter modal overlay alpha' },
  { path: 'src/app/screens/investments/CzRoboLevelOneShell.tsx', literal: 'rgba(0,0,0,0.045)', count: 1, reason: 'Authored level-one shell shadow alpha' },
  { path: 'src/app/screens/investments/InvestmentsPortfolioScreen.tsx', literal: 'rgba(0,0,0,0.045)', count: 1, reason: 'Authored portfolio shell shadow alpha' },
  { path: 'src/app/screens/investments/FutureGainInvestmentSimulatorScreen.tsx', literal: 'rgba(153,153,153,0.35)', count: 1, reason: 'Fixed information-sheet separator; theme borders differ' },
  { path: 'src/app/screens/investments/FutureGainTermDepositScreen.tsx', literal: 'rgba(153,153,153,0.35)', count: 2, reason: 'Fixed information-sheet separators; theme borders differ' },
  { path: 'src/app/screens/investments/SmartInvestmentScreen.tsx', literal: 'rgba(153,153,153,0.35)', count: 2, reason: 'Fixed information-sheet separators; theme borders differ' },
  { path: 'src/app/screens/investments/FutureGainInvestmentSimulatorScreen.tsx', literal: '#d9d9d9', count: 1, reason: 'Authored fund-history chart grid' },
  { path: 'src/app/screens/investments/FutureGainInvestmentSimulatorScreen.tsx', literal: '#0098a6', count: 1, reason: 'Authored fund-history chart series' },
  { path: 'src/app/screens/investments/InvestmentsPortfolioScreen.tsx', literal: '#E30000', count: 2, reason: 'Authored negative-trend SVG paths; semantic reds differ' },
  { path: 'src/app/screens/investments/SmartInvestmentScreen.tsx', literal: 'rgba(94,111,115,0.1)', count: 1, reason: 'Authored low-risk badge background' },
  { path: 'src/app/screens/investments/SmartInvestmentScreen.tsx', literal: '#007a6b', count: 1, reason: 'Authored low-risk badge foreground' },
  { path: 'src/app/screens/investments/SmartInvestmentScreen.tsx', literal: 'rgba(163,54,148,0.1)', count: 1, reason: 'Authored medium-risk badge background' },
  { path: 'src/app/screens/investments/SmartInvestmentScreen.tsx', literal: '#a33694', count: 1, reason: 'Authored medium-risk badge foreground' },
  { path: 'src/app/screens/investments/SmartInvestmentScreen.tsx', literal: 'rgba(61,31,171,0.1)', count: 1, reason: 'Authored high-risk badge background' },
  { path: 'src/app/screens/investments/SmartInvestmentScreen.tsx', literal: '#3d1fab', count: 1, reason: 'Authored high-risk badge foreground' },
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
  it('contains no unreferenced structural, status, or action color literals', () => {
    const violations = investmentSources().flatMap(({ relativePath, source }) =>
      FORBIDDEN_STRUCTURAL_LITERALS.flatMap((literal) => {
        const count = source.match(new RegExp(literal, 'gi'))?.length ?? 0
        return Array.from({ length: count }, () => `${relativePath}:${literal}`)
      }),
    )

    expect(violations).toEqual([])
  })

  it('documents exact reviewed chart, glyph, risk, separator, shadow, and overlay exceptions', () => {
    const remaining = investmentSources().flatMap(({ relativePath, source }) =>
      Array.from(source.matchAll(/#[0-9a-f]{6}|rgba\([^)]*\)/gi), ([literal]) => `${relativePath}:${literal}`),
    ).sort()

    const reviewed = INTENTIONAL_LITERAL_EXCEPTIONS.flatMap(({ path, literal, count }) =>
      Array.from({ length: count }, () => path + ':' + literal),
    ).sort()
    expect(remaining).toEqual(reviewed)
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

/** Follow the shipped CSS entry point so token overrides are tested in import order. */
function configuredStyles(path = join(process.cwd(), 'src/styles/index.css'), seen = new Set<string>()): string[] {
  if (seen.has(path)) return []
  seen.add(path)
  const source = readFileSync(path, 'utf8')
  const imports = Array.from(source.matchAll(/@import\s+['"]([^'"]+)['"]/g), ([, target]) => target!)
    .filter((target) => target.startsWith('.'))
  return [...imports.flatMap((target) => configuredStyles(join(dirname(path), target), seen)), source]
}

describe('authored investment reference palette', () => {
  it('loads the fixed snapshot palette through the application CSS entry point', () => {
    const entry = readFileSync(join(process.cwd(), 'src/styles/index.css'), 'utf8')
    expect(entry).toContain("@import './investment-reference.css'")
  })

  it.each(['light', 'dark'])('retains the accepted exact reference colors in %s', (theme) => {
    const declarations: string[] = []
    for (const source of configuredStyles()) {
      postcss.parse(source).walkRules((rule) => {
        if (rule.nodes.some((node) => node.type === 'decl' && node.prop.startsWith('--uc-investment-reference-'))) {
          declarations.push(rule.toString())
        }
      })
    }
    // Apply rules from the real CSS graph, including any later theme overrides.
    const style = document.createElement('style')
    style.textContent = declarations.join('\n')
    document.head.append(style)
    const surface = document.createElement('div')
    surface.dataset.ucTheme = theme
    document.body.append(surface)
    try {
      const computed = getComputedStyle(surface)
      expect(computed.getPropertyValue('--uc-investment-reference-panel').trim()).toBe('#F5F5F5')
      expect(computed.getPropertyValue('--uc-investment-reference-positive').trim()).toBe('#3D7D43')
      expect(computed.getPropertyValue('--uc-investment-reference-action').trim()).toBe('#007A91')
      expect(computed.getPropertyValue('--uc-investment-reference-icon').trim()).toBe('#262626')
    } finally {
      surface.remove()
      style.remove()
    }
  })
})
