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
import type { CreditCard, Product } from "@/data/products";

const workspaceRoot = process.cwd();
const appSource = readFileSync(resolve(workspaceRoot, "src/app/App.tsx"), "utf8");

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
      "CoAppingChatAssistant.tsx:@/app/components/pfm/PfmCategoryIcon",
      "CoAppingChatAssistant.tsx:@/app/components/ui/LinkButton",
    ]);
  });
});
