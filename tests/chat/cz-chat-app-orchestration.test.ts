import { readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildCreditCardOpportunities,
  buildCzChatHelpContext,
  buildCzChatScreenContext,
  buildCzChatSmartReplyResolver,
  getCzChatHelpAreaForAccountProduct,
  getCzSavingsProductDetailSelection,
  getProductsShelfFocusCardId,
} from "@/app/chat/czChatOrchestration";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import type { CreditCard, Product, ProductCategory } from "@/data/products";

const workspaceRoot = process.cwd();
const appSource = readFileSync(resolve(workspaceRoot, "src/app/App.tsx"), "utf8");

const selectedInvestmentSecurity: InvestmentCatalogSecurity = {
  id: "balanced-income",
  title: "UniCredit Balanced Income Fund",
  sourceProductName: "Investment Portfolio",
  status: "active",
  contributionType: "RECURRENT",
  value: 185,
  currency: "EUR",
  instrumentCurrency: "EUR",
  localValue: 5525,
  localCurrency: "CZK",
  securityAccountId: "sec-eur",
  securityAccountName: "EUR Securities Account",
  securityAccountCurrency: "EUR",
  productType: "Fund",
  assetClass: "Balanced",
  riskLevel: "Medium",
  liquidity: "Monthly",
  marketPrice: 29.84,
  quantity: 7.625,
  performanceAmount: 99.45,
  performancePercent: 1.8,
  owned: true,
  productId: "CZBALANCED1",
  inceptionDate: "19.07.2020",
  lastUpdate: "19.07.2026",
  description: "A balanced fund denominated in EUR.",
};

const investmentBuyAccounts: Product[] = [
  {
    id: "acc-1",
    type: "current_account",
    name: "Primary Account",
    accountNumber: "1234567890123456",
    balance: 2850.5,
    currency: "CZK",
  },
  {
    id: "acc-2",
    type: "current_account",
    name: "Primary Account 2",
    accountNumber: "2345678901234567",
    balance: 2052.36,
    currency: "CZK",
  },
];

const investmentBuyCategories: ProductCategory[] = [
  { key: "accounts", title: "Accounts", products: investmentBuyAccounts },
];

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    return entry.isDirectory() ? collectSourceFiles(entryPath) : [entryPath];
  });
}

function collectAppDependencies(source: string, importerPath: string): string[] {
  const staticImports = source.matchAll(
    /(?:import|export)\s+(?:type\s+)?(?:[^"'`;]*?\s+from\s+)?["']([^"']+)["']/gs,
  );
  const dynamicImports = source.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g);
  const appDirectory = resolve(workspaceRoot, "src/app");

  return [...staticImports, ...dynamicImports]
    .sort((left, right) => (left.index ?? 0) - (right.index ?? 0))
    .map((match) => match[1])
    .filter((specifier): specifier is string => Boolean(specifier))
    .filter((specifier) => {
      if (specifier.startsWith("@/app/")) return true;
      if (!specifier.startsWith(".")) return false;
      const target = resolve(dirname(importerPath), specifier);
      const pathFromApp = relative(appDirectory, target);
      return pathFromApp === "" || (!pathFromApp.startsWith("..") && !resolve(pathFromApp).startsWith(".."));
    });
}

