import type { Country } from "@/app/state/demoTypes";
import { normalizePfmCategory } from "@/data/pfmCategories";
import type { PfmCategoryName } from "@/data/pfmCategories";
import type { Currency } from "@/data/products";
import type { Product } from "@/data/products";

export interface AccountIdentity {
  accountName: string;
  accountNumber: string;
  subAccount: string;
}

export interface AccountTransaction {
  id: string;
  day: string;
  month: string;
  monthKey: string;
  monthTitle: string;
  label: string;
  details?: string;
  amount: number;
  type: "debit" | "credit";
  category: string;
  pfmCategory: PfmCategoryName;
  pfmSubcategory: string;
  status: "Booked" | "Pending";
}

export interface AccountTransactionMonthGroup {
  monthTitle: string;
  transactions: AccountTransaction[];
  monthlyTotal: number;
}

export interface AccountOptionItem {
  id: string;
  title: string;
  description: string;
}

export interface AccountProductOption {
  id: string;
  title: string;
  description: string;
  image: "deposit" | "roundup" | "virtual-card";
}

const ACCOUNT_IDENTITIES: Record<Country, AccountIdentity[]> = {
  RO: [
    { accountName: "Current Account", accountNumber: "RO20BACX0000000010351312", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "RO49BACX000008204119876", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "RO23BACX000003771004421", subAccount: "PRT3" },
  ],
  HU: [
    { accountName: "Current Account", accountNumber: "HU42BACX1177344012345678", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "HU88BACX1177344098765432", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "HU15BACX1177344055512244", subAccount: "PRT3" },
  ],
  CZ: [
    { accountName: "Current Account", accountNumber: "CZ54BACX2700000000123456", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "CZ21BACX2700000000654321", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "CZ77BACX2700000000455011", subAccount: "PRT3" },
  ],
  SK: [
    { accountName: "Current Account", accountNumber: "SK88BACX1100000000123456", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "SK31BACX1100000000654321", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "SK19BACX1100000000455011", subAccount: "PRT3" },
  ],
  SI: [
    { accountName: "Current Account", accountNumber: "SI56BACX2900000000123456", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "SI22BACX2900000000654321", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "SI90BACX2900000000455011", subAccount: "PRT3" },
  ],
  BA: [
    { accountName: "Current Account", accountNumber: "BA39BACX1290000000123456", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "BA18BACX1290000000654321", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "BA72BACX1290000000455011", subAccount: "PRT3" },
  ],
  BA_BL: [
    { accountName: "Current Account", accountNumber: "BA39BACX1290000000123456", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "BA18BACX1290000000654321", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "BA72BACX1290000000455011", subAccount: "PRT3" },
  ],
  RS: [
    { accountName: "Current Account", accountNumber: "RS35BACX1600000000123456", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "RS82BACX1600000000654321", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "RS44BACX1600000000455011", subAccount: "PRT3" },
  ],
};

const CURRENCY_TRANSACTION_SCALE: Record<Currency, number> = {
  EUR: 1,
  CZK: 24.284,
  RON: 5.2379,
  BAM: 1.95583,
  HUF: 354.83,
  RSD: 117.3909,
  USD: 1.1637,
  GBP: 0.86618,
};

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

const MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function getRequiredIndexedValue<T>(values: readonly T[], index: number, label: string): T {
  const value = values[index];

  if (value === undefined) {
    throw new Error(`${label} invariant failed at index ${index}`);
  }

  return value;
}

interface CountryTransactionProfile {
  salaryPayer: string;
  freelancePayer: string;
  person: string;
  secondaryPerson: string;
  groceries: string;
  utility: string;
  publicTransport: string;
  transport: string;
  fuel: string;
  subscription: string;
  coffee: string;
  restaurant: string;
  shopping: string;
  publicInstitution: string;
  home: string;
  education: string;
  healthcare: string;
  insurance: string;
  childcare: string;
  investments: string;
  wallet: string;
  charity: string;
  bankFee: string;
  atm: string;
  fxOffice: string;
  uncategorized: string;
}

