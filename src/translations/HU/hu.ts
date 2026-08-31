import type { TranslationKeys } from '../types';
import { createSharedTranslations } from '../shared';

/**
 * Hungarian translations for Hungary (HU)
 * Magyar - Magyarország
 */
const hu: TranslationKeys = {
  ...createSharedTranslations('hu'),
// ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: 'Üdvözöljük!',
    accounts: 'SZÁMLÁK',
    openAccountDescription: 'Számlanyitás',
    selectYourAccount: 'VÁLASSZA KI SZÁMLÁJÁT',
    activateApplication: 'Alkalmazás aktiválása',
    contacts: 'KAPCSOLATOK',
    mtoken: 'MTOKEN',
    other: 'EGYÉB',
  },

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: 'Új megjelenés,\n& több szolgáltatás.',
    subtitle: 'Minden banki szolgáltatás a zsebében!',
    loginButton: 'Bejelentkezés',
    contacts: 'KAPCSOLATOK',
    mtoken: 'MTOKEN',
    other: 'EGYÉB',
  },

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: 'Válasszon nyelvet',
    save: 'Mentés',
  },

  // ==========================================
  // PANEL MENU
  // ==========================================
  panel: {
    aboutSmartBanking: 'A SMART BANKINGRÓL',
    exchangeRates: 'ÁRFOLYAMOK',
    findAtmBranches: 'ATM & FIÓK KERESÉSE',
    // NO startCoAppingSession - Hungary doesn't have Co-Apping
  },

  // NO coApping - Hungary doesn't have this feature

  // ==========================================
  // PRODUCTS (for ProductAccordion)
  // ==========================================
  products: {
    findOutMore: 'TUDJON MEG TÖBBET',
    account: {
      title: 'Számlanyitás',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    loans: {
      title: 'Hitelkérelem',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
  },

  // ==========================================
  // HOMEPAGE - BOTTOM NAVIGATION
  // ==========================================
  navigation: {
    home: 'Kezdőlap',
    analytics: 'Költések',
    payments: 'Fizetések',
    products: 'Ajánlatok',
    more: 'Több',
  },

  // ==========================================
  // HOME SCREEN
  // ==========================================
  home: {
    totalBalance: 'Teljes egyenleg',
    totalAvailable: 'Összesen elérhető',

    period: {
      thisMonth: 'Ez a hónap',
      lastMonth: 'Múlt hónap',
      vsLastMonth: 'vs múlt hónap',
    },
  },

  // ==========================================
  // MORE SCREEN
  // ==========================================
  more: {
    title: 'Tovabbiak',
    cards: {
      contacts: 'Kapcsolat',
      documents: 'Dokumentumok',
      settings: 'beallitasok',
      gdprConsent: 'GDPR hozzajarulas',
      thirdPartyConsent: 'Hozzajarulasok harmadik felekhez',
      digitalActivities: 'Digitalis tevekenysegi naplo',
      myRequests: 'Termek igenylesek es lemondasok',
      tutorial: 'Utmutatok',
    },
  },

  // ==========================================
  // PRIME
  // ==========================================
  prime: {
    pageTitle: 'Prime by UniCredit Bank',
    
    tabYourAdvisor: 'TANÁCSADÓD',
    tabYourBenefits: 'ELŐNYEID',
    
    advisor: {
      introText: 'Személyre szabott támogatásra van szükséged? Banki tanácsadód csak egy telefonhívásnyira van, készen áll, hogy segítsen bármilyen kéréssel, bármikor!',
      yourAdvisor: 'TANÁCSADÓD',
      name: 'David Novák',
      phoneNumber: 'TELEFONSZÁM',
      phone: '+36 602 123 456',
      email: 'E-MAIL',
      emailAddress: 'david.novak@unicredit.hu',
      branchName: 'FIÓK NEVE',
      branch: 'Fiók 36',
      branchAddress: 'FIÓK CÍME',
      address: 'Želetavská 1525/1, 140 92, Budapest 4',
      callNow: 'Hívás most',
      sendEmail: 'E-mail küldése',
      availability: 'Elérhető 08-18 között, hétfőtől péntekig',
    },
    
    benefits: {
      pageTitle: 'Prime előnyök',
      introText: 'Élvezze Prime by UniCredit Bank szolgáltatásunkat és kapjon dedikált személyes tanácsadót, aki testreszabott ajánlatokat és támogatást nyújt, így banki élménye valóban személyre szabott.',
      
      benefit1Title: 'SZEMÉLYES TANÁCSADÓ',
      benefit1Description: 'Legyen dedikált tanácsadója elérhető minden banki kéréséhez',
      
      benefit2Title: 'KAPJON TESTRESZABOTT AJÁNLATOKAT',
      benefit2Description: 'Találkozzon személyesen tanácsadójával és nézze meg az új termékeket',
      
      benefit3Title: '3. ELŐNY',
      benefit3Description: 'Találkozzon személyesen tanácsadójával és nézze meg az új termékeket',
      
      benefit4Title: '4. ELŐNY',
      benefit4Description: 'Találkozzon személyesen tanácsadójával és nézze meg az új termékeket',
      
      termsConditions: 'PRIME PROGRAM feltételei',
    },
  },
};

export default hu;