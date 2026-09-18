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
    home: 'Domov',
    analytics: 'Poraba',
    payments: 'Plačila',
    products: 'Ponudbe',
    more: 'Več',
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
      bookAppointment: 'Rezerviraj sestanek',
      requestCall: 'Zahtevaj klic',
      availability: 'Na voljo v intervalu 08-18, od ponedeljka do petka',
    },
    
    benefits: {
      pageTitle: 'Prime ugodnosti',
      introText: 'Prime by UniCredit Bank vam prinaša namenskega osebnega svetovalca, ponudbe po meri in ekskluzivne ugodnosti — bančništvo, zasnovano povsem okoli vas.',

      benefit1Title: 'VAŠ OSEBNI SVETOVALEC',
      benefit1Description: 'En svetovalec, ki vas pozna in je vedno pripravljen pomagati pri vsaki bančni zadevi.',

      benefit2Title: 'PONUDBE PO MERI',
      benefit2Description: 'Srečajte se osebno s svetovalcem in odkrijte izdelke ter ponudbe, izbrane posebej za vas.',

      benefit3Title: 'PREDNOSTNA OBRAVNAVA',
      benefit3Description: 'Preskočite čakalno vrsto s prednostno podporo, kadar koli jo potrebujete — v poslovalnici ali po telefonu.',

      benefit4Title: 'EKSKLUZIVNE UGODNOSTI',
      benefit4Description: 'Uživajte v ugodnejših obrestnih merah, posebnih dogodkih in ugodnostih, rezerviranih za člane Prime.',

      termsConditions: 'Pogoji in določila programa Prime',
    },
  },
};

export default sl;