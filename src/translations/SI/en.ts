import type { TranslationKeys } from '../types';

/**
 * English translations for Slovenia (SI)
 * NOTE: English text may vary between countries based on local preferences
 */
const en: TranslationKeys = {
  // ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: 'Welcome!',
    accounts: 'ACCOUNTS',
    openAccountDescription: 'Open an account',
    selectYourAccount: 'SELECT YOUR ACCOUNT',
    activateApplication: 'Activate application',
    contacts: 'CONTACTS',
    mtoken: 'MTOKEN',
    other: 'OTHER',
  },

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: 'New look,\n& more services.',
    subtitle: 'All bank services in your pocket!',
    loginButton: 'Log in',
    contacts: 'CONTACTS',
    mtoken: 'MTOKEN',
    other: 'OTHER',
  },

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: 'Select language',
    save: 'Save',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'ABOUT SMART BANKING',
    exchangeRates: 'EXCHANGE RATES',
    findAtmBranches: 'FIND ATM & BRANCHES',
    // NO startCoAppingSession - Slovenia doesn't have Co-Apping
  },

  // NO coApping - Slovenia doesn't have this feature

  // ==========================================
  // PRODUCTS (for ProductAccordion)
  // ==========================================
  products: {
    findOutMore: 'FIND OUT MORE',
    account: {
      title: 'Open an account',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    loans: {
      title: 'Loans',
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
    totalBalance: 'Total balance',
    totalAvailable: 'Total available',

    period: {
      thisMonth: 'This month',
      lastMonth: 'Last month',
      vsLastMonth: 'vs last month',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'YOUR ADVISOR',
    tabYourBenefits: 'YOUR BENEFITS',
    
    advisor: {
      introText: 'Need personalized support? Your bank advisor is just a call away, ready to assist you with any request, anytime!',
      yourAdvisor: 'YOUR ADVISOR',
      name: 'David Novak',
      phoneNumber: 'PHONE NUMBER',
      phone: '+386 602 123 456',
      email: 'E-MAIL',
      emailAddress: 'david.novak@unicreditbank.si',
      branchName: 'BRANCH NAME',
      branch: 'Branch name 36',
      branchAddress: 'BRANCH ADDRESS',
      address: 'Želetavská 1525/1, 140 92, Ljubljana 4',
      callNow: 'Call now',
      sendEmail: 'Send an email',
      availability: 'Available during interval 08-18, from Monday to Friday',
    },
    
    benefits: {
      pageTitle: 'Prime benefits',
      introText: 'Enjoy our Prime by UniCredit Bank and get a dedicated personal advisor who provides tailored offers and support making your banking experience truly personalized.',
      
      benefit1Title: 'PERSONAL ADVISOR',
      benefit1Description: 'Have a dedicated avisor available for all your banking requests',
      
      benefit2Title: 'GET TAYLOR MADE OFFERS',
      benefit2Description: 'Meet your advisor in person and check new products for you',
      
      benefit3Title: 'BENEFIT NR 3',
      benefit3Description: 'Meet your advisor in person and check new products for you',
      
      benefit4Title: 'BENEFIT NR 4',
      benefit4Description: 'Meet your advisor in person and check new products for you',
      
      termsConditions: 'Term conditions of PRIME PROGRAM',
    },
  },
};

export default en;