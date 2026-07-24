/**
 * Chat NLU layer — a diacritic-insensitive, typo-tolerant, bilingual (EN + CS)
 * intent matcher that sits in FRONT of the scripted CZ chat engine.
 *
 * It never replaces a scripted branch: it only engages when the scripted engine
 * would otherwise fall through to the generic fallback, mapping free text to the
 * canonical scripted prompt that best fits (see `resolveIntent`). This widens
 * how much real-world phrasing routes correctly while leaving the proven,
 * offline, deterministic happy-path untouched.
 */
export {
  stripDiacritics,
  normalizeText,
  tokenize,
  contentTokens,
  ngrams,
  CHAT_STOPWORDS,
} from "./normalize";
export { boundedLevenshtein, fuzzyBudget, tokensFuzzyEqual, tokensContainKeyword } from "./fuzzy";
export { parseMoneyAmount, parseQuantity } from "./entities";
export { CHAT_INTENTS, CANONICAL_PROMPTS, type ChatIntent } from "./intentCatalog";
export {
  resolveIntent,
  rankIntents,
  type IntentMatch,
  type IntentResolution,
  type IntentResolutionStatus,
  type ResolveIntentContext,
} from "./resolveIntent";
