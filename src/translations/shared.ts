import type { AppLanguage } from "@/app/registry/languageByCountry";
import type { TranslationKeys } from "./types";

type RuntimeTranslations = TranslationKeys["runtime"];
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K];
};

type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const EN_RUNTIME: RuntimeTranslations = {
  actions: {
    back: "Back",
    profile: "Profile",
    messages: "Messages",
    help: "Help",
    shareAccountDetails: "Share account details",
    moreActions: "More actions",
    showLess: "Show less",
    showMore: "Show more",
    next: "Next",
    sign: "Sign",
    okGotIt: "Ok, got it",
    search: "Search",
    filters: "Filters",
    cardTransaction: "Card Transaction",
  },
  accounts: {
    title: "Accounts",
    noTransactionsFound: "No transactions found",
    actions: {
      details: "Details",
      options: "Options",
      addMoney: "Add money",
      mCash: "mCash",
    },
    detailsInfo: {
      title: "Account Details",
      accountNumber: "Account number",
      availableFunds: "Available funds",
      currentBalance: "Current balance",
      blockedReservedAmount: "Blocked/reserved amount",
      overdraft: "Overdraft",
      accountTitle: "Account title",
      offer: "Offer",
      offerValue: "Account under favorable conditions",
      connectedCards: "Connected cards",
      mastercardStandardDebit: "Mastercard Standard Debit",
    },
    productTitles: {
      currentAccount: "CURRENT ACCOUNT",
      debitCard: "DEBIT CARD",
      creditCard: "CREDIT CARD",
      savingAccount: "SAVING ACCOUNT",
      termDeposit: "TERM DEPOSIT",
      loan: "LOAN",
      mortgage: "MORTGAGE",
      investmentAccount: "INVESTMENT ACCOUNT",
    },
  },
  analytics: {
    title: "My Spendings",
    dataFor: "Data For",
    yearTotal: "Year total",
    inflow: "Inflow",
    outflow: "Outflow",
    incomes: "Incomes",
    spendings: "Spendings",
    moneyOut: "Money out",
    moneyIn: "Money in",
    noTransactionsForPeriod: "No transactions for this period",
    categories: {
      Finance: "FINANCIAL",
      Shopping: "SHOPPING",
      Healthcare: "HEALTH & BEAUTY",
      Uncategorized: "UNCATEGORIZED EXPENSES",
      Home: "HOUSEHOLD",
      Groceries: "GROCERIES",
      Transportation: "CARS & TRANSPORTATION",
      "Leisure time": "LEISURE",
      "Taxes and Penalties": "TAXES & FINES",
      Income: "INCOME",
      Utilities: "UTILITIES",
      Insurance: "INSURANCE",
      Education: "SCHOOL & EDUCATION",
      Children: "CHILDREN",
      Wallet: "WALLET",
      Transfers: "TRANSFERS",
      Investments: "INVESTMENTS",
      ATM: "ATM",
      FX: "EXCHANGE",
      "Exclude from budget": "EXCLUDED",
    },
  },
  payments: {
    title: "Payments",
    other: "OTHER",
    primaryItems: {
      "new-payment": {
        title: "New payment",
        description: "Start a transfer, pay an invoice, or create a new payment order.",
      },
      "between-accounts": {
        title: "Between my accounts",
        description: "Move money between your current, savings, or card accounts.",
      },
      "recurrent-payments": {
        title: "Recurrent payments",
        description: "Set up and manage regular payments for everyday obligations.",
      },
      "scan-pay": {
        title: "Scan & pay",
        description: "Scan a QR code or payment slip and fill details automatically.",
      },
    },
    otherItems: {
      "create-qr-code": "CREATE QR\nCODE",
      templates: "TEMPLATES",
      "card-repayment": "CARD\nREPAYMENT",
      "exchange-rates": "EXCHANGE\nRATES",
    },
    newPayment: {
      title: "New payment",
      actions: {
        "domestic-payment": {
          title: "DOMESTIC PAYMENT",
          description: "Send payment in local currency",
        },
        "foreign-payment": {
          title: "FOREIGN PAYMENT",
          description: "Send foreign or SEPA payment",
        },
        "templates-beneficiaries": {
          title: "TEMPLATES AND BENEFICIARIES",
          description: "Reuse details from a payment you made in the past",
        },
      },
      infoBanner: {
        title: "Discover how to pay easier",
        description: "Does the invoice have a QR code or postal order? Pay easier!",
      },
    },
    domesticFlow: {
      overviewFor2026: "OVERVIEW FOR 2026",
      fromAccount: "FROM ACCOUNT",
      beneficiary: "BENEFICIARY",
      paymentDetails: "PAYMENT DETAILS",
      paymentOrder: "PAYMENT ORDER",
    },
  },
  productsMenu: {
    title: "Products",
    banking: "Banking",
    shopSmart: "ShopSmart",
    offersForYou: "OFFERS FOR YOU",
    ourProducts: "OUR PRODUCTS",
    otherSolutionsForYou: "OTHER SOLUTIONS FOR YOU",
    featuredCategories: "FEATURED CATEGORIES",
    shopSmartTitle: "SHOPSMART",
    cards: {
      account: "Account",
      cards: "Cards",
      "mortgages-loans": "Mortgages and\nloans",
      insurance: "Insurance",
      "investments-savings": "Investments\nand savings",
      "additional-services": "Additional\nservices",
      electronics: "Electronics",
      travel: "Travel",
      "home-living": "Home and\nliving",
      fashion: "Fashion",
    },
    offers: {
      default: {
        title: "Premium current\naccount offer",
        description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits.",
      },
    },
  },
  investments: {
    title: "Investment",
    totalValue: "Total value",
    performance: "Performance",
    value: "Value",
    total: "Total",
    allProducts: "ALL PRODUCTS",
    activeSecurities: "ACTIVE SECURITIES",
    inactiveSecurities: "INACTIVE SECURITIES",
    emptyTitle: "No investment products yet",
    emptyDescription: "Your portfolio value will appear here when investment products are available.",
    tabs: {
      performance: "PERFORMANCE",
      productType: "PRODUCT TYPE",
      currency: "CURRENCY",
      assetClass: "ASSET CLASS",
      accountList: "ACCOUNT LIST",
    },
    distributionTitles: {
      productType: "PRODUCT TYPE DISTRIBUTION",
      currency: "CURRENCY DISTRIBUTION",
      assetClass: "ASSET CLASS DISTRIBUTION",
      accountList: "ACCOUNT LIST DISTRIBUTION",
    },
    actions: {
      history: "History",
      toApprove: "To approve",
      downloadReport: "Download\nReport",
      invest: "Invest",
    },
    fundBanner: {
      title: "Find out the best fund for you",
      description: "Discover our suggestions",
      action: "GO TO FUNDS WINDOW",
    },
  },
  messages: {
    title: "Messages",
    inbox: "Inbox",
    outbox: "Outbox",
    sectionTitle: "2025",
    newBadge: "NEW",
    rows: {
      "card-notification": { title: "CARD NOTIFICATION", description: "Your card payment was processed." },
      "account-statement": { title: "ACCOUNT STATEMENT", description: "Your statement is ready." },
      "security-notice": { title: "SECURITY NOTICE", description: "Review a recent login to your account." },
      "payment-confirmation": { title: "PAYMENT CONFIRMATION", description: "Your scheduled payment was sent." },
      "product-update": { title: "PRODUCT UPDATE", description: "New benefits are available in the app." },
    },
  },
  documents: {
    title: "Documents",
    newBadge: "NEW",
    legalLabel: "Legal",
    rows: {
      "salary-transfer-advice": { title: "SALARY TRANSFER", description: "Salary transfer advice" },
      "transfer-confirmation": { title: "TRANSFER CONFIRMATION", description: "Transfer confirmation" },
      "incoming-payment-notice": { title: "INCOMING PAYMENT", description: "Incoming payment notice" },
      "standing-order-statement": { title: "STANDING ORDER", description: "Standing order statement" },
      "account-confirmation": { title: "ACCOUNT CONFIRMATION", description: "Account confirmation" },
      "tax-payment-receipt": { title: "TAX PAYMENT RECEIPT", description: "Tax payment receipt" },
      "loan-schedule-update": { title: "LOAN SCHEDULE", description: "Loan schedule update" },
    },
    deleteDialog: {
      title: "Delete document",
      body: "Are you sure you want to delete this document?",
      confirm: "Delete",
    },
    legalDeleteDialog: {
      title: "Info",
      body: "The selected file is marked as legal and cannot be deleted.",
      confirm: "OK",
    },
  },
  settings: {
    title: "Settings",
    sections: {
      "mobile-app": "Mobile app",
      bank: "Bank",
    },
    items: {
      language: { title: "Language", description: "Choose the app language you want to use every day." },
      notifications: { title: "Notifications", description: "Manage push alerts for payments, cards, and activity." },
      "my-notifications": { title: "My notifications", description: "Review recent app alerts and update delivery preferences." },
      security: { title: "Security", description: "Control sign-in, approvals, and device protection settings." },
      "widget-settings": { title: "Widget settings", description: "Choose what account information appears in your widgets." },
      cashback: { title: "Cashback", description: "See participating merchants and cashback setup options." },
      limits: { title: "Limits", description: "Adjust card, ATM, and transfer limits for your accounts." },
    },
  },
  contacts: {
    title: "Contacts",
    sections: {
      contacts: "Contacts",
      bankContacts: "Bank contacts",
      socialMedia: "Social media",
    },
    cards: {
      primeAdvisor: "My Prime Advisor",
      branchAtmFinder: "Branch & ATM Finder",
      infolineAvailability: "Infoline Availability",
      callUs: "Call Us",
      emergencyLine: "Emergency Line",
      email: "Email",
      website: "Website",
      facebook: "Facebook",
      youtube: "YouTube",
    },
  },
  dialogs: {
    logoutTitle: "Log out",
    logoutMessage: "Are you sure you want to log out?",
    cancel: "Cancel",
    logout: "Log out",
  },
  unsupported: {
    message: "This product/design-system combination is registered in the platform model, but it is not implemented as an interactive mobile flow yet.",
    productStatus: "Product status",
    designSystem: "Design system",
    designStatus: "Design status",
  },
};

