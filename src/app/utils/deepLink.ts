/**
 * Deep Link State
 *
 * Encodes the full stakeholder-visible demo state into shareable URL query
 * params, and restores it on load. Lets anyone open the exact same
 * product / country / scenario / release / screen / language / theme another
 * person is looking at.
 *
 * Design notes:
 * - Uses query params (window.location.search), NOT the hash — the hash is
 *   already owned by the Design System section navigation.
 * - Readable param names on purpose: this is an internal design tool, so a
 *   link that a designer/PM can eyeball and tweak is a feature.
 * - Every value is validated against the real registries on read; unknown
 *   values are dropped so a hand-edited link can never crash the app.
 */

import { COUNTRIES } from "@/app/registry/demoConfig";
import { PRODUCT_ORDER } from "@/app/registry/projectModel";
import { RELEASE_ORDER, getReleaseBundle } from "@/app/registry/releaseRegistry";
import { BANKING_SCENARIOS } from "@/app/platform/banking/bankingScenarioRegistry";
import { getAvailableLanguages, type AppLanguage } from "@/app/registry/languageByCountry";
import { FLOW_PREVIEW_ORDER, type FlowPreviewId } from "@/app/registry/flowPreviewRegistry";
import type { Screen } from "@/app/contexts/NavigationContext";
import type {
  BankingScenarioId,
  CountryId,
  DemoState,
  DesignSystemId,
  ProductId,
  ReleaseId,
  Scenario,
  ThemeMode,
} from "@/app/state/demoTypes";

export interface DeepLinkState {
  product: ProductId;
  country: CountryId;
  scenario: Scenario;
  designSystem: DesignSystemId;
  release: ReleaseId;
  bankingScenario: BankingScenarioId;
  themeMode: ThemeMode;
  amountsHidden: boolean;
  language: AppLanguage;
  screen: Screen;
  flowId?: FlowPreviewId | null;
  accountId?: string | null;
  cardId?: string | null;
  /** Frameless "real device" mode — render the app fullscreen, no phone bezel. */
  deviceMode?: boolean;
}

export type ParsedDeepLink = Partial<DeepLinkState>;

/** URL query param keys (kept short-ish but readable). */
const PARAM = {
  product: "product",
  country: "country",
  scenario: "scenario",
  designSystem: "ds",
  release: "release",
  bankingScenario: "bank",
  themeMode: "theme",
  amountsHidden: "hidden",
  language: "lang",
  screen: "screen",
  flowId: "flow",
  accountId: "account",
  cardId: "card",
  frame: "frame",
  shareAccessToken: "access_token",
} as const;

/** Banking scenario chosen when a product is set but no scenario is supplied. */
const DEFAULT_BANKING_SCENARIO_BY_PRODUCT: Record<ProductId, BankingScenarioId> = {
  PI: "retail-single-account",
  SME: "sme-owner-preview",
  KIDS_PI: "kids-child-preview",
};

// ── Validation sets ────────────────────────────────────────────────────────
const VALID_PRODUCTS = new Set<string>(PRODUCT_ORDER);
const VALID_COUNTRIES = new Set<string>(COUNTRIES);
const VALID_RELEASES = new Set<string>(RELEASE_ORDER);
const VALID_BANKING = new Set<string>(Object.keys(BANKING_SCENARIOS));
const VALID_SCENARIOS = new Set<string>(["active", "inactive"]);
const VALID_DESIGN_SYSTEMS = new Set<string>(["current", "next"]);
const VALID_THEMES = new Set<string>(["light", "dark"]);
const VALID_FLOW_PREVIEWS = new Set<string>(FLOW_PREVIEW_ORDER);

/**
 * Screens that can be restored directly from a link. Transient / object-driven
 * screens (payment flow steps, transaction detail) are remapped to their
 * nearest stable parent so a shared link never lands on a blank screen.
 */
const RESTORABLE_SCREENS: ReadonlySet<Screen> = new Set<Screen>([
  "prelogin-inactive",
  "prelogin-active",
  "homepage",
  "analytics",
  "messages",
  "payments",
  "products",
  "investments",
  "prime",
  "more",
  "documents",
  "settings",
  "contacts",
  "account-detail",
  "account-details-info",
  "account-options",
  "card-detail",
  "flow-library",
  "design-system",
]);

const ACCOUNT_CONTEXT_SCREENS: ReadonlySet<Screen> = new Set<Screen>([
  "account-detail",
  "account-details-info",
  "account-options",
]);

/**
 * Map any screen to a directly restorable one. Transient screens fall back to
 * their nearest stable parent.
 */
export function normalizeScreen(screen: Screen, hasCard: boolean): Screen {
  if (RESTORABLE_SCREENS.has(screen)) return screen;

  switch (screen) {
    case "transaction-detail":
      return hasCard ? "card-detail" : "account-detail";
    case "domestic-payment":
    case "payment-review":
    case "payment-sign":
    case "payment-success":
      return "payments";
    case "investments-history":
      return "investments";
    default:
      return "homepage";
  }
}

/**
 * Read the current URL and return a validated partial deep-link state, or
 * `null` when the URL carries none of our params (i.e. a normal, non-shared
 * entry — existing defaults should apply).
 */
