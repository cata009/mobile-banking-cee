import {
  buildInvestmentChartPoints,
  buildInvestmentDistributionItems,
  buildInvestmentHistoryOrders,
  buildInvestmentSecurities,
  buildInvestmentSecurityCatalog,
} from "@/app/config/investmentsPortfolioConfig";
import { getProductCardSheetConfig, getProductsMenuForCountry } from "@/app/config/productsMenuConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import { createSpendingAnalyticsTimeline } from "@/data/spendingAnalytics";
import { isInternalTransferCategory } from "@/data/pfmCategories";
import type { CurrentAccount, Product } from "@/data/products";
import {
  buildInvestmentBuyOrderQuote,
  getInvestmentBuyOrderValidation,
} from "@/app/screens/investments/investmentBuyOrderModel";
import {
  type CoAppingFollowUpSuggestion,
  type CoAppingInvestmentChart,
  type CoAppingReplyResolver,
  type CoAppingRichBlock,
  defaultReplyResolver,
} from "../../../package/mobile-pi-coapping-chat-package/src";
import {
  CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX,
  buildCzChatFollowUp,
  buildCzNavigateAction,
  buildCzNavigateFollowUp,
  buildCzSavingsProductDetailAction,
  formatCzChatDate,
  formatCzChatMoney,
  formatCzChatSignedMoney,
  formatCzChatTransactionDate,
  getCzLatestDocument,
  isCreditCardProduct,
  roundCzChatSavingAmount,
  type CzChatSmartReplyOptions,
} from "./cz/helpers";
import {
  buildInvestmentGoalProjectionBlock,
  extractInvestmentGoalDraft,
  formatInvestmentGoalHorizon,
  formatInvestmentGoalPurpose,
  formatInvestmentGoalRisk,
  getInvestmentGoalFundCollectionId,
  getInvestmentGoalNextStep,
} from "./cz/investmentGoal";
import {
  buildInvestmentCommercialFollowUp,
  buildInvestmentDoneFollowUp,
  buildInvestmentEssentialsFollowUp,
  buildInvestmentPortfolioFollowUp,
  buildInvestmentRiskFollowUp,
} from "./cz/investmentFollowUps";

export {
  CZ_CHAT_PRODUCTS_SHELF_CARD_ACTION_PREFIX,
  CZ_CHAT_PRODUCT_DETAIL_ACTION_PREFIX,
  buildCreditCardOpportunities,
  getCzSavingsProductDetailSelection,
  getProductsShelfFocusCardId,
  isCreditCardProduct,
} from "./cz/helpers";
export type { ProductsShelfFocusRequest } from "./cz/helpers";
export {
  buildCzChatHelpContext,
  buildCzChatScreenContext,
  getCzChatHelpAreaForAccountProduct,
  getCzChatHelpAreaForScreen,
} from "./cz/context";

export type { CzChatHelpArea, CzChatLauncherVariant } from "./cz/helpers";

