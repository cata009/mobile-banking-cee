// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import MyBankerScreen from '@/app/screens/my-banker/MyBankerScreen'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'

/** RS My Banker with a portfolio holding a credit card and nothing else. */
const MY_BANKER_URL =
  '/?product=PI&country=RS&scenario=active&ds=current&release=release-future-rs-my-banker' +
  '&bank=retail-multi-account-card&theme=light&lang=en&screen=my-banker' +
  '&count_accounts=1&count_debit_cards=0&count_credit_cards=1&count_meal_cards=0' +
  '&count_deposits=0&count_savings=0&count_loans=0&count_mortgages=0&count_investments=0'

/** Retained reference renderer: the old persona does not enable a runtime release. */
function renderLegacyReference(bankingScenario: 'retail-multi-account-card' | 'retail-prospect' = 'retail-multi-account-card') {
  return render(
    <DemoProvider initialState={{
      product: 'PI', country: 'RS', scenario: 'active', designSystem: 'current',
      release: 'release-current', bankingScenario,
      productCounts: { accounts: 1, debitCards: 0, creditCards: 1, mealCards: 0, deposits: 0, savingsAccounts: 0, loans: 0, mortgages: 0, investments: 0 },
    }}>
      <LanguageProvider initialLanguage="en">
        <MyBankerScreen onBack={() => undefined} />
      </LanguageProvider>
    </DemoProvider>,
  )
}

const READY_TIMEOUT = { timeout: 4000 }

