import type { TranslationKeys } from '../types';
import { createSharedTranslations } from '../shared';

/**
 * Serbian translations for Serbia (RS)
 * Srpski - Srbija
 */
const sr: TranslationKeys = {
  ...createSharedTranslations('sr'),
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
    totalBalance: 'Укупно стање',
    totalAvailable: 'Укупно доступно',

    period: {
      thisMonth: 'Овај месец',
      lastMonth: 'Прошли месец',
      vsLastMonth: 'у односу на прошли месец',
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
      settings: 'Podesavanja',
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
      bookAppointment: 'Закажи састанак',
      requestCall: 'Затражи позив',
      availability: 'Доступан у интервалу 08-18, од понедељка до петка',
    },
    
    benefits: {
      pageTitle: 'Prime погодности',
      introText: 'Prime by UniCredit Bank вам доноси посвећеног личног саветника, понуде скројене по мери и ексклузивне погодности — банкарство осмишљено потпуно око вас.',

      benefit1Title: 'ВАШ ЛИЧНИ САВЕТНИК',
      benefit1Description: 'Један саветник који вас познаје, увек спреман да помогне са сваким банкарским захтевом.',

      benefit2Title: 'ПОНУДЕ ПО МЕРИ',
      benefit2Description: 'Састаните се лично са саветником и откријте производе и понуде одабране посебно за вас.',

      benefit3Title: 'ПРИОРИТЕТНА УСЛУГА',
      benefit3Description: 'Прескочите ред уз приоритетну подршку кад год вам затреба, у филијали или телефоном.',

      benefit4Title: 'ЕКСКЛУЗИВНЕ ПОГОДНОСТИ',
      benefit4Description: 'Уживајте у повољнијим каматама, посебним догађајима и погодностима резервисаним за Prime чланове.',

      termsConditions: 'Услови и одредбе Prime програма',
    },
  },
};

export default sr;