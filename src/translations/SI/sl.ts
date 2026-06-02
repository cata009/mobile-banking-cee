import type { TranslationKeys } from '../types';
import { createSharedTranslations } from '../shared';

/**
 * Slovenian translations for Slovenia (SI)
 * Slovenščina - Slovenija
 */
const sl: TranslationKeys = {
  ...createSharedTranslations('sl'),
// ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: 'Dobrodošli!',
    accounts: 'RAČUNI',
    openAccountDescription: 'Odprite račun',
    selectYourAccount: 'IZBERITE SVOJ RAČUN',
    activateApplication: 'Aktivirajte aplikacijo',
    contacts: 'KONTAKTI',
    mtoken: 'MTOKEN',
    other: 'DRUGO',
  },

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: 'Nov videz,\n& več storitev.',
    subtitle: 'Vse bančne storitve v vašem žepu!',
    loginButton: 'Prijava',
    contacts: 'KONTAKTI',
    mtoken: 'MTOKEN',
    other: 'DRUGO',
  },

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: 'Izberite jezik',
    save: 'Shrani',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'O SMART BANKINGU',
    exchangeRates: 'MENJALNI TEČAJI',
    findAtmBranches: 'NAJDI ATM & PODRUŽNICE',
    // NO startCoAppingSession - Slovenia doesn't have Co-Apping
  },

  // NO coApping - Slovenia doesn't have this feature

  // ==========================================
  // PRODUCTS (for ProductAccordion)
  // ==========================================
  products: {
    findOutMore: 'IZVEDITE VEČ',
    account: {
      title: 'Odprite račun',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    loans: {
      title: 'Posojila',
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
    totalBalance: 'Skupno stanje',
    totalAvailable: 'Skupaj na voljo',

    period: {
      thisMonth: 'Ta mesec',
      lastMonth: 'Prejšnji mesec',
      vsLastMonth: 'vs prejšnji mesec',
    },
  },

  // ==========================================
  // MORE SCREEN
  // ==========================================
  more: {
    title: 'Vec',
    cards: {
      contacts: 'Stiki',
      documents: 'Dokumenti',
      settings: 'Nastavitve',
      gdprConsent: 'Soglasje GDPR',
      thirdPartyConsent: 'Soglasje tretjim osebam',
      digitalActivities: 'Zapis digitalne aktivnosti',
      myRequests: 'Moje vloge',
      tutorial: 'Vadnice',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'VAŠ SVETOVALEC',
    tabYourBenefits: 'VAŠE UGODNOSTI',
    
    advisor: {
      introText: 'Potrebujete prilagojeno podporo? Vaš bančni svetovalec je le klic stran, pripravljen vam pomagati pri vsaki zahtevi, kadarkoli!',
      yourAdvisor: 'VAŠ SVETOVALEC',
      name: 'David Novak',
      phoneNumber: 'TELEFONSKA ŠTEVILKA',
      phone: '+386 602 123 456',
      email: 'E-POŠTA',
      emailAddress: 'david.novak@unicreditbank.si',
      branchName: 'IME PODRUŽNICE',
      branch: 'Podružnica 36',
      branchAddress: 'NASLOV PODRUŽNICE',
      address: 'Želetavská 1525/1, 140 92, Ljubljana 4',
      callNow: 'Pokliči zdaj',
      sendEmail: 'Pošlji e-pošto',
      availability: 'Na voljo v intervalu 08-18, od ponedeljka do petka',
    },
    
    benefits: {
      pageTitle: 'Prime ugodnosti',
      introText: 'Uživajte v našem Prime by UniCredit Bank in pridobite namenskega osebnega svetovalca, ki zagotavlja prilagojene ponudbe in podporo, zaradi česar je vaša bančna izkušnja resnično prilagojena.',
      
      benefit1Title: 'OSEBNI SVETOVALEC',
      benefit1Description: 'Imejte namenskega svetovalca na voljo za vse vaše bančne zahteve',
      
      benefit2Title: 'PRIDOBITE PRILAGOJENE PONUDBE',
      benefit2Description: 'Srečajte se osebno s svetovalcem in preverite nove izdelke za vas',
      
      benefit3Title: 'UGODNOST ŠT. 3',
      benefit3Description: 'Srečajte se osebno s svetovalcem in preverite nove izdelke za vas',
      
      benefit4Title: 'UGODNOST ŠT. 4',
      benefit4Description: 'Srečajte se osebno s svetovalcem in preverite nove izdelke za vas',
      
      termsConditions: 'Pogoji programa PRIME',
    },
  },
};

export default sl;