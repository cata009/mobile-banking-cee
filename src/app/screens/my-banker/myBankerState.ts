/**
 * My Banker — peer analysis, catalogue lookup and simulation.
 *
 * Pure functions only: no React, no formatting decisions that belong to the
 * screen. The rules encoded here are the business rules (bands, minimum peer
 * group, adoption ordering, annuity/return math); everything they read comes
 * from the Core mock in `@/data/myBankerCore`.
 */

import {
  MY_BANKER_MIN_PEER_GROUP,
  MY_BANKER_RETAIL_CATALOGUE,
  type MyBankerCatalogueProduct,
  type MyBankerClientAttributes,
  type MyBankerCurrency,
  type MyBankerPeer,
  type MyBankerProductKey,
} from "@/data/myBankerCore";
import type { Product, ProductType } from "@/data/products";

// ── Bands ──────────────────────────────────────────────────────────────────

export type MyBankerAgeBandId = "under-25" | "25-34" | "35-44" | "45-54" | "55-plus";
export type MyBankerIncomeBandId = "to-1499" | "1500-2499" | "2500-3499" | "3500-plus";

export interface MyBankerBand<Id extends string> {
  id: Id;
  /** Inclusive lower bound. */
  min: number;
  /** Inclusive upper bound, or null when the band is open-ended. */
  max: number | null;
}

/** Age bands from US-6.2, in ascending order. */
export const MY_BANKER_AGE_BANDS: readonly MyBankerBand<MyBankerAgeBandId>[] = [
  { id: "under-25", min: 0, max: 24 },
  { id: "25-34", min: 25, max: 34 },
  { id: "35-44", min: 35, max: 44 },
  { id: "45-54", min: 45, max: 54 },
  { id: "55-plus", min: 55, max: null },
] as const;

/** Monthly income bands from US-6.2, in EUR, ascending. */
export const MY_BANKER_INCOME_BANDS: readonly MyBankerBand<MyBankerIncomeBandId>[] = [
  { id: "to-1499", min: 0, max: 1_499 },
  { id: "1500-2499", min: 1_500, max: 2_499 },
  { id: "2500-3499", min: 2_500, max: 3_499 },
  { id: "3500-plus", min: 3_500, max: null },
] as const;

function findBand<Id extends string>(
  bands: readonly MyBankerBand<Id>[],
  value: number,
): MyBankerBand<Id> | null {
  if (!Number.isFinite(value) || value < 0) return null;
  return bands.find((band) => value >= band.min && (band.max === null || value <= band.max)) ?? null;
}

/** Age derived from B00DOB against a reference date — never stored. */
export function deriveAge(dateOfBirth: string, today: Date): number | null {
  const born = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(born.getTime())) return null;

  let age = today.getFullYear() - born.getFullYear();
  const beforeBirthday =
    today.getMonth() < born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() < born.getDate());
  if (beforeBirthday) age -= 1;

  return age >= 0 ? age : null;
}

export function getAgeBand(age: number): MyBankerBand<MyBankerAgeBandId> | null {
  return findBand(MY_BANKER_AGE_BANDS, age);
}

export function getIncomeBand(monthlyIncomeEur: number): MyBankerBand<MyBankerIncomeBandId> | null {
  return findBand(MY_BANKER_INCOME_BANDS, monthlyIncomeEur);
}

// ── Peer group ─────────────────────────────────────────────────────────────

export interface MyBankerPeerGroup {
  ageBand: MyBankerBand<MyBankerAgeBandId>;
  incomeBand: MyBankerBand<MyBankerIncomeBandId>;
  age: number;
  peers: readonly MyBankerPeer[];
  size: number;
  /**
   * True once the group reaches the minimum size. Below it, no percentage and
   * no peer count may be shown — US-6.2 is explicit that a count under the
   * threshold is itself not publishable.
   */
  isPublishable: boolean;
}

/**
 * Peers matching BOTH the client's age band and income band. Any other
 * overlap (same age, different income) is not a peer.
 */
