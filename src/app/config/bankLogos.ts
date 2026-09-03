/**
 * Receiving-bank marks for the Payments beneficiaries list.
 *
 * The artwork is NOT checked into this file: these are other banks' registered
 * trademarks, so the app loads whatever official file has been dropped into
 * `src/assets/bank-logos/` and falls back to a lettered disc in the bank's
 * colour when a file is missing. Adding a bank's real logo is therefore a file
 * copy, not a code change:
 *
 *   src/assets/bank-logos/revolut.svg   → picked up as the `revolut` mark
 *
 * `.svg` and `.png` are both understood. Use the bank's own press-kit file so
 * the mark stays the one its owner publishes.
 */

export type BankId = "unicredit" | "revolut" | "kb" | "cs" | "raiffeisen" | "moneta";

export interface BankBadge {
  id: BankId;
  name: string;
  /** Two characters at most: the badge is 18px across. */
  short: string;
  /** Badge ground when no official file is present. */
  color: string;
  /** Mark colour on that ground — a light ground needs a dark mark. */
  textColor: string;
  /** Set when the app already ships the artwork in its own brand registry. */
  brandLogoId?: "unicredit";
  /**
   * Share of the badge kept clear around the artwork, 0–1. Square marks need the
   * default or the round badge clips their corners; a tall, narrow glyph has no
   * corners to lose and can run nearly edge to edge.
   */
  logoInset?: number;
}

/** Enough clearance for a square mark to sit inside the circle uncut. */
export const DEFAULT_BANK_LOGO_INSET = 0.14;

export const BANK_BADGES: Record<BankId, BankBadge> = {
  unicredit: { id: "unicredit", name: "UniCredit Bank", short: "UC", color: "#E2001A", textColor: "#FFFFFF", brandLogoId: "unicredit" },
  revolut: { id: "revolut", name: "Revolut", short: "R", color: "#0A0A0A", textColor: "#FFFFFF", logoInset: 0.06 },
  // The KB mark is a square block: it reads as an app icon filling the badge,
  // so it keeps no inset and lets the circle crop its corners.
  kb: { id: "kb", name: "Komerční banka", short: "KB", color: "#8C1D40", textColor: "#FFFFFF", logoInset: 0 },
  cs: { id: "cs", name: "Česká spořitelna", short: "ČS", color: "#2870ED", textColor: "#FFFFFF" },
  // Square yellow block, like KB: it fills the badge rather than floating in it.
  raiffeisen: { id: "raiffeisen", name: "Raiffeisenbank", short: "RB", color: "#FFD500", textColor: "#000000", logoInset: 0 },
  // Tall, narrow glyph like Revolut's: no corners to clip, so it runs closer to the edge.
  moneta: { id: "moneta", name: "MONETA Money Bank", short: "M", color: "#6E2585", textColor: "#FFFFFF", logoInset: 0.06 },
};

/**
 * Every file under `src/assets/bank-logos/`, keyed by its bank id. Eager so a
 * badge can decide synchronously whether it has artwork to draw.
 */
const BANK_LOGO_FILES = import.meta.glob<string>("@/assets/bank-logos/*.{svg,png}", {
  eager: true,
  query: "?url",
  import: "default",
});

const BANK_LOGO_URLS = new Map<string, string>(
  Object.entries(BANK_LOGO_FILES).map(([path, url]) => [
    path.split("/").pop()?.replace(/\.(svg|png)$/i, "") ?? path,
    url,
  ]),
);

/** The official file for a bank, or null when none has been added yet. */
export function getBankLogoUrl(bankId: BankId): string | null {
  return BANK_LOGO_URLS.get(bankId) ?? null;
}