const COUNTRY_TRANSACTION_PROFILES: Record<Country, CountryTransactionProfile> = {
  RO: {
    salaryPayer: "Dante International",
    freelancePayer: "PFA Popescu Andreea",
    person: "Andreea Popescu",
    secondaryPerson: "Mihai Ionescu",
    groceries: "Carrefour",
    utility: "Enel Energie",
    publicTransport: "STB",
    transport: "Metrorex",
    fuel: "OMV Petrom",
    subscription: "YouTube Premium",
    coffee: "Bar Magenta",
    restaurant: "City Grill",
    shopping: "eMAG",
    publicInstitution: "ANAF",
    home: "Apulum Residence",
    education: "Scoala Spectrum",
    healthcare: "Regina Maria",
    insurance: "NN Asigurari",
    childcare: "Little Team",
    investments: "TradeVille",
    wallet: "Apple Pay Wallet",
    charity: "Crucea Rosie",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Exchange Desk",
    uncategorized: "Piata Obor",
  },
  CZ: {
    salaryPayer: "Seznam.cz",
    freelancePayer: "Freelancer Petr Novak",
    person: "Petr Novak",
    secondaryPerson: "Jana Svobodova",
    groceries: "Albert",
    utility: "CEZ",
    publicTransport: "DPP",
    transport: "Ceske drahy",
    fuel: "Benzina Orlen",
    subscription: "Spotify",
    coffee: "Costa Coffee",
    restaurant: "Lokal",
    shopping: "Alza.cz",
    publicInstitution: "Financni sprava",
    home: "CPI Byty",
    education: "Skola Praha",
    healthcare: "Dr.Max",
    insurance: "Kooperativa",
    childcare: "Skolka Praha",
    investments: "Portu",
    wallet: "Apple Pay Wallet",
    charity: "Charita CR",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Smenarna Praha",
    uncategorized: "Farmers Market",
  },
  SK: {
    salaryPayer: "Eset",
    freelancePayer: "Freelancer Lucia Horvathova",
    person: "Lucia Horvathova",
    secondaryPerson: "Martin Kollar",
    groceries: "Billa",
    utility: "ZSE Energia",
    publicTransport: "Dopravny podnik",
    transport: "ZSSK",
    fuel: "Slovnaft",
    subscription: "Netflix",
    coffee: "Urban House",
    restaurant: "Slovak Pub",
    shopping: "Alza.sk",
    publicInstitution: "Financna sprava",
    home: "Bratislava Rent",
    education: "Skola Novohradska",
    healthcare: "Dr.Max",
    insurance: "Union poistovna",
    childcare: "Skolka Bratislava",
    investments: "Finax",
    wallet: "Google Pay Wallet",
    charity: "Liga proti rakovine",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Exchange Desk",
    uncategorized: "Trhovisko Mileticova",
  },
  HU: {
    salaryPayer: "Graphisoft",
    freelancePayer: "Freelancer Nagy Anna",
    person: "Nagy Anna",
    secondaryPerson: "Kovacs Peter",
    groceries: "SPAR",
    utility: "MVM",
    publicTransport: "BKK",
    transport: "MAV",
    fuel: "MOL",
    subscription: "Netflix",
    coffee: "Cafe Frei",
    restaurant: "Menza",
    shopping: "eMAG Hungary",
    publicInstitution: "NAV",
    home: "Otthon Centrum",
    education: "Budapest School",
    healthcare: "Medicover",
    insurance: "Allianz",
    childcare: "Ovoda Budapest",
    investments: "Concorde",
    wallet: "Apple Pay Wallet",
    charity: "Magyar Voroskereszt",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Exclusive Change",
    uncategorized: "Lehel Market",
  },
  RS: {
    salaryPayer: "Nordeus",
    freelancePayer: "Freelancer Ana Jovanovic",
    person: "Ana Jovanovic",
    secondaryPerson: "Marko Petrovic",
    groceries: "Idea",
    utility: "EPS",
    publicTransport: "GSP Beograd",
    transport: "Lasta",
    fuel: "NIS Petrol",
    subscription: "Spotify",
    coffee: "Kafeterija",
    restaurant: "Walter",
    shopping: "Gigatron",
    publicInstitution: "Poreska uprava",
    home: "Belgrade Rent",
    education: "Skola Kreativno Pero",
    healthcare: "MediGroup",
    insurance: "Dunav Osiguranje",
    childcare: "Vrtic Beograd",
    investments: "Ilirika",
    wallet: "Google Pay Wallet",
    charity: "Crveni krst Srbije",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Menjacnica",
    uncategorized: "Kalenic Market",
  },
  BA: {
    salaryPayer: "Authority Partners",
    freelancePayer: "Freelancer Amir Hadzic",
    person: "Amir Hadzic",
    secondaryPerson: "Lejla Music",
    groceries: "Konzum",
    utility: "Elektroprivreda BIH",
    publicTransport: "Centrotrans",
    transport: "GRAS Sarajevo",
    fuel: "Hifa Petrol",
    subscription: "Netflix",
    coffee: "Mrvica",
    restaurant: "Klopa",
    shopping: "Bingo",
    publicInstitution: "Porezna uprava",
    home: "Sarajevo Rent",
    education: "International School",
    healthcare: "ASA Bolnica",
    insurance: "Sarajevo Osiguranje",
    childcare: "Obdaniste Sarajevo",
    investments: "Raiffeisen Invest",
    wallet: "Apple Pay Wallet",
    charity: "Crveni kriz BIH",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Exchange Office",
    uncategorized: "Markale",
  },
  BA_BL: {
    salaryPayer: "Authority Partners",
    freelancePayer: "Freelancer Amir Hadzic",
    person: "Amir Hadzic",
    secondaryPerson: "Lejla Music",
    groceries: "Konzum",
    utility: "Elektroprivreda BIH",
    publicTransport: "Centrotrans",
    transport: "GRAS Sarajevo",
    fuel: "Hifa Petrol",
    subscription: "Netflix",
    coffee: "Mrvica",
    restaurant: "Klopa",
    shopping: "Bingo",
    publicInstitution: "Porezna uprava",
    home: "Sarajevo Rent",
    education: "International School",
    healthcare: "ASA Bolnica",
    insurance: "Sarajevo Osiguranje",
    childcare: "Obdaniste Sarajevo",
    investments: "Raiffeisen Invest",
    wallet: "Apple Pay Wallet",
    charity: "Crveni kriz BIH",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Exchange Office",
    uncategorized: "Markale",
  },
  SI: {
    salaryPayer: "Outfit7",
    freelancePayer: "Freelancer Maja Novak",
    person: "Maja Novak",
    secondaryPerson: "Luka Kranjc",
    groceries: "Mercator",
    utility: "GEN-I",
    publicTransport: "LPP",
    transport: "Slovenske zeleznice",
    fuel: "Petrol",
    subscription: "Spotify",
    coffee: "Kavarna Rog",
    restaurant: "Gostilna Sokol",
    shopping: "Mimovrste",
    publicInstitution: "FURS",
    home: "Ljubljana Rent",
    education: "Vrtec Ljubljana",
    healthcare: "Lekarna Ljubljana",
    insurance: "Triglav",
    childcare: "Vrtec Ljubljana",
    investments: "NLB Skladi",
    wallet: "Apple Pay Wallet",
    charity: "Rdeci kriz",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    fxOffice: "Exchange Desk",
    uncategorized: "Central Market",
  },
};

