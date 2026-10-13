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

import type { BankId } from '@/data/bankIdentity';
export { BANK_BADGES, DEFAULT_BANK_LOGO_INSET } from '@/data/bankIdentity';
export type { BankId, BankBadge } from '@/data/bankIdentity';

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
