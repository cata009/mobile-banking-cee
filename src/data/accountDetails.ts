import type { Country } from "@/app/state/demoTypes";
import { MERCHANTS, type MerchantId } from "@/data/merchantDirectory";
import { normalizePfmCategory } from "@/data/pfmCategories";
import type { PfmCategoryName } from "@/data/pfmCategories";
import type { Currency } from "@/data/products";
import type { CreditCard, DebitCard, Product } from "@/data/products";

export interface AccountIdentity {
  accountName: string;
  accountNumber: string;
  subAccount: string;
}

/** The kinds of own account a transfer can touch. */
export type TransactionAccountKind = "current" | "savings" | "deposit";

/** One side of a transfer the customer owns both ends of. */
export type TransactionEndpoint =
  | { kind: "account"; account: TransactionAccountKind }
  | { kind: "currency"; currency: Currency };

export interface TransactionTransferPair {
  from: TransactionEndpoint;
  to: TransactionEndpoint;
}

export interface AccountTransaction {
  id: string;
  day: string;
  month: string;
  monthKey: string;
  monthTitle: string;
  label: string;
  details?: string;
  /** Currency carried by the account ledger, used when an own-account transfer shows its payer. */
  currency?: Currency;
  amount: number;
  type: "debit" | "credit";
  category: string;
  pfmCategory: PfmCategoryName;
  pfmSubcategory: string;
  status: "Booked" | "Pending";
  source?: "account" | "card";
  /**
   * Set on card rows whose counterparty is a branded merchant, so the row can
   * render the merchant mark instead of the PFM category icon. Card activity
   * with no brand behind it (ATM cash, a market stall) deliberately leaves it
   * unset and keeps the category icon.
   */
  merchantId?: MerchantId;
  /**
   * Set when both ends of the movement belong to the customer — an own-account
   * transfer or a currency exchange. The row then leads with the pair of
   * accounts rather than a counterparty or a category.
   */
  transferPair?: TransactionTransferPair;
}

export interface AccountTransactionMonthGroup {
  monthKey: string;
  monthTitle: string;
  transactions: AccountTransaction[];
  monthlyTotal: number;
}

export interface AccountTransactionDateGroup {
  dateKey: string;
  dateTitle: string;
  transactions: AccountTransaction[];
  dailyTotal: number;
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
  utility: string;
  publicTransport: string;
  transport: string;
  publicInstitution: string;
  home: string;
  education: string;
  insurance: string;
  childcare: string;
  investments: string;
  wallet: string;
  charity: string;
  bankFee: string;
  atm: string;
  uncategorized: string;
  /** Card spend is addressed by merchant, so every card row carries a brand. */
  merchants: CountryMerchantSlots;
}

/**
 * The merchants a market's card ledger is built from. Each slot is a real
 * chain operating in that country, so the transaction list reads like a
 * plausible statement rather than a set of generic descriptors.
 */
interface CountryMerchantSlots {
  groceries: MerchantId;
  groceriesAlt: MerchantId;
  fuel: MerchantId;
  pharmacy: MerchantId;
  electronics: MerchantId;
  fashion: MerchantId;
  sports: MerchantId;
  homeStore: MerchantId;
  coffee: MerchantId;
  restaurant: MerchantId;
  fastFood: MerchantId;
  delivery: MerchantId;
  rideHailing: MerchantId;
  streaming: MerchantId;
  digital: MerchantId;
  entertainment: MerchantId;
  travel: MerchantId;
}

