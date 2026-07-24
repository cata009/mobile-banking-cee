/**
 * RS Teens money formatting and masking helpers (RSD, sr-RS locale, Latin script).
 *
 * Mirrors the shape of the RO/HU Kids money modules but is fully self-contained
 * so the Serbian teens app never depends on another fork's formatting rules.
 * The sr-RS locale yields period thousands separators and a comma decimal mark
 * (e.g. "12.850", "4.285,50"); "RSD" is appended as a literal currency suffix.
 */
import { formatMoneyNumber, splitMoneyAmount } from "@/app/registry/countryConfig";

export const RS_TEEN_COUNTRY = "RS" as const;

const rsIntegerFormatter = new Intl.NumberFormat("sr-RS", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

/** Whole-RSD label, e.g. `50 RSD`. Used for chips and compact tiles. */
export function formatRsd(amount: number): string {
  return `${rsIntegerFormatter.format(Math.round(amount))} RSD`;
}

/** Two-decimal amount without the currency suffix, e.g. `4.285,50`. */
export function formatRsdDecimal(amount: number): string {
  return formatMoneyNumber(amount, RS_TEEN_COUNTRY);
}

/** Two-decimal amount with the RSD suffix, e.g. `4.285,50 RSD`. */
export function formatRsdFull(amount: number): string {
  return `${formatMoneyNumber(amount, RS_TEEN_COUNTRY)} RSD`;
}

/** Split a value into big-integer + small-decimal parts for hero balances. */
export function getRsdParts(amount: number): { integer: string; decimal: string } {
  const { integer, decimal } = splitMoneyAmount(amount, RS_TEEN_COUNTRY);
  return { integer, decimal: `,${decimal}` };
}

export const RS_MASKED_INTEGER = "••••";
export const RS_MASKED_DECIMALS = ",••";

/** Masked balance, respecting the hide-amounts toggle. */
export function formatRsdMasked(): string {
  return `${RS_MASKED_INTEGER}${RS_MASKED_DECIMALS} RSD`;
}

/** Signed amount for transaction rows, e.g. `+50 RSD` / `-27,99 RSD`. */
export function formatRsdSigned(amount: number, showAmounts = true): string {
  const positive = amount >= 0;
  const sign = positive ? "+" : "-";
  if (!showAmounts) {
    return `${sign}${RS_MASKED_INTEGER}${RS_MASKED_DECIMALS} RSD`;
  }
  return `${sign}${formatMoneyNumber(Math.abs(amount), RS_TEEN_COUNTRY)} RSD`;
}

/** Amount honouring the hide toggle, e.g. `50 RSD` or `•••• RSD`. */
export function formatRsdGuarded(amount: number, showAmounts: boolean): string {
  return showAmounts ? formatRsd(amount) : `${RS_MASKED_INTEGER} RSD`;
}

/** Clamp a 0..100 progress percentage from a saved/target pair. */
export function toProgress(saved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((saved / target) * 100));
}
