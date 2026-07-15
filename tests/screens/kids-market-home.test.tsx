// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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

function renderHuKids() {
  return render(<KidsMarketHomeApp country="HU" />, { wrapper: AppProviders })
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
    ])
  })
})

describe('HU Kids default theme and card behavior', () => {
  it('starts on the named Standard theme and opens the named default card', () => {
    const { container } = renderHuKids()

    expect(container.querySelector('[data-hu-theme]')).toHaveAttribute('data-hu-theme', 'default')

    fireEvent.click(screen.getByRole('button', { name: 'Open Mastercard Standard ending 5678' }))

    expect(container.querySelector('[data-hu-card-details-actions]')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage card' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Mastercard Standard card ending 5678' })).toBeInTheDocument()
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