const COUNTRY_TRANSACTION_PROFILES: Record<Country, CountryTransactionProfile> = {
  RO: {
    salaryPayer: "Dante International",
    freelancePayer: "PFA Popescu Andreea",
    person: "Andreea Popescu",
    secondaryPerson: "Mihai Ionescu",
    utility: "Enel Energie",
    publicTransport: "STB",
    transport: "Metrorex",
    publicInstitution: "ANAF",
    home: "Apulum Residence",
    education: "Scoala Spectrum",
    insurance: "NN Asigurari",
    childcare: "Little Team",
    investments: "TradeVille",
    wallet: "Apple Pay Wallet",
    charity: "Crucea Rosie",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Piata Obor",
    merchants: {
      groceries: "carrefour",
      groceriesAlt: "lidl",
      fuel: "shell",
      pharmacy: "dm",
      electronics: "emag",
      fashion: "hm",
      sports: "nike",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "kfc",
      fastFood: "mcdonalds",
      delivery: "glovo",
      rideHailing: "uber",
      streaming: "youtube-premium",
      digital: "apple",
      entertainment: "hbo-max",
      travel: "booking-com",
    },
  },
  CZ: {
    salaryPayer: "Seznam.cz",
    freelancePayer: "Freelancer Petr Novak",
    person: "Petr Novak",
    secondaryPerson: "Jana Svobodova",
    utility: "CEZ",
    publicTransport: "DPP",
    transport: "Ceske drahy",
    publicInstitution: "Financni sprava",
    home: "CPI Byty",
    education: "Skola Praha",
    insurance: "Kooperativa",
    childcare: "Skolka Praha",
    investments: "Portu",
    wallet: "Apple Pay Wallet",
    charity: "Charita CR",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Farmers Market",
    merchants: {
      groceries: "tesco",
      groceriesAlt: "lidl",
      fuel: "shell",
      pharmacy: "dm",
      electronics: "media-markt",
      fashion: "zara",
      sports: "adidas",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "burger-king",
      fastFood: "mcdonalds",
      delivery: "foodpanda",
      rideHailing: "uber",
      streaming: "spotify",
      digital: "steam",
      entertainment: "hbo-max",
      travel: "booking-com",
    },
  },
  SK: {
    salaryPayer: "Eset",
    freelancePayer: "Freelancer Lucia Horvathova",
    person: "Lucia Horvathova",
    secondaryPerson: "Martin Kollar",
    utility: "ZSE Energia",
    publicTransport: "Dopravny podnik",
    transport: "ZSSK",
    publicInstitution: "Financna sprava",
    home: "Bratislava Rent",
    education: "Skola Novohradska",
    insurance: "Union poistovna",
    childcare: "Skolka Bratislava",
    investments: "Finax",
    wallet: "Google Pay Wallet",
    charity: "Liga proti rakovine",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Trhovisko Mileticova",
    merchants: {
      groceries: "lidl",
      groceriesAlt: "kaufland",
      fuel: "shell",
      pharmacy: "dm",
      electronics: "media-markt",
      fashion: "hm",
      sports: "puma",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "kfc",
      fastFood: "mcdonalds",
      delivery: "foodpanda",
      rideHailing: "uber",
      streaming: "netflix",
      digital: "playstation",
      entertainment: "hbo-max",
      travel: "ryanair",
    },
  },
  HU: {
    salaryPayer: "Graphisoft",
    freelancePayer: "Freelancer Nagy Anna",
    person: "Nagy Anna",
    secondaryPerson: "Kovacs Peter",
    utility: "MVM",
    publicTransport: "BKK",
    transport: "MAV",
    publicInstitution: "NAV",
    home: "Otthon Centrum",
    education: "Budapest School",
    insurance: "Allianz",
    childcare: "Ovoda Budapest",
    investments: "Concorde",
    wallet: "Apple Pay Wallet",
    charity: "Magyar Voroskereszt",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Lehel Market",
    merchants: {
      groceries: "tesco",
      groceriesAlt: "auchan",
      fuel: "shell",
      pharmacy: "rossmann",
      electronics: "media-markt",
      fashion: "hm",
      sports: "adidas",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "burger-king",
      fastFood: "mcdonalds",
      delivery: "foodpanda",
      rideHailing: "uber",
      streaming: "netflix",
      digital: "steam",
      entertainment: "hbo-max",
      travel: "wizz-air",
    },
  },
  RS: {
    salaryPayer: "Nordeus",
    freelancePayer: "Freelancer Ana Jovanovic",
    person: "Ana Jovanovic",
    secondaryPerson: "Marko Petrovic",
    utility: "EPS",
    publicTransport: "GSP Beograd",
    transport: "Lasta",
    publicInstitution: "Poreska uprava",
    home: "Belgrade Rent",
    education: "Skola Kreativno Pero",
    insurance: "Dunav Osiguranje",
    childcare: "Vrtic Beograd",
    investments: "Ilirika",
    wallet: "Google Pay Wallet",
    charity: "Crveni krst Srbije",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Kalenic Market",
    merchants: {
      groceries: "carrefour",
      groceriesAlt: "lidl",
      fuel: "shell",
      pharmacy: "dm",
      electronics: "media-markt",
      fashion: "zara",
      sports: "nike",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "kfc",
      fastFood: "mcdonalds",
      delivery: "glovo",
      rideHailing: "uber",
      streaming: "spotify",
      digital: "steam",
      entertainment: "hbo-max",
      travel: "booking-com",
    },
  },
  BA: {
    salaryPayer: "Authority Partners",
    freelancePayer: "Freelancer Amir Hadzic",
    person: "Amir Hadzic",
    secondaryPerson: "Lejla Music",
    utility: "Elektroprivreda BIH",
    publicTransport: "Centrotrans",
    transport: "GRAS Sarajevo",
    publicInstitution: "Porezna uprava",
    home: "Sarajevo Rent",
    education: "International School",
    insurance: "Sarajevo Osiguranje",
    childcare: "Obdaniste Sarajevo",
    investments: "Raiffeisen Invest",
    wallet: "Apple Pay Wallet",
    charity: "Crveni kriz BIH",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Markale",
    merchants: {
      groceries: "kaufland",
      groceriesAlt: "lidl",
      fuel: "shell",
      pharmacy: "dm",
      electronics: "media-markt",
      fashion: "hm",
      sports: "adidas",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "burger-king",
      fastFood: "mcdonalds",
      delivery: "glovo",
      rideHailing: "uber",
      streaming: "netflix",
      digital: "steam",
      entertainment: "hbo-max",
      travel: "booking-com",
    },
  },
  BA_BL: {
    salaryPayer: "Authority Partners",
    freelancePayer: "Freelancer Amir Hadzic",
    person: "Amir Hadzic",
    secondaryPerson: "Lejla Music",
    utility: "Elektroprivreda BIH",
    publicTransport: "Centrotrans",
    transport: "GRAS Sarajevo",
    publicInstitution: "Porezna uprava",
    home: "Sarajevo Rent",
    education: "International School",
    insurance: "Sarajevo Osiguranje",
    childcare: "Obdaniste Sarajevo",
    investments: "Raiffeisen Invest",
    wallet: "Apple Pay Wallet",
    charity: "Crveni kriz BIH",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Markale",
    merchants: {
      groceries: "kaufland",
      groceriesAlt: "lidl",
      fuel: "shell",
      pharmacy: "dm",
      electronics: "media-markt",
      fashion: "hm",
      sports: "adidas",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "burger-king",
      fastFood: "mcdonalds",
      delivery: "glovo",
      rideHailing: "uber",
      streaming: "netflix",
      digital: "steam",
      entertainment: "hbo-max",
      travel: "booking-com",
    },
  },
  SI: {
    salaryPayer: "Outfit7",
    freelancePayer: "Freelancer Maja Novak",
    person: "Maja Novak",
    secondaryPerson: "Luka Kranjc",
    utility: "GEN-I",
    publicTransport: "LPP",
    transport: "Slovenske zeleznice",
    publicInstitution: "FURS",
    home: "Ljubljana Rent",
    education: "Vrtec Ljubljana",
    insurance: "Triglav",
    childcare: "Vrtec Ljubljana",
    investments: "NLB Skladi",
    wallet: "Apple Pay Wallet",
    charity: "Rdeci kriz",
    bankFee: "UniCredit Bank Fee",
    atm: "ATM UniCredit",
    uncategorized: "Central Market",
    merchants: {
      groceries: "lidl",
      groceriesAlt: "hofer",
      fuel: "shell",
      pharmacy: "dm",
      electronics: "media-markt",
      fashion: "hm",
      sports: "puma",
      homeStore: "ikea",
      coffee: "starbucks",
      restaurant: "kfc",
      fastFood: "mcdonalds",
      delivery: "glovo",
      rideHailing: "uber",
      streaming: "spotify",
      digital: "steam",
      entertainment: "hbo-max",
      travel: "booking-com",
    },
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
  source: AccountTransaction["source"] = "account",
  merchantId?: MerchantId,
  transferPair?: TransactionTransferPair,
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
    currency,
    amount,
    type: amount >= 0 ? "credit" : "debit",
    category,
    pfmCategory,
    pfmSubcategory,
    status,
    source,
    ...(merchantId ? { merchantId } : {}),
    ...(transferPair ? { transferPair } : {}),
  };
}

