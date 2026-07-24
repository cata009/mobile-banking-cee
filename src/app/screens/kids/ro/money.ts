/**
 * RO Teens money formatting and masking helpers (RON, ro-RO locale).
 *
 * Mirrors the shape of the HU Kids money module but is fully self-contained so
 * the Romanian teens app never depends on Hungarian (HUF) formatting rules.
 */
import { formatMoneyNumber, splitMoneyAmount } from "@/app/registry/countryConfig";

export const RO_TEEN_COUNTRY = "RO" as const;

const roIntegerFormatter = new Intl.NumberFormat("ro-RO", {
  maximumFractionDigits: 0,
  useGrouping: true,
});

/** Whole-RON label, e.g. `50 RON`. Used for chips and compact tiles. */
export function formatRon(amount: number): string {
  return `${roIntegerFormatter.format(Math.round(amount))} RON`;
}

/** Two-decimal amount without the currency suffix, e.g. `428,50`. */
export function formatRonDecimal(amount: number): string {
  return formatMoneyNumber(amount, RO_TEEN_COUNTRY);
}

/** Two-decimal amount with the RON suffix, e.g. `428,50 RON`. */
export function formatRonFull(amount: number): string {
  return `${formatMoneyNumber(amount, RO_TEEN_COUNTRY)} RON`;
}

/** Split a value into big-integer + small-decimal parts for hero balances. */
export function getRonParts(amount: number): { integer: string; decimal: string } {
  const { integer, decimal } = splitMoneyAmount(amount, RO_TEEN_COUNTRY);
  return { integer, decimal: `,${decimal}` };
}

export const RO_MASKED_INTEGER = "••••";
export const RO_MASKED_DECIMALS = ",••";

/** Masked balance, respecting the hide-amounts toggle. */
export function formatRonMasked(): string {
  return `${RO_MASKED_INTEGER}${RO_MASKED_DECIMALS} RON`;
}

/** Signed amount for transaction rows, e.g. `+50 RON` / `-27,99 RON`. */
export function formatRonSigned(amount: number, showAmounts = true): string {
  const positive = amount >= 0;
  const sign = positive ? "+" : "-";
  if (!showAmounts) {
    return `${sign}${RO_MASKED_INTEGER}${RO_MASKED_DECIMALS} RON`;
  }
  return `${sign}${formatMoneyNumber(Math.abs(amount), RO_TEEN_COUNTRY)} RON`;
}

/** Amount honouring the hide toggle, e.g. `50 RON` or `•••• RON`. */
export function formatRonGuarded(amount: number, showAmounts: boolean): string {
  return showAmounts ? formatRon(amount) : `${RO_MASKED_INTEGER} RON`;
}

/** Clamp a 0..100 progress percentage from a saved/target pair. */
export function toProgress(saved: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((saved / target) * 100));
}
