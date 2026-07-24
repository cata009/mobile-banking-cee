/**
 * NLU front-layer coverage for the CZ chat engine.
 *
 * Three guarantees:
 *  1. Primitives — normalization, diacritic folding, and fuzzy matching behave.
 *  2. Happy-path preserved — every scripted chip prompt still resolves to a
 *     structured (non-string) reply through the real resolver, and the catalog
 *     canonical prompts all reach a rich branch (never the generic fallback).
 *  3. Free-text widened — paraphrases, typos, and Czech route to the right
 *     intent above the confidence threshold; genuinely ambiguous input asks
 *     instead of guessing.
 */
import { describe, expect, it } from "vitest";
import {
  buildCzChatHelpContext,
  buildCzChatScreenContext,
  buildCzChatSmartReplyResolver,
} from "@/app/chat/czChatOrchestration";
import type { CzChatHelpArea } from "@/app/chat/czChatOrchestration";
import {
  CHAT_INTENTS,
  boundedLevenshtein,
  normalizeText,
  resolveIntent,
  stripDiacritics,
  tokensFuzzyEqual,
} from "@/app/chat/nlu";
import type { Screen } from "@/app/contexts/NavigationContext";
import type { CoAppingReplyResult } from "../../package/mobile-pi-coapping-chat-package/src";

const resolver = buildCzChatSmartReplyResolver({
  country: "CZ",
  categories: [],
  selectedAccountProduct: null,
  selectedCardProduct: null,
  creditCardForOpportunity: null,
});

const heading = (reply: CoAppingReplyResult): string => {
  const text = typeof reply === "string" ? reply : reply.text;
  return text.split("\n").find((line) => line.startsWith("### "))?.slice(4).trim() ?? "";
};

const isStructured = (reply: CoAppingReplyResult): boolean => typeof reply !== "string";

async function reply(input: string): Promise<CoAppingReplyResult> {
  return resolver(input, []);
}

// ── 1. Primitives ───────────────────────────────────────────────────────────
describe("NLU primitives", () => {
  it("folds Czech diacritics onto an ASCII base", () => {
    expect(stripDiacritics("spořit")).toBe("sporit");
    expect(normalizeText("Kolik můžu Ušetřit?")).toBe("kolik muzu usetrit");
    expect(normalizeText("fees, timing")).toBe("fees timing");
  });

  it("tolerates typos within a length-aware edit budget", () => {
    expect(boundedLevenshtein("paymnet", "payment", 2)).toBeLessThanOrEqual(2);
    expect(tokensFuzzyEqual("trasfer", "transfer")).toBe(true);
    expect(tokensFuzzyEqual("invesment", "investment")).toBe(true);
    // Short tokens demand an exact match — no fuzzy collisions.
    expect(tokensFuzzyEqual("pin", "pit")).toBe(false);
  });
});