const SAVINGS_TRANSFER_PROFILE_INDEX = 100;
const CREDIT_PRODUCT_PROFILE_INDEX = 200;
const MORTGAGE_PROFILE_INDEX = 201;
const CREDIT_CARD_TRANSACTION_PROFILE_INDEX = 300;

/**
 * Builds a market's ledger. The three writers make the merchant rule explicit
 * in the data itself rather than leaving it to the presentation layer:
 *
 * - `account` — paid from the account (standing order, direct debit, transfer,
 *   tax). Keeps the PFM category icon.
 * - `card` — paid with the card at a branded merchant. Addressed by merchant
 *   id, so the ledger label is always the merchant's clean name.
 * - `unbrandedCard` — paid with the card with no brand behind it (ATM cash, a
 *   market stall). Falls back to the PFM category icon by design.
 */
function createTransactionFactory(country: Country, currency: Currency, accountIndex: number) {
  let sequence = 1;

  const write = (
    date: Date,
    label: string,
    details: string,
    baseEurAmount: number,
    category: string,
    pfmSubcategory: string,
    status: AccountTransaction["status"],
    source: AccountTransaction["source"],
    merchantId?: MerchantId,
    transferPair?: TransactionTransferPair,
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
      source,
      merchantId,
      transferPair,
    );

  return {
    account: (
      date: Date,
      label: string,
      details: string,
      baseEurAmount: number,
      category: string,
      pfmSubcategory: string,
      status: AccountTransaction["status"] = "Booked",
    ) => write(date, label, details, baseEurAmount, category, pfmSubcategory, status, "account"),

    card: (
      date: Date,
      merchantId: MerchantId,
      details: string,
      baseEurAmount: number,
      category: string,
      pfmSubcategory: string,
      status: AccountTransaction["status"] = "Booked",
    ) =>
      write(
        date,
        MERCHANTS[merchantId].name,
        details,
        baseEurAmount,
        category,
        pfmSubcategory,
        status,
        "card",
        merchantId,
      ),

    /** Money moved between the customer's own accounts. */
    ownTransfer: (
      date: Date,
      label: string,
      details: string,
      baseEurAmount: number,
      pfmSubcategory: string,
      from: TransactionAccountKind,
      to: TransactionAccountKind,
    ) =>
      write(date, label, details, baseEurAmount, "Internal", pfmSubcategory, "Booked", "account", undefined, {
        from: { kind: "account", account: from },
        to: { kind: "account", account: to },
      }),

    /** A conversion between two of the customer's own currencies. */
    exchange: (date: Date, from: Currency, to: Currency, baseEurAmount: number) =>
      write(
        date,
        `${from} → ${to}`,
        "Currency exchange",
        baseEurAmount,
        "FX",
        "Currency exchange",
        "Booked",
        "account",
        undefined,
        { from: { kind: "currency", currency: from }, to: { kind: "currency", currency: to } },
      ),

    unbrandedCard: (
      date: Date,
      label: string,
      details: string,
      baseEurAmount: number,
      category: string,
      pfmSubcategory: string,
      status: AccountTransaction["status"] = "Booked",
    ) => write(date, label, details, baseEurAmount, category, pfmSubcategory, status, "card"),
  };
}

