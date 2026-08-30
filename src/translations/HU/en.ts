import {
  STANDARD_ENGLISH_PANEL,
  STANDARD_ENGLISH_PRODUCTS,
  createMarketEnglishTranslations,
} from '../englishMarketBase'

export default createMarketEnglishTranslations({
  panel: STANDARD_ENGLISH_PANEL,
  products: {
    ...STANDARD_ENGLISH_PRODUCTS,
    loans: { ...STANDARD_ENGLISH_PRODUCTS.loans, title: 'Cash Loan application' },
  },
  moreCards: {
    contacts: 'Contact',
    documents: 'Documents',
    settings: 'Settings',
    gdprConsent: 'GDPR Consent',
    thirdPartyConsent: 'Third party consents',
    digitalActivities: 'Digital activity record',
    myRequests: 'Product applications and cancellations',
    tutorial: 'Tutorials',
  },
  advisor: {
    phone: '+36 602 123 456',
    emailAddress: 'david.novak@unicredit.hu',
    address: 'Želetavská 1525/1, 140 92, Budapest 4',
  },
})