function renderAt(url: string) {
  window.history.replaceState({}, '', url)
  return render(<App />)
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

function cardKeys() {
  return screen.getAllByRole('article').map((card) => card.getAttribute('data-product-key'))
}

async function findCard(productKey: string) {
  const cards = await screen.findAllByRole('article', {}, READY_TIMEOUT)
  const card = cards.find((element) => element.getAttribute('data-product-key') === productKey)
  if (!card) throw new Error(`no card rendered for ${productKey}`)
  return card
}

async function waitForAnalysis() {
  return screen.findByText(/You have \d of 6 products people like you use/, {}, READY_TIMEOUT)
}

describe('Retained My Banker reference component', () => {
  it('narrates the peer analysis on entry, then opens on where the client stands', async () => {
    renderLegacyReference()

    expect(await screen.findByText('Comparing you with similar clients')).toBeInTheDocument()
    expect(screen.getByText('Reading your profile')).toBeInTheDocument()

    expect(await waitForAnalysis()).toBeInTheDocument()
    expect(screen.getByText('24 clients like you')).toBeInTheDocument()
    expect(screen.getByText(/35–44 years/)).toBeInTheDocument()
    expect(screen.getByText(/2 500–3 499 EUR \/ month/)).toBeInTheDocument()
  })

  it('argues for the one product most peers have and the client does not', async () => {
    renderLegacyReference()
    await waitForAnalysis()

    const lead = await findCard('overdraft')
    expect(lead).toHaveAttribute('data-my-banker-lead', 'true')
    expect(within(lead).getByText('Most often missing for you')).toBeInTheDocument()
    // The argument is about the client's own money; the peer count is the
    // reassurance underneath it, in the same line as the rate.
    expect(
      within(lead).getByText(/A 65 000 RSD buffer for the days between an expense and your salary/),
    ).toBeInTheDocument()
    expect(within(lead).getByText(/15 of 24 people like you have it/)).toBeInTheDocument()
    // The lead is already open: its figure needs no tap.
    expect(within(lead).getByText("At the group's typical amount")).toBeInTheDocument()
    expect(within(lead).getByText('Send request')).toBeInTheDocument()
  })

  it('opens the simulation on the group figure and keeps that reference visible', async () => {
    renderLegacyReference()
    await waitForAnalysis()

    const lead = await findCard('overdraft')
    // 65 000 RSD at 23.9% is what the peer group typically runs.
    expect(within(lead).getByDisplayValue('65 000')).toBeInTheDocument()
    expect(within(lead).getByText('Group average: 65 000 RSD')).toBeInTheDocument()
    expect(within(lead).getAllByText(/1 294 RSD/).length).toBeGreaterThan(0)
  })

  it('keeps the other products one tap away, in peer-adoption order', async () => {
    renderLegacyReference()
    await waitForAnalysis()

    expect(screen.getByText('More for people like you')).toBeInTheDocument()
    expect(screen.getByText('Already yours')).toBeInTheDocument()
    expect(cardKeys()).toEqual([
      'overdraft',
      'cash-loan',
      'term-deposit',
      'mortgage',
      'investment-fund',
      'credit-card',
    ])

    const cashLoan = await findCard('cash-loan')
    expect(within(cashLoan).queryByText("At the group's typical amount")).not.toBeInTheDocument()

    fireEvent.click(within(cashLoan).getByRole('button', { expanded: false }))

    expect(within(cashLoan).getByText("At the group's typical amount")).toBeInTheDocument()
    expect(within(cashLoan).getByText('Group average: 780 000 RSD')).toBeInTheDocument()
    expect(within(await findCard('credit-card')).getByText('In use')).toBeInTheDocument()
  })

  it('sends a request to the relationship manager and leaves the confirmation on the card', async () => {
    renderLegacyReference()
    await waitForAnalysis()

    const lead = await findCard('overdraft')
    fireEvent.click(within(lead).getByText('Send request'))

    const sheet = await screen.findByRole('dialog')
    expect(within(sheet).getByText('Overdraft')).toBeInTheDocument()
    expect(within(sheet).getByText(/Marko Jovanović/)).toBeInTheDocument()

    fireEvent.change(within(sheet).getByPlaceholderText('Anything your banker should know?'), {
      target: { value: 'Please call me this week.' },
    })
    fireEvent.click(within(sheet).getAllByText('Send request').at(-1)!)

    expect(await screen.findByText('Request sent to Marko Jovanović')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(await findCard('overdraft')).getByText(/Request sent to Marko Jovanović\. They will come back/),
    ).toBeInTheDocument()
  })

  it('keeps the simulation untouched when the request is cancelled', async () => {
    renderLegacyReference()
    await waitForAnalysis()

    const lead = await findCard('overdraft')
    fireEvent.click(within(lead).getByText('Send request'))

    const sheet = await screen.findByRole('dialog')
    fireEvent.click(within(sheet).getByText('Cancel'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(await findCard('overdraft')).getByDisplayValue('65 000')).toBeInTheDocument()
  })

  it('drops the argument and the percentages when the peer group is too small', async () => {
    renderLegacyReference('retail-prospect')

    expect(
      await screen.findByText(/There are not enough clients like you to compare with yet/, {}, READY_TIMEOUT),
    ).toBeInTheDocument()
    expect(screen.queryByText(/\d+ clients like you/)).not.toBeInTheDocument()
    expect(screen.queryByText('Most often missing for you')).not.toBeInTheDocument()
    expect(screen.getAllByText('No info on similar clients')).toHaveLength(6)

    // Without adoption data the catalogue order stands, recommendations first.
    expect(cardKeys()).toEqual([
      'term-deposit',
      'cash-loan',
      'mortgage',
      'investment-fund',
      'overdraft',
      'credit-card',
    ])
  })
})


describe('My Banker runtime retirement', () => {
  it.each(['release-future-rs-my-banker', 'release-future-rs-future-gain'])(
    'falls back from a My Banker deep link in %s without activating the reference renderer',
    async (release) => {
      renderAt(MY_BANKER_URL.replace('release-future-rs-my-banker', release))
      await waitFor(() => expect(new URLSearchParams(window.location.search).get('screen')).toBe('homepage'))
      expect(screen.getByRole('button', { name: 'PI - Serbia' })).toBeInTheDocument()
      expect(screen.queryByText('Comparing you with similar clients')).not.toBeInTheDocument()
      expect(screen.queryByText(/You have \d of 6 products people like you use/)).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: 'My Banker' })).not.toBeInTheDocument()
      expect(document.querySelector('[data-my-banker-lead]')).not.toBeInTheDocument()
    },
  )
})
