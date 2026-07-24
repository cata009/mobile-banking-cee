/**
 * Text normalization primitives for the chat NLU layer.
 *
 * The scripted chat engine (czChatOrchestration.ts) matches user input with a
 * plain `input.toLowerCase()` + substring test. That only works when the user
 * clicks a follow-up chip that sends an *exact* scripted prompt. Free text,
 * typos, and — critically for the CEE markets — diacritics (Czech "spořit",
 * "úspory", …) fall straight through to the generic fallback.
 *
 * These helpers give the NLU scorer a stable, diacritic-insensitive token
 * stream so the same intent can be reached from many phrasings and languages.
 * They are intentionally dependency-free and pure.
 */

// U+0300–U+036F = the "Combining Diacritical Marks" block that NFD splits
// accents into. Removing it turns "ř" (r + combining caron) into "r".
const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Strip combining diacritical marks so accented CEE text collapses onto its
 * ASCII-ish base ("spořit" -> "sporit", "peníze" -> "penize", "úspory" ->
 * "uspory"). Uses Unicode NFD decomposition; safe for Latin-script languages
 * used across the demo's markets (CS, SK, SL, RO, HU, SR-latin, BS).
 */
export function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(COMBINING_MARKS, "");
}

/**
 * Canonical normalization: lowercase, strip diacritics, drop punctuation to
 * spaces, and collapse whitespace. This is the form every NLU comparison runs
 * on. It is deliberately a superset of the orchestration's inline `normalize`
 * (which only lowercases + collapses whitespace), so an exact scripted prompt
 * still round-trips through it apart from punctuation/diacritics.
 */
export function normalizeText(input: string): string {
  return stripDiacritics(input.toLowerCase())
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize *already-normalized* text into word tokens. Callers that hold raw
 * user input should pass it through `normalizeText` first (see `contentTokens`).
 * Numbers are kept — they carry meaning for amounts and quantities.
 */
export function tokenize(normalized: string): string[] {
  return normalized.split(" ").filter(Boolean);
}

/**
 * Build overlapping n-grams (phrases) from a token list so multi-word signals
 * like "credit limit" or "term deposit" can be matched as a unit.
 */
export function ngrams(tokens: string[], size: number): string[] {
  if (size <= 1) return tokens;
  const grams: string[] = [];
  for (let index = 0; index + size <= tokens.length; index += 1) {
    grams.push(tokens.slice(index, index + size).join(" "));
  }
  return grams;
}

/**
 * A small, banking-domain stopword set (EN + common CS/SK function words).
 * Removed before scoring so filler words do not dilute keyword weights. Kept
 * short on purpose: over-aggressive stopword removal hurts short banking
 * phrases (e.g. "my card").
 */
export const CHAT_STOPWORDS: ReadonlySet<string> = new Set([
  // English
  "the", "a", "an", "of", "to", "for", "and", "or", "is", "are", "am", "be",
  "my", "me", "i", "you", "your", "it", "this", "that", "on", "in", "at",
  "can", "could", "would", "should", "do", "does", "did", "how", "what",
  "please", "help", "with", "about", "from", "into", "some", "any", "will",
  // Czech / Slovak function words (already diacritic-stripped)
  "mi", "mne", "ja", "ma", "moje", "muj", "moji", "co", "jak", "jako", "je",
  "na", "se", "si", "nebo", "prosim", "chci", "chtel", "chtela", "mam",
  "kde", "kolik", "muzu", "muze", "pro", "ktere", "ktery",
]);

/**
 * Tokenize raw input and drop stopwords — the content-token stream used for
 * scoring. Handles normalization internally, so pass raw user text here.
 */
export function contentTokens(input: string): string[] {
  return tokenize(normalizeText(input)).filter((token) => !CHAT_STOPWORDS.has(token));
}
