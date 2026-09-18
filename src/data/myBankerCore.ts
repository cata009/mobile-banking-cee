/**
 * My Banker — Core system mock (Serbia retail / FL only).
 *
 * Everything here stands in for data the app READS from the Core system:
 * client attributes, the peer sample used for the comparison, and the product
 * catalogue with its rate parameterization. The app never decides a rate — it
 * looks one up. Keeping the parameterization here (and not in the screen) is
 * the point: rate rows can vary by currency, amount and term without a single
 * UI change.
 *
 * The legal-entity (PL) catalogue is deliberately out of scope; this release
 * serves individuals only.
 */

/** Catalogue keys of the retail (FL) product set. */
export type MyBankerProductKey =
  | "term-deposit"
  | "cash-loan"
  | "mortgage"
  | "credit-card"
  | "investment-fund"
  | "overdraft";

/** How a product is simulated once amount, currency and term are known. */
export type MyBankerSimulationKind = "return" | "installment" | "revolving";

export type MyBankerCurrency = "RSD" | "EUR";

/** Client type attribute B00CLT. Only "FL" (individual) is served here. */
export type MyBankerClientType = "FL" | "PL";

/** Icons this catalogue uses, all registered in the app icon inventory. */
export type MyBankerProductIcon =
  | "piggy-bank"
  | "circle-dollar-sign"
  | "landmark"
  | "credit-card"
  | "chart-donut"
  | "wallet-cards";

export interface MyBankerRateRow {
  currency: MyBankerCurrency;
  /** Inclusive amount window this row is parameterized for. */
  minAmount: number;
  maxAmount: number;
  /** Inclusive term window in months. Revolving products use 0. */
  minTermMonths: number;
  maxTermMonths: number;
  /** Nominal annual rate in percent, as configured in Core. */
  ratePercent: number;
}

export interface MyBankerAmountRange {
  currency: MyBankerCurrency;
  min: number;
  max: number;
  /** Amount the simulation opens with — a realistic mid-range value. */
  suggested: number;
  step: number;
}

export interface MyBankerTermRange {
  min: number;
  max: number;
  suggested: number;
  step: number;
}

/**
 * What the peer group typically takes for this product — an aggregate, never
 * an individual peer's contract. Core returns the aggregate precisely so the
 * app never has to hold other clients' amounts.
 */
export interface MyBankerPeerTypical {
  currency: MyBankerCurrency;
  amount: number;
  /** Null for revolving products. */
  termMonths: number | null;
}

export interface MyBankerCatalogueProduct {
  key: MyBankerProductKey;
  iconName: MyBankerProductIcon;
  simulation: MyBankerSimulationKind;
  amountRanges: readonly [MyBankerAmountRange, ...MyBankerAmountRange[]];
  /** Null for revolving products, which have no maturity. */
  termMonths: MyBankerTermRange | null;
  rateCard: readonly MyBankerRateRow[];
  /** The group's typical contract — where the simulation opens. */
  peerTypical: MyBankerPeerTypical;
}

/**
 * Retail catalogue. Order here is catalogue order — the screen re-sorts by
 * peer adoption, per US-6.4.
 */
