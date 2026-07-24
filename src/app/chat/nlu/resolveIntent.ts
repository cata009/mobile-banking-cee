/**
 * Intent scorer + disambiguation for the chat NLU layer.
 *
 * Given free-text input, score every catalog intent and decide one of three
 * outcomes:
 *   - "route"        → confident single winner; caller rewrites input to
 *                      `best.intent.canonicalPrompt`.
 *   - "disambiguate" → several intents are plausibly close; caller offers the
 *                      top few as "Did you mean…" chips instead of guessing.
 *   - "none"         → not enough signal; caller keeps the existing fallback.
 *
 * The scorer is pure and deterministic, so its behavior is fully unit-testable
 * and stable for the offline demo.
 */
import { normalizeText, tokenize } from "./normalize";
import { tokensContainKeyword } from "./fuzzy";
import { CHAT_INTENTS, type ChatIntent } from "./intentCatalog";

const PHRASE_WEIGHT = 2.5;
const SCREEN_BOOST = 1;
const PRIORITY_WEIGHT = 0.5;

/**
 * Minimum best-score to consider offering the intent at all. One matched
 * concept clears this — precision is enforced by each intent's `requireGroups`
 * gate (the core concept must be present), so a single clear, gated hit is
 * trustworthy; ambiguity is caught by the margin check below.
 */
const DISAMBIG_THRESHOLD = 1;
/** Best-score at/above which we are willing to auto-route. */
const ROUTE_THRESHOLD = 1;
/** How far the winner must lead the runner-up to auto-route without asking. */
const ROUTE_MARGIN = 1;
/** Runner-ups within this gap of the winner are shown as alternatives. */
const DISAMBIG_BAND = 1.25;
const MAX_ALTERNATIVES = 3;

export interface IntentMatch {
  intent: ChatIntent;
  score: number;
  matchedConcepts: number;
  matchedPhrases: number;
}

export type IntentResolutionStatus = "route" | "disambiguate" | "none";

export interface IntentResolution {
  status: IntentResolutionStatus;
  best: IntentMatch | null;
  alternatives: IntentMatch[];
}

export interface ResolveIntentContext {
  currentScreen?: string | null;
  /** When true, intents flagged `requiresSelectedSecurity` are eligible. */
  hasSelectedSecurity?: boolean;
}

function groupPresent(group: string[], tokens: string[]): boolean {
  return group.some((surface) => tokensContainKeyword(tokens, surface));
}

function scoreIntent(
  intent: ChatIntent,
  tokens: string[],
  context: ResolveIntentContext,
): IntentMatch | null {
  if (intent.requiresSelectedSecurity && !context.hasSelectedSecurity) return null;

  // Precision gate — every required group must have a member present.
  if (intent.requireGroups && !intent.requireGroups.every((group) => groupPresent(group, tokens))) {
    return null;
  }

  const matchedConcepts = intent.concepts.reduce(
    (count, group) => (groupPresent(group, tokens) ? count + 1 : count),
    0,
  );
  const matchedPhrases = (intent.phrases ?? []).reduce(
    (count, phrase) => (tokensContainKeyword(tokens, phrase) ? count + 1 : count),
    0,
  );

  if (matchedConcepts === 0 && matchedPhrases === 0) return null;

  const screenBoost =
    intent.boostScreens && context.currentScreen && intent.boostScreens.includes(context.currentScreen)
      ? SCREEN_BOOST
      : 0;

  const score =
    matchedConcepts +
    matchedPhrases * PHRASE_WEIGHT +
    screenBoost +
    (intent.priority ?? 0) * PRIORITY_WEIGHT;

  return { intent, score, matchedConcepts, matchedPhrases };
}

/** Rank all catalog intents against the input; highest score first. */
export function rankIntents(input: string, context: ResolveIntentContext = {}): IntentMatch[] {
  const tokens = tokenize(normalizeText(input));
  if (tokens.length === 0) return [];

  return CHAT_INTENTS.map((intent, index) => ({ match: scoreIntent(intent, tokens, context), index }))
    .filter((entry): entry is { match: IntentMatch; index: number } => entry.match !== null)
    // Score descending, with catalog order as an explicit, stable tie-break so
    // the outcome is fully deterministic regardless of engine sort stability.
    .sort((first, second) => second.match.score - first.match.score || first.index - second.index)
    .map((entry) => entry.match);
}

/** Decide route / disambiguate / none for the given input. */
export function resolveIntent(input: string, context: ResolveIntentContext = {}): IntentResolution {
  const matches = rankIntents(input, context);
  const best = matches[0];
  if (!best || best.score < DISAMBIG_THRESHOLD) {
    return { status: "none", best: null, alternatives: [] };
  }

  const runnerUpScore = matches[1]?.score ?? 0;
  const margin = best.score - runnerUpScore;

  // Confident, clear winner → route.
  if (best.score >= ROUTE_THRESHOLD && (matches.length === 1 || margin >= ROUTE_MARGIN)) {
    return { status: "route", best, alternatives: [] };
  }

  // Several close contenders → ask instead of guessing.
  const alternatives = matches
    .filter((match) => best.score - match.score <= DISAMBIG_BAND)
    .slice(0, MAX_ALTERNATIVES);

  if (alternatives.length >= 2) {
    return { status: "disambiguate", best, alternatives };
  }

  // Single decent match with a soft lead → route it rather than drop to fallback.
  if (best.score >= ROUTE_THRESHOLD) {
    return { status: "route", best, alternatives: [] };
  }

  return { status: "none", best: null, alternatives: [] };
}