function money(baseEur: number, currency: Currency) {
  const scale = CURRENCY_TRANSACTION_SCALE[currency] ?? 1;
  return Math.round(baseEur * scale * 100) / 100;
}

function makeTransaction(
  country: Country,
  currency: Currency,
  accountIndex: number,
  sequence: number,
  date: Date,
  label: string,
  details: string,
  baseEurAmount: number,
  category: string,
  pfmSubcategory: string,
  status: "Booked" | "Pending" = "Booked",
): AccountTransaction {
  const amount = money(baseEurAmount, currency);
  const pfmCategory = normalizePfmCategory(category);
  const monthIndex = date.getMonth();
  const month = getRequiredIndexedValue(MONTH_SHORT, monthIndex, "Transaction short month");
  const monthName = getRequiredIndexedValue(MONTH_NAMES, monthIndex, "Transaction month name");

  return {
    id: `${country}-${accountIndex}-${sequence}`,
    day: date.getDate().toString().padStart(2, "0"),
    month,
    monthKey: `${date.getFullYear()}-${String(monthIndex + 1).padStart(2, "0")}`,
    monthTitle: `${monthName} ${date.getFullYear()}`,
    label,
    details,
    amount,
    type: amount >= 0 ? "credit" : "debit",
    category,
    pfmCategory,
    pfmSubcategory,
    status,
  };
}

const SAVINGS_TRANSFER_PROFILE_INDEX = 100;
const CREDIT_PRODUCT_PROFILE_INDEX = 200;
const MORTGAGE_PROFILE_INDEX = 201;

