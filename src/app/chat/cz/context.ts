/**
 * Help-panel and screen context for the CZ chat assistant: which help area a
 * screen maps to, and the contextual copy shown there.
 *
 * Extracted verbatim from czChatOrchestration.ts.
 */
import type { Screen } from "@/app/contexts/NavigationContext";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import { buildCzChatTitle, buildCzChatTopic, type CzChatHelpArea } from "./helpers";
import type { Product } from "@/data/products";
import type { CoAppingChatContext } from "../../../../package/mobile-pi-coapping-chat-package/src";

export function buildCzChatHelpContext(area: CzChatHelpArea, id: string): CoAppingChatContext {
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

export function getCzChatHelpAreaForAccountProduct(product: Product | null): CzChatHelpArea {
  if (product?.type === "saving_account" || product?.type === "term_deposit") return "savings";
  if (product?.type === "loan") return "loan";
  if (product?.type === "mortgage") return "mortgage";
  return "account";
}

export function getCzChatHelpAreaForScreen(screen: Screen, accountProduct: Product | null = null): CzChatHelpArea | null {
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

export function buildCzChatScreenContext(
  screen: Screen,
  id: string,
  accountProduct: Product | null = null,
  selectedInvestmentSecurity: InvestmentCatalogSecurity | null = null,
): CoAppingChatContext | null {
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
      if (screen === "investments" && selectedInvestmentSecurity) {
        const productName = selectedInvestmentSecurity.title;

        return {
          id,
          title: buildCzChatTitle(`what should we check on ${productName}?`),
          suggestedTopics: [
            buildCzChatTopic(
              "investment-product-explain",
              "Explain this product",
              `Explain ${productName} and the position shown in my portfolio.`,
            ),
            buildCzChatTopic(
              "investment-product-performance",
              "Review my performance",
              `How is my position in ${productName} performing?`,
            ),
          ],
        };
      }

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
