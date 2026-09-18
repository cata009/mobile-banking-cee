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
      bookAppointment: 'Időpontfoglalás',
      requestCall: 'Visszahívás kérése',
      availability: 'Elérhető 08-18 között, hétfőtől péntekig',
    },
    
    benefits: {
      pageTitle: 'Prime előnyök',
      introText: 'A Prime by UniCredit Bank dedikált személyes tanácsadót, személyre szabott ajánlatokat és exkluzív előnyöket kínál Önnek — banki élmény, amely teljesen Ön köré épül.',

      benefit1Title: 'AZ ÖN SZEMÉLYES TANÁCSADÓJA',
      benefit1Description: 'Egyetlen tanácsadó, aki ismeri Önt, és mindig készen áll segíteni bármilyen banki ügyben.',

      benefit2Title: 'SZEMÉLYRE SZABOTT AJÁNLATOK',
      benefit2Description: 'Találkozzon személyesen tanácsadójával, és fedezze fel az Önnek válogatott termékeket és ajánlatokat.',

      benefit3Title: 'ELSŐBBSÉGI KISZOLGÁLÁS',
      benefit3Description: 'Kerülje el a sorban állást elsőbbségi ügyintézéssel, bármikor van rá szüksége — fiókban vagy telefonon.',

      benefit4Title: 'KIZÁRÓLAGOS ELŐNYÖK',
      benefit4Description: 'Élvezze a kedvezményes kamatokat, különleges eseményeket és a Prime tagoknak fenntartott előnyöket.',

      termsConditions: 'A Prime program általános szerződési feltételei',
    },
  },
};

export default hu;