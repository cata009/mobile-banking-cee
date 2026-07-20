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
    expect(explanation.text).toContain("### What UniCredit Balanced Income Fund is");
    expect(explanation.text).toContain("pools investors' money");
    expect(explanation.text).toContain("equities");
    expect(explanation.text).toContain("bonds");
    expect(explanation.text).toContain("can rise or fall");
    expect(explanation.text).toContain("monthly dealing rules");
    expect(explanation.text).toContain("exact asset mix");
    expect(explanation.text).toContain("Review my performance");
    expect(explanation.text).not.toContain("The visible holding is");
    expect(explanation.text).not.toMatch(/5.?525,00 CZK/);
    expect(explanation.text).not.toContain("+1.80%");
    expect(explanation.text).not.toContain("29,84 EUR");
    expect(explanation.richBlocks).toEqual([
      expect.objectContaining({
        type: "investment-summary",
        logoId: "unicredit",
        title: "UniCredit Balanced Income Fund",
        metrics: [
          expect.objectContaining({ label: "Structure", value: "Balanced fund" }),
          expect.objectContaining({ label: "Currency", value: "EUR" }),
          expect.objectContaining({ label: "Dealing", value: "Monthly" }),
        ],
      }),
    ]);
    expect(performance.text).toContain("### UniCredit Balanced Income Fund performance");
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
      text: expect.stringContaining("### UniCredit Balanced Income Fund"),
      followUps: [
        expect.objectContaining({ id: "cz-investment-product-performance", label: "Review performance" }),
        expect.objectContaining({ id: "cz-investment-product-risk", label: "Review risk" }),
        expect.objectContaining({ id: "cz-investment-product-documents", label: "What documents matter?" }),
      ],
    }));
    expect(result.text).toMatch(/5.?525,00 CZK/);
    expect(result.text).toContain("+1.80%");
    expect(result.text).toContain("29,84 EUR");
    expect(result.text).toContain("Medium risk");
    expect(result.text).toContain("Monthly liquidity");
    expect(result.text).toContain("not a personalized buy, sell, or hold recommendation");
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

  it("keeps performance figures in the card and offers Buy more for the exact held security", async () => {
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
      label: "Buy more",
      action: expect.objectContaining({
        type: "send-message",
        prompt: "Start a buy order for UniCredit Balanced Income Fund.",
      }),
    }));
  });

  it("collects quantity, cash account, and execution timing before creating the exact BUY review handoff", async () => {
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
        type: "navigate",
        target: "investment-buy",
        securityId: "balanced-income",
        investmentBuyDraft: {
          quantity: 1,
          accountId: "acc-1",
          frequency: "one-off",
          executionTiming: "today",
        },
      }),
    }));
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

    expect(risk.text).toContain("### UniCredit Balanced Income Fund risk context");
    expect(risk.richBlocks).toBeUndefined();
    expect(risk.followUps).toHaveLength(3);
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
      ["Review performance", "### UniCredit Balanced Income Fund performance"],
      ["Review risk", "### UniCredit Balanced Income Fund risk context"],
      ["What documents matter?", "### Documents for UniCredit Balanced Income Fund"],
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
      ["Buy more", "### Choose quantity"],
      ["Review risk", "### UniCredit Balanced Income Fund risk context"],
      ["What should I consider?", "### UniCredit Balanced Income Fund review checklist"],
      ["Review portfolio", "### UniCredit Balanced Income Fund in your portfolio"],
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

    expect(result.text).toContain("### Documents for UniCredit Balanced Income Fund");
    expect(result.text).toContain("Key Information Document");
    expect(result.text).toContain("prospectus");
    expect(result.text).toContain("fee");
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

    expect(result.text).toContain("### UniCredit Balanced Income Fund in your portfolio");
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
    expect(result.text).toContain("not currently shown as one of your holdings");
    expect(result.text).not.toContain("Your position is");
  });

  it("offers Buy instead of Buy more for a catalogue-only security", async () => {
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
      label: "Buy",
      action: expect.objectContaining({
        type: "send-message",
        prompt: "Start a buy order for UniCredit Balanced Income Fund.",
      }),
    }));
    expect(result.followUps).not.toContainEqual(expect.objectContaining({ label: "Buy more" }));
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
      "CoAppingChatAssistant.tsx:@/app/components/ui/LinkButton",
    ]);
  });
});
