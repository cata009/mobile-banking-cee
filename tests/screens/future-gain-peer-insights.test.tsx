// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

// Keep the compiled Native UI real while routing its manifest load through the Web test renderer.
vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

const FUTURE_GAIN_PRODUCTS_URL =
  '/?product=PI&country=RS&scenario=active&ds=current&release=release-future-rs-future-gain' +
  '&bank=retail-single-account&theme=light&lang=en&screen=products'

function themeTokenValue(element: Element, token: string, resolving = new Set<string>()): string {
  if (resolving.has(token)) return ''
  resolving.add(token)
  let current: Element | null = element
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

function resolvedThemeTokenColor(element: Element, property: 'background-color' | 'color' | 'fill', token: string) {
  const tokenValue = themeTokenValue(element, token)
  if (!tokenValue) throw new Error(`Missing shipped theme token ${token}`)

  const probe = property === 'fill' ? document.createElementNS('http://www.w3.org/2000/svg', 'svg') : document.createElement('span')
  probe.style.setProperty(property, tokenValue)
  ;(element.parentElement ?? document.body).append(probe)
  const expected = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()

  expect(expected).not.toBe('')
  expect(expected).not.toContain('var(')
  return expected
}

function expectThemeTokenStyle(element: Element, property: 'background-color' | 'color', token: string) {
  const expected = resolvedThemeTokenColor(element, property, token)
  const actual = getComputedStyle(element).getPropertyValue(property)
  expect(actual).not.toBe('')
  expect(actual).toBe(expected)
}

function expectGlyphTokenStyle(container: HTMLElement, token: string) {
  const expected = resolvedThemeTokenColor(container, 'fill', token)
  const normalizeColor = (value: string) => {
    const probe = document.createElement('span')
    probe.style.color = value
    document.body.append(probe)
    const result = getComputedStyle(probe).color
    probe.remove()
    return result
  }
  const tokenReference = `var(${token})`
  const glyphs = Array.from(container.querySelectorAll('svg, svg *, img'))
  const directPaint = glyphs.some((glyph) => {
      const style = getComputedStyle(glyph)
      const declaredColors = ['fill', 'stroke', 'color'].flatMap((property) => [
        style.getPropertyValue(property),
        glyph.getAttribute(property) ?? '',
      ])
      return (
        declaredColors.some((color) => color === tokenReference || (color.trim() && normalizeColor(color) === normalizeColor(expected))) ||
        glyph.getAttribute('style')?.includes(tokenReference) === true
      )
    })
  const filterIds = Array.from(
    container.querySelectorAll('*'),
    (element) => `${getComputedStyle(element).filter} ${element.getAttribute('style') ?? ''}`,
  ).flatMap((style) => Array.from(style.matchAll(/url\(#([^)]+)\)/g), ([, id]) => id!))
  const filterPaint = filterIds.some((id) => {
    const filter = container.ownerDocument.getElementById(id)
    if (!filter) return false
    return Array.from(filter.querySelectorAll('feFlood')).some((flood) => {
      const values = [getComputedStyle(flood).getPropertyValue('flood-color'), flood.getAttribute('flood-color') ?? '']
      return values.some((value) => value === tokenReference || (value.trim() && normalizeColor(value) === normalizeColor(expected)))
    })
  })
  expect(directPaint || filterPaint).toBe(true)
}

function fontSizeAcrossAncestors(element: HTMLElement): number {
  let size = 0
  let current: Element | null = element
  while (current) {
    // jsdom's RN Web font shorthand can shadow a correct inline font-size longhand.
    const currentSize = Number.parseFloat((current as HTMLElement).style.fontSize || getComputedStyle(current).fontSize)
    if (Number.isFinite(currentSize)) size = Math.max(size, currentSize)
    current = current.parentElement
  }
  return size
}

function titleVariants(titles: HTMLElement[]) {
  const large = titles.find((title) => fontSizeAcrossAncestors(title) >= 28)
  if (!large) throw new Error('The Native page header must retain the 28px Source title')
  const compact = titles.find((title) => title !== large)
  if (!compact) throw new Error('The Native page header must expose its compact title variant')
  return { large, compact }
}

async function renderAt(url: string) {
  window.history.replaceState({}, '', url)
  const result = render(<App />)
  const { asyncNativeReady } = await import('../helpers/nativeWebRenderer')
  await asyncNativeReady(result.container)
  return result
}

async function openPeerInsights() {
  fireEvent.click(await screen.findByRole('button', { name: /Products for you!/ }))
  fireEvent.click(await screen.findByRole('switch', { name: 'I agree with the terms and conditions' }))
  await waitFor(() => expect(screen.getByRole('switch', { name: 'I agree with the terms and conditions' })).toBeChecked())
  await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled())
  fireEvent.click(await screen.findByRole('button', { name: 'Next' }))
  await screen.findByRole('heading', { name: 'Achieve your life goals' })
}

const layoutObservers = new Set<{ nodes: Set<Element>; notify: () => void }>()

beforeEach(async () => {
  const { resetNativeWebRendererDiagnostics } = await import('../helpers/nativeWebRenderer')
  resetNativeWebRendererDiagnostics()
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      nodes = new Set<Element>()
      constructor(private callback: ResizeObserverCallback) { layoutObservers.add(this) }
      observe(node: Element) { this.nodes.add(node) }
      unobserve(node: Element) { this.nodes.delete(node) }
      disconnect() { this.nodes.clear() }
      notify() {
        this.callback(Array.from(this.nodes, target => ({ target, contentRect: { width: (target as HTMLElement).offsetWidth || 375, height: (target as HTMLElement).offsetHeight || 812 } }) as ResizeObserverEntry), this)
      }
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('RS Future Gain peer insights journey', () => {
  it('requires consent before continuing to the selectable goals carousel', async () => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)

    fireEvent.click(await screen.findByRole('button', { name: /Products for you!/ }))

    expect(await screen.findByRole('heading', { name: 'GDPR notice' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'mBank PRIVACY Policy' })).toHaveAttribute(
      'href',
      'https://www.unicreditbank.rs/en/o-nama/politika_privatnosti_mbanking.html',
    )
    const agreement = screen.getByRole('switch', { name: 'I agree with the terms and conditions' })
    const nextButton = screen.getByRole('button', { name: 'Next' })

    expect(agreement).not.toBeChecked()
    expect(nextButton).toBeDisabled()

    fireEvent.click(agreement)
    await waitFor(() => expect(agreement).toBeChecked())
    await waitFor(() => expect(nextButton).toBeEnabled())
    fireEvent.click(nextButton)

    expect(await screen.findByRole('heading', { name: 'Achieve your life goals' })).toBeInTheDocument()
    const main = await screen.findByRole('main')
    expect(screen.getByText('36 - 45')).toBeInTheDocument()
    expect(screen.getByText('2001 - 3000 €')).toBeInTheDocument()
    const homeTab = within(main).getByRole('tab', { name: 'Home & Living' })
    expect(homeTab).toHaveAttribute('aria-selected', 'true')
    expectThemeTokenStyle(homeTab, 'background-color', '--uc-future-goal-home')
    const peerInsights = within(main).getByRole('region', { name: 'Insights from clients similar to you' })
    expect(Number.parseFloat(getComputedStyle(peerInsights).paddingTop)).toBe(12)
    expect(Number.parseFloat(getComputedStyle(peerInsights).paddingBottom)).toBe(14)
    const housingLoanRow = within(main).getByRole('button', { name: 'Open Housing loan simulator' })
    expect(housingLoanRow).toHaveTextContent('Housing loan')
    expect(housingLoanRow).toHaveTextContent('More than 65% of clients like you chose this product')

    const carTab = within(main).getByRole('tab', { name: 'Buy a car' })
    fireEvent.click(carTab)
    await waitFor(() => expect(carTab).toHaveAttribute('aria-selected', 'true'))
    expect(homeTab).toHaveAttribute('aria-selected', 'false')
    expectThemeTokenStyle(carTab, 'background-color', '--uc-future-goal-buy-a-car')
    expectThemeTokenStyle(within(carTab).getByText('Buy a car'), 'color', '--uc-static-white')
    expectThemeTokenStyle(within(homeTab).getByText('Home & Living'), 'color', '--uc-text')
    expectGlyphTokenStyle(carTab, '--uc-static-white')
    expectGlyphTokenStyle(homeTab, '--uc-text')
    expect(carTab).toBeVisible()
    const carLoanRow = await within(main).findByRole('button', { name: 'Open Car loan simulator' })
    expect(carLoanRow).toBeVisible()
    expect(carLoanRow).toHaveTextContent('Car loan')
    await waitFor(() => expect(within(main).queryByRole('button', { name: 'Open Housing loan simulator' })).not.toBeInTheDocument())

    fireEvent.click(await within(main).findByRole('button', { name: 'Dismiss pre-approved products message' }))
    await waitFor(() => expect(screen.queryByText('Explore your pre-approved products in UCB')).not.toBeInTheDocument())

    fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { name: 'GDPR notice' })).toBeInTheDocument()
    expect(await screen.findByRole('switch', { name: 'I agree with the terms and conditions' })).toBeChecked()
    fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('button', { name: /Products for you!/ })).toBeInTheDocument()
  })

  it('collapses the large page title into the centered header while scrolling', async () => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()

    const title = 'Achieve your life goals'
    const main = await screen.findByRole('main')
    const page = main.parentElement ?? main
    const titles = within(page).getAllByRole('heading', { name: title, hidden: true })
    expect(titles).toHaveLength(2)
    const { large, compact } = titleVariants(titles)
    expect(fontSizeAcrossAncestors(large)).toBe(28)
    expect(large).toBeVisible()
    expect(compact).not.toBeVisible()
    expect(within(page).getAllByRole('heading', { name: title })).toHaveLength(1)

    fireEvent.scroll(main, { target: { scrollTop: 64 } })

    await waitFor(() => {
      expect(large).not.toBeVisible()
      expect(compact).toBeVisible()
    })
    expect(getComputedStyle(compact).textAlign).toBe('center')
    expect(within(page).getAllByRole('heading', { name: title, hidden: true })).toHaveLength(2)
  })

  it('collapses the GDPR notice title into the centered header while scrolling', async () => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    fireEvent.click(await screen.findByRole('button', { name: /Products for you!/ }))

    const title = 'GDPR notice'
    const main = await screen.findByRole('main')
    const page = main.parentElement ?? main
    const titles = await within(page).findAllByRole('heading', { name: title, hidden: true })
    expect(titles).toHaveLength(2)
    const { large, compact } = titleVariants(titles)
    expect(fontSizeAcrossAncestors(large)).toBe(28)
    expect(large).toBeVisible()
    expect(compact).not.toBeVisible()
    expect(within(page).getAllByRole('heading', { name: title })).toHaveLength(1)

    fireEvent.scroll(main, { target: { scrollTop: 64 } })

    await waitFor(() => {
      expect(large).not.toBeVisible()
      expect(compact).toBeVisible()
    })
    expect(getComputedStyle(compact).textAlign).toBe('center')
    expect(within(page).getAllByRole('heading', { name: title, hidden: true })).toHaveLength(2)
  })

  it('keeps the goal carousel inset and scrolls the selected goal into view', async () => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()

    const main = await screen.findByRole('main')
    const carousel = within(main).getByRole('tablist', { name: 'What are you looking to achieve?' })
    const railContent = carousel.firstElementChild
    if (!railContent) throw new Error('The Native goal rail must have a content container')
    const railContentStyle = getComputedStyle(railContent)
    expect(Number.parseFloat(railContentStyle.paddingLeft)).toBe(17)
    expect(Number.parseFloat(railContentStyle.paddingRight)).toBe(Math.max(17, Math.ceil((375 - 96) / 2)))
    const goalTabs = within(main).getAllByRole('tab')
    expect(goalTabs).toHaveLength(4)
    goalTabs.forEach((tab) => expect(Number.parseFloat(getComputedStyle(tab).height)).toBeGreaterThanOrEqual(96))

    const finalGoal = goalTabs[3]!
    // jsdom has no layout engine: supply the authored geometry and deliver browser resize notifications.
    goalTabs.forEach((tab, index) => {
      Object.defineProperties(tab, {
        offsetLeft: { configurable: true, value: 17 + index * 104 },
        offsetWidth: { configurable: true, value: 96 },
        offsetHeight: { configurable: true, value: 96 },
      })
    })
    Object.defineProperties(carousel, {
      offsetWidth: { configurable: true, value: 375 },
      scroll: { configurable: true, value: ({ left = 0 }: ScrollToOptions) => { carousel.scrollLeft = left } },
    })
    for (const observer of layoutObservers) observer.notify()
    await new Promise(resolve => setTimeout(resolve, 10))
    const initialScrollLeft = carousel.scrollLeft
    fireEvent.click(finalGoal)
    await waitFor(() => expect(finalGoal).toHaveAttribute('aria-selected', 'true'))
    await waitFor(() => expect(carousel.scrollLeft).toBeGreaterThan(initialScrollLeft))
    expect(finalGoal).toBeVisible()
  })

  it.each([
    ['Home & Living', '--uc-future-goal-home'],
    ['Buy a car', '--uc-future-goal-buy-a-car'],
    ['Personal Goals', '--uc-future-goal-personal'],
    ['Saving', '--uc-future-goal-saving'],
  ])('uses the Figma selected color for %s', async (goal, token) => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    const main = await screen.findByRole('main')
    const tab = within(main).getByRole('tab', { name: goal })
    fireEvent.click(tab)

    await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'))
    expectThemeTokenStyle(tab, 'background-color', token)
    expectThemeTokenStyle(within(tab).getByText(goal), 'color', '--uc-static-white')
    expectGlyphTokenStyle(tab, '--uc-static-white')
    const [firstProductButton] = await within(main).findAllByRole('button', { name: /^Open .* simulator$/ })
    if (!firstProductButton) throw new Error(`No product simulator is available for ${goal}`)
    expect(firstProductButton).toBeVisible()
    expectGlyphTokenStyle(firstProductButton, '--uc-static-white')
  })

  it.each([
    ['Home & Living', 'Housing loan', 'Housing loan'],
    ['Home & Living', 'Loan for purchasing real estate abroad', 'Loan for purchasing real estate abroad'],
    ['Home & Living', 'Energy efficiency loan', 'Energy efficiency loan'],
    ['Home & Living', 'Credit cards', 'Credit Card'],
    ['Buy a car', 'Car loan', 'Car loan'],
    ['Buy a car', 'Cash loan', 'Cash loan'],
    ['Personal Goals', 'Personal loan', 'Personal loan'],
    ['Personal Goals', 'Credit cards', 'Credit Card'],
    ['Saving', 'Term deposit', 'Term deposit'],
    ['Saving', 'Investment funds', 'Investment funds'],
  ])('opens the %s simulator for %s', async (goal, product, heading) => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()

    fireEvent.click(await screen.findByRole('tab', { name: goal }))
    const productButtonName = `Open ${product} simulator`
    await waitFor(() => expect(screen.getByRole('button', { name: productButtonName })).toBeVisible())
    fireEvent.click(screen.getByRole('button', { name: productButtonName }))

    const simulatorScreen = await screen.findByRole('region', { name: `${product} simulator` })
    expect(simulatorScreen).toHaveTextContent(heading)
    expect(await screen.findByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('recalculates the loan installment when the amount changes', async () => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Housing loan simulator' }))

    const amount = await screen.findByRole('textbox', { name: 'Loan amount' })
    const simulator = await screen.findByRole('region', { name: 'Housing loan simulator' })
    const initialSimulatorContent = simulator.textContent
    expect(simulator).toHaveTextContent(/monthly installment/i)
    fireEvent.change(amount, { target: { value: '100000' } })

    await waitFor(() => expect(simulator.textContent).not.toBe(initialSimulatorContent))
    expect(simulator).toHaveTextContent('Loan amount')
  })

  it.each([
    ['Terms & conditions & collateral', 'The final conditions, eligibility and any collateral requirements'],
    ['Representative example', 'The estimate uses the amount, currency, duration and indicative rate'],
    ['Early payment', 'Early repayment conditions and any applicable costs'],
    ['Client’s rights to withdraw from a concluded agreement', 'Your rights, deadlines and the process for withdrawal'],
  ])('opens %s in a bottom sheet instead of expanding inline', async (title, content) => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Housing loan simulator' }))

    const disclosureButton = await screen.findByRole('button', { name: title })
    fireEvent.click(disclosureButton)

    const disclosureSheet = await screen.findByRole('dialog')
    expect(disclosureSheet).toHaveTextContent(title)
    expect(disclosureSheet).toHaveTextContent(content)
    expect(disclosureButton).not.toHaveAttribute('aria-expanded')
    const close = await within(disclosureSheet).findByRole('button', { name: 'Close sheet' })
    fireEvent.click(close)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('matches the credit card selection and product details from Figma', async () => {
    await renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    fireEvent.click(await screen.findByRole('button', { name: 'Open Credit cards simulator' }))

    const creditCardSimulator = await screen.findByRole('region', { name: 'Credit cards simulator' })
    expect(creditCardSimulator).toHaveTextContent('Credit Card')
    expect(creditCardSimulator).toHaveTextContent('Choose your type of Credit Card.')
    const flexia = screen.getByRole('button', { name: 'Flexia Mastercard' })
    const platinum = screen.getByRole('button', { name: 'Mastercard Platinum' })
    expect(flexia).toHaveAttribute('aria-selected', 'true')
    expect(platinum).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('img', { name: 'Flexia Mastercard card art' })).toBeInTheDocument()
    expect(creditCardSimulator).toHaveTextContent('Why should Flexia Mastercard be your first choice?')

    fireEvent.click(platinum)
    await waitFor(() => expect(platinum).toHaveAttribute('aria-selected', 'true'))
    await waitFor(() => expect(creditCardSimulator).toHaveTextContent('Why should Mastercard Platinum be your first choice?'))

    fireEvent.click(await screen.findByRole('button', { name: 'Credit card features' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Credit card features')
  })
})
