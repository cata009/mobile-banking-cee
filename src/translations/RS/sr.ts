import type { TranslationKeys } from '../types';

/**
 * Serbian translations for Serbia (RS)
 * Srpski - Srbija
 */
const sr: TranslationKeys = {
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
    selectLanguage: 'Izaberite jezik',
    save: 'Sačuvaj',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'O SMART BANKINGU',
    exchangeRates: 'KURSNA LISTA',
    findAtmBranches: 'PRONAĐI BANKOMAT I FILIJALE',
    // NO startCoAppingSession - Serbia doesn't have Co-Apping
  },

  // NO coApping - Serbia doesn't have this feature

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
    totalBalance: 'Укупно стање',
    totalAvailable: 'Укупно доступно',

    period: {
      thisMonth: 'Овај месец',
      lastMonth: 'Прошли месец',
      vsLastMonth: 'у односу на прошли месец',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'ВАШ САВЕТНИК',
    tabYourBenefits: 'ВАШЕ ПОГОДНОСТИ',
    
    advisor: {
      introText: 'Потребна вам је персонализована подршка? Ваш банкарски саветник је само један позив даље, спреман да вам помогне са било којим захтевом, у било које време!',
      yourAdvisor: 'ВАШ САВЕТНИК',
      name: 'David Novak',
      phoneNumber: 'БРОЈ ТЕЛЕФОНА',
      phone: '+381 602 123 456',
      email: 'Е-МАИЛ',
      emailAddress: 'david.novak@unicredit.rs',
      branchName: 'НАЗИВ ФИЛИЈАЛЕ',
      branch: 'Филијала 36',
      branchAddress: 'АДРЕСА ФИЛИЈАЛЕ',
      address: 'Želetavská 1525/1, 140 92, Београд 4',
      callNow: 'Позови сада',
      sendEmail: 'Пошаљи имејл',
      availability: 'Доступан у интервалу 08-18, од понедељка до петка',
    },
    
    benefits: {
      pageTitle: 'Prime погодности',
      introText: 'Уживајте у нашем Prime by UniCredit Bank и добијте посвећеног личног саветника који пружа прилагођене понуде и подршку, чинећи ваше банкарско искуство заиста персонализованим.',
      
      benefit1Title: 'ЛИЧНИ САВЕТНИК',
      benefit1Description: 'Имајте посвећеног саветника доступног за све ваше банкарске захтеве',
      
      benefit2Title: 'ДОБИЈТЕ ПРИЛАГОЂЕНЕ ПОНУДЕ',
      benefit2Description: 'Састаните се лично са вашим саветником и проверите нове производе за вас',
      
      benefit3Title: 'ПОГОДНОСТ БР 3',
      benefit3Description: 'Састаните се лично са вашим саветником и проверите нове производе за вас',
      
      benefit4Title: 'ПОГОДНОСТ БР 4',
      benefit4Description: 'Састаните се лично са вашим саветником и проверите нове производе за вас',
      
      termsConditions: 'Услови коришћења PRIME програма',
    },
  },
};

export default sr;