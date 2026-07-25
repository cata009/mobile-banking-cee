// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, describe, expect, expectTypeOf, it } from 'vitest'
import KidsMarketHomeApp, {
  HU_DEFAULT_KIDS_CARD,
  HU_DEFAULT_THEME,
  HU_KIDS_CARDS,
  HU_THEME_PRESETS,
  getHuTheme,
  type HuKidsCard,
  type HuThemePreset,
} from '@/app/screens/kids/KidsMarketHomeApp'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import {
  KIDS_HOME_COUNTRIES,
  KIDS_MARKET_HOME_CONCEPTS,
  getKidsHomeConcept,
  getPocketProgress,
  type KidsHomePocket,
} from '@/data/kidsMarketHomeConcepts'

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'HU', product: 'KIDS_PI' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function renderKids(country: 'HU' | 'SK' | 'RO') {
  return render(<KidsMarketHomeApp country={country} />, { wrapper: AppProviders })
}

function renderHuKids() {
  return renderKids('HU')
}

// Earning shows two `SHOW MORE` links: one on the Tasks card, one on the
// Education card. Target the Education one so the query stays unambiguous as
// either card's content grows.
function openLearnFromEarning(container: HTMLElement) {
  const educationCard = container.querySelector('[data-hu-learn-education-card]')
  if (!educationCard) throw new Error('Education card was not rendered on Earning')
  fireEvent.click(within(educationCard as HTMLElement).getByRole('button', { name: 'SHOW MORE' }))
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
})

afterEach(cleanup)

describe('HU Kids invariant registries', () => {
  it('preserves the exact seven theme labels, ids, order, and named fallback', () => {
    expectTypeOf(HU_THEME_PRESETS).toMatchTypeOf<readonly [HuThemePreset, ...HuThemePreset[]]>()
    expect(HU_THEME_PRESETS.map(({ name, id }) => [name, id])).toEqual([
      ['Standard', 'default'],
      ['Nordlys', 'nordlys'],
      ['Blue Lines', 'blue-lines'],
      ['Blockcraft', 'bubbles'],
      ['Aurora', 'aurora'],
      ['Garden', 'garden'],
      ['Solar', 'solar'],
    ])
    expect(HU_DEFAULT_THEME).toBe(HU_THEME_PRESETS[0])
    expect(Reflect.apply(getHuTheme, undefined, ['unknown-theme'])).toBe(HU_DEFAULT_THEME)
  })

  it('preserves the named Mastercard Standard default ending 5678', () => {
    expectTypeOf(HU_KIDS_CARDS).toMatchTypeOf<readonly [HuKidsCard, ...HuKidsCard[]]>()
    expect(HU_DEFAULT_KIDS_CARD).toBe(HU_KIDS_CARDS[0])
    expect(HU_DEFAULT_KIDS_CARD).toEqual({
      id: 'alexandra-standard-main',
      title: 'Mastercard Standard',
      lastDigits: '5678',
      holderName: 'ALEXANDRA ALBON',
    })
  })

  it('keeps every registered Kids concept pocket list non-empty and its first offer exact', () => {
    expectTypeOf(KIDS_MARKET_HOME_CONCEPTS.SK.pockets)
      .toMatchTypeOf<[KidsHomePocket, ...KidsHomePocket[]]>()
    expectTypeOf(KIDS_MARKET_HOME_CONCEPTS.HU.pockets)
      .toMatchTypeOf<[KidsHomePocket, ...KidsHomePocket[]]>()

    expect(KIDS_HOME_COUNTRIES.map((country) => {
      const primaryPocket = getKidsHomeConcept(country).pockets[0]
      return {
        country,
        title: primaryPocket.title,
        helper: primaryPocket.helper,
        progress: getPocketProgress(primaryPocket),
      }
    })).toEqual([
      {
        country: 'SK',
        title: 'Get a savings goal',
        helper: 'Offer banner style from the Bulbank concept',
        progress: 38,
      },
      {
        country: 'HU',
        title: 'Festival pass',
        helper: 'Auto-save 700 Ft weekly',
        progress: 33,
      },
      {
        country: 'RO',
        title: 'iPhone nou',
        helper: 'Economisești 120 RON pe săptămână',
        progress: 27,
      },
    ])
  })
})

describe('RO Teens app', () => {
  it('renders the Romanian payments-first teens app for RO', () => {
    renderKids('RO')

    expect(screen.getByText('disponibili acum pentru tine')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Plăți' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cere bani' })).toBeInTheDocument()
  })

  it('opens the curated-payee pay flow with no free IBAN entry', () => {
    renderKids('RO')

    fireEvent.click(screen.getByRole('button', { name: 'Plătește' }))

    expect(
      screen.getByText(/Toți sunt pe lista aprobată de Mama/),
    ).toBeInTheDocument()
  })
})

describe('HU Kids default theme and card behavior', () => {
  it('starts on the named Standard theme and opens the named default card', () => {
    const { container } = renderHuKids()

    expect(container.querySelector('[data-hu-theme]')).toHaveAttribute('data-hu-theme', 'default')

    fireEvent.click(screen.getByRole('button', { name: 'Open Mastercard Standard ending 5678' }))

    expect(container.querySelector('[data-hu-card-details-actions]')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mastercard Standard card ending 5678' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Manage card' }))
    expect(container.querySelector('[data-hu-kids-theme-scope="card-settings"]')).toBeInTheDocument()
  })

  it('keeps header-owned amount and Messages controls wired', () => {
    const { container } = renderHuKids()

    fireEvent.click(screen.getByRole('button', { name: 'Hide amounts' }))
    expect(screen.getByRole('button', { name: 'Show amounts' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Messages' }))
    expect(container.querySelector('[data-hu-kids-theme-scope="messages"]')).toBeInTheDocument()
  })

  it('keeps Saving on the active savings surface rather than the removed legacy Products island', () => {
    renderHuKids()

    fireEvent.click(screen.getByRole('button', { name: 'Saving' }))

    expect(screen.getByText('All your savings')).toBeInTheDocument()
    expect(screen.getByText('Saving goals')).toBeInTheDocument()
    expect(screen.queryByText('Products')).not.toBeInTheDocument()
  })

  it('keeps live transactions interactive while theme-preview transactions stay inert', () => {
    const live = renderHuKids()
    const liveTransaction = screen.getByRole('button', { name: /From Dad.*Salary November/ })

    fireEvent.click(liveTransaction)
    expect(screen.getByText('Transaction details')).toBeInTheDocument()
    live.unmount()

    renderHuKids()
    fireEvent.click(screen.getByRole('button', { name: 'More Options' }))
    fireEvent.click(screen.getByRole('button', { name: 'Change theme' }))

    expect(screen.getByText('From Dad').closest('button')).toBeNull()
    expect(screen.queryByRole('button', { name: /From Dad.*Salary November/ })).not.toBeInTheDocument()
  })

  it('renders the semantic Learn Messages and SK Education completion icon geometry', () => {
    const hu = renderHuKids()

    fireEvent.click(screen.getByRole('button', { name: 'Earning' }))

    // Messages lives in the Earning header; the Learn page swaps that header for
    // the menu frame, so assert the glyph before navigating away from it.
    expect(screen.getByRole('button', { name: 'Messages' }).querySelector('svg'))
      .toHaveAttribute('viewBox', '5 8 22 15')

    openLearnFromEarning(hu.container)
    expect(hu.container.querySelector('[data-hu-kids-theme-scope]'))
      .toHaveAttribute('data-hu-kids-theme-scope', 'learn')
    hu.unmount()

    renderKids('SK')
    fireEvent.click(screen.getByRole('button', { name: 'Education' }))

    const education = screen.getByText('Financial education').closest('section')
    expect(education?.querySelector('svg')).toHaveAttribute('viewBox', '6 9 20 14')
  })

  it('preserves Learn completion and segmented lesson progression', () => {
    const { container } = renderHuKids()

    fireEvent.click(screen.getByRole('button', { name: 'Earning' }))
    openLearnFromEarning(container)
    fireEvent.click(screen.getByRole('button', { name: /Saving goals/ }))

    const completedLesson = screen.getByRole('button', { name: /Pick a clear target.*Completed/ })
    expect(completedLesson.querySelector('svg')).toHaveAttribute('viewBox', '6 9 20 14')
    fireEvent.click(completedLesson)

    const lesson = container.querySelector('[data-hu-learn-lesson="saving-goals-target"]')
    const segments = lesson?.querySelectorAll('div.h-\\[4px\\].flex-1') ?? []
    expect(segments).toHaveLength(4)
    expect(Array.from(segments).filter((segment) => segment.classList.contains('bg-[var(--hu-theme-accent-strong)]')))
      .toHaveLength(1)

    // The lesson player advances through the segment rail; the old "Slide n of m"
    // caption was dropped when the player was redesigned, so the rail is the
    // progress contract.
    fireEvent.click(screen.getByRole('button', { name: 'NEXT' }))

    expect(Array.from(segments).filter((segment) => segment.classList.contains('bg-[var(--hu-theme-accent-strong)]')))
      .toHaveLength(2)
  })

  it('selects and applies every published theme without changing its mapping', () => {
    for (const theme of HU_THEME_PRESETS) {
      const { container, unmount } = renderHuKids()

      fireEvent.click(screen.getByRole('button', { name: 'More Options' }))
      fireEvent.click(screen.getByRole('button', { name: 'Change theme' }))
      fireEvent.click(screen.getByRole('button', { name: `Select ${theme.name} theme` }))

      expect(container.querySelector('[data-hu-theme]')).toHaveAttribute('data-hu-theme', theme.id)

      fireEvent.click(screen.getByRole('button', { name: theme.id === 'default' ? 'Apply current theme' : 'Apply' }))

      expect(container.querySelector('[data-hu-theme]')).toHaveAttribute('data-hu-theme', theme.id)
      unmount()
    }
  })
})
