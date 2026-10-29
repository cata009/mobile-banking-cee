// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render as rtlRender, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AnalyticsScreen from '@/app/screens/analytics/AnalyticsScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import { mockProducts, type Product } from '@/data/products'
import { createEvoTranslations } from '@/translations/evo'
import { createSpendingAnalyticsTimeline, createSpendingRangeSummary } from '@/data/spendingAnalytics'
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'
import {
  loadActualNativeAnalyticsModule,
  productCountsForNative,
  resetNativeAnalyticsRenderer,
  waitForNativeAnalyticsScreen,
} from './nativeAnalyticsL6Harness'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
}))
const nativeLoader = vi.hoisted(() => ({ load: vi.fn() }))

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: nativeLoader.load,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

async function renderNative(ui: React.ReactElement, options?: Parameters<typeof rtlRender>[1]) {
  const view = rtlRender(ui, options)
  await waitForNativeAnalyticsScreen(view.container)
  return view
}

function Providers({ children, accounts }: { children: React.ReactNode; accounts?: number }) {
  const productCounts = productCountsForNative(mockedProductState.categories.flatMap(category => category.products))
  if (accounts !== undefined) productCounts.accounts = accounts
  return (
    <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027', productCounts }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function HiddenProviders({ children }: { children: React.ReactNode }) {
  return <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027', amountsHidden: true, productCounts: productCountsForNative(mockedProductState.categories.flatMap(category => category.products)) }}>
    <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
  </DemoProvider>
}

function PrivacyControl() {
  const { toggleAmountsHidden } = useDemo()
  return <button onClick={toggleAmountsHidden}>Toggle amounts for test</button>
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

beforeEach(() => {
  resetNativeAnalyticsRenderer()
  nativeLoader.load.mockReset()
  nativeLoader.load.mockImplementation(loadActualNativeAnalyticsModule)
  mockedProductState.categories = [{ key: 'test-products', title: 'Test products', products: mockProducts }]
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const spendingCopy = createEvoTranslations('en').spending

function periodControl() {
  return screen.getByRole('button', { name: spendingCopy.changePeriod })
}

function periodControlText() {
  return periodControl().textContent?.replace(/([A-Za-z])(?=\d{4})/g, '$1 ').replace(/\s+/g, ' ').trim() ?? ''
}

function expectNativeSelected(element: HTMLElement, selected = true) {
  expect(element.getAttribute('aria-selected') ?? element.getAttribute('aria-pressed')).toBe(String(selected))
}

function categoryRows() {
  return screen.getAllByRole('button').filter((row) => /\d+\s*transactions?/i.test(row.textContent ?? ''))
}

function categorySectionRows(title: string) {
  const heading = screen.getByText(title)
  const section = heading.parentElement
  if (!section) throw new Error(`Expected a Native section for ${title}`)
  return within(section).getAllByRole('button').filter((button) => /\d+\s*transactions?/i.test(button.textContent ?? ''))
}

function arcStrokes() {
  const marker = screen.getAllByTestId('cz-pfm-donut-marker')[0]
  if (!marker) throw new Error('Expected a Native donut marker')
  let donut = marker.parentElement
  while (donut && donut !== document.body && !donut.querySelector('svg circle')) {
    donut = donut.parentElement
  }
  return Array.from(donut?.querySelectorAll('svg circle') ?? []).map((arc) => arc.getAttribute('stroke'))
}

function abbreviatedMonth(label: string) {
  const [month, year] = label.split(' ')
  if (!month || !year) return label
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(`${month} 1, ${year}`))
}

/** Select a custom date span via Native period selectors, not the host clock. */
async function selectCustomRange(fromMonth: string, toMonth: string) {
  fireEvent.click(periodControl())
  await screen.findByRole('button', { name: spendingCopy.presetCustom })
  fireEvent.click(screen.getByRole('button', { name: spendingCopy.presetCustom }))
  await screen.findByRole('button', { name: spendingCopy.from })
  fireEvent.click(screen.getByRole('button', { name: spendingCopy.from }))
  await screen.findByRole('button', { name: fromMonth })
  fireEvent.click(screen.getByRole('button', { name: fromMonth }))
  await screen.findByRole('button', { name: spendingCopy.to })
  fireEvent.click(screen.getByRole('button', { name: spendingCopy.to }))
  await screen.findByRole('button', { name: toMonth })
  fireEvent.click(screen.getByRole('button', { name: toMonth }))
  await screen.findByRole('button', { name: spendingCopy.apply })
  fireEvent.click(screen.getByRole('button', { name: spendingCopy.apply }))
  await waitFor(() => {
    const text = periodControlText()
    expect(text).toContain(abbreviatedMonth(fromMonth))
    expect(text).toContain(abbreviatedMonth(toMonth))
    expect(text).toContain(fromMonth.split(' ')[1] ?? '')
    expect(text).toContain(toMonth.split(' ')[1] ?? '')
  })
}

/** Select a canonical month via Native period selectors, not the host clock. */
async function selectMonth(label: string) {
  await selectCustomRange(label, label)
}

describe('Evo 2027 analytics overview', () => {
  it('masks Native PFM totals and restores converted amounts when privacy is disabled', async () => {
    await renderNative(<><PrivacyControl /><AnalyticsScreen initialScopeId="acc-1" /></>, { wrapper: HiddenProviders })
    const expense = screen.getByTestId('cz-pfm-expense')
    expect(expense).toHaveTextContent('****')
    expect(expense).toHaveTextContent('CZK')
    expect(expense).not.toHaveTextContent('470,00')
    fireEvent.click(screen.getByRole('button', { name: 'Toggle amounts for test' }))
    await waitFor(() => expect(expense).not.toHaveTextContent('****'))
    expect(expense).toHaveTextContent(/470[,.]00/)
  })

  it('keeps the latest-period monetary total masked in the account expense detail', async () => {
    const { container } = await renderNative(<AnalyticsScreen initialScopeId="acc-1" initialDirection="expense" />, { wrapper: HiddenProviders })
    expect(container).not.toHaveTextContent('470,00')
    expect(container).not.toHaveTextContent('250,00')
    expect(container).not.toHaveTextContent('220,00')
    const transferRow = categoryRows().find((row) => row.getAttribute('aria-label')?.startsWith('Transfers'))
    if (!transferRow) throw new Error('Expected the Native Transfers expense row')
    fireEvent.click(transferRow)
    expect(await screen.findAllByTestId('cz-pfm-transaction')).toHaveLength(2)
    expect(container).not.toHaveTextContent('470,00')
    expect(container).not.toHaveTextContent('250,00')
    expect(container).not.toHaveTextContent('220,00')
    expect(container.textContent).not.toMatch(/\d[,.]\d{2}\s*CZK/)
  })
  it('can open directly on one account and the requested money direction', async () => {
    await renderNative(
      <AnalyticsScreen initialScopeId="acc-1" initialDirection="income" />,
      { wrapper: Providers },
    )

    expect(screen.getAllByRole('heading', { name: 'Money in' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Choose accounts' })).toHaveTextContent('Primary Account')
    expect(screen.getByRole('tab', { name: 'Donut' })).toBeInTheDocument()
  })

  it('scopes the overview to All accounts or one selected current account', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })

    const scopeTrigger = screen.getByRole('button', { name: 'Choose accounts' })
    expect(scopeTrigger).toHaveTextContent('All accounts')
    const account = mockProducts.find((product) => product.type === 'current_account')
    if (!account) throw new Error('Expected a Source current-account fixture')
    const currentAccounts = mockProducts.filter((product) => product.type === 'current_account')
    const latestSourceMonth = createSpendingAnalyticsTimeline('CZ', mockProducts).activePeriodKey
    const sourceSummary = createSpendingRangeSummary(
      'CZ',
      currentAccounts,
      [latestSourceMonth],
      { key: latestSourceMonth, label: latestSourceMonth, year: latestSourceMonth.slice(0, 4), kind: 'month' },
    )
    const accountSummary = createSpendingRangeSummary(
      'CZ',
      [account],
      [latestSourceMonth],
      { key: latestSourceMonth, label: latestSourceMonth, year: latestSourceMonth.slice(0, 4), kind: 'month' },
    )
    expect(screen.getByTestId('cz-pfm-expense')).toHaveTextContent(formatEvo2027Number(sourceSummary.spendingTotal))
    fireEvent.click(scopeTrigger)
    fireEvent.click(await screen.findByRole('radio', { name: account.name }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Choose accounts' })).toHaveTextContent(account.name),
    )
    await waitFor(() =>
      expect(screen.getByTestId('cz-pfm-expense')).toHaveTextContent(formatEvo2027Number(accountSummary.spendingTotal)),
    )
  })

  it('opens Native PFM with a period selector and spending/income category sections', async () => {
    const { container } = await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    await selectMonth('April 2026')

    expect(periodControlText()).toContain('April')
    expect(screen.getByTestId('cz-pfm-income')).toBeInTheDocument()
    expect(screen.getByTestId('cz-pfm-expense')).toBeInTheDocument()
    expect(screen.getByTestId('cz-pfm-net')).toBeInTheDocument()
    expect(screen.getByText('Top spending categories')).toBeInTheDocument()
    expect(screen.getByText('Top income categories')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose accounts' })).toHaveTextContent('All accounts')
    expect(screen.getByRole('button', { name: 'All spending categories' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All income categories' })).toBeInTheDocument()
    expect(categoryRows().length).toBeGreaterThan(0)
    expect(container).not.toHaveTextContent(/transactions need a category/i)
  })

  it('offers presets and a custom range, and closes the axis with the year totals', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    expect(screen.getByTestId('cz-pfm-expense')).toHaveTextContent(/470[,.]00/)
    expect(screen.getByTestId('cz-pfm-income')).toHaveTextContent(/0[,.]00/)
    expect(screen.getByTestId('cz-pfm-net')).toHaveTextContent(/470[,.]00/)
    expect(periodControlText()).toContain('September 2026')

    await selectMonth('April 2026')
    expect(periodControlText()).toContain('April 2026')

    fireEvent.click(screen.getByRole('button', { name: 'All spending categories' }))
    await screen.findByRole('tab', { name: 'Donut' })
    fireEvent.click(periodControl())
    expect(await screen.findByRole('radio', { name: spendingCopy.presetLast3Months })).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: spendingCopy.presetYearToDate })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: spendingCopy.presetLast3Months }))
    await waitFor(() => expect(periodControlText()).toContain(spendingCopy.presetLast3Months))
  })

  it('reaches a custom span of months, which no preset covers', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    fireEvent.click(screen.getByRole('button', { name: 'All spending categories' }))
    await screen.findByRole('tab', { name: 'Donut' })
    await selectCustomRange('April 2026', 'June 2026')

    expect(periodControlText()).toContain('Apr')
    expect(periodControlText()).toContain('Jun')
    expect(periodControlText()).toContain('2026')
    expect(periodControlText()).toContain('–')
  })

  it('exposes the Native PFM scope, period, and direction controls in a stable order', async () => {
    const { container } = await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    const scope = screen.getByRole('button', { name: 'Choose accounts' })
    const period = periodControl()
    const income = screen.getByRole('button', { name: 'Analyse money in' })
    const expense = screen.getByRole('button', { name: 'Analyse money out' })
    const follows = (first: HTMLElement, second: HTMLElement) =>
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

    expect(follows(scope, period)).toBe(true)
    expect(follows(period, income)).toBe(true)
    expect(follows(income, expense)).toBe(true)
    expect(container).toHaveTextContent(/\d[,.]\d{2}\s*CZK/)
  })

  it('preserves canonical converted net totals for positive and negative periods', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    const currentAccounts = mockProducts.filter((product) => product.type === 'current_account')
    const timeline = createSpendingAnalyticsTimeline('CZ', currentAccounts)
    const months = timeline.periods.filter((period) => period.kind === 'month')
    const positive = months.find((period) => (timeline.summariesByPeriodKey[period.key]?.netTotal ?? 0) > 0)
    const negative = months.find((period) => (timeline.summariesByPeriodKey[period.key]?.netTotal ?? 0) < 0)
    expect(positive).toBeDefined()
    expect(negative).toBeDefined()
    if (!positive || !negative) throw new Error('Expected positive and negative CZ PFM periods')
    const label = (key: string) => `${new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(new Date(`${key}-01T12:00:00Z`))} ${key.slice(0, 4)}`
    await selectMonth(label(positive.key))
    let net = screen.getByTestId('cz-pfm-net')
    expect(net).toHaveTextContent(formatEvo2027Number(timeline.summariesByPeriodKey[positive.key]!.netTotal))
    expect(net.textContent).not.toMatch(/[−-]/)
    await selectMonth(label(negative.key))
    net = screen.getByTestId('cz-pfm-net')
    expect(net).toHaveTextContent(formatEvo2027Number(timeline.summariesByPeriodKey[negative.key]!.netTotal))
    expect(net.textContent).toMatch(/[−-]/)
  })

  it('renders the Native net, income and expense totals in the overview', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    const net = screen.getByTestId('cz-pfm-net')
    const income = screen.getByTestId('cz-pfm-income')
    const expense = screen.getByTestId('cz-pfm-expense')
    const follows = (first: HTMLElement, second: HTMLElement) =>
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

    expect(net).toHaveTextContent(/CZK/)
    expect(income).toHaveTextContent(/CZK/)
    expect(expense).toHaveTextContent(/CZK/)
    expect(follows(income, expense)).toBe(true)
    expect(follows(net, income)).toBe(true)
  })

  it('shows matching top money-out and money-in sections on the overview', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    await selectMonth('April 2026')

    expect(screen.getByText('Top spending categories')).toBeInTheDocument()
    expect(screen.getByText('Top income categories')).toBeInTheDocument()
    expect(categoryRows().length).toBeGreaterThanOrEqual(6)
    expect(screen.getByRole('button', { name: 'All spending categories' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All income categories' })).toBeInTheDocument()
    expect(categorySectionRows('Top spending categories').length).toBeGreaterThan(0)
    const incomeRows = categorySectionRows('Top income categories')
    expect(incomeRows.some((row) => row.getAttribute('aria-label')?.startsWith('Income'))).toBe(true)
    expect(incomeRows.some((row) => row.getAttribute('aria-label')?.startsWith('Transfers'))).toBe(true)
  })

  it('opens the money-in category detail with the income direction', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    await selectMonth('April 2026')
    fireEvent.click(screen.getByRole('button', { name: 'All income categories' }))
    await screen.findByRole('tab', { name: 'Donut' })
    const incomeRow = categoryRows().find((row) => row.getAttribute('aria-label')?.startsWith('Income'))
    if (!incomeRow) throw new Error('Expected the Native Income breakdown row')
    fireEvent.click(incomeRow)

    expect(await screen.findByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getAllByText('Income').length).toBeGreaterThan(0)
    expect((await screen.findAllByTestId('cz-pfm-transaction')).length).toBeGreaterThan(0)
  })

})