export function buildCzChatSmartReplyResolver({
  country,
  categories,
  selectedAccountProduct,
  selectedCardProduct,
  creditCardForOpportunity,
  selectedInvestmentSecurity = null,
}: CzChatSmartReplyOptions): CoAppingReplyResolver {
  const localCurrency = getCountryConfig(country).currency;
  const allProducts = categories.flatMap((category) => category.products);
  const currentAccounts = allProducts.filter(
    (product): product is CurrentAccount => product.type === "current_account",
  );
  const savingsProducts = allProducts.filter((product) => product.type === "saving_account");
  const loansAndMortgages = allProducts.filter((product) => product.type === "loan" || product.type === "mortgage");
  const investmentProducts = allProducts.filter((product) => product.type === "investment_account");
  const investmentProduct =
    allProducts.find((product): product is Extract<Product, { type: "investment_account" }> => product.type === "investment_account") ??
    null;
  const investmentSecurities = buildInvestmentSecurities(investmentProducts, country);
  const investmentSecurityCatalog = buildInvestmentSecurityCatalog(investmentSecurities, country);
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
  const selectedInvestmentValue = selectedInvestmentSecurity?.owned
    ? formatCzChatMoney(selectedInvestmentSecurity.localValue, selectedInvestmentSecurity.localCurrency, country)
    : null;
  const selectedInvestmentMarketPrice = selectedInvestmentSecurity
    ? formatCzChatMoney(selectedInvestmentSecurity.marketPrice, selectedInvestmentSecurity.instrumentCurrency, country)
    : null;
  const selectedInvestmentPerformance = selectedInvestmentSecurity
    ? `${selectedInvestmentSecurity.performancePercent >= 0 ? "+" : "-"}${Math.abs(selectedInvestmentSecurity.performancePercent).toFixed(2)}%`
    : null;
  const selectedInvestmentQuantity = selectedInvestmentSecurity
    ? new Intl.NumberFormat(getCountryConfig(country).locale, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(selectedInvestmentSecurity.quantity)
    : null;
  const selectedInvestmentRisk = selectedInvestmentSecurity?.riskLevel
    ? `${selectedInvestmentSecurity.riskLevel} risk`
    : "Risk level not available";
  const selectedInvestmentLiquidity = selectedInvestmentSecurity?.liquidity
    ? `${selectedInvestmentSecurity.liquidity} liquidity`
    : "Liquidity not available";
  const selectedInvestmentPortfolioShare =
    selectedInvestmentSecurity?.owned && investmentLocalTotal > 0
      ? `${Math.round((selectedInvestmentSecurity.localValue / investmentLocalTotal) * 100)}%`
      : null;
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
      .filter((transaction) => transaction.amount < 0 && !isInternalTransferCategory(transaction.category))
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

  const selectedInvestmentProductBlock: CoAppingRichBlock | null = selectedInvestmentSecurity
    ? {
        type: "investment-summary",
        logoId: selectedInvestmentSecurity.logoId ?? "unicredit",
        title: selectedInvestmentSecurity.title,
        body: `${selectedInvestmentSecurity.assetClass} ${selectedInvestmentSecurity.productType.toLowerCase()} in ${selectedInvestmentSecurity.instrumentCurrency}. ${selectedInvestmentRisk}; ${selectedInvestmentLiquidity}.`,
        metricLayout: "stack",
        metrics: selectedInvestmentSecurity.owned
          ? [
              { label: "Holding value", value: selectedInvestmentValue ?? "n/a", helper: `${selectedInvestmentQuantity ?? "0"} PCS` },
              { label: "Performance", value: selectedInvestmentPerformance ?? "n/a", helper: "Current product snapshot" },
              { label: "Market price", value: selectedInvestmentMarketPrice ?? "n/a", helper: `Updated ${selectedInvestmentSecurity.lastUpdate}` },
            ]
          : [
              { label: "Market price", value: selectedInvestmentMarketPrice ?? "n/a", helper: `Updated ${selectedInvestmentSecurity.lastUpdate}` },
              { label: "Performance", value: selectedInvestmentPerformance ?? "n/a", helper: "Product snapshot" },
              { label: "Ownership", value: "Not held", helper: "Available in the catalogue" },
            ],
      }
    : null;

  const selectedInvestmentChart: CoAppingInvestmentChart | null = selectedInvestmentSecurity
    ? {
        currency: selectedInvestmentSecurity.instrumentCurrency,
        defaultPeriod: "3y",
        series: {
          "1m": buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, "1m"),
          "3m": buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, "3m"),
          "1y": buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, "1y"),
          "3y": buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, "3y"),
          max: buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, "max"),
        },
      }
    : null;

  const selectedInvestmentMarketPriceFormatted = selectedInvestmentSecurity
    ? formatCzChatMoney(selectedInvestmentSecurity.marketPrice, selectedInvestmentSecurity.instrumentCurrency, country)
    : "";

  const selectedInvestmentExplanationBlock: CoAppingRichBlock | null = selectedInvestmentSecurity
    ? {
        type: "investment-summary",
        logoId: selectedInvestmentSecurity.logoId ?? "unicredit",
        title: selectedInvestmentSecurity.title,
        eyebrow: `Actual market price: ${selectedInvestmentMarketPriceFormatted}`,
        body: "",
        metricLayout: "stack",
        metrics: [
          {
            label: "Structure",
            value: `${selectedInvestmentSecurity.assetClass} ${selectedInvestmentSecurity.productType.toLowerCase()}`,
            helper: "Diversified investment product",
          },
          {
            label: "Currency",
            value: selectedInvestmentSecurity.instrumentCurrency,
            helper: selectedInvestmentSecurity.owned
              ? `Portfolio value displayed in ${selectedInvestmentSecurity.localCurrency}`
              : "Instrument denomination",
          },
          {
            label: "Dealing",
            value: selectedInvestmentLiquidity.replace(/\s+liquidity$/i, ""),
            helper: "Subject to the fund's redemption rules",
          },
        ],
      }
    : null;

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

  const normalize = (input: string) => input.toLowerCase().replace(/\s+/g, " ").trim();
  const hasAny = (normalized: string, terms: string[]) => terms.some((term) => normalized.includes(term));
  const selectedInvestmentNameNormalized = selectedInvestmentSecurity
    ? normalize(selectedInvestmentSecurity.title)
    : "";

  return (input, messages) => {
    const normalized = normalize(input);
    const investmentGoalDraft = extractInvestmentGoalDraft(messages);
    const investmentGoalNextStep = getInvestmentGoalNextStep(investmentGoalDraft);
    const namedInvestmentSecurity = investmentSecurityCatalog.find((security) =>
      normalized.includes(normalize(security.title)),
    );

    if (namedInvestmentSecurity && namedInvestmentSecurity.id !== selectedInvestmentSecurity?.id) {
      return buildCzChatSmartReplyResolver({
        country,
        categories,
        selectedAccountProduct,
        selectedCardProduct,
        creditCardForOpportunity,
        selectedInvestmentSecurity: namedInvestmentSecurity,
      })(input, messages);
    }

    const hasShownSelectedInvestmentCard = Boolean(
      selectedInvestmentSecurity &&
        messages.some((message) =>
          message.role === "agent" &&
          message.richBlocks?.some(
            (block) => block.type === "investment-summary" && block.title === selectedInvestmentSecurity.title,
          ),
        ),
    );
    const showSelectedInvestmentCardOnce = (block: CoAppingRichBlock | null) =>
      block && !hasShownSelectedInvestmentCard ? [block] : undefined;

    const normalizedInvestmentUserMessages = messages
      .filter((message) => message.role === "user")
      .map((message) => normalize(message.text));
    const hasVisitedInvestmentTopic = (terms: string[]) =>
      normalizedInvestmentUserMessages.some((message) => hasAny(message, terms));
    const consumedInvestmentFollowUpIds = new Set<string>();

    if (hasVisitedInvestmentTopic(["how is my position", "doing for me", "review my performance", "position performing", "product performing", "holding performing", "performance of this"])) {
      consumedInvestmentFollowUpIds.add("cz-investment-product-performance");
    }
    if (hasVisitedInvestmentTopic(["what could affect my return", "affect my return from", "review risk", "explain the risk", "risk and liquidity", "liquidity and currency", "currency exposure of"])) {
      consumedInvestmentFollowUpIds.add("cz-investment-product-risk");
    }
    if (hasVisitedInvestmentTopic(["show me the essential information", "show me the essentials", "summarize the key document", "documents should i review", "documents matter", "what documents", "key information document", "prospectus"])) {
      consumedInvestmentFollowUpIds.add("cz-investment-product-documents");
    }
    if (hasVisitedInvestmentTopic(["in my portfolio context", "review portfolio", "portfolio fit", "portfolio context for"])) {
      consumedInvestmentFollowUpIds.add("cz-investment-product-portfolio");
    }
    if (hasVisitedInvestmentTopic(["product overview for"])) {
      consumedInvestmentFollowUpIds.add("cz-investment-product-overview");
    }

    const keepUnvisitedInvestmentFollowUps = (followUps: CoAppingFollowUpSuggestion[]) =>
      followUps.filter((followUp) => !consumedInvestmentFollowUpIds.has(followUp.id));

    const buildInvestmentBuyQuantityFollowUps = (): CoAppingFollowUpSuggestion[] =>
      [1, 5, 10].map((quantity) =>
        buildCzChatFollowUp(
          `cz-investment-buy-quantity-${selectedInvestmentSecurity?.id ?? "product"}-${quantity}`,
          `${quantity} PCS`,
          `Buy ${quantity} PCS of ${selectedInvestmentSecurity?.title ?? "this investment product"}.`,
        ),
      );

    const compactInvestmentBuyAccount = (account: CurrentAccount) =>
      `${account.name} ending ${account.accountNumber.slice(-4)}`;

    const buildInvestmentBuyAccountFollowUps = (quantity: number): CoAppingFollowUpSuggestion[] =>
      currentAccounts.map((account) =>
        buildCzChatFollowUp(
          `cz-investment-buy-account-${selectedInvestmentSecurity?.id ?? "product"}-${account.id}-${quantity}`,
          `${account.name} · ${formatCzChatMoney(account.balance, account.currency, country)}`,
          `Use ${compactInvestmentBuyAccount(account)} for ${quantity} PCS of ${selectedInvestmentSecurity?.title ?? "this investment product"}.`,
        ),
      );

    const latestAgentMessage = [...messages].reverse().find((message) => message.role === "agent") ?? null;
    const isQuantityAnswer = Boolean(
      selectedInvestmentSecurity &&
      latestAgentMessage?.text.includes("### Choose quantity") &&
      latestAgentMessage.text.includes(selectedInvestmentSecurity.title) &&
      /^[+-]?\d+(?:[.,]\d+)?$/.test(normalized),
    );
    const buyQuantityMatch = normalized.match(/\bbuy\s+([^\s]+)\s+pcs\s+of\s+/i);
    const buyQuantityCandidate = buyQuantityMatch?.[1] ?? (isQuantityAnswer ? normalized : null);
    const buyQuantity = buyQuantityCandidate && /^\d+$/.test(buyQuantityCandidate)
      ? Number(buyQuantityCandidate)
      : null;
    const accountQuantityMatch = normalized.match(/\bfor\s+(\d+)\s+pcs\s+of\s+/i);
    const accountQuantity = accountQuantityMatch ? Number(accountQuantityMatch[1]) : null;
    const selectedBuyAccount = currentAccounts.find((account) =>
      normalized.includes(normalize(compactInvestmentBuyAccount(account))),
    ) ?? null;
    const selectedExecutionTiming = normalized.startsWith("set timing to today for ")
      ? "today"
      : normalized.startsWith("set timing to next business day for ")
        ? "next-business-day"
        : null;

    if (
      selectedInvestmentSecurity &&
      normalized === normalize(`Start a buy order for ${selectedInvestmentSecurity.title}.`)
    ) {
      return {
        text:
          `### Choose quantity\n` +
          `How many whole units of **${selectedInvestmentSecurity.title}** would you like to buy?\n` +
          `Choose a quick option below or type another positive whole number in the message field. The market price remains indicative until Review Data.`,
        followUps: buildInvestmentBuyQuantityFollowUps(),
      };
    }

    if (selectedInvestmentSecurity && buyQuantityCandidate !== null) {
      if (!buyQuantity || !Number.isSafeInteger(buyQuantity) || buyQuantity <= 0) {
        return {
          text:
            `### Choose quantity\n` +
            `Enter a **positive whole number** of units for ${selectedInvestmentSecurity.title}. Fractions, zero, and negative quantities are not supported in this one-off demo order.`,
          followUps: buildInvestmentBuyQuantityFollowUps(),
        };
      }

      if (currentAccounts.length === 0) {
        return {
          text:
            `### No cash account available\n` +
            `I cannot prepare Review Data because this profile has no current account that can fund the order. No order has been created.`,
        };
      }

      return {
        text:
          `### Choose cash account\n` +
          `You selected **${buyQuantity} PCS** of **${selectedInvestmentSecurity.title}**. Which current account should fund the one-off order? Available balances below use the same account data as Investments.`,
        followUps: buildInvestmentBuyAccountFollowUps(buyQuantity),
      };
    }

    if (
      selectedInvestmentSecurity &&
      selectedBuyAccount &&
      accountQuantity &&
      accountQuantity > 0 &&
      selectedExecutionTiming
    ) {
      const quote = buildInvestmentBuyOrderQuote(
        selectedInvestmentSecurity,
        selectedBuyAccount,
        accountQuantity,
      );
      const balanceValidation = getInvestmentBuyOrderValidation(quote, selectedBuyAccount);

      if (balanceValidation) {
        return {
          text:
            `### Insufficient balance\n` +
            `**${selectedBuyAccount.name}** cannot fund ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}. ${balanceValidation}\n` +
            `Choose another cash account below or enter a smaller quantity.`,
          followUps: [
            ...buildInvestmentBuyAccountFollowUps(accountQuantity),
            buildCzChatFollowUp(
              `cz-investment-buy-change-quantity-${selectedInvestmentSecurity.id}`,
              "Change quantity",
              `Start a buy order for ${selectedInvestmentSecurity.title}.`,
            ),
          ],
        };
      }

      const executionLabel = selectedExecutionTiming === "today" ? "Today" : "Next business day";
      return {
        text:
          `### Ready to review\n` +
          `**Product:** ${selectedInvestmentSecurity.title}\n` +
          `**Quantity:** ${accountQuantity} PCS\n` +
          `**Cash account:** ${compactInvestmentBuyAccount(selectedBuyAccount)}\n` +
          `**Execution:** ${executionLabel}\n` +
          `**Estimated debit:** ${formatCzChatMoney(quote.debitAmount, quote.accountCurrency, country)}\n` +
          `Nothing has been placed. Check the summary, then continue to Review Data.`,
        followUps: [
          {
            id: `cz-investment-buy-review-${selectedInvestmentSecurity.id}-${selectedExecutionTiming}`,
            label: "Review order",
            action: {
              id: `cz-investment-buy-review-${selectedInvestmentSecurity.id}-${selectedExecutionTiming}`,
              label: "Review order",
              type: "navigate",
              target: "investment-buy",
              securityId: selectedInvestmentSecurity.id,
              investmentBuyDraft: {
                quantity: accountQuantity,
                accountId: selectedBuyAccount.id,
                frequency: "one-off",
                executionTiming: selectedExecutionTiming,
              },
            },
          },
          buildCzChatFollowUp(
            `cz-investment-buy-change-timing-${selectedInvestmentSecurity.id}`,
            "Change timing",
            `Use ${compactInvestmentBuyAccount(selectedBuyAccount)} for ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}.`,
          ),
          buildCzChatFollowUp(
            `cz-investment-buy-change-account-${selectedInvestmentSecurity.id}`,
            "Change account",
            `Buy ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}.`,
          ),
          buildCzChatFollowUp(
            `cz-investment-buy-change-quantity-${selectedInvestmentSecurity.id}`,
            "Change quantity",
            `Start a buy order for ${selectedInvestmentSecurity.title}.`,
          ),
        ],
      };
    }

    if (selectedInvestmentSecurity && selectedBuyAccount && accountQuantity && accountQuantity > 0) {
      const quote = buildInvestmentBuyOrderQuote(
        selectedInvestmentSecurity,
        selectedBuyAccount,
        accountQuantity,
      );
      const balanceValidation = getInvestmentBuyOrderValidation(quote, selectedBuyAccount);

      if (balanceValidation) {
        return {
          text:
            `### Insufficient balance\n` +
            `**${selectedBuyAccount.name}** cannot fund ${accountQuantity} PCS of ${selectedInvestmentSecurity.title}. ${balanceValidation}\n` +
            `Choose another cash account below or enter a smaller quantity.`,
          followUps: [
            ...buildInvestmentBuyAccountFollowUps(accountQuantity),
            buildCzChatFollowUp(
              `cz-investment-buy-change-quantity-${selectedInvestmentSecurity.id}`,
              "Change quantity",
              `Start a buy order for ${selectedInvestmentSecurity.title}.`,
            ),
          ],
        };
      }

      const buildExecutionAction = (
        executionTiming: "today" | "next-business-day",
        label: string,
      ): CoAppingFollowUpSuggestion =>
        buildCzChatFollowUp(
          `cz-investment-buy-execution-${selectedInvestmentSecurity.id}-${executionTiming}`,
          label,
          `Set timing to ${label} for ${accountQuantity} PCS of ${selectedInvestmentSecurity.title} using ${compactInvestmentBuyAccount(selectedBuyAccount)}.`,
        );

      return {
        text:
          `### Choose execution timing\n` +
          `The draft is **${accountQuantity} PCS** of **${selectedInvestmentSecurity.title}**, funded from **${selectedBuyAccount.name}**. The estimated debit is **${formatCzChatMoney(quote.debitAmount, quote.accountCurrency, country)}**.\n` +
          `Choose when to send this one-off order. You will confirm the full summary in chat before Review Data.`,
        followUps: [
          buildExecutionAction("today", "Today"),
          buildExecutionAction("next-business-day", "Next business day"),
        ],
      };
    }

    const creditLimitReviewFollowUp = buildCzNavigateFollowUp(
      "cz-limit-review",
      "Review offer",
      "credit-limit-review",
    );
    const creditLimitNotNowFollowUp = buildCzChatFollowUp(
      "cz-limit-not-now",
      "Not now",
      "Finish this credit limit conversation without changing anything.",
    );

    if (hasAny(normalized, ["finish this credit limit conversation without changing anything", "leave this credit limit offer unchanged"])) {
      return {
        text:
          `### Offer left unchanged\n` +
          `Nothing changed on your card. You can review a future eligible offer from the card page.`,
      };
    }

    if (hasAny(normalized, ["check repayment impact for this credit limit offer", "repayment impact for this credit limit offer", "repayment impact", "impact if i accept"])) {
      return {
        text:
          `### Repayment impact\n` +
          `A higher limit does not create a charge by itself. It only adds spending room, so keep any extra use within an amount you can comfortably repay.\n` +
          `${primaryCard ? `This offer moves **${primaryCard.name}** from **${creditLimit}** to **${proposedCreditLimit}**.` : "The exact amounts are confirmed in the secure card flow."}\n` +
          `Review the final terms before signing; nothing changes from this conversation.`,
        followUps: [creditLimitReviewFollowUp, creditLimitNotNowFollowUp],
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
          `### Your limit offer\n` +
          `${primaryCard ? `Increase **${primaryCard.name}** from **${creditLimit}** to **${proposedCreditLimit}** for extra flexibility when you need it.` : "Review the eligible limit prepared for your card."}\n` +
          `You can check the repayment impact here or open the secure review. Nothing changes until you accept the terms and sign.`,
        richBlocks: [creditLimitOfferBlock],
        followUps: [
          buildCzChatFollowUp("cz-limit-impact", "Check repayment impact", "Check repayment impact for this credit limit offer."),
          creditLimitReviewFollowUp,
          creditLimitNotNowFollowUp,
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

    if (
      selectedInvestmentSecurity &&
      (normalized.startsWith(`explain ${selectedInvestmentNameNormalized} and the position`) ||
        hasAny(normalized, ["explain this product", "explain this fund", "product overview for"]))
    ) {
      return {
        text:
          `### A quick look at ${selectedInvestmentSecurity.title}\n` +
          `It gives you **${selectedInvestmentSecurity.assetClass.toLowerCase()} exposure** through one **${selectedInvestmentSecurity.instrumentCurrency} ${selectedInvestmentSecurity.productType.toLowerCase()}**.\n` +
          `**Why it may fit:** one simple way to access this investment strategy. **Keep in mind:** value can fall, capital is not guaranteed, and **${selectedInvestmentLiquidity.toLowerCase()}** means access follows the product rules.${
            selectedInvestmentSecurity.owned && selectedInvestmentSecurity.localCurrency !== selectedInvestmentSecurity.instrumentCurrency
              ? ` Because you view it in **${selectedInvestmentSecurity.localCurrency}**, currency moves can also change your result.`
              : ""
          }\n` +
          `${selectedInvestmentSecurity.owned ? "Choose what matters to you next." : "You do not hold it yet, so no personal performance is shown."} Information only, not a personal recommendation.`,
        richBlocks: showSelectedInvestmentCardOnce(
          selectedInvestmentExplanationBlock
            ? { ...selectedInvestmentExplanationBlock, chart: selectedInvestmentChart ?? undefined }
            : null,
        ),
        followUps: keepUnvisitedInvestmentFollowUps([
          buildCzChatFollowUp(
            "cz-investment-product-performance",
            "How is it doing for me?",
            `How is ${selectedInvestmentSecurity.title} doing for me?`,
          ),
          buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
          buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity, "Show me the essentials"),
        ]),
      };
    }

    if (
      selectedInvestmentSecurity &&
      hasAny(normalized, ["i have what i need for", "i'm done with", "im done with"])
    ) {
      return {
        text:
          `### All set\n` +
          `You covered the product, its performance, key risks, and essential facts. Nothing was ordered or changed.`,
      };
    }

    if (
      selectedInvestmentSecurity &&
      hasAny(normalized, [
        "how is my position",
        "doing for me",
        "review my performance",
        "position performing",
        "product performing",
        "holding performing",
        "performance of this",
      ])
    ) {
      const performanceDirection =
        selectedInvestmentSecurity.performancePercent > 0
          ? "positive"
          : selectedInvestmentSecurity.performancePercent < 0
            ? "negative"
            : "flat";
      const positionInterpretation = selectedInvestmentSecurity.owned
        ? `The latest snapshot is **${performanceDirection}**${selectedInvestmentPortfolioShare ? `, and this position represents about **${selectedInvestmentPortfolioShare}** of your current investment portfolio` : ""}.`
        : "You do not currently hold this product, so this is a product snapshot rather than personal performance.";
      const currencyInterpretation =
        selectedInvestmentSecurity.localCurrency !== selectedInvestmentSecurity.instrumentCurrency
          ? `The product is in **${selectedInvestmentSecurity.instrumentCurrency}** while your portfolio is viewed in **${selectedInvestmentSecurity.localCurrency}**, so currency movement can change the local result.`
          : `The product and portfolio view use **${selectedInvestmentSecurity.instrumentCurrency}**, so there is no separate display-currency effect in this snapshot.`;

      return {
        text:
          `### ${selectedInvestmentSecurity.owned ? "Your position at a glance" : "Product snapshot"}\n` +
          `${positionInterpretation}\n` +
          `${currencyInterpretation}\n` +
          `Want to explore further? Any order still requires review and signing. Information only, not personal advice.`,
        richBlocksPosition: "before-text",
        richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
        followUps: keepUnvisitedInvestmentFollowUps([
          buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
          buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
          buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
          buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
        ]),
      };
    }

    if (
      selectedInvestmentSecurity &&
      hasAny(normalized, [
        "what could affect my return",
        "affect my return from",
        "review risk",
        "explain the risk",
        "risk and liquidity",
        "liquidity and currency",
        "currency exposure of",
      ])
    ) {
      const currencyRisk =
        selectedInvestmentSecurity.localCurrency !== selectedInvestmentSecurity.instrumentCurrency
          ? `**${selectedInvestmentSecurity.instrumentCurrency}/${selectedInvestmentSecurity.localCurrency}** moves can increase or reduce the value you see.`
          : `There is no extra display-currency effect in this snapshot.`;

      return {
        text:
          `### What can move your return\n` +
          `**Markets:** the investments inside the product can rise or fall.\n` +
          `**Currency:** ${currencyRisk}\n` +
          `**Access:** **${selectedInvestmentLiquidity}** means withdrawals follow the product timing.\n` +
          `**Costs:** fees reduce what you keep.\n` +
          `**${selectedInvestmentRisk}** still means losses are possible. Information only, not a personal recommendation.`,
        richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
        followUps: keepUnvisitedInvestmentFollowUps([
          buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
          buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity),
          buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
          buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
        ]),
      };
    }

    if (
      selectedInvestmentSecurity &&
      hasAny(normalized, [
        "show me the essential information",
        "show me the essentials",
        "summarize the key document",
        "documents should i review",
        "documents matter",
        "what documents",
        "key information document",
        "prospectus",
      ])
    ) {
      return {
        text:
          `### Check these 3 things\n` +
          `Before you decide, focus on:\n` +
          `1. **Potential gain or loss:** review the KID/KIID risk level and scenarios.\n` +
          `2. **Total cost:** check entry, ongoing, and exit fees.\n` +
          `3. **Access to money:** confirm the timing behind **${selectedInvestmentLiquidity.toLowerCase()}**.\n` +
          `${selectedInvestmentSecurity.owned ? "For your holding, use the trade confirmation and statement to verify booked units and value." : "You do not hold it yet, so there is no trade confirmation to check."}\n` +
          `This quick summary does not replace the source document or personal advice.`,
        richBlocks: [
          {
            type: "product-cards",
            title: "Key information at a glance",
            body: "",
            variant: "compact",
            interactive: false,
            products: [
              {
                id: "kid-kiid",
                title: `${selectedInvestmentSecurity.title} — KID/KIID`,
                subtitle: "Risk, scenarios, costs and access",
                meta: "Summary in chat · Source document",
                tone: "neutral",
                icon: "app:account-option-statement",
              },
            ],
          },
        ],
        followUps: keepUnvisitedInvestmentFollowUps([
          buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
          buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
          buildCzChatFollowUp(
            "cz-investment-product-overview",
            "Back to product overview",
            `Give me the product overview for ${selectedInvestmentSecurity.title}.`,
          ),
          buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
        ]),
      };
    }

    if (
      selectedInvestmentSecurity &&
      hasAny(normalized, [
        "what should i consider",
        "review checklist",
        "decision factors",
        "before deciding",
      ])
    ) {
      return {
        text:
          `### A quick decision check\n` +
          `Match the product to your **goal and time horizon**, then check **portfolio fit**, **risk and access**, **currency**, and **total costs**.\n` +
          `${selectedInvestmentSecurity.owned ? `Your holding is **${selectedInvestmentValue}**${selectedInvestmentPortfolioShare ? `, about **${selectedInvestmentPortfolioShare}** of your investments` : ""}.` : "You do not hold it yet, so focus on the exposure it would add."}\n` +
          `Use the KID/KIID for final product facts. Information only, not a personal recommendation.`,
        richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
        followUps: keepUnvisitedInvestmentFollowUps([
          buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
          buildInvestmentPortfolioFollowUp(selectedInvestmentSecurity),
          buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity),
          buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
        ]),
      };
    }

    if (
      selectedInvestmentSecurity &&
      hasAny(normalized, [
        "in my portfolio context",
        "review portfolio",
        "portfolio fit",
        "portfolio context for",
      ])
    ) {
      const portfolioFit = selectedInvestmentSecurity.owned
        ? `The holding is **${selectedInvestmentValue}**${selectedInvestmentPortfolioShare ? `, about **${selectedInvestmentPortfolioShare}** of the current investment value` : ""}.`
        : "This product is not currently held, so the useful question is what concentration, asset-class, and currency exposure it would add.";

      return {
        text:
          `### How it fits your portfolio\n` +
          `${portfolioFit}\n` +
          `${topInvestmentSecurity ? `Your largest holding is **${topInvestmentSecurity.title}** at **${topInvestmentShare}**.` : "A wider concentration comparison is not available."}\n` +
          `${currencyMix || assetClassMix ? `Main exposures: **${currencyMix || "currency unavailable"}** and **${assetClassMix || "asset class unavailable"}**.` : "Check the Currency and Asset Class tabs before adding more."}\n` +
          `Use this to spot concentration before adding more. Information only, not a personal recommendation.`,
        richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
        followUps: keepUnvisitedInvestmentFollowUps([
          buildInvestmentCommercialFollowUp(selectedInvestmentSecurity),
          buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
          buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity),
          buildInvestmentDoneFollowUp(selectedInvestmentSecurity),
        ]),
      };
    }

    if (
      selectedInvestmentSecurity &&
      (normalized.includes(selectedInvestmentNameNormalized) ||
        hasAny(normalized, [
          "this investment product",
          "this fund",
          "think about this product",
          "think of this product",
          "opinion about this product",
          "should i buy",
          "should i sell",
          "should i keep",
        ]))
    ) {
      const ownershipSummary = selectedInvestmentSecurity.owned
        ? `The visible holding is **${selectedInvestmentValue}** across **${selectedInvestmentQuantity} PCS**.`
        : "This product is not currently shown as one of your holdings, so I will discuss the product rather than inventing a position.";

      return {
        text:
          `### Your quick product view\n` +
          `${ownershipSummary}\n` +
          `It is a **${selectedInvestmentSecurity.assetClass.toLowerCase()} ${selectedInvestmentSecurity.productType.toLowerCase()}** in **${selectedInvestmentSecurity.instrumentCurrency}**, currently showing **${selectedInvestmentPerformance}** performance with **${selectedInvestmentRisk.toLowerCase()}** and **${selectedInvestmentLiquidity.toLowerCase()}**.\n` +
          `Next, check how it fits your goal, portfolio, costs, and access needs. Information only, not a personal recommendation.`,
        richBlocks: showSelectedInvestmentCardOnce(selectedInvestmentProductBlock),
        followUps: keepUnvisitedInvestmentFollowUps([
          buildCzChatFollowUp(
            "cz-investment-product-performance",
            "How is it doing for me?",
            `How is ${selectedInvestmentSecurity.title} doing for me?`,
          ),
          buildInvestmentRiskFollowUp(selectedInvestmentSecurity),
          buildInvestmentEssentialsFollowUp(selectedInvestmentSecurity, "Show me the essentials"),
        ]),
      };
    }

    if (["start an investment goal", "start an investment goal.", "start investment goal", "new investment goal"].includes(normalized)) {
      return {
        text:
          `### Investment goal setup\n` +
          `Let's build a useful brief before looking at funds.\n` +
          `We will cover purpose, timing, amount, monthly habit, and risk comfort, then continue into the existing Funds window.\n` +
          `Nothing is ordered from chat; product documents, suitability, and authorization remain inside Investments.`,
        richBlocks: [investmentGoalPortfolioBlock],
        followUps: [
          buildCzChatFollowUp("cz-goal-purpose-grow-savings", "Grow my savings", "Set investment goal purpose to grow savings."),
          buildCzChatFollowUp("cz-goal-purpose-future-purchase", "Future purchase", "Set investment goal purpose to future purchase."),
          buildCzChatFollowUp("cz-goal-purpose-long-term-reserve", "Long-term reserve", "Set investment goal purpose to long-term reserve."),
        ],
      };
    }

    if (normalized === "finish this investment goal conversation" || normalized === "finish this investment goal conversation.") {
      return {
        text:
          `### Goal plan complete\n` +
          `Your planning brief stays in this conversation. No goal or order was created.\n` +
          `You can start a new conversation whenever you want to explore funds or adjust the plan.`,
        followUps: [],
      };
    }

    if (normalized.startsWith("set investment goal ")) {
      if (investmentGoalNextStep === "horizon") {
        return {
          text:
            `### Choose your horizon\n` +
            `Your purpose is **${formatInvestmentGoalPurpose(investmentGoalDraft.purpose)}**.\n` +
            `Choose when you may need the money. A longer horizon can absorb more movement, but it does not remove risk.`,
          followUps: [
            buildCzChatFollowUp("cz-goal-horizon-3-5", "In 3-5 years", "Set investment goal horizon to 3-5 years."),
            buildCzChatFollowUp("cz-goal-horizon-5-10", "In 5-10 years", "Set investment goal horizon to 5-10 years."),
            buildCzChatFollowUp("cz-goal-horizon-undecided", "Not sure yet", "Set investment goal horizon to not sure yet."),
          ],
        };
      }

      if (investmentGoalNextStep === "starting-amount") {
        return {
          text:
            `### Choose a starting amount\n` +
            `Horizon: **${formatInvestmentGoalHorizon(investmentGoalDraft.horizon)}**.\n` +
            `This amount is used only for the illustration. No money moves from chat.`,
          followUps: [
            buildCzChatFollowUp("cz-goal-starting-5000", "5,000 CZK", "Set investment goal starting amount to 5,000 CZK."),
            buildCzChatFollowUp("cz-goal-starting-10000", "10,000 CZK", "Set investment goal starting amount to 10,000 CZK."),
            buildCzChatFollowUp("cz-goal-starting-undecided", "I'm not sure yet", "Set investment goal starting amount to not sure yet."),
          ],
        };
      }

      if (investmentGoalNextStep === "monthly-contribution") {
        return {
          text:
            `### Add a monthly contribution\n` +
            `A regular contribution can reduce dependence on one entry day.\n` +
            `Choose a comfortable illustration amount, or leave it at zero for now.`,
          followUps: [
            buildCzChatFollowUp("cz-goal-monthly-500", "500 CZK monthly", "Set investment goal monthly contribution to 500 CZK."),
            buildCzChatFollowUp("cz-goal-monthly-1000", "1,000 CZK monthly", "Set investment goal monthly contribution to 1,000 CZK."),
            buildCzChatFollowUp("cz-goal-monthly-none", "Not now", "Set investment goal monthly contribution to not now."),
          ],
        };
      }

      if (investmentGoalNextStep === "risk-comfort") {
        return {
          text:
            `### Choose your risk comfort\n` +
            `This does not determine suitability. It only changes the illustrative range and helps frame the Funds review.\n` +
            `Choose the description closest to how much movement you are comfortable seeing.`,
          followUps: [
            buildCzChatFollowUp("cz-goal-risk-calm", "Prefer less movement", "Set investment goal risk comfort to prefer less movement."),
            buildCzChatFollowUp("cz-goal-risk-balanced", "Balanced", "Set investment goal risk comfort to balanced."),
            buildCzChatFollowUp("cz-goal-risk-growth", "Accept more movement", "Set investment goal risk comfort to accept more movement."),
          ],
        };
      }

      const startingAmountLabel = investmentGoalDraft.startingAmount
        ? `${investmentGoalDraft.startingAmount.toLocaleString("en-US")} CZK`
        : "Not decided yet";
      const monthlyContributionLabel = investmentGoalDraft.monthlyContribution
        ? `${investmentGoalDraft.monthlyContribution.toLocaleString("en-US")} CZK monthly`
        : "No monthly contribution yet";

      return {
        text:
          `### Your goal plan\n` +
          `Purpose: **${formatInvestmentGoalPurpose(investmentGoalDraft.purpose)}**.\n` +
          `Horizon: **${formatInvestmentGoalHorizon(investmentGoalDraft.horizon)}**.\n` +
          `Starting amount: **${startingAmountLabel}**.\n` +
          `Monthly contribution: **${monthlyContributionLabel}**.\n` +
          `Risk comfort: **${formatInvestmentGoalRisk(investmentGoalDraft.riskComfort)}**.\n` +
          `This is an illustrative brief, not advice or an order. Continue to Funds to compare real products and documents.`,
        richBlocks: [buildInvestmentGoalProjectionBlock(investmentGoalDraft)],
        followUps: [
          buildCzNavigateFollowUp(
            "cz-goal-explore-funds",
            "Explore matching funds",
            "investment-funds",
            {
              investmentFundCollectionId: getInvestmentGoalFundCollectionId(investmentGoalDraft.riskComfort),
            },
          ),
          buildCzChatFollowUp("cz-goal-done", "I'm done", "Finish this investment goal conversation."),
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
