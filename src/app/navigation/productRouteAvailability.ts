import type { NavigationRoute, Screen } from "@/app/contexts/NavigationContext";

const ACCOUNT_PRODUCT_SCREENS = new Set<Screen>([
  "account-detail",
  "account-details-info",
  "account-options",
]);
const CARD_PRODUCT_SCREENS = new Set<Screen>([
  "card-detail",
  "card-details-info",
  "card-options",
]);

export function getUnavailableProductRouteFallback(
  route: NavigationRoute,
  availableProductIds: ReadonlySet<string>,
  hasInvestments: boolean,
): Screen | null {
  if ((route.screen === "investments" || route.screen === "investments-history") && !hasInvestments) {
    return "homepage";
  }
  if (ACCOUNT_PRODUCT_SCREENS.has(route.screen) && "accountId" in route && route.accountId) {
    return availableProductIds.has(route.accountId) ? null : "homepage";
  }
  if (CARD_PRODUCT_SCREENS.has(route.screen) && "cardId" in route && route.cardId) {
    return availableProductIds.has(route.cardId) ? null : "homepage";
  }
  return null;
}
