import type { TranslationKeys } from '../types';
import { createSharedTranslations } from '../shared';

/**
 * Romanian translations for Romania (RO)
 * Română - România
 */
const ro: TranslationKeys = {
  ...createSharedTranslations('ro'),
// ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: 'Bine ai venit!',
    accounts: 'CONTURI',
    openAccountDescription: 'Deschide un cont',
    selectYourAccount: 'SELECTEAZĂ CONTUL TĂU',
    activateApplication: 'Activează aplicația',
    contacts: 'CONTACTE',
    mtoken: 'MTOKEN',
    other: 'ALTELE',
  },

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: 'Aspect nou,\\n& mai multe servicii.',
    subtitle: 'Toate serviciile bancare în buzunar!',
    loginButton: 'Autentificare',
    contacts: 'CONTACTE',
    mtoken: 'MTOKEN',
    other: 'ALTELE',
  },

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: 'Selectați limba',
    save: 'Salvează',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'DESPRE SMART BANKING',
    exchangeRates: 'CURSURI VALUȚARE',
    findAtmBranches: 'GĂSIȚI ATM & SUCURSALE',
    // NO startCoAppingSession - Romania doesn't have Co-Apping
  },

  // NO coApping - Romania doesn't have this feature

  // ==========================================
  // PRODUCTS (for ProductAccordion)
  // ==========================================
  products: {
    findOutMore: 'Aplică 100% Online',
    account: {
      title: 'Vrei să devii client?',
      description: 'Pentru că știm cât de important este timpul, obține conturile tale curente în LEI și/sau Euro cu card de debit și Mobile Banking atașat.',
    },
    loans: {
      title: 'Împrumuturi',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  },

  // ==========================================
  // HOMEPAGE - BOTTOM NAVIGATION
  // ==========================================
  navigation: {
    home: 'Acasă',
    analytics: 'Cheltuieli',
    payments: 'Plăți',
    products: 'Oferte',
    more: 'Mai mult',
  },

  // ==========================================
  // HOME SCREEN
  // ==========================================
  home: {
    totalBalance: 'Sold total',
    totalAvailable: 'Total disponibil',

    period: {
      thisMonth: 'Luna aceasta',
      lastMonth: 'Luna trecută',
      vsLastMonth: 'vs luna trecută',
    },
  },

  // ==========================================
  // MORE SCREEN
  // ==========================================
  more: {
    title: 'Mai multe',
    cards: {
      contacts: 'Contacte',
      documents: 'Documente',
      settings: 'Setari',
      gdprConsent: 'Consimtamant GDPR',
      thirdPartyConsent: 'Consimtamant catre terti',
      digitalActivities: 'Registru de activitate digitala',
      myRequests: 'Cererile mele',
      tutorial: 'Tutoriale',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'CONSULTANTUL TĂU',
    tabYourBenefits: 'BENEFICIILE TALE',
    
    advisor: {
      introText: 'Ai nevoie de suport personalizat? Consultantul tău bancar este la un apel distanță, gata să te asiste cu orice solicitare, oricând!',
      yourAdvisor: 'CONSULTANTUL TĂU',
      name: 'David Novak',
      phoneNumber: 'NUMĂR DE TELEFON',
      phone: '+40 602 123 456',
      email: 'E-MAIL',
      emailAddress: 'david.novak@unicredit.ro',
      branchName: 'NUME SUCURSALĂ',
      branch: 'Sucursala 36',
      branchAddress: 'ADRESĂ SUCURSALĂ',
      address: 'Str. Exemplu 1525/1, 140 92, București 4',
      callNow: 'Sună acum',
      sendEmail: 'Trimite un email',
      availability: 'Disponibil în intervalul 08-18, de luni până vineri',
    },
    
    benefits: {
      pageTitle: 'Beneficii Prime',
      introText: 'Bucură-te de Prime by UniCredit Bank și obține un consultant personal dedicat care îți oferă oferte personalizate și suport, făcând experiența ta bancară cu adevărat personalizată.',
      
      benefit1Title: 'CONSULTANT PERSONAL',
      benefit1Description: 'Ai un consultant dedicat disponibil pentru toate solicitările tale bancare',
      
      benefit2Title: 'OBȚINE OFERTE PERSONALIZATE',
      benefit2Description: 'Întâlnește-ți consultantul personal și verifică produsele noi pentru tine',
      
      benefit3Title: 'BENEFICIU NR 3',
      benefit3Description: 'Întâlnește-ți consultantul personal și verifică produsele noi pentru tine',
      
      benefit4Title: 'BENEFICIU NR 4',
      benefit4Description: 'Întâlnește-ți consultantul personal și verifică produsele noi pentru tine',
      
      termsConditions: 'Termeni și condiții program PRIME',
    },
  },
};

export default ro;