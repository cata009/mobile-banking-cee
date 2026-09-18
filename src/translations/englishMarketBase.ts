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
    'Prime by UniCredit Bank brings you a dedicated personal advisor, tailor-made offers and exclusive privileges — banking designed entirely around you.',
  benefit1Title: 'YOUR PERSONAL ADVISOR',
  benefit1Description: 'One advisor who knows you, ready to help with every banking request — anytime.',
  benefit2Title: 'TAILOR-MADE OFFERS',
  benefit2Description: 'Meet your advisor in person and discover products and offers picked just for you.',
  benefit3Title: 'PRIORITY SERVICE',
  benefit3Description: 'Skip the queue with priority support whenever you need us, in branch or by phone.',
  benefit4Title: 'EXCLUSIVE PRIVILEGES',
  benefit4Description: 'Enjoy preferential rates, special events and privileges reserved for Prime members.',
  termsConditions: 'Prime program terms and conditions',
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
      products: 'Offers',
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
        bookAppointment: 'Book an appointment',
        requestCall: 'Request a call',
        availability: 'Available during interval 08-18, from Monday to Friday',
        ...advisor,
      },
      benefits: PRIME_BENEFITS,
    },
  }
}
