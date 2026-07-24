/**
 * Intent catalog for the chat NLU layer.
 *
 * Each intent maps a *concept signature* (bilingual, composed from the shared
 * `lexicon`) to a `canonicalPrompt` — a string copied verbatim from the app's
 * existing suggested topics / follow-up chips. The NLU scorer picks the
 * best-matching intent for free text and rewrites the input to that canonical
 * prompt, which the proven scripted engine then answers exactly as if the user
 * had tapped the chip. This is why the layer widens coverage without touching
 * (or risking) any existing branch.
 *
 * Scoring model (see `resolveIntent.ts`):
 *   score = matchedConceptGroups
 *         + PHRASE_WEIGHT * matchedPhrases
 *         + (currentScreen ∈ boostScreens ? SCREEN_BOOST : 0)
 * An intent scores 0 unless every group in `requireGroups` has a member
 * present — the precision gate that stops broad concepts (e.g. "money") from
 * firing the wrong intent.
 */
import * as L from "./lexicon";

export interface ChatIntent {
  /** Stable id, used in tests and telemetry. */
  id: string;
  /** Exact scripted prompt to delegate to (must reproduce a real chip). */
  canonicalPrompt: string;
  /** Human label for disambiguation chips. */
  label: string;
  /** Concept groups; any surface form in a group matches the group once. */
  concepts: string[][];
  /** Strong multi-word signals (exact phrase match), weighted higher. */
  phrases?: string[];
  /** Precision gate: each group must have at least one member present. */
  requireGroups?: string[][];
  /** Screens where this intent is more likely; adds a score boost. */
  boostScreens?: string[];
  /** Only eligible when a specific investment security is in context. */
  requiresSelectedSecurity?: boolean;
  /** Manual tiebreak nudge for near-ties (small). */
  priority?: number;
}

