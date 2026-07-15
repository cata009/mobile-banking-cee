import type { Screen } from "@/app/contexts/NavigationContext";
import type { CountryId, DesignSystemId, ProductId, ScreenId, ThemeMode } from "@/app/state/demoTypes";

export type RouteSurface = "prelogin" | "app" | "platform";
export type RouteStatusBarVariant = "light" | "dark" | "theme";
export type RoutePayload = "none" | "account" | "card" | "transaction" | "payment-draft" | "product-detail" | "flow";
export type DeepLinkPayload = "none" | "account" | "card" | "flow";

export interface RoutePolicy {
  surface: RouteSurface;
  registryIds: readonly ScreenId[];
  productEligibility: "mobile-runtime" | "unrestricted";
  statusBar: Exclude<RouteStatusBarVariant, "theme">;
  backFallback: Screen;
  payload: RoutePayload;
  deepLink: {
    restorable: boolean;
    fallback: Screen;
    fallbackWithCard?: Screen;
    payload: DeepLinkPayload;
  };
}

const route = (policy: RoutePolicy) => policy;

export const ROUTE_POLICY = {
  "prelogin-inactive": route({ surface: "prelogin", registryIds: ["pi.prelogin.inactive"], productEligibility: "mobile-runtime", statusBar: "dark", backFallback: "prelogin-inactive", payload: "none", deepLink: { restorable: true, fallback: "prelogin-inactive", payload: "none" } }),
  "prelogin-active": route({ surface: "prelogin", registryIds: ["pi.prelogin.active"], productEligibility: "mobile-runtime", statusBar: "dark", backFallback: "prelogin-active", payload: "none", deepLink: { restorable: true, fallback: "prelogin-active", payload: "none" } }),
  "co-apping-session": route({ surface: "app", registryIds: ["pi.co-apping.session"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "prelogin-active", payload: "none", deepLink: { restorable: false, fallback: "homepage", payload: "none" } }),
  homepage: route({ surface: "app", registryIds: ["pi.home.overview", "kids.sk.home-concept", "kids.hu.home-concept"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "homepage", payload: "none" } }),
  "language-selector": route({ surface: "app", registryIds: [], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "prelogin-active", payload: "none", deepLink: { restorable: false, fallback: "homepage", payload: "none" } }),
  analytics: route({ surface: "app", registryIds: ["pi.analytics.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "analytics", payload: "none" } }),
  messages: route({ surface: "app", registryIds: ["pi.messages.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "messages", payload: "none" } }),
  payments: route({ surface: "app", registryIds: ["pi.payments.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "payments", payload: "none" } }),
  products: route({ surface: "app", registryIds: ["pi.products.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "products", payload: "none" } }),
  "product-detail": route({ surface: "app", registryIds: ["pi.products.detail"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "products", payload: "product-detail", deepLink: { restorable: false, fallback: "products", payload: "none" } }),
  investments: route({ surface: "app", registryIds: ["pi.investments.portfolio"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "investments", payload: "none" } }),
  "investments-history": route({ surface: "app", registryIds: [], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "investments", payload: "none", deepLink: { restorable: false, fallback: "investments", payload: "none" } }),
  prime: route({ surface: "app", registryIds: ["pi.prime.overview"], productEligibility: "mobile-runtime", statusBar: "dark", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "prime", payload: "none" } }),
  more: route({ surface: "app", registryIds: ["pi.more.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "more", payload: "none", deepLink: { restorable: true, fallback: "more", payload: "none" } }),
  documents: route({ surface: "app", registryIds: ["pi.documents.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "more", payload: "none", deepLink: { restorable: true, fallback: "documents", payload: "none" } }),
  settings: route({ surface: "app", registryIds: ["pi.settings.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "more", payload: "none", deepLink: { restorable: true, fallback: "settings", payload: "none" } }),
  contacts: route({ surface: "app", registryIds: ["pi.contacts.overview"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "more", payload: "none", deepLink: { restorable: true, fallback: "contacts", payload: "none" } }),
  "account-detail": route({ surface: "app", registryIds: ["pi.account.detail"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "account", deepLink: { restorable: true, fallback: "account-detail", payload: "account" } }),
  "account-details-info": route({ surface: "app", registryIds: ["pi.account.details-info"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "account-detail", payload: "account", deepLink: { restorable: true, fallback: "account-details-info", payload: "account" } }),
  "account-options": route({ surface: "app", registryIds: ["pi.account.options"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "account-detail", payload: "account", deepLink: { restorable: true, fallback: "account-options", payload: "account" } }),
  "card-details-info": route({ surface: "app", registryIds: [], productEligibility: "mobile-runtime", statusBar: "dark", backFallback: "card-detail", payload: "card", deepLink: { restorable: false, fallback: "homepage", payload: "none" } }),
  "card-options": route({ surface: "app", registryIds: [], productEligibility: "mobile-runtime", statusBar: "dark", backFallback: "card-detail", payload: "card", deepLink: { restorable: false, fallback: "homepage", payload: "none" } }),
  "transaction-detail": route({ surface: "app", registryIds: ["pi.transaction.detail"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "account-detail", payload: "transaction", deepLink: { restorable: false, fallback: "account-detail", fallbackWithCard: "card-detail", payload: "none" } }),
  "card-detail": route({ surface: "app", registryIds: [], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "homepage", payload: "card", deepLink: { restorable: true, fallback: "card-detail", payload: "card" } }),
  "domestic-payment": route({ surface: "app", registryIds: ["pi.payment.domestic-create"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "payments", payload: "payment-draft", deepLink: { restorable: false, fallback: "payments", payload: "none" } }),
  "payment-review": route({ surface: "app", registryIds: ["pi.payment.review"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "domestic-payment", payload: "payment-draft", deepLink: { restorable: false, fallback: "payments", payload: "none" } }),
  "payment-sign": route({ surface: "app", registryIds: ["pi.payment.sign"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "payment-review", payload: "none", deepLink: { restorable: false, fallback: "payments", payload: "none" } }),
  "payment-success": route({ surface: "app", registryIds: ["pi.payment.success"], productEligibility: "mobile-runtime", statusBar: "light", backFallback: "payments", payload: "none", deepLink: { restorable: false, fallback: "payments", payload: "none" } }),
  "flow-library": route({ surface: "platform", registryIds: ["platform.flow-library"], productEligibility: "unrestricted", statusBar: "dark", backFallback: "homepage", payload: "flow", deepLink: { restorable: true, fallback: "flow-library", payload: "flow" } }),
  "design-system": route({ surface: "platform", registryIds: ["platform.design-system"], productEligibility: "unrestricted", statusBar: "light", backFallback: "homepage", payload: "none", deepLink: { restorable: true, fallback: "design-system", payload: "none" } }),
} satisfies Record<Screen, RoutePolicy>;

export interface ProductRouteContext {
  product: ProductId;
  country: CountryId;
  designSystem: DesignSystemId;
}

export function isRouteEligibleForProductContext(screen: Screen, context: ProductRouteContext): boolean {
  if (ROUTE_POLICY[screen].productEligibility === "unrestricted") return true;
  if (context.designSystem !== "current") return false;
  if (context.product === "PI") return true;
  return context.product === "KIDS_PI" && (context.country === "HU" || context.country === "SK");
}

export function resolveRouteStatusBarVariant(
  screen: Screen,
  context: ProductRouteContext & { themeMode: ThemeMode },
): RouteStatusBarVariant {
  if (context.product === "KIDS_PI" && context.designSystem === "current" && context.country === "HU") return "theme";
  if (context.product === "KIDS_PI" && context.designSystem === "current" && context.country === "SK") return "light";
  if (context.themeMode === "dark" && screen !== "prelogin-inactive" && screen !== "prelogin-active" && screen !== "prime") return "dark";
  return ROUTE_POLICY[screen].statusBar;
}