export function buildPeerGroup(
  client: MyBankerClientAttributes,
  peers: readonly MyBankerPeer[],
  today: Date,
): MyBankerPeerGroup | null {
  const age = deriveAge(client.dateOfBirth, today);
  if (age === null) return null;

  const ageBand = getAgeBand(age);
  const incomeBand = getIncomeBand(client.monthlyIncomeEur);
  if (!ageBand || !incomeBand) return null;

  const matched = peers.filter(
    (peer) =>
      getAgeBand(peer.age)?.id === ageBand.id &&
      getIncomeBand(peer.monthlyIncomeEur)?.id === incomeBand.id,
  );

  return {
    ageBand,
    incomeBand,
    age,
    peers: matched,
    size: matched.length,
    isPublishable: matched.length >= MY_BANKER_MIN_PEER_GROUP,
  };
}

// ── Held products ──────────────────────────────────────────────────────────

/**
 * Retail catalogue keys per demo product type. The business (PL) catalogue
 * uses its own keys and is out of scope for this release.
 */
const RETAIL_KEY_BY_PRODUCT_TYPE: Partial<Record<ProductType, MyBankerProductKey>> = {
  term_deposit: "term-deposit",
  loan: "cash-loan",
  mortgage: "mortgage",
  credit_card: "credit-card",
  investment_account: "investment-fund",
};

/** Catalogue keys the client already holds, from their real portfolio. */
export function getHeldProductKeys(products: readonly Product[]): Set<MyBankerProductKey> {
  const held = new Set<MyBankerProductKey>();
  products.forEach((product) => {
    const key = RETAIL_KEY_BY_PRODUCT_TYPE[product.type];
    if (key) held.add(key);
  });
  return held;
}

// ── Recommendations ────────────────────────────────────────────────────────

export type MyBankerProductStatus = "in-use" | "recommended";

export interface MyBankerRecommendation {
  product: MyBankerCatalogueProduct;
  status: MyBankerProductStatus;
  /** Null whenever the peer group is not publishable — rendered as "no info". */
  adoptionPercent: number | null;
  peersUsing: number | null;
}

/**
 * One row per catalogue product, sorted by peer adoption descending.
 * "No info" rows sort last and keep catalogue order among themselves.
 */
export function buildRecommendations(
  peerGroup: MyBankerPeerGroup | null,
  heldKeys: ReadonlySet<MyBankerProductKey>,
  catalogue: readonly MyBankerCatalogueProduct[] = MY_BANKER_RETAIL_CATALOGUE,
): MyBankerRecommendation[] {
  const publishable = peerGroup?.isPublishable ?? false;

  const rows = catalogue.map((product, index) => {
    const peersUsing = publishable
      ? (peerGroup as MyBankerPeerGroup).peers.filter((peer) => peer.products.includes(product.key)).length
      : null;
    const adoptionPercent =
      peersUsing === null || !peerGroup || peerGroup.size === 0
        ? null
        : Math.round((peersUsing / peerGroup.size) * 100);

    return {
      row: {
        product,
        status: heldKeys.has(product.key) ? ("in-use" as const) : ("recommended" as const),
        adoptionPercent,
        peersUsing,
      },
      index,
    };
  });

  return rows
    .sort((a, b) => {
      const left = a.row.adoptionPercent;
      const right = b.row.adoptionPercent;
      if (left === right) return a.index - b.index;
      if (left === null) return 1;
      if (right === null) return -1;
      return right - left;
    })
    .map((entry) => entry.row);
}

// ── Analysis result ────────────────────────────────────────────────────────

export type MyBankerAnalysis =
  | {
      state: "ready";
      client: MyBankerClientAttributes;
      peerGroup: MyBankerPeerGroup;
      recommendations: MyBankerRecommendation[];
    }
  | { state: "unavailable" };

/**
 * The whole read-side of the screen in one call. Anything that cannot be
 * resolved — an unusable date of birth, an out-of-scope client type, an empty
 * catalogue — resolves to "unavailable" so the screen can render its safe
 * fallback rather than throw.
 */
