import type { Country } from "@/app/state/demoTypes";
import type { Currency } from "@/data/products";

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
  RS: [
    { accountName: "Current Account", accountNumber: "RS35BACX1600000000123456", subAccount: "PRT1" },
    { accountName: "Savings Account", accountNumber: "RS82BACX1600000000654321", subAccount: "PRT2" },
    { accountName: "Reserve Account", accountNumber: "RS44BACX1600000000455011", subAccount: "PRT3" },
  ],
};

const CURRENCY_TRANSACTION_SCALE: Record<Currency, number> = {
  EUR: 1,
  CZK: 24.4,
  RON: 4.98,
  BAM: 1.96,
  HUF: 396.5,
  RSD: 117.1,
  USD: 1.08,
  GBP: 0.85,
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

interface CountryTransactionProfile {
  salaryPayer: string;
  person: string;
  groceries: string;
  utility: string;
  transport: string;
  subscription: string;
  coffee: string;
  shopping: string;
  publicInstitution: string;
}

const COUNTRY_TRANSACTION_PROFILES: Record<Country, CountryTransactionProfile> = {
  RO: {
    salaryPayer: "Dante International",
    person: "Andreea Popescu",
    groceries: "Carrefour",
    utility: "Enel Energie",
    transport: "OMV Petrom",
    subscription: "YouTube Premium",
    coffee: "Bar Magenta",
    shopping: "eMAG",
    publicInstitution: "ANAF",
  },
  CZ: {
    salaryPayer: "Seznam.cz",
    person: "Petr Novak",
    groceries: "Albert",
    utility: "CEZ",
    transport: "Ceske drahy",
    subscription: "Spotify",
    coffee: "Costa Coffee",
    shopping: "Alza.cz",
    publicInstitution: "Financni sprava",
  },
  SK: {
    salaryPayer: "Eset",
    person: "Lucia Horvathova",
    groceries: "Billa",
    utility: "ZSE Energia",
    transport: "Slovnaft",
    subscription: "Netflix",
    coffee: "Urban House",
    shopping: "Alza.sk",
    publicInstitution: "Financna sprava",
  },
  HU: {
    salaryPayer: "Graphisoft",
    person: "Nagy Anna",
    groceries: "SPAR",
    utility: "MVM",
    transport: "MOL",
    subscription: "Netflix",
    coffee: "Cafe Frei",
    shopping: "eMAG Hungary",
    publicInstitution: "NAV",
  },
  RS: {
    salaryPayer: "Nordeus",
    person: "Ana Jovanovic",
    groceries: "Idea",
    utility: "EPS",
    transport: "NIS Petrol",
    subscription: "Spotify",
    coffee: "Kafeterija",
    shopping: "Gigatron",
    publicInstitution: "Poreska uprava",
  },
  BA: {
    salaryPayer: "Authority Partners",
    person: "Amir Hadzic",
    groceries: "Konzum",
    utility: "Elektroprivreda BIH",
    transport: "Hifa Petrol",
    subscription: "Netflix",
    coffee: "Mrvica",
    shopping: "Bingo",
    publicInstitution: "Porezna uprava",
  },
  SI: {
    salaryPayer: "Outfit7",
    person: "Maja Novak",
    groceries: "Mercator",
    utility: "GEN-I",
    transport: "Petrol",
    subscription: "Spotify",
    coffee: "Kavarna Rog",
    shopping: "Mimovrste",
    publicInstitution: "FURS",
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
  status: "Booked" | "Pending" = "Booked",
): AccountTransaction {
  const amount = money(baseEurAmount, currency);
  return {
    id: `${country}-${accountIndex}-${sequence}`,
    day: date.getDate().toString().padStart(2, "0"),
    month: MONTH_SHORT[date.getMonth()],
    monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    monthTitle: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
    label,
    details,
    amount,
    type: amount >= 0 ? "credit" : "debit",
    category,
    status,
  };
}

export function getAccountIdentity(country: Country, index: number): AccountIdentity {
  const identities = ACCOUNT_IDENTITIES[country];
  return identities[index % identities.length];
}

export function getAccountTransactions(
  country: Country,
  accountIndex: number,
  currency: Currency,
): AccountTransaction[] {
  const profile = COUNTRY_TRANSACTION_PROFILES[country];

  if (accountIndex === 1) {
    return [
      makeTransaction(country, currency, accountIndex, 1, new Date(2026, 3, 18), "Interest payment", "Savings interest", 12.6, "Income"),
      makeTransaction(country, currency, accountIndex, 2, new Date(2026, 3, 11), "Transfer from current", "Monthly savings", 220, "Internal"),
      makeTransaction(country, currency, accountIndex, 3, new Date(2026, 3, 2), "Round UP", "Card payments saving", 17.35, "Savings"),
      makeTransaction(country, currency, accountIndex, 4, new Date(2026, 2, 21), "Term deposit", "Principal transfer", -150, "Savings"),
      makeTransaction(country, currency, accountIndex, 5, new Date(2026, 2, 7), "Transfer from current", "Reserve contribution", 180, "Internal"),
      makeTransaction(country, currency, accountIndex, 6, new Date(2026, 1, 14), "Emergency fund", "Internal transfer", 90, "Internal"),
    ];
  }

  if (accountIndex === 2) {
    return [
      makeTransaction(country, currency, accountIndex, 1, new Date(2026, 3, 24), "Virtual card top-up", "Internet payments reserve", -45, "Card"),
      makeTransaction(country, currency, accountIndex, 2, new Date(2026, 3, 17), profile.subscription, "Monthly subscription", -11.99, "Leisure time"),
      makeTransaction(country, currency, accountIndex, 3, new Date(2026, 3, 10), "FX conversion", "Currency exchange", -3.2, "FX"),
      makeTransaction(country, currency, accountIndex, 4, new Date(2026, 2, 26), profile.shopping, "Online purchase", -74.5, "Shopping", "Pending"),
      makeTransaction(country, currency, accountIndex, 5, new Date(2026, 2, 11), profile.person, "Shared expenses", 63, "Transfers"),
      makeTransaction(country, currency, accountIndex, 6, new Date(2026, 1, 25), "ATM withdrawal", "Cash withdrawal", -60, "ATM"),
    ];
  }

  return [
    makeTransaction(country, currency, accountIndex, 1, new Date(2026, 3, 29), profile.salaryPayer, "Salary April", 1250, "Income"),
    makeTransaction(country, currency, accountIndex, 2, new Date(2026, 3, 24), profile.groceries, "Groceries", -86.4, "Groceries"),
    makeTransaction(country, currency, accountIndex, 3, new Date(2026, 3, 22), profile.coffee, "Card payment", -18.75, "Lifestyle"),
    makeTransaction(country, currency, accountIndex, 4, new Date(2026, 3, 18), profile.person, "Transfer received", 120, "Transfers"),
    makeTransaction(country, currency, accountIndex, 5, new Date(2026, 3, 12), profile.utility, "Utility bill", -72.3, "Utilities"),
    makeTransaction(country, currency, accountIndex, 6, new Date(2026, 3, 8), profile.transport, "Fuel and transport", -51.2, "Transportation"),
    makeTransaction(country, currency, accountIndex, 7, new Date(2026, 2, 29), profile.publicInstitution, "Taxes and fees", -210, "Taxes"),
    makeTransaction(country, currency, accountIndex, 8, new Date(2026, 2, 15), profile.salaryPayer, "Salary March", 1250, "Income"),
    makeTransaction(country, currency, accountIndex, 9, new Date(2026, 1, 27), profile.subscription, "Monthly subscription", -12.99, "Leisure time"),
  ];
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
