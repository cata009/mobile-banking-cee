import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
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

    const homeContext = buildCzChatScreenContext("homepage", "home-entry");
    expect(homeContext?.title).toBe("Teodora, what should we look at first?");
    expect(homeContext?.suggestedTopics?.map(({ id }) => id)).toEqual([
      "home-saving-capacity",
      "home-overview",
      "home-product-shelf",
      "home-latest-transactions",
      "home-unusual-spending",
    ]);
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
      expect.objectContaining({
        id: "credit-limit-review",
        title: "New credit limit for you",
        body: "Increase your card limit from 10\u00a0000,00 CZK to 15\u00a0000,00 CZK for more flexibility when you need it.",
        action: expect.objectContaining({ id: "start-credit-limit-review", type: "send-message" }),
        relatedItem: expect.objectContaining({
          title: "Credit Card",
          description: "5173 **** **** 4321",
          action: expect.objectContaining({ target: "card-detail" }),
        }),
      }),
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
  });

  it("makes App a thin consumer and adds no package-to-app reverse dependency", () => {
    expect(appSource).toContain('from "@/app/chat/czChatOrchestration"');
    expect(appSource).not.toMatch(/function buildCzChatSmartReplyResolver/);
    expect(appSource).not.toMatch(/function buildCzChatScreenContext/);
    expect(appSource).not.toMatch(/function buildCzChatHelpContext/);

    const packageDirectory = resolve(workspaceRoot, "package/mobile-pi-coapping-chat-package/src");
    const reverseImports = collectSourceFiles(packageDirectory).flatMap((filePath) => {
      const relativePath = filePath.slice(packageDirectory.length + 1).replace(/\\/g, "/");
      return readFileSync(filePath, "utf8")
        .split(/\r?\n/)
        .filter((line) => line.includes('from "@/app/'))
        .map((line) => `${relativePath}:${line.trim()}`);
    });

    expect(reverseImports).toEqual([
      'CoAppingChatAssistant.tsx:import FigmaCard from "@/app/components/cards/Card";',
      'CoAppingChatAssistant.tsx:import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";',
      'CoAppingChatAssistant.tsx:import LinkButton from "@/app/components/ui/LinkButton";',
    ]);
  });
});