export function analyzeMyBanker(input: {
  client: MyBankerClientAttributes;
  peers: readonly MyBankerPeer[];
  heldProducts: readonly Product[];
  today: Date;
  catalogue?: readonly MyBankerCatalogueProduct[];
}): MyBankerAnalysis {
  const catalogue = input.catalogue ?? MY_BANKER_RETAIL_CATALOGUE;
  if (input.client.clientType !== "FL" || catalogue.length === 0) return { state: "unavailable" };

  const peerGroup = buildPeerGroup(input.client, input.peers, input.today);
  if (!peerGroup) return { state: "unavailable" };

  return {
    state: "ready",
    client: input.client,
    peerGroup,
    recommendations: buildRecommendations(peerGroup, getHeldProductKeys(input.heldProducts), catalogue),
  };
}

// ── Rates and simulation ───────────────────────────────────────────────────

export interface MyBankerSimulationInput {
  currency: MyBankerCurrency;
  amount: number;
  /** Ignored by revolving products, which have no maturity. */
  termMonths: number;
}

/**
 * The rate Core returns for this exact combination. The app owns no rate
 * logic: an input the rate card does not cover simply has no rate.
 */
export function resolveRate(
  product: MyBankerCatalogueProduct,
  input: MyBankerSimulationInput,
): number | null {
  const term = product.termMonths ? input.termMonths : 0;
  const row = product.rateCard.find(
    (candidate) =>
      candidate.currency === input.currency &&
      input.amount >= candidate.minAmount &&
      input.amount <= candidate.maxAmount &&
      term >= candidate.minTermMonths &&
      term <= candidate.maxTermMonths,
  );
  return row ? row.ratePercent : null;
}

export interface MyBankerSimulation {
  kind: MyBankerCatalogueProduct["simulation"];
  ratePercent: number;
  /** Monthly installment, indicative return, or monthly interest cost. */
  value: number;
  /** Return simulations only: capital plus indicative return. */
  totalAtMaturity: number | null;
}

