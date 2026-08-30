import {
  STANDARD_ENGLISH_MORE_CARDS,
  STANDARD_ENGLISH_PANEL,
  STANDARD_ENGLISH_PRODUCTS,
  createMarketEnglishTranslations,
} from '../englishMarketBase'

export default createMarketEnglishTranslations({
  panel: STANDARD_ENGLISH_PANEL,
  products: STANDARD_ENGLISH_PRODUCTS,
  moreCards: STANDARD_ENGLISH_MORE_CARDS,
  advisor: {
    phone: '+386 602 123 456',
    emailAddress: 'david.novak@unicreditbank.si',
    address: 'Želetavská 1525/1, 140 92, Ljubljana 4',
  },
})
