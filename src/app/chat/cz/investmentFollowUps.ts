/**
 * Investment product-detail follow-up chips for the CZ chatbot.
 *
 * These are pure builders — each depends only on the security passed in — so
 * they live outside the big reply resolver in czChatOrchestration.ts. The
 * consumed/unvisited filtering and buy-flow follow-ups that read conversation
 * state stay in the resolver where that state lives.
 */

import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import type { CoAppingFollowUpSuggestion } from "../../../../package/mobile-pi-coapping-chat-package/src";
import { buildCzChatFollowUp } from "./helpers";

export const buildInvestmentCommercialFollowUp = (
  security: InvestmentCatalogSecurity,
): CoAppingFollowUpSuggestion => {
  const label = security.owned && security.quantity > 0 ? "Explore adding more" : "Explore investing";
  return {
    id: `cz-investment-product-buy-${security.id}`,
    label,
    action: {
      id: `cz-investment-product-buy-${security.id}`,
      label,
      type: "send-message",
      prompt: `Start a buy order for ${security.title}.`,
    },
  };
};

export const buildInvestmentRiskFollowUp = (security: InvestmentCatalogSecurity) =>
  buildCzChatFollowUp(
    "cz-investment-product-risk",
    "What could affect my return?",
    `What could affect my return from ${security.title}?`,
  );

export const buildInvestmentEssentialsFollowUp = (
  security: InvestmentCatalogSecurity,
  label = "Summarize the key document",
) =>
  buildCzChatFollowUp(
    "cz-investment-product-documents",
    label,
    `Show me the essential information I should check for ${security.title}.`,
  );

export const buildInvestmentPortfolioFollowUp = (security: InvestmentCatalogSecurity) =>
  buildCzChatFollowUp(
    "cz-investment-product-portfolio",
    "See portfolio fit",
    `Review ${security.title} in my portfolio context.`,
  );

export const buildInvestmentDoneFollowUp = (security: InvestmentCatalogSecurity) =>
  buildCzChatFollowUp(
    "cz-investment-product-done",
    "I'm done",
    `I have what I need for ${security.title}.`,
  );
