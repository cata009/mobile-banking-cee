// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
  const onAnalyticsClick = vi.fn()
  const onOfferOpen = vi.fn()
  const result = render(
    <DemoProvider initialState={{ product: 'PI', country, scenario: 'active', release, bankingScenario: 'retail-multi-account-card', productCounts: PRODUCT_COUNTS }}>
      <LanguageProvider initialLanguage="en">
        <App2027HomeScreen onDomesticPaymentClick={onDomesticPaymentClick} onProductsClick={onProductsClick} onAccountClick={onAccountClick} onAnalyticsClick={onAnalyticsClick} onOfferOpen={onOfferOpen} useCzRoboAccountCards={release === 'release-future-evo-2027'} />
      </LanguageProvider>
    </DemoProvider>,
  )
  return { ...result, onDomesticPaymentClick, onProductsClick, onAccountClick, onAnalyticsClick, onOfferOpen }
}

afterEach(cleanup)

// Home remembers the selected product tab for the session, so each test has to
// start from a known one rather than inheriting the previous test's choice.
beforeEach(() => {
  window.sessionStorage.clear()
})

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
    expect(container.querySelector('[data-home-transformation-summary="accounts"]')).toHaveTextContent('Spent this month')
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

    expect(tabs.map((tab) => tab.textContent)).toEqual(['Accounts', 'Savings', 'Credits', 'Insurance'])
    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(container.querySelector('[data-home-transformation-summary="savings"]')).toHaveTextContent('Interest earned')
    expect(screen.getByText('Saving accounts')).toBeInTheDocument()
    expect(screen.getByText(/6.5% p.a./)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(container.querySelector('[data-home-transformation-summary="credits"]')).toHaveTextContent('Due this month')
    expect(container.querySelector('[data-home-summary-art="credits"]')).toBeInTheDocument()
    expect(screen.getByText('Loans')).toBeInTheDocument()
    expect(screen.getByText('Mortgages')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Block card' })).not.toBeInTheDocument()
    expect(container.querySelector('[data-home-credit-limit-progress]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    expect(container.querySelector('[data-home-transformation-summary="insurance"]')).toHaveTextContent('2 active policies')
    expect(container.querySelector('[data-home-summary-art="insurance"]')).toBeInTheDocument()
    // The rail model every group on Home now shares: one policy per page, the
    // count in the header, and the next one a swipe away rather than behind a
    // chevron — so both are mounted, not just the top of a stack.
    expect(screen.getByText('Genius Protect')).toBeInTheDocument()
    expect(screen.getByText('Home Protect')).toBeInTheDocument()
  })

  it('keeps currency badges and the reusable CZ Robo account actions in Accounts', () => {
    const { container, onDomesticPaymentClick } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]')

    expect(accountsGroup).toBeInTheDocument()
    expect(within(accountsGroup as HTMLElement).getByRole('img', { name: 'CZK currency' })).toBeInTheDocument()
    expect(accountsGroup).toHaveTextContent('22.850,50 CZK')
    expect(accountsGroup).not.toHaveTextContent('22 850.50 CZK')

    // Every account is a sheet on the rail, so nothing has to be opened to reach the others.
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

    expect(within(accountsGroup).getAllByRole('button', { name: 'Currency Exchange' })).toHaveLength(2)
    expect(within(accountsGroup).getAllByRole('button', { name: 'Exchange rates' })).toHaveLength(2)
    expect(within(accountsGroup).getAllByRole('button', { name: 'Scan QR code' })).toHaveLength(1)
    expect(within(accountsGroup).getAllByRole('button', { name: 'Create QR code' })).toHaveLength(1)

    expect(within(cardsGroup).queryByRole('button', { name: /^Cards/ })).not.toBeInTheDocument()
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
    expect(comparison).toHaveTextContent('Debit cards')
    expect(within(cardsGroup).queryByRole('button', { name: /^Cards/ })).not.toBeInTheDocument()

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
    // No dashed "Add a debit card" tile at the end of the rail: the group header's
    // + carries that action, and the tile made the same offer a swipe away.
    expect(comparison.querySelector('[data-evo-card-ghost-banner]')).not.toBeInTheDocument()
    expect(comparison).not.toHaveTextContent('Add a debit card')
    expect(within(comparison.parentElement as HTMLElement).getByRole('button', { name: 'Add Debit cards' })).toBeInTheDocument()
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

  it('heads Evo Accounts with a static title and count instead of an accordion, without the legacy balance chrome', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement

    // Nothing to open or close: the rail already shows every account, so the header
    // only names the group and how many sheets are on it.
    const accountsHeader = accountsGroup.querySelector('[data-home-product-group-header="static"]') as HTMLElement
    expect(within(accountsHeader).getByRole('heading', { name: 'Accounts' })).toBeInTheDocument()
    expect(accountsHeader.querySelector('[data-home-group-count]')).toHaveTextContent('3 products')
    expect(within(accountsGroup).queryByRole('button', { name: /^Accounts/ })).not.toBeInTheDocument()
    expect(within(accountsGroup).queryByText('Total available balance')).not.toBeInTheDocument()
    expect(accountsGroup.querySelector('[data-home-product-group-icon="accounts"]')).not.toBeInTheDocument()
  })

  it('lays Evo Accounts out as a rail of account sheets, keeps the debit card comparison and renders Figma campaign media', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement
    const cardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement

    expect(within(cardsGroup).queryByRole('button', { name: /^Cards/ })).not.toBeInTheDocument()
    expect(cardsGroup.querySelector('[data-evo-card-comparison]')).toBeInTheDocument()

    // One sheet per account on a drag rail: the whole card in front, its own latest
    // transactions as the leaf tucked behind it with the stack's lift and faint border,
    // and the next sheet peeking in from the right. No stack to open, so no closed grid
    // rows and no peek-strip of the next card.
    const rail = within(accountsGroup).getByRole('region', { name: 'Accounts' })
    expect(rail).toHaveAttribute('data-carousel-rail')
    expect(rail).toHaveClass('overflow-x-auto', 'overscroll-x-contain', 'touch-pan-y')
    const sheets = Array.from(accountsGroup.querySelectorAll('[data-home-account-sheet]'))
    expect(sheets).toHaveLength(3)
    expect(sheets.map((sheet) => sheet.getAttribute('aria-label'))).toEqual(['Everyday account', 'Euro account', 'Dollar account'])
    for (const sheet of sheets) {
      expect(sheet).toHaveClass('w-[calc(100%-24px)]', 'shrink-0', 'flex-col')
      expect(sheet.querySelector('[data-home-account-card]')).toHaveClass('relative', 'z-10', 'rounded-[8px]', 'shadow-[0_6px_12px_rgb(var(--uc-shadow-rgb)/0.08)]')
      expect(sheet.querySelector('[data-product-card-evolution]')).toHaveClass('rounded-[8px]')
      expect(sheet.querySelector('[data-home-account-activity]')).toHaveClass('-mt-[8px]', 'rounded-[8px]', 'border-x', 'border-b', 'bg-[var(--uc-surface-raised)]', 'flex-1')
    }
    expect(accountsGroup.querySelector('[data-home-product-stack-preview]')).not.toBeInTheDocument()
    expect(accountsGroup.querySelectorAll('[class*="grid-rows-[0fr]"]')).toHaveLength(0)

    expect(within(cardsGroup).queryByText('Credit Card')).not.toBeInTheDocument()
    expect(cardsGroup.querySelectorAll('[data-product-card-evolution]')).toHaveLength(0)
    expect(cardsGroup.querySelector('[data-evo-card-comparison-tile] [data-component="Card"]')).toHaveClass('shadow-[0_3px_6px_rgb(var(--uc-shadow-rgb)/0.22)]')

    const interestRail = container.querySelector('[data-home-interest-carousel] [data-home-carousel-rail]') as HTMLElement
    expect(container.querySelectorAll('[data-home-interest-media]')).toHaveLength(3)
    // No zoom: the campaign frames are UniCredit's own, and the chevron is
    // composited into each one — cropping further pushes it out of the band.
    expect(container.querySelector('[data-home-interest-media]')).toHaveClass('block', 'size-full', 'object-cover')
    expect(container.querySelector('[data-home-interest-media]')).not.toHaveClass('scale-[1.12]')
    expect(container.querySelector('[data-home-interest-media]')?.parentElement).toHaveClass('h-[130px]', 'overflow-hidden')
    expect(interestRail).not.toHaveAttribute('data-home-carousel-auto-advance')
    expect(interestRail).toHaveClass('select-none', 'touch-pan-y', 'cursor-grab')
    expect(interestRail).not.toHaveClass('snap-x', 'snap-mandatory')
    expect(interestRail.firstElementChild).toHaveClass('w-[calc(100%-24px)]')
    // No reserved line: each row takes the height of the tallest across the rail,
    // so a two-line title lifts its neighbours instead of every card paying for it.
    expect(container.querySelector('[data-home-interest-carousel] h3')).toHaveAttribute('data-equalize', 'interest-title')
    expect(container.querySelector('[data-home-interest-carousel] h3')?.nextElementSibling).not.toHaveClass('min-h-[36px]')
    expect(container.querySelector('[data-home-interest-carousel] h3')?.nextElementSibling?.nextElementSibling).not.toHaveClass('min-h-[34px]')
    expect(container.querySelector('[data-home-interest-media]')?.parentElement).toHaveClass('relative')
    // The chevron is part of the photograph now, art-directed to pass behind the
    // subject. The overlay that faked that with a hand-drawn clip path is gone.
    expect(container.querySelector('[data-home-interest-arrow-back]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-home-interest-arrow-front]')).not.toBeInTheDocument()
    const shopSmartMedia = container.querySelectorAll('[data-home-shopsmart] [data-component="ShopsmartOfferCard"] img')
    expect(shopSmartMedia).toHaveLength(6)
    const shopSmartRail = container.querySelector('[data-home-shopsmart] [data-home-carousel-rail]')
    expect(shopSmartRail?.firstElementChild).toHaveClass('w-[calc(100%-24px)]')
    expect(shopSmartMedia[0]).toHaveClass('h-full', 'w-full', 'object-cover')
    expect(shopSmartMedia[0]?.parentElement).toHaveClass('relative', 'w-full', 'overflow-hidden')
    expect(shopSmartMedia[0]?.parentElement).toHaveStyle({ height: '130px' })
    // The campaign photography is outpainted to the card's panoramic ratio, so
    // every tab can use the neutral centre without cutting people or chevrons.
    expect(Array.from(container.querySelectorAll('[data-home-interest-media]')).map((image) => (image as HTMLImageElement).style.objectPosition)).toEqual([
      'center center',
      'center center',
      'center center',
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(container.querySelector('[data-home-saving-account-rail] [data-home-product-group-header="static"]')).toHaveTextContent('Saving accounts')
    // Deposits is a rail, not an accordion: all three are mounted and the dots
    // below say so, instead of a chevron hiding two of them.
    expect(container.querySelectorAll('[data-home-deposit-sheet]')).toHaveLength(3)

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    const creditCardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement
    expect(creditCardsGroup.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Credit cards')

    // A consumer loan and a mortgage answer different questions, so each gets its own rail:
    // one card apiece, headed by a plain heading rather than a toggle, and a single
    // card fills the width instead of leaving a peek beside it.
    for (const [attribute, cardName] of [
      ['data-home-loan-rail', 'Personal Loan'],
      ['data-home-mortgage-rail', 'Mortgage Loan'],
    ] as const) {
      const rail = container.querySelector(`[${attribute}]`) as HTMLElement
      const [sheet] = Array.from(rail.querySelectorAll('[data-home-loan-sheet], [data-home-mortgage-sheet]'))
      expect(rail.querySelector('[data-home-product-group-header="static"]')).toBeInTheDocument()
      expect(sheet).toHaveClass('w-full')
      expect(rail.querySelectorAll('[data-home-loan-card]')).toHaveLength(1)
      expect(rail).toHaveTextContent(cardName)
    }

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    const insuranceRail = container.querySelector('[data-home-insurance-rail]') as HTMLElement
    // Both policies ride the rail, with the header carrying how many there are.
    expect(insuranceRail.querySelector('[data-home-product-group-header]')).toHaveAttribute('data-home-product-group-header', 'static')
    expect(insuranceRail.querySelectorAll('[data-home-insurance-policy-card]')).toHaveLength(2)
    expect(insuranceRail.querySelector('[data-home-group-count]')).toHaveTextContent('2')
  })

  it('uses the Baseline balance-card composition for the Evo account totals while retaining spent-this-month logic', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const summary = container.querySelector('[data-home-transformation-summary="accounts"]') as HTMLElement
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement
    const [everydaySheet] = Array.from(accountsGroup.querySelectorAll('[data-home-account-sheet]'))

    // min-h, not a fixed height: a longer translation grows the banner instead of clipping.
    expect(summary).toHaveClass('min-h-[145.25px]', 'rounded-[8px]', 'overflow-hidden', 'relative', 'bg-[var(--uc-summary-accounts)]', 'px-[24px]', 'py-[15px]')
    expect(summary.querySelector('[data-home-summary-primary-amount] span')).toHaveClass('text-[28px]', 'font-bold')
    expect(summary.querySelector('[data-home-summary-art="accounts"]')).toBeInTheDocument()
    expect(summary.querySelector('[data-home-summary-divider]')).toHaveClass('my-[9px]', 'h-px', 'w-full')
    expect(summary.querySelector('[data-home-summary-secondary-amount]')).toBeInTheDocument()
    expect(summary).toHaveTextContent('Spent this month')
    // "Spent this month" is the one banner figure whose detail lives elsewhere, so
    // the banner is the door into Spending rather than an inert block of colour.
    expect(summary.tagName).toBe('BUTTON')
    // Each sheet carries only its own balance; the Euro account's stays on the Euro sheet.
    expect(everydaySheet).toHaveTextContent('22.850,50 CZK')
    expect(everydaySheet).not.toHaveTextContent('620')
  })

  it('gives every Evo account sheet its own recent transactions and its own way into the ledger', () => {
    const { container, onAccountClick } = renderHome('CZ', 'release-future-evo-2027')
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement
    const [everydaySheet, euroSheet] = Array.from(accountsGroup.querySelectorAll('[data-home-account-sheet]')) as HTMLElement[]
    const everydayActivity = everydaySheet!.querySelector('[data-home-account-activity]') as HTMLElement
    const euroActivity = euroSheet!.querySelector('[data-home-account-activity]') as HTMLElement

    // The aggregated list is gone: transactions only exist per account, so each sheet
    // heads its own ledger and nothing on the page claims to list them all.
    expect(container.querySelector('[data-home-transformation-activity]')).not.toBeInTheDocument()
    expect(within(everydayActivity).getByRole('heading', { name: 'Recent transactions' })).toBeInTheDocument()
    expect(within(euroActivity).getByRole('heading', { name: 'Recent transactions' })).toBeInTheDocument()

    // The primary account leads with the two latest curated Evo rows, in the Evo amount
    // contract, each a statement line: who and how much, then what it was and when.
    // Nothing names the account — the sheet already is the account.
    const everydayRows = Array.from(everydayActivity.querySelectorAll('[data-home-activity-row]'))
    expect(everydayRows).toHaveLength(2)
    expect(everydayRows[0]).toHaveTextContent('Seznam.cz')
    expect(everydayRows[0]).toHaveTextContent('+62.500,00 CZK')
    expect(everydayRows[0]).not.toHaveTextContent('Everyday account')
    expect(everydayRows[0]!.querySelector('[data-home-activity-meta]')).toHaveTextContent('Salary April · Today')
    expect(everydayRows[0]!.querySelector('[data-home-activity-amount]')).toHaveAttribute('data-home-activity-amount', 'positive')
    expect(everydayRows[1]).toHaveTextContent("McDonald's")
    expect(everydayRows[1]).toHaveTextContent('−248,90 CZK')
    expect(everydayRows[1]!.querySelector('[data-home-activity-meta]')).toHaveTextContent('Card payment · Today')
    expect(everydayActivity).not.toHaveTextContent('Spotify')

    // The Euro account shows the head of its own ledger, in its own currency.
    const euroRows = Array.from(euroActivity.querySelectorAll('[data-home-activity-row]'))
    expect(euroRows).toHaveLength(2)
    expect(euroRows[0]).toHaveTextContent('Freelancer Petr Novak')
    expect(euroRows[0]).toHaveTextContent('EUR')
    expect(euroRows[0]).not.toHaveTextContent('CZK')
    expect(euroRows[0]!.querySelector('[data-home-activity-meta]')).toHaveTextContent('Invoice payment · 28 Apr')
    expect(euroActivity).not.toHaveTextContent('Seznam.cz')

    // No "See more" of its own: the way into the rest of the ledger is the card, which
    // opens that account — the one place the rest of it exists.
    expect(within(accountsGroup).queryByRole('button', { name: /^See more/ })).not.toBeInTheDocument()
    fireEvent.click(euroSheet!.querySelector('[data-product-card-evolution]') as HTMLElement)
    expect(onAccountClick).toHaveBeenCalledTimes(1)
    expect(onAccountClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Euro account', currency: 'EUR' }))
  })

  it('uses 28px bold typography for every Evo summary primary value', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const primaryAmount = (tab: 'accounts' | 'savings' | 'credits') =>
      container.querySelector(`[data-home-transformation-summary="${tab}"] [data-home-summary-primary-amount] span`)

    expect(primaryAmount('accounts')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="accounts"]')).toHaveClass('min-h-[145.25px]')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(primaryAmount('savings')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="savings"]')).toHaveClass('min-h-[145.25px]', 'py-[15px]')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(primaryAmount('credits')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="credits"]')).toHaveClass('min-h-[145.25px]', 'py-[15px]')

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    expect(container.querySelector('[data-home-insurance-policy-count]')).toHaveClass('text-[28px]', 'font-bold')
    expect(container.querySelector('[data-home-transformation-summary="insurance"]')).toHaveClass('min-h-[145.25px]', 'py-[15px]')
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
    // Drawn and limit read as one sentence under the bar; the percentage is the bar.
    expect(container.querySelector('[data-home-credit-used]')).toHaveTextContent('6.800,00')
    expect(container.querySelector('[data-home-credit-used]')).toHaveTextContent('10.000,00 CZK')
    expect(screen.queryByRole('button', { name: 'Card details' })).not.toBeInTheDocument()

    expect(loanProgress).toHaveAttribute('aria-valuenow', '31')
    expect(loanProgress.firstElementChild).toHaveStyle({ width: '31.03448275862069%' })
    expect(loanCard).toHaveTextContent('Total repaid')
    expect(loanCard).toHaveTextContent('Total loan')
    expect(repaidAmount).toHaveClass('inline-flex', 'items-baseline', 'whitespace-nowrap')
    expect(repaidAmount.firstElementChild).toHaveClass('text-[16px]', 'font-bold')
    expect(repaidAmount.lastElementChild).toHaveClass('text-[12px]', 'font-medium')
    expect(totalAmount.firstElementChild).toHaveClass('text-[16px]', 'font-bold')
    expect(totalAmount.lastElementChild).toHaveClass('text-[12px]', 'font-medium')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    const maturityAmount = container.querySelector('[data-home-deposit-maturity-value]') as HTMLElement
    expect(maturityAmount).toHaveClass('inline-flex', 'items-baseline', 'whitespace-nowrap')
  })

  // The approved pastels now live behind per-tab tokens so each panel also has a dark
  // expression; pinning the hex here would forbid the dark one.
  it('uses the approved color palette for every Evo summary banner', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const summary = (tab: 'accounts' | 'savings' | 'credits' | 'insurance') =>
      container.querySelector(`[data-home-transformation-summary="${tab}"]`)

    expect(summary('accounts')).toHaveClass('bg-[var(--uc-summary-accounts)]')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(summary('savings')).toHaveClass('bg-[var(--uc-summary-savings)]')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(summary('credits')).toHaveClass('bg-[var(--uc-summary-credits)]')

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    expect(summary('insurance')).toHaveClass('bg-[var(--uc-summary-insurance)]')
  })

  it('keeps loan and insurance campaigns distinct in both copy and imagery', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const carousel = () => container.querySelector('[data-home-interest-carousel]') as HTMLElement
    const imageSources = () => Array.from(carousel().querySelectorAll('[data-home-interest-media]')).map((image) => image.getAttribute('src'))

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(Array.from(carousel().querySelectorAll('h3')).map((heading) => heading.textContent)).toEqual([
      'Plan a loan that fits your life',
      'Find a home loan for your next step',
      'Finance the things that matter',
    ])
    const loanImageSources = imageSources()
    expect(new Set(loanImageSources).size).toBe(3)

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    expect(Array.from(carousel().querySelectorAll('h3')).map((heading) => heading.textContent)).toEqual([
      'Protect your home with confidence',
      'Travel covered from start to finish',
      'Prepare for life’s unexpected moments',
    ])
    const insuranceImageSources = imageSources()
    expect(new Set(insuranceImageSources).size).toBe(3)
    expect(new Set([...loanImageSources, ...insuranceImageSources]).size).toBe(6)
  })

  it('uses panoramic outpainted campaign photography across every Home tab', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const assertPanoramicImages = () => {
      const images = Array.from(container.querySelectorAll('[data-home-interest-media]')) as HTMLImageElement[]
      expect(images).toHaveLength(3)
      expect(images.every((image) => image.src.includes('-wide-v2.png'))).toBe(true)
      expect(images.every((image) => image.style.objectPosition === 'center center')).toBe(true)
    }

    assertPanoramicImages()
    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    assertPanoramicImages()
    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    assertPanoramicImages()
    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    assertPanoramicImages()
  })

  it('uses section-specific interest titles across Accounts, Savings, Credits and Insurances', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const titles = () => Array.from(container.querySelectorAll('[data-home-interest-carousel] h3')).map((heading) => heading.textContent)
    const sectionTitle = () => container.querySelector('[data-home-interest-carousel] > h2')?.textContent

    expect(sectionTitle()).toBe('Smart ideas for everyday money')
    expect(titles()).toEqual([
      'Save a little every time you spend',
      'Stay on top of your everyday money',
      'Find your next smart move',
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))
    expect(sectionTitle()).toBe('Ideas to grow your savings')
    expect(titles()).toEqual([
      'Build a reserve for what matters',
      'Make your savings work harder',
      'Set a goal and watch it grow',
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(sectionTitle()).toBe('Ideas for your next step')
    expect(titles()).toEqual([
      'Plan a loan that fits your life',
      'Find a home loan for your next step',
      'Finance the things that matter',
    ])

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))
    expect(sectionTitle()).toBe('Protection for what matters')
    expect(titles()).toEqual([
      'Protect your home with confidence',
      'Travel covered from start to finish',
      'Prepare for life’s unexpected moments',
    ])
  })

  it('gives every savings group the account rail, single product or many', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')

    fireEvent.click(screen.getByRole('tab', { name: 'Savings' }))

    const investmentRail = container.querySelector('[data-home-investment-rail]') as HTMLElement
    const savingsRail = container.querySelector('[data-home-saving-account-rail]') as HTMLElement
    const depositRail = container.querySelector('[data-home-deposit-rail]') as HTMLElement
    const savingsSummary = container.querySelector('[data-home-transformation-summary="savings"]') as HTMLElement
    const maturityAmount = container.querySelector('[data-home-deposit-maturity]') as HTMLElement
    const maturityProgress = container.querySelector('[data-home-deposit-maturity-progress]') as HTMLElement

    // Every group is a rail now, so the title is always a heading: no chevron,
    // and no state in which a product the header counts is not on the page.
    expect(savingsRail.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Saving accounts')
    expect(investmentRail.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Investment')
    expect(savingsSummary).toHaveTextContent('768')
    expect(savingsSummary).toHaveTextContent('914')
    expect(investmentRail.compareDocumentPosition(savingsRail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(savingsRail.querySelector('[data-home-product-group-header="static"] > svg')).not.toBeInTheDocument()
    expect(investmentRail.querySelector('[data-home-product-group-header="static"] > svg')).not.toBeInTheDocument()
    expect(maturityAmount).toHaveClass('text-[14px]')
    expect(maturityAmount.querySelector('[data-home-deposit-maturity-value]')).toBeInTheDocument()
    expect(maturityProgress).toHaveAttribute('aria-valuenow', '75')
    expect(maturityProgress).toHaveAttribute('aria-valuemax', '365')
    expect(maturityProgress.firstElementChild).toHaveStyle({ width: '20.54794520547945%' })

    // All three deposits ride the rail in catalogue order, each on its own page
    // with the next peeking in — no chevron, no divider between two of them.
    const depositSheets = Array.from(depositRail.querySelectorAll('[data-home-deposit-sheet]'))
    expect(depositSheets).toHaveLength(3)
    expect(depositSheets[0]).toHaveClass('w-[calc(100%-24px)]')
    expect(
      Array.from(depositRail.querySelectorAll('[data-home-deposit-card]')).map(
        (card) => card.querySelector('p')?.textContent,
      ),
    ).toEqual([
      'Term Deposits · 6.5% p.a.',
      'Term Deposits · 5.2% p.a.',
      'Term Deposits · 7.1% p.a.',
    ])
    // A single product fills the width rather than leaving a peek beside nothing.
    expect(savingsRail.querySelector('[data-home-saving-account-sheet]')).toHaveClass('w-full')

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    const creditCardsGroup = container.querySelector('[data-home-product-group="cards"]') as HTMLElement
    expect(creditCardsGroup.querySelector('[data-home-product-group-header="static"]')).toHaveTextContent('Credit cards')
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
    const accountsGroup = container.querySelector('[data-home-product-group="accounts"]') as HTMLElement
    const [everydaySheet] = Array.from(accountsGroup.querySelectorAll('[data-home-account-sheet]')) as HTMLElement[]
    const everydayActivity = everydaySheet!.querySelector('[data-home-account-activity]') as HTMLElement
    const scrollSurface = container.querySelector('[data-app-2027-scroll]') as HTMLElement
    const shopSmartCategories = screen.getByLabelText('Shopsmart categories')

    // Recent transactions ride under the account they belong to, inside its sheet.
    expect(screen.queryByRole('heading', { name: 'Your recent transactions' })).not.toBeInTheDocument()
    expect(everydayActivity).toContainElement(within(everydayActivity).getByRole('heading', { name: 'Recent transactions' }))
    expect(everydayActivity).toHaveTextContent('Seznam.cz')
    expect(container.querySelector('[data-home-summary-art="accounts"]')).toBeInTheDocument()
    expect(scrollSurface).toHaveClass('pb-[16px]')
    expect(shopSmartCategories).toHaveClass('flex-nowrap', 'overflow-x-auto', 'select-none', 'touch-pan-y', 'cursor-grab')
    // The Offers page's own partner-category chip, shared — and it is the same
    // control as the product-category tabs at the top of this page: rounded
    // pill, 16px label, brand blue with a dot when selected. Two rails were
    // filtering the same catalogue with controls that had drifted apart.
    const mostPopularFilter = screen.getByRole('button', { name: 'Most popular' })
    expect(mostPopularFilter).toHaveClass('flex', 'shrink-0', 'rounded-full', 'border', 'px-[13px]', 'py-[7px]', 'text-[16px]', 'min-h-[44px]')
    expect(mostPopularFilter).toHaveClass('bg-[var(--uc-action-strong)]', 'text-[var(--uc-static-white)]')
    expect(mostPopularFilter).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Home & living' })).toHaveClass('flex', 'shrink-0', 'whitespace-nowrap', 'rounded-full', 'border', 'px-[13px]', 'py-[7px]', 'text-[16px]', 'min-h-[44px]')

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
    expect(container.querySelector('[data-home-deposit-maturity] [data-home-deposit-maturity-value]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Credits' }))
    expect(container.querySelector('[data-home-loan-installment] [data-home-supporting-amount] span')).toHaveClass('text-[16px]')
  })

  it('reuses the Products ShopSmart offer cards in the homepage carousel and keeps category taps actionable', () => {
    const { container, onProductsClick } = renderHome('CZ', 'release-future-evo-2027')
    const shopSmart = container.querySelector('[data-home-shopsmart]') as HTMLElement

    expect(shopSmart.querySelectorAll('[data-component="ShopsmartOfferCard"]')).toHaveLength(6)
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
    // Equalised across the rail rather than reserving two lines on every card.
    expect(offerCard.querySelector('span.whitespace-pre-line')).toHaveAttribute('data-equalize', 'shopsmart-title')
    fireEvent.click(offerCard)
    expect(onProductsClick).toHaveBeenCalledTimes(1)
  })

  it('keeps at least two ShopSmart offers available in every category filter', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')
    const shopSmart = container.querySelector('[data-home-shopsmart]') as HTMLElement

    for (const [label, id] of [['E-shops', 'eshops'], ['Electronics', 'electronics'], ['Travel', 'travel'], ['Home & living', 'home']] as const) {
      fireEvent.click(within(shopSmart).getByRole('button', { name: label }))
      expect(shopSmart).toHaveAttribute('data-home-shopsmart-filter', id)
      expect(shopSmart.querySelectorAll('[data-component="ShopsmartOfferCard"]').length).toBeGreaterThanOrEqual(2)
    }
  })

  it('gives Insurance policies the same rail treatment as account products', () => {
    const { container } = renderHome('CZ', 'release-future-evo-2027')

    fireEvent.click(screen.getByRole('tab', { name: 'Insurance' }))

    const policyRail = container.querySelector('[data-home-insurance-rail]') as HTMLElement
    const policyCards = policyRail.querySelectorAll('[data-home-insurance-policy-card]')
    const activePolicyCount = container.querySelector('[data-home-insurance-policy-count]') as HTMLElement
    const firstProgress = policyCards[0]?.querySelector('[data-home-insurance-progress]') as HTMLElement
    const secondProgress = policyCards[1]?.querySelector('[data-home-insurance-progress]') as HTMLElement

    expect(policyCards).toHaveLength(2)
    // Each policy is its own page of the rail — no divider between two of them.
    expect(policyCards[1]).not.toHaveClass('border-t-[0.5px]')
    expect(activePolicyCount).toHaveClass('text-[28px]')
    expect(policyRail.querySelectorAll('[data-home-insurance-logo]')).toHaveLength(2)
    expect(policyRail.querySelector('[data-home-insurance-logo]')).toHaveClass('rounded-[4px]', 'overflow-hidden')
    expect(firstProgress.firstElementChild).toHaveStyle({ width: '30%' })
    expect(secondProgress.firstElementChild).toHaveStyle({ width: '56%' })
  })

  it('heads every product group with its count and an add button into the matching shelf page', () => {
    const { container, onOfferOpen } = renderHome('CZ', 'release-future-evo-2027')

    // The count reads as part of the title, so it sits inside the same block —
    // and the far end of the header belongs to the group's one action.
    const accountsHeader = container.querySelector('[data-home-account-sheets] [data-home-product-group-header="static"]') as HTMLElement
    expect(accountsHeader).toHaveTextContent('Accounts3 products')
    expect(accountsHeader.querySelector('[data-home-group-count]')?.previousElementSibling?.tagName).toBe('H2')
    expect(accountsHeader.lastElementChild).toHaveAttribute('data-home-group-add')

    // Each group's + opens the shelf page for that kind of product — a group
    // pointing at the wrong page is worse than no button at all.
    for (const [tab, label, shelfItemId] of [
      ['Accounts', 'Add Accounts', 'current-account'],
      ['Accounts', 'Add Debit cards', 'debit-card'],
      ['Savings', 'Add Investment', 'mutual-funds'],
      ['Savings', 'Add Saving accounts', 'saving-account'],
      ['Savings', 'Add Deposits', 'term-deposit'],
      ['Credits', 'Add Credit cards', 'credit-card'],
      ['Credits', 'Add Loans', 'personal-loan'],
      ['Credits', 'Add Mortgages', 'mortgage-loan'],
      ['Insurance', 'Add Insurance', 'life-insurance'],
    ] as const) {
      fireEvent.click(screen.getByRole('tab', { name: tab }))
      onOfferOpen.mockClear()
      fireEvent.click(screen.getByRole('button', { name: label }))
      expect(onOfferOpen).toHaveBeenCalledWith(shelfItemId)
    }
  })
})