function createTransactionFactory(country: Country, currency: Currency, accountIndex: number) {
  let sequence = 1;

  return (
    date: Date,
    label: string,
    details: string,
    baseEurAmount: number,
    category: string,
    pfmSubcategory: string,
    status: AccountTransaction["status"] = "Booked",
  ) =>
    makeTransaction(
      country,
      currency,
      accountIndex,
      sequence++,
      date,
      label,
      details,
      baseEurAmount,
      category,
      pfmSubcategory,
      status,
    );
}

function getPrimaryCurrentAccountTransactions(
  country: Country,
  currency: Currency,
  accountIndex: number,
  profile: CountryTransactionProfile,
): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, accountIndex);

  return [
    t(new Date(2026, 3, 29), profile.salaryPayer, "Salary April", 1250, "Income", "Salary"),
    t(new Date(2026, 3, 27), profile.home, "Standing order", -320, "Home", "Rent and housing"),
    t(new Date(2026, 3, 24), profile.groceries, "Card payment", -86.4, "Groceries", "Supermarket"),
    t(new Date(2026, 3, 22), profile.restaurant, "Card payment", -34.8, "Lifestyle", "Restaurants"),
    t(new Date(2026, 3, 20), profile.utility, "Account payment", -72.3, "Utilities", "Utility bill"),
    t(new Date(2026, 3, 18), profile.person, "Incoming transfer", 120, "Transfers", "Incoming transfer"),
    t(new Date(2026, 3, 16), profile.healthcare, "Card payment", -28.5, "Healthcare", "Medical care"),
    t(new Date(2026, 3, 14), profile.insurance, "Direct debit", -39.2, "Insurance", "Insurance premium"),
    t(new Date(2026, 3, 12), profile.education, "Account payment", -58, "Education", "School fee"),
    t(new Date(2026, 3, 10), profile.childcare, "Account payment", -95, "Children", "Childcare"),
    t(new Date(2026, 3, 8), profile.fuel, "Card payment", -51.2, "Transportation", "Fuel and transport"),
    t(new Date(2026, 3, 6), profile.shopping, "Online card payment", -74.5, "Shopping", "Online purchase", "Pending"),
    t(new Date(2026, 3, 4), profile.subscription, "Card payment", -12.99, "Leisure time", "Subscriptions"),
    t(new Date(2026, 3, 2), profile.publicInstitution, "Account payment", -210, "Taxes and Penalties", "Taxes and fees"),
    t(new Date(2026, 3, 30), profile.atm, "Cash withdrawal", -60, "ATM", "Cash withdrawal"),
    t(new Date(2026, 3, 28), "Cash deposit", "Branch cash deposit", 75, "Wallet", "Cash deposit"),
    t(new Date(2026, 3, 26), profile.wallet, "Mobile wallet top-up", -45, "Wallet", "Wallet top-up"),
    t(new Date(2026, 3, 23), profile.investments, "Account payment", -150, "Investments", "Broker transfer"),
    t(new Date(2026, 3, 21), profile.bankFee, "Monthly package fee", -4.5, "Finance", "Bank fees"),
    t(new Date(2026, 3, 19), profile.fxOffice, "Currency exchange", -8.2, "FX", "Currency exchange"),
    t(new Date(2026, 3, 17), "Transfer to savings", "Own account transfer", -220, "Internal", "Own account transfer"),
    t(new Date(2026, 3, 15), profile.charity, "Excluded from budget", -25, "Exclude from budget", "Excluded payment"),
    t(new Date(2026, 3, 13), profile.uncategorized, "Card payment", -14.6, "Uncategorized", "Needs category"),
    t(new Date(2025, 11, 18), profile.salaryPayer, "Year-end bonus", 840, "Income", "Salary"),
    t(new Date(2025, 11, 12), profile.shopping, "Holiday shopping", -190.4, "Shopping", "Retail purchase"),
    t(new Date(2025, 10, 27), profile.home, "Standing order", -320, "Home", "Rent and housing"),
    t(new Date(2025, 10, 19), profile.utility, "Account payment", -68.2, "Utilities", "Utility bill"),
  ];
}

