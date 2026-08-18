// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import BottomNavigation from '@/app/components/BottomNavigation'
import App2027HomeScreen from '@/app/screens/home/App2027HomeScreen'
import { DemoProvider } from '@/app/state/demoStore'
import type { CountryId, DemoState } from '@/app/state/demoTypes'

const PRODUCT_COUNTS: DemoState['productCounts'] = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
}

function renderHome(country: CountryId = 'CZ', release: DemoState['release'] = 'release-future-evo-2027') {
  const onDomesticPaymentClick = vi.fn()
  const onProductsClick = vi.fn()
  const onAccountClick = vi.fn()
  const result = render(
    <DemoProvider initialState={{ product: 'PI', country, scenario: 'active', release, bankingScenario: 'retail-multi-account-card', productCounts: PRODUCT_COUNTS }}>
      <LanguageProvider initialLanguage="en">
        <App2027HomeScreen onDomesticPaymentClick={onDomesticPaymentClick} onProductsClick={onProductsClick} onAccountClick={onAccountClick} useCzRoboAccountCards={release === 'release-future-evo-2027'} />
      </LanguageProvider>
    </DemoProvider>,
  )
  return { ...result, onDomesticPaymentClick, onProductsClick, onAccountClick }
}

afterEach(cleanup)

describe('2027 Home Transformation', () => {
  it('reuses the Baseline header and bottom navigation while transforming content below the tabs', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')

    const header = container.querySelector('[data-app-2027-header]') as HTMLElement
    expect(header).toBeInTheDocument()
    expect(within(header).getByRole('button', { name: 'Prime' })).toBeInTheDocument()
    expect(within(header).getByRole('button', { name: 'Profile' })).toBeInTheDocument()
    expect(within(header).getByRole('button', { name: 'Messages' })).toBeInTheDocument()
    expect(within(header).queryByText('UniCredit Bank')).not.toBeInTheDocument()
    expect(within(header).queryByRole('button', { name: 'Change Home theme' })).not.toBeInTheDocument()
    expect(container.querySelector('[data-app-2027-bottom-navigation]')).toBeInTheDocument()
    expect(container.querySelector('[data-home-transformation]')).toBeInTheDocument()
    expect(container.querySelector('[data-home-transformation-summary="accounts"]')).toHaveTextContent('Spent this week')
    expect(container.querySelector('[data-home-product-group="accounts"]')).toBeInTheDocument()
    const interestCarousel = container.querySelector('[data-home-interest-carousel]') as HTMLElement
    expect(interestCarousel.querySelector('[data-home-carousel-rail]')).toBeInTheDocument()
    expect(interestCarousel.querySelector('[data-ds-label="AccountCarouselIndicator 32px"]')).toBeInTheDocument()
    const secondInterestPage = within(interestCarousel).getByRole('button', { name: 'Go to account 2' })
    fireEvent.click(secondInterestPage)
    expect(secondInterestPage).toHaveAttribute('aria-current', 'true')
  })

  it('makes all four tabs interactive and renders their Figma-matched product compositions', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const tabs = within(screen.getByRole('tablist', { name: 'Product categories' })).getAllByRole('tab')

    expect(tabs.map((tab) => tab.textContent)).toEqual(['Accounts', 'Savings', 'Credits', 'Insurances'])
    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(container.querySelector('[data-home-transformation-summary="savings"]')).toHaveTextContent('Growth this year')
    expect(screen.getByText('Saving Accounts')).toBeInTheDocument()
    expect(screen.getByText(/6.5% p.a./)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(container.querySelector('[data-home-transformation-summary="credits"]')).toHaveTextContent('Due this month')
    expect(container.querySelector('[data-home-summary-art="credits"]')).toBeInTheDocument()
    expect(screen.getByText('Loans & Mortgages')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Block card' })).not.toBeInTheDocument()
    expect(container.querySelector('[data-home-credit-limit-progress]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Insurances' }))
    expect(container.querySelector('[data-home-transformation-summary="insurance"]')).toHaveTextContent('2 active policies')
    expect(container.querySelector('[data-home-summary-art="insurance"]')).toBeInTheDocument()
    expect(screen.getByText('Genius Protect')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^Insurance$/ }))
    expect(screen.getByText('Home Protect')).toBeInTheDocument()
  })

  it('keeps currency badges and the reusable CZ Robo account actions in Accounts', () => {
    const { container, onDomesticPaymentClick } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]')

    expect(accountsGroup).toBeInTheDocument()
    expect(within(accountsGroup as HTMLElement).getByRole('img', { name: 'CZK currency' })).toBeInTheDocument()

    fireEvent.click(within(accountsGroup as HTMLElement).getByRole('button', { name: /^Accounts$/ }))
    expect(within(accountsGroup as HTMLElement).getByRole('img', { name: 'EUR currency' })).toBeInTheDocument()
    expect(within(accountsGroup as HTMLElement).getByRole('img', { name: 'USD currency' })).toBeInTheDocument()
    const newPayment = within(accountsGroup as HTMLElement).getAllByRole('button', { name: 'New payment' })[0]
    expect(newPayment).toBeDefined()
    if (!newPayment) throw new Error('Expected an account payment action')
    fireEvent.click(newPayment)
    expect(onDomesticPaymentClick).toHaveBeenCalledTimes(1)
  })

  it('keeps the Evo foreign-currency accounts and places debit cards in the final carousel', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement
    const cardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement

    fireEvent.click(within(accountsGroup).getByRole('button', { name: /^Accounts$/ }))
    expect(within(accountsGroup).getAllByRole('button', { name: 'Currency Exchange' })).toHaveLength(2)
    expect(within(accountsGroup).getAllByRole('button', { name: 'Exchange rates' })).toHaveLength(2)
    expect(within(accountsGroup).getAllByRole('button', { name: 'Scan QR code' })).toHaveLength(1)
    expect(within(accountsGroup).getAllByRole('button', { name: 'Create QR code' })).toHaveLength(1)

    expect(within(cardsGroup).queryByRole('button', { name: /^Cards$/ })).not.toBeInTheDocument()
    const debitCards = cardsGroup.querySelectorAll('[data-evo-card-comparison-tile]')
    expect(debitCards).toHaveLength(3)
    expect(debitCards[0]!).toHaveTextContent('Debit Standard')
    expect(debitCards[1]!).toHaveTextContent('Debit Premium')
    expect(debitCards[2]!).toHaveTextContent('Debit Standard EUR')
    expect(debitCards[2]!.querySelector('[data-component="Card"]')).toHaveAttribute(
      'data-card-variant',
      'mc-virtual-standard-violet',
    )
  })

  it('shows an Evo-only Debit Cards carousel with two pages, a ghost banner and linked card tiles', () => {
    const { container, onAccountClick } = renderHome('CZ', 'release-future-evo-2027')
    const cardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement

    const comparison = container.querySelector('[data-evo-card-comparison]') as HTMLElement
    expect(comparison).toBeInTheDocument()
    expect(comparison).toHaveTextContent('Debit Cards')
    expect(within(cardsGroup).queryByRole('button', { name: /^Cards$/ })).not.toBeInTheDocument()

    const tiles = comparison.querySelectorAll('[data-evo-card-comparison-tile]')
    const pages = comparison.querySelectorAll('[data-evo-card-carousel-page]')
    expect(tiles).toHaveLength(3)
    expect(pages).toHaveLength(2)
    expect(pages[0]!.querySelectorAll('[data-evo-card-comparison-tile]')).toHaveLength(2)
    expect(pages[1]!.querySelectorAll('[data-evo-card-comparison-tile]')).toHaveLength(1)
    expect(tiles[0]!).toHaveTextContent('Debit Standard')
    expect(tiles[0]!).toHaveTextContent('**** 5601')
    expect(tiles[0]!).not.toHaveTextContent('5173 **** **** 5601')
    expect(tiles[1]!).toHaveTextContent('Debit Premium')
    expect(tiles[1]!).toHaveTextContent('**** 5603')
    expect(tiles[1]!.querySelector('[data-card-variant="mc-debit-gold"]')).toBeInTheDocument()
    expect(tiles[2]!).toHaveTextContent('Debit Standard EUR')
    expect(tiles[2]!).toHaveTextContent('**** 5602')
    expect(tiles[2]!.querySelector('[data-card-variant="mc-virtual-standard-violet"]')).toBeInTheDocument()
    expect(comparison.querySelector('[data-evo-card-carousel]')).toHaveClass('overflow-x-auto', 'overscroll-x-contain', 'pb-[2px]', 'cursor-grab')
    expect(comparison.querySelector('[data-evo-card-carousel]')).not.toHaveClass('snap-x', 'snap-mandatory')
    expect(comparison.querySelector('[data-evo-card-carousel]')).toHaveAttribute('data-evo-card-page-count', '2')
    const carouselContainer = comparison.querySelector('[data-evo-card-carousel-container]') as HTMLElement
    const indicator = comparison.querySelector('[data-ds-label="AccountCarouselIndicator 32px"]') as HTMLElement
    expect(indicator).toBeInTheDocument()
    expect(carouselContainer).toContainElement(indicator)
    expect(within(comparison).getAllByRole('button', { name: /Go to account/ })).toHaveLength(2)
    const ghostBanner = comparison.querySelector('[data-evo-card-ghost-banner] [data-component="GhostBanner"]') as HTMLElement
    expect(ghostBanner).toBeInTheDocument()
    expect(ghostBanner).toHaveClass('h-[120px]', 'w-[136px]', '!p-[4px]')
    expect(ghostBanner).toHaveTextContent('Add a debit card')
    expect(ghostBanner).toHaveTextContent('Explore options')
    expect(ghostBanner).not.toHaveTextContent('Explore more cards')
    expect(ghostBanner.querySelector('[data-ds-label="GhostBanner icon 32x32"]')).toBeInTheDocument()
    expect(ghostBanner.firstElementChild).toHaveClass('flex-col', 'items-center')
    expect(ghostBanner.querySelector('[data-ghost-banner-title]')).toHaveClass('text-[14px]', 'font-bold', 'leading-[18px]')
    expect(ghostBanner.querySelector('[data-ghost-banner-description]')).toHaveClass('text-[14px]', 'leading-[18px]')
    const title = tiles[0]!.querySelector('p:first-of-type') as HTMLElement
    const subtitle = tiles[0]!.querySelector('p:nth-of-type(2)') as HTMLElement
    const cardVisual = tiles[0]!.querySelector('[data-component="Card"]') as HTMLElement
    expect(tiles[0]!).toHaveClass('min-h-[120px]', 'items-center', 'justify-center', 'gap-[8px]')
    expect(cardVisual).toHaveStyle({ width: '80px', height: '50px' })
    expect(title).toHaveClass('text-[14px]')
    expect(subtitle).toHaveClass('text-[14px]')
    expect(within(comparison).queryByRole('button', { name: 'Card details' })).not.toBeInTheDocument()
    expect(within(comparison).queryByText('22 850.50 CZK')).not.toBeInTheDocument()

    fireEvent.click(tiles[0]!)
    fireEvent.click(tiles[1]!)
    fireEvent.click(tiles[2]!)
    expect(onAccountClick).toHaveBeenCalledTimes(3)
    expect(onAccountClick).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Debit Standard EUR', type: 'debit_card' }))

    const { container: nonEvoContainer } = renderHome('CZ', 'release-future-cz-robo')
    expect(nonEvoContainer.querySelector('[data-evo-card-comparison]')).not.toBeInTheDocument()
  })

  it('uses the Baseline accordion header for Evo Accounts without its legacy balance chrome', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement

    const accountsHeader = within(accountsGroup).getByRole('button', { name: /^Accounts$/ })
    expect(accountsHeader).toHaveAttribute('aria-expanded', 'false')
    expect(within(accountsGroup).queryByText('Total available balance')).not.toBeInTheDocument()
    expect(accountsGroup.querySelector('[data-home-product-group-icon="accounts"]')).not.toBeInTheDocument()

    fireEvent.click(accountsHeader)
    expect(accountsHeader).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps Evo product groups compact, separates expanded product cards and renders Figma campaign media', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement
    const cardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement

    expect(within(accountsGroup).getByRole('button', { name: /^Accounts$/ })).toHaveAttribute('data-home-product-group-header', 'compact')
    expect(within(cardsGroup).queryByRole('button', { name: /^Cards$/ })).not.toBeInTheDocument()
    expect(cardsGroup.querySelector('[data-evo-card-comparison]')).toBeInTheDocument()

    const accountCards = accountsGroup.querySelectorAll('[data-product-card-evolution]')
    expect(accountCards).toHaveLength(1)
    const accountStackPreview = accountsGroup.querySelector('[data-home-product-stack-preview]') as HTMLElement
    expect(accountStackPreview).toBeInTheDocument()
    expect(accountStackPreview).toHaveAttribute('aria-hidden', 'true')
    expect(accountStackPreview).toHaveClass('relative', '-mt-[6px]', 'h-[16px]', 'w-full', 'rounded-b-[8px]')
    expect(accountStackPreview).not.toHaveClass('border-t', 'shadow-[0_8px_14px_rgb(var(--uc-shadow-rgb)/0.16)]')
    expect(accountCards[0]).toHaveClass('relative', 'z-10')
    expect(accountStackPreview).not.toHaveTextContent('Euro account')

    expect(within(cardsGroup).queryByText('Credit Card')).not.toBeInTheDocument()
    expect(cardsGroup.querySelectorAll('[data-product-card-evolution]')).toHaveLength(0)
    expect(cardsGroup.querySelector('[data-evo-card-comparison-tile] [data-component="Card"]')).toHaveClass('shadow-[0_3px_6px_rgb(var(--uc-shadow-rgb)/0.22)]')

    fireEvent.click(within(accountsGroup).getByRole('button', { name: /^Accounts$/ }))
    const expandedAccountCards = accountsGroup.querySelectorAll('[data-product-card-evolution]')
    expect(expandedAccountCards.length).toBeGreaterThan(1)
    expect(expandedAccountCards[1]).toHaveAttribute('data-product-card-separator', 'true')

    const interestRail = container.querySelector('[data-home-interest-carousel] [data-home-carousel-rail]') as HTMLElement
    expect(container.querySelectorAll('[data-home-interest-media]')).toHaveLength(3)
    expect(container.querySelector('[data-home-interest-media]')).toHaveClass('size-full', 'object-cover')
    expect(container.querySelector('[data-home-interest-media]')?.parentElement).toHaveClass('h-[100px]', 'overflow-hidden')
    expect(interestRail).not.toHaveAttribute('data-home-carousel-auto-advance')
    expect(interestRail).toHaveClass('select-none', 'touch-pan-y', 'cursor-grab')
    expect(interestRail).not.toHaveClass('snap-x', 'snap-mandatory')
    expect(interestRail.firstElementChild).toHaveClass('w-[calc(100%-48px)]')
    const shopSmartMedia = container.querySelectorAll('[data-home-shopsmart] [data-component="ShopsmartOfferCard"] img')
    expect(shopSmartMedia).toHaveLength(3)
    expect(shopSmartMedia[0]).toHaveClass('h-full', 'w-full', 'object-cover')
    expect(shopSmartMedia[0]?.parentElement).toHaveClass('relative', 'w-full', 'overflow-hidden')
    expect(shopSmartMedia[0]?.parentElement).toHaveStyle({ height: '130px' })
    expect(Array.from(container.querySelectorAll('[data-home-interest-media]')).map((image) => (image as HTMLImageElement).style.objectPosition)).toEqual([
      'center 38%',
      'center 23%',
      'center 38%',
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(container.querySelector('[data-home-transformation-group="transformation-group-saving-accounts"] [data-home-product-group-header="static"]')).toHaveTextContent('Saving Accounts')
    expect(screen.getByRole('button', { name: /^Deposits$/ })).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    const creditCardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement
    const loansGroup = container.querySelector('[data-home-transformation-group="transformation-group-loans-mortgages"]') as HTMLElement
    const loanList = loansGroup.querySelector('[data-home-loan-list]') as HTMLElement
    const loanCards = loanList.querySelectorAll('[data-home-loan-card]')
    expect(creditCardsGroup.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Credit Cards')
    const loansHeader = screen.getByRole('button', { name: /^Loans & Mortgages$/ })
    expect(loansHeader).toHaveAttribute('data-home-product-group-header', 'compact')
    expect(loansHeader).toHaveAttribute('aria-expanded', 'false')
    expect(loanList).toHaveClass('overflow-hidden', 'rounded-[8px]')
    expect(loanList).toHaveClass('relative', 'z-10')
    expect(loanCards).toHaveLength(1)
    expect(loanCards[0]).not.toHaveClass('rounded-[8px]')
    expect(loansGroup.querySelector('[data-home-product-stack-preview]')).toBeInTheDocument()

    fireEvent.click(loansHeader)
    expect(loansHeader).toHaveAttribute('aria-expanded', 'true')
    expect(loansGroup.querySelectorAll('[data-home-loan-card]')).toHaveLength(2)
    expect(loansGroup.querySelectorAll('[data-home-loan-card]')[1]).toHaveClass('border-t-[0.5px]', 'border-[var(--uc-border-muted)]')
    expect(loansGroup.querySelector('[data-home-product-stack-preview]')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Insurances' }))
    const insuranceHeader = screen.getByRole('button', { name: /^Insurance$/ })
    const insuranceGroup = container.querySelector('[data-home-transformation-group="transformation-group-insurance"]') as HTMLElement
    expect(insuranceHeader).toHaveAttribute('data-home-product-group-header', 'compact')
    expect(insuranceHeader).toHaveAttribute('aria-expanded', 'false')
    expect(insuranceGroup.querySelectorAll('[data-home-insurance-policy-card]')).toHaveLength(1)
    expect(insuranceGroup.querySelector('[data-home-insurance-policy-list]')).toHaveClass('relative', 'z-10')
    expect(insuranceGroup.querySelector('[data-home-product-stack-preview]')).toBeInTheDocument()

    fireEvent.click(insuranceHeader)
    expect(insuranceHeader).toHaveAttribute('aria-expanded', 'true')
    expect(insuranceGroup.querySelectorAll('[data-home-insurance-policy-card]')).toHaveLength(2)
    expect(insuranceGroup.querySelector('[data-home-product-stack-preview]')).not.toBeInTheDocument()
  })

  it('uses the Baseline balance-card composition for the Evo account totals while retaining spent-this-week logic', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const summary = container.querySelector('[data-home-transformation-summary="accounts"]') as HTMLElement
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement
    const stackPreview = accountsGroup.querySelector('[data-home-product-stack-preview]') as HTMLElement

    expect(summary).toHaveAttribute('data-home-summary-variant', 'baseline')
    expect(summary).toHaveClass('w-full', 'h-[145.25px]', 'min-h-[145.25px]', 'rounded-[8px]', 'overflow-hidden', 'flex', 'relative', 'bg-[#94B1BA]', 'px-[24px]', 'py-[15px]')
    expect(summary.querySelector('[data-home-summary-content]')).toHaveClass('relative', 'z-10', 'flex-1', 'flex', 'flex-col')
    expect(summary.querySelector('[data-home-summary-primary-amount]')).toHaveClass('text-[28px]', 'font-bold')
    expect(summary.querySelector('[data-home-summary-art-container]')).toHaveClass('absolute', 'top-[24px]', 'right-0', 'w-[96px]')
    expect(summary.querySelector('[data-home-summary-divider]')).toHaveClass('my-[9px]', 'h-px', 'w-full')
    expect(summary.querySelector('[data-home-summary-secondary-amount]')).toHaveClass('uc-type-n2-strong')
    expect(summary).toHaveTextContent('Spent this week')
    expect(stackPreview).not.toHaveTextContent('620')
  })

  it('uses 28px bold typography for every Evo summary primary value', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const primaryAmount = (tab: 'accounts' | 'savings' | 'credits') =>
      container.querySelector(`[data-home-transformation-summary="${tab}"] [data-home-summary-primary-amount]`)

    expect(primaryAmount('accounts')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="accounts"]')).toHaveClass('h-[145.25px]')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(primaryAmount('savings')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="savings"]')).toHaveClass('h-[145.25px]', 'min-h-[145.25px]', 'py-[15px]')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(primaryAmount('credits')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="credits"]')).toHaveClass('h-[145.25px]', 'min-h-[145.25px]', 'py-[15px]')

    fireEvent.click(screen.getByRole('tab', { name: 'Insurances' }))
    expect(container.querySelector('[data-home-insurance-policy-count]')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="insurance"]')).toHaveClass('h-[145.25px]', 'min-h-[145.25px]', 'py-[15px]')
  })

  it('uses amount-progress cards for Evo credit and lending products', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))

    const creditProgress = container.querySelector('[data-home-credit-limit-progress]') as HTMLElement
    const loanProgress = container.querySelector('[data-home-loan-progress]') as HTMLElement
    const loanCard = container.querySelector('[data-home-loan-card]') as HTMLElement
    const repaidAmount = loanCard.querySelector('[data-home-loan-repaid-amount]') as HTMLElement
    const totalAmount = loanCard.querySelector('[data-home-loan-total-amount]') as HTMLElement

    expect(creditProgress).toHaveAttribute('aria-valuemin', '0')
    expect(creditProgress).toHaveAttribute('aria-valuemax', '10000')
    expect(creditProgress).toHaveAttribute('aria-valuenow', '6800')
    expect(creditProgress).toHaveTextContent('')
    expect(container.querySelector('[data-home-credit-limit-details]')).toHaveTextContent('Used credit')
    expect(container.querySelector('[data-home-credit-limit-details]')).toHaveTextContent('Credit limit')
    expect(screen.queryByRole('button', { name: 'Card details' })).not.toBeInTheDocument()

    expect(loanProgress).toHaveAttribute('aria-valuenow', '31')
    expect(loanProgress.firstElementChild).toHaveStyle({ width: '31.03448275862069%' })
    expect(loanCard).toHaveTextContent('Total repaid')
    expect(loanCard).toHaveTextContent('Total loan')
    expect(repaidAmount).toHaveClass('inline-flex', 'items-baseline', 'whitespace-nowrap')
    expect(repaidAmount.firstElementChild?.firstElementChild).toHaveClass('text-[16px]', 'font-bold')
    expect(repaidAmount.firstElementChild?.lastElementChild).toHaveClass('text-[14px]', 'font-bold')
    expect(totalAmount.firstElementChild?.firstElementChild).toHaveClass('text-[16px]', 'font-bold')
    expect(totalAmount.firstElementChild?.lastElementChild).toHaveClass('text-[14px]', 'font-bold')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    const maturityAmount = container.querySelector('[data-home-deposit-maturity-value]') as HTMLElement
    expect(maturityAmount).toHaveClass('inline-flex', 'items-baseline', 'whitespace-nowrap', 'text-[14px]', 'font-normal')
  })

  it('uses the approved color palette for every Evo summary banner', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const summary = (tab: 'accounts' | 'savings' | 'credits' | 'insurance') =>
      container.querySelector(`[data-home-transformation-summary="${tab}"]`)

    expect(summary('accounts')).toHaveClass('bg-[#94B1BA]')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(summary('savings')).toHaveClass('bg-[#DBE0D1]')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(summary('credits')).toHaveClass('bg-[#D9B4AE]')

    fireEvent.click(screen.getByRole('tab', { name: 'Insurances' }))
    expect(summary('insurance')).toHaveClass('bg-[#DED7EA]')
  })

  it('keeps loan and insurance campaigns distinct in both copy and imagery', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const carousel = () => container.querySelector('[data-home-interest-carousel]') as HTMLElement
    const imageSources = () => Array.from(carousel().querySelectorAll('[data-home-interest-media]')).map((image) => image.getAttribute('src'))

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(Array.from(carousel().querySelectorAll('h3')).map((heading) => heading.textContent)).toEqual([
      'Plan your next move with confidence',
      'A mortgage shaped around you',
      'Make room for what matters now',
    ])
    const loanImageSources = imageSources()
    expect(new Set(loanImageSources).size).toBe(3)

    fireEvent.click(screen.getByRole('tab', { name: 'Insurances' }))
    expect(Array.from(carousel().querySelectorAll('h3')).map((heading) => heading.textContent)).toEqual([
      'Protect the place you call home',
      'Travel with confidence',
      'Cover for life’s unexpected turns',
    ])
    const insuranceImageSources = imageSources()
    expect(new Set(insuranceImageSources).size).toBe(3)
    expect(new Set([...loanImageSources, ...insuranceImageSources]).size).toBe(6)
  })

  it('keeps single-product savings groups static and presents Evo term deposits as a stacked accordion', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))

    const investmentGroup = container.querySelector('[data-home-transformation-group="transformation-group-investment-portfolios"]') as HTMLElement
    const savingsGroup = container.querySelector('[data-home-transformation-group="transformation-group-saving-accounts"]') as HTMLElement
    const depositGroup = container.querySelector('[data-home-transformation-group="transformation-group-deposits"]') as HTMLElement
    const savingsSummary = container.querySelector('[data-home-transformation-summary="savings"]') as HTMLElement
    const depositsHeader = screen.getByRole('button', { name: /^Deposits$/ })
    const depositList = depositGroup.querySelector('[data-home-deposit-list]') as HTMLElement
    const maturityAmount = container.querySelector('[data-home-deposit-maturity]') as HTMLElement
    const maturityProgress = container.querySelector('[data-home-deposit-maturity-progress]') as HTMLElement

    expect(screen.queryByRole('button', { name: /^Saving Accounts$/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Investment portfolios$/ })).not.toBeInTheDocument()
    expect(savingsGroup.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Saving Accounts')
    expect(investmentGroup.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Investment portfolios')
    expect(savingsSummary).toHaveTextContent('768')
    expect(savingsSummary).toHaveTextContent('914')
    expect(investmentGroup.compareDocumentPosition(savingsGroup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(savingsGroup.querySelector('[data-home-product-group-header="static"] > svg')).not.toBeInTheDocument()
    expect(investmentGroup.querySelector('[data-home-product-group-header="static"] > svg')).not.toBeInTheDocument()
    expect(depositsHeader).toHaveAttribute('aria-expanded', 'false')
    expect(depositList).toHaveClass('relative', 'z-10', 'overflow-hidden', 'rounded-[8px]')
    expect(depositList.querySelectorAll('[data-home-deposit-card]')).toHaveLength(1)
    expect(depositGroup.querySelector('[data-home-product-stack-preview]')).toBeInTheDocument()
    expect(maturityAmount).toHaveClass('text-[14px]')
    expect(maturityAmount.querySelector('[data-home-deposit-maturity-value]')).toHaveClass('text-[14px]', 'font-normal')
    expect(maturityProgress).toHaveAttribute('aria-valuenow', '75')
    expect(maturityProgress).toHaveAttribute('aria-valuemax', '365')
    expect(maturityProgress.firstElementChild).toHaveStyle({ width: '20.54794520547945%' })

    fireEvent.click(depositsHeader)
    expect(depositsHeader).toHaveAttribute('aria-expanded', 'true')
    expect(depositList.querySelectorAll('[data-home-deposit-card]')).toHaveLength(3)
    expect(
      Array.from(depositGroup.querySelectorAll('[data-home-deposit-card]')).map(
        (card) => card.querySelector('p')?.textContent,
      ),
    ).toEqual([
      'Term Deposits · 6.5% p.a.',
      'Term Deposits · 5.2% p.a.',
      'Term Deposits · 7.1% p.a.',
    ])
    expect(depositGroup.querySelectorAll('[data-home-deposit-card]')[1]).toHaveClass('border-t-[0.5px]', 'border-[var(--uc-border-muted)]')
    expect(depositGroup.querySelector('[data-home-product-stack-preview]')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    const creditCardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement
    expect(creditCardsGroup.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Credit Cards')
    expect(creditCardsGroup.querySelector('[data-home-product-group-header="static"] > svg')).not.toBeInTheDocument()
  })

  it('uses the shared glass navigation for Evo destinations, not only Home', () => {
    const { container } = render(
      <DemoProvider initialState={{ product: 'PI', country: 'CZ', scenario: 'active', release: 'release-future-evo-2027', bankingScenario: 'retail-multi-account-card', productCounts: PRODUCT_COUNTS }}>
        <LanguageProvider initialLanguage="en">
          <BottomNavigation activeTab="analytics" onTabChange={vi.fn()} />
        </LanguageProvider>
      </DemoProvider>,
    )

    expect(container.querySelector('[data-app-2027-bottom-navigation]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Spending' })).toHaveAttribute('aria-current', 'page')
  })

  it('keeps activity, banners, product cards and ShopSmart filters aligned with the transformation composition', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const activity = container.querySelector('[data-home-transformation-activity="true"]') as HTMLElement
    const activityCard = activity.querySelector('[data-home-activity-card]') as HTMLElement
    const scrollSurface = container.querySelector('[data-app-2027-scroll]') as HTMLElement
    const shopSmartCategories = screen.getByLabelText('ShopSmart categories')

    expect(activity).toContainElement(screen.getByRole('heading', { name: 'Your recent transactions' }))
    expect(activityCard).not.toContainElement(screen.getByRole('heading', { name: 'Your recent transactions' }))
    expect(container.querySelector('[data-home-summary-art="accounts"]')).toBeInTheDocument()
    expect(scrollSurface).toHaveClass('pb-[16px]')
    expect(shopSmartCategories).toHaveClass('flex-nowrap', 'overflow-x-auto', 'select-none', 'touch-pan-y', 'cursor-grab')
    const mostPopularFilter = screen.getByRole('button', { name: 'Most popular' })
    expect(mostPopularFilter).toHaveClass('flex', 'h-[46px]', 'shrink-0', 'rounded-full', 'border', 'px-[12px]', 'text-[18px]')
    expect(mostPopularFilter.querySelector('[data-home-shopsmart-filter-dot]')).toHaveClass('size-[4px]', 'rounded-full')
    expect(screen.getByRole('button', { name: 'Home & living' })).toHaveClass('flex', 'h-[46px]', 'shrink-0', 'whitespace-nowrap', 'rounded-full', 'border', 'px-[12px]', 'text-[18px]')

    const eShopsFilter = screen.getByRole('button', { name: 'E-shops' })
    fireEvent.click(eShopsFilter)
    expect(eShopsFilter).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('[data-home-shopsmart]')).toHaveAttribute('data-home-shopsmart-filter', 'eshops')

    const travelFilter = screen.getByRole('button', { name: 'Travel' })
    fireEvent.click(travelFilter)
    expect(travelFilter).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('[data-home-shopsmart]')).toHaveAttribute('data-home-shopsmart-filter', 'travel')
    expect(container.querySelector('[data-home-shopsmart]')).toHaveTextContent('Valentino.ro')
    expect(container.querySelector('[data-home-shopsmart]')).toHaveTextContent('500 de Lei')

    const homeFilter = screen.getByRole('button', { name: 'Home & living' })
    fireEvent.click(homeFilter)
    expect(homeFilter).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelector('[data-home-shopsmart]')).toHaveAttribute('data-home-shopsmart-filter', 'home')
    expect(container.querySelector('[data-home-shopsmart]')).toHaveTextContent('English home')
    expect(container.querySelector('[data-home-shopsmart]')).toHaveTextContent('10% cashback peste 100 de Lei')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    const savingAccount = container.querySelector('[data-home-compact-product-card="saving_account"]') as HTMLElement
    expect(savingAccount).toBeInTheDocument()
    expect(within(savingAccount).queryByRole('button', { name: 'New payment' })).not.toBeInTheDocument()
    expect(container.querySelector('[data-home-deposit-maturity] [data-home-deposit-maturity-value]')).toHaveClass('text-[14px]', 'font-normal')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(container.querySelector('[data-home-loan-installment] [data-home-supporting-amount]')).toHaveClass('text-[16px]')
  })

  it('reuses the Products ShopSmart offer cards in the homepage carousel and keeps category taps actionable', () => {
    const { container, onProductsClick } = renderHome('CZ', 'release-future-evo-2027')
    const shopSmart = container.querySelector('[data-home-shopsmart]') as HTMLElement

    expect(shopSmart.querySelectorAll('[data-component="ShopsmartOfferCard"]')).toHaveLength(3)
    expect(shopSmart).toHaveTextContent('Valentino.ro')
    expect(shopSmart).toHaveTextContent('Lentiamo.ro')

    const offerRail = shopSmart.querySelector('[data-home-carousel-rail]') as HTMLElement
    expect(offerRail).toHaveClass('items-stretch')
    const offerCards = Array.from(shopSmart.querySelectorAll<HTMLElement>('[data-component="ShopsmartOfferCard"]'))
    expect(offerCards.every((card) => card.className.includes('h-full'))).toBe(true)
    expect(offerCards.every((card) => !card.className.includes('border-[#666666]'))).toBe(true)

    const electronicsFilter = within(shopSmart).getByRole('button', { name: 'Electronics' })
    fireEvent.click(electronicsFilter)

    expect(shopSmart).toHaveAttribute('data-home-shopsmart-filter', 'electronics')
    expect(shopSmart).toHaveTextContent('Lentiamo.ro')
    expect(shopSmart).not.toHaveTextContent('Valentino.ro')

    const offerCard = shopSmart.querySelector('[data-component="ShopsmartOfferCard"]') as HTMLElement
    fireEvent.click(offerCard)
    expect(onProductsClick).toHaveBeenCalledTimes(1)
  })

  it('keeps Insurance policies in the same compact stacked treatment as account products', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')

    fireEvent.click(screen.getByRole('tab', { name: 'Insurances' }))
    fireEvent.click(screen.getByRole('button', { name: /^Insurance$/ }))

    const policyList = container.querySelector('[data-home-insurance-policy-list]') as HTMLElement
    const policyCards = policyList.querySelectorAll('[data-home-insurance-policy-card]')
    const activePolicyCount = container.querySelector('[data-home-insurance-policy-count]') as HTMLElement
    const firstProgress = policyCards[0]?.querySelector('[data-home-insurance-progress]') as HTMLElement
    const secondProgress = policyCards[1]?.querySelector('[data-home-insurance-progress]') as HTMLElement

    expect(policyList).toHaveClass('overflow-hidden')
    expect(policyCards).toHaveLength(2)
    expect(policyCards[1]).toHaveClass('border-t-[0.5px]')
    expect(activePolicyCount).toHaveClass('text-[28px]')
    expect(policyList.querySelectorAll('[data-home-insurance-logo]')).toHaveLength(2)
    expect(policyList.querySelector('[data-home-insurance-logo]')).toHaveClass('rounded-[4px]', 'overflow-hidden')
    expect(firstProgress.firstElementChild).toHaveStyle({ width: '30%' })
    expect(secondProgress.firstElementChild).toHaveStyle({ width: '56%' })
  })
})
