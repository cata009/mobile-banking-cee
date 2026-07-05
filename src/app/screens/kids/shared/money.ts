/**
 * Shared helpers used by all kids forks (RS / HU / SK / future).
 *
 * Extracted from KidsMarketHomeApp.tsx (Phase 0 of the kids-split refactor)
 * so each fork module can import them without depending on the monolith.
 */

import type { IconName } from "@/app/components/icons";
import { formatMoney } from "@/app/registry/countryConfig";
import type { KidsHomeAction, KidsHomeCountry } from "@/data/kidsMarketHomeConcepts";

/** Tone → Tailwind class maps shared by action grids across all kids forks. */
export const TONE_CLASSES: Record<KidsHomeAction["tone"], { bg: string; text: string; iconBg: string }> = {
  red: {
    bg: "bg-[color-mix(in_srgb,var(--uc-red-main)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-red-main)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-red-main)_16%,var(--uc-surface))]",
  },
  teal: {
    bg: "bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-action)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-action)_16%,var(--uc-surface))]",
  },
  blue: {
    bg: "bg-[color-mix(in_srgb,var(--uc-product-blue)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-product-blue)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-product-blue)_16%,var(--uc-surface))]",
  },
  green: {
    bg: "bg-[color-mix(in_srgb,var(--uc-green-status)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-green-status)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-green-status)_16%,var(--uc-surface))]",
  },
  yellow: {
    bg: "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_18%,var(--uc-surface))]",
    text: "text-[var(--uc-primary-k1)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-yellow-gold)_28%,var(--uc-surface))]",
  },
  orange: {
    bg: "bg-[color-mix(in_srgb,var(--uc-orange-main)_10%,var(--uc-surface))]",
    text: "text-[var(--uc-orange-main)]",
    iconBg: "bg-[color-mix(in_srgb,var(--uc-orange-main)_16%,var(--uc-surface))]",
  },
  neutral: {
    bg: "bg-[var(--uc-surface)]",
    text: "text-[var(--uc-text)]",
    iconBg: "bg-[var(--uc-neutral-100)]",
  },
};

/** Format an amount as whole-currency kids money (no decimals). */
export function formatKidsMoney(amount: number, country: KidsHomeCountry) {
  return formatMoney(amount, country, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Format a signed amount with explicit +/- prefix for kids activity rows. */
export function formatSignedKidsMoney(amount: number, country: KidsHomeCountry) {
  const formatted = formatKidsMoney(Math.abs(amount), country);
  return `${amount >= 0 ? "+" : "-"}${formatted}`;
}

/** Cast a runtime icon string into the typed IconName union. */
export function resolveIconName(icon: string): IconName {
  return icon as IconName;
}