describe("CZ chat app orchestration", () => {
  it("preserves help and screen entry contexts with their exact topic mapping", () => {
    expect(buildCzChatHelpContext("card", "card-help")).toEqual({
      id: "card-help",
      title: "Teodora, what should we check on this card?",
      suggestedTopics: [
        { id: "card-security", label: "Check card security", prompt: "Help me review this card's security settings and recent activity." },
        { id: "card-limits", label: "Change card limits", prompt: "Can I change my card limits temporarily for a purchase?" },
        { id: "card-pin", label: "Find card PIN options", prompt: "Where can I view or manage the PIN for this card?" },
        { id: "card-transactions", label: "Review card transactions", prompt: "Help me understand or search recent card transactions." },
      ],
    });

    expect(buildCzChatScreenContext("homepage", "home-entry")).toEqual({
      id: "home-entry",
      title: "Teodora, what should we look at first?",
      suggestedTopics: [
        { id: "home-saving-capacity", label: "How much can I save?", prompt: "How much money can I save every month?" },
        { id: "home-overview", label: "Review today's money snapshot", prompt: "Help me understand the main things I should notice on my homepage." },
        { id: "home-product-shelf", label: "What products can I open", prompt: "What products can I open from the product shelf?" },
        { id: "home-latest-transactions", label: "Review latest 5 transactions", prompt: "Show me the latest 5 transactions and which account they came from." },
        { id: "home-unusual-spending", label: "Spot unusual spending", prompt: "Check the largest, pending, or category-heavy movements from my latest account activity." },
      ],
    });
  });

  it("preserves credit opportunity copy, metrics, and navigation action", () => {
    const card: CreditCard = {
      id: "card-credit-1",
      type: "credit_card",
      name: "Credit Card",
      accountNumber: "5173500087654321",
      balance: 3200,
      currency: "CZK",
      cardType: "Standard",
      cardNumber: "5173500087654321",
      expiryDate: "12/29",
      creditLimit: 10000,
      availableCredit: 3200,
    };

    expect(buildCreditCardOpportunities(card, "CZ", "card-detail")).toEqual([
      {
        id: "credit-limit-review",
        priority: "primary",
        tone: "credit",
        eyebrow: "Credit card",
        title: "New credit limit for you",
        body: "Increase your card limit from 10\u00a0000,00 CZK to 15\u00a0000,00 CZK for more flexibility when you need it.",
        reason: "Credit card limit increase candidate.",
        relatedItem: {
          title: "Credit Card",
          description: "5173 **** **** 4321",
          visualKind: "credit-card",
          action: { id: "open-credit-card-detail", label: "Open card detail", type: "navigate", target: "card-detail" },
        },
        metrics: [
          { label: "Current limit", value: "10\u00a0000,00 CZK", helper: "Your current card limit" },
          { label: "New limit", value: "15\u00a0000,00 CZK", helper: "Available after successful review" },
        ],
        action: {
          id: "start-credit-limit-review",
          label: "I'm interested",
          type: "send-message",
          prompt: "I'm interested in this credit limit offer.",
        },
      },
    ]);
  });

  it("preserves product target parsing and account help classification", () => {
    expect(getProductsShelfFocusCardId("open-products-shelf-card-investments-savings")).toBe("investments-savings");
    expect(getProductsShelfFocusCardId("cz-open-products-shelf")).toBeNull();
    expect(getProductsShelfFocusCardId("unrelated-action")).toBeUndefined();
    expect(getCzSavingsProductDetailSelection("open-product-detail-saving-account", "CZ"))
      .toEqual(expect.objectContaining({ cardId: "investments-savings", optionId: "saving-account", title: "Saving account" }));

    expect(getCzChatHelpAreaForAccountProduct({ type: "saving_account" } as Product)).toBe("savings");
    expect(getCzChatHelpAreaForAccountProduct({ type: "mortgage" } as Product)).toBe("mortgage");
    expect(getCzChatHelpAreaForAccountProduct(null)).toBe("account");
  });

  it("preserves investment-goal reply resolution and follow-up order", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
    });

    const result = await resolveReply("Start an investment goal.", []);
    expect(result).toEqual(expect.objectContaining({
      text: expect.stringContaining("### Investment goal setup"),
      followUps: [
        expect.objectContaining({ id: "cz-goal-grow-savings", label: "Grow my savings" }),
        expect.objectContaining({ id: "cz-goal-future-purchase", label: "Future purchase" }),
        expect.objectContaining({ id: "cz-goal-long-term", label: "Long-term reserve" }),
      ],
    }));

    const overlappingPrompt = await resolveReply("I'm not sure yet", []);
    expect(overlappingPrompt).toEqual(expect.objectContaining({
      text: expect.stringContaining("### Starting amount noted"),
      followUps: [
        expect.objectContaining({ id: "cz-goal-monthly-500", label: "500 CZK monthly" }),
        expect.objectContaining({ id: "cz-goal-monthly-1000", label: "1,000 CZK monthly" }),
        expect.objectContaining({ id: "cz-goal-monthly-not-now", label: "Not now" }),
      ],
    }));
  });

  it("offers only the two distinct product-specific entry topics", () => {
    expect(buildCzChatScreenContext("investments", "investment-detail", null, selectedInvestmentSecurity)).toEqual({
      id: "investment-detail",
      title: "Teodora, what should we check on UniCredit Balanced Income Fund?",
      suggestedTopics: [
        {
          id: "investment-product-explain",
          label: "Explain this product",
          prompt: "Explain UniCredit Balanced Income Fund and the position shown in my portfolio.",
        },
        {
          id: "investment-product-performance",
          label: "Review my performance",
          prompt: "How is my position in UniCredit Balanced Income Fund performing?",
        },
      ],
    });
  });

  it("resolves the two product entry topics to different product-grounded answers", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const explanation = await resolveReply(
      "Explain UniCredit Balanced Income Fund and the position shown in my portfolio.",
      [],
    );
    const performance = await resolveReply(
      "How is my position in UniCredit Balanced Income Fund performing?",
      [],
    );

    if (typeof explanation === "string" || typeof performance === "string") {
      throw new Error("Expected structured investment-product replies");
    }
    expect(explanation.text).toContain("### A quick look at UniCredit Balanced Income Fund");
    expect(explanation.text).toContain("balanced exposure");
    expect(explanation.text).toContain("EUR fund");
    expect(explanation.text).toContain("monthly liquidity");
    expect(explanation.text).toContain("value can fall");
    expect(explanation.text).toContain("Choose what matters to you next");
    expect(explanation.text).not.toContain("The visible holding is");
    expect(explanation.text).not.toMatch(/5.?525,00 CZK/);
    expect(explanation.text).not.toContain("+1.80%");
    expect(explanation.text).not.toContain("29,84 EUR");
    expect(explanation.richBlocks).toEqual([
      expect.objectContaining({
        type: "investment-summary",
        logoId: "unicredit",
        title: "UniCredit Balanced Income Fund",
        chart: {
          currency: "EUR",
          defaultPeriod: "3y",
          series: {
            "1m": expect.arrayContaining([expect.objectContaining({ value: expect.any(Number) })]),
            "3m": expect.arrayContaining([expect.objectContaining({ value: expect.any(Number) })]),
            "1y": expect.arrayContaining([expect.objectContaining({ value: expect.any(Number) })]),
            "3y": expect.arrayContaining([expect.objectContaining({ value: expect.any(Number) })]),
            max: expect.arrayContaining([expect.objectContaining({ value: expect.any(Number) })]),
          },
        },
        metrics: [
          expect.objectContaining({ label: "Structure", value: "Balanced fund" }),
          expect.objectContaining({ label: "Currency", value: "EUR" }),
          expect.objectContaining({ label: "Dealing", value: "Monthly" }),
        ],
      }),
    ]);
    expect(performance.text).toContain("### Your position at a glance");
    expect(explanation.text).not.toBe(performance.text);
  });

  it("grounds product opinions in the selected holding without giving a buy or sell recommendation", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const result = await resolveReply("What do you think about this product?", []);
    if (typeof result === "string") throw new Error("Expected a structured investment-product reply");
    expect(result).toEqual(expect.objectContaining({
      text: expect.stringContaining("### Your quick product view"),
      followUps: [
        expect.objectContaining({ id: "cz-investment-product-performance", label: "How is it doing for me?" }),
        expect.objectContaining({ id: "cz-investment-product-risk", label: "What could affect my return?" }),
        expect.objectContaining({ id: "cz-investment-product-documents", label: "Show me the essentials" }),
      ],
    }));
    expect(result.text).toMatch(/5.?525,00 CZK/);
    expect(result.text).toContain("+1.80%");
    expect(result.text).not.toContain("29,84 EUR");
    expect(result.text).toContain("medium risk");
    expect(result.text).toContain("monthly liquidity");
    expect(result.text).toContain("not a personal recommendation");
  });

  it("keeps the selected investment summary informational without an Open Investments action", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const result = await resolveReply("How is my position in UniCredit Balanced Income Fund performing?", []);
    if (typeof result === "string") throw new Error("Expected a structured investment-product reply");
    const selectedHoldingBlock = result.richBlocks?.find((block) => block.type === "investment-summary");

    expect(selectedHoldingBlock).toEqual(expect.objectContaining({
      type: "investment-summary",
      logoId: "unicredit",
      metricLayout: "stack",
    }));
    expect(selectedHoldingBlock).not.toHaveProperty("eyebrow");
    expect(selectedHoldingBlock).not.toHaveProperty("action");
  });

  it("keeps performance figures in the card and offers Explore adding more for the exact held security", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: investmentBuyCategories,
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const result = await resolveReply("How is my position in UniCredit Balanced Income Fund performing?", []);
    if (typeof result === "string") throw new Error("Expected a structured investment-product reply");

    expect(result.richBlocksPosition).toBe("before-text");
    expect(result.richBlocks?.[0]).toEqual(expect.objectContaining({
      type: "investment-summary",
      title: "UniCredit Balanced Income Fund",
      metrics: expect.arrayContaining([
        expect.objectContaining({ label: "Holding value", value: expect.stringMatching(/5.?525,00 CZK/) }),
        expect.objectContaining({ label: "Performance", value: "+1.80%" }),
        expect.objectContaining({ label: "Market price", value: "29,84 EUR" }),
      ]),
    }));
    expect(result.text).not.toMatch(/5.?525,00 CZK/);
    expect(result.text).not.toContain("7,625 PCS");
    expect(result.text).not.toContain("+1.80%");
    expect(result.text).not.toContain("29,84 EUR");
    expect(result.text).not.toContain("19.07.2026");
    expect(result.followUps).toContainEqual(expect.objectContaining({
      label: "Explore adding more",
      action: expect.objectContaining({
        type: "send-message",
        prompt: "Start a buy order for UniCredit Balanced Income Fund.",
      }),
    }));
  });

  it("collects quantity, cash account, and execution timing before the pre-review confirmation", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: investmentBuyCategories,
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const start = await resolveReply("Start a buy order for UniCredit Balanced Income Fund.", []);
    if (typeof start === "string") throw new Error("Expected a structured quantity reply");
    expect(start.text).toContain("### Choose quantity");
    expect(start.followUps?.map((item) => item.label)).toEqual(["1 PCS", "5 PCS", "10 PCS"]);
    expect(start.followUps).not.toContainEqual(expect.objectContaining({
      action: expect.objectContaining({ type: "navigate" }),
    }));

    const typedQuantity = await resolveReply("7", [
      { id: "agent-quantity", role: "agent", text: start.text, time: "17:20" },
    ]);
    if (typeof typedQuantity === "string") throw new Error("Expected a structured typed-quantity reply");
    expect(typedQuantity.text).toContain("### Choose cash account");
    expect(typedQuantity.text).toContain("7 PCS");

    const account = await resolveReply("Buy 1 PCS of UniCredit Balanced Income Fund.", []);
    if (typeof account === "string") throw new Error("Expected a structured account reply");
    expect(account.text).toContain("### Choose cash account");
    expect(account.text).toContain("1 PCS");
    expect(account.followUps?.map((item) => item.label)).toEqual([
      expect.stringContaining("Primary Account"),
      expect.stringContaining("Primary Account 2"),
    ]);
    expect(account.followUps).not.toContainEqual(expect.objectContaining({
      action: expect.objectContaining({ type: "navigate" }),
    }));

    const execution = await resolveReply(
      "Use Primary Account ending 3456 for 1 PCS of UniCredit Balanced Income Fund.",
      [],
    );
    if (typeof execution === "string") throw new Error("Expected a structured execution reply");
    expect(execution.text).toContain("### Choose execution timing");
    expect(execution.followUps?.map((item) => item.label)).toEqual(["Today", "Next business day"]);
    expect(execution.followUps).toContainEqual(expect.objectContaining({
      label: "Today",
      action: expect.objectContaining({
        type: "send-message",
        prompt: expect.stringContaining("Set timing to Today"),
      }),
    }));
    expect(execution.followUps?.filter((item) => item.action?.type === "navigate")).toHaveLength(0);
  });

  it("adds a pre-review confirmation for each execution timing", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: investmentBuyCategories,
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });
    const execution = await resolveReply(
      "Use Primary Account ending 3456 for 1 PCS of UniCredit Balanced Income Fund.",
      [],
    );
    if (typeof execution === "string") throw new Error("Expected a structured execution reply");

    const expectedTimingByLabel = new Map([
      ["Today", "today"],
      ["Next business day", "next-business-day"],
    ] as const);

    for (const timingFollowUp of execution.followUps ?? []) {
      expect(timingFollowUp.action).toEqual(expect.objectContaining({
        type: "send-message",
        prompt: expect.any(String),
      }));
      const confirmation = await resolveReply(timingFollowUp.action?.prompt ?? "", []);
      if (typeof confirmation === "string") throw new Error("Expected a structured pre-review reply");

      expect(confirmation.text).toContain("### Ready to review");
      expect(confirmation.text).toContain("UniCredit Balanced Income Fund");
      expect(confirmation.text).toContain("1 PCS");
      expect(confirmation.text).toContain("Primary Account");
      expect(confirmation.text).toContain(timingFollowUp.label);
      expect(confirmation.text).toContain("Estimated debit");
      expect(confirmation.followUps?.map((item) => item.label)).toEqual([
        "Review order",
        "Change timing",
        "Change account",
        "Change quantity",
      ]);

      const reviewOrder = confirmation.followUps?.find((item) => item.label === "Review order");
      expect(reviewOrder?.action).toEqual(expect.objectContaining({
        type: "navigate",
        target: "investment-buy",
        securityId: "balanced-income",
        investmentBuyDraft: {
          quantity: 1,
          accountId: "acc-1",
          frequency: "one-off",
          executionTiming: expectedTimingByLabel.get(timingFollowUp.label as "Today" | "Next business day"),
        },
      }));
      expect(confirmation.followUps?.filter((item) => item.action?.type === "navigate")).toHaveLength(1);
    }
  });

  it("keeps invalid quantity and insufficient balance inside the BUY conversation", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: investmentBuyCategories,
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const invalidQuantity = await resolveReply("Buy 0 PCS of UniCredit Balanced Income Fund.", []);
    if (typeof invalidQuantity === "string") throw new Error("Expected a structured validation reply");
    expect(invalidQuantity.text).toContain("positive whole number");
    expect(invalidQuantity.followUps).not.toContainEqual(expect.objectContaining({
      action: expect.objectContaining({ type: "navigate" }),
    }));

    const insufficient = await resolveReply(
      "Use Primary Account ending 3456 for 100000 PCS of UniCredit Balanced Income Fund.",
      [],
    );
    if (typeof insufficient === "string") throw new Error("Expected a structured balance reply");
    expect(insufficient.text).toContain("Insufficient balance");
    expect(insufficient.followUps).not.toContainEqual(expect.objectContaining({
      action: expect.objectContaining({ type: "navigate" }),
    }));
  });

  it("shows the selected investment card only on the first product answer in a conversation", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const explanation = await resolveReply(
      "Explain UniCredit Balanced Income Fund and the position shown in my portfolio.",
      [],
    );
    if (typeof explanation === "string") throw new Error("Expected a structured investment-product reply");
    expect(explanation.richBlocks).toHaveLength(1);

    const risk = await resolveReply(
      "Explain the risk, liquidity, and currency exposure of UniCredit Balanced Income Fund.",
      [
        { id: "user-1", role: "user", text: "Explain this product", time: "15:30" },
        {
          id: "agent-1",
          role: "agent",
          text: explanation.text,
          time: "15:30",
          richBlocks: explanation.richBlocks,
          followUps: explanation.followUps,
        },
        { id: "user-2", role: "user", text: "Review risk", time: "15:31" },
      ],
    );
    if (typeof risk === "string") throw new Error("Expected a structured investment-product reply");

    expect(risk.text).toContain("### What can move your return");
    expect(risk.richBlocks).toBeUndefined();
    expect(risk.followUps).toHaveLength(4);
  });

  it("resolves every primary product follow-up to its own product-specific answer", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const explanation = await resolveReply("Explain UniCredit Balanced Income Fund and the position shown in my portfolio.", []);
    if (typeof explanation === "string") throw new Error("Expected a structured investment-product reply");

    const expectedHeadingByLabel = new Map([
      ["How is it doing for me?", "### Your position at a glance"],
      ["What could affect my return?", "### What can move your return"],
      ["Show me the essentials", "### Check these 3 things"],
    ]);

    expect(explanation.followUps?.map((followUp) => followUp.label)).toEqual([...expectedHeadingByLabel.keys()]);
    for (const followUp of explanation.followUps ?? []) {
      const prompt = followUp.action?.prompt ?? followUp.prompt;
      const reply = await resolveReply(prompt ?? "", []);
      if (typeof reply === "string") throw new Error(`Expected a structured reply for ${followUp.label}`);
      expect(reply.text).toContain(expectedHeadingByLabel.get(followUp.label));
    }
  });

  it("keeps every selected-product follow-up in chat and resolves it to a distinct scenario", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const performance = await resolveReply("How is my position in UniCredit Balanced Income Fund performing?", []);
    if (typeof performance === "string") throw new Error("Expected a structured investment-product reply");

    const expectedHeadingByLabel = new Map([
      ["Explore adding more", "### Choose quantity"],
      ["See portfolio fit", "### How it fits your portfolio"],
      ["What could affect my return?", "### What can move your return"],
      ["I'm done", "### All set"],
    ]);

    const conversationalFollowUps = performance.followUps?.filter((followUp) => followUp.action?.type === "send-message") ?? [];
    expect(conversationalFollowUps.map((followUp) => followUp.label)).toEqual([...expectedHeadingByLabel.keys()]);
    for (const followUp of conversationalFollowUps) {
      expect(followUp.action).toEqual(expect.objectContaining({ type: "send-message" }));
      const prompt = followUp.action?.prompt ?? followUp.prompt;
      expect(prompt).toBeTruthy();
      const reply = await resolveReply(prompt ?? "", []);
      if (typeof reply === "string") throw new Error(`Expected a structured reply for ${followUp.label}`);
      expect(reply.text).toContain(expectedHeadingByLabel.get(followUp.label));
      expect(reply.text).not.toContain("### I can help with");
    }
  });

  it("provides a dedicated selected-product documents scenario", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const result = await resolveReply("What documents should I review for UniCredit Balanced Income Fund?", []);
    if (typeof result === "string") throw new Error("Expected a structured investment-product reply");

    expect(result.text).toContain("### Check these 3 things");
    expect(result.text).toContain("Potential gain or loss");
    expect(result.text).toContain("Total cost");
    expect(result.text).toContain("Access to money");
    expect(result.richBlocks?.[0]).toEqual(expect.objectContaining({
      title: "Key information at a glance",
      interactive: false,
    }));
  });

  it("returns to the product overview and closes the guided story without another loop", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const overview = await resolveReply("Give me the product overview for UniCredit Balanced Income Fund.", []);
    if (typeof overview === "string") throw new Error("Expected a structured investment-product reply");
    expect(overview.text).toContain("### A quick look at UniCredit Balanced Income Fund");

    const closeout = await resolveReply("I have what I need for UniCredit Balanced Income Fund.", []);
    if (typeof closeout === "string") throw new Error("Expected a structured investment-product reply");
    expect(closeout.text).toContain("### All set");
    expect(closeout.text).toContain("Nothing was ordered or changed");
    expect(closeout.followUps).toBeUndefined();
  });

  it("consumes guided-story branches after selection and resets them for a new conversation", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });

    const explanation = await resolveReply(
      "Explain UniCredit Balanced Income Fund and the position shown in my portfolio.",
      [{ id: "user-explain", role: "user", text: "Explain this product", time: "15:30" }],
    );
    if (typeof explanation === "string") throw new Error("Expected a structured investment-product reply");

    const essentialsPrompt = "Show me the essential information I should check for UniCredit Balanced Income Fund.";
    const essentialsMessages = [
      { id: "user-explain", role: "user" as const, text: "Explain this product", time: "15:30" },
      { id: "agent-explain", role: "agent" as const, text: explanation.text, time: "15:30" },
      { id: "user-essentials", role: "user" as const, text: essentialsPrompt, time: "15:31" },
    ];
    const essentials = await resolveReply(essentialsPrompt, essentialsMessages);
    if (typeof essentials === "string") throw new Error("Expected a structured essentials reply");

    const overviewPrompt = "Give me the product overview for UniCredit Balanced Income Fund.";
    const consumedMessages = [
      ...essentialsMessages,
      { id: "agent-essentials", role: "agent" as const, text: essentials.text, time: "15:31" },
      { id: "user-overview", role: "user" as const, text: overviewPrompt, time: "15:32" },
    ];
    const returnedOverview = await resolveReply(overviewPrompt, consumedMessages);
    if (typeof returnedOverview === "string") throw new Error("Expected a structured overview reply");

    expect(returnedOverview.followUps?.map((followUp) => followUp.label)).toEqual([
      "How is it doing for me?",
      "What could affect my return?",
    ]);

    const riskPrompt = "What could affect my return from UniCredit Balanced Income Fund?";
    const risk = await resolveReply(riskPrompt, [
      ...consumedMessages,
      { id: "agent-overview", role: "agent", text: returnedOverview.text, time: "15:32" },
      { id: "user-risk", role: "user", text: riskPrompt, time: "15:33" },
    ]);
    if (typeof risk === "string") throw new Error("Expected a structured risk reply");
    expect(risk.followUps?.map((followUp) => followUp.label)).not.toContain("Summarize the key document");

    const freshConversation = await resolveReply(
      "Explain UniCredit Balanced Income Fund and the position shown in my portfolio.",
      [{ id: "fresh-user-explain", role: "user", text: "Explain this product", time: "16:00" }],
    );
    if (typeof freshConversation === "string") throw new Error("Expected a structured fresh-conversation reply");
    expect(freshConversation.followUps?.map((followUp) => followUp.label)).toEqual([
      "How is it doing for me?",
      "What could affect my return?",
      "Show me the essentials",
    ]);
  });

  it("keeps the guided investment story concise and client-oriented", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity,
    });
    const prompts = [
      "Explain UniCredit Balanced Income Fund and the position shown in my portfolio.",
      "How is UniCredit Balanced Income Fund doing for me?",
      "What could affect my return from UniCredit Balanced Income Fund?",
      "Show me the essential information I should check for UniCredit Balanced Income Fund.",
    ];
    const replies = await Promise.all(prompts.map((prompt) => resolveReply(prompt, [])));
    if (replies.some((reply) => typeof reply === "string")) {
      throw new Error("Expected structured guided-story replies");
    }
    const [explanation, performance, risk, essentials] = replies as [
      Exclude<(typeof replies)[number], string>,
      Exclude<(typeof replies)[number], string>,
      Exclude<(typeof replies)[number], string>,
      Exclude<(typeof replies)[number], string>,
    ];

    expect(explanation.text).toContain("### A quick look at UniCredit Balanced Income Fund");
    expect(explanation.text).toContain("Why it may fit");
    expect(explanation.text.length).toBeLessThanOrEqual(650);
    expect(performance.text).toContain("### Your position at a glance");
    expect(performance.text.length).toBeLessThanOrEqual(550);
    expect(risk.text).toContain("### What can move your return");
    expect(risk.text.length).toBeLessThanOrEqual(550);
    expect(essentials.text).toContain("### Check these 3 things");
    expect(essentials.text.length).toBeLessThanOrEqual(700);
  });

  it("recovers a named investment follow-up from the canonical portfolio when the screen snapshot is gone", async () => {
    const investmentProduct: Product = {
      id: "inv-1",
      type: "investment_account",
      name: "Investment Portfolio",
      accountNumber: "7890123456789012",
      balance: 42500,
      currency: "CZK",
      portfolioValue: 42500,
      totalGainLoss: 728.45,
      totalGainLossPercentage: 1.74,
    };
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [{ key: "investments", title: "Investments", products: [investmentProduct] }],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity: null,
    });

    const result = await resolveReply("Review UniCredit Balanced Income Fund in my portfolio context.", []);
    if (typeof result === "string") throw new Error("Expected a structured investment-product reply");

    expect(result.text).toContain("### How it fits your portfolio");
    expect(result.text).not.toContain("### Account help");
    expect(result.richBlocks?.[0]).not.toHaveProperty("action");
  });

  it("describes a catalogue product without inventing a customer holding", async () => {
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity: { ...selectedInvestmentSecurity, owned: false, quantity: 0, localValue: 0 },
    });

    const result = await resolveReply("Explain this product.", []);
    if (typeof result === "string") throw new Error("Expected a structured investment-product reply");
    expect(result.text).toContain("do not hold it yet");
    expect(result.text).not.toContain("Your position is");
  });

  it("offers Explore investing instead of Explore adding more for a catalogue-only security", async () => {
    const catalogueSecurity = { ...selectedInvestmentSecurity, owned: false, quantity: 0, localValue: 0 };
    const resolveReply = buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
      selectedInvestmentSecurity: catalogueSecurity,
    });

    const result = await resolveReply("How is this product performing?", []);
    if (typeof result === "string") throw new Error("Expected a structured investment-product reply");

    expect(result.followUps).toContainEqual(expect.objectContaining({
      label: "Explore investing",
      action: expect.objectContaining({
        type: "send-message",
        prompt: "Start a buy order for UniCredit Balanced Income Fund.",
      }),
    }));
    expect(result.followUps).not.toContainEqual(expect.objectContaining({ label: "Explore adding more" }));
  });

  it("makes App a thin consumer and adds no package-to-app reverse dependency", () => {
    expect(appSource).toContain('from "@/app/chat/czChatOrchestration"');
    expect(appSource).not.toMatch(/function buildCzChatSmartReplyResolver/);
    expect(appSource).not.toMatch(/function buildCzChatScreenContext/);
    expect(appSource).not.toMatch(/function buildCzChatHelpContext/);

    const packageDirectory = resolve(workspaceRoot, "package/mobile-pi-coapping-chat-package/src");
    expect(collectAppDependencies(
      `import value from '@/app/value';\nexport { other }\n  from "@/app/other";\nconst lazy = import('@/app/lazy');\nimport local from '../../../../src/app/local';`,
      resolve(packageDirectory, "nested/example.ts"),
    )).toEqual(["@/app/value", "@/app/other", "@/app/lazy", "../../../../src/app/local"]);

    const reverseImports = collectSourceFiles(packageDirectory).flatMap((filePath) => {
      const relativePath = filePath.slice(packageDirectory.length + 1).replace(/\\/g, "/");
      return collectAppDependencies(readFileSync(filePath, "utf8"), filePath)
        .map((specifier) => `${relativePath}:${specifier}`);
    });

    expect(reverseImports).toEqual([
      "CoAppingChatAssistant.tsx:@/app/components/cards/Card",
      "CoAppingChatAssistant.tsx:@/app/components/brand-logo/BrandLogo",
      "CoAppingChatAssistant.tsx:@/app/components/pfm/PfmCategoryIcon",
      "CoAppingChatAssistant.tsx:@/app/components/icons",
      "CoAppingChatAssistant.tsx:@/app/components/ui/LinkButton",
    ]);
  });
});
