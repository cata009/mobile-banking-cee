import { describe, expect, it } from 'vitest'
import { resolveInitialNavigation } from '@/app/navigation/initialNavigation'

describe('initial application navigation', () => {
  it.each([
    ['RS', 'active', 'release-future-rs-my-banker', 'homepage'],
    ['RS', 'inactive', 'release-future-rs-my-banker', 'prelogin-inactive'],
    ['RO', 'active', 'release-current', 'homepage'],
    ['CZ', 'active', 'release-future-rs-my-banker', 'homepage'],
  ] as const)('restores My Banker for %s/%s/%s to %s', (country, scenario, release, expected) => {
    expect(
      resolveInitialNavigation({
        parsedDeepLink: { screen: 'my-banker' },
        scenario,
        hashSection: '',
        context: { product: 'PI', country, designSystem: 'current', scenario, release },
      }).initialRoute,
    ).toEqual({ screen: expected })
  })

  it.each([
    ['RS', 'release-future-rs-future-gain', 'homepage'],
    ['CZ', 'release-future-evo-2027', 'homepage'],
    ['CZ', 'release-future-cz-robo', 'investments'],
  ] as const)('preserves the supported %s/%s destination %s', (country, release, destination) => {
    expect(
      resolveInitialNavigation({
        parsedDeepLink: { screen: destination },
        scenario: 'active',
        hashSection: '',
        context: { product: 'PI', country, designSystem: 'current', scenario: 'active', release },
      }).initialRoute,
    ).toEqual({ screen: destination })
  })

  it('restores typed card and account route payloads from deep links', () => {
    expect(
      resolveInitialNavigation({
        parsedDeepLink: { screen: 'card-options', cardId: 'card-7' },
        scenario: 'active',
        hashSection: '',
      }).initialRoute,
    ).toEqual({ screen: 'card-options', cardId: 'card-7' })

    expect(
      resolveInitialNavigation({
        parsedDeepLink: { screen: 'account-detail', accountId: 'account-3' },
        scenario: 'active',
        hashSection: '',
      }).initialRoute,
    ).toEqual({ screen: 'account-detail', accountId: 'account-3' })
  })

  it('uses design-system hashes only when no explicit screen was supplied', () => {
    expect(
      resolveInitialNavigation({
        parsedDeepLink: null,
        scenario: 'active',
        hashSection: 'component/primary-button',
      }),
    ).toMatchObject({
      initialScreen: 'design-system',
      initialCoAppingActive: false,
      shouldOpenDesignSystem: true,
    })

    expect(
      resolveInitialNavigation({
        parsedDeepLink: { screen: 'homepage' },
        scenario: 'active',
        hashSection: 'colors',
      }),
    ).toMatchObject({
      initialScreen: 'homepage',
      initialCoAppingActive: false,
      shouldOpenDesignSystem: true,
    })
  })

  it('falls back to the scenario entry screen', () => {
    expect(
      resolveInitialNavigation({
        parsedDeepLink: null,
        scenario: 'active',
        hashSection: '',
      }),
    ).toMatchObject({ initialScreen: 'homepage', initialCoAppingActive: true })

    expect(
      resolveInitialNavigation({
        parsedDeepLink: null,
        scenario: 'inactive',
        hashSection: '',
      }),
    ).toMatchObject({ initialScreen: 'prelogin-inactive', initialCoAppingActive: false })
  })
})
