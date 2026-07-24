/**
 * Bounded fuzzy token matching for the chat NLU layer.
 *
 * Users mistype ("paymnet", "trasnfer", "invesment"). A strict substring test
 * misses all of these. We use a length-aware Levenshtein threshold so short
 * tokens must match almost exactly while longer tokens tolerate 1–2 edits.
 * The distance is early-exited once it exceeds the allowed budget, so this
 * stays cheap even against a large keyword vocabulary.
 */

/**
 * Levenshtein edit distance with an upper bound. Returns `maxDistance + 1` as
 * soon as it is certain the true distance exceeds `maxDistance`, so callers can
 * treat any value `> maxDistance` as "too far" without paying for the full DP.
 */
export function boundedLevenshtein(a: string, b: string, maxDistance: number): number {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > maxDistance) return maxDistance + 1;
  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  let previous = new Array<number>(lenB + 1).fill(0);
  let current = new Array<number>(lenB + 1).fill(0);
  for (let j = 0; j <= lenB; j += 1) previous[j] = j;

  for (let i = 1; i <= lenA; i += 1) {
    current[0] = i;
    let rowMin = i;
    const charA = a.charCodeAt(i - 1);
    for (let j = 1; j <= lenB; j += 1) {
      const cost = charA === b.charCodeAt(j - 1) ? 0 : 1;
      const value = Math.min(
        (previous[j] ?? 0) + 1, // deletion
        (current[j - 1] ?? 0) + 1, // insertion
        (previous[j - 1] ?? 0) + cost, // substitution
      );
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }
    // Whole row already worse than the budget → no path can recover.
    if (rowMin > maxDistance) return maxDistance + 1;
    const swap = previous;
    previous = current;
    current = swap;
  }

  return previous[lenB] ?? maxDistance + 1;
}

/**
 * Edit budget for a token of the given length. Short tokens (≤3 chars, e.g.
 * "pin", "iban") demand an exact match; medium tokens tolerate one edit; long
 * tokens (≥8) tolerate two. This keeps precision high where a single edit would
 * otherwise collide with a different word.
 */
export function fuzzyBudget(length: number): number {
  if (length <= 3) return 0;
  if (length <= 7) return 1;
  return 2;
}

/**
 * True if two already-normalized tokens are equal or within the length-aware
 * edit budget. The budget is taken from the *keyword* length (the vocabulary
 * side), so a longer target term is what sets tolerance.
 */
export function tokensFuzzyEqual(input: string, keyword: string): boolean {
  if (input === keyword) return true;
  const budget = fuzzyBudget(keyword.length);
  if (budget === 0) return false;
  return boundedLevenshtein(input, keyword, budget) <= budget;
}

/**
 * Does any token in `tokens` fuzzy-match `keyword`? A single-word keyword is
 * compared token-by-token; a multi-word keyword ("credit limit") is tested as
 * a substring of the joined token stream (phrase match) with no fuzz, since
 * phrase-level typo tolerance is rarely worth the false positives.
 */
export function tokensContainKeyword(tokens: string[], keyword: string): boolean {
  if (keyword.includes(" ")) {
    return ` ${tokens.join(" ")} `.includes(` ${keyword} `);
  }
  return tokens.some((token) => tokensFuzzyEqual(token, keyword));
}