const LOCAL_OVERRIDES: Partial<Record<AppLanguage, DeepPartial<RuntimeTranslations>>> = {
  ro: {
    actions: {
      ...EN_RUNTIME.actions,
      back: "Înapoi",
      messages: "Mesaje",
      help: "Ajutor",
      search: "Caută",
      filters: "Filtre",
      next: "Următorul",
      sign: "Semnează",
      okGotIt: "Am înțeles",
      showLess: "Arată mai puțin",
      showMore: "Arată mai mult",
    },
    accounts: { ...EN_RUNTIME.accounts, title: "Conturi" },
    analytics: {
      ...EN_RUNTIME.analytics,
      title: "Cheltuielile mele",
      dataFor: "Date pentru",
      moneyOut: "Bani ieșiți",
      moneyIn: "Bani intrați",
      noTransactionsForPeriod: "Nu există tranzacții pentru această perioadă",
    },
    payments: { ...EN_RUNTIME.payments, title: "Plăți", other: "ALTELE" },
    productsMenu: { ...EN_RUNTIME.productsMenu, title: "Produse" },
    messages: { ...EN_RUNTIME.messages, title: "Mesaje", inbox: "Primite", outbox: "Trimise" },
    documents: { ...EN_RUNTIME.documents, title: "Documente" },
    settings: { ...EN_RUNTIME.settings, title: "Setări" },
    contacts: { ...EN_RUNTIME.contacts, title: "Contacte" },
    dialogs: { ...EN_RUNTIME.dialogs, logoutTitle: "Deconectare", cancel: "Anulează", logout: "Deconectare" },
  },
  cs: {
    actions: { ...EN_RUNTIME.actions, back: "Zpět", messages: "Zprávy", help: "Nápověda", search: "Hledat", filters: "Filtry", next: "Další", sign: "Podepsat", okGotIt: "Rozumím" },
    accounts: { ...EN_RUNTIME.accounts, title: "Účty" },
    analytics: { ...EN_RUNTIME.analytics, title: "Moje výdaje", dataFor: "Data pro", moneyOut: "Výdaje", moneyIn: "Příjmy", noTransactionsForPeriod: "Žádné transakce pro toto období" },
    payments: { ...EN_RUNTIME.payments, title: "Platby", other: "OSTATNÍ" },
    productsMenu: { ...EN_RUNTIME.productsMenu, title: "Produkty" },
    messages: { ...EN_RUNTIME.messages, title: "Zprávy", inbox: "Doručené", outbox: "Odeslané", newBadge: "NOVÉ" },
    documents: { ...EN_RUNTIME.documents, title: "Dokumenty", newBadge: "NOVÉ" },
    settings: { ...EN_RUNTIME.settings, title: "Nastavení" },
    contacts: { ...EN_RUNTIME.contacts, title: "Kontakty" },
    dialogs: { ...EN_RUNTIME.dialogs, logoutTitle: "Odhlášení", cancel: "Zrušit", logout: "Odhlásit" },
  },
  sk: {
    actions: { ...EN_RUNTIME.actions, back: "Späť", messages: "Správy", help: "Pomoc", search: "Hľadať", filters: "Filtre", next: "Ďalej", sign: "Podpísať", okGotIt: "Rozumiem" },
    accounts: { ...EN_RUNTIME.accounts, title: "Účty" },
    analytics: { ...EN_RUNTIME.analytics, title: "Moje výdavky", dataFor: "Dáta pre", moneyOut: "Výdavky", moneyIn: "Príjmy", noTransactionsForPeriod: "Žiadne transakcie za toto obdobie" },
    payments: { ...EN_RUNTIME.payments, title: "Platby", other: "OSTATNÉ" },
    productsMenu: { ...EN_RUNTIME.productsMenu, title: "Produkty" },
    messages: { ...EN_RUNTIME.messages, title: "Správy", inbox: "Doručené", outbox: "Odoslané", newBadge: "NOVÉ" },
    documents: { ...EN_RUNTIME.documents, title: "Dokumenty", newBadge: "NOVÉ" },
    settings: { ...EN_RUNTIME.settings, title: "Nastavenia" },
    contacts: { ...EN_RUNTIME.contacts, title: "Kontakty" },
    dialogs: { ...EN_RUNTIME.dialogs, logoutTitle: "Odhlásenie", cancel: "Zrušiť", logout: "Odhlásiť" },
  },
  hu: {
    actions: { ...EN_RUNTIME.actions, back: "Vissza", messages: "Üzenetek", help: "Súgó", search: "Keresés", filters: "Szűrők", next: "Tovább", sign: "Aláírás", okGotIt: "Rendben" },
    accounts: { ...EN_RUNTIME.accounts, title: "Számlák" },
    analytics: { ...EN_RUNTIME.analytics, title: "Költéseim", dataFor: "Adatok", moneyOut: "Kiadások", moneyIn: "Bevételek", noTransactionsForPeriod: "Nincs tranzakció ebben az időszakban" },
    payments: { ...EN_RUNTIME.payments, title: "Fizetések", other: "EGYÉB" },
    productsMenu: { ...EN_RUNTIME.productsMenu, title: "Termékek" },
    messages: { ...EN_RUNTIME.messages, title: "Üzenetek", inbox: "Bejövő", outbox: "Kimenő", newBadge: "ÚJ" },
    documents: { ...EN_RUNTIME.documents, title: "Dokumentumok", newBadge: "ÚJ" },
    settings: { ...EN_RUNTIME.settings, title: "Beállítások" },
    contacts: { ...EN_RUNTIME.contacts, title: "Kapcsolatok" },
    dialogs: { ...EN_RUNTIME.dialogs, logoutTitle: "Kijelentkezés", cancel: "Mégse", logout: "Kijelentkezés" },
  },
  sr: {
    actions: { ...EN_RUNTIME.actions, back: "Nazad", messages: "Poruke", help: "Pomoć", search: "Pretraga", filters: "Filteri", next: "Dalje", sign: "Potpiši", okGotIt: "Razumem" },
    accounts: { ...EN_RUNTIME.accounts, title: "Računi" },
    analytics: { ...EN_RUNTIME.analytics, title: "Moja potrošnja", dataFor: "Podaci za", moneyOut: "Odliv", moneyIn: "Priliv", noTransactionsForPeriod: "Nema transakcija za ovaj period" },
    payments: { ...EN_RUNTIME.payments, title: "Plaćanja", other: "OSTALO" },
    productsMenu: { ...EN_RUNTIME.productsMenu, title: "Proizvodi" },
    messages: { ...EN_RUNTIME.messages, title: "Poruke", inbox: "Primljeno", outbox: "Poslato", newBadge: "NOVO" },
    documents: { ...EN_RUNTIME.documents, title: "Dokumenti", newBadge: "NOVO" },
    settings: { ...EN_RUNTIME.settings, title: "Podešavanja" },
    contacts: { ...EN_RUNTIME.contacts, title: "Kontakti" },
    dialogs: { ...EN_RUNTIME.dialogs, logoutTitle: "Odjava", cancel: "Otkaži", logout: "Odjavi se" },
  },
  bs: {
    actions: { ...EN_RUNTIME.actions, back: "Nazad", messages: "Poruke", help: "Pomoć", search: "Pretraga", filters: "Filteri", next: "Dalje", sign: "Potpiši", okGotIt: "Razumijem" },
    accounts: { ...EN_RUNTIME.accounts, title: "Računi" },
    analytics: { ...EN_RUNTIME.analytics, title: "Moja potrošnja", dataFor: "Podaci za", moneyOut: "Odliv", moneyIn: "Priliv", noTransactionsForPeriod: "Nema transakcija za ovaj period" },
    payments: { ...EN_RUNTIME.payments, title: "Plaćanja", other: "OSTALO" },
    productsMenu: { ...EN_RUNTIME.productsMenu, title: "Proizvodi" },
    messages: { ...EN_RUNTIME.messages, title: "Poruke", inbox: "Primljeno", outbox: "Poslano", newBadge: "NOVO" },
    documents: { ...EN_RUNTIME.documents, title: "Dokumenti", newBadge: "NOVO" },
    settings: { ...EN_RUNTIME.settings, title: "Postavke" },
    contacts: { ...EN_RUNTIME.contacts, title: "Kontakti" },
    dialogs: { ...EN_RUNTIME.dialogs, logoutTitle: "Odjava", cancel: "Otkaži", logout: "Odjavi se" },
  },
  sl: {
    actions: { ...EN_RUNTIME.actions, back: "Nazaj", messages: "Sporočila", help: "Pomoč", search: "Iskanje", filters: "Filtri", next: "Naprej", sign: "Podpiši", okGotIt: "Razumem" },
    accounts: { ...EN_RUNTIME.accounts, title: "Računi" },
    analytics: { ...EN_RUNTIME.analytics, title: "Moja poraba", dataFor: "Podatki za", moneyOut: "Odlivi", moneyIn: "Prilivi", noTransactionsForPeriod: "Ni transakcij za to obdobje" },
    payments: { ...EN_RUNTIME.payments, title: "Plačila", other: "OSTALO" },
    productsMenu: { ...EN_RUNTIME.productsMenu, title: "Produkti" },
    messages: { ...EN_RUNTIME.messages, title: "Sporočila", inbox: "Prejeto", outbox: "Poslano", newBadge: "NOVO" },
    documents: { ...EN_RUNTIME.documents, title: "Dokumenti", newBadge: "NOVO" },
    settings: { ...EN_RUNTIME.settings, title: "Nastavitve" },
    contacts: { ...EN_RUNTIME.contacts, title: "Kontakti" },
    dialogs: { ...EN_RUNTIME.dialogs, logoutTitle: "Odjava", cancel: "Prekliči", logout: "Odjava" },
  },
};

function mergeDefined(base: unknown, override: unknown): unknown {
  if (override === undefined) return base;
  if (!isUnknownRecord(base) || !isUnknownRecord(override)) return override;

  const merged: UnknownRecord = { ...base };
  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = Object.prototype.hasOwnProperty.call(base, key) ? base[key] : undefined;
    Object.defineProperty(merged, key, {
      configurable: true,
      enumerable: true,
      value: mergeDefined(baseValue, overrideValue),
      writable: true,
    });
  }
  return merged;
}

export function mergeRuntimeTranslations(
  base: RuntimeTranslations,
  override?: DeepPartial<RuntimeTranslations>,
): RuntimeTranslations {
  // The complete base supplies every required leaf; mergeDefined only replaces
  // those leaves with defined values from the structurally compatible override.
  return mergeDefined(base, override) as RuntimeTranslations;
}

export function createSharedTranslations(language: AppLanguage): Pick<TranslationKeys, "runtime"> {
  return {
    runtime: mergeRuntimeTranslations(EN_RUNTIME, LOCAL_OVERRIDES[language]),
  };
}
