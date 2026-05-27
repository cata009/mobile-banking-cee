/**
 * Type-safe Translation Keys Interface
 * Defines the structure for all translations across the application
 */

export interface TranslationKeys {
  // ==========================================
  // PRE-LOGIN SCREEN
  // ==========================================
  preLogin: {
    welcome: string;
    accounts: string;
    openAccountDescription: string;
    selectYourAccount: string;
    activateApplication: string;
    contacts: string;
    mtoken: string;
    other: string;
  };

  // ==========================================
  // PRE-LOGIN ACTIVE (Activated App)
  // ==========================================
  preLoginActive: {
    title: string; // "New look, & more services."
    subtitle: string; // "All bank services in your pocket!"
    loginButton: string; // "Log in"
    contacts: string;
    mtoken: string;
    other: string;
  };

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  languageSelector: {
    selectLanguage: string;
    save: string;
  };

  // ==========================================
  // PANEL MENU (Inactive App - Pre-Login Active)
  // ==========================================
  panel: {
    aboutSmartBanking: string;
    exchangeRates: string;
    findAtmBranches: string;
    startCoAppingSession?: string; // Optional - only CZ/SK
  };

  // ==========================================
  // CO-APPING (Only for CZ/SK)
  // ==========================================
  coApping?: {
    // Entry Screen
    startCoApping: string;
    enterCode: string;
    enterCodeDescription: string;
    codePlaceholder: string;
    startSession: string;
    cancel: string;

    // Co-Apping Session Screen
    coAppingSession: string;
    coAppingDescription: string;
    coAppingInstruction: string;
    coAppingCodePlaceholder: string;
    coAppingPrivacy: string;
    continue: string;

    // Active Session
    sessionActive: string;
    screenSharing: string;
    endSession: string;
    endSessionConfirm: string;
    yes: string;
    no: string;
  };

  // ==========================================
  // PRODUCT ACCORDION (Country-specific)
  // ==========================================
  products?: {
    findOutMore: string; // "FIND OUT MORE" button text
    account: {
      title: string;
      description: string;
    };
    loans: {
      title: string;
      description: string;
    };
  };

  // ==========================================
  // HOMEPAGE - BOTTOM NAVIGATION
  // ==========================================
  navigation: {
    home: string;
    analytics: string;
    payments: string;
    products: string;
    more: string;
  };

  // ==========================================
  // HOME SCREEN - ACCOUNT SUMMARY
  // ==========================================
  home: {
    totalBalance: string;
    totalAvailable: string;

    // Time Periods
    period: {
      thisMonth: string;
      lastMonth: string;
      vsLastMonth: string;
    };
  };

  // ==========================================
  // PRIME (All countries)
  // ==========================================
  prime: {
    // Header & Title
    pageTitle: string; // "Prime by UniCredit Bank"
    
    // Tabs
    tabYourAdvisor: string; // "YOUR ADVISOR"
    tabYourBenefits: string; // "YOUR BENEFITS"
    
    // Your Advisor Tab
    advisor: {
      introText: string; // "Need personalized support? Your bank advisor is just a call away..."
      yourAdvisor: string; // "YOUR ADVISOR"
      name: string; // "David Novak" (placeholder)
      phoneNumber: string; // "PHONE NUMBER"
      phone: string; // "+420 602 123 456" (placeholder)
      email: string; // "E-MAIL"
      emailAddress: string; // "david.novak@unicredit.cz" (placeholder)
      branchName: string; // "BRANCH NAME"
      branch: string; // "Branch name 36" (placeholder)
      branchAddress: string; // "BRANCH ADDRESS"
      address: string; // "Želetavská 1525/1, 140 92, Praha 4" (placeholder)
      callNow: string; // "Call now"
      sendEmail: string; // "Send an email"
      availability: string; // "Available during interval 08-18, from Monday to Friday"
    };
    
    // Your Benefits Tab
    benefits: {
      pageTitle: string; // "Prime benefits"
      introText: string; // "Enjoy our Prime by UniCredit Bank and get a dedicated personal advisor..."
      
      // Benefit Items
      benefit1Title: string; // "PERSONAL ADVISOR"
      benefit1Description: string; // "Have a dedicated avisor available for all your banking requests"
      
      benefit2Title: string; // "GET TAYLOR MADE OFFERS"
      benefit2Description: string; // "Meet your advisor in person and check new products for you"
      
      benefit3Title: string; // "BENEFIT NR 3"
      benefit3Description: string; // "Meet your advisor in person and check new products for you"
      
      benefit4Title: string; // "BENEFIT NR 4"
      benefit4Description: string; // "Meet your advisor in person and check new products for you"
      
      termsConditions: string; // "Term conditions of PRIME PROGRAM"
    };
  };
}

/**
 * Utility type for nested translation keys
 * Allows dot notation access: t('preLogin.welcome')
 */
export type TranslationKey = 
  | `preLogin.${keyof TranslationKeys['preLogin']}`
  | `preLoginActive.${keyof TranslationKeys['preLoginActive']}`
  | `languageSelector.${keyof TranslationKeys['languageSelector']}`
  | `panel.${keyof TranslationKeys['panel']}`
  | `navigation.${keyof TranslationKeys['navigation']}`
  | `home.${keyof TranslationKeys['home']}`
  | `home.period.${keyof TranslationKeys['home']['period']}`
  | (TranslationKeys['coApping'] extends undefined ? never : `coApping.${keyof NonNullable<TranslationKeys['coApping']>}`)
  | (TranslationKeys['products'] extends undefined ? never : `products.${keyof NonNullable<TranslationKeys['products']>}`)
  | (TranslationKeys['products'] extends undefined ? never : `products.account.${keyof NonNullable<TranslationKeys['products']>['account']}`)
  | (TranslationKeys['products'] extends undefined ? never : `products.loans.${keyof NonNullable<TranslationKeys['products']>['loans']}`)
  | (TranslationKeys['prime'] extends undefined ? never : `prime.${keyof NonNullable<TranslationKeys['prime']>}`)
  | (TranslationKeys['prime'] extends undefined ? never : `prime.advisor.${keyof NonNullable<TranslationKeys['prime']>['advisor']}`)
  | (TranslationKeys['prime'] extends undefined ? never : `prime.benefits.${keyof NonNullable<TranslationKeys['prime']>['benefits']}`);