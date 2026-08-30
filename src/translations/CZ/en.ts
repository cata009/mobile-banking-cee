import {
  ENGLISH_CO_APPING,
  STANDARD_ENGLISH_MORE_CARDS,
  STANDARD_ENGLISH_PANEL,
  STANDARD_ENGLISH_PRODUCTS,
  createMarketEnglishTranslations,
} from '../englishMarketBase'

export default createMarketEnglishTranslations({
  panel: { ...STANDARD_ENGLISH_PANEL, startCoAppingSession: 'START CO-APPING SESSION' },
  coApping: ENGLISH_CO_APPING,
  products: {
    ...STANDARD_ENGLISH_PRODUCTS,
    account: { ...STANDARD_ENGLISH_PRODUCTS.account, title: 'Accounts' },
  },
  moreCards: STANDARD_ENGLISH_MORE_CARDS,
  advisor: {
    phone: '+420 602 123 456',
    emailAddress: 'david.novak@unicredit.cz',
    address: 'Želetavská 1525/1, 140 92, Praha 4',
  },
})