function getPrimaryCurrentAccountTransactions(
  country: Country,
  currency: Currency,
  accountIndex: number,
  profile: CountryTransactionProfile,
): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, accountIndex);
  const shop = profile.merchants;

  return [
    t.account(new Date(2026, 3, 29), profile.salaryPayer, "Salary April", 1250, "Income", "Salary"),
    t.account(new Date(2026, 3, 27), profile.home, "Standing order", -320, "Home", "Rent and housing"),
    t.card(new Date(2026, 3, 24), shop.groceries, "Card payment", -86.4, "Groceries", "Supermarket"),
    t.card(new Date(2026, 3, 23), shop.fastFood, "Card payment", -11.2, "Lifestyle", "Fast food"),
    t.card(new Date(2026, 3, 22), shop.restaurant, "Card payment", -34.8, "Lifestyle", "Restaurants"),
    t.account(new Date(2026, 3, 20), profile.utility, "Account payment", -72.3, "Utilities", "Utility bill"),
    t.card(new Date(2026, 3, 20), shop.delivery, "Card payment", -23.4, "Lifestyle", "Fast food"),
    t.account(new Date(2026, 3, 18), profile.person, "Incoming transfer", 120, "Transfers", "Incoming transfer"),
    t.card(new Date(2026, 3, 16), shop.pharmacy, "Card payment", -28.5, "Healthcare", "Pharmacy"),
    t.account(new Date(2026, 3, 14), profile.insurance, "Direct debit", -39.2, "Insurance", "Insurance premium"),
    t.account(new Date(2026, 3, 12), profile.education, "Account payment", -58, "Education", "School fee"),
    t.card(new Date(2026, 3, 12), shop.homeStore, "Card payment", -118, "Home", "Furniture"),
    t.account(new Date(2026, 3, 10), profile.childcare, "Account payment", -95, "Children", "Childcare"),
    t.card(new Date(2026, 3, 10), shop.rideHailing, "Card payment", -9.6, "Transportation", "Public transport"),
    t.card(new Date(2026, 3, 8), shop.fuel, "Card payment", -51.2, "Transportation", "Fuel and transport"),
    t.card(new Date(2026, 3, 8), shop.coffee, "Card payment", -8.9, "Lifestyle", "Coffee shop", "Pending"),
    t.card(new Date(2026, 3, 6), shop.electronics, "Online card payment", -74.5, "Shopping", "Online purchase"),
    // A second order at the same online retailer, still authorising — this is
    // the reference pending card row across the demo.
    t.card(new Date(2026, 3, 6), shop.electronics, "Card payment", -29.5, "Shopping", "Pending card payment", "Pending"),
    t.card(new Date(2026, 3, 4), shop.streaming, "Card payment", -12.99, "Leisure time", "Subscriptions"),
    t.card(new Date(2026, 3, 4), shop.entertainment, "Card payment", -16.5, "Lifestyle", "Music & movies"),
    t.account(new Date(2026, 3, 4), profile.publicInstitution, "Account payment", -210, "Taxes and Penalties", "Taxes and fees"),
    t.card(new Date(2026, 3, 1), shop.groceriesAlt, "Card payment", -32.7, "Groceries", "Supermarket"),
    t.account(new Date(2026, 3, 30), profile.atm, "Cash withdrawal", -60, "ATM", "Cash withdrawal"),
    t.account(new Date(2026, 3, 29), "Cash deposit", "Branch cash deposit", 75, "Wallet", "Cash deposit"),
    t.account(new Date(2026, 3, 27), profile.wallet, "Mobile wallet top-up", -45, "Wallet", "Wallet top-up"),
    t.card(new Date(2026, 3, 24), shop.pharmacy, "Card payment", -46, "Healthcare", "Personal care"),
    t.account(new Date(2026, 3, 23), profile.investments, "Account payment", -150, "Investments", "Broker transfer"),
    t.account(new Date(2026, 3, 22), profile.bankFee, "Monthly package fee", -4.5, "Finance", "Bank fees"),
    t.exchange(new Date(2026, 3, 20), "EUR", currency, -8.2),
    t.ownTransfer(new Date(2026, 3, 17), "Transfer to savings", "Own account transfer", -220, "Own account transfer", "current", "savings"),
    t.account(new Date(2026, 3, 16), profile.charity, "Excluded from budget", -25, "Exclude from budget", "Excluded payment"),
    // A market stall takes cards but has no brand behind it, so this row keeps
    // the PFM category icon. It is the reference case for the fallback.
    t.unbrandedCard(new Date(2026, 3, 14), profile.uncategorized, "Card payment", -14.6, "Uncategorized", "Needs category"),
    t.account(new Date(2025, 11, 18), profile.salaryPayer, "Year-end bonus", 840, "Income", "Salary"),
    t.card(new Date(2025, 11, 20), shop.electronics, "Online card payment", -260, "Shopping", "Online purchase"),
    t.card(new Date(2025, 11, 12), shop.fashion, "Holiday shopping", -190.4, "Shopping", "Retail purchase"),
    t.account(new Date(2025, 10, 27), profile.home, "Standing order", -320, "Home", "Rent and housing"),
    t.account(new Date(2025, 10, 19), profile.utility, "Account payment", -68.2, "Utilities", "Utility bill"),
  ];
}

