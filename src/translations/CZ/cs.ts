import type { TranslationKeys } from '../types';
import { createSharedTranslations } from '../shared';

/**
 * Czech translations for Czech Republic (CZ)
 * Čeština - Česká republika
 */
const cs: TranslationKeys = {
  ...createSharedTranslations('cs'),
// ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: 'Vítejte!',
    accounts: 'ÚČTY',
    openAccountDescription: 'Otevřít účet',
    selectYourAccount: 'VYBERTE SI SVŮJ ÚČET',
    activateApplication: 'Aktivovat aplikaci',
    contacts: 'KONTAKTY',
    mtoken: 'MTOKEN',
    other: 'JINÉ',
  },

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: 'Nový vzhled,\\n& více služeb.',
    subtitle: 'Všechny bankovní služby v kapse!',
    loginButton: 'Přihlásit se',
    contacts: 'KONTAKTY',
    mtoken: 'MTOKEN',
    other: 'JINÉ',
  },

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: 'Vyberte jazyk',
    save: 'Uložit',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'O SMART BANKINGU',
    exchangeRates: 'SMĚNNÉ KURZY',
    findAtmBranches: 'NAJÍT BANKOMAT & POBOČKY',
    startCoAppingSession: 'ZAHÁJIT CO-APPING RELACI',
  },

  // ==========================================
  // CO-APPING (CZ has this feature)
  // ==========================================
  coApping: {
    startCoApping: 'Zahájit Co-Apping',
    enterCode: 'Zadejte kód',
    enterCodeDescription: 'Zadejte prosím 6místný kód poskytnutý vaším bankéřem pro zahájení relace co-apping.',
    codePlaceholder: 'Zadejte 6místný kód',
    startSession: 'Zahájit relaci',
    cancel: 'Zrušit',

    coAppingSession: 'Co-apping relace',
    coAppingDescription: 'Chystáte se mít co-apping relaci se svým bankéřem, kde budete sdílet obrazovku svého mobilního telefonu pro pomoc při dokončení vašich bankovních potřeb.',
    coAppingInstruction: 'Chcete-li zahájit proces, zadejte prosím kód poskytnutý vaším bankéřem po telefonu a klikněte na pokračovat.',
    coAppingCodePlaceholder: 'Zadejte kód od bankéře',
    coAppingPrivacy: 'Buďte ujištěni, že vaše základní údaje budou chráněny a nebudou sdíleny s bankéřem',
    continue: 'Pokračovat',

    sessionActive: 'Aktivní relace',
    screenSharing: 'Sdílení obrazovky s bankéřem',
    endSession: 'Ukončit relaci',
    endSessionConfirm: 'Opravdu chcete ukončit relaci co-apping?',
    yes: 'Ano',
    no: 'Ne',
  },

  // ==========================================
  // PRODUCTS (for ProductAccordion)
  // ==========================================
  products: {
    findOutMore: 'ZJISTIT VÍCE',
    account: {
      title: 'Účty',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    loans: {
      title: 'Půjčky',
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
    totalBalance: 'Celkový zůstatek',
    totalAvailable: 'Celkem k dispozici',

    period: {
      thisMonth: 'Tento měsíc',
      lastMonth: 'Minulý měsíc',
      vsLastMonth: 'vs minulý měsíc',
    },
  },

  // ==========================================
  // MORE SCREEN
  // ==========================================
  more: {
    title: 'Vice',
    cards: {
      contacts: 'Kontakty',
      documents: 'Dokumenty',
      settings: 'Nastaveni',
      gdprConsent: 'Souhlas GDPR',
      thirdPartyConsent: 'Souhlas se tretimi stranami',
      digitalActivities: 'Zaznam digitalni aktivity',
      myRequests: 'Moje zadosti',
      tutorial: 'Navody',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'VÁŠ PORADCE',
    tabYourBenefits: 'VAŠE VÝHODY',
    
    advisor: {
      introText: 'Potřebujete personalizovanou podporu? Váš bankéř je jen telefonát daleko, připraven vám pomoci s jakýmkoli požadavkem, kdykoli!',
      yourAdvisor: 'VÁŠ PORADCE',
      name: 'David Novák',
      phoneNumber: 'TELEFONNÍ ČÍSLO',
      phone: '+420 602 123 456',
      email: 'E-MAIL',
      emailAddress: 'david.novak@unicredit.cz',
      branchName: 'NÁZEV POBOČKY',
      branch: 'Pobočka 36',
      branchAddress: 'ADRESA POBOČKY',
      address: 'Želetavská 1525/1, 140 92, Praha 4',
      callNow: 'Zavolat nyní',
      sendEmail: 'Poslat email',
      availability: 'K dispozici v intervalu 08-18, od pondělí do pátku',
    },
    
    benefits: {
      pageTitle: 'Prime výhody',
      introText: 'Užijte si naše Prime by UniCredit Bank a získejte specializovaného osobního poradce, který poskytuje nabídky šité na míru a podporu, díky níž je vaše bankovní zkušenost skutečně personalizovaná.',
      
      benefit1Title: 'OSOBNÍ PORADCE',
      benefit1Description: 'Mějte specializovaného poradce k dispozici pro všechny vaše bankovní požadavky',
      
      benefit2Title: 'ZÍSKEJTE NABÍDKY NA MÍRU',
      benefit2Description: 'Setkejte se osobně s vaším poradcem a prohlédněte si nové produkty pro vás',
      
      benefit3Title: 'VÝHODA Č. 3',
      benefit3Description: 'Setkejte se osobně s vaším poradcem a prohlédněte si nové produkty pro vás',
      
      benefit4Title: 'VÝHODA Č. 4',
      benefit4Description: 'Setkejte se osobně s vaším poradcem a prohlédněte si nové produkty pro vás',
      
      termsConditions: 'Smluvní podmínky programu PRIME',
    },
  },
};

export default cs;