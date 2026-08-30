import { describe, expect, it } from 'vitest'
import { resolveInitialNavigation } from '@/app/navigation/initialNavigation'

describe('initial application navigation', () => {
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