export const CHAT_INTENTS: ChatIntent[] = [
  // ── Home ────────────────────────────────────────────────────────────────
  {
    id: "save-capacity",
    canonicalPrompt: "How much money can I save every month?",
    label: "How much can I save?",
    concepts: [L.SAVE, L.HOW_MUCH, L.MONEY],
    phrases: ["how much can i save", "how much should i save", "kolik muzu usetrit", "kolik bych mel sporit"],
    requireGroups: [L.SAVE],
    boostScreens: ["homepage"],
  },
  {
    id: "home-overview",
    canonicalPrompt: "Help me understand the main things I should notice on my homepage.",
    label: "Review my money snapshot",
    concepts: [L.REVIEW, L.MONEY],
    phrases: ["overview", "financial overview", "homepage overview", "snapshot", "co si mam vsimnout", "celkovy prehled"],
    requireGroups: [["overview", "snapshot", "prehled", "vsimnout", "notice", "homepage"]],
    boostScreens: ["homepage"],
    priority: -1,
  },
  {
    id: "product-shelf",
    canonicalPrompt: "What products can I open from the product shelf?",
    label: "What can I open?",
    concepts: [L.PRODUCT, L.OPEN],
    phrases: ["product shelf", "what products can i open", "jake produkty", "co si mohu zridit"],
    requireGroups: [L.PRODUCT],
    boostScreens: ["homepage", "products"],
  },
  {
    id: "latest-transactions",
    canonicalPrompt: "Show me the latest 5 transactions and which account they came from.",
    label: "Show latest transactions",
    concepts: [L.TRANSACTION, L.LATEST],
    phrases: ["latest transactions", "recent transactions", "last transactions", "posledni transakce", "posledni pohyby"],
    requireGroups: [L.TRANSACTION],
  },
  {
    id: "unusual-spending",
    canonicalPrompt: "Check the largest, pending, or category-heavy movements from my latest account activity.",
    label: "Spot unusual spending",
    concepts: [L.UNUSUAL, L.TRANSACTION, L.SPENDING],
    phrases: ["unusual spending", "largest payment", "biggest transaction", "anything unusual", "neobvykle vydaje", "nejvetsi platba"],
    requireGroups: [L.UNUSUAL],
  },
  {
    id: "available-vs-owed",
    canonicalPrompt: "Explain my available money and what I owe.",
    label: "Available money vs owed",
    concepts: [L.AVAILABLE, L.MONEY, L.BALANCE],
    phrases: ["available money", "what i owe", "owed amount", "can i spend", "kolik mam k dispozici", "co dluzim"],
    requireGroups: [[...L.AVAILABLE, ...L.BALANCE]],
    priority: -1,
  },

  // ── Spending / analytics ─────────────────────────────────────────────────
  {
    id: "spending-month",
    canonicalPrompt: "Help me understand where my money went this month.",
    label: "Where my money went",
    concepts: [L.SPENDING, L.MONEY],
    // "where did my money go" carries no explicit spend-word, so accept the
    // money concept as the gate too (spend OR money).
    phrases: ["where my money went", "where did my money go", "this month spending", "kam sly penize", "utrata za mesic"],
    requireGroups: [[...L.SPENDING, ...L.MONEY]],
    boostScreens: ["analytics"],
  },
  {
    id: "subscriptions",
    canonicalPrompt: "Help me spot recurring payments or subscriptions in my spending.",
    label: "Find subscriptions",
    concepts: [L.SUBSCRIPTION],
    phrases: ["subscriptions", "recurring payments", "predplatna", "opakovane platby"],
    requireGroups: [L.SUBSCRIPTION],
    boostScreens: ["analytics"],
  },
  {
    id: "spending-categories",
    canonicalPrompt: "Compare my spending categories and highlight what changed.",
    label: "Compare categories",
    concepts: [L.SPENDING, L.CATEGORY],
    phrases: ["spending categories", "compare categories", "kategorie utrat", "porovnat kategorie"],
    requireGroups: [L.CATEGORY],
    boostScreens: ["analytics"],
  },
  {
    id: "reduce-spending",
    canonicalPrompt: "Where could I reduce spending without hurting important payments?",
    label: "Reduce spending",
    concepts: [L.REDUCE, L.SPENDING],
    phrases: ["reduce spending", "spend less", "cut costs", "kde usetrit", "snizit vydaje"],
    requireGroups: [L.REDUCE],
    boostScreens: ["analytics"],
  },

  // ── Payments ─────────────────────────────────────────────────────────────
  {
    id: "new-payment",
    canonicalPrompt: "Guide me through the safest way to start a new payment.",
    label: "Start a payment",
    concepts: [L.PAYMENT],
    phrases: ["new payment", "send money", "make a transfer", "start a payment", "nova platba", "poslat penize", "provest prevod"],
    requireGroups: [L.PAYMENT],
    boostScreens: ["payments"],
  },
  {
    id: "payment-limits-fees",
    canonicalPrompt: "Explain payment limits, fees, timing, and signing before I continue.",
    label: "Limits & fees",
    concepts: [L.FEES, L.LIMIT, L.PAYMENT],
    phrases: ["limits and fees", "payment limits", "fees and timing", "poplatky za platbu", "limity plateb"],
    requireGroups: [[...L.FEES, ...L.LIMIT]],
    boostScreens: ["payments"],
  },
  {
    id: "payment-confirmation",
    canonicalPrompt: "I need help finding a payment confirmation in Documents.",
    label: "Find a confirmation",
    concepts: [L.CONFIRMATION, L.PAYMENT],
    phrases: ["payment confirmation", "find confirmation", "proof of payment", "potvrzeni o platbe", "doklad o platbe"],
    requireGroups: [L.CONFIRMATION],
  },
  {
    id: "recurring-vs-template",
    canonicalPrompt: "Help me decide whether a recurring payment or template makes sense.",
    label: "Recurring or template?",
    concepts: [L.RECURRING],
    phrases: ["standing order", "payment template", "recurring payment", "trvaly prikaz", "sablona platby"],
    requireGroups: [L.RECURRING],
    boostScreens: ["payments"],
  },

  // ── Products ─────────────────────────────────────────────────────────────
  {
    id: "products-compare",
    canonicalPrompt: "Help me compare account, card, loan, savings, and investment options.",
    label: "Compare products",
    concepts: [L.COMPARE, L.PRODUCT],
    phrases: ["compare products", "product options", "porovnat produkty"],
    requireGroups: [L.COMPARE],
    boostScreens: ["products"],
  },
  {
    id: "products-savings-investing",
    canonicalPrompt: "Help me understand savings and investment product choices.",
    label: "Savings & investing",
    concepts: [L.SAVE, L.INVEST],
    phrases: ["savings and investment", "savings and investing", "sporeni a investice"],
    requireGroups: [L.INVEST],
    boostScreens: ["products"],
    priority: -1,
  },
  {
    id: "products-borrowing",
    canonicalPrompt: "Help me understand loan or mortgage options before applying.",
    label: "Loan or mortgage",
    concepts: [L.LOAN],
    phrases: ["loan options", "mortgage options", "moznosti pujcky", "hypoteka"],
    requireGroups: [L.LOAN],
    boostScreens: ["products"],
  },

  // ── Cards ────────────────────────────────────────────────────────────────
  {
    id: "credit-limit-offer",
    canonicalPrompt: "I'm interested in this credit limit offer.",
    label: "Credit limit offer",
    concepts: [L.LIMIT, L.CARD],
    phrases: ["credit limit", "increase my limit", "higher limit", "raise my limit", "bump up my limit", "navyseni limitu", "zvysit limit"],
    requireGroups: [["limit", "limits", "limitu", "navyseni"]],
    priority: 1,
  },
  {
    id: "card-security",
    // Phrased to hit the dedicated card branch (matches "card security") rather
    // than the broader "security settings" service branch that shadows it.
    canonicalPrompt: "Help me review this card security and recent activity.",
    label: "Card security",
    concepts: [L.CARD, L.SECURITY],
    phrases: ["card security", "is my card secure", "card fraud", "bezpecnost karty", "zabezpeceni karty"],
    requireGroups: [L.SECURITY],
    boostScreens: ["card-detail"],
  },
  {
    id: "card-limits",
    canonicalPrompt: "Can I change my card limits temporarily for a purchase?",
    label: "Change card limits",
    concepts: [L.CARD, L.LIMIT],
    phrases: ["change my card limit", "temporary limit", "card limit for a purchase", "zmenit limit karty", "docasny limit"],
    requireGroups: [L.CARD, L.LIMIT],
    boostScreens: ["card-detail"],
  },
  {
    id: "card-transactions",
    canonicalPrompt: "Help me understand or search recent card transactions.",
    label: "Card transactions",
    concepts: [L.CARD, L.TRANSACTION],
    phrases: ["card transactions", "card activity", "transakce kartou", "platby kartou"],
    requireGroups: [L.CARD, L.TRANSACTION],
    boostScreens: ["card-detail"],
  },

  // ── Accounts ─────────────────────────────────────────────────────────────
  {
    id: "account-balance",
    canonicalPrompt: "Help me understand available balance versus current balance on this account.",
    label: "Explain my balance",
    concepts: [L.BALANCE],
    phrases: ["available balance", "current balance", "why is my balance", "zustatek na uctu", "disponibilni zustatek"],
    requireGroups: [L.BALANCE],
    boostScreens: ["account-detail"],
  },
  {
    id: "account-details",
    canonicalPrompt: "Where can I find account number, IBAN, and other account details?",
    label: "Account details / IBAN",
    concepts: [L.ACCOUNT],
    phrases: ["account number", "iban", "account details", "cislo uctu", "detaily uctu"],
    requireGroups: [["iban", "number", "details", "cislo", "detaily"]],
    boostScreens: ["account-detail"],
  },
  {
    id: "account-filter",
    canonicalPrompt: "Guide me through filtering account activity by amount, type, or category.",
    label: "Filter account activity",
    concepts: [L.FILTER, L.TRANSACTION],
    phrases: ["filter activity", "search transactions", "filtrovat pohyby", "hledat transakce"],
    requireGroups: [L.FILTER],
    boostScreens: ["account-detail"],
    priority: -1,
  },

  // ── Savings ──────────────────────────────────────────────────────────────
  {
    id: "savings-interest",
    canonicalPrompt: "Explain the interest, term, and access rules for this savings product.",
    label: "Savings interest & terms",
    concepts: [L.SAVE, L.INTEREST_RATE],
    phrases: ["interest and term", "access rules", "savings interest", "urok ze sporeni", "podminky sporeni"],
    requireGroups: [L.INTEREST_RATE],
    boostScreens: ["account-detail"],
  },

  // ── Borrowing ────────────────────────────────────────────────────────────
  {
    id: "loan-early-repay",
    canonicalPrompt: "Explain what I should check before repaying part of this loan early.",
    label: "Repay loan early",
    concepts: [L.LOAN, L.REPAY],
    phrases: ["repay early", "early repayment", "pay off my loan", "predcasne splatit", "splatit pujcku"],
    requireGroups: [L.REPAY],
    boostScreens: ["account-detail"],
  },

  // ── Investments ──────────────────────────────────────────────────────────
  {
    id: "investment-goal",
    canonicalPrompt: "Start an investment goal.",
    label: "Start an investment goal",
    concepts: [L.INVEST, L.GOAL],
    phrases: ["investment goal", "start investing", "begin investing", "zacit investovat", "investicni cil"],
    requireGroups: [L.INVEST],
    boostScreens: ["investments"],
  },
  {
    id: "investment-portfolio",
    canonicalPrompt: "Review my investment portfolio context.",
    label: "Review portfolio",
    concepts: [L.INVEST, L.FUND],
    phrases: ["my portfolio", "portfolio context", "review portfolio", "moje portfolio", "prehled portfolia"],
    requireGroups: [[...L.FUND, ...L.INVEST]],
    boostScreens: ["investments"],
    priority: -1,
  },
  {
    id: "investment-orders",
    canonicalPrompt: "Review my investment orders.",
    label: "Review orders",
    concepts: [L.INVEST, L.ORDER],
    phrases: ["investment orders", "pending orders", "my orders", "investicni pokyny", "cekajici pokyny"],
    requireGroups: [L.ORDER],
    boostScreens: ["investments", "investments-history"],
  },
  {
    id: "investment-next-move",
    canonicalPrompt: "Help me decide the smartest next investment step using my portfolio, orders, risk, and currency exposure.",
    label: "Plan next move",
    concepts: [L.INVEST, L.NEXT, L.RISK],
    phrases: ["next investment step", "what should i do next", "rebalance", "dalsi investicni krok"],
    requireGroups: [L.INVEST, [...L.NEXT, ...L.RISK]],
    boostScreens: ["investments"],
  },

  // ── Documents & messages ─────────────────────────────────────────────────
  {
    id: "documents-find",
    canonicalPrompt: "Help me search account statements and older bank documents.",
    label: "Find documents",
    concepts: [L.DOCUMENT],
    phrases: ["find documents", "bank statements", "search documents", "najit dokumenty", "vypis z uctu"],
    requireGroups: [L.DOCUMENT],
  },
  {
    id: "documents-legal",
    canonicalPrompt: "Which document types are legal notices and what can I do with them?",
    label: "Legal documents",
    concepts: [L.LEGAL, L.DOCUMENT],
    phrases: ["legal documents", "legal notices", "pravni dokumenty", "pravni upozorneni"],
    requireGroups: [L.LEGAL],
  },
  {
    id: "messages",
    canonicalPrompt: "Explain the difference between inbox, outbox, and bank notifications.",
    label: "Messages & notifications",
    concepts: [L.MESSAGE],
    phrases: ["my messages", "inbox", "outbox", "bank notifications", "zpravy z banky", "schranka"],
    requireGroups: [L.MESSAGE],
    boostScreens: ["messages"],
  },

  // ── Service ──────────────────────────────────────────────────────────────
  {
    id: "contact-support",
    canonicalPrompt: "Help me find the right support or branch contact.",
    label: "Contact support",
    concepts: [L.CONTACT],
    phrases: ["contact support", "find a branch", "talk to the bank", "kontaktovat podporu", "najit pobocku"],
    requireGroups: [L.CONTACT],
    boostScreens: ["contacts", "more"],
  },
  {
    id: "settings-security",
    canonicalPrompt: "Help me find and understand the security settings I should review.",
    label: "Security settings",
    concepts: [L.SETTINGS, L.SECURITY],
    phrases: ["security settings", "app settings", "nastaveni zabezpeceni", "bezpecnostni nastaveni"],
    requireGroups: [L.SETTINGS],
    boostScreens: ["settings", "more"],
  },
];

/** Fast lookup of the normalized canonical prompts, for the pass-through guard. */
export const CANONICAL_PROMPTS: readonly string[] = CHAT_INTENTS.map((intent) => intent.canonicalPrompt);