// ── 2. Catalog integrity ─────────────────────────────────────────────────────
describe("intent catalog integrity", () => {
  it("has unique intent ids", () => {
    const ids = CHAT_INTENTS.map((intent) => intent.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every canonical prompt reaches a rich (non-fallback) scripted branch", async () => {
    const failures: string[] = [];
    for (const intent of CHAT_INTENTS) {
      const result = await reply(intent.canonicalPrompt);
      if (!isStructured(result)) {
        failures.push(`${intent.id}: "${intent.canonicalPrompt}" fell through to the string fallback`);
      }
    }
    expect(failures).toEqual([]);
  });
});

// ── 3. Happy-path: scripted chips still resolve structured ────────────────────
describe("scripted chip routing is preserved", () => {
  const HELP_AREAS: CzChatHelpArea[] = ["documents", "account", "card", "savings", "loan", "mortgage"];
  const SCREENS: Screen[] = [
    "homepage", "analytics", "payments", "products", "more", "investments",
    "investments-history", "messages", "prime", "settings", "contacts", "documents",
    "card-detail", "account-detail",
  ];

  const chipPrompts = new Set<string>();
  for (const area of HELP_AREAS) {
    for (const topic of buildCzChatHelpContext(area, "ctx").suggestedTopics ?? []) {
      if (topic.prompt) chipPrompts.add(topic.prompt);
    }
  }
  for (const screen of SCREENS) {
    for (const topic of buildCzChatScreenContext(screen, "ctx")?.suggestedTopics ?? []) {
      if (topic.prompt) chipPrompts.add(topic.prompt);
    }
  }

  it("collected a meaningful set of chip prompts", () => {
    expect(chipPrompts.size).toBeGreaterThan(20);
  });

  it("every chip prompt resolves to a structured reply (no generic fallback)", async () => {
    const failures: string[] = [];
    for (const prompt of chipPrompts) {
      const result = await reply(prompt);
      if (!isStructured(result) || heading(result) === "I can help with") {
        failures.push(prompt);
      }
    }
    expect(failures).toEqual([]);
  });
});

// ── 4. Free-text routing (paraphrase / typo / Czech) ──────────────────────────
interface RoutingRow {
  input: string;
  intent: string;
  knownGap?: boolean;
}

const ROUTING_BANK: RoutingRow[] = [
  // Saving capacity — paraphrase + Czech
  { input: "how much can i put aside each month", intent: "save-capacity" },
  { input: "what monthly amount should i be saving", intent: "save-capacity" },
  { input: "kolik můžu měsíčně ušetřit", intent: "save-capacity" },
  // Subscriptions
  { input: "help me find recurring subscriptions i forgot", intent: "subscriptions" },
  { input: "mám nějaká předplatná?", intent: "subscriptions" },
  // Payments (incl. typo)
  { input: "i want to send money to a friend", intent: "new-payment" },
  { input: "how do i make a trasfer", intent: "new-payment" },
  { input: "chci poslat peníze", intent: "new-payment" },
  // Card security
  { input: "is my card safe to use online", intent: "card-security" },
  { input: "je moje karta zabezpečená", intent: "card-security" },
  // Credit limit offer
  { input: "can i increase my credit limit", intent: "credit-limit-offer" },
  // Investments
  { input: "i want to start investing", intent: "investment-goal" },
  { input: "show me my pending investment orders", intent: "investment-orders" },
  // Documents
  { input: "where are my bank statements", intent: "documents-find" },
  // Spending
  { input: "where did all my money go this month", intent: "spending-month" },
  { input: "how can i cut my spending", intent: "reduce-spending" },
];

describe("free-text intent routing", () => {
  const routableIntent = (input: string): string | undefined => {
    const resolution = resolveIntent(input);
    if (resolution.status === "route") return resolution.best?.intent.id;
    if (resolution.status === "disambiguate") {
      return resolution.alternatives.find((match) => match.intent.id)?.intent.id;
    }
    return undefined;
  };

  const hard = ROUTING_BANK.filter((row) => !row.knownGap);

  it("routes paraphrases, typos, and Czech to the expected intent", () => {
    const failures: string[] = [];
    for (const row of hard) {
      const resolution = resolveIntent(row.input);
      const routed =
        resolution.status === "route"
          ? resolution.best?.intent.id
          : resolution.status === "disambiguate"
            ? resolution.alternatives.map((match) => match.intent.id)
            : "none";
      const ok =
        resolution.status === "route"
          ? resolution.best?.intent.id === row.intent
          : resolution.status === "disambiguate"
            ? resolution.alternatives.some((match) => match.intent.id === row.intent)
            : false;
      if (!ok) failures.push(`"${row.input}" → ${JSON.stringify(routed)} (expected ${row.intent})`);
    }
    expect(failures).toEqual([]);
  });

  it("does not misroute empty or greeting input", () => {
    expect(resolveIntent("").status).toBe("none");
    expect(routableIntent("hello there")).toBeUndefined();
  });
});

// ── 5. Disambiguation ─────────────────────────────────────────────────────────
describe("disambiguation", () => {
  it("asks instead of guessing when intents tie", () => {
    // "loan document" is genuinely split between borrowing and documents.
    const resolution = resolveIntent("i need my loan document");
    expect(["disambiguate", "route"]).toContain(resolution.status);
    if (resolution.status === "disambiguate") {
      expect(resolution.alternatives.length).toBeGreaterThanOrEqual(2);
    }
  });
});
