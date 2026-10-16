// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { readdirSync, readFileSync } from 'node:fs'
import postcss from 'postcss'
import { dirname, join, relative } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

const NATIVE_CZ_ROBO_HOME_URL =
  '/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-cz-robo' +
  '&bank=retail-single-account&theme=dark&lang=en&screen=home'

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

// Keep the source literal audit exact; migrated surfaces now use semantic tokens instead of these retired literals.
const INTENTIONAL_LITERAL_EXCEPTIONS = [
  { path: 'src/app/components/investments/InvestmentActionBar.tsx', literal: 'rgba(0,0,0,0.15)', count: 1, reason: 'Authored action-bar shadow alpha' },
  { path: 'src/app/components/investments/InvestmentDistributionChart.tsx', literal: '#F2F2F2', count: 1, reason: 'Authored chart separator geometry' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#00A3E0', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#074861', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#535453', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#5BC199', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#885BC1', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/InvestmentOrderDocumentsAccordion.tsx', literal: '#D6579C', count: 1, reason: 'Distinct document-chart series identity' },
  { path: 'src/app/screens/investments/CzRoboLevelOneShell.tsx', literal: 'rgba(0,0,0,0.045)', count: 1, reason: 'Authored level-one shell shadow alpha' },
  { path: 'src/app/screens/investments/FutureGainInvestmentSimulatorScreen.tsx', literal: 'rgba(153,153,153,0.35)', count: 1, reason: 'Fixed information-sheet separator; theme borders differ' },
  { path: 'src/app/screens/investments/FutureGainTermDepositScreen.tsx', literal: 'rgba(153,153,153,0.35)', count: 2, reason: 'Fixed information-sheet separators; theme borders differ' },
  { path: 'src/app/screens/investments/FutureGainInvestmentSimulatorScreen.tsx', literal: '#d9d9d9', count: 1, reason: 'Authored fund-history chart grid' },
  { path: 'src/app/screens/investments/FutureGainInvestmentSimulatorScreen.tsx', literal: '#0098a6', count: 1, reason: 'Authored fund-history chart series' },
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

async function renderNativeInvestmentHome() {
  window.history.replaceState({}, '', NATIVE_CZ_ROBO_HOME_URL)
  const result = render(<App />)
  const { asyncNativeReady } = await import('../helpers/nativeWebRenderer')
  await asyncNativeReady(result.container)
  return result
}

function themeTokenValue(element: HTMLElement, token: string, resolving = new Set<string>()): string {
  if (resolving.has(token)) return ''
  resolving.add(token)
  let current: HTMLElement | null = element
  let tokenValue = ''
  while (current && !tokenValue) {
    tokenValue = getComputedStyle(current).getPropertyValue(token).trim()
    current = current.parentElement
  }
  if (!tokenValue) tokenValue = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  const reference = /^var\((--[\w-]+)(?:,\s*([^)]*))?\)$/.exec(tokenValue)
  if (reference) return themeTokenValue(element, reference[1]!, resolving) || reference[2]?.trim() || ''
  return tokenValue
}

function expectThemeTokenStyle(element: HTMLElement, property: 'background-color' | 'color', token: string) {
  const tokenValue = themeTokenValue(element, token)
  if (!tokenValue) throw new Error(`Missing shipped theme token ${token}`)

  const probe = document.createElement('span')
  probe.style.setProperty(property, tokenValue)
  ;(element.parentElement ?? document.body).append(probe)
  const expected = getComputedStyle(probe).getPropertyValue(property)
  const actual = getComputedStyle(element).getPropertyValue(property)
  probe.remove()

  expect(expected).not.toBe('')
  expect(expected).not.toContain('var(')
  expect(actual).not.toBe('')
  expect(actual).toBe(expected)
}

function expectThemeSurfaceOnControlOrAncestor(element: HTMLElement, token: string) {
  const tokenValue = themeTokenValue(element, token)
  if (!tokenValue) throw new Error(`Missing shipped theme token ${token}`)

  const probe = document.createElement('span')
  probe.style.setProperty('background-color', tokenValue)
  ;(element.parentElement ?? document.body).append(probe)
  const expected = getComputedStyle(probe).getPropertyValue('background-color')
  probe.remove()
  expect(expected).not.toBe('')
  expect(expected).not.toContain('var(')

  let current: HTMLElement | null = element
  while (current && getComputedStyle(current).backgroundColor !== expected) current = current.parentElement
  expect(current).not.toBeNull()
}

beforeEach(async () => {
  const { resetNativeWebRendererDiagnostics } = await import('../helpers/nativeWebRenderer')
  resetNativeWebRendererDiagnostics()
})

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

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
  it('renders the investment destination and portfolio card through Native semantics', async () => {
    await renderNativeInvestmentHome()

    expect(await screen.findByRole('button', { name: 'Investment' })).toBeInTheDocument()
    const portfolio = await screen.findByRole('button', { name: /Security Portfolio/ })
    expect(portfolio).toHaveTextContent('Security Portfolio')
    expect(portfolio).toHaveTextContent(/42\s*500\.00\s*CZK/)
    // React Native Web pressables stay transparent; the composed Native surface owns the theme fill.
    expectThemeSurfaceOnControlOrAncestor(portfolio, '--uc-surface-raised')
    expectThemeTokenStyle(screen.getByText('Security Portfolio'), 'color', '--uc-text')
  })

  it('keeps positive and negative investment status tokens in the shipped CSS graph', () => {
    const styles = configuredStyles().join('\n')
    expect(styles).toContain('--uc-green-olive')
    expect(styles).toContain('--uc-status-red')
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