function getSecondaryCurrentAccountTransactions(
  country: Country,
  currency: Currency,
  accountIndex: number,
  profile: CountryTransactionProfile,
): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, accountIndex);

  return [
    t(new Date(2026, 3, 28), profile.freelancePayer, "Invoice payment", 640, "Income", "Freelance income"),
    t(new Date(2026, 3, 26), profile.secondaryPerson, "Shared rent transfer", 160, "Transfers", "Incoming transfer"),
    t(new Date(2026, 3, 23), profile.publicTransport, "Monthly pass", -27.5, "Transportation", "Public transport"),
    t(new Date(2026, 3, 21), profile.coffee, "Card payment", -9.8, "Lifestyle", "Coffee shop"),
    t(new Date(2026, 3, 19), profile.groceries, "Card payment", -48.6, "Groceries", "Supermarket"),
    t(new Date(2026, 3, 17), profile.utility, "Direct debit", -54.4, "Utilities", "Utility bill"),
    t(new Date(2026, 3, 15), profile.shopping, "Card payment", -39.9, "Shopping", "Retail purchase"),
    t(new Date(2026, 3, 13), profile.healthcare, "Card payment", -18.4, "Healthcare", "Pharmacy"),
    t(new Date(2026, 3, 11), profile.insurance, "Account payment", -22.6, "Insurance", "Policy payment"),
    t(new Date(2026, 3, 9), profile.publicInstitution, "Account payment", -76, "Taxes and Penalties", "Local tax"),
    t(new Date(2026, 3, 7), profile.wallet, "Card-linked wallet", -30, "Wallet", "Wallet payment"),
    t(new Date(2026, 3, 5), profile.investments, "Recurring investment", -80, "Investments", "Investment plan"),
    t(new Date(2026, 2, 29), profile.childcare, "Account payment", -64, "Children", "Child expenses"),
    t(new Date(2026, 2, 25), profile.education, "Course fee", -42, "Education", "Courses"),
    t(new Date(2026, 2, 20), profile.subscription, "Subscription renewal", -14.99, "Leisure time", "Subscriptions"),
    t(new Date(2026, 2, 16), profile.bankFee, "Card administration fee", -3.5, "Finance", "Bank fees"),
    t(new Date(2026, 2, 12), profile.fxOffice, "POS currency conversion", -5.8, "FX", "Currency exchange"),
    t(new Date(2026, 2, 8), "Transfer to Emergency Fund", "Own account transfer", -140, "Internal", "Own account transfer"),
    t(new Date(2026, 1, 27), profile.atm, "Cash withdrawal", -40, "ATM", "Cash withdrawal"),
    t(new Date(2026, 1, 20), profile.uncategorized, "Card payment", -11.4, "Uncategorized", "Needs category"),
    t(new Date(2025, 11, 22), profile.freelancePayer, "Freelance payout", 420, "Income", "Freelance income"),
    t(new Date(2025, 11, 8), profile.healthcare, "Card payment", -96.5, "Healthcare", "Medical care"),
    t(new Date(2025, 10, 23), profile.publicTransport, "Transport pass", -48.3, "Transportation", "Public transport"),
    t(new Date(2025, 10, 11), profile.groceries, "Card payment", -72.8, "Groceries", "Supermarket"),
  ];
}

function getSavingsTransferTransactions(country: Country, currency: Currency, accountIndex: number): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, accountIndex);

  return [
    t(new Date(2026, 3, 25), "Transfer from Primary Account", "Own account transfer", 300, "Internal", "Savings transfer"),
    t(new Date(2026, 3, 18), "Transfer to Primary Account", "Own account transfer", -110, "Internal", "Savings transfer"),
    t(new Date(2026, 3, 11), "Automatic savings transfer", "Own account transfer", 220, "Internal", "Savings transfer"),
    t(new Date(2026, 3, 4), "Transfer to Term Deposit", "Own account transfer", -150, "Internal", "Term deposit transfer"),
    t(new Date(2026, 2, 22), "Transfer from Current Account", "Own account transfer", 180, "Internal", "Savings transfer"),
    t(new Date(2026, 2, 7), "Transfer to Current Account", "Own account transfer", -90, "Internal", "Savings transfer"),
    t(new Date(2026, 1, 14), "Reserve transfer", "Own account transfer", 75, "Internal", "Savings transfer"),
    t(new Date(2025, 11, 6), "Year-end savings transfer", "Own account transfer", 140, "Internal", "Savings transfer"),
  ];
}