function getSecondaryCurrentAccountTransactions(
  country: Country,
  currency: Currency,
  accountIndex: number,
  profile: CountryTransactionProfile,
): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, accountIndex);
  const shop = profile.merchants;

  return [
    t.account(new Date(2026, 3, 28), profile.freelancePayer, "Invoice payment", 640, "Income", "Freelance income"),
    t.account(new Date(2026, 3, 26), profile.secondaryPerson, "Shared rent transfer", 160, "Transfers", "Incoming transfer"),
    t.card(new Date(2026, 3, 25), shop.sports, "Card payment", -64.5, "Lifestyle", "Sports"),
    // The transit operator bills the account directly, so this row is an
    // institution payment and keeps the PFM Transportation icon.
    t.account(new Date(2026, 3, 23), profile.publicTransport, "Monthly pass", -27.5, "Transportation", "Public transport"),
    t.card(new Date(2026, 3, 22), shop.fastFood, "Card payment", -12.6, "Lifestyle", "Fast food"),
    t.card(new Date(2026, 3, 21), shop.coffee, "Card payment", -9.8, "Lifestyle", "Coffee shop"),
    t.card(new Date(2026, 3, 19), shop.groceriesAlt, "Card payment", -48.6, "Groceries", "Supermarket"),
    t.card(new Date(2026, 3, 18), shop.delivery, "Card payment", -19.9, "Lifestyle", "Fast food"),
    t.account(new Date(2026, 3, 17), profile.utility, "Direct debit", -54.4, "Utilities", "Utility bill"),
    t.card(new Date(2026, 3, 16), shop.digital, "Card payment", -21.5, "Shopping", "Books, music, video games"),
    t.card(new Date(2026, 3, 15), shop.fashion, "Card payment", -39.9, "Shopping", "Retail purchase"),
    t.card(new Date(2026, 3, 13), shop.pharmacy, "Card payment", -18.4, "Healthcare", "Pharmacy"),
    t.card(new Date(2026, 3, 12), shop.rideHailing, "Card payment", -14.2, "Transportation", "Public transport"),
    t.account(new Date(2026, 3, 11), profile.insurance, "Account payment", -22.6, "Insurance", "Policy payment"),
    t.account(new Date(2026, 3, 9), profile.publicInstitution, "Account payment", -76, "Taxes and Penalties", "Local tax"),
    t.account(new Date(2026, 3, 5), profile.investments, "Recurring investment", -80, "Investments", "Investment plan"),
    t.account(new Date(2026, 2, 29), profile.childcare, "Account payment", -64, "Children", "Child expenses"),
    t.account(new Date(2026, 2, 25), profile.education, "Course fee", -42, "Education", "Courses"),
    t.card(new Date(2026, 2, 20), shop.streaming, "Subscription renewal", -14.99, "Leisure time", "Subscriptions"),
    t.account(new Date(2026, 2, 16), profile.bankFee, "Card administration fee", -3.5, "Finance", "Bank fees"),
    t.exchange(new Date(2026, 2, 12), "USD", currency, -5.8),
    t.ownTransfer(new Date(2026, 2, 8), "Transfer to Emergency Fund", "Own account transfer", -140, "Own account transfer", "current", "savings"),
    t.account(new Date(2026, 1, 27), profile.atm, "Cash withdrawal", -40, "ATM", "Cash withdrawal"),
    t.unbrandedCard(new Date(2026, 1, 20), profile.uncategorized, "Card payment", -11.4, "Uncategorized", "Needs category"),
    t.account(new Date(2025, 11, 22), profile.freelancePayer, "Freelance payout", 420, "Income", "Freelance income"),
    t.card(new Date(2025, 11, 8), shop.pharmacy, "Card payment", -96.5, "Healthcare", "Pharmacy"),
    t.account(new Date(2025, 10, 23), profile.publicTransport, "Transport pass", -48.3, "Transportation", "Public transport"),
    t.card(new Date(2025, 10, 11), shop.groceries, "Card payment", -72.8, "Groceries", "Supermarket"),
  ];
}

