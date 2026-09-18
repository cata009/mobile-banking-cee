import type { TranslationKeys } from '../types';
import { createSharedTranslations } from '../shared';

/**
 * Slovak translations for Slovakia (SK)
 * Slovenčina - Slovensko
 */
const sk: TranslationKeys = {
  ...createSharedTranslations('sk'),
// ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: 'Vitajte!',
    accounts: 'ÚČTY',
    openAccountDescription: 'Otvoriť účet',
    selectYourAccount: 'VYBERTE SI SVOJ ÚČET',
    activateApplication: 'Aktivovať aplikáciu',
    contacts: 'KONTAKTY',
    mtoken: 'MTOKEN',
    other: 'INÉ',
  },

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: 'Nový vzhľad,\\n& viac služieb.',
    subtitle: 'Všetky bankové služby vo vrecku!',
    loginButton: 'Prihlásiť sa',
    contacts: 'KONTAKTY',
    mtoken: 'MTOKEN',
    other: 'INÉ',
  },

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: 'Vyberte jazyk',
    save: 'Uložiť',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'O SMART BANKINGU',
    exchangeRates: 'KURZOVÝ LÍSTOK',
    findAtmBranches: 'NÁJDI ATM & POBOČKY',
    startCoAppingSession: 'SPUSTIŤ CO-APPING RELÁCIU',
  },

  // ==========================================
  // CO-APPING (SK has this feature)
  // ==========================================
  coApping: {
    startCoApping: 'Spustiť Co-Apping',
    enterCode: 'Zadajte kód',
    enterCodeDescription: 'Zadajte prosím 6-miestny kód poskytnutý vaším bankárom na spustenie relácie co-apping.',
    codePlaceholder: 'Zadajte 6-miestny kód',
    startSession: 'Spustiť reláciu',
    cancel: 'Zrušiť',

    coAppingSession: 'Co-apping relácia',
    coAppingDescription: 'Chystáte sa mať co-apping reláciu so svojím bankárom, kde budete zdieľať obrazovku svojho mobilného telefónu pre pomoc pri dokončení vašich bankových potrieb.',
    coAppingInstruction: 'Na spustenie procesu zadajte prosím kód poskytnutý vaším bankárom po telefóne a kliknite na pokračovať.',
    coAppingCodePlaceholder: 'Zadajte kód od bankára',
    coAppingPrivacy: 'Buďte uistení, že vaše základné údaje budú chránené a nebudú zdieľané s bankárom',
    continue: 'Pokračovať',

    sessionActive: 'Aktívna relácia',
    screenSharing: 'Zdieľanie obrazovky s bankárom',
    endSession: 'Ukončiť reláciu',
    endSessionConfirm: 'Naozaj chcete ukončiť reláciu co-apping?',
    yes: 'Áno',
    no: 'Nie',
  },

  // ==========================================
  // PRODUCTS (for ProductAccordion)
  // ==========================================
  products: {
    findOutMore: 'ZISTIŤ VIAC',
    account: {
      title: 'Účty',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    loans: {
      title: 'Pôžičky',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  },

  // ==========================================
  // HOMEPAGE - BOTTOM NAVIGATION
  // ==========================================
  navigation: {
    home: 'Domov',
    analytics: 'Výdavky',
    payments: 'Platby',
    products: 'Ponuky',
    more: 'Viac',
  },

  // ==========================================
  // HOME SCREEN
  // ==========================================
  home: {
    totalBalance: 'Celkový zostatok',
    totalAvailable: 'Celkom k dispozícii',

    period: {
      thisMonth: 'Tento mesiac',
      lastMonth: 'Minulý mesiac',
      vsLastMonth: 'vs minulý mesiac',
    },
  },

  // ==========================================
  // MORE SCREEN
  // ==========================================
  more: {
    title: 'Viac',
    cards: {
      contacts: 'Kontakty',
      documents: 'Dokumenty',
      settings: 'Nastavenia',
      gdprConsent: 'Suhlas GDPR',
      thirdPartyConsent: 'Suhlas s tretimi stranami',
      digitalActivities: 'Zaznam digitalnej aktivity',
      myRequests: 'Moje ziadosti',
      tutorial: 'Navody',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'VÁŠ PORADCA',
    tabYourBenefits: 'VAŠE VÝHODY',
    
    advisor: {
      introText: 'Potrebujete personalizovanú podporu? Váš bankár je len telefonát ďaleko, pripravený vám pomôcť s akýmkoľvek požiadavkou, kedykoľvek!',
      yourAdvisor: 'VÁŠ PORADCA',
      name: 'David Novák',
      phoneNumber: 'TELEFÓNNE ČÍSLO',
      phone: '+421 602 123 456',
      email: 'E-MAIL',
      emailAddress: 'david.novak@unicredit.sk',
      branchName: 'NÁZOV POBOČKY',
      branch: 'Pobočka 36',
      branchAddress: 'ADRESA POBOČKY',
      address: 'Želetavská 1525/1, 140 92, Bratislava 4',
      callNow: 'Zavolať teraz',
      sendEmail: 'Poslať email',
      bookAppointment: 'Rezervovať stretnutie',
      requestCall: 'Požiadať o zavolanie',
      availability: 'K dispozícii v intervale 08-18, od pondelka do piatku',
    },
    
    benefits: {
      pageTitle: 'Prime výhody',
      introText: 'Prime by UniCredit Bank vám prináša osobného poradcu na mieru, ponuky šité priamo pre vás a exkluzívne výhody — bankovníctvo postavené okolo vás.',

      benefit1Title: 'VÁŠ OSOBNÝ PORADCA',
      benefit1Description: 'Jeden poradca, ktorý vás pozná a je vždy pripravený pomôcť s akoukoľvek bankovou požiadavkou.',

      benefit2Title: 'PONUKY NA MIERU',
      benefit2Description: 'Stretnite sa osobne so svojím poradcom a objavte produkty a ponuky vybrané práve pre vás.',

      benefit3Title: 'PRIORITNÝ SERVIS',
      benefit3Description: 'Preskočte rad vďaka prioritnej podpore, kedykoľvek ju potrebujete – na pobočke aj telefonicky.',

      benefit4Title: 'EXKLUZÍVNE VÝHODY',
      benefit4Description: 'Užívajte si zvýhodnené sadzby, špeciálne akcie a výhody vyhradené členom Prime.',

      termsConditions: 'Zmluvné podmienky programu Prime',
    },
  },
};

export default sk;