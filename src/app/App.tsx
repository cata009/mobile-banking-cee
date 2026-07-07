import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigationContext, NavigationProvider, type Screen } from "@/app/contexts/NavigationContext";
import { LanguageProvider, useLanguage } from "@/app/contexts/LanguageContext";
import { DemoProvider, useDemo } from "@/app/state/demoStore";
import type { CountryId } from "@/app/state/demoTypes";
import { isFeatureActive } from "@/app/state/featureResolver";
import { DemoShell } from "@/app/components/demo/DemoShell";
import { DemoNavigationSync } from "@/app/components/demo/DemoNavigationSync";
import LanguageSelector from "@/app/components/LanguageSelector";
import MobileFrame from "@/app/components/MobileFrame";
import FramelessDeviceFrame from "@/app/components/FramelessDeviceFrame";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import EdgeLoadingAnimation from "@/app/components/EdgeLoadingAnimation";
import UnsupportedContextScreen from "@/app/components/UnsupportedContextScreen";

// --- Screens (lazy-loaded for code-splitting) ---
const PreLoginScreen = lazy(() => import("@/app/components/PreLoginScreen"));
const PreLoginActiveScreen = lazy(() => import("@/app/components/PreLoginActiveScreen"));
const HomeScreen = lazy(() => import("@/app/screens/home/HomeScreen"));
const AnalyticsScreen = lazy(() => import("@/app/screens/analytics/AnalyticsScreen"));
const MessagesScreen = lazy(() => import("@/app/screens/messages/MessagesScreen"));

// Co-Apping components - only used for CZ and SK
const CoAppingSessionScreen = lazy(() => import("@/app/components/CoAppingSessionScreen"));
const FloatingCoAppingButton = lazy(() => import("@/app/components/FloatingCoAppingButton"));
const TerminateSessionPopup = lazy(() => import("@/app/components/TerminateSessionPopup"));

// Prime component - available for all countries
const PrimeScreen = lazy(() => import("@/app/screens/prime/PrimeScreen"));

// More component - available for all countries
const MoreScreen = lazy(() => import("@/app/screens/more/MoreScreen"));
const DocumentsScreen = lazy(() => import("@/app/screens/documents/DocumentsScreen"));
const PaymentsScreen = lazy(() => import("@/app/screens/payments/PaymentsScreen"));
const ProductsScreen = lazy(() => import("@/app/screens/products/ProductsScreen"));
const ProductDetailScreen = lazy(() => import("@/app/screens/products/ProductDetailScreen"));
const InvestmentsPortfolioScreen = lazy(() => import("@/app/screens/investments/InvestmentsPortfolioScreen"));
const InvestmentsHistoryScreen = lazy(() => import("@/app/screens/investments/InvestmentsHistoryScreen"));
const SettingsScreen = lazy(() => import("@/app/screens/settings/SettingsScreen"));
const KidsMarketHomeApp = lazy(() => import("@/app/screens/kids/KidsMarketHomeApp"));

// Contacts component - available for all countries
const ContactsScreen = lazy(() => import("@/app/screens/contacts/ContactsScreen"));
const DesignSystemPage = lazy(() => import("@/app/screens/design-system/DesignSystemPage"));
const FlowLibraryScreen = lazy(() => import("@/app/screens/flow-library/FlowLibraryScreen"));
const AccountDetailScreen = lazy(() => import("@/app/screens/accounts/AccountDetailScreen"));
const AccountDetailsInfoScreen = lazy(() => import("@/app/screens/accounts/AccountDetailsInfoScreen"));
const AccountOptionsScreen = lazy(() => import("@/app/screens/accounts/AccountOptionsScreen"));
const CardDetailScreen = lazy(() => import("@/app/screens/cards/CardDetailScreen"));

// DomesticPaymentFlowScreens exports 5 named exports from one module. They
// stay as a static import because they already share one module file (one
// emitted chunk). Wrapping 5 named exports via React.lazy would add complexity
// without splitting the chunk further.
import {
  DomesticPaymentCreateScreen,
  PaymentReviewScreen,
  PaymentSignScreen,
  PaymentSuccessScreen,
  TransactionDetailScreen,
} from "@/app/screens/payments/DomesticPaymentFlowScreens";
import { useProducts } from "@/hooks/useProducts";
import {
  buildDeepLinkUrl,
  deepLinkToDemoInitialState,
  parseDeepLinkFromUrl,
} from "@/app/utils/deepLink";
import type { FlowPreviewId } from "@/app/registry/flowPreviewRegistry";
import { isInvestmentsPortfolioAvailable } from "@/app/utils/investmentsAvailability";
import {
  buildInvestmentDistributionItems,
  buildInvestmentHistoryOrders,
  buildInvestmentSecurities,
} from "@/app/config/investmentsPortfolioConfig";
import { getProductCardSheetConfig, getProductsMenuForCountry, type ProductsCardId } from "@/app/config/productsMenuConfig";
import { preloadMoreCardImages } from "@/app/config/moreCardAssets";
import { isKidsHomeCountry } from "@/data/kidsMarketHomeConcepts";
import {
  CoAppingChatLauncher,
  type CoAppingChatAction,
  type CoAppingAssistantMode,
  type CoAppingChatContext,
  type CoAppingFollowUpSuggestion,
  type CoAppingOpportunity,
  type CoAppingReplyResolver,
  type CoAppingRichBlock,
  type CoAppingSuggestedTopic,
  defaultReplyResolver,
} from "../../package/mobile-pi-coapping-chat-package/src";
import "../../package/mobile-pi-coapping-chat-package/src/coapping.css";
import type { AccountTransaction } from "@/data/accountDetails";
import { createSpendingAnalyticsTimeline } from "@/data/spendingAnalytics";
import {
  createEmptyDomesticPaymentDraft,
  createRedoDomesticPaymentDraft,
  type DomesticPaymentDraft,
} from "@/data/paymentFlow";
import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import type { CreditCard, Product, ProductCategory } from "@/data/products";
import { getDocumentsConfigForCountry } from "@/app/config/documentsConfig";
import type { ProductDetailSelection } from "@/app/components/products/ProductCardBottomSheet";

// Panel components
import PanelOverlay from "@/app/components/PanelOverlay";

const DESIGN_SYSTEM_HASHES = new Set([
  "overview",
  "countries",
  "headers",
  "navigation",
  "buttons",
  "forms",
  "cards",
  "products",
  "overlays",
  "registry",
  "templates",
  "icons",
  "icon-audit",
  "typography",
  "colors",
  "color-audit",
]);

type CzChatHelpArea = "documents" | "account" | "card" | "savings" | "loan" | "mortgage";
type CzChatLauncherVariant = "bubble" | "edge-tab";

const CZ_CHAT_USER_NAME = "Teodora";

const CZ_CHAT_LEVEL_ONE_SCREENS = new Set<Screen>([
  "homepage",
  "analytics",
  "payments",
  "products",
  "more",
]);

const CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX = "open-products-shelf-card-";
const CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX = "open-product-detail-";

type ProductsShelfFocusRequest = {
  requestId: number;
  cardId?: ProductsCardId | null;
};

function buildCzChatTitle(copy: string): string {
  return `${CZ_CHAT_USER_NAME}, ${copy}`;
}

function buildCzChatTopic(id: string, label: string, prompt: string): CoAppingSuggestedTopic {
  return { id, label, prompt };
}

function isCreditCardProduct(product: Product | null | undefined): product is CreditCard {
  return product?.type === "credit_card";
}

function buildCreditCardOpportunities(
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

type CzChatSmartReplyOptions = {
  country: CountryId;
  categories: ProductCategory[];
  selectedAccountProduct: Product | null;
  selectedCardProduct: Product | null;
  creditCardForOpportunity: CreditCard | null;
};

function buildCzNavigateAction(
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

function buildCzChatFollowUp(
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

function buildCzNavigateFollowUp(
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

function buildCzSavingsProductDetailAction(
  productLabel: "Saving account" | "Term deposit",
  label = "Open now",
): CoAppingChatAction {
  const optionId = productLabel === "Term deposit" ? "term-deposit" : "saving-account";
  return buildCzNavigateAction(`${CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX}${optionId}`, label, "product-detail");
}

function getProductsShelfFocusCardId(actionId: string): ProductsCardId | null | undefined {
  if (actionId.startsWith(CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX)) {
    return actionId.slice(CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX.length) as ProductsCardId;
  }

  if (actionId === "cz-open-products-shelf") return null;

  return undefined;
}

function getCzSavingsProductDetailSelection(actionId: string, country: CountryId): ProductDetailSelection | null {
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

function formatCzChatMoney(amount: number, currency: string, country: CountryId): string {
  return `${formatMoneyNumber(Math.abs(amount), country)} ${currency}`;
}

function formatCzChatSignedMoney(amount: number, currency: string, country: CountryId): string {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${formatCzChatMoney(amount, currency, country)}`;
}

function formatCzChatTransactionDate(transaction: AccountTransaction): string {
  return `${transaction.day} ${transaction.month}`;
}

function formatCzChatDate(dateValue: string): string {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "unknown date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function roundCzChatSavingAmount(amount: number, step = 500): number {
  const rounded = Math.round(Math.max(0, amount) / step) * step;
  return Math.max(step, rounded);
}

function getCzLatestDocument(country: CountryId) {
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

function buildCzChatSmartReplyResolver({
  country,
  categories,
  selectedAccountProduct,
  selectedCardProduct,
  creditCardForOpportunity,
}: CzChatSmartReplyOptions): CoAppingReplyResolver {
  const localCurrency = getCountryConfig(country).currency;
  const allProducts = categories.flatMap((category) => category.products);
  const currentAccounts = allProducts.filter((product) => product.type === "current_account");
  const savingsProducts = allProducts.filter((product) => product.type === "saving_account");
  const loansAndMortgages = allProducts.filter((product) => product.type === "loan" || product.type === "mortgage");
  const investmentProducts = allProducts.filter((product) => product.type === "investment_account");
  const investmentProduct =
    allProducts.find((product): product is Extract<Product, { type: "investment_account" }> => product.type === "investment_account") ??
    null;
  const investmentSecurities = buildInvestmentSecurities(investmentProducts, country);
  const investmentOrders = buildInvestmentHistoryOrders(investmentSecurities, country);
  const latestInvestmentOrder = investmentOrders[0] ?? null;
  const pendingInvestmentOrders = investmentOrders.filter((order) => order.status === "PENDING");
  const rejectedInvestmentOrders = investmentOrders.filter((order) => order.status === "REJECTED");
  const executedInvestmentOrders = investmentOrders.filter((order) => order.status === "EXECUTED");
  const investmentLocalTotal = investmentSecurities.reduce((sum, security) => sum + security.localValue, 0);
  const topInvestmentSecurity = [...investmentSecurities].sort((first, second) => second.localValue - first.localValue)[0] ?? null;
  const topInvestmentShare =
    topInvestmentSecurity && investmentLocalTotal > 0
      ? `${Math.round((topInvestmentSecurity.localValue / investmentLocalTotal) * 100)}%`
      : "n/a";
  const currencyMix = buildInvestmentDistributionItems(investmentSecurities, "currency")
    .slice(0, 2)
    .map((item) => `${item.label} ${item.percent}%`)
    .join(" / ");
  const assetClassMix = buildInvestmentDistributionItems(investmentSecurities, "asset-class")
    .slice(0, 2)
    .map((item) => `${item.label} ${item.percent}%`)
    .join(" / ");
  const primaryAccount =
    selectedAccountProduct?.type === "current_account"
      ? selectedAccountProduct
      : currentAccounts[0] ?? selectedAccountProduct ?? null;
  const primaryCard =
    (isCreditCardProduct(selectedCardProduct) ? selectedCardProduct : null) ??
    creditCardForOpportunity ??
    allProducts.find(isCreditCardProduct) ??
    null;
  const selectedLoan =
    selectedAccountProduct?.type === "loan" || selectedAccountProduct?.type === "mortgage"
      ? selectedAccountProduct
      : loansAndMortgages[0] ?? null;
  const selectedSavings =
    selectedAccountProduct?.type === "saving_account" || selectedAccountProduct?.type === "term_deposit"
      ? selectedAccountProduct
      : savingsProducts[0] ?? null;
  const latestDocument = getCzLatestDocument(country);
  const totalAvailableAmount = allProducts.reduce((sum, product) => {
    if (product.type === "current_account" || product.type === "saving_account") return sum + product.balance;
    return sum;
  }, 0);
  const totalOwedAmount = loansAndMortgages.reduce((sum, product) => sum + Math.abs(product.balance), 0);
  const totalAvailable = formatCzChatMoney(totalAvailableAmount, localCurrency, country);
  const totalOwed = formatCzChatMoney(totalOwedAmount, localCurrency, country);
  const accountBalance = primaryAccount
    ? formatCzChatMoney(primaryAccount.balance, primaryAccount.currency, country)
    : totalAvailable;
  const savingsBalance = selectedSavings
    ? formatCzChatMoney(selectedSavings.balance, selectedSavings.currency, country)
    : totalAvailable;
  const creditAvailable = primaryCard
    ? formatCzChatMoney(primaryCard.availableCredit, primaryCard.currency, country)
    : "not available in this simulation profile";
  const creditLimit = primaryCard
    ? formatCzChatMoney(primaryCard.creditLimit, primaryCard.currency, country)
    : "not available in this simulation profile";
  const proposedCreditLimit = primaryCard
    ? formatCzChatMoney(primaryCard.creditLimit + 5000, primaryCard.currency, country)
    : "not available in this simulation profile";
  const loanBalance = selectedLoan ? formatCzChatMoney(selectedLoan.balance, selectedLoan.currency, country) : totalOwed;
  const investmentValue = investmentProduct
    ? formatCzChatMoney(investmentProduct.balance, investmentProduct.currency, country)
    : "not available in this simulation profile";
  const investmentReturn = investmentProduct
    ? `${investmentProduct.totalGainLossPercentage >= 0 ? "+" : ""}${investmentProduct.totalGainLossPercentage.toFixed(2)}%`
    : "n/a";
  const investmentGainLoss = investmentProduct
    ? `${investmentProduct.totalGainLoss >= 0 ? "+" : "-"}${formatCzChatMoney(
        investmentProduct.totalGainLoss,
        investmentProduct.currency,
        country,
      )}`
    : "n/a";
  const latestOrderAmount = latestInvestmentOrder
    ? formatCzChatMoney(latestInvestmentOrder.amount, latestInvestmentOrder.currency, country)
    : "n/a";
  const latestOrderSummary = latestInvestmentOrder
    ? `${latestInvestmentOrder.orderType} ${latestInvestmentOrder.title}, ${latestInvestmentOrder.status.toLowerCase()}, ${latestOrderAmount} on ${formatCzChatDate(
        latestInvestmentOrder.date,
      )}`
    : "No investment orders are present in this mock profile.";
  const orderStatusSummary = investmentOrders.length
    ? `${executedInvestmentOrders.length} executed, ${pendingInvestmentOrders.length} pending, ${rejectedInvestmentOrders.length} rejected`
    : "No orders";
  const spendingTimeline = createSpendingAnalyticsTimeline(country, allProducts);
  const currentSpendingSummary = spendingTimeline.summariesByPeriodKey[spendingTimeline.activePeriodKey];
  const monthlyIncomeAmount = currentSpendingSummary?.incomeTotal ?? 0;
  const monthlySpendingAmount = currentSpendingSummary?.spendingTotal ?? 0;
  const netMonthlyAmount = Math.max(0, monthlyIncomeAmount - monthlySpendingAmount);
  const currentAccountMoneyAmount = currentAccounts.reduce((sum, product) => sum + product.balance, 0);
  const suggestedMonthlySavingRaw = Math.min(
    Math.max(netMonthlyAmount * 0.35, monthlyIncomeAmount * 0.05),
    Math.max(currentAccountMoneyAmount * 0.45, 500),
  );
  const suggestedMonthlySavingAmount = roundCzChatSavingAmount(
    suggestedMonthlySavingRaw > 0 ? suggestedMonthlySavingRaw : currentAccountMoneyAmount * 0.2,
  );
  const savingAccountAnnualRate = 0.035;
  const termDepositAnnualRate = 0.05;
  const savingAccountRate = "3.5% p.a.";
  const termDepositRate = "5% p.a.";
  const savingStartAmountOptions = [
    {
      key: "light",
      label: "Light start",
      amount: roundCzChatSavingAmount(suggestedMonthlySavingAmount * 0.5),
    },
    {
      key: "recommended",
      label: "Recommended",
      amount: suggestedMonthlySavingAmount,
    },
    {
      key: "stretch",
      label: "Build buffer",
      amount: Math.max(
        suggestedMonthlySavingAmount + 500,
        roundCzChatSavingAmount(Math.min(currentAccountMoneyAmount * 0.6, suggestedMonthlySavingAmount * 1.5)),
      ),
    },
  ] as const;
  const monthlyIncome = formatCzChatMoney(monthlyIncomeAmount, localCurrency, country);
  const monthlySpending = formatCzChatMoney(monthlySpendingAmount, localCurrency, country);
  const currentAccountMoney = formatCzChatMoney(currentAccountMoneyAmount, localCurrency, country);
  const suggestedMonthlySaving = formatCzChatMoney(suggestedMonthlySavingAmount, localCurrency, country);
  const savingPeriodLabel = currentSpendingSummary
    ? `${currentSpendingSummary.periodLabel} ${currentSpendingSummary.yearLabel}`
    : "the current period";
  const latestHomeTransactions = currentSpendingSummary?.sourceTransactions.slice(0, 5) ?? [];
  const latestDebitTransactions = latestHomeTransactions.filter((transaction) => transaction.amount < 0);
  const latestCreditTransactions = latestHomeTransactions.filter((transaction) => transaction.amount > 0);
  const largestRecentDebit =
    [...(currentSpendingSummary?.sourceTransactions ?? [])]
      .filter((transaction) => transaction.amount < 0 && transaction.pfmCategory !== "Internal")
      .sort((first, second) => Math.abs(second.amount) - Math.abs(first.amount))[0] ?? null;
  const pendingRecentTransactions =
    currentSpendingSummary?.sourceTransactions.filter((transaction) => transaction.status === "Pending").slice(0, 3) ?? [];
  const topMoneyOutCategory = currentSpendingSummary?.moneyOutCategories[0] ?? null;
  const latestTransactionLines = latestHomeTransactions.length
    ? latestHomeTransactions
        .map((transaction, index) => {
          const sourceName = transaction.sourceProductName || "Account";
          const status = transaction.status === "Pending" ? ", pending" : "";
          return `${index + 1}. **${transaction.label}** — ${formatCzChatSignedMoney(
            transaction.amount,
            localCurrency,
            country,
          )}, ${formatCzChatTransactionDate(transaction)} from ${sourceName}${status}.`;
        })
        .join("\n")
    : "No recent transactions are available in this simulation profile.";
  const latestTransactionSnapshotBlock: CoAppingRichBlock = {
    type: "spending-insight",
    title: "Latest transaction readout",
    body: currentSpendingSummary
      ? `Latest activity from ${currentSpendingSummary.periodLabel} ${currentSpendingSummary.yearLabel}, grouped across visible account products.`
      : "Latest account activity across visible products.",
    metrics: [
      { label: "Latest shown", value: `${latestHomeTransactions.length}`, helper: "Transactions" },
      {
        label: "Money out",
        value: formatCzChatMoney(currentSpendingSummary?.spendingTotal ?? 0, localCurrency, country),
        helper: currentSpendingSummary?.periodLabel ?? "Current period",
      },
      {
        label: "Money in",
        value: formatCzChatMoney(currentSpendingSummary?.incomeTotal ?? 0, localCurrency, country),
        helper: latestCreditTransactions.length ? `${latestCreditTransactions.length} incoming in latest set` : "No incoming in latest set",
      },
    ],
    action: buildCzNavigateAction("open-account-from-latest-transactions", "Open Account", "account-detail"),
  };
  const unusualSpendingBlock: CoAppingRichBlock = {
    type: "spending-insight",
    title: "Spending signals",
    body: "The assistant should call out large, pending, or category-heavy movements before sending the user elsewhere.",
    metrics: [
      {
        label: "Largest debit",
        value: largestRecentDebit ? formatCzChatMoney(largestRecentDebit.amount, localCurrency, country) : "n/a",
        helper: largestRecentDebit?.label ?? "No debit found",
      },
      {
        label: "Top category",
        value: topMoneyOutCategory
          ? formatCzChatMoney(topMoneyOutCategory.total, localCurrency, country)
          : "n/a",
        helper: topMoneyOutCategory ? `${topMoneyOutCategory.category}, ${topMoneyOutCategory.transactionCount} trx` : "No category",
      },
      {
        label: "Pending",
        value: `${pendingRecentTransactions.length}`,
        helper: pendingRecentTransactions[0]?.label ?? "No pending movement",
      },
    ],
    action: buildCzNavigateAction("open-spending-from-unusual-spending", "Open Spending", "analytics"),
  };

  const homeSnapshotBlock: CoAppingRichBlock = {
    type: "spending-insight",
    title: "Homepage money signals",
    body: "A compact read of the visible Home data, with the next action still kept in the app.",
    metrics: [
      { label: "Available", value: totalAvailable, helper: "Current and savings money" },
      { label: "Owed", value: totalOwed, helper: "Loans and mortgage" },
      { label: "Card room", value: creditAvailable, helper: primaryCard ? primaryCard.name : "No credit card" },
    ],
    action: buildCzNavigateAction("open-spending-from-home", "Open Spending", "analytics"),
  };
  const savingsCapacityBlock: CoAppingRichBlock = {
    type: "spending-insight",
    title: "Monthly saving capacity",
    body: `Based on ${savingPeriodLabel} activity and current account money, a cautious monthly target is ${suggestedMonthlySaving}.`,
    metricLayout: "calculation",
    metrics: [
      { label: "Income", value: monthlyIncome, helper: savingPeriodLabel, icon: "Income" },
      { label: "Spending", value: monthlySpending, helper: "Card, bills, cash, categories", icon: "Shopping" },
      { label: "Current accounts", value: currentAccountMoney, helper: "Money available now", icon: "Finance" },
    ],
  };
  const savingsProductChoiceBlock: CoAppingRichBlock = {
    type: "product-cards",
    title: "How to save it",
    body: `That keeps the recommendation cautious: it does not move every free crown, and it still leaves room for bills, card payments, and unexpected spending. Rates are illustrative for this simulation.`,
    variant: "compact",
    footer: "Choose your preferred saving type.",
    interactive: false,
    products: [
      {
        id: "saving-account-plan",
        title: "Saving account",
        subtitle: `${savingAccountRate} interest, flexible access`,
        meta: "Flexible",
        tone: "blue",
        icon: "Wallet",
        action: {
          id: "choose-saving-account-plan",
          label: "Choose",
          type: "send-message",
          prompt: "Use Saving account for my savings plan.",
        },
      },
      {
        id: "term-deposit-plan",
        title: "Term deposit",
        subtitle: `${termDepositRate} interest, fixed term`,
        meta: "Fixed term",
        tone: "neutral",
        icon: "Investments",
        action: {
          id: "choose-term-deposit-plan",
          label: "Choose",
          type: "send-message",
          prompt: "Use Term deposit for my savings plan.",
        },
      },
    ],
  };
  const buildSavingsAmountFollowUps = (productLabel: "Saving account" | "Term deposit"): CoAppingFollowUpSuggestion[] =>
    savingStartAmountOptions.map((option) =>
      buildCzChatFollowUp(
        `cz-save-now-${productLabel === "Saving account" ? "saving-account" : "term-deposit"}-${option.key}`,
        formatCzChatMoney(option.amount, localCurrency, country),
        `Start with ${option.key} amount in ${productLabel}.`,
      ),
    );

  const documentBlock: CoAppingRichBlock = {
    type: "product-cards",
    title: "Document routes",
    body: latestDocument
      ? `Newest item in this mock profile: ${latestDocument.description}, ${latestDocument.date}.`
      : "Documents are grouped by year and newest date first.",
    products: [
      {
        id: "documents",
        title: "Documents",
        subtitle: "Statements, notices, confirmations",
        meta: "Open list",
        tone: "blue",
        action: buildCzNavigateAction("open-documents", "Open Documents", "documents"),
      },
      {
        id: "messages",
        title: "Messages",
        subtitle: "Bank notifications",
        meta: "Open inbox",
        tone: "neutral",
        action: buildCzNavigateAction("open-messages", "Open Messages", "messages"),
      },
    ],
  };

  const paymentBlock: CoAppingRichBlock = {
    type: "product-cards",
    title: "Payment handoff",
    body: "Use chat to prepare the check, then keep creation, review, and signing in Payments.",
    products: [
      {
        id: "new-payment",
        title: "New payment",
        subtitle: "Recipient, amount, review",
        meta: "Open Payments",
        tone: "blue",
        action: buildCzNavigateAction("open-payments", "Open Payments", "payments"),
      },
      {
        id: "documents",
        title: "Confirmation",
        subtitle: "After payment is processed",
        meta: "Open Documents",
        tone: "neutral",
        action: buildCzNavigateAction("open-payment-documents", "Open Documents", "documents"),
      },
    ],
  };

  const productsMenu = getProductsMenuForCountry(country);
  const productShelfCards = productsMenu.products;
  const productShelfTitle = productsMenu.productsTitle || "OUR PRODUCTS";
  const productShelfLines = productShelfCards.length
    ? productShelfCards
        .map((card) => {
          const title = card.title.replace(/\n/g, " ");
          const sheetOptions = getProductCardSheetConfig(card.id, country).options.map((option) => option.title).join(", ");
          return `- **${title}:** ${sheetOptions}.`;
        })
        .join("\n")
    : "This market does not expose product shelf cards in the current simulation profile.";
  const productShelfBlock: CoAppingRichBlock = {
    type: "product-cards",
    title: "Product shelf",
    body: `Open Products > ${productShelfTitle} to continue from the real shelf.`,
    products: productShelfCards.slice(0, 5).map((card, index) => {
      const title = card.title.replace(/\n/g, " ");
      const subtitle = getProductCardSheetConfig(card.id, country)
        .options.slice(0, 2)
        .map((option) => option.title)
        .join(", ");

      return {
        id: `product-shelf-${card.id}`,
        title,
        subtitle,
        meta: "Open Products",
        tone: index === 0 ? "blue" : index === 1 ? "dark" : "neutral",
        action: buildCzNavigateAction(`${CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX}${card.id}`, "Open Products", "products"),
      };
    }),
  };

  const productsBlock: CoAppingRichBlock = {
    type: "product-cards",
    title: "Relevant product areas",
    body: "The assistant should explain the choice first, then hand off to the real product surface.",
    products: [
      {
        id: "products",
        title: "Products",
        subtitle: "Accounts, cards, loans, savings",
        meta: "Open catalog",
        tone: "blue",
        action: buildCzNavigateAction("open-products", "Open Products", "products"),
      },
      {
        id: "card-detail",
        title: "Credit card",
        subtitle: primaryCard ? `${creditAvailable} free to spend` : "Card controls",
        meta: "Open card",
        tone: "dark",
        action: buildCzNavigateAction("open-card-detail", "Open Card", "card-detail"),
      },
    ],
  };

  const creditLimitOfferBlock: CoAppingRichBlock = {
    type: "credit-limit-offer",
    title: "Card limit offer",
    body: "",
    cardName: primaryCard?.name ?? "Credit Card",
    cardDescription: primaryCard ? formatMaskedCardNumber(primaryCard.accountNumber) : "Selected card",
    currentLimit: creditLimit,
    newLimit: proposedCreditLimit,
  };

  const investmentPortfolioBlock: CoAppingRichBlock = {
    type: "investment-summary",
    eyebrow: "Investments",
    title: "Portfolio context",
    body: topInvestmentSecurity
      ? `Largest holding is ${topInvestmentSecurity.title}. Use performance, ${currencyMix || "currency mix"}, and ${
          assetClassMix || "asset class mix"
        } before opening a product or order.`
      : "Use the portfolio overview before opening a product or order.",
    metrics: [
      { label: "Current value", value: investmentValue, helper: investmentProduct?.name ?? "Simulation profile" },
      { label: "Return", value: investmentReturn, helper: investmentGainLoss },
      { label: "Largest holding", value: topInvestmentShare, helper: topInvestmentSecurity?.title ?? "No holdings" },
    ],
    action: buildCzNavigateAction("open-investments", "Open Investments", "investments"),
  };

  const investmentGoalPortfolioBlock: CoAppingRichBlock = {
    ...investmentPortfolioBlock,
    action: undefined,
  };

  const investmentOrdersBlock: CoAppingRichBlock = {
    type: "product-cards",
    title: "Investment order activity",
    body: `Latest mock order: ${latestOrderSummary}`,
    products: [
      {
        id: "orders",
        title: "Orders",
        subtitle: orderStatusSummary,
        meta: "Open History",
        tone: "blue",
        action: buildCzNavigateAction("open-investment-orders", "Open History", "investments-history"),
      },
      {
        id: "portfolio",
        title: "Portfolio",
        subtitle: "Value, mix, performance",
        meta: "Open overview",
        tone: "neutral",
        action: buildCzNavigateAction("open-investments-from-orders", "Open Investments", "investments"),
      },
    ],
  };

  const investmentNextMoveBlock: CoAppingRichBlock = {
    type: "product-cards",
    title: "Next move planner",
    body: "A smarter assistant should turn the portfolio readout into a choice: goal setup, order review, or risk cleanup.",
    products: [
      {
        id: "goal",
        title: "Goal setup",
        subtitle: "Horizon, amount, monthly habit",
        meta: "Plan",
        tone: "blue",
        action: {
          id: "plan-investment-goal",
          label: "Start goal",
          type: "send-message",
          prompt: "Start an investment goal.",
        },
      },
      {
        id: "orders",
        title: "Orders",
        subtitle: "Pending, executed, rejected",
        meta: "Review",
        tone: "dark",
        action: {
          id: "review-investment-orders",
          label: "Review orders",
          type: "send-message",
          prompt: "Review my investment orders.",
        },
      },
    ],
  };

  const investmentGoalAllocationBlock: CoAppingRichBlock = {
    type: "investment-allocation",
    title: "Goal portfolio preview",
    body: "Illustrative mix based on the current portfolio shape. Final product selection still needs documents, risk profile, and authorization in Investments.",
    items: buildInvestmentDistributionItems(investmentSecurities, "asset-class")
      .slice(0, 4)
      .map((item) => ({
        label: item.label,
        value: item.percent,
        helper: `${formatCzChatMoney(item.value, item.currency, country)} in this mock portfolio`,
      })),
  };

  const investmentGoalProjectionBlock: CoAppingRichBlock = {
    type: "investment-projection",
    title: "Goal simulation",
    body: "Illustrative scenario for 10,000 CZK now plus 1,000 CZK monthly. Not a guarantee.",
    scenarios: [
      { label: "Lower", value: "64k CZK", detail: "More conservative market path" },
      { label: "Expected", value: "78k CZK", detail: "Middle scenario", emphasis: true },
      { label: "Higher", value: "94k CZK", detail: "Stronger market path" },
    ],
  };

  const normalize = (input: string) => input.toLowerCase().replace(/\s+/g, " ").trim();
  const hasAny = (normalized: string, terms: string[]) => terms.some((term) => normalized.includes(term));

  return (input) => {
    const normalized = normalize(input);
    const afterAcceptanceFollowUp = buildCzChatFollowUp(
      "cz-limit-offer-after-acceptance",
      "After acceptance",
      "What happens after the credit limit offer is accepted?",
    );
    const signNowFollowUp = buildCzChatFollowUp(
      "cz-limit-offer-sign-now",
      "Sign now",
      "Sign the credit limit offer now.",
    );

    if (hasAny(normalized, ["continue to confirmation for this credit limit offer", "continue to confirmation", "review final offer", "continue with this offer"])) {
      return {
        text:
          `### Ready to confirm\n` +
          `Here is the final simulation checkpoint before accepting the offer.\n` +
          `${primaryCard ? `Card: **${primaryCard.name}**, ${formatMaskedCardNumber(primaryCard.accountNumber)}.` : "Card: selected credit card."}\n` +
          `Current limit: **${creditLimit}**.\n` +
          `New limit after acceptance: **${proposedCreditLimit}**.\n` +
          `Before anything changes, the authenticated card flow still needs eligibility, final terms, strong customer authentication, and your signature.`,
        followUps: [
          buildCzChatFollowUp("cz-limit-offer-accept-final", "Accept new limit", "Accept the new credit limit offer."),
          buildCzChatFollowUp("cz-limit-offer-repayment", "Explain repayment impact", "Explain repayment impact for this credit limit offer."),
        ],
      };
    }

    if (hasAny(normalized, ["accept the new credit limit offer", "accept new limit", "confirm new limit", "confirm this offer"])) {
      return {
        text:
          `### Signature required\n` +
          `You accepted the credit-limit offer in chat, but the new limit is not active yet.\n` +
          `${primaryCard ? `The limit prepared for signing is **${proposedCreditLimit}** for **${primaryCard.name}**.` : `The limit prepared for signing is **${proposedCreditLimit}**.`}\n` +
          `Next, the authenticated card flow should show the final terms, strong customer authentication, and your signature before the card limit is changed.`,
        followUps: [afterAcceptanceFollowUp, signNowFollowUp],
      };
    }

    if (hasAny(normalized, ["sign the credit limit offer now", "sign now", "start signing", "continue to signing", "complete the signature"])) {
      return {
        text:
          `### Sign now\n` +
          `${primaryCard ? `Open the secure signing step for **${primaryCard.name}**.` : "Open the secure signing step for this card."}\n` +
          `Review the final terms for the **${proposedCreditLimit}** limit, confirm with strong customer authentication, and sign.\n` +
          `The new card limit should become active only after that signature is completed.`,
        followUps: [afterAcceptanceFollowUp],
      };
    }

    if (hasAny(normalized, ["what happens after the credit limit offer is accepted", "what happens next", "after acceptance"])) {
      return {
        text:
          `### After acceptance\n` +
          `The customer should see three things before the limit changes: final terms, strong customer authentication, and a signature step.\n` +
          `After signing, the app can show a confirmation receipt, update the card limit, and keep the confirmation available from card activity or Documents.`,
        followUps: [signNowFollowUp],
      };
    }

    if (hasAny(normalized, ["repayment impact for this credit limit offer", "repayment impact", "impact if i accept"])) {
      return {
        text:
          `### Repayment impact\n` +
          `A higher limit does not create a payment by itself. It gives the card more available room, so the important question is whether higher spending would still fit your monthly repayment comfort.\n` +
          `${primaryCard ? `For this card, the limit could move from **${creditLimit}** to **${proposedCreditLimit}**.` : "The final amount is checked in the card flow."}\n` +
          `Before accepting, I would check:\n` +
          `1. Recent card spend and upcoming repayments.\n` +
          `2. Whether you usually repay the full statement or carry balance.\n` +
          `3. The final terms shown before confirmation.\n` +
          `Nothing changes from chat; acceptance stays inside the authenticated card flow.`,
        richBlocks: [creditLimitOfferBlock],
        followUps: [
          buildCzChatFollowUp("cz-limit-offer-continue", "Continue to confirmation", "Continue to confirmation for this credit limit offer."),
          buildCzChatFollowUp("cz-limit-offer-accept-change", "What changes if I accept?", "What changes if I accept this credit limit offer?"),
        ],
      };
    }

    if (hasAny(normalized, ["what changes if i accept this credit limit offer", "what changes if i accept", "accept this offer"])) {
      return {
        text:
          `### If you accept\n` +
          `The offer starts a guided card-limit flow. The app shows the final proposed limit, the terms, and any confirmation steps before anything changes.\n` +
          `${primaryCard ? `In this scenario, your current limit is **${creditLimit}** and the new proposed limit is **${proposedCreditLimit}**.` : ""}\n` +
          `The right UX is: explore in chat, review details in Card, confirm only after the authenticated final screen.`,
        richBlocks: [creditLimitOfferBlock],
        followUps: [
          buildCzChatFollowUp("cz-limit-offer-continue", "Continue to confirmation", "Continue to confirmation for this credit limit offer."),
          buildCzChatFollowUp("cz-limit-offer-repayment", "Explain repayment impact", "Explain repayment impact for this credit limit offer."),
        ],
      };
    }

    if (
      hasAny(normalized, [
        "i'm interested in this credit limit offer",
        "interested in this credit limit offer",
        "interested in this offer",
        "credit limit offer",
        "credit card limit upgrade options",
        "limit upgrade options",
      ])
    ) {
      return {
        text:
          `### Explore your offer\n` +
          `Based on this simulation profile, the bank has matched your card usage and spending room with a higher limit offer for this credit card.\n` +
          `${primaryCard ? `Your current limit is **${creditLimit}**. The proposed new limit is **${proposedCreditLimit}**.` : "The exact limit is confirmed in the card flow."}\n` +
          `You can review the offer without changing anything. I would check repayment comfort and final eligibility first, then hand you to the authenticated card flow if you want to continue.`,
        richBlocks: [creditLimitOfferBlock],
        followUps: [
          buildCzChatFollowUp("cz-limit-offer-repayment", "Explain repayment impact", "Explain repayment impact for this credit limit offer."),
          buildCzChatFollowUp("cz-limit-offer-accept-change", "What changes if I accept?", "What changes if I accept this credit limit offer?"),
        ],
      };
    }

    if (hasAny(normalized, ["main things i should notice", "financial overview", "homepage overview"])) {
      return {
        text:
          `### Your Home overview\n` +
          `I would read this page in three passes:\n` +
          `1. **Available money:** ${totalAvailable}. This is the money shown as usable now across current and savings balances.\n` +
          `2. **Money owed:** ${totalOwed}. This keeps borrowing visible instead of mixing it with available cash.\n` +
          `3. **Card capacity:** ${primaryCard ? `${primaryCard.name} has ${creditAvailable} free to spend from a ${creditLimit} limit.` : "No credit card capacity is shown in this profile."}\n` +
          `The useful next check is not another generic product pitch. It is to confirm whether the recent movement came from everyday spending, a pending card amount, or a document/confirmation that needs attention.`,
        richBlocks: [homeSnapshotBlock],
        followUps: [
          buildCzChatFollowUp("cz-home-latest-transactions", "Review latest 5", "Show me the latest 5 transactions and which account they came from."),
          buildCzChatFollowUp("cz-home-unusual-spending", "Spot unusual spending", "Check the largest, pending, or category-heavy movements from my latest account activity."),
          buildCzNavigateFollowUp("cz-open-spending", "Open Spending", "analytics"),
        ],
      };
    }

    if (hasAny(normalized, ["how much money can i save", "how much can i save", "monthly saving capacity", "how much should i save"])) {
      return {
        text:
          `### How much you can save\n` +
          `Based on this Home profile, I would start with about **${suggestedMonthlySaving} per month**.\n` +
          `I used three signals: expenses of **${monthlySpending}**, income of **${monthlyIncome}**, and **${currentAccountMoney}** currently sitting in current accounts.`,
        richBlocks: [savingsCapacityBlock, savingsProductChoiceBlock],
        followUps: [
          buildCzChatFollowUp("cz-saving-account-plan", "Saving account", "Use Saving account for my savings plan."),
          buildCzChatFollowUp("cz-term-deposit-plan", "Term deposit", "Use Term deposit for my savings plan."),
        ],
      };
    }

    const selectedSavingAmountKey = hasAny(normalized, ["light amount"])
      ? "light"
      : hasAny(normalized, ["recommended amount"])
        ? "recommended"
        : hasAny(normalized, ["stretch amount", "build buffer amount"])
          ? "stretch"
          : null;

    if (selectedSavingAmountKey && hasAny(normalized, ["saving account", "term deposit"])) {
      const selectedOption =
        savingStartAmountOptions.find((option) => option.key === selectedSavingAmountKey) ?? savingStartAmountOptions[1];
      const productLabel = hasAny(normalized, ["term deposit"]) ? "Term deposit" : "Saving account";
      const selectedStartAmount = formatCzChatMoney(selectedOption.amount, localCurrency, country);
      const interestAmount =
        productLabel === "Term deposit"
          ? formatCzChatMoney(selectedOption.amount * termDepositAnnualRate, localCurrency, country)
          : formatCzChatMoney((selectedOption.amount * savingAccountAnnualRate) / 12, localCurrency, country);
      const selectedRate = productLabel === "Term deposit" ? termDepositRate : savingAccountRate;
      const interestCadence = productLabel === "Term deposit" ? "per year" : "per month";
      const interestPreview =
        productLabel === "Term deposit"
          ? `At ${selectedRate}, ${selectedStartAmount} would earn about ${interestAmount} per year before tax/fees if held for the full term.`
          : `At ${selectedRate}, ${selectedStartAmount} would earn about ${interestAmount} per month before tax/fees while it stays available.`;
      const savingsOpenNowBlock: CoAppingRichBlock = {
        type: "product-cards",
        title: "Ready to open",
        body: `Start with ${selectedStartAmount} now. ${selectedRate} means about ${interestAmount} ${interestCadence} on this amount before tax/fees.`,
        interactive: false,
        products: [
          {
            id: "open-selected-savings-product",
            title: productLabel,
            subtitle: `${selectedRate}; approx. ${interestAmount} ${interestCadence}`,
            meta: "Open now",
            tone: "blue",
            icon: productLabel === "Term deposit" ? "Investments" : "Wallet",
            action: buildCzSavingsProductDetailAction(productLabel),
          },
        ],
      };

      return {
        text:
          `### Ready to open\n` +
          `Perfect. We can start **${productLabel}** with **${selectedStartAmount}** now.\n` +
          `${interestPreview}\n` +
          `The monthly target stays around **${suggestedMonthlySaving}**, based on spending of **${monthlySpending}**, income of **${monthlyIncome}**, and **${currentAccountMoney}** in current accounts.\n` +
          `Chat should stop at this point. Final product terms, rate, eligibility, documents, and confirmation belong in the Products shelf.`,
        richBlocks: [savingsOpenNowBlock],
        followUps: [
          {
            id: `cz-open-now-${productLabel === "Term deposit" ? "term-deposit" : "saving-account"}`,
            label: "Open now",
            action: buildCzSavingsProductDetailAction(productLabel),
          },
          buildCzChatFollowUp("cz-adjust-saving-amount", "Adjust amount", `Use ${productLabel} for my savings plan.`),
          buildCzChatFollowUp("cz-compare-saving-products", "Compare products", "How should I choose between Saving account and Term deposit?"),
        ],
      };
    }

    if (hasAny(normalized, ["use saving account for my savings plan", "choose saving account", "saving account plan"])) {
      return {
        text:
          `### Saving account selected\n` +
          `Good choice for the flexible option. This simulation uses **${savingAccountRate}** for the Saving account, so the money stays accessible while still earning interest.\n` +
          `How much do you want to save now?`,
        followUps: buildSavingsAmountFollowUps("Saving account"),
      };
    }

    if (hasAny(normalized, ["use term deposit for my savings plan", "choose term deposit", "term deposit plan"])) {
      return {
        text:
          `### Term deposit selected\n` +
          `This works for money you can lock for a while. This simulation uses **${termDepositRate}** for the Term deposit, with less flexibility but a stronger rate.\n` +
          `How much do you want to save now?`,
        followUps: buildSavingsAmountFollowUps("Term deposit"),
      };
    }

    if (hasAny(normalized, ["choose between saving account and term deposit", "compare saving products", "saving account and term deposit"])) {
      return {
        text:
          `### Saving account or term deposit?\n` +
          `For this profile I would not make it a generic product pitch.\n` +
          `Use **Saving account** if flexibility matters; the simulation rate is **${savingAccountRate}**.\n` +
          `Use **Term deposit** if you can lock the money; the simulation rate is **${termDepositRate}**.\n` +
          `The starting monthly target remains **${suggestedMonthlySaving}**, grounded in income, spending, and current-account cash.`,
        richBlocks: [savingsProductChoiceBlock],
        followUps: [
          buildCzChatFollowUp("cz-saving-account-plan-after-compare", "Saving account", "Use Saving account for my savings plan."),
          buildCzChatFollowUp("cz-term-deposit-plan-after-compare", "Term deposit", "Use Term deposit for my savings plan."),
        ],
      };
    }

    if (hasAny(normalized, ["latest 5 transactions", "latest five transactions", "which account they came from", "recent 5 transactions", "latest transactions"])) {
      return {
        text:
          `### Latest 5 transactions\n` +
          `Here are the latest visible transactions across this Home profile, with the source account included:\n` +
          `${latestTransactionLines}\n` +
          `Read this as activity evidence, not a balance explanation: the latest set has ${latestDebitTransactions.length} outgoing and ${latestCreditTransactions.length} incoming movement${
            latestHomeTransactions.length === 1 ? "" : "s"
          }. For dispute, receipt, or document proof, open the transaction or Documents rather than relying only on chat.`,
        richBlocks: [latestTransactionSnapshotBlock],
        followUps: [
          buildCzChatFollowUp("cz-home-unusual-from-latest", "Spot unusual spending", "Check the largest, pending, or category-heavy movements from my latest account activity."),
          buildCzNavigateFollowUp("cz-open-account-from-latest", "Open Account", "account-detail"),
          buildCzNavigateFollowUp("cz-open-spending-from-latest", "Open Spending", "analytics"),
        ],
      };
    }

    if (hasAny(normalized, ["unusual spending", "largest, pending", "category-heavy", "latest account activity", "spot unusual", "biggest recent movement"])) {
      const largestDebitLine = largestRecentDebit
        ? `The largest recent outgoing movement is **${largestRecentDebit.label}** for ${formatCzChatSignedMoney(
            largestRecentDebit.amount,
            localCurrency,
            country,
          )} on ${formatCzChatTransactionDate(largestRecentDebit)} from ${largestRecentDebit.sourceProductName}.`
        : "I do not see a recent outgoing movement in this mock profile.";
      const pendingLine = pendingRecentTransactions.length
        ? `Pending items to watch: ${pendingRecentTransactions
            .map((transaction) => `${transaction.label} ${formatCzChatSignedMoney(transaction.amount, localCurrency, country)} from ${transaction.sourceProductName}`)
            .join("; ")}.`
        : "I do not see pending transactions in the latest account-activity set.";
      const categoryLine = topMoneyOutCategory
        ? `The heaviest money-out category is **${topMoneyOutCategory.category}** with ${formatCzChatMoney(
            topMoneyOutCategory.total,
            localCurrency,
            country,
          )} across ${topMoneyOutCategory.transactionCount} transaction${topMoneyOutCategory.transactionCount === 1 ? "" : "s"}.`
        : "There is no money-out category signal to summarize.";

      return {
        text:
          `### Unusual spending check\n` +
          `${largestDebitLine}\n` +
          `${categoryLine}\n` +
          `${pendingLine}\n` +
          `I would use this topic when the customer asks "what looks different?" because it points to concrete movements first, then lets them open Spending or the account for the full list.`,
        richBlocks: [unusualSpendingBlock],
        followUps: [
          buildCzChatFollowUp("cz-home-latest-from-unusual", "Show latest 5", "Show me the latest 5 transactions and which account they came from."),
          buildCzNavigateFollowUp("cz-open-spending-from-unusual", "Open Spending", "analytics"),
          buildCzNavigateFollowUp("cz-open-account-from-unusual", "Open Account", "account-detail"),
        ],
      };
    }

    if (hasAny(normalized, ["available balance, owed amount", "available money", "owed amount"])) {
      return {
        text:
          `### Available money, not just balance\n` +
          `On this Home profile, the key split is:\n` +
          `- **Available now:** ${totalAvailable}, led by ${primaryAccount ? `${primaryAccount.name} at ${accountBalance}` : "the visible current account"}${selectedSavings ? ` and savings at ${savingsBalance}` : ""}.\n` +
          `- **Owed:** ${totalOwed}, shown separately so debt does not make the day-to-day cash picture muddy.\n` +
          `- **Credit card:** ${primaryCard ? `${creditAvailable} is free to spend, but the full card limit is ${creditLimit}.` : "No credit-card limit is available in this profile."}\n` +
          `If the customer asks "can I spend this?", the assistant should start with available money and pending card movements, not total product value.`,
        richBlocks: [homeSnapshotBlock],
        followUps: [
          buildCzChatFollowUp("cz-home-card-room", "Explain card room", "Explain what free to spend means on my credit card."),
          buildCzChatFollowUp("cz-home-documents", "Check documents", "Help me find confirmations, statements, or recent bank documents."),
          buildCzNavigateFollowUp("cz-open-card", "Open Card", "card-detail"),
        ],
      };
    }

    if (hasAny(normalized, ["homepage, what should i review next", "suggest my next action", "review next in the app"])) {
      return {
        text:
          `### Start with recent activity\n` +
          `The concrete Home check is the latest account movement, not a vague "next best step".\n` +
          `${latestTransactionLines}\n` +
          `${largestRecentDebit ? `The biggest outgoing movement in the current activity set is **${largestRecentDebit.label}** for ${formatCzChatSignedMoney(largestRecentDebit.amount, localCurrency, country)} from ${largestRecentDebit.sourceProductName}.` : ""}\n` +
          `If one of these looks unfamiliar, open the account activity or Spending before jumping to products or documents.`,
        richBlocks: [latestTransactionSnapshotBlock, unusualSpendingBlock],
        followUps: [
          buildCzChatFollowUp("cz-home-latest-from-legacy-next", "Show latest 5", "Show me the latest 5 transactions and which account they came from."),
          buildCzChatFollowUp("cz-home-unusual-from-legacy-next", "Spot unusual spending", "Check the largest, pending, or category-heavy movements from my latest account activity."),
          buildCzNavigateFollowUp("cz-open-spending-from-legacy-next", "Open Spending", "analytics"),
        ],
      };
    }

    if (hasAny(normalized, ["what products can i open", "products can i open", "open from product shelf", "open from products shelf", "product shelf", "our products shelf"])) {
      return {
        text:
          `### Products you can open\n` +
          `From **Products > ${productShelfTitle}**, this CZ product shelf currently exposes:\n` +
          `${productShelfLines}\n` +
          `Use this as catalogue discovery: chat can summarize what is available, but opening, applying, eligibility checks, documents, and confirmation belong in the Products shelf.`,
        richBlocks: [productShelfBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-products-shelf", "Open Products", "products"),
          buildCzChatFollowUp("cz-products-savings-shelf", "Explain savings options", "Help me understand savings and investment product choices."),
          buildCzChatFollowUp("cz-products-borrowing-shelf", "Review borrowing options", "Help me understand loan or mortgage options before applying."),
        ],
      };
    }

    if (hasAny(normalized, ["confirmations, statements", "recent bank documents", "payment confirmation in documents", "search account statements", "share or download a document", "legal notices"])) {
      const newest = latestDocument
        ? `${latestDocument.description} from ${latestDocument.date}${latestDocument.isNew ? " marked NEW" : ""}`
        : "the newest document group";
      return {
        text:
          `### Recent documents\n` +
          `I would start in **Documents**, not in a broad search.\n` +
          `The newest visible item in this mock profile is **${newest}**.\n` +
          `Use the list this way:\n` +
          `1. Start with the newest year group.\n` +
          `2. Search by document type: confirmation, statement, receipt, legal notice.\n` +
          `3. Open the row before sharing or deleting. Legal files should explain restrictions before any destructive action.`,
        richBlocks: [documentBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-documents", "Open Documents", "documents"),
          buildCzChatFollowUp("cz-doc-confirmation", "Find confirmation", "I need help finding a payment confirmation in Documents."),
          buildCzChatFollowUp("cz-doc-legal", "Explain legal files", "Which document types are legal notices and what can I do with them?"),
        ],
      };
    }

    if (hasAny(normalized, ["where my money went", "this month's spending", "compare my spending categories", "reduce spending", "subscriptions", "recurring payments"])) {
      return {
        text:
          `### Spending readout\n` +
          `A useful answer should separate signal from noise:\n` +
          `- Compare card payments and recurring merchants first.\n` +
          `- Then look for category changes instead of listing every transaction.\n` +
          `- If the goal is to save money, protect fixed payments first and review subscriptions or price changes second.\n` +
          `For this preview, the best handoff is Spending because it already owns category and recurring-payment context.`,
        richBlocks: [homeSnapshotBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-spending", "Open Spending", "analytics"),
          buildCzChatFollowUp("cz-review-subscriptions", "Review subscriptions", "Help me spot recurring payments or subscriptions in my spending."),
          buildCzChatFollowUp("cz-find-savings", "Find saving ideas", "Where could I reduce spending without hurting important payments?"),
        ],
      };
    }

    if (hasAny(normalized, ["start a new payment", "start a payment safely", "payment limits", "fees, timing", "signing", "after i sign", "recurring payment", "template makes sense", "payment step"])) {
      return {
        text:
          `### Payment check\n` +
          `Before sending money, the assistant should check the exact step:\n` +
          `1. Recipient and account number.\n` +
          `2. Amount, currency, due date, and message/reference.\n` +
          `3. Limits, fees, and whether signing is still required.\n` +
          `For repeated transfers, use a standing order when date and amount are predictable. Use a template when the user wants to review each transfer manually.`,
        richBlocks: [paymentBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-payments", "Open Payments", "payments"),
          buildCzChatFollowUp("cz-payment-confirmation", "Find confirmation", "Help me find or understand a payment confirmation."),
          buildCzChatFollowUp("cz-standing-order", "Standing order or template?", "Help me decide whether a recurring payment or template makes sense."),
        ],
      };
    }

    if (hasAny(normalized, ["compare account", "product offers", "relevant offers", "savings and investment product choices", "loan or mortgage options", "product options", "explore savings and investing", "review loan options"])) {
      return {
        text:
          `### Product choice without pushing\n` +
          `I would split Products into intent, not a catalogue dump:\n` +
          `- **Everyday banking:** accounts and cards, based on usage and controls.\n` +
          `- **Saving:** ${selectedSavings ? `${selectedSavings.name} currently shows ${savingsBalance}.` : "start from goal, access rules, and interest."}\n` +
          `- **Borrowing:** show instalment, remaining amount, fees, and eligibility before any application.\n` +
          `- **Investing:** explain risk and documents before product selection.\n` +
          `The assistant can recommend where to look, but the final product action belongs in Products or the product detail screen.`,
        richBlocks: [productsBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-products", "Open Products", "products"),
          buildCzChatFollowUp("cz-compare-savings", "Compare savings", "Help me compare this savings product with other options in the app."),
          buildCzChatFollowUp("cz-review-borrowing", "Review borrowing", "Help me understand loan or mortgage options before applying."),
        ],
      };
    }

    if (hasAny(normalized, ["security settings", "app preferences", "contact the bank", "support route", "branch", "consents", "third-party access", "applications"])) {
      return {
        text:
          `### Service route\n` +
          `For More, the answer should route the customer by task:\n` +
          `- Documents for statements, confirmations, contracts, and legal notices.\n` +
          `- Settings for security and app preferences.\n` +
          `- Contacts for branch, support, or advisor preparation.\n` +
          `- Consents and applications for third-party access or active requests.\n` +
          `That is more useful than listing every More tile in the same order.`,
        richBlocks: [documentBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-documents", "Open Documents", "documents"),
          buildCzNavigateFollowUp("cz-open-settings", "Open Settings", "settings"),
          buildCzNavigateFollowUp("cz-open-contacts", "Open Contacts", "contacts"),
        ],
      };
    }

    if (hasAny(normalized, ["available balance versus current balance", "specific transaction on this account", "filtering account activity", "account number, iban", "account details"])) {
      return {
        text:
          `### Account help\n` +
          `${primaryAccount ? `I am looking at **${primaryAccount.name}**, currently ${accountBalance}.` : "Start from the selected account detail."}\n` +
          `For balance questions, compare available/current balance and then inspect pending or recent transactions.\n` +
          `For transaction questions, search by merchant, amount, category, or date window.\n` +
          `For sharing details, open Account details so IBAN/account number copy stays inside the authenticated app surface.`,
        richBlocks: [homeSnapshotBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-account", "Open Account", "account-detail"),
          buildCzChatFollowUp("cz-account-filter", "Filter activity", "Guide me through filtering account activity by amount, type, or category."),
          buildCzChatFollowUp("cz-account-doc", "Find related document", "Help me find confirmations, statements, or recent bank documents."),
        ],
      };
    }

    if (hasAny(normalized, ["card security", "security settings and recent activity", "card limits", "temporarily for a purchase", "pin for this card", "card transactions", "free to spend"])) {
      return {
        text:
          `### Card check\n` +
          `${primaryCard ? `${primaryCard.name} shows ${creditAvailable} free to spend from a ${creditLimit} limit.` : "Start from the selected card detail."}\n` +
          `The useful checks are:\n` +
          `1. Recent card transactions and pending reservations.\n` +
          `2. Online, contactless, ATM, and temporary limit controls.\n` +
          `3. PIN/security options, with sensitive actions kept behind app authorization.\n` +
          `${primaryCard ? `If the user is interested, the limit-review path can explain a possible ${proposedCreditLimit} limit without changing anything from chat.` : ""}`,
        richBlocks: [productsBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-card", "Open Card", "card-detail"),
          buildCzChatFollowUp("cz-limit-review", "Review limit option", "I'm interested in this credit limit offer."),
          buildCzChatFollowUp("cz-card-transactions", "Search card activity", "Help me understand or search recent card transactions."),
        ],
      };
    }

    if (hasAny(normalized, ["savings product", "savings progress", "interest, term", "access rules", "move money to or from", "compare this savings"])) {
      return {
        text:
          `### Savings check\n` +
          `${selectedSavings ? `${selectedSavings.name} currently shows ${savingsBalance}.` : "Start by identifying which savings product the user means."}\n` +
          `A realistic assistant answer should cover:\n` +
          `- progress versus goal or starting amount;\n` +
          `- interest, term, and access rules;\n` +
          `- whether moving money affects availability or a term/deposit condition.\n` +
          `If the customer is comparing products, ask about time horizon before naming a product.`,
        richBlocks: [productsBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-products", "Open Products", "products"),
          buildCzChatFollowUp("cz-savings-transfer", "Move money safely", "Can you guide me before I move money to or from this savings product?"),
          buildCzChatFollowUp("cz-savings-interest", "Explain interest", "Explain the interest, term, and access rules for this savings product."),
        ],
      };
    }

    if (hasAny(normalized, ["remaining amount", "monthly payment", "end date", "repaying part", "repay early", "next instalment", "loan contracts", "mortgage contracts", "interest rate", "fixation"])) {
      return {
        text:
          `### Borrowing check\n` +
          `${selectedLoan ? `${selectedLoan.name} is the visible borrowing item, with ${loanBalance} remaining/owed in this profile.` : `Total owed is ${totalOwed}.`}\n` +
          `For loans or mortgages, the assistant should not jump straight to an application or repayment action.\n` +
          `First review remaining amount, instalment, rate/fixation context, fees, and the account used for the next payment.\n` +
          `Documents are the right place for contracts, schedule changes, and official confirmations.`,
        richBlocks: [documentBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-documents", "Open Documents", "documents"),
          buildCzChatFollowUp("cz-early-repay", "Explain early repayment", "Explain what I should check before repaying part of this loan early."),
          buildCzChatFollowUp("cz-next-payment", "Review next payment", "Help me review the next mortgage payment and related account activity."),
        ],
      };
    }

    if (hasAny(normalized, ["start an investment goal", "start investment goal", "set investment goal", "new investment goal"])) {
      return {
        text:
          `### Investment goal setup\n` +
          `I can help shape the goal before any product choice.\n` +
          `Start with the purpose, then the assistant can narrow the horizon, starting amount, monthly contribution, and risk comfort.\n` +
          `In this simulation profile the investment portfolio is ${investmentValue} with ${investmentReturn} performance, so I would keep the goal conversation connected to the current portfolio instead of starting from a blank catalogue.\n` +
          `Nothing is ordered from chat; the final product, documents, suitability, and authorization stay inside Investments.`,
        richBlocks: [investmentGoalPortfolioBlock],
        followUps: [
          buildCzChatFollowUp("cz-goal-grow-savings", "Grow my savings"),
          buildCzChatFollowUp("cz-goal-future-purchase", "Future purchase"),
          buildCzChatFollowUp("cz-goal-long-term", "Long-term reserve"),
        ],
      };
    }

    if (hasAny(normalized, ["grow my savings", "future purchase", "long-term reserve", "retirement"])) {
      const selectedGoal = normalized.includes("future purchase")
        ? "future purchase"
        : normalized.includes("long-term") || normalized.includes("retirement")
          ? "long-term reserve"
          : "grow my savings";

      return {
        text:
          `### Goal selected\n` +
          `Good, I will treat this as a **${selectedGoal}** goal.\n` +
          `The next useful input is time horizon. Money needed soon should stay calmer and more accessible; money with a longer horizon can usually tolerate more movement.\n` +
          `Pick the closest horizon so the preview can stay realistic.`,
        followUps: [
          buildCzChatFollowUp("cz-goal-horizon-3-5", "In 3-5 years"),
          buildCzChatFollowUp("cz-goal-horizon-5-10", "In 5-10 years"),
          buildCzChatFollowUp("cz-goal-horizon-unsure", "Not sure yet"),
        ],
      };
    }

    if (hasAny(normalized, ["5,000 czk", "5000 czk", "10,000 czk", "10000 czk", "i'm not sure yet", "im not sure yet"])) {
      return {
        text:
          `### Starting amount noted\n` +
          `A recurring contribution can make the plan less dependent on one perfect entry day.\n` +
          `For this mock profile, I would keep the contribution modest until the portfolio exposure and any pending orders are reviewed.\n` +
          `Choose a monthly amount or skip it for now.`,
        followUps: [
          buildCzChatFollowUp("cz-goal-monthly-500", "500 CZK monthly"),
          buildCzChatFollowUp("cz-goal-monthly-1000", "1,000 CZK monthly"),
          buildCzChatFollowUp("cz-goal-monthly-not-now", "Not now"),
        ],
      };
    }

    if (hasAny(normalized, ["in 3-5 years", "in 5-10 years", "not sure yet"])) {
      return {
        text:
          `### Time horizon captured\n` +
          `Now choose an initial amount for the simulation.\n` +
          `This is only used for the simulation preview. The real app would still confirm source of funds, product documents, suitability, and authorization before any order.\n` +
          `The current portfolio context is ${investmentValue} with ${investmentReturn} performance, so I would not start from a blank product catalogue.`,
        followUps: [
          buildCzChatFollowUp("cz-goal-amount-5000", "5,000 CZK"),
          buildCzChatFollowUp("cz-goal-amount-10000", "10,000 CZK"),
          buildCzChatFollowUp("cz-goal-amount-unsure", "I'm not sure yet"),
        ],
      };
    }

    if (hasAny(normalized, ["500 czk monthly", "1,000 czk monthly", "1000 czk monthly", "not now"])) {
      return {
        text:
          `### Model portfolio preview\n` +
          `Here is the kind of preview that makes the goal flow useful without pretending to place an order.\n` +
          `It connects the goal to the existing portfolio: ${investmentValue}, ${investmentReturn} performance, ${topInvestmentShare} in the largest holding, and ${assetClassMix || "the visible asset-class mix"}.\n` +
          `Before any real product action, the customer still needs documents, risk checks, and authorization inside Investments.`,
        richBlocks: [investmentGoalAllocationBlock],
        followUps: [
          buildCzChatFollowUp("cz-goal-see-projection", "See projection"),
          buildCzChatFollowUp("cz-goal-why-balanced", "Why this portfolio?"),
          buildCzChatFollowUp("cz-goal-review-orders", "Review orders", "Review my investment orders."),
        ],
      };
    }

    if (hasAny(normalized, ["see projection", "simulation", "projection"])) {
      return {
        text:
          `### Projection preview\n` +
          `This is an illustrative planning view, not a promise.\n` +
          `The assistant should show a range so the customer understands uncertainty, then keep final product selection and documents in the Investments area.\n` +
          `Use this after the goal, horizon, starting amount, and monthly habit are clear.`,
        richBlocks: [investmentGoalProjectionBlock],
        followUps: [
          buildCzChatFollowUp("cz-goal-adjust-amount", "Adjust amount", "I want to adjust the starting amount for this investment goal."),
          buildCzChatFollowUp("cz-goal-why-balanced-next", "Why this portfolio?"),
          buildCzChatFollowUp("cz-goal-review-portfolio", "Review portfolio", "Review my investment portfolio context."),
        ],
      };
    }

    if (hasAny(normalized, ["adjust amount", "adjust the starting amount"])) {
      return {
        text:
          `### Adjust starting amount\n` +
          `Sure. Choose the amount you want to use for the simulation.\n` +
          `This does not create an order; it only changes the preview path.`,
        followUps: [
          buildCzChatFollowUp("cz-goal-adjust-5000", "5,000 CZK"),
          buildCzChatFollowUp("cz-goal-adjust-10000", "10,000 CZK"),
          buildCzChatFollowUp("cz-goal-adjust-unsure", "I'm not sure yet"),
        ],
      };
    }

    if (hasAny(normalized, ["why this portfolio", "why this mix", "explain risk"])) {
      return {
        text:
          `### Why this portfolio\n` +
          `For a goal preview, I would explain the mix before naming any product.\n` +
          `The current portfolio already shows ${assetClassMix || "an asset-class split"} and ${currencyMix || "a currency split"}, with ${topInvestmentSecurity ? `${topInvestmentShare} in ${topInvestmentSecurity.title}` : "no single holding selected"}.\n` +
          `That gives the assistant a smarter starting point: check whether the goal horizon matches the exposure, then decide whether the next action is a monthly habit, order review, or no action yet.`,
        richBlocks: [investmentGoalAllocationBlock],
        followUps: [
          buildCzChatFollowUp("cz-goal-see-projection-from-why", "See projection"),
          buildCzChatFollowUp("cz-goal-review-orders-from-why", "Review orders", "Review my investment orders."),
          buildCzChatFollowUp("cz-goal-plan-next-from-why", "Plan next move", "Help me decide the smartest next investment step using my portfolio, orders, risk, and currency exposure."),
        ],
      };
    }

    if (hasAny(normalized, ["review my investment portfolio context", "review my portfolio", "review portfolio", "portfolio context", "current portfolio"])) {
      return {
        text:
          `### Portfolio context\n` +
          `${investmentProduct ? `${investmentProduct.name} currently shows ${investmentValue} and ${investmentReturn} performance.` : "This profile can still explain the portfolio review path."}\n` +
          `I would review it in this order:\n` +
          `1. Value and performance: read ${investmentReturn} together with ${investmentGainLoss}, not as a standalone recommendation.\n` +
          `2. Concentration: ${topInvestmentSecurity ? `${topInvestmentSecurity.title} is the largest holding at ${topInvestmentShare}.` : "check whether one product dominates the portfolio."}\n` +
          `3. Exposure: ${currencyMix || "check currency distribution"} and ${assetClassMix || "asset class distribution"} before adding money.\n` +
          `4. Activity: check orders before starting a new buy, because pending or rejected orders can change the next step.`,
        richBlocks: [investmentPortfolioBlock, investmentOrdersBlock],
        followUps: [
          buildCzChatFollowUp("cz-invest-review-orders", "Review my orders", "Review my investment orders."),
          buildCzChatFollowUp("cz-invest-next-move", "Plan next move", "Help me decide the smartest next investment step using my portfolio, orders, risk, and currency exposure."),
          buildCzNavigateFollowUp("cz-open-investments", "Open Investments", "investments"),
        ],
      };
    }

    if (hasAny(normalized, ["review my investment orders", "review my orders", "investment orders", "pending orders", "rejected orders", "executed orders", "order status"])) {
      return {
        text:
          `### Investment orders\n` +
          `Orders are the action trail behind the portfolio. In this mock profile the status mix is **${orderStatusSummary}**.\n` +
          `Latest order: ${latestOrderSummary}.\n` +
          `Read them this way:\n` +
          `1. **Pending** means the portfolio may still change, so do not top up blindly.\n` +
          `2. **Executed** confirms what already affected holdings and history.\n` +
          `3. **Rejected** needs a reason check before retrying, especially if price, documents, or suitability changed.\n` +
          `The right handoff is Investments History on the Orders tab; chat should summarize and prepare the review, not hide the order evidence.`,
        richBlocks: [investmentOrdersBlock],
        followUps: [
          buildCzChatFollowUp("cz-invest-pending-orders", "Pending orders", "Explain my pending investment orders."),
          buildCzChatFollowUp("cz-invest-rejected-orders", "Rejected orders", "Explain rejected investment orders and what to check before retrying."),
          buildCzNavigateFollowUp("cz-open-investment-history", "Open History", "investments-history"),
        ],
      };
    }

    if (hasAny(normalized, ["smartest next investment step", "plan next investment move", "plan next move", "next investment step", "risk and currency exposure", "review risk", "reduce currency risk", "rebalance", "set recurring order", "recurring order"])) {
      return {
        text:
          `### Next investment move\n` +
          `I would not answer this with one product. A smarter next step compares portfolio shape and order activity first.\n` +
          `- Portfolio: ${investmentValue}, ${investmentReturn} performance, ${topInvestmentSecurity ? `${topInvestmentShare} in ${topInvestmentSecurity.title}` : "largest holding not available"}.\n` +
          `- Exposure: ${currencyMix || "currency mix needs review"}; ${assetClassMix || "asset-class mix needs review"}.\n` +
          `- Orders: ${orderStatusSummary}. ${pendingInvestmentOrders.length ? "Resolve pending orders before adding a new one." : "No pending-order blocker appears in the mock order set."}\n` +
          `Suggested path: define the goal, check whether exposure still fits, then choose between a recurring order, a one-off top-up, or doing nothing until the next review date.`,
        richBlocks: [investmentPortfolioBlock, investmentOrdersBlock, investmentNextMoveBlock],
        followUps: [
          buildCzChatFollowUp("cz-invest-start-goal", "Start a goal", "Start an investment goal."),
          buildCzChatFollowUp("cz-invest-review-orders-next", "Review orders", "Review my investment orders."),
          buildCzNavigateFollowUp("cz-open-investments-next", "Open Investments", "investments"),
        ],
      };
    }

    if (hasAny(normalized, ["specific inbox", "outbox message", "message types", "bank notifications"])) {
      return {
        text:
          `### Messages help\n` +
          `Use Messages for bank communication, not transaction proof.\n` +
          `Inbox is for received notices, Outbox is for requests or messages sent from the app, and Documents is where durable statements or confirmations should live.\n` +
          `If the user needs evidence for a payment, route to Documents or the transaction detail instead of only searching messages.`,
        richBlocks: [documentBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-messages", "Open Messages", "messages"),
          buildCzNavigateFollowUp("cz-open-documents", "Open Documents", "documents"),
          buildCzChatFollowUp("cz-find-confirmation", "Find payment proof", "Help me find or understand a payment confirmation."),
        ],
      };
    }

    if (hasAny(normalized, ["prime can help", "contact or prepare questions for my advisor", "advisor questions"])) {
      return {
        text:
          `### Prime preparation\n` +
          `A good Prime answer should help the customer prepare before contacting the advisor.\n` +
          `Summarize the goal, the amount involved, urgency, risk or borrowing questions, and any documents the advisor should review.\n` +
          `Then route to Prime or Contacts rather than pretending the chat itself is the advisor.`,
        followUps: [
          buildCzNavigateFollowUp("cz-open-prime", "Open Prime", "prime"),
          buildCzNavigateFollowUp("cz-open-contacts", "Open Contacts", "contacts"),
          buildCzChatFollowUp("cz-prepare-advisor", "Prepare questions", "Help me prepare questions before contacting the bank."),
        ],
      };
    }

    if (hasAny(normalized, ["right support", "support or branch contact", "prepare questions before contacting"])) {
      return {
        text:
          `### Contact route\n` +
          `First decide whether this is servicing, advice, or urgent security.\n` +
          `- Security issue: card block/support first.\n` +
          `- Product advice: prepare context and use advisor/Prime where available.\n` +
          `- Branch/contact search: open Contacts and choose the channel there.\n` +
          `The assistant should prepare the question, not replace the official contact route.`,
        followUps: [
          buildCzNavigateFollowUp("cz-open-contacts", "Open Contacts", "contacts"),
          buildCzChatFollowUp("cz-card-security", "Card security", "Help me review this card's security settings and recent activity."),
          buildCzChatFollowUp("cz-documents", "Find documents", "Help me find statements, contracts, confirmations, or legal notices."),
        ],
      };
    }

    if (hasAny(normalized, ["why should i review the card before documents", "why this order"])) {
      return {
        text:
          `### Why that order\n` +
          `The card check is action-oriented: it can explain free-to-spend, recent reservations, and the limit-review opportunity.\n` +
          `Documents are evidence-oriented: useful when the customer needs a statement, receipt, contract, or legal notice.\n` +
          `So I would start with Card if the question is "what should I do next?", and Documents if the question is "where is the proof?"`,
        richBlocks: [productsBlock],
        followUps: [
          buildCzNavigateFollowUp("cz-open-card", "Open Card", "card-detail"),
          buildCzNavigateFollowUp("cz-open-documents", "Open Documents", "documents"),
        ],
      };
    }

    return defaultReplyResolver(input);
  };
}

function buildCzChatHelpContext(area: CzChatHelpArea, id: string): CoAppingChatContext {
  switch (area) {
    case "documents":
      return {
        id,
        title: buildCzChatTitle("what document do you need?"),
        suggestedTopics: [
          {
            id: "documents-confirmation",
            label: "Find a payment confirmation",
            prompt: "I need help finding a payment confirmation in Documents.",
          },
          {
            id: "documents-statements",
            label: "Search account statements",
            prompt: "Help me search account statements and older bank documents.",
          },
          {
            id: "documents-legal",
            label: "Explain legal documents",
            prompt: "Which document types are legal notices and what can I do with them?",
          },
          {
            id: "documents-share",
            label: "Share or download a document",
            prompt: "Can you guide me to share or download a document safely?",
          },
        ],
      };
    case "account":
      return {
        id,
        title: buildCzChatTitle("what should we check on this account?"),
        suggestedTopics: [
          buildCzChatTopic("account-balance", "Explain my balance", "Help me understand available balance versus current balance on this account."),
          buildCzChatTopic("account-transaction", "Find a transaction", "Help me find a specific transaction on this account."),
          buildCzChatTopic("account-filters", "Filter account activity", "Guide me through filtering account activity by amount, type, or category."),
          buildCzChatTopic("account-details", "Find account details", "Where can I find account number, IBAN, and other account details?"),
        ],
      };
    case "card":
      return {
        id,
        title: buildCzChatTitle("what should we check on this card?"),
        suggestedTopics: [
          buildCzChatTopic("card-security", "Check card security", "Help me review this card's security settings and recent activity."),
          buildCzChatTopic("card-limits", "Change card limits", "Can I change my card limits temporarily for a purchase?"),
          buildCzChatTopic("card-pin", "Find card PIN options", "Where can I view or manage the PIN for this card?"),
          buildCzChatTopic("card-transactions", "Review card transactions", "Help me understand or search recent card transactions."),
        ],
      };
    case "savings":
      return {
        id,
        title: buildCzChatTitle("what should we check on your savings?"),
        suggestedTopics: [
          buildCzChatTopic("savings-progress", "Review savings progress", "Help me understand how this savings product is progressing."),
          buildCzChatTopic("savings-interest", "Explain interest", "Explain the interest, term, and access rules for this savings product."),
          buildCzChatTopic("savings-transfer", "Move money safely", "Can you guide me before I move money to or from this savings product?"),
          buildCzChatTopic("savings-options", "Compare savings options", "Help me compare this savings product with other options in the app."),
        ],
      };
    case "loan":
      return {
        id,
        title: buildCzChatTitle("what should we check on this loan?"),
        suggestedTopics: [
          buildCzChatTopic("loan-balance", "Explain loan balance", "Help me understand remaining amount, monthly payment, and end date for this loan."),
          buildCzChatTopic("loan-repay-early", "Can I repay early?", "Explain what I should check before repaying part of this loan early."),
          buildCzChatTopic("loan-next-payment", "Review next payment", "Help me find the next instalment and what happens if it changes."),
          buildCzChatTopic("loan-documents", "Find loan documents", "Where can I find loan contracts, statements, or confirmations?"),
        ],
      };
    case "mortgage":
      return {
        id,
        title: buildCzChatTitle("what should we check on this mortgage?"),
        suggestedTopics: [
          buildCzChatTopic("mortgage-balance", "Explain mortgage balance", "Help me understand remaining mortgage amount, monthly payment, and end date."),
          buildCzChatTopic("mortgage-rate", "Check interest rate", "Explain the interest rate and what I should watch before the next fixation or review."),
          buildCzChatTopic("mortgage-next-payment", "Review next payment", "Help me review the next mortgage payment and related account activity."),
          buildCzChatTopic("mortgage-documents", "Find mortgage documents", "Where can I find mortgage contracts, statements, or confirmations?"),
        ],
      };
  }
}

function getCzChatHelpAreaForAccountProduct(product: Product | null): CzChatHelpArea {
  if (product?.type === "saving_account" || product?.type === "term_deposit") return "savings";
  if (product?.type === "loan") return "loan";
  if (product?.type === "mortgage") return "mortgage";
  return "account";
}

function getCzChatHelpAreaForScreen(screen: Screen, accountProduct: Product | null = null): CzChatHelpArea | null {
  if (screen === "documents") return "documents";
  if (
    screen === "account-detail" ||
    screen === "account-details-info" ||
    screen === "account-options" ||
    screen === "transaction-detail"
  ) {
    return getCzChatHelpAreaForAccountProduct(accountProduct);
  }
  if (screen === "card-detail") return "card";
  return null;
}

function buildCzChatScreenContext(screen: Screen, id: string, accountProduct: Product | null = null): CoAppingChatContext | null {
  const helpArea = getCzChatHelpAreaForScreen(screen, accountProduct);
  if (helpArea) return buildCzChatHelpContext(helpArea, id);

  switch (screen) {
    case "homepage":
      return {
        id,
        title: buildCzChatTitle("what should we look at first?"),
        suggestedTopics: [
          buildCzChatTopic("home-saving-capacity", "How much can I save?", "How much money can I save every month?"),
          buildCzChatTopic("home-overview", "Review today's money snapshot", "Help me understand the main things I should notice on my homepage."),
          buildCzChatTopic("home-product-shelf", "What products can I open", "What products can I open from the product shelf?"),
          buildCzChatTopic("home-latest-transactions", "Review latest 5 transactions", "Show me the latest 5 transactions and which account they came from."),
          buildCzChatTopic("home-unusual-spending", "Spot unusual spending", "Check the largest, pending, or category-heavy movements from my latest account activity."),
        ],
      };
    case "analytics":
      return {
        id,
        title: buildCzChatTitle("what spending insight do you need?"),
        suggestedTopics: [
          buildCzChatTopic("spending-month", "Explain this month's spending", "Help me understand where my money went this month."),
          buildCzChatTopic("spending-subscriptions", "Find subscriptions", "Help me spot recurring payments or subscriptions in my spending."),
          buildCzChatTopic("spending-categories", "Compare categories", "Compare my spending categories and highlight what changed."),
          buildCzChatTopic("spending-save", "Find saving opportunities", "Where could I reduce spending without hurting important payments?"),
        ],
      };
    case "payments":
      return {
        id,
        title: buildCzChatTitle("what payment do you need help with?"),
        suggestedTopics: [
          buildCzChatTopic("payments-new", "Start a payment safely", "Guide me through the safest way to start a new payment."),
          buildCzChatTopic("payments-limits", "Check limits and fees", "Explain payment limits, fees, timing, and signing before I continue."),
          buildCzChatTopic("payments-confirmation", "Find payment confirmation", "Help me find or understand a payment confirmation."),
          buildCzChatTopic("payments-repeat", "Set up recurring payment", "Help me decide whether a recurring payment or template makes sense."),
        ],
      };
    case "products":
      return {
        id,
        title: buildCzChatTitle("what product should we explore?"),
        suggestedTopics: [
          buildCzChatTopic("products-compare", "Compare product options", "Help me compare account, card, loan, savings, and investment options."),
          buildCzChatTopic("products-offers", "Find relevant offers", "Which product offers are relevant and what should I check first?"),
          buildCzChatTopic("products-savings", "Explore savings and investing", "Help me understand savings and investment product choices."),
          buildCzChatTopic("products-borrowing", "Review loan options", "Help me understand loan or mortgage options before applying."),
        ],
      };
    case "more":
      return {
        id,
        title: buildCzChatTitle("what service do you need?"),
        suggestedTopics: [
          buildCzChatTopic("more-documents", "Find documents", "Help me find statements, contracts, confirmations, or legal notices."),
          buildCzChatTopic("more-settings", "Review settings", "Guide me to the settings that matter for security and preferences."),
          buildCzChatTopic("more-support", "Contact the bank", "Help me find the right contact, branch, or support route."),
          buildCzChatTopic("more-consents", "Manage consents", "Explain where to review consents, applications, and third-party access."),
        ],
      };
    case "domestic-payment":
    case "payment-review":
    case "payment-sign":
    case "payment-success":
      return {
        id,
        title: buildCzChatTitle("need a quick payment check?"),
        suggestedTopics: [
          {
            id: "payment-check",
            label: "Check this payment step",
            prompt: "Help me understand what I should check before I continue this payment.",
          },
          {
            id: "payment-limits",
            label: "Explain limits and fees",
            prompt: "Explain the relevant payment limits, fees, and timing for this transfer.",
          },
          {
            id: "payment-signing",
            label: "What happens after signing?",
            prompt: "What happens after I sign this payment and how can I track it?",
          },
        ],
      };
    case "investments":
    case "investments-history":
      return {
        id,
        title: buildCzChatTitle("where should we start with investments?"),
        suggestedTopics: [
          {
            id: "investments-goal",
            label: "Start an investment goal",
            prompt: "Start an investment goal.",
          },
          {
            id: "investments-portfolio",
            label: "Review portfolio context",
            prompt: "Review my investment portfolio context.",
          },
          {
            id: "investments-orders",
            label: "Review my orders",
            prompt: "Review my investment orders.",
          },
          {
            id: "investments-next-move",
            label: "Plan next investment move",
            prompt: "Help me decide the smartest next investment step using my portfolio, orders, risk, and currency exposure.",
          },
        ],
      };
    case "messages":
      return {
        id,
        title: buildCzChatTitle("what message should I help find?"),
        suggestedTopics: [
          {
            id: "messages-find",
            label: "Find a message",
            prompt: "Help me find a specific inbox or outbox message.",
          },
          {
            id: "messages-explain",
            label: "Explain message types",
            prompt: "Explain the difference between inbox, outbox, and bank notifications.",
          },
        ],
      };
    case "prime":
      return {
        id,
        title: buildCzChatTitle("how can I help with Prime?"),
        suggestedTopics: [
          {
            id: "prime-benefits",
            label: "Explain Prime benefits",
            prompt: "Explain what Prime can help with in this banking app.",
          },
          {
            id: "prime-contact",
            label: "Contact my advisor",
            prompt: "Help me understand how to contact or prepare questions for my advisor.",
          },
        ],
      };
    case "settings":
      return {
        id,
        title: buildCzChatTitle("what setting do you need?"),
        suggestedTopics: [
          {
            id: "settings-security",
            label: "Find security settings",
            prompt: "Help me find and understand the security settings I should review.",
          },
          {
            id: "settings-preferences",
            label: "Manage app preferences",
            prompt: "Guide me through the app preferences that matter most.",
          },
        ],
      };
    case "contacts":
      return {
        id,
        title: buildCzChatTitle("who do you need to reach?"),
        suggestedTopics: [
          {
            id: "contacts-support",
            label: "Find support contact",
            prompt: "Help me find the right support or branch contact.",
          },
          {
            id: "contacts-advisor",
            label: "Prepare advisor questions",
            prompt: "Help me prepare questions before contacting the bank.",
          },
        ],
      };
    default:
      return {
        id,
        title: buildCzChatTitle("what can I help with here?"),
      };
  }
}

export default function App() {
  // Parse the shared deep link once, so the whole provider tree boots into the
  // shared state (product/country/scenario/release/theme/... — see deepLink.ts).
  const parsedDeepLink = useMemo(() => parseDeepLinkFromUrl(), []);
  const initialDemoState = useMemo(
    () => deepLinkToDemoInitialState(parsedDeepLink),
    [parsedDeepLink],
  );

  return (
    <DemoProvider initialState={initialDemoState}>
      <AppWithNavigation parsedDeepLink={parsedDeepLink} />
    </DemoProvider>
  );
}

/**
 * Wrapper that initializes NavigationProvider with correct initial screen
 * based on demo scenario (or a shared deep link, when present)
 */
function AppWithNavigation({
  parsedDeepLink,
}: {
  parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl>;
}) {
  const { scenario, themeMode } = useDemo();
  const hashSection = typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "");
  const shouldOpenDesignSystem = DESIGN_SYSTEM_HASHES.has(hashSection);

  // Determine initial screen: a shared deep link wins, else fall back to the
  // existing hash/scenario-driven default.
  const initialScreen = parsedDeepLink?.screen
    ? parsedDeepLink.screen
    : shouldOpenDesignSystem
      ? "design-system"
      : scenario === "active"
        ? "homepage"
        : "prelogin-inactive";
  const initialCoAppingActive = !shouldOpenDesignSystem && scenario === "active";

  // Frameless "real device" mode (opened from the Share QR): render the app
  // fullscreen without the desktop demo shell / phone bezel.
  const deviceMode = Boolean(parsedDeepLink?.deviceMode);
  const appContent = <AppContent parsedDeepLink={parsedDeepLink} deviceMode={deviceMode} />;
  const shellClassName = [
    themeMode === "dark" ? "dark" : "",
    deviceMode ? "min-h-[100dvh]" : "h-screen",
  ].filter(Boolean).join(" ");

  return (
    <div data-uc-theme={themeMode} className={shellClassName}>
      <NavigationProvider
        initialScreen={initialScreen}
        initialCoAppingActive={initialCoAppingActive}
      >
        <LanguageProvider initialLanguage={parsedDeepLink?.language}>
          {deviceMode ? appContent : <DemoShell>{appContent}</DemoShell>}
        </LanguageProvider>
      </NavigationProvider>
    </div>
  );
}

function AppContent({
  parsedDeepLink,
  deviceMode,
}: {
  parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl>;
  deviceMode: boolean;
}) {
  const {
    currentScreen,
    isCoAppingActive,
    navigateTo,
    goBack,
    setCoAppingActive,
  } = useNavigationContext();

  const demoState = useDemo();
  const {
    product,
    country,
    scenario,
    designSystem,
    themeMode,
    release,
    baseline,
    bankingScenario,
    amountsHidden,
  } = demoState;
  const { language } = useLanguage();
  const { categories } = useProducts();
  const coAppingAvailable = isCoAppingAvailable(country);
  const isCzCoAppingChatbotPreviewActive = isFeatureActive(demoState, "fx_czCoAppingSmartAssistant");
  const isPreloginScreen = currentScreen === "prelogin-inactive" || currentScreen === "prelogin-active";
  const isInAppScreen =
    !isPreloginScreen && currentScreen !== "flow-library" && currentScreen !== "design-system";
  const isCzChatLevelOneScreen = CZ_CHAT_LEVEL_ONE_SCREENS.has(currentScreen);
  const czChatLauncherVariant: CzChatLauncherVariant = "edge-tab";
  const isPiRuntimeContext = product === "PI" && designSystem === "current";
  const isMarketKidsRuntimeContext =
    product === "KIDS_PI" && designSystem === "current" && isKidsHomeCountry(country);
  const isKidsRuntimeContext = isMarketKidsRuntimeContext;
  const isThemedKidsRuntimeContext = product === "KIDS_PI" && country === "HU" && designSystem === "current";
  const isSupportedRuntimeContext = isPiRuntimeContext || isKidsRuntimeContext;
  const investmentsPortfolioAvailable = isInvestmentsPortfolioAvailable(product, country);
  
  const [showTerminatePopup, setShowTerminatePopup] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  // Track de unde am pornit co-apping session (pentru a ne întoarce corect)
  const [coAppingOriginScreen, setCoAppingOriginScreen] = useState<'prelogin-inactive' | 'prelogin-active'>('prelogin-inactive');
  // Track logout dialog state pentru a ascunde home indicator-ul
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  // Track edge loading animation state
  const [showEdgeAnimation, setShowEdgeAnimation] = useState(false);
  // Track if content should be hidden during animation
  const [hideContentDuringAnimation, setHideContentDuringAnimation] = useState(false);
  // Track if FAB should slide in
  const [showFABSlideIn, setShowFABSlideIn] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(parsedDeepLink?.accountId ?? null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(parsedDeepLink?.cardId ?? null);
  const [selectedFlowPreviewId, setSelectedFlowPreviewId] = useState<FlowPreviewId>(parsedDeepLink?.flowId ?? "ro-round-up");
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<DomesticPaymentDraft | null>(null);
  const [czChatOpen, setCzChatOpen] = useState(false);
  const [czChatContext, setCzChatContext] = useState<CoAppingChatContext | null>(null);
  const [czChatInitialMode, setCzChatInitialMode] = useState<CoAppingAssistantMode>("chat");
  const [productsShelfFocusRequest, setProductsShelfFocusRequest] = useState<ProductsShelfFocusRequest | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetailSelection | null>(null);
  const accountProducts = categories.flatMap((category) => category.products);
  const selectedAccountProduct = accountProducts.find((accountProduct) => accountProduct.id === selectedAccountId) ?? accountProducts[0] ?? null;
  const selectedCardProduct =
    accountProducts.find((cardProduct) => cardProduct.id === selectedCardId) ??
    accountProducts.find((cardProduct) => cardProduct.type === "credit_card") ??
    null;
  const creditCardForOpportunity = isCreditCardProduct(selectedCardProduct)
    ? selectedCardProduct
    : (accountProducts.find(isCreditCardProduct) ?? null);
  const czChatOpportunities = buildCreditCardOpportunities(creditCardForOpportunity, country, currentScreen);
  const czChatReplyResolver = useMemo<CoAppingReplyResolver>(
    () =>
      buildCzChatSmartReplyResolver({
        country,
        categories,
        selectedAccountProduct,
        selectedCardProduct,
        creditCardForOpportunity,
      }),
    [categories, country, creditCardForOpportunity, selectedAccountProduct, selectedCardProduct],
  );

  useEffect(() => {
    preloadMoreCardImages();
  }, []);

  useEffect(() => {
    const syncDesignSystemHash = () => {
      const hashSection = window.location.hash.replace(/^#/, "");
      if (DESIGN_SYSTEM_HASHES.has(hashSection) && currentScreen !== "design-system") {
        navigateTo("design-system");
      }
    };

    syncDesignSystemHash();
    window.addEventListener("hashchange", syncDesignSystemHash);
    return () => window.removeEventListener("hashchange", syncDesignSystemHash);
  }, [currentScreen, navigateTo]);

  useEffect(() => {
    const handleFlowPreviewSelect = (event: Event) => {
      const flowId = (event as CustomEvent<FlowPreviewId>).detail;
      if (flowId) setSelectedFlowPreviewId(flowId);
    };

    window.addEventListener("flow-preview-select", handleFlowPreviewSelect);
    return () => window.removeEventListener("flow-preview-select", handleFlowPreviewSelect);
  }, []);

  // Keep the browser URL in sync with the current state, so the address bar is
  // always a live deep link (refresh/bookmark/Share all work everywhere).
  useEffect(() => {
    const url = buildDeepLinkUrl({
      product,
      country,
      scenario,
      designSystem,
      release,
      bankingScenario,
      themeMode,
      amountsHidden,
      language,
      screen: currentScreen,
      flowId: currentScreen === "flow-library" ? selectedFlowPreviewId : null,
      accountId: selectedAccountId,
      cardId: selectedCardId,
      deviceMode,
    });
    window.history.replaceState(window.history.state, "", url);
  }, [
    product,
    country,
    scenario,
    designSystem,
    release,
    baseline,
    bankingScenario,
    themeMode,
    amountsHidden,
    language,
    currentScreen,
    selectedFlowPreviewId,
    selectedAccountId,
    selectedCardId,
    deviceMode,
  ]);

  // Determină varianta status bar-ului bazat pe ecranul curent
  const getStatusBarVariant = (): 'light' | 'dark' | 'theme' => {
    if (isThemedKidsRuntimeContext) {
      return "theme";
    }

    if (isKidsRuntimeContext) {
      return "light";
    }

    if (
      themeMode === "dark" &&
      currentScreen !== "prelogin-inactive" &&
      currentScreen !== "prelogin-active" &&
      currentScreen !== "prime"
    ) {
      return "dark";
    }

    switch (currentScreen) {
      case 'prelogin-inactive':
        return 'dark'; // fundal întunecat cu imagine
      case 'language-selector':
        return 'light'; // fundal alb
      case 'prelogin-active':
        return 'dark'; // overlay semi-transparent peste fundal întunecat
      case 'co-apping-session':
        return 'light'; // fundal alb - full screen ca language selector
      case 'homepage':
        return 'light'; // fundal gri deschis (var(--uc-app-bg)) - text și iconițe trebuie negre
      case 'analytics':
      case 'messages':
        return 'light';
      case 'payments':
      case 'domestic-payment':
      case 'payment-review':
      case 'payment-sign':
      case 'payment-success':
        return 'light';
      case 'products':
      case 'product-detail':
      case 'investments':
      case 'investments-history':
        return 'light';
      case 'prime':
        return 'dark'; // fundal gradient întunecat - text și iconițe albe
      case 'more':
      case 'documents':
      case 'settings':
        return 'light'; // fundal alb - text și iconițe negre
      case 'contacts':
        return 'light'; // fundal alb - text și iconițe negre
      case 'account-detail':
      case 'account-details-info':
      case 'account-options':
      case 'transaction-detail':
      case 'card-detail':
        return 'light';
      case 'design-system':
        return 'light';
      default:
        return 'dark';
    }
  };

  // Handler pentru click pe butonul OTHER - deschide panel-ul
  const handleOtherClick = () => {
    console.log("🟢 OTHER clicked - opening panel menu");
    setShowPanel(true);
  };

  // Handler pentru închidere panel
  const handleClosePanel = () => {
    console.log("🟢 Closing panel menu");
    setShowPanel(false);
  };

  // Handler pentru click pe language selector
  const handleLanguageClick = () => {
    console.log("Language selector clicked - navigating to language screen");
    navigateTo("language-selector");
  };

  // Handler pentru înapoi din language selector
  const handleLanguageBack = () => {
    goBack();
  };

  // Handler pentru start co-apping
  const handleStartCoApping = () => {
    console.log("Starting co-apping session");
    // Salvează de unde am pornit (inactive sau active)
    const originScreen = currentScreen === 'prelogin-inactive' ? 'prelogin-inactive' : 'prelogin-active';
    setCoAppingOriginScreen(originScreen);
    console.log(`🎯 Co-Apping origin screen saved: ${originScreen}`);
    
    setShowPanel(false); // Close panel first
    navigateTo("co-apping-session");
  };

  // Handler pentru continuare din co-apping session
  const handleContinueCoApping = () => {
    console.log(`✅ Co-Apping activated - returning to origin screen: ${coAppingOriginScreen}`);
    setCoAppingActive(true);
    // Hide content during animation
    setHideContentDuringAnimation(true);
    // Start edge loading animation
    setShowEdgeAnimation(true);
    // Enable FAB slide in
    setShowFABSlideIn(true);
    // Înapoi la ecranul de unde am venit (nu homepage!)
    navigateTo(coAppingOriginScreen);
  };

  // Handler when animation completes
  const handleAnimationComplete = () => {
    setShowEdgeAnimation(false);
    setHideContentDuringAnimation(false);
    setShowFABSlideIn(false);
  };

  // Handler when animation starts
  const handleAnimationStart = () => {
    setHideContentDuringAnimation(true);
  };
  
  // Handler pentru click pe butonul floating verde
  const handleFloatingButtonClick = () => {
    setShowTerminatePopup(true);
  };

  // Handler pentru anulare terminare sesiune
  const handleCancelTermination = () => {
    setShowTerminatePopup(false);
  };

  // Handler pentru confirmare terminare sesiune
  const handleConfirmTermination = () => {
    setShowTerminatePopup(false);
    setCoAppingActive(false);
  };

  // Handler pentru închidere co-apping screen
  const handleCloseCoAppingScreen = () => {
    goBack();
  };

  // Handler pentru login cu Face ID
  const handleLoginClick = () => {
    console.log("🔐 Login completed - navigating to Homepage");
    navigateTo("homepage");
  };

  // Handler pentru navigare la Prime
  const handlePrimeClick = () => {
    console.log("💎 Prime clicked - navigating to Prime screen");
    navigateTo("prime");
  };

  // Handler pentru înapoi din Prime
  const handlePrimeBack = () => {
    goBack();
  };

  // Handler pentru navigare la More
  const handleMoreClick = () => {
    console.log("📋 More clicked - navigating to More screen");
    navigateTo("more");
  };

  const handlePaymentsClick = () => {
    console.log("Payments clicked - navigating to Payments screen");
    navigateTo("payments");
  };

  const handleAnalyticsClick = () => {
    console.log("Analytics clicked - navigating to Analytics screen");
    navigateTo("analytics");
  };

  const handleMessagesClick = () => {
    console.log("Messages clicked - navigating to Messages screen");
    navigateTo("messages");
  };

  const handleProductsClick = () => {
    console.log("Products clicked - navigating to Products screen");
    navigateTo("products");
  };

  const handleProductDetailOpen = (selection: ProductDetailSelection) => {
    setSelectedProductDetail(selection);
    navigateTo("product-detail");
  };

  const handleInvestmentsClick = () => {
    if (!investmentsPortfolioAvailable) return;

    console.log("Investments clicked - navigating to Investments portfolio screen");
    navigateTo("investments");
  };

  const handleInvestmentsHistoryClick = () => {
    if (!investmentsPortfolioAvailable) return;

    console.log("Investments history clicked - navigating to Investments history screen");
    navigateTo("investments-history");
  };

  // Handler pentru înapoi din More
  const handleMoreBack = () => {
    goBack();
  };

  const handleAccountClick = (product: Product) => {
    if (product.type === "debit_card" || product.type === "credit_card") {
      setSelectedCardId(product.id);
      navigateTo("card-detail");
      return;
    }
    setSelectedAccountId(product.id);
    navigateTo("account-detail");
  };

  const handleCardClick = (product: Product) => {
    setSelectedCardId(product.id);
    navigateTo("card-detail");
  };

  const handleAccountDetailsClick = (product: Product) => {
    setSelectedAccountId(product.id);
    navigateTo("account-details-info");
  };

  const handleAccountOptionsClick = () => {
    navigateTo("account-options");
  };

  const handleTransactionClick = (transaction: AccountTransaction, productForTransaction: Product) => {
    setSelectedAccountId(productForTransaction.id);
    setSelectedTransaction(transaction);
    navigateTo("transaction-detail");
  };

  const handleRedoPaymentClick = () => {
    if (!selectedTransaction) return;

    setPaymentDraft(createRedoDomesticPaymentDraft(selectedTransaction, country, selectedAccountProduct));
    navigateTo("domestic-payment");
  };

  const handleDomesticPaymentClick = () => {
    setPaymentDraft(createEmptyDomesticPaymentDraft(country, selectedAccountProduct));
    navigateTo("domestic-payment");
  };

  const openCzChatHelp = (area: CzChatHelpArea) => {
    setCzChatInitialMode("chat");
    setCzChatContext(buildCzChatHelpContext(area, `${area}-${Date.now()}`));
    setCzChatOpen(true);
  };

  const handleCzChatLauncherOpen = () => {
    setCzChatInitialMode("chat");
    setCzChatContext(buildCzChatScreenContext(currentScreen, `${currentScreen}-${Date.now()}`, selectedAccountProduct));
  };

  const openCzChatForYou = () => {
    setCzChatInitialMode("for-you");
    setCzChatContext(buildCzChatScreenContext(currentScreen, `${currentScreen}-${Date.now()}`, selectedAccountProduct));
    setCzChatOpen(true);
  };

  const handleCzChatAction = (action: CoAppingChatAction) => {
    if (action.type !== "navigate" || !action.target) return;

    switch (action.target) {
      case "investments":
        navigateTo("investments");
        break;
      case "investments-history":
        navigateTo("investments-history");
        break;
      case "analytics":
        navigateTo("analytics");
        break;
      case "card-detail":
        if (creditCardForOpportunity) setSelectedCardId(creditCardForOpportunity.id);
        setCzChatOpen(false);
        navigateTo("card-detail");
        break;
      case "product-detail":
        {
          const productDetailSelection = getCzSavingsProductDetailSelection(action.id, country);
          if (!productDetailSelection) break;

          setSelectedProductDetail(productDetailSelection);
          setCzChatOpen(false);
          navigateTo("product-detail");
        }
        break;
      case "products":
        {
          const shelfCardId = getProductsShelfFocusCardId(action.id);
          if (shelfCardId !== undefined) {
            setProductsShelfFocusRequest({
              requestId: Date.now(),
              cardId: shelfCardId,
            });
            setCzChatOpen(false);
          }
        }
        navigateTo("products");
        break;
      case "payments":
        navigateTo("payments");
        break;
      case "documents":
        navigateTo("documents");
        break;
      case "messages":
        navigateTo("messages");
        break;
      case "settings":
        navigateTo("settings");
        break;
      case "contacts":
        navigateTo("contacts");
        break;
      case "prime":
        navigateTo("prime");
        break;
      case "account-detail":
        if (selectedAccountProduct) setSelectedAccountId(selectedAccountProduct.id);
        navigateTo("account-detail");
        break;
    }
  };

  const handleDomesticPaymentNext = (nextDraft: DomesticPaymentDraft) => {
    setPaymentDraft(nextDraft);
    navigateTo("payment-review");
  };

  const handlePaymentDone = () => {
    setPaymentDraft(null);
    setSelectedTransaction(null);
    navigateTo("payments");
  };

  // Handler pentru logout confirmation
  const handleLogoutConfirm = () => {
    console.log('🚪 Logout confirmed - navigating to PreLogin Active');
    navigateTo('prelogin-active');
  };

  // In device mode the app is rendered fullscreen (no bezel); otherwise the
  // desktop preview shows it inside the simulated phone frame.
  const FrameComponent = deviceMode ? FramelessDeviceFrame : MobileFrame;
  const czChatLayer =
    isCzCoAppingChatbotPreviewActive && isInAppScreen ? (
      <CoAppingChatLauncher
        buttonLabel="Open CZ - Chatbot"
        variant={czChatLauncherVariant}
        open={czChatOpen}
        onOpenChange={setCzChatOpen}
        onLauncherOpen={handleCzChatLauncherOpen}
        onAction={handleCzChatAction}
        entryContext={czChatContext}
        opportunities={czChatOpportunities}
        initialMode={czChatInitialMode}
        resolveReply={czChatReplyResolver}
      />
    ) : null;

  return (
    <>
      {/* Demo Navigation Sync - automatically resets to Homepage on settings change */}
      <DemoNavigationSync />

      {currentScreen === "design-system" && (
        <Suspense fallback={<ScreenFallback />}>
          <DesignSystemPage />
        </Suspense>
      )}

      {currentScreen === "flow-library" && (
        <Suspense fallback={<ScreenFallback />}>
          <FlowLibraryScreen
            initialFlowId={parsedDeepLink?.flowId ?? "ro-round-up"}
            selectedFlowId={selectedFlowPreviewId}
            onFlowChange={setSelectedFlowPreviewId}
          />
        </Suspense>
      )}

      {currentScreen !== "design-system" && currentScreen !== "flow-library" && (
      <FrameComponent
        statusBarVariant={getStatusBarVariant()}
        isCoAppingActive={isCoAppingActive && coAppingAvailable}
        overlay={czChatLayer}
      >
        <Suspense fallback={<ScreenFallback />}>
        {isSupportedRuntimeContext ? (
        <>
        {isKidsRuntimeContext ? (
          isKidsHomeCountry(country) ? (
            <KidsMarketHomeApp country={country} />
          ) : null
        ) : (
        <>
        {/* ========== PRE-LOGIN SCREENS ========== */}
        {/* Show INACTIVE PreLogin when scenario is "inactive" */}
        {currentScreen === "prelogin-inactive" && scenario === "inactive" && (
          <PreLoginScreen 
            onOtherClick={handleOtherClick}
            onLanguageClick={handleLanguageClick}
          />
        )}

        {/* Show ACTIVE PreLogin when scenario is "active" or on "prelogin-active" screen */}
        {(scenario === "active" || currentScreen === "prelogin-active") && 
         (currentScreen === "prelogin-inactive" || currentScreen === "prelogin-active") && (
          <PreLoginActiveScreen 
            onOtherClick={handleOtherClick}
            onLanguageClick={handleLanguageClick}
            onLoginClick={handleLoginClick}
          />
        )}

        {/* Language Selector Screen */}
        {currentScreen === "language-selector" && (
          <LanguageSelector onBack={handleLanguageBack} />
        )}

        {/* Co-Apping Session Screen - only available for CZ and SK */}
        {currentScreen === "co-apping-session" && coAppingAvailable && (
          <CoAppingSessionScreen
            onContinue={handleContinueCoApping}
            onBack={handleCloseCoAppingScreen}
          />
        )}

        {/* Homepage - EXACT ca Prime și More (NO animation) */}
        {currentScreen === "homepage" && (
          <HomeScreen
            onPrimeClick={handlePrimeClick}
            onAnalyticsClick={handleAnalyticsClick}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onProductsClick={handleProductsClick}
            onMoreClick={handleMoreClick}
            onAccountClick={handleAccountClick}
            onInvestmentsClick={handleInvestmentsClick}
          />
        )}

        {currentScreen === "analytics" && (
          <AnalyticsScreen
            onHomeClick={() => navigateTo("homepage")}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onProductsClick={handleProductsClick}
            onMoreClick={handleMoreClick}
          />
        )}

        {currentScreen === "messages" && (
          <MessagesScreen onBack={goBack} />
        )}

        {currentScreen === "account-detail" && (
          <AccountDetailScreen
            selectedProductId={selectedAccountId}
            onBack={goBack}
            onDetailsClick={handleAccountDetailsClick}
            onOptionsClick={handleAccountOptionsClick}
            onTransactionClick={handleTransactionClick}
            onHelpClick={
              isCzCoAppingChatbotPreviewActive
                ? () => openCzChatHelp(getCzChatHelpAreaForAccountProduct(selectedAccountProduct))
                : undefined
            }
          />
        )}

        {currentScreen === "transaction-detail" && selectedTransaction && (
          <TransactionDetailScreen
            country={country}
            product={selectedAccountProduct}
            transaction={selectedTransaction}
            onBack={goBack}
            onRedoPayment={handleRedoPaymentClick}
          />
        )}

        {currentScreen === "account-details-info" && (
          <AccountDetailsInfoScreen
            selectedProductId={selectedAccountId}
            onBack={goBack}
          />
        )}

        {currentScreen === "account-options" && (
          <AccountOptionsScreen onBack={goBack} />
        )}

        {currentScreen === "card-detail" && (
          <CardDetailScreen
            selectedCardId={selectedCardId}
            onBack={goBack}
            onTransactionClick={handleTransactionClick}
            onHelpClick={isCzCoAppingChatbotPreviewActive ? () => openCzChatHelp("card") : undefined}
            aiOpportunityNudge={
              isCzCoAppingChatbotPreviewActive && isCreditCardProduct(selectedCardProduct)
                ? {
                    title: "Upgrade your credit limit to 15 000 CZK",
                    body: "You have a personalized offer ready. Review the new limit first; nothing changes unless you continue.",
                    ctaLabel: "FIND OUT MORE",
                  }
                : null
            }
            onAiOpportunityClick={openCzChatForYou}
          />
        )}

        {/* Prime Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "prime" && (
          <PrimeScreen onBack={handlePrimeBack} />
        )}

        {/* More Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "more" && (
          <MoreScreen 
            onBack={handleMoreBack} 
            onHomeClick={() => navigateTo('homepage')}
            onAnalyticsClick={handleAnalyticsClick}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onProductsClick={handleProductsClick}
            onContactsClick={() => navigateTo('contacts')}
            onDocumentsClick={() => navigateTo('documents')}
            onSettingsClick={() => navigateTo('settings')}
            onLogoutConfirm={handleLogoutConfirm}
          />
        )}

        {currentScreen === "documents" && (
          <DocumentsScreen
            onBack={goBack}
            onHelpClick={isCzCoAppingChatbotPreviewActive ? () => openCzChatHelp("documents") : undefined}
          />
        )}

        {currentScreen === "settings" && (
          <SettingsScreen onBack={goBack} />
        )}

        {currentScreen === "payments" && (
          <PaymentsScreen
            onHomeClick={() => navigateTo("homepage")}
            onAnalyticsClick={handleAnalyticsClick}
            onContactsClick={() => navigateTo('contacts')}
            onMessagesClick={handleMessagesClick}
            onProductsClick={handleProductsClick}
            onMoreClick={handleMoreClick}
            onDomesticPaymentClick={handleDomesticPaymentClick}
          />
        )}

        {currentScreen === "domestic-payment" && paymentDraft && (
          <DomesticPaymentCreateScreen
            draft={paymentDraft}
            onBack={goBack}
            onNext={handleDomesticPaymentNext}
          />
        )}

        {currentScreen === "payment-review" && paymentDraft && (
          <PaymentReviewScreen
            draft={paymentDraft}
            onBack={goBack}
            onSign={() => navigateTo("payment-sign")}
          />
        )}

        {currentScreen === "payment-sign" && (
          <PaymentSignScreen
            onBack={goBack}
            onSign={() => navigateTo("payment-success")}
          />
        )}

        {currentScreen === "payment-success" && (
          <PaymentSuccessScreen onDone={handlePaymentDone} />
        )}

        {currentScreen === "products" && (
          <ProductsScreen
            onHomeClick={() => navigateTo("homepage")}
            onAnalyticsClick={handleAnalyticsClick}
            onContactsClick={() => navigateTo('contacts')}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onMoreClick={handleMoreClick}
            onProductDetailOpen={handleProductDetailOpen}
            productsShelfFocusRequest={productsShelfFocusRequest}
            onProductsShelfFocusHandled={() => setProductsShelfFocusRequest(null)}
          />
        )}

        {currentScreen === "product-detail" && (
          <ProductDetailScreen
            title={selectedProductDetail?.title ?? "Product name"}
            cardId={selectedProductDetail?.cardId}
            optionId={selectedProductDetail?.optionId}
            onBack={goBack}
          />
        )}

        {currentScreen === "investments" && investmentsPortfolioAvailable && (
          <InvestmentsPortfolioScreen onBack={goBack} onHistoryClick={handleInvestmentsHistoryClick} />
        )}

        {currentScreen === "investments-history" && investmentsPortfolioAvailable && (
          <InvestmentsHistoryScreen onBack={goBack} />
        )}

        {/* Contacts Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "contacts" && (
          <ContactsScreen 
            onBack={goBack} 
            onPrimeClick={handlePrimeClick}
          />
        )}

        {/* Panel Overlay - appears on PreLogin screens when OTHER is clicked */}
        {showPanel && (
          <PanelOverlay 
            onClose={handleClosePanel}
            onStartCoApping={handleStartCoApping}
            onPrimeClick={handlePrimeClick}
            onMoreClick={handleMoreClick}
          />
        )}

        {/* ========== CO-APPING LAYER - PERSISTENT PE TOATE SCREEN-URILE ========== */}
        {/* Floating Co-Apping Button - apare pe TOATE screen-urile când sesiunea e activă */}
        {isCoAppingActive && coAppingAvailable && (
          <FloatingCoAppingButton 
            onClick={handleFloatingButtonClick} 
            showSlideIn={showFABSlideIn}
          />
        )}
        
        {/* Terminate Session Popup - overlay peste tot când vrei să termini sesiunea */}
        {showTerminatePopup && (
          <TerminateSessionPopup
            onCancel={handleCancelTermination}
            onTerminate={handleConfirmTermination}
          />
        )}
        
        {/* Edge Loading Animation - overlay peste tot când vrei să încarci sesiunea */}
        {showEdgeAnimation && (
          <EdgeLoadingAnimation 
            onComplete={handleAnimationComplete}
            onAnimationStart={handleAnimationStart}
          />
        )}
        </>
        )}
        </>
        ) : (
          <UnsupportedContextScreen product={product} designSystem={designSystem} />
        )}
        </Suspense>
      </FrameComponent>
      )}
    </>
  );
}

/**
 * Lightweight fallback shown while a lazy screen chunk loads. Kept inline to
 * avoid pulling in any component that would itself be lazy.
 */
function ScreenFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--uc-surface)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--uc-border)] border-t-[var(--uc-action)]" />
    </div>
  );
}