/** Annuity installment: P·i / (1 − (1+i)^−n). */
function monthlyAnnuity(principal: number, annualRatePercent: number, termMonths: number): number {
  if (termMonths <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
}

/**
 * Runs the simulation on top of the rate Core returned. Returns null when no
 * rate covers the combination, so the card can say so instead of inventing a
 * number.
 */
export function simulateProduct(
  product: MyBankerCatalogueProduct,
  input: MyBankerSimulationInput,
): MyBankerSimulation | null {
  const ratePercent = resolveRate(product, input);
  if (ratePercent === null || input.amount <= 0) return null;

  if (product.simulation === "installment") {
    return {
      kind: "installment",
      ratePercent,
      value: monthlyAnnuity(input.amount, ratePercent, input.termMonths),
      totalAtMaturity: null,
    };
  }

  if (product.simulation === "return") {
    const years = input.termMonths / 12;
    const gross = input.amount * (Math.pow(1 + ratePercent / 100, years) - 1);
    return {
      kind: "return",
      ratePercent,
      value: gross,
      totalAtMaturity: input.amount + gross,
    };
  }

  return {
    kind: "revolving",
    ratePercent,
    value: (input.amount * ratePercent) / 100 / 12,
    totalAtMaturity: null,
  };
}

/** Snaps a value into a range, respecting the configured step. */
export function clampToRange(value: number, range: { min: number; max: number; step: number }): number {
  if (!Number.isFinite(value)) return range.min;
  const bounded = Math.min(range.max, Math.max(range.min, value));
  const stepped = range.min + Math.round((bounded - range.min) / range.step) * range.step;
  return Math.min(range.max, Math.max(range.min, stepped));
}

export function getAmountRange(product: MyBankerCatalogueProduct, currency: MyBankerCurrency) {
  const [fallback] = product.amountRanges;
  return product.amountRanges.find((range) => range.currency === currency) ?? fallback;
}

/** Currencies this product is parameterized for, catalogue order. */
export function getProductCurrencies(
  product: MyBankerCatalogueProduct,
): [MyBankerCurrency, ...MyBankerCurrency[]] {
  const [first, ...rest] = product.amountRanges;
  return [first.currency, ...rest.map((range) => range.currency)];
}

// ── Tracking ───────────────────────────────────────────────────────────────

export type MyBankerEventType = "card_view" | "card_expand" | "simulation_run" | "send_request";

export interface MyBankerEvent {
  type: MyBankerEventType;
  clientId: string;
  productKey: MyBankerProductKey;
  timestamp: string;
  /** Simulation and request events carry the inputs that produced them. */
  detail?: Record<string, string | number>;
}

const EVENT_LOG_LIMIT = 200;
const eventLog: MyBankerEvent[] = [];

/**
 * Engagement log for this screen: view, expand, simulation and submission are
 * distinct events, each with client, product and timestamp, so conversion can
 * be reported per product later.
 */
export function recordMyBankerEvent(event: MyBankerEvent): MyBankerEvent {
  eventLog.push(event);
  if (eventLog.length > EVENT_LOG_LIMIT) eventLog.splice(0, eventLog.length - EVENT_LOG_LIMIT);
  return event;
}

export function getMyBankerEventLog(): readonly MyBankerEvent[] {
  return eventLog;
}

export function resetMyBankerEventLog(): void {
  eventLog.length = 0;
}

// ── Headline rate ──────────────────────────────────────────────────────────

export interface MyBankerRateAnchor {
  /** Lending reads as "from" its lowest rate; savings as "up to" its highest. */
  kind: "from" | "up-to";
  ratePercent: number;
  currency: MyBankerCurrency;
}

/**
 * The one rate worth putting on a collapsed card: the best one the product is
 * parameterized for in its primary currency — lowest for anything the client
 * pays, highest for anything the client earns. It comes from the same rate
 * card the simulation reads, never from a marketing figure.
 */
export function getRateAnchor(product: MyBankerCatalogueProduct): MyBankerRateAnchor | null {
  const [primary] = product.amountRanges;
  const rates = product.rateCard
    .filter((row) => row.currency === primary.currency)
    .map((row) => row.ratePercent);
  if (rates.length === 0) return null;

  const earns = product.simulation === "return";
  return {
    kind: earns ? "up-to" : "from",
    ratePercent: earns ? Math.max(...rates) : Math.min(...rates),
    currency: primary.currency,
  };
}

// ── Profile coverage ───────────────────────────────────────────────────────

export interface MyBankerCoverage {
  /** Catalogue products the client already holds. */
  held: number;
  total: number;
  /** Catalogue order, so the progress segments never reshuffle between runs. */
  segments: readonly { key: MyBankerProductKey; held: boolean }[];
}

/**
 * Where the client stands against the catalogue their peers draw on. This is
 * the first thing the screen says, because a position is easier to act on
 * than six separate percentages.
 */
export function getCoverage(
  recommendations: readonly MyBankerRecommendation[],
  catalogue: readonly MyBankerCatalogueProduct[] = MY_BANKER_RETAIL_CATALOGUE,
): MyBankerCoverage {
  const heldKeys = new Set(
    recommendations.filter((row) => row.status === "in-use").map((row) => row.product.key),
  );
  const segments = catalogue.map((product) => ({ key: product.key, held: heldKeys.has(product.key) }));

  return { held: heldKeys.size, total: catalogue.length, segments };
}

/**
 * The single product to lead with: the one most peers use that the client has
 * not taken. Null when the peer group is unpublishable or nothing is missing.
 */
export function getLeadRecommendation(
  recommendations: readonly MyBankerRecommendation[],
): MyBankerRecommendation | null {
  return (
    recommendations.find((row) => row.status === "recommended" && (row.adoptionPercent ?? 0) > 0) ?? null
  );
}
