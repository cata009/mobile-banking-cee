/**
 * Country divergence model.
 *
 * Systematically compares the 8 CEE country contexts across the dimensions that
 * actually vary — localization/format, capability availability, feature-flag
 * scope, and local-language translation coverage — reading straight from the
 * live registries and availability rules. The output answers the question
 * stakeholders ask constantly: "where does country X differ from the rest?"
 */

import { COUNTRIES, COUNTRY_META, FEATURE_META } from "@/app/registry/demoConfig";
import { COUNTRY_CONFIG } from "@/app/registry/countryConfig";
import { LOCAL_LANGUAGE_BY_COUNTRY, getLanguageDisplayName } from "@/app/registry/languageByCountry";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import { isInvestmentsPortfolioAvailable } from "@/app/utils/investmentsAvailability";
import { isKidsHomeCountry } from "@/data/kidsMarketHomeConcepts";
import type { CountryId, FeatureId } from "@/app/state/demoTypes";
import { getAllLeafPaths, getTranslationValue } from "./translationCorpus";

export type CellKind = "yes" | "no" | "neutral";

export interface DivergenceCell {
  display: string;
  kind: CellKind;
}

export interface DivergenceRow {
  id: string;
  category: string;
  label: string;
  hint?: string;
  values: Record<CountryId, DivergenceCell>;
}

const yes = (): DivergenceCell => ({ display: "Yes", kind: "yes" });
const no = (): DivergenceCell => ({ display: "No", kind: "no" });
const text = (value: string): DivergenceCell => ({ display: value, kind: "neutral" });

function byCountry(compute: (country: CountryId) => DivergenceCell): Record<CountryId, DivergenceCell> {
  return Object.fromEntries(COUNTRIES.map((country) => [country, compute(country)])) as Record<
    CountryId,
    DivergenceCell
  >;
}

interface LocalCoverage {
  pct: number;
  translated: number;
  identicalToEn: number;
  missing: number;
  total: number;
}

const coverageCache = new Map<CountryId, LocalCoverage>();

function localCoverage(country: CountryId): LocalCoverage {
  const cached = coverageCache.get(country);
  if (cached) return cached;

  const language = LOCAL_LANGUAGE_BY_COUNTRY[country];
  const paths = getAllLeafPaths();
  let translated = 0;
  let identicalToEn = 0;
  let missing = 0;

  for (const path of paths) {
    const local = getTranslationValue(country, language, path);
    const english = getTranslationValue(country, "en", path);
    if (local === undefined) missing += 1;
    else if (english !== undefined && local === english) identicalToEn += 1;
    else translated += 1;
  }

  const total = paths.length;
  const result: LocalCoverage = {
    pct: total > 0 ? Math.round((translated / total) * 100) : 0,
    translated,
    identicalToEn,
    missing,
    total,
  };
  coverageCache.set(country, result);
  return result;
}

/** Whether a country is inside a feature's product/design-system/country scope. */
function isFeatureInScope(featureId: FeatureId, country: CountryId): boolean {
  const meta = FEATURE_META[featureId];
  if (!meta) return false;
  if (meta.products && !meta.products.includes("PI")) return false;
  if (meta.designSystems && !meta.designSystems.includes("current")) return false;
  if (meta.scope === "countries") return Boolean(meta.countries?.includes(country));
  return true;
}

