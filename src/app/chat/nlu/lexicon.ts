/**
 * Bilingual concept lexicon for the chat NLU layer.
 *
 * Each exported array is a *concept group*: a set of surface forms (English +
 * Czech, already lowercased and diacritic-stripped so they compare directly
 * against `normalizeText` output) that all mean the same banking thing. The
 * intent catalog composes these groups instead of repeating synonyms, so a new
 * phrasing is added once here and every intent that references the group picks
 * it up.
 *
 * Guidelines:
 * - Keep entries diacritic-free (they are compared against normalized tokens).
 * - Single-word entries are fuzzy-matched (typo tolerant); multi-word entries
 *   are matched as exact phrases.
 * - Prefer distinctive stems over generic words to keep precision high.
 */

// ── Money & value ─────────────────────────────────────────────────────────
export const MONEY = ["money", "cash", "funds", "penize", "penez", "hotovost", "prostredky", "korun", "czk"];
export const HOW_MUCH = ["much", "amount", "kolik"];
export const AVAILABLE = ["available", "spend", "spare", "disponibilni", "volne"];
export const BALANCE = ["balance", "zustatek", "stav"];

// ── Saving ────────────────────────────────────────────────────────────────
export const SAVE = ["save", "saving", "savings", "aside", "stash", "spor", "sporit", "sporeni", "usetrit", "uspory", "odkladat", "naspořit", "naspor"];
export const TERM_DEPOSIT = ["deposit", "term", "vklad", "termovany", "terminovany"];

// ── Investing ─────────────────────────────────────────────────────────────
export const INVEST = ["invest", "investment", "investments", "investing", "investice", "investovat"];
export const FUND = ["fund", "funds", "portfolio", "fond", "fondy"];
export const ORDER = ["order", "orders", "pokyn", "pokyny", "prikaz"];
export const RISK = ["risk", "volatility", "riziko", "rizikovost"];
export const PERFORMANCE = ["performance", "return", "returns", "gain", "loss", "vynos", "vykonnost", "zisk", "ztrata"];
export const GOAL = ["goal", "plan", "target", "cil", "zamer"];

// ── Cards ─────────────────────────────────────────────────────────────────
export const CARD = ["card", "cards", "karta", "karty", "kartu", "kreditka", "kreditni", "debetni"];
export const LIMIT = ["limit", "limits", "limitu", "navyseni"];
export const PIN = ["pin"];
export const SECURITY = ["secure", "security", "safe", "safety", "fraud", "block", "freeze", "bezpecnost", "bezpeci", "bezpecne", "zabezpeceni", "podvod", "blokovat", "zablokovat", "zmrazit"];

// ── Payments ──────────────────────────────────────────────────────────────
export const PAYMENT = ["payment", "payments", "pay", "transfer", "send", "platba", "platby", "platit", "prevod", "poslat", "uhrada", "zaplatit"];
export const FEES = ["fee", "fees", "charge", "charges", "poplatek", "poplatky"];
export const RECURRING = ["recurring", "standing", "template", "regular", "subscription", "opakovany", "trvaly", "sablona", "predplatne"];
export const CONFIRMATION = ["confirmation", "receipt", "proof", "potvrzeni", "doklad"];

// ── Spending / analytics ──────────────────────────────────────────────────
export const SPENDING = ["spending", "spend", "spent", "expenses", "expense", "budget", "utrata", "vydaje", "utracet"];
export const CATEGORY = ["category", "categories", "kategorie"];
export const SUBSCRIPTION = ["subscription", "subscriptions", "recurring", "predplatne", "predplatna", "opakovane"];
export const UNUSUAL = ["unusual", "largest", "biggest", "strange", "neobvykle", "nejvetsi", "podezrele"];
export const REDUCE = ["reduce", "cut", "lower", "less", "snizit", "omezit", "usetrit"];

// ── Accounts & transactions ───────────────────────────────────────────────
export const ACCOUNT = ["account", "accounts", "iban", "ucet", "ucty", "uctu"];
export const TRANSACTION = ["transaction", "transactions", "activity", "movement", "movements", "transakce", "pohyb", "pohyby", "operace"];
export const LATEST = ["latest", "recent", "last", "posledni", "nedavne"];
export const FILTER = ["filter", "search", "find", "sort", "filtrovat", "hledat", "najit", "vyhledat"];

// ── Documents & messages ──────────────────────────────────────────────────
export const DOCUMENT = ["document", "documents", "statement", "statements", "dokument", "dokumenty", "vypis", "vypisy"];
export const LEGAL = ["legal", "notice", "contract", "terms", "pravni", "smlouva", "podminky"];
export const MESSAGE = ["message", "messages", "inbox", "outbox", "notification", "zprava", "zpravy", "oznameni"];
export const SHARE = ["share", "download", "export", "sdilet", "stahnout", "exportovat"];

// ── Borrowing ─────────────────────────────────────────────────────────────
export const LOAN = ["loan", "loans", "mortgage", "credit", "borrow", "pujcka", "pujcku", "uver", "hypoteka", "hypoteku"];
export const REPAY = ["repay", "repayment", "installment", "instalment", "splatka", "splatky", "splatit", "predcasne"];
export const INTEREST_RATE = ["rate", "interest", "fixation", "urok", "sazba", "fixace"];

// ── Products & offers ─────────────────────────────────────────────────────
export const PRODUCT = ["product", "products", "produkt", "produkty", "nabidka", "nabidky", "catalogue", "catalog"];
export const OFFER = ["offer", "offers", "cashback", "deal", "deals", "sleva", "slevy"];
export const COMPARE = ["compare", "comparison", "versus", "vs", "porovnat", "srovnat"];
export const OPEN = ["open", "apply", "get", "start", "otevrit", "zridit", "zalozit"];

// ── Service / support ─────────────────────────────────────────────────────
export const CONTACT = ["contact", "support", "branch", "advisor", "banker", "kontakt", "podpora", "pobocka", "poradce"];
export const SETTINGS = ["settings", "preferences", "nastaveni", "predvolby"];
export const CONSENT = ["consent", "consents", "third", "party", "souhlas", "souhlasy"];

// ── Wh-words / intent framing ─────────────────────────────────────────────
export const EXPLAIN = ["explain", "understand", "meaning", "why", "vysvetli", "vysvetlit", "rozumet", "proc"];
export const REVIEW = ["review", "check", "look", "see", "show", "zkontrolovat", "prohlednout", "ukaz", "zobrazit"];
export const NEXT = ["next", "suggest", "recommend", "should", "best", "dalsi", "doporucit", "nejlepsi"];
