/**
 * Shared builders and formatters for the CZ chat assistant: titles, topics,
 * navigate actions, money and date formatting, and credit-card opportunities.
 *
 * Extracted verbatim from czChatOrchestration.ts.
 */
import type { Screen } from "@/app/contexts/NavigationContext";
import { getProductCardSheetConfig, type ProductsCardId } from "@/app/config/productsMenuConfig";
import type { ProductDetailSelection } from "@/app/components/products/ProductCardBottomSheet";
import { getDocumentsConfigForCountry } from "@/app/config/documentsConfig";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import type { CountryId } from "@/app/state/demoTypes";
import type { AccountTransaction } from "@/data/accountDetails";
import type { CreditCard, Product, ProductCategory } from "@/data/products";
import type {
  CoAppingChatAction,
  CoAppingFollowUpSuggestion,
  CoAppingOpportunity,
  CoAppingSuggestedTopic,
} from "../../../../package/mobile-pi-coapping-chat-package/src";

export type CzChatHelpArea = "documents" | "account" | "card" | "savings" | "loan" | "mortgage";
export type CzChatLauncherVariant = "bubble" | "edge-tab";

export const CZ_CHAT_USER_NAME = "Teodora";

export const CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX = "open-products-shelf-card-";

export const CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX = "open-product-detail-";

export type ProductsShelfFocusRequest = {
  requestId: number;
  cardId?: ProductsCardId | null;
};

export function buildCzChatTitle(copy: string): string {
  return `${CZ_CHAT_USER_NAME}, ${copy}`;
}

export function buildCzChatTopic(id: string, label: string, prompt: string): CoAppingSuggestedTopic {
  return { id, label, prompt };
}

export function isCreditCardProduct(product: Product | null | undefined): product is CreditCard {
  return product?.type === "credit_card";
}

export function buildCreditCardOpportunities(
  creditCard: CreditCard | null,
  country: CountryId,
  _currentScreen: Screen,
): CoAppingOpportunity[] {
  if (!creditCard) return [];

  const currency = creditCard.currency;
  const creditLimitAmount = formatMoneyNumber(creditCard.creditLimit, country);
  const proposedCreditLimitAmount = formatMoneyNumber(creditCard.creditLimit + 5000, country);
  const creditLimit = `${creditLimitAmount} ${currency}`;
  const proposedCreditLimit = `${proposedCreditLimitAmount} ${currency}`;

  return [
    {
      id: "credit-limit-review",
      priority: "primary",
      tone: "credit",
      eyebrow: "Credit card",
      title: "New credit limit for you",
      body: `Increase your card limit from ${creditLimit} to ${proposedCreditLimit} for more flexibility when you need it.`,
      reason: "Credit card limit increase candidate.",
      relatedItem: {
        title: creditCard.name,
        description: formatMaskedCardNumber(creditCard.accountNumber),
        visualKind: "credit-card",
        action: {
          id: "open-credit-card-detail",
          label: "Open card detail",
          type: "navigate",
          target: "card-detail",
        },
      },
      metrics: [
        { label: "Current limit", value: creditLimit, helper: "Your current card limit" },
        { label: "New limit", value: proposedCreditLimit, helper: "Available after successful review" },
      ],
      action: {
        id: "start-credit-limit-review",
        label: "I'm interested",
        type: "send-message",
        prompt: "I'm interested in this credit limit offer.",
      },
    },
  ];
}

export type CzChatSmartReplyOptions = {
  country: CountryId;
  categories: ProductCategory[];
  selectedAccountProduct: Product | null;
  selectedCardProduct: Product | null;
  creditCardForOpportunity: CreditCard | null;
};

export function buildCzNavigateAction(
  id: string,
  label: string,
  target: NonNullable<CoAppingChatAction["target"]>,
): CoAppingChatAction {
  return {
    id,
    label,
    type: "navigate",
    target,
  };
}

export function buildCzChatFollowUp(
  id: string,
  label: string,
  prompt = label,
): CoAppingFollowUpSuggestion {
  return {
    id,
    label,
    prompt,
    action: {
      id,
      label,
      type: "send-message",
      prompt,
    },
  };
}

export function buildCzNavigateFollowUp(
  id: string,
  label: string,
  target: NonNullable<CoAppingChatAction["target"]>,
): CoAppingFollowUpSuggestion {
  return {
    id,
    label,
    action: buildCzNavigateAction(id, label, target),
  };
}

export function buildCzSavingsProductDetailAction(
  productLabel: "Saving account" | "Term deposit",
  label = "Open now",
): CoAppingChatAction {
  const optionId = productLabel === "Term deposit" ? "term-deposit" : "saving-account";
  return buildCzNavigateAction(`${CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX}${optionId}`, label, "product-detail");
}

export function getProductsShelfFocusCardId(actionId: string): ProductsCardId | null | undefined {
  if (actionId.startsWith(CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX)) {
    return actionId.slice(CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX.length) as ProductsCardId;
  }

  if (actionId === "cz-open-products-shelf") return null;

  return undefined;
}

export function getCzSavingsProductDetailSelection(actionId: string, country: CountryId): ProductDetailSelection | null {
  if (!actionId.startsWith(CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX)) return null;

  const optionId = actionId.slice(CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX.length);
  if (optionId !== "saving-account" && optionId !== "term-deposit") return null;

  const sheetConfig = getProductCardSheetConfig("investments-savings", country);
  const option = sheetConfig.options.find((item) => item.id === optionId);

  return {
    cardId: "investments-savings",
    categoryTitle: sheetConfig.title ?? "Saving and investing",
    optionId,
    title: option?.title ?? (optionId === "term-deposit" ? "Term deposit" : "Saving account"),
  };
}

export function formatCzChatMoney(amount: number, currency: string, country: CountryId): string {
  return `${formatMoneyNumber(Math.abs(amount), country)} ${currency}`;
}

export function formatCzChatSignedMoney(amount: number, currency: string, country: CountryId): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${formatCzChatMoney(amount, currency, country)}`;
}

export function formatCzChatTransactionDate(transaction: AccountTransaction): string {
  return `${transaction.day} ${transaction.month}`;
}

export function formatCzChatDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "unknown date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function roundCzChatSavingAmount(amount: number, step = 500): number {
  const rounded = Math.round(Math.max(0, amount) / step) * step;
  return Math.max(step, rounded);
}

export function getCzLatestDocument(country: CountryId) {
  const config = getDocumentsConfigForCountry(country);
  const group = config.groups[0];
  const document = group?.items[0];

  if (!group || !document) return null;

  return {
    date: `${document.day} ${document.month} ${group.year}`,
    description: document.description,
    isLegal: Boolean(document.isLegal),
    isNew: document.badge === "NEW",
    title: document.title,
  };
}