export const MY_BANKER_RETAIL_CATALOGUE: readonly MyBankerCatalogueProduct[] = [
  {
    key: "term-deposit",
    iconName: "piggy-bank",
    simulation: "return",
    amountRanges: [
      { currency: "RSD", min: 50_000, max: 5_000_000, suggested: 600_000, step: 10_000 },
      { currency: "EUR", min: 500, max: 50_000, suggested: 5_000, step: 100 },
    ],
    termMonths: { min: 3, max: 36, suggested: 12, step: 3 },
    rateCard: [
      { currency: "RSD", minAmount: 50_000, maxAmount: 999_999, minTermMonths: 3, maxTermMonths: 11, ratePercent: 3.15 },
      { currency: "RSD", minAmount: 50_000, maxAmount: 999_999, minTermMonths: 12, maxTermMonths: 36, ratePercent: 4.05 },
      { currency: "RSD", minAmount: 1_000_000, maxAmount: 5_000_000, minTermMonths: 3, maxTermMonths: 11, ratePercent: 3.6 },
      { currency: "RSD", minAmount: 1_000_000, maxAmount: 5_000_000, minTermMonths: 12, maxTermMonths: 36, ratePercent: 4.55 },
      { currency: "EUR", minAmount: 500, maxAmount: 9_999, minTermMonths: 3, maxTermMonths: 11, ratePercent: 1.85 },
      { currency: "EUR", minAmount: 500, maxAmount: 9_999, minTermMonths: 12, maxTermMonths: 36, ratePercent: 2.45 },
      { currency: "EUR", minAmount: 10_000, maxAmount: 50_000, minTermMonths: 3, maxTermMonths: 11, ratePercent: 2.1 },
      { currency: "EUR", minAmount: 10_000, maxAmount: 50_000, minTermMonths: 12, maxTermMonths: 36, ratePercent: 2.8 },
    ],
    peerTypical: { currency: "RSD", amount: 420_000, termMonths: 12 },
  },
  {
    key: "cash-loan",
    iconName: "circle-dollar-sign",
    simulation: "installment",
    amountRanges: [
      { currency: "RSD", min: 100_000, max: 3_000_000, suggested: 900_000, step: 10_000 },
      { currency: "EUR", min: 1_000, max: 30_000, suggested: 8_000, step: 100 },
    ],
    termMonths: { min: 12, max: 95, suggested: 48, step: 1 },
    rateCard: [
      { currency: "RSD", minAmount: 100_000, maxAmount: 599_999, minTermMonths: 12, maxTermMonths: 95, ratePercent: 13.45 },
      { currency: "RSD", minAmount: 600_000, maxAmount: 1_499_999, minTermMonths: 12, maxTermMonths: 60, ratePercent: 12.2 },
      { currency: "RSD", minAmount: 600_000, maxAmount: 1_499_999, minTermMonths: 61, maxTermMonths: 95, ratePercent: 12.95 },
      { currency: "RSD", minAmount: 1_500_000, maxAmount: 3_000_000, minTermMonths: 12, maxTermMonths: 95, ratePercent: 11.6 },
      { currency: "EUR", minAmount: 1_000, maxAmount: 9_999, minTermMonths: 12, maxTermMonths: 95, ratePercent: 9.4 },
      { currency: "EUR", minAmount: 10_000, maxAmount: 30_000, minTermMonths: 12, maxTermMonths: 60, ratePercent: 8.55 },
      { currency: "EUR", minAmount: 10_000, maxAmount: 30_000, minTermMonths: 61, maxTermMonths: 95, ratePercent: 8.95 },
    ],
    peerTypical: { currency: "RSD", amount: 780_000, termMonths: 48 },
  },
  {
    key: "mortgage",
    iconName: "landmark",
    simulation: "installment",
    amountRanges: [
      { currency: "EUR", min: 10_000, max: 200_000, suggested: 85_000, step: 1_000 },
      { currency: "RSD", min: 1_000_000, max: 20_000_000, suggested: 9_000_000, step: 100_000 },
    ],
    termMonths: { min: 60, max: 360, suggested: 240, step: 12 },
    rateCard: [
      { currency: "EUR", minAmount: 10_000, maxAmount: 49_999, minTermMonths: 60, maxTermMonths: 360, ratePercent: 6.1 },
      { currency: "EUR", minAmount: 50_000, maxAmount: 99_999, minTermMonths: 60, maxTermMonths: 240, ratePercent: 5.65 },
      { currency: "EUR", minAmount: 50_000, maxAmount: 99_999, minTermMonths: 241, maxTermMonths: 360, ratePercent: 5.9 },
      { currency: "EUR", minAmount: 100_000, maxAmount: 200_000, minTermMonths: 60, maxTermMonths: 360, ratePercent: 5.35 },
      { currency: "RSD", minAmount: 1_000_000, maxAmount: 20_000_000, minTermMonths: 60, maxTermMonths: 360, ratePercent: 8.45 },
    ],
    peerTypical: { currency: "EUR", amount: 72_000, termMonths: 240 },
  },
  {
    key: "credit-card",
    iconName: "credit-card",
    simulation: "revolving",
    amountRanges: [
      { currency: "RSD", min: 30_000, max: 600_000, suggested: 150_000, step: 10_000 },
      { currency: "EUR", min: 300, max: 5_000, suggested: 1_300, step: 100 },
    ],
    termMonths: null,
    rateCard: [
      { currency: "RSD", minAmount: 30_000, maxAmount: 199_999, minTermMonths: 0, maxTermMonths: 0, ratePercent: 19.9 },
      { currency: "RSD", minAmount: 200_000, maxAmount: 600_000, minTermMonths: 0, maxTermMonths: 0, ratePercent: 18.4 },
      { currency: "EUR", minAmount: 300, maxAmount: 5_000, minTermMonths: 0, maxTermMonths: 0, ratePercent: 15.9 },
    ],
    peerTypical: { currency: "RSD", amount: 120_000, termMonths: null },
  },
  {
    key: "investment-fund",
    iconName: "chart-donut",
    simulation: "return",
    amountRanges: [
      { currency: "RSD", min: 10_000, max: 2_000_000, suggested: 300_000, step: 10_000 },
      { currency: "EUR", min: 100, max: 20_000, suggested: 3_000, step: 100 },
    ],
    termMonths: { min: 12, max: 120, suggested: 60, step: 12 },
    rateCard: [
      { currency: "RSD", minAmount: 10_000, maxAmount: 2_000_000, minTermMonths: 12, maxTermMonths: 35, ratePercent: 3.9 },
      { currency: "RSD", minAmount: 10_000, maxAmount: 2_000_000, minTermMonths: 36, maxTermMonths: 120, ratePercent: 5.6 },
      { currency: "EUR", minAmount: 100, maxAmount: 20_000, minTermMonths: 12, maxTermMonths: 35, ratePercent: 3.4 },
      { currency: "EUR", minAmount: 100, maxAmount: 20_000, minTermMonths: 36, maxTermMonths: 120, ratePercent: 5.1 },
    ],
    peerTypical: { currency: "RSD", amount: 180_000, termMonths: 60 },
  },
  {
    key: "overdraft",
    iconName: "wallet-cards",
    simulation: "revolving",
    amountRanges: [
      { currency: "RSD", min: 10_000, max: 300_000, suggested: 80_000, step: 5_000 },
      { currency: "EUR", min: 100, max: 2_500, suggested: 700, step: 50 },
    ],
    termMonths: null,
    rateCard: [
      { currency: "RSD", minAmount: 10_000, maxAmount: 99_999, minTermMonths: 0, maxTermMonths: 0, ratePercent: 23.9 },
      { currency: "RSD", minAmount: 100_000, maxAmount: 300_000, minTermMonths: 0, maxTermMonths: 0, ratePercent: 21.5 },
      { currency: "EUR", minAmount: 100, maxAmount: 2_500, minTermMonths: 0, maxTermMonths: 0, ratePercent: 17.9 },
    ],
    peerTypical: { currency: "RSD", amount: 65_000, termMonths: null },
  },
] as const;

