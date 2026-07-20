/**
 * Translation corpus helpers for the stakeholder Tools surface.
 *
 * Reads the real per-country translation objects: 7 countries x (local + EN)
 * = 14 language columns. BA_BL shares the BA translation object, so it is
 * intentionally not listed as a separate column.
 */

import { TRANSLATIONS } from "@/translations";
import {
  LOCAL_LANGUAGE_BY_COUNTRY,
  getLanguageDisplayName,
  type AppLanguage,
} from "@/app/registry/languageByCountry";
import type { CountryId } from "@/app/state/demoTypes";

export interface LanguageColumn {
  id: string;
  country: CountryId;
  language: AppLanguage;
  /** Compact column label, e.g. "CZ · CS". */
  label: string;
  /** Native language display name, e.g. "Čeština". */
  languageName: string;
  isEnglish: boolean;
}

const CORPUS_COUNTRIES: readonly CountryId[] = ["CZ", "SK", "RO", "RS", "HU", "BA", "SI"];

export const LANGUAGE_COLUMNS: readonly LanguageColumn[] = CORPUS_COUNTRIES.flatMap((country) => {
  const localLanguage = LOCAL_LANGUAGE_BY_COUNTRY[country];
  return [localLanguage, "en" as AppLanguage].map((language) => ({
    id: `${country}:${language}`,
    country,
    language,
    label: `${country} · ${language.toUpperCase()}`,
    languageName: getLanguageDisplayName(language),
    isEnglish: language === "en",
  }));
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Resolve a dot-path (e.g. "payments.title") inside one country/language object. */
export function getTranslationValue(
  country: CountryId,
  language: AppLanguage,
  path: string,
): string | undefined {
  const byLanguage = TRANSLATIONS[country] as Record<string, unknown> | undefined;
  let current: unknown = byLanguage?.[language];
  for (const part of path.split(".")) {
    if (!isRecord(current)) return undefined;
    current = current[part];
  }
  return typeof current === "string" ? current : undefined;
}

function collectLeafPaths(value: unknown, prefix: string, into: string[]) {
  if (typeof value === "string") {
    if (prefix) into.push(prefix);
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    collectLeafPaths(child, prefix ? `${prefix}.${key}` : key, into);
  }
}

/** RO/EN is the canonical shape: every country file implements the same TranslationKeys. */
const CANONICAL_ROOT: unknown = TRANSLATIONS.RO.en;

export const TRANSLATION_NAMESPACES: readonly string[] = isRecord(CANONICAL_ROOT)
  ? Object.keys(CANONICAL_ROOT)
  : [];

const namespacePathsCache = new Map<string, readonly string[]>();

/** All leaf key paths under one top-level namespace (paths include the namespace prefix). */
export function getNamespaceLeafPaths(namespace: string): readonly string[] {
  const cached = namespacePathsCache.get(namespace);
  if (cached) return cached;
  const root = isRecord(CANONICAL_ROOT) ? CANONICAL_ROOT[namespace] : undefined;
  const paths: string[] = [];
  collectLeafPaths(root, namespace, paths);
  namespacePathsCache.set(namespace, paths);
  return paths;
}

let allLeafPathsCache: readonly string[] | null = null;

export function getAllLeafPaths(): readonly string[] {
  if (!allLeafPathsCache) {
    allLeafPathsCache = TRANSLATION_NAMESPACES.flatMap((namespace) => getNamespaceLeafPaths(namespace));
  }
  return allLeafPathsCache;
}

/**
 * A localized string is an overflow risk when it is meaningfully longer than
 * the same country's English baseline (the copy the screens were designed with).
 */
export function isOverflowRisk(value: string | undefined, englishBaseline: string | undefined): boolean {
  if (!value || !englishBaseline) return false;
  return value.length > 24 && value.length > englishBaseline.length * 1.45;
}

/** The longest real translation of a key across all language columns. */
export function findLongestValue(path: string): { column: LanguageColumn; value: string } | null {
  let best: { column: LanguageColumn; value: string } | null = null;
  for (const column of LANGUAGE_COLUMNS) {
    const value = getTranslationValue(column.country, column.language, path);
    if (typeof value === "string" && (!best || value.length > best.value.length)) {
      best = { column, value };
    }
  }
  return best;
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

const UTF8_BOM = String.fromCharCode(0xfeff);

/** CSV (UTF-8 BOM, CRLF) of one namespace across all language columns. */
export function buildTranslationCsv(namespace: string): string {
  const header = ["Key", ...LANGUAGE_COLUMNS.map((column) => column.label)];
  const lines = [header.map(escapeCsvCell).join(",")];
  for (const path of getNamespaceLeafPaths(namespace)) {
    const row = [
      path,
      ...LANGUAGE_COLUMNS.map((column) => getTranslationValue(column.country, column.language, path) ?? ""),
    ];
    lines.push(row.map(escapeCsvCell).join(","));
  }
  return UTF8_BOM + lines.join("\r\n");
}
