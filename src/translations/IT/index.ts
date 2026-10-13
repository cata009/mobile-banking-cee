import {
  STANDARD_ENGLISH_MORE_CARDS,
  STANDARD_ENGLISH_PANEL,
  STANDARD_ENGLISH_PRODUCTS,
  createMarketEnglishTranslations,
} from '../englishMarketBase';
import type { TranslationKeys } from '../types';

// Shared chrome remains available while Italy's implemented scope is the homepage.
const en = createMarketEnglishTranslations({
  panel: STANDARD_ENGLISH_PANEL,
  products: STANDARD_ENGLISH_PRODUCTS,
  moreCards: STANDARD_ENGLISH_MORE_CARDS,
  advisor: { name: '', branch: '', phone: '', emailAddress: '', address: '' },
});

const it: TranslationKeys = {
  ...en,
  languageSelector: { selectLanguage: 'Seleziona la lingua', save: 'Salva' },
  navigation: { home: 'Home', analytics: 'Spese', payments: 'Pagamenti', products: 'Prodotti', more: 'Altro' },
  home: {
    totalBalance: 'Saldo totale', totalAvailable: 'Disponibilità totale',
    period: { thisMonth: 'Questo mese', lastMonth: 'Il mese scorso', vsLastMonth: 'rispetto al mese scorso' },
  },
};

export const IT_TRANSLATIONS = { en, it };