/** Client attributes as they arrive from Core. */
export interface MyBankerClientAttributes {
  /** Core client identifier, quoted back to the RM on a request. */
  clientId: string;
  /** B00CLT — client type. */
  clientType: MyBankerClientType;
  /** B00DOB — date of birth, ISO date. Age is derived, never stored. */
  dateOfBirth: string;
  /** B70AMT — monthly income, compared in EUR. */
  monthlyIncomeEur: number;
}

export interface MyBankerPeer {
  id: string;
  age: number;
  monthlyIncomeEur: number;
  products: readonly MyBankerProductKey[];
}

const P = {
  td: "term-deposit",
  cl: "cash-loan",
  mg: "mortgage",
  cc: "credit-card",
  fund: "investment-fund",
  od: "overdraft",
} as const satisfies Record<string, MyBankerProductKey>;

/**
 * Peer sample. Only clients matching BOTH the age band and the income band of
 * the active client are ever compared — the extra bands below exist so that
 * the filtering is provably doing something.
 *
 * Band 35–44 / 2,500–3,499 EUR holds 24 clients, which is what the shipped
 * persona matches. Band <25 / ≤1,499 EUR holds 3 — under the minimum of 5, so
 * it renders the "no info" presentation instead of percentages.
 */
export const MY_BANKER_PEERS: readonly MyBankerPeer[] = [
  // ── 35–44 / 2,500–3,499 EUR — 24 clients ──────────────────────────────
  { id: "p-01", age: 36, monthlyIncomeEur: 2_540, products: [P.od, P.cc, P.td] },
  { id: "p-02", age: 38, monthlyIncomeEur: 2_610, products: [P.od, P.cc, P.cl] },
  { id: "p-03", age: 41, monthlyIncomeEur: 2_680, products: [P.od, P.cc, P.td, P.mg] },
  { id: "p-04", age: 35, monthlyIncomeEur: 2_720, products: [P.od, P.cc, P.cl, P.fund] },
  { id: "p-05", age: 43, monthlyIncomeEur: 2_760, products: [P.od, P.cc, P.cl] },
  { id: "p-06", age: 39, monthlyIncomeEur: 2_800, products: [P.od, P.cc, P.td] },
  { id: "p-07", age: 37, monthlyIncomeEur: 2_840, products: [P.od, P.cl] },
  { id: "p-08", age: 44, monthlyIncomeEur: 2_880, products: [P.od, P.td, P.mg] },
  { id: "p-09", age: 40, monthlyIncomeEur: 2_910, products: [P.cc] },
  { id: "p-10", age: 36, monthlyIncomeEur: 2_950, products: [P.od, P.cl] },
  { id: "p-11", age: 42, monthlyIncomeEur: 2_990, products: [P.cc, P.td, P.fund] },
  { id: "p-12", age: 38, monthlyIncomeEur: 3_020, products: [P.od, P.cl] },
  { id: "p-13", age: 41, monthlyIncomeEur: 3_060, products: [P.cc, P.td] },
  { id: "p-14", age: 35, monthlyIncomeEur: 3_100, products: [P.od, P.cl] },
  { id: "p-15", age: 39, monthlyIncomeEur: 3_140, products: [P.cc, P.mg] },
  { id: "p-16", age: 43, monthlyIncomeEur: 3_180, products: [P.od, P.cl] },
  { id: "p-17", age: 37, monthlyIncomeEur: 3_220, products: [P.cc, P.fund] },
  { id: "p-18", age: 44, monthlyIncomeEur: 3_260, products: [P.od, P.td] },
  { id: "p-19", age: 40, monthlyIncomeEur: 3_300, products: [P.cc, P.mg] },
  { id: "p-20", age: 36, monthlyIncomeEur: 3_340, products: [P.od, P.cl] },
  { id: "p-21", age: 42, monthlyIncomeEur: 3_380, products: [P.cc, P.td, P.mg] },
  { id: "p-22", age: 38, monthlyIncomeEur: 3_420, products: [P.od, P.td] },
  { id: "p-23", age: 41, monthlyIncomeEur: 3_460, products: [P.cl] },
  { id: "p-24", age: 39, monthlyIncomeEur: 3_490, products: [P.cl, P.fund] },

  // ── 35–44 / 1,500–2,499 EUR — different income band, never mixed in ───
  { id: "p-25", age: 37, monthlyIncomeEur: 1_620, products: [P.cc, P.od] },
  { id: "p-26", age: 40, monthlyIncomeEur: 1_780, products: [P.cl, P.od] },
  { id: "p-27", age: 43, monthlyIncomeEur: 1_950, products: [P.cc, P.cl] },
  { id: "p-28", age: 36, monthlyIncomeEur: 2_100, products: [P.od] },
  { id: "p-29", age: 42, monthlyIncomeEur: 2_280, products: [P.cc, P.td] },
  { id: "p-30", age: 38, monthlyIncomeEur: 2_400, products: [P.cc, P.cl, P.od] },

  // ── 45–54 / 2,500–3,499 EUR — different age band, never mixed in ──────
  { id: "p-31", age: 46, monthlyIncomeEur: 2_620, products: [P.td, P.fund] },
  { id: "p-32", age: 49, monthlyIncomeEur: 2_880, products: [P.td, P.mg, P.cc] },
  { id: "p-33", age: 52, monthlyIncomeEur: 3_050, products: [P.td, P.fund, P.cc] },
  { id: "p-34", age: 47, monthlyIncomeEur: 3_240, products: [P.td, P.od] },
  { id: "p-35", age: 54, monthlyIncomeEur: 3_400, products: [P.td, P.fund] },

  // ── <25 / ≤1,499 EUR — 3 clients, under the minimum peer group size ───
  { id: "p-36", age: 22, monthlyIncomeEur: 980, products: [P.cc, P.od] },
  { id: "p-37", age: 23, monthlyIncomeEur: 1_150, products: [P.od] },
  { id: "p-38", age: 24, monthlyIncomeEur: 1_320, products: [P.cc, P.fund] },
] as const;

/**
 * Personas the demo can put in front of the peer engine. The banking scenario
 * chosen in the demo control panel picks one, so the "no info" presentation is
 * reachable without special-casing the screen.
 */
export const MY_BANKER_CLIENTS = {
  /** Matches the 24-client band — the everyday case. */
  established: {
    clientId: "RS-4471-2098",
    clientType: "FL",
    dateOfBirth: "1988-04-17",
    monthlyIncomeEur: 2_850,
  },
  /** Matches the 3-client band — below the minimum, so percentages read "no info". */
  prospect: {
    clientId: "RS-4471-5512",
    clientType: "FL",
    dateOfBirth: "2003-09-02",
    monthlyIncomeEur: 1_150,
  },
} as const satisfies Record<string, MyBankerClientAttributes>;

/** A peer group below this size is never published as percentages. */
export const MY_BANKER_MIN_PEER_GROUP = 5;

/** Relationship manager the inquiry e-mail is routed to. */
export const MY_BANKER_RM = {
  name: "Marko Jovanović",
  email: "marko.jovanovic@unicreditgroup.rs",
} as const;
