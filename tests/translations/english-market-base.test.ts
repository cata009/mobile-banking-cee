import { describe, expect, it } from 'vitest'
import { createMarketEnglishTranslations } from '@/translations/englishMarketBase'

const market = {
  panel: {
    aboutSmartBanking: 'ABOUT SMART BANKING',
    exchangeRates: 'EXCHANGE RATES',
    findAtmBranches: 'FIND ATM & BRANCHES',
  },
  products: {
    findOutMore: 'FIND OUT MORE',
    account: { title: 'Open an account', description: 'Account description' },
    loans: { title: 'Loans', description: 'Loan description' },
  },
  moreCards: {
    contacts: 'Contacts',
    documents: 'Documents',
    settings: 'Settings',
    gdprConsent: 'GDPR Consent',
    thirdPartyConsent: 'Third party consent',
    digitalActivities: 'Digital activity record',
    myRequests: 'My applications',
    tutorial: 'Tutorials',
  },
  advisor: {
    phone: '+40 123',
    emailAddress: 'advisor@example.com',
    address: 'Example address',
  },
}

describe('shared market English translations', () => {
  it('combines shared copy with explicit market-owned fields', () => {
    const translations = createMarketEnglishTranslations(market)

    expect(translations.preLogin.welcome).toBe('Welcome!')
    expect(translations.navigation.analytics).toBe('Spending')
    expect(translations.products).toEqual(market.products)
    expect(translations.prime.advisor).toMatchObject(market.advisor)
    expect(translations.coApping).toBeUndefined()
  })
})