describe('Evo 2027 expense chart and split-by breakdown', () => {
async function openExpenses(month = 'April 2026', accounts?: number) {
    const wrapper = accounts === undefined
      ? Providers
      : ({ children }: { children: React.ReactNode }) => <Providers accounts={accounts}>{children}</Providers>
    const rendered = await renderNative(<AnalyticsScreen />, { wrapper })
    await selectMonth(month)
    fireEvent.click(screen.getByRole('button', { name: 'All spending categories' }))
    await screen.findAllByTestId('cz-pfm-donut-marker')
    return rendered
  }

  function donutCategoryButtons() {
    return screen.getAllByTestId('cz-pfm-donut-marker')
  }

  function breakdownRows() {
    return categoryRows()
  }

  async function selectSplitMode(label: string) {
    fireEvent.click(screen.getByRole('tab', { name: label }))
    await waitFor(() => expect(screen.getByRole('tab', { name: label })).toHaveAttribute('aria-selected', 'true'))
  }

  it('shows the donut and a category breakdown instead of a raw transaction list', async () => {
    await openExpenses()

    expect(donutCategoryButtons().length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Split by')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add transaction' })).toBeInTheDocument()
    expect(breakdownRows().length).toBeGreaterThan(1)
    expect(periodControl()).toBeInTheDocument()
    expect(screen.queryByTestId('cz-pfm-transaction')).not.toBeInTheDocument()
  })

  it('keeps Native chart mode accessible and preserves marker geometry', async () => {
    await openExpenses()

    const donutTab = screen.getByRole('tab', { name: 'Donut' })
    const barsTab = screen.getByRole('tab', { name: 'Bars' })
    expect(donutTab).toHaveAttribute('aria-selected', 'true')
    const marker = donutCategoryButtons()[0]
    if (!marker) throw new Error('Expected a Native donut marker')
    expect(window.getComputedStyle(marker).width).toBe('32px')
    expect(window.getComputedStyle(marker).height).toBe('32px')
    fireEvent.click(barsTab)
    await waitFor(() => expect(barsTab).toHaveAttribute('aria-selected', 'true'))
    expect(donutTab).toHaveAttribute('aria-selected', 'false')
    expect(screen.getAllByRole('button', { name: /^Select / }).length).toBeGreaterThan(0)
  })

  it('moves to adjacent Native periods without losing the selected month', async () => {
    await openExpenses('September 2026')
    expect(periodControlText()).toContain('September 2026')
    fireEvent.click(screen.getByRole('button', { name: spendingCopy.previousPeriod }))
    await waitFor(() => expect(periodControlText()).toContain('August 2026'))
    fireEvent.click(screen.getByRole('button', { name: spendingCopy.nextPeriod }))
    await waitFor(() => expect(periodControlText()).toContain('September 2026'))

    fireEvent.click(periodControl())
    fireEvent.click(await screen.findByRole('radio', { name: spendingCopy.presetLastYear }))
    await waitFor(() => expect(periodControlText()).toContain('2025'))
  })

  it('keeps Income on the same period control, with the year totals closing the axis', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    await selectMonth('April 2026')
    fireEvent.click(screen.getByRole('button', { name: 'All income categories' }))

    const incomeHeadings = await screen.findAllByRole('heading', { name: 'Money in' })
    expect(incomeHeadings).toHaveLength(1)
    expect(incomeHeadings[0]).toBeVisible()
    const incomeTitles = screen.getAllByText('Money in', { exact: true })
    expect(incomeTitles).toHaveLength(2)
    expect(incomeTitles.filter(title => title.closest('[aria-hidden="true"]'))).toHaveLength(1)
    expect(periodControlText()).toContain('April 2026')
    fireEvent.click(periodControl())
    fireEvent.click(await screen.findByRole('radio', { name: spendingCopy.presetLastYear }))
    await waitFor(() => expect(periodControlText()).toContain('2025'))
  })

  it('inhibits the other arcs when one category is picked and restores them when it is picked again', async () => {
    await openExpenses()

    expect(arcStrokes().every((stroke) => stroke !== '#cccccc')).toBe(true)

    const [first] = donutCategoryButtons()
    if (!first) throw new Error('Expected a donut category')
    const firstLabel = first.getAttribute('aria-label')
    const category = firstLabel?.replace(/^Show (.*) transactions$/, '$1')

    fireEvent.click(first)
    await waitFor(() => {
      const selectedMarker = screen.getByRole('button', { name: firstLabel ?? '' })
      expectNativeSelected(selectedMarker)
      expect(arcStrokes().filter((stroke) => stroke === '#cccccc')).toHaveLength(arcStrokes().length - 1)
    })

    expect(breakdownRows().map((row) => row.getAttribute('aria-label'))).toEqual([category])

    fireEvent.click(screen.getByRole('button', { name: firstLabel ?? '' }))
    await waitFor(() => {
      expect(arcStrokes().every((stroke) => stroke !== '#cccccc')).toBe(true)
      expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument()
      expect(breakdownRows().length).toBeGreaterThan(1)
    })
  })

  it('draws only arcs big enough to carry a marker and folds the rest into Other', async () => {
    await openExpenses()

    // Up to six named arcs, but only while each one is worth drawing: an arc
    // under 8% renders as a stub whose marker lands on its neighbours', which is
    // how the ring ended up with a pile of icons in one corner.
    const donutButtons = donutCategoryButtons()
    expect(donutButtons.length).toBeGreaterThan(1)
    expect(donutButtons.length).toBeLessThanOrEqual(7)
    const otherButton = donutButtons.find((button) => button.getAttribute('aria-label')?.includes('Other'))
    if (!otherButton) throw new Error('Expected an Other donut segment')

    expect(window.getComputedStyle(otherButton).width).toBe('32px')
    expect(window.getComputedStyle(otherButton).height).toBe('32px')
    // The marker counts what is folded in. Three dots meant "more options"
    // everywhere else in the app, which is not what this arc opens.
    expect(otherButton.textContent?.trim()).toMatch(/^\+\d+$/)

    const primaryKeys = donutButtons
      .map((button) => button.getAttribute('aria-label')?.replace(/^Show (.*) transactions$/, '$1'))
      .filter((key): key is string => Boolean(key) && key !== 'Other')
    const allRowCount = breakdownRows().length

    fireEvent.click(otherButton)
    await waitFor(() => expectNativeSelected(otherButton))

    // Other is one arc but many categories, so the headline counts what it folds
    // in rather than naming the arc.
    const foldedCount = Number(otherButton.textContent?.trim().replace('+', ''))
    expect(screen.getAllByText(`${foldedCount} categories`).length).toBeGreaterThan(0)
    // Picking Other narrows the list to what the ring folded away: fewer rows
    // than the full breakdown, and not one of them is a named arc.
    const remaining = breakdownRows().map((row) => row.getAttribute('aria-label'))
    expect(remaining.length).toBeGreaterThan(0)
    expect(remaining.length).toBeLessThan(allRowCount)
    expect(remaining.some((key) => key !== null && primaryKeys.includes(key))).toBe(false)
  })

  it('keeps several categories coloured and breaks all of them down', async () => {
    await openExpenses()

    const [first, second] = donutCategoryButtons()
    if (!first || !second) throw new Error('Expected at least two donut categories')
    const categories = [
      first.getAttribute('aria-label')?.replace(/^Show (.*) transactions$/, '$1'),
      second.getAttribute('aria-label')?.replace(/^Show (.*) transactions$/, '$1'),
    ]

    fireEvent.click(first)
    await waitFor(() => expectNativeSelected(first))
    const secondButton = donutCategoryButtons()[1] as HTMLElement
    fireEvent.click(secondButton)
    await waitFor(() => expectNativeSelected(secondButton))

    expect(arcStrokes().filter((stroke) => stroke === '#cccccc')).toHaveLength(arcStrokes().length - 2)
    expect(breakdownRows().map((row) => row.getAttribute('aria-label')).sort())
      .toEqual([...categories].sort())
  })

  it('opens a category row and lists its subcategories and transactions', async () => {
    await openExpenses()

    const [row] = breakdownRows()
    if (!row) throw new Error('Expected a breakdown row')
    const category = row.getAttribute('aria-label')

    fireEvent.click(row)

    expect(await screen.findByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect((await screen.findAllByRole('heading', { name: category ?? '' })).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('checkbox', { name: /Include / }).length).toBeGreaterThan(0)
    const transactions = await screen.findAllByTestId('cz-pfm-transaction')
    expect(transactions).not.toHaveLength(0)
    expect(transactions.every((transaction) => transaction.getAttribute('aria-label')?.startsWith('Open '))).toBe(true)
  })

  it('breaks spending down by merchant and drills into one merchant', async () => {
    await openExpenses()

    const categoryRowKeys = breakdownRows().map((row) => row.getAttribute('aria-label'))

    await selectSplitMode('Merchants')

    const merchantRows = breakdownRows()
    expect(merchantRows.length).toBeGreaterThan(0)
    expect(merchantRows.map((row) => row.getAttribute('aria-label'))).not.toEqual(categoryRowKeys)

    const [firstMerchant] = merchantRows
    if (!firstMerchant) throw new Error('Expected a merchant row')
    const merchant = firstMerchant.getAttribute('aria-label')

    fireEvent.click(firstMerchant)

    const transactions = await screen.findAllByTestId('cz-pfm-transaction')
    expect(transactions).not.toHaveLength(0)
    expect(transactions.every((transaction) => transaction.textContent?.includes(merchant ?? ''))).toBe(true)
    expect(screen.queryAllByRole('checkbox', { name: /Include / })).toHaveLength(0)
  })

  it('offers the currency split only when the scope actually mixes currencies', async () => {
    await openExpenses('April 2026', 1)

    const available = () => screen.getAllByRole('tab').map((tab) => tab.getAttribute('aria-label'))
    expect(available()).not.toContain('Currencies')
    await selectSplitMode('Categories')

    cleanup()
    mockedProductState.categories = [{
      key: 'test-products',
      title: 'Test products',
      products: [
        ...mockProducts,
        { id: 'acc-eur', type: 'current_account', name: 'Euro Account', accountNumber: '9876543210987654', balance: 1200, currency: 'EUR' },
      ],
    }]

    await openExpenses('April 2026', 2)

    expect(available()).toContain('Currencies')
    await selectSplitMode('Currencies')
    expect(breakdownRows().length).toBeGreaterThan(0)
  })

  it('gives currency rows the shared currency roundel rather than a letter badge', async () => {
    cleanup()
    mockedProductState.categories = [{
      key: 'test-products',
      title: 'Test products',
      products: [
        ...mockProducts,
        { id: 'acc-eur', type: 'current_account', name: 'Euro Account', accountNumber: '9876543210987654', balance: 1200, currency: 'EUR' },
      ],
    }]

    await openExpenses('April 2026', 2)

    await selectSplitMode('Currencies')

    const [row] = breakdownRows()
    if (!row) throw new Error('Expected a currency row')
    expect(screen.getAllByLabelText(/(CZK|EUR) currency/).length).toBeGreaterThan(0)
    expect(row.textContent).toMatch(/CZK|EUR/)
  })

  it('switches to the bar chart, isolates a bucket and carries it into the transaction list', async () => {
    await openExpenses()

    await selectSplitMode('Bars')
    expect(screen.queryAllByTestId('cz-pfm-donut-marker')).toHaveLength(0)
    const bars = screen.getAllByRole('button', { name: /^Select \d/ })
    expect(bars.length).toBeGreaterThanOrEqual(4)
    expect(bars.length).toBeLessThanOrEqual(5)
    const spentBar = bars.find((bar) => !bar.hasAttribute('aria-disabled'))
    if (!spentBar) throw new Error('Expected a Native week bar')
    const firstDay = Number(spentBar.getAttribute('aria-label')?.match(/^Select (\d+)/)?.[1])
    if (!Number.isFinite(firstDay)) throw new Error('Expected a Native bar date range')
    const weekIndex = Math.floor((firstDay - 1) / 7)
    fireEvent.click(spentBar)
    await waitFor(() => expectNativeSelected(spentBar))

    fireEvent.click(screen.getByRole('button', { name: 'See all transactions' }))
    const transactions = await screen.findAllByTestId('cz-pfm-transaction')
    expect(transactions.length).toBeGreaterThan(0)
    expect(transactions.every((transaction) => {
      const date = Array.from(transaction.querySelectorAll<HTMLElement>('[dir="auto"]'))
        .find(element => /^\d{1,2}\s+\p{L}+\s*·/u.test(element.textContent ?? ''))
      const day = Number(date?.textContent?.match(/^(\d{1,2})/)?.[1])
      return Number.isFinite(day) && Math.floor((day - 1) / 7) === weekIndex
    })).toBe(true)
  })

  it('preserves the canonical selected-period expense total in overview and analysis', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })
    const overviewExpense = screen.getByTestId('cz-pfm-expense').textContent
    expect(overviewExpense).toMatch(/\d[,.]\d{2}/)
    fireEvent.click(screen.getByRole('button', { name: 'All spending categories' }))
    await waitFor(() => expect(document.body).toHaveTextContent(overviewExpense ?? ''))
  })

  it('returns to the overview when a drill-in started there', async () => {
    await renderNative(<AnalyticsScreen />, { wrapper: Providers })

    const [topCategory] = categoryRows()
    if (!topCategory) throw new Error('Expected a top category row on the overview')

    fireEvent.click(topCategory)
    expect(await screen.findByRole('button', { name: 'Back' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(await screen.findByTestId('cz-pfm-expense')).toBeInTheDocument()
    expect(screen.queryByTestId('cz-pfm-transaction')).not.toBeInTheDocument()
  })
})

