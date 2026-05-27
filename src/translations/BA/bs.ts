import type { TranslationKeys } from '../types';

/**
 * Bosnian translations for Bosnia and Herzegovina (BA)
 * Bosanski - Bosna i Hercegovina
 */
const bs: TranslationKeys = {
  // ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: 'Dobrodošli!',
    accounts: 'RAČUNI',
    openAccountDescription: 'Otvorite račun',
    selectYourAccount: 'IZABERITE SVOJ RAČUN',
    activateApplication: 'Aktivirajte aplikaciju',
    contacts: 'KONTAKTI',
    mtoken: 'MTOKEN',
    other: 'OSTALO',
  },

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: 'Novi izgled,\n& više usluga.',
    subtitle: 'Sve bankarske usluge u vašem džepu!',
    loginButton: 'Prijavite se',
    contacts: 'KONTAKTI',
    mtoken: 'MTOKEN',
    other: 'OSTALO',
  },

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: 'Odaberite jezik',
    save: 'Spremi',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'O SMART BANKINGU',
    exchangeRates: 'DEVIZNI TEČAJEVI',
    findAtmBranches: 'PRONAĐI ATM & POSLOVNICE',
    // NO startCoAppingSession - Bosnia doesn't have Co-Apping
  },

  // NO coApping - Bosnia doesn't have this feature

  // ==========================================
  // PRODUCTS (for ProductAccordion)
  // ==========================================
  products: {
    findOutMore: 'SAZNAJTE VIŠE',
    account: {
      title: 'Otvorite račun',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    loans: {
      title: 'Krediti',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  },

  // ==========================================
  // HOMEPAGE - BOTTOM NAVIGATION
  // ==========================================
  navigation: {
    home: 'Home',
    analytics: 'Analytics',
    payments: 'Payments',
    products: 'Products',
    more: 'More',
  },

  // ==========================================
  // HOME SCREEN
  // ==========================================
  home: {
    totalBalance: 'Ukupno stanje',
    totalAvailable: 'Ukupno dostupno',

    period: {
      thisMonth: 'Ovaj mjesec',
      lastMonth: 'Prošli mjesec',
      vsLastMonth: 'vs prošli mjesec',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'VAŠ SAVJETNIK',
    tabYourBenefits: 'VAŠE POGODNOSTI',
    
    advisor: {
      introText: 'Potrebna vam je personalizirana podrška? Vaš bankovni savjetnik je samo jedan poziv daleko, spreman da vam pomogne sa bilo kojim zahtjevom, u bilo koje vrijeme!',
      yourAdvisor: 'VAŠ SAVJETNIK',
      name: 'David Novak',
      phoneNumber: 'BROJ TELEFONA',
      phone: '+387 602 123 456',
      email: 'E-MAIL',
      emailAddress: 'david.novak@unicreditbank.ba',
      branchName: 'NAZIV FILIJALE',
      branch: 'Filijala 36',
      branchAddress: 'ADRESA FILIJALE',
      address: 'Želetavská 1525/1, 140 92, Sarajevo 4',
      callNow: 'Pozovi sada',
      sendEmail: 'Pošalji email',
      availability: 'Dostupan u intervalu 08-18, od ponedjeljka do petka',
    },
    
    benefits: {
      pageTitle: 'Prime pogodnosti',
      introText: 'Uživajte u našem Prime by UniCredit Bank i dobijte posvećenog ličnog savjetnika koji pruža prilagođene ponude i podršku, čineći vaše bankovno iskustvo zaista personalizovanim.',
      
      benefit1Title: 'LIČNI SAVJETNIK',
      benefit1Description: 'Imajte posvećenog savjetnika dostupnog za sve vaše bankarske zahtjeve',
      
      benefit2Title: 'DOBIJTE PRILAGOĐENE PONUDE',
      benefit2Description: 'Sastanite se lično sa vašim savjetnikom i provjerite nove proizvode za vas',
      
      benefit3Title: 'POGODNOST BR 3',
      benefit3Description: 'Sastanite se lično sa vašim savjetnikom i provjerite nove proizvode za vas',
      
      benefit4Title: 'POGODNOST BR 4',
      benefit4Description: 'Sastanite se lično sa vašim savjetnikom i provjerite nove proizvode za vas',
      
      termsConditions: 'Uslovi korištenja PRIME programa',
    },
  },
};

export default bs;