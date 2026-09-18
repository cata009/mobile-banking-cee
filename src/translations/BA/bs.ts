import type { TranslationKeys } from '../types';
import { createSharedTranslations } from '../shared';

/**
 * Bosnian translations for Bosnia and Herzegovina (BA)
 * Bosanski - Bosna i Hercegovina
 */
const bs: TranslationKeys = {
  ...createSharedTranslations('bs'),
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
    home: 'Početna',
    analytics: 'Potrošnja',
    payments: 'Plaćanja',
    products: 'Ponude',
    more: 'Više',
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
  // MORE SCREEN
  // ==========================================
  more: {
    title: 'Vise',
    cards: {
      contacts: 'Kontakti',
      documents: 'Dokumenti',
      settings: 'Postavke',
      gdprConsent: 'GDPR saglasnost',
      thirdPartyConsent: 'Saglasnost za trece strane',
      digitalActivities: 'Zapis digitalnih aktivnosti',
      myRequests: 'Moje prijave',
      tutorial: 'Tutorijali',
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
      bookAppointment: 'Zakaži sastanak',
      requestCall: 'Zatraži poziv',
      availability: 'Dostupan u intervalu 08-18, od ponedjeljka do petka',
    },
    
    benefits: {
      pageTitle: 'Prime pogodnosti',
      introText: 'Prime by UniCredit Bank donosi vam posvećenog ličnog savjetnika, ponude krojene po mjeri i ekskluzivne pogodnosti — bankarstvo osmišljeno potpuno oko vas.',

      benefit1Title: 'VAŠ LIČNI SAVJETNIK',
      benefit1Description: 'Jedan savjetnik koji vas poznaje, uvijek spreman pomoći sa svakim bankarskim zahtjevom.',

      benefit2Title: 'PONUDE PO MJERI',
      benefit2Description: 'Sastanite se lično sa savjetnikom i otkrijte proizvode i ponude odabrane posebno za vas.',

      benefit3Title: 'PRIORITETNA USLUGA',
      benefit3Description: 'Preskočite red uz prioritetnu podršku kad god vam zatreba, u poslovnici ili telefonom.',

      benefit4Title: 'EKSKLUZIVNE POGODNOSTI',
      benefit4Description: 'Uživajte u povoljnijim kamatama, posebnim događajima i pogodnostima rezervisanim za Prime članove.',

      termsConditions: 'Uslovi i odredbe Prime programa',
    },
  },
};

export default bs;