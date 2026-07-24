/**
 * Pure entity extractors for the chat NLU layer.
 *
 * Today the multi-step flows only understand the exact amounts baked into their
 * chips ("5,000 CZK", "500 CZK"). A user who types "10k" or "7 500 Kč" is not
 * understood at all. `parseMoneyAmount` recovers a numeric value from the many
 * ways people write money across the CEE markets, so the flows can accept free
 * text without losing the deterministic, offline behavior.
 *
 * IMPORTANT: money parsing is deliberately kept separate from the buy-order
 * *quantity* detector (which must reject fractions). Do not route quantity
 * slots through this grammar.
 */
import { stripDiacritics } from "./normalize";

const CURRENCY_TOKENS = /\b(czk|kc|eur|huf|ron|rsd|bam|pln|usd|gbp)\b/g;
const CURRENCY_SYMBOLS = /[€$£]|kč/gi;

/**
 * Parse a positive money amount from free text, tolerant of the ways amounts
 * are written:
 *   "10k" → 10000, "1.5k" → 1500, "2m" → 2000000,
 *   "10,000" / "10.000" / "10 000" → 10000, "7500 czk" → 7500, "€250" → 250.
 * Returns `null` when there is no usable number.
 *
 * Grouping rule: outside the k/m suffix form, `.` `,` and spaces are treated as
 * thousands separators (CEE amounts are whole units), so "10.000" is ten
 * thousand, not ten. Fractional precision is only honored with a k/m suffix.
 */
export function parseMoneyAmount(text: string): number | null {
  const cleaned = stripDiacritics(text.toLowerCase())
    .replace(CURRENCY_SYMBOLS, " ")
    .replace(CURRENCY_TOKENS, " ");

  // k / m magnitude suffix: "10k", "1.5 k", "2m".
  const suffixMatch = cleaned.match(/(\d+(?:[.,]\d+)?)\s*([km])\b/);
  const suffixBase = suffixMatch?.[1];
  if (suffixBase !== undefined) {
    const base = Number.parseFloat(suffixBase.replace(",", "."));
    if (!Number.isFinite(base)) return null;
    const multiplier = suffixMatch?.[2] === "m" ? 1_000_000 : 1_000;
    const value = Math.round(base * multiplier);
    return value > 0 ? value : null;
  }

  // Plain (possibly grouped) integer: "10 000", "10,000", "10.000", "7500".
  const numberMatch = cleaned.match(/\d[\d .,]*\d|\d/);
  if (!numberMatch) return null;
  const digits = numberMatch[0].replace(/[ .,]/g, "");
  if (!/^\d+$/.test(digits)) return null;
  const value = Number.parseInt(digits, 10);
  return value > 0 ? value : null;
}

/**
 * Parse a positive whole quantity ("units", "pcs") from free text. Fractions,
 * zero, and negatives return `null` — matching the buy-order flow's rule that
 * only whole units are supported.
 */
export function parseQuantity(text: string): number | null {
  const match = stripDiacritics(text.toLowerCase()).match(/\b(\d+)\b/);
  const digits = match?.[1];
  if (digits === undefined) return null;
  const value = Number.parseInt(digits, 10);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}
