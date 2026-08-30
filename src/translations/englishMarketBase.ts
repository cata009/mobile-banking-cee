import { createSharedTranslations } from './shared'
import type { TranslationKeys } from './types'

type MarketEnglishConfig = {
  panel: TranslationKeys['panel']
  products: NonNullable<TranslationKeys['products']>
  moreCards: TranslationKeys['more']['cards']
  advisor: Partial<TranslationKeys['prime']['advisor']> &
    Pick<TranslationKeys['prime']['advisor'], 'phone' | 'emailAddress' | 'address'>
  coApping?: TranslationKeys['coApping']
}

const PRE_LOGIN: TranslationKeys['preLogin'] = {
  welcome: 'Welcome!',
  accounts: 'ACCOUNTS',
  openAccountDescription: 'Open an account',
  selectYourAccount: 'SELECT YOUR ACCOUNT',
  activateApplication: 'Activate application',
  contacts: 'CONTACTS',
  mtoken: 'MTOKEN',
  other: 'OTHER',
}

const PRE_LOGIN_ACTIVE: TranslationKeys['preLoginActive'] = {
  title: 'New look,\n& more services.',
  subtitle: 'All bank services in your pocket!',
  loginButton: 'Log in',
  contacts: 'CONTACTS',
  mtoken: 'MTOKEN',
  other: 'OTHER',
}

export const ENGLISH_CO_APPING: NonNullable<TranslationKeys['coApping']> = {
  startCoApping: 'Start Co-Apping',
  enterCode: 'Enter code',
  enterCodeDescription: 'Please enter the 6-digit code provided by your banker to start the co-apping session.',
  codePlaceholder: 'Enter 6-digit code',
  startSession: 'Start Session',
  cancel: 'Cancel',
  coAppingSession: 'Co-apping session',
  coAppingDescription:
    "You are about to have a co-apping session with your banker, where you'll share your mobile screen for assistance in completing your banking needs.",
  coAppingInstruction:
    'To start the process, please enter the code provided by your banker over the phone and click continue.',
  coAppingCodePlaceholder: 'Enter the code from banker',
  coAppingPrivacy: 'Rest assured, your essential data will be protected and will not be shared with the banker',
  continue: 'Continue',
  sessionActive: 'Session Active',
  screenSharing: 'Screen sharing with banker',
  endSession: 'End Session',
  endSessionConfirm: 'Are you sure you want to end the co-apping session?',
  yes: 'Yes',
  no: 'No',
}

export const STANDARD_ENGLISH_PRODUCTS: NonNullable<TranslationKeys['products']> = {
  findOutMore: 'FIND OUT MORE',
  account: {
    title: 'Open an account',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  loans: {
    title: 'Loans',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
}

export const STANDARD_ENGLISH_MORE_CARDS: TranslationKeys['more']['cards'] = {
  contacts: 'Contacts',
  documents: 'Documents',
  settings: 'Settings',
  gdprConsent: 'GDPR Consent',
  thirdPartyConsent: 'Consent to third parties',
  digitalActivities: 'Digital activity record',
  myRequests: 'My applications',
  tutorial: 'Tutorials',
}

export const STANDARD_ENGLISH_PANEL: TranslationKeys['panel'] = {
  aboutSmartBanking: 'ABOUT SMART BANKING',
  exchangeRates: 'EXCHANGE RATES',
  findAtmBranches: 'FIND ATM & BRANCHES',
}

const PRIME_BENEFITS: TranslationKeys['prime']['benefits'] = {
  pageTitle: 'Prime benefits',
  introText:
    'Enjoy our Prime by UniCredit Bank and get a dedicated personal advisor who provides tailored offers and support making your banking experience truly personalized.',
  benefit1Title: 'PERSONAL ADVISOR',
  benefit1Description: 'Have a dedicated avisor available for all your banking requests',
  benefit2Title: 'GET TAYLOR MADE OFFERS',
  benefit2Description: 'Meet your advisor in person and check new products for you',
  benefit3Title: 'BENEFIT NR 3',
  benefit3Description: 'Meet your advisor in person and check new products for you',
  benefit4Title: 'BENEFIT NR 4',
  benefit4Description: 'Meet your advisor in person and check new products for you',
  termsConditions: 'Term conditions of PRIME PROGRAM',
}

export function createMarketEnglishTranslations({
  panel,
  products,
  moreCards,
  advisor,
  coApping,
}: MarketEnglishConfig): TranslationKeys {
  return {
    ...createSharedTranslations('en'),
    preLogin: PRE_LOGIN,
    preLoginActive: PRE_LOGIN_ACTIVE,
    languageSelector: {
      selectLanguage: 'Select language',
      save: 'Save',
    },
    panel,
    ...(coApping ? { coApping } : {}),
    products,
    navigation: {
      home: 'Home',
      analytics: 'Spending',
      payments: 'Payments',
      products: 'Products',
      more: 'More',
    },
    home: {
      totalBalance: 'Total balance',
      totalAvailable: 'Total available',
      period: {
        thisMonth: 'This month',
        lastMonth: 'Last month',
        vsLastMonth: 'vs last month',
      },
    },
    more: {
      title: 'More',
      cards: moreCards,
    },
    prime: {
      pageTitle: 'Prime by UniCredit Bank',
      tabYourAdvisor: 'YOUR ADVISOR',
      tabYourBenefits: 'YOUR BENEFITS',
      advisor: {
        introText:
          'Need personalized support? Your bank advisor is just a call away, ready to assist you with any request, anytime!',
        yourAdvisor: 'YOUR ADVISOR',
        name: 'David Novak',
        phoneNumber: 'PHONE NUMBER',
        email: 'E-MAIL',
        branchName: 'BRANCH NAME',
        branch: 'Branch name 36',
        branchAddress: 'BRANCH ADDRESS',
        callNow: 'Call now',
        sendEmail: 'Send an email',
        availability: 'Available during interval 08-18, from Monday to Friday',
        ...advisor,
      },
      benefits: PRIME_BENEFITS,
    },
  }
}
