import {
  STANDARD_ENGLISH_MORE_CARDS,
  STANDARD_ENGLISH_PANEL,
  STANDARD_ENGLISH_PRODUCTS,
  createMarketEnglishTranslations,
} from '../englishMarketBase'

export default createMarketEnglishTranslations({
  panel: STANDARD_ENGLISH_PANEL,
  products: {
    ...STANDARD_ENGLISH_PRODUCTS,
    findOutMore: 'Apply 100% Online',
    account: {
      title: 'Want to become a customer ?',
      description:
        'Because we know how important time is, get your current accounts in LEI and/or Euro with a debit card and Mobile Banking attached.',
    },
  },
  moreCards: STANDARD_ENGLISH_MORE_CARDS,
  advisor: {
    phone: '+40 602 123 456',
    emailAddress: 'david.novak@unicredit.ro',
    address: 'Str. Exemplu 1525/1, 140 92, București 4',
  },
})
