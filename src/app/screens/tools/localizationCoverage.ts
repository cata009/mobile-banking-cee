/**
 * Localization coverage model.
 *
 * Honest per-language completeness over the real translation corpus. Every key
 * lands in exactly one bucket:
 *  - translated: a local value that differs from the English baseline
 *  - inherited:  a local value equal to English (shared/not-yet-localized —
 *                often legitimate for brand terms, codes, PIN, OK, …)
 *  - missing:    no local value at all
 *
 * "Inherited" is deliberately not called "untranslated": it is a signal to look
 * at, not a verdict. The dashboard shows all three buckets so a reviewer can
 * judge, instead of a single misleading percentage.
 */

import {
  LANGUAGE_COLUMNS,
  TRANSLATION_NAMESPACES,
  getNamespaceLeafPaths,
  getTranslationValue,
  type LanguageColumn,
} from "./translationCorpus";

export interface CoverageCounts {
  total: number;
  translated: number;
  inherited: number;
  missing: number;
}

/** The 7 local-language columns (English is the source, not a review target). */
export const LOCAL_COLUMNS: readonly LanguageColumn[] = LANGUAGE_COLUMNS.filter(
  (column) => !column.isEnglish,
);

const emptyCounts = (): CoverageCounts => ({ total: 0, translated: 0, inherited: 0, missing: 0 });

const namespaceCache = new Map<string, CoverageCounts>();

export function namespaceCoverage(column: LanguageColumn, namespace: string): CoverageCounts {
  const cacheKey = `${column.id}::${namespace}`;
  const cached = namespaceCache.get(cacheKey);
  if (cached) return cached;

  const counts = emptyCounts();
  for (const path of getNamespaceLeafPaths(namespace)) {
    counts.total += 1;
    const local = getTranslationValue(column.country, column.language, path);
    const english = getTranslationValue(column.country, "en", path);
    if (local === undefined) counts.missing += 1;
    else if (english !== undefined && local === english) counts.inherited += 1;
    else counts.translated += 1;
  }

  namespaceCache.set(cacheKey, counts);
  return counts;
}

export function languageCoverage(column: LanguageColumn): CoverageCounts {
  const totals = emptyCounts();
  for (const namespace of TRANSLATION_NAMESPACES) {
    const counts = namespaceCoverage(column, namespace);
    totals.total += counts.total;
    totals.translated += counts.translated;
    totals.inherited += counts.inherited;
    totals.missing += counts.missing;
  }
  return totals;
}

export function translatedPct(counts: CoverageCounts): number {
  return counts.total > 0 ? Math.round((counts.translated / counts.total) * 100) : 0;
}

export interface NamespaceCoverageRow {
  namespace: string;
  counts: CoverageCounts;
}

export function namespaceRowsForLanguage(column: LanguageColumn): NamespaceCoverageRow[] {
  return TRANSLATION_NAMESPACES.map((namespace) => ({
    namespace,
    counts: namespaceCoverage(column, namespace),
  }));
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Full language × namespace breakdown as CSV. */
export function buildCoverageCsv(): string {
  const header = ["Language", "Namespace", "Total", "Translated", "Inherited from EN", "Missing", "Translated %"];
  const lines = [header.map(escapeCsvCell).join(",")];
  for (const column of LOCAL_COLUMNS) {
    for (const { namespace, counts } of namespaceRowsForLanguage(column)) {
      const line = [
        `${column.label} (${column.languageName})`,
        namespace,
        String(counts.total),
        String(counts.translated),
        String(counts.inherited),
        String(counts.missing),
        `${translatedPct(counts)}%`,
      ];
      lines.push(line.map(escapeCsvCell).join(","));
    }
  }
  return String.fromCharCode(0xfeff) + lines.join("\r\n");
}
