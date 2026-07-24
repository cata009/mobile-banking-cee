/**
 * Phase 2: free-typed amounts in the investment-goal flow.
 *
 * The flow used to understand only its exact chip prompts ("5,000 CZK"). These
 * tests lock in the new capability — a user can type "10k", "7 500 Kč", or
 * "skip" — while proving the original chip path is byte-for-byte unchanged
 * (that stays covered by cz-chat-app-orchestration.test.ts too).
 */
import { describe, expect, it } from "vitest";
import { buildCzChatSmartReplyResolver } from "@/app/chat/czChatOrchestration";
import { parseMoneyAmount, parseQuantity } from "@/app/chat/nlu";
import type { CoAppingChatMessage } from "../../package/mobile-pi-coapping-chat-package/src";

describe("money entity extraction", () => {
  it("parses the many ways people write amounts", () => {
    expect(parseMoneyAmount("10k")).toBe(10000);
    expect(parseMoneyAmount("1.5k")).toBe(1500);
    expect(parseMoneyAmount("2m")).toBe(2000000);
    expect(parseMoneyAmount("10,000")).toBe(10000);
    expect(parseMoneyAmount("10 000")).toBe(10000);
    expect(parseMoneyAmount("10.000")).toBe(10000);
    expect(parseMoneyAmount("7500 czk")).toBe(7500);
    expect(parseMoneyAmount("around 800 a month")).toBe(800);
    expect(parseMoneyAmount("7 500 Kč")).toBe(7500);
  });

  it("returns null when there is no usable number", () => {
    expect(parseMoneyAmount("not sure yet")).toBeNull();
    expect(parseMoneyAmount("later maybe")).toBeNull();
    expect(parseMoneyAmount("")).toBeNull();
  });

  it("keeps quantity parsing whole-number only (buy-order rule)", () => {
    expect(parseQuantity("5")).toBe(5);
    expect(parseQuantity("buy 12 units")).toBe(12);
    expect(parseQuantity("2.5")).toBe(2); // grabs the leading whole number, ignores the fraction
    expect(parseQuantity("none")).toBeNull();
  });
});

describe("investment goal flow accepts free-typed amounts", () => {
  const buildResolver = () =>
    buildCzChatSmartReplyResolver({
      country: "CZ",
      categories: [],
      selectedAccountProduct: null,
      selectedCardProduct: null,
      creditCardForOpportunity: null,
    });

  const drive = async () => {
    const resolver = buildResolver();
    const messages: CoAppingChatMessage[] = [];
    let sequence = 0;
    const say = async (text: string) => {
      messages.push({
        id: `goal-${(sequence += 1)}`,
        role: "user",
        text,
        time: "12:00",
        createdAt: `2026-07-24T12:00:0${sequence}.000Z`,
      });
      const reply = await resolver(text, messages);
      if (typeof reply === "string") throw new Error(`Expected structured reply, got string for "${text}"`);
      return reply;
    };
    return { say };
  };

  it("advances the flow when the starting amount is typed as '10k'", async () => {
    const { say } = await drive();
    await say("Set investment goal purpose to future purchase.");
    await say("Set investment goal horizon to 5-10 years.");

    const afterAmount = await say("10k");
    expect(afterAmount.text).toContain("### Add a monthly contribution");
  });

  it("accepts a free-typed monthly amount and reflects it in the summary", async () => {
    const { say } = await drive();
    await say("Set investment goal purpose to grow savings.");
    await say("Set investment goal horizon to 3-5 years.");
    await say("7 500 Kč");
    const afterMonthly = await say("1200");
    expect(afterMonthly.text).toContain("### Choose your risk comfort");

    const summary = await say("Set investment goal risk comfort to balanced.");
    expect(summary.text).toContain("### Your goal plan");
    expect(summary.text).toContain("7,500 CZK");
    expect(summary.text).toContain("1,200 CZK monthly");
  });

  it("treats 'skip' at the amount step as undecided", async () => {
    const { say } = await drive();
    await say("Set investment goal purpose to long-term reserve.");
    await say("Set investment goal horizon to not sure yet.");
    const afterSkip = await say("skip for now");
    expect(afterSkip.text).toContain("### Add a monthly contribution");
  });
});