export function parseDeepLinkFromUrl(search: string = window.location.search): ParsedDeepLink | null {
  const params = new URLSearchParams(search);

  const hasAnyParam = Object.values(PARAM).some((key) => params.has(key));
  if (!hasAnyParam) return null;

  const parsed: ParsedDeepLink = {};

  const product = params.get(PARAM.product);
  if (product && VALID_PRODUCTS.has(product)) parsed.product = product as ProductId;

  const country = params.get(PARAM.country);
  if (country && VALID_COUNTRIES.has(country)) parsed.country = country as CountryId;

  const scenario = params.get(PARAM.scenario);
  if (scenario && VALID_SCENARIOS.has(scenario)) parsed.scenario = scenario as Scenario;

  const designSystem = params.get(PARAM.designSystem);
  if (designSystem && VALID_DESIGN_SYSTEMS.has(designSystem)) parsed.designSystem = designSystem as DesignSystemId;

  const release = params.get(PARAM.release);
  if (release && VALID_RELEASES.has(release)) parsed.release = release as ReleaseId;

  const bank = params.get(PARAM.bankingScenario);
  if (bank && VALID_BANKING.has(bank)) parsed.bankingScenario = bank as BankingScenarioId;

  const theme = params.get(PARAM.themeMode);
  if (theme && VALID_THEMES.has(theme)) parsed.themeMode = theme as ThemeMode;

  if (params.has(PARAM.amountsHidden)) {
    parsed.amountsHidden = params.get(PARAM.amountsHidden) === "1";
  }

  const screen = params.get(PARAM.screen);
  if (screen) {
    const hasCard = Boolean(params.get(PARAM.cardId));
    parsed.screen = normalizeScreen(screen as Screen, hasCard);
  }

  const flowId = params.get(PARAM.flowId);
  if (flowId && VALID_FLOW_PREVIEWS.has(flowId)) parsed.flowId = flowId as FlowPreviewId;

  // Language is validated against the resolved country (falls back to en).
  const language = params.get(PARAM.language);
  if (language) {
    const forCountry = parsed.country ?? "RO";
    if (getAvailableLanguages(forCountry).includes(language as AppLanguage)) {
      parsed.language = language as AppLanguage;
    }
  }

  const accountId = params.get(PARAM.accountId);
  if (accountId) parsed.accountId = accountId;

  const cardId = params.get(PARAM.cardId);
  if (cardId) parsed.cardId = cardId;

  // frame=0 → frameless "real device" mode.
  if (params.get(PARAM.frame) === "0") parsed.deviceMode = true;

  return parsed;
}

/**
 * Turn a parsed deep link into an initial-state override for the DemoProvider.
 * Baseline is derived from the release bundle (the store's setRelease does the
 * same); banking scenario defaults per product when not supplied.
 */
export function deepLinkToDemoInitialState(parsed: ParsedDeepLink | null): Partial<DemoState> {
  if (!parsed) return {};

  const init: Partial<DemoState> = {};

  if (parsed.product) init.product = parsed.product;
  if (parsed.country) init.country = parsed.country;
  if (parsed.scenario) init.scenario = parsed.scenario;
  if (parsed.designSystem) init.designSystem = parsed.designSystem;

  if (parsed.release) {
    init.release = parsed.release;
    init.baseline = getReleaseBundle(parsed.release).baseline;
  }

  if (parsed.bankingScenario) {
    init.bankingScenario = parsed.bankingScenario;
  } else if (parsed.product) {
    init.bankingScenario = DEFAULT_BANKING_SCENARIO_BY_PRODUCT[parsed.product];
  }

  if (parsed.themeMode) init.themeMode = parsed.themeMode;
  if (parsed.amountsHidden !== undefined) init.amountsHidden = parsed.amountsHidden;

  return init;
}

/**
 * Build the absolute shareable URL for the given state. The screen is
 * normalized so the resulting link is always directly restorable. The hash is
 * preserved only for the Design System (which uses it for section navigation).
 */
export function buildDeepLinkUrl(state: DeepLinkState): string {
  const normalizedScreen = normalizeScreen(state.screen, Boolean(state.cardId));
  const params = new URLSearchParams();

  params.set(PARAM.product, state.product);
  params.set(PARAM.country, state.country);
  params.set(PARAM.scenario, state.scenario);
  params.set(PARAM.designSystem, state.designSystem);
  params.set(PARAM.release, state.release);
  params.set(PARAM.bankingScenario, state.bankingScenario);
  params.set(PARAM.themeMode, state.themeMode);
  params.set(PARAM.language, state.language);
  params.set(PARAM.screen, normalizedScreen);

  if (state.amountsHidden) params.set(PARAM.amountsHidden, "1");

  if (state.flowId && normalizedScreen === "flow-library") {
    params.set(PARAM.flowId, state.flowId);
  }

  if (state.accountId && ACCOUNT_CONTEXT_SCREENS.has(normalizedScreen)) {
    params.set(PARAM.accountId, state.accountId);
  }
  if (state.cardId && normalizedScreen === "card-detail") {
    params.set(PARAM.cardId, state.cardId);
  }

  if (state.deviceMode) params.set(PARAM.frame, "0");

  const { origin, pathname } = window.location;
  const hash = normalizedScreen === "design-system" ? window.location.hash : "";
  return `${origin}${pathname}?${params.toString()}${hash}`;
}

/**
 * Return the same URL forced into frameless "real device" mode (frame=0).
 * Used for the QR code so a phone opens the app fullscreen, without the
 * simulated phone bezel — like entering the real country app directly.
 */
export function withFramelessParam(url: string): string {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set(PARAM.frame, "0");
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

/**
 * Add a short-lived server-signed access token to a share URL. The token is
 * consumed by AccessGate before the app boots and is removed from the address
 * bar after the access cookie is set.
 */
export function withShareAccessTokenParam(url: string, token: string): string {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set(PARAM.shareAccessToken, token);
    return parsedUrl.toString();
  } catch {
    return url;
  }
}
