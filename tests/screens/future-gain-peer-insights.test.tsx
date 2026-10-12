// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

const FUTURE_GAIN_PRODUCTS_URL =
  '/?product=PI&country=RS&scenario=active&ds=current&release=release-future-rs-future-gain' +
  '&bank=retail-single-account&theme=light&lang=en&screen=products'

function renderAt(url: string) {
  window.history.replaceState({}, '', url)
  return render(<App />)
}

async function openPeerInsights() {
  fireEvent.click(await screen.findByRole('button', { name: /Products for you!/ }))
  fireEvent.click(await screen.findByRole('switch', { name: 'I agree with the terms and conditions' }))
  fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  await screen.findByRole('heading', { name: 'Achieve your life goals' })
}

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('RS Future Gain peer insights journey', () => {
  it('requires consent before continuing to the selectable goals carousel', async () => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)

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
    expect(agreement).toBeChecked()
    fireEvent.click(nextButton)

    expect(await screen.findByRole('heading', { name: 'Achieve your life goals' })).toBeInTheDocument()
    expect(screen.getByText('36 - 45')).toBeInTheDocument()
    expect(screen.getByText('2001 - 3000 €')).toBeInTheDocument()
    const homeTab = screen.getByRole('tab', { name: 'Home & Living' })
    expect(homeTab).toHaveAttribute('aria-selected', 'true')
    expect(homeTab).toHaveStyle({ backgroundColor: 'var(--uc-future-goal-home)' })
    expect(screen.getByRole('region', { name: 'Insights from clients similar to you' })).toHaveClass(
      'pt-[12px]',
      'pb-[14px]',
    )
    const housingLoan = screen.getByText('Housing loan').closest('article')
    expect(housingLoan).toHaveTextContent('More then 65% of clients like you chose this product')

    const carTab = screen.getByRole('tab', { name: 'Buy a car' })
    const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
    fireEvent.click(carTab)
    expect(carTab).toHaveAttribute('aria-selected', 'true')
    expect(carTab).toHaveStyle({ backgroundColor: 'var(--uc-future-goal-buy-a-car)' })
    expect(carTab.querySelector('img')).toHaveClass('brightness-0', 'invert')
    expect(homeTab.querySelector('img')).toHaveClass('brightness-0')
    expect(
      screen.getByRole('button', { name: 'Open Car loan simulator' }).querySelector('[data-product-icon]'),
    ).toHaveStyle({ backgroundColor: 'var(--uc-future-goal-buy-a-car)' })
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    expect(carTab.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    expect(carTab.querySelector('img')).toHaveClass('scale-[0.75]')
    expect(screen.getByText('Car loan')).toBeInTheDocument()
    expect(screen.queryByText('Housing loan')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss pre-approved products message' }))
    expect(screen.queryByText('Explore your pre-approved products in UCB')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'GDPR notice' })).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'I agree with the terms and conditions' })).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('button', { name: /Products for you!/ })).toBeInTheDocument()
  })

  it('collapses the large page title into the centered header while scrolling', async () => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()

    const main = screen.getByRole('main')
    Object.defineProperty(main, 'scrollTop', { configurable: true, value: 64 })
    fireEvent.scroll(main)

    const titles = screen.getAllByRole('heading', { name: 'Achieve your life goals' })
    expect(titles).toHaveLength(2)
    expect(titles[0]?.parentElement).toHaveStyle({ opacity: '1' })
    expect(titles[1]?.parentElement).toHaveStyle({ opacity: '0' })
  })

  it('collapses the GDPR notice title into the centered header while scrolling', async () => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    fireEvent.click(await screen.findByRole('button', { name: /Products for you!/ }))

    const main = screen.getByRole('main')
    Object.defineProperty(main, 'scrollTop', { configurable: true, value: 64 })
    fireEvent.scroll(main)

    const titles = screen.getAllByRole('heading', { name: 'GDPR notice' })
    expect(titles).toHaveLength(2)
    expect(titles[0]?.parentElement).toHaveStyle({ opacity: '1' })
    expect(titles[1]?.parentElement).toHaveStyle({ opacity: '0' })
  })

  it('keeps the goal carousel inset from both phone edges', async () => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()

    const carousel = screen.getByRole('tablist', { name: 'What are you looking to achieve?' })
    expect(carousel.parentElement).toHaveClass('scroll-px-[17px]')
    const goalTabs = screen.getAllByRole('tab')
    expect(goalTabs).toHaveLength(4)
    goalTabs.forEach((tab) => expect(tab).toHaveClass('h-[96px]'))
    expect(carousel.firstElementChild).toHaveAttribute('data-goal-carousel-gutter', 'leading')
    expect(carousel.firstElementChild).toHaveClass('w-[17px]', 'shrink-0')
    expect(carousel.lastElementChild).toHaveAttribute('data-goal-carousel-gutter', 'trailing')
    expect(carousel.lastElementChild).toHaveClass('w-[17px]', 'shrink-0')
  })

  it.each([
    ['Home & Living', 'var(--uc-future-goal-home)'],
    ['Buy a car', 'var(--uc-future-goal-buy-a-car)'],
    ['Personal Goals', 'var(--uc-future-goal-personal)'],
    ['Saving', 'var(--uc-future-goal-saving)'],
  ])('uses the Figma selected color for %s', async (goal, color) => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    const tab = screen.getByRole('tab', { name: goal })
    fireEvent.click(tab)

    expect(tab).toHaveStyle({ backgroundColor: color })
    expect(tab.querySelector('img')).toHaveClass('brightness-0', 'invert')
    const [firstProductButton] = screen.getAllByRole('button', { name: /^Open .* simulator$/ })
    if (!firstProductButton) throw new Error(`No product simulator is available for ${goal}`)
    expect(firstProductButton.querySelector('[data-product-icon]')).toHaveStyle({ backgroundColor: color })
  })

  it.each([
    ['Home & Living', 'Housing loan', 'mortgage', 'Housing loan'],
    ['Home & Living', 'Loan for purchasing real estate abroad', 'mortgage', 'Loan for purchasing real estate abroad'],
    ['Home & Living', 'Energy efficiency loan', 'cash-loan', 'Energy efficiency loan'],
    ['Home & Living', 'Credit cards', 'credit-card', 'Credit Card'],
    ['Buy a car', 'Car loan', 'cash-loan', 'Car loan'],
    ['Buy a car', 'Cash loan', 'cash-loan', 'Cash loan'],
    ['Personal Goals', 'Personal loan', 'cash-loan', 'Personal loan'],
    ['Personal Goals', 'Credit cards', 'credit-card', 'Credit Card'],
    ['Saving', 'Term deposit', 'term-deposit', 'Term deposit'],
    ['Saving', 'Investment funds', 'investment-fund', 'Investment funds'],
  ])('opens the %s simulator for %s', async (goal, product, simulator, heading) => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()

    fireEvent.click(screen.getByRole('tab', { name: goal }))
    const productButton = screen.getByRole('button', { name: `Open ${product} simulator` })
    const rowIcon = productButton.querySelector('[data-product-icon] img, [data-product-icon] svg')
    expect(rowIcon).not.toBeNull()
    expect(productButton.querySelector('[data-product-icon]')).toHaveClass('text-[var(--uc-static-white)]')
    const imageIcon = productButton.querySelector('[data-product-icon] img')
    if (imageIcon) expect(imageIcon).toHaveClass('brightness-0', 'invert')
    fireEvent.click(productButton)

    const simulatorScreen = await screen.findByRole('region', { name: `${product} simulator` })
    expect(simulatorScreen).toHaveAttribute('data-future-gain-peer-simulator', simulator)
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('recalculates the loan installment when the amount changes', async () => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    fireEvent.click(screen.getByRole('button', { name: 'Open Housing loan simulator' }))

    const amount = await screen.findByRole('textbox', { name: 'Loan amount' })
    const initialInstallment = screen.getByTestId('monthly-installment').textContent
    fireEvent.change(amount, { target: { value: '100000' } })

    expect(screen.getByTestId('monthly-installment').textContent).not.toBe(initialInstallment)
    expect(screen.getByText('Loan amount')).toBeInTheDocument()
  })

  it.each([
    ['Terms & conditions & collateral', 'The final conditions, eligibility and any collateral requirements'],
    ['Representative example', 'The estimate uses the amount, currency, duration and indicative rate'],
    ['Early payment', 'Early repayment conditions and any applicable costs'],
    ['Client’s rights to withdraw from a concluded agreement', 'Your rights, deadlines and the process for withdrawal'],
  ])('opens %s in a bottom sheet instead of expanding inline', async (title, content) => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    fireEvent.click(screen.getByRole('button', { name: 'Open Housing loan simulator' }))

    const disclosureButton = await screen.findByRole('button', { name: title })
    fireEvent.click(disclosureButton)

    const disclosureSheet = await screen.findByRole('dialog')
    const disclosureContent = screen.getByText(new RegExp(content))
    expect(disclosureSheet).toContainElement(disclosureContent)
    expect(disclosureButton.closest('section')).not.toContainElement(disclosureContent)
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(disclosureButton).not.toHaveAttribute('aria-expanded')
    expect(screen.getByRole('button', { name: 'Close sheet' })).toBeInTheDocument()
  })

  it('matches the credit card selection and product details from Figma', async () => {
    renderAt(FUTURE_GAIN_PRODUCTS_URL)
    await openPeerInsights()
    fireEvent.click(screen.getByRole('button', { name: 'Open Credit cards simulator' }))

    expect(await screen.findByRole('heading', { name: 'Credit Card' })).toBeInTheDocument()
    expect(screen.getByText('Choose your type of Credit Card.')).toBeInTheDocument()
    const flexia = screen.getByRole('button', { name: 'Flexia Mastercard credit card' })
    const platinum = screen.getByRole('button', { name: 'Mastercard Platinum' })
    expect(flexia).toHaveAttribute('aria-pressed', 'true')
    expect(platinum).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('img', { name: 'Flexia Mastercard card art' })).toBeInTheDocument()
    expect(screen.getByText('Why should Flexia Mastercard be your first choice?')).toBeInTheDocument()

    fireEvent.click(platinum)
    expect(platinum).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Why should Mastercard Platinum be your first choice?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Credit card features' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Credit card features')
  })
})