function getCreditProductTransactions(
  country: Country,
  currency: Currency,
  accountIndex: number,
  profile: CountryTransactionProfile,
): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, accountIndex);
  const isMortgage = accountIndex === MORTGAGE_PROFILE_INDEX;
  const repaymentLabel = isMortgage ? "Mortgage repayment" : "Loan repayment";
  const interestDetails = isMortgage ? "Mortgage interest" : "Loan interest";

  return [
    t(new Date(2026, 3, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
    t(new Date(2026, 3, 22), "Interest charge", interestDetails, -42.4, "Finance", "Interest"),
    t(new Date(2026, 3, 15), profile.insurance, "Loan insurance", -18.5, "Insurance", "Insurance premium"),
    t(new Date(2026, 2, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
    t(new Date(2026, 2, 22), "Interest charge", interestDetails, -44.1, "Finance", "Interest"),
    t(new Date(2026, 1, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
    t(new Date(2025, 11, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
  ];
}

export function getAccountTransactionProfileIndex(product: Product, productIndex: number) {
  if (product.type === "current_account") {
    return productIndex;
  }

  if (product.type === "saving_account" || product.type === "term_deposit") {
    return SAVINGS_TRANSFER_PROFILE_INDEX;
  }

  if (product.type === "loan") {
    return CREDIT_PRODUCT_PROFILE_INDEX;
  }

  if (product.type === "mortgage") {
    return MORTGAGE_PROFILE_INDEX;
  }

  return productIndex;
}

export function getAccountIdentity(country: Country, index: number): AccountIdentity {
  const identities = ACCOUNT_IDENTITIES[country];
  const identityIndex = index % identities.length;
  return getRequiredIndexedValue(identities, identityIndex, `Account identity for ${country}`);
}

export function getAccountTransactions(
  country: Country,
  accountIndex: number,
  currency: Currency,
): AccountTransaction[] {
  const profile = COUNTRY_TRANSACTION_PROFILES[country];

  if (accountIndex === SAVINGS_TRANSFER_PROFILE_INDEX) {
    return getSavingsTransferTransactions(country, currency, accountIndex);
  }

  if (accountIndex === CREDIT_PRODUCT_PROFILE_INDEX || accountIndex === MORTGAGE_PROFILE_INDEX) {
    return getCreditProductTransactions(country, currency, accountIndex, profile);
  }

  if (accountIndex % 2 === 1) {
    return getSecondaryCurrentAccountTransactions(country, currency, accountIndex, profile);
  }

  return getPrimaryCurrentAccountTransactions(country, currency, accountIndex, profile);
}

export function groupAccountTransactionsByMonth(
  transactions: AccountTransaction[],
): AccountTransactionMonthGroup[] {
  const groups = new Map<string, AccountTransactionMonthGroup>();

  transactions.forEach((transaction) => {
    const existing = groups.get(transaction.monthKey);
    if (existing) {
      existing.transactions.push(transaction);
      existing.monthlyTotal += transaction.amount;
      return;
    }

    groups.set(transaction.monthKey, {
      monthTitle: transaction.monthTitle,
      transactions: [transaction],
      monthlyTotal: transaction.amount,
    });
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, group]) => ({
      ...group,
      transactions: group.transactions.sort((a, b) => Number(b.day) - Number(a.day)),
    }));
}

export const ACCOUNT_OPTION_ITEMS: AccountOptionItem[] = [
  {
    id: "share-account-info",
    title: "SHARE ACCOUNT INFO",
    description: "Choose what data to share",
  },
  {
    id: "push-notifications",
    title: "PUSH NOTIFICATIONS",
    description: "Push notification info",
  },
  {
    id: "account-statement",
    title: "ACCOUNT STATEMENT",
    description: "Download or send the account statement by e-mail",
  },
  {
    id: "create-paycode",
    title: "CREATE PAYCODE",
    description: "Create pay code info",
  },
  {
    id: "change-account-name",
    title: "CHANGE ACCOUNT NAME",
    description: "You can choose any name you want for your accounts",
  },
];

export const ACCOUNT_PRODUCT_OPTIONS: AccountProductOption[] = [
  {
    id: "term-deposit",
    title: "Term Deposit",
    description: "Want to save money but not sure how?",
    image: "deposit",
  },
  {
    id: "round-up",
    title: "Round UP",
    description: "Round up your card payments and save the difference.",
    image: "roundup",
  },
  {
    id: "virtual-debit-card",
    title: "Virtual debit card",
    description: "Instantly prepared for payments via internet or at POS",
    image: "virtual-card",
  },
];