export function computeDivergenceRows(): DivergenceRow[] {
  const rows: DivergenceRow[] = [];

  // Localization & formatting
  rows.push({
    id: "loc.currency",
    category: "Localization & format",
    label: "Currency",
    values: byCountry((country) => text(COUNTRY_META[country].currency)),
  });
  rows.push({
    id: "loc.locale",
    category: "Localization & format",
    label: "Locale",
    values: byCountry((country) => text(COUNTRY_CONFIG[country].locale)),
  });
  rows.push({
    id: "loc.language",
    category: "Localization & format",
    label: "Local language",
    values: byCountry((country) => text(getLanguageDisplayName(LOCAL_LANGUAGE_BY_COUNTRY[country]))),
  });

  // Capability availability
  rows.push({
    id: "cap.co-apping",
    category: "Capability availability",
    label: "Co-Apping session",
    hint: "Screen sharing with a banker — local feature.",
    values: byCountry((country) => (isCoAppingAvailable(country) ? yes() : no())),
  });
  rows.push({
    id: "cap.kids",
    category: "Capability availability",
    label: "Kids app (themed home)",
    hint: "Dedicated KIDS_PI market home concept.",
    values: byCountry((country) => (isKidsHomeCountry(country) ? yes() : no())),
  });
  rows.push({
    id: "cap.investments",
    category: "Capability availability",
    label: "Investments portfolio",
    values: byCountry((country) => (isInvestmentsPortfolioAvailable("PI", country) ? yes() : no())),
  });

  // Feature-flag scope
  for (const featureId of Object.keys(FEATURE_META) as FeatureId[]) {
    const meta = FEATURE_META[featureId];
    rows.push({
      id: `feature.${featureId}`,
      category: "Feature scope (PI · current)",
      label: meta.label,
      hint: meta.description,
      values: byCountry((country) => (isFeatureInScope(featureId, country) ? yes() : no())),
    });
  }

  // Translation coverage in the local language
  rows.push({
    id: "l10n.coverage",
    category: "Translation (local language)",
    label: "Localized coverage",
    hint: "Share of keys with a local value that differs from the English baseline.",
    values: byCountry((country) => text(`${localCoverage(country).pct}%`)),
  });
  rows.push({
    id: "l10n.identical",
    category: "Translation (local language)",
    label: "Identical to English",
    hint: "Keys whose local value equals the English text (often not yet localized).",
    values: byCountry((country) => text(String(localCoverage(country).identicalToEn))),
  });
  rows.push({
    id: "l10n.missing",
    category: "Translation (local language)",
    label: "Missing keys",
    values: byCountry((country) => text(String(localCoverage(country).missing))),
  });

  return rows;
}

/** The most common display value across all countries (the "majority" baseline). */
function modalDisplay(row: DivergenceRow): string {
  const counts = new Map<string, number>();
  for (const country of COUNTRIES) {
    const display = row.values[country].display;
    counts.set(display, (counts.get(display) ?? 0) + 1);
  }
  let best = "";
  let bestCount = -1;
  for (const [display, count] of counts) {
    if (count > bestCount) {
      best = display;
      bestCount = count;
    }
  }
  return best;
}

export function rowHasDivergence(row: DivergenceRow, reference: CountryId | null): boolean {
  if (reference) {
    const referenceDisplay = row.values[reference].display;
    return COUNTRIES.some((country) => row.values[country].display !== referenceDisplay);
  }
  return new Set(COUNTRIES.map((country) => row.values[country].display)).size > 1;
}

export function isCellDivergent(
  row: DivergenceRow,
  country: CountryId,
  reference: CountryId | null,
): boolean {
  const baseline = reference ? row.values[reference].display : modalDisplay(row);
  return row.values[country].display !== baseline;
}

/** How many rows each country diverges from the baseline (majority or reference). */
export function divergenceCountByCountry(
  rows: DivergenceRow[],
  reference: CountryId | null,
): Record<CountryId, number> {
  const result = Object.fromEntries(COUNTRIES.map((country) => [country, 0])) as Record<CountryId, number>;
  for (const row of rows) {
    for (const country of COUNTRIES) {
      if (country === reference) continue;
      if (isCellDivergent(row, country, reference)) result[country] += 1;
    }
  }
  return result;
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildDivergenceCsv(rows: DivergenceRow[]): string {
  const header = ["Category", "Dimension", ...COUNTRIES.map((country) => COUNTRY_META[country].name)];
  const lines = [header.map(escapeCsvCell).join(",")];
  for (const row of rows) {
    const line = [
      row.category,
      row.label,
      ...COUNTRIES.map((country) => row.values[country].display),
    ];
    lines.push(line.map(escapeCsvCell).join(","));
  }
  return String.fromCharCode(0xfeff) + lines.join("\r\n");
}