function getSavingsTransferTransactions(country: Country, currency: Currency, accountIndex: number): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, accountIndex);

  return [
    t.ownTransfer(new Date(2026, 3, 25), "Transfer from Primary Account", "Own account transfer", 300, "Savings transfer", "current", "savings"),
    t.ownTransfer(new Date(2026, 3, 18), "Transfer to Primary Account", "Own account transfer", -110, "Savings transfer", "savings", "current"),
    t.ownTransfer(new Date(2026, 3, 11), "Automatic savings transfer", "Own account transfer", 220, "Savings transfer", "current", "savings"),
    t.ownTransfer(new Date(2026, 3, 4), "Transfer to Term Deposit", "Own account transfer", -150, "Term deposit transfer", "savings", "deposit"),
    t.ownTransfer(new Date(2026, 2, 22), "Transfer from Current Account", "Own account transfer", 180, "Savings transfer", "current", "savings"),
    t.ownTransfer(new Date(2026, 2, 7), "Transfer to Current Account", "Own account transfer", -90, "Savings transfer", "savings", "current"),
    t.ownTransfer(new Date(2026, 1, 14), "Reserve transfer", "Own account transfer", 75, "Savings transfer", "current", "savings"),
    t.ownTransfer(new Date(2025, 11, 6), "Year-end savings transfer", "Own account transfer", 140, "Savings transfer", "current", "savings"),
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
    t.account(new Date(2026, 3, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
    t.account(new Date(2026, 3, 22), "Interest charge", interestDetails, -42.4, "Finance", "Interest"),
    t.account(new Date(2026, 3, 15), profile.insurance, "Loan insurance", -18.5, "Insurance", "Insurance premium"),
    t.account(new Date(2026, 2, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
    t.account(new Date(2026, 2, 22), "Interest charge", interestDetails, -44.1, "Finance", "Interest"),
    t.account(new Date(2026, 1, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
    t.account(new Date(2025, 11, 22), "Monthly repayment", "Account payment", -260, "Finance", repaymentLabel),
  ];
}

function getCreditCardTransactions(
  country: Country,
  currency: Currency,
  profile: CountryTransactionProfile,
): AccountTransaction[] {
  const t = createTransactionFactory(country, currency, CREDIT_CARD_TRANSACTION_PROFILE_INDEX);
  const shop = profile.merchants;

  // A credit card ledger is merchant spend end to end: every row here is a
  // brand, which is exactly what the card statement should look like.
  return [
    t.card(new Date(2026, 3, 29), shop.electronics, "Online card payment", -120, "Shopping", "Online purchase"),
    t.card(new Date(2026, 3, 27), shop.homeStore, "Card payment", -320, "Home", "Furniture"),
    t.card(new Date(2026, 3, 24), shop.travel, "Card payment", -212, "Leisure time", "Hotels & accommodation"),
    t.card(new Date(2026, 3, 22), shop.restaurant, "Card payment", -46, "Lifestyle", "Restaurants"),
    t.card(new Date(2026, 3, 18), shop.fashion, "Card payment", -64.9, "Shopping", "Retail purchase"),
    t.card(new Date(2026, 3, 16), shop.fuel, "Card payment", -54, "Transportation", "Fuel and transport"),
    t.card(new Date(2026, 3, 11), shop.entertainment, "Card payment", -18, "Lifestyle", "Music & movies"),
    t.card(new Date(2026, 2, 28), shop.streaming, "Card payment", -12.99, "Leisure time", "Subscriptions"),
    t.card(new Date(2026, 2, 22), shop.delivery, "Card payment", -27.5, "Lifestyle", "Fast food"),
    t.card(new Date(2026, 2, 18), shop.groceries, "Card payment", -72, "Groceries", "Supermarket"),
  ];
}

/** Who pays this country's salary. The home activity card names the employer, as the statement does. */
export function getSalaryPayer(country: Country): string {
  return COUNTRY_TRANSACTION_PROFILES[country].salaryPayer;
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

export function getCardTransactions(
  country: Country,
  card: DebitCard | CreditCard,
  currency: Currency,
  linkedAccountIndex = 0,
): AccountTransaction[] {
  if (card.type === "debit_card") {
    return getAccountTransactions(country, linkedAccountIndex, currency)
      .filter((transaction) => transaction.source === "card");
  }

  return getCreditCardTransactions(country, currency, COUNTRY_TRANSACTION_PROFILES[country]);
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
      monthKey: transaction.monthKey,
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

export function groupAccountTransactionsByDate(
  transactions: AccountTransaction[],
): AccountTransactionDateGroup[] {
  const groups = new Map<string, AccountTransactionDateGroup>();

  transactions.forEach((transaction) => {
    const dateKey = `${transaction.monthKey}-${String(Number(transaction.day)).padStart(2, "0")}`;
    const existing = groups.get(dateKey);
    if (existing) {
      existing.transactions.push(transaction);
      existing.dailyTotal += transaction.amount;
      return;
    }

    const [year = "", month = "01"] = transaction.monthKey.split("-");
    groups.set(dateKey, {
      dateKey,
      dateTitle: `${Number(transaction.day)} ${MONTH_NAMES[Number(month) - 1] ?? transaction.month} ${year}`,
      transactions: [transaction],
      dailyTotal: transaction.amount,
    });
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, group]) => group);
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
