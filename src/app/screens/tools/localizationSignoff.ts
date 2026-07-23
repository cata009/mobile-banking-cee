/**
 * Localization sign-off store.
 *
 * Turns the read-only translation review into an accountable workflow: local
 * market reviewers mark each string approved or needs-change (with a note) per
 * language, and the state persists in localStorage so a review survives page
 * reloads across a release cycle. Deliberately client-only — this is a review
 * aid, not a source of truth that feeds the app.
 */

import { LANGUAGE_COLUMNS, getTranslationValue, type LanguageColumn } from "./translationCorpus";

export type SignoffStatus = "pending" | "approved" | "needs-change";

export interface SignoffEntry {
  status: SignoffStatus;
  note: string;
  updatedAt: string;
}

type SignoffStore = Record<string, Record<string, SignoffEntry>>;

const STORAGE_KEY = "uc-l10n-signoff-v1";

/** Only the local-language columns are signed off; English is the reference. */
export const SIGNOFF_COLUMNS: readonly LanguageColumn[] = LANGUAGE_COLUMNS.filter(
  (column) => !column.isEnglish,
);

function isSignoffStatus(value: unknown): value is SignoffStatus {
  return value === "pending" || value === "approved" || value === "needs-change";
}

function readStore(): SignoffStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as SignoffStore;
  } catch {
    return {};
  }
}

function writeStore(store: SignoffStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or disabled — the in-memory copy still drives the UI.
  }
}

export function loadSignoff(): SignoffStore {
  return readStore();
}

export function getEntry(store: SignoffStore, languageId: string, path: string): SignoffEntry | undefined {
  const entry = store[languageId]?.[path];
  if (!entry || !isSignoffStatus(entry.status)) return undefined;
  return entry;
}

export function getStatus(store: SignoffStore, languageId: string, path: string): SignoffStatus {
  return getEntry(store, languageId, path)?.status ?? "pending";
}

/** Persist a change and return a fresh store object for React state. */
export function updateEntry(
  store: SignoffStore,
  languageId: string,
  path: string,
  patch: Partial<Pick<SignoffEntry, "status" | "note">>,
  timestamp: string,
): SignoffStore {
  const current = getEntry(store, languageId, path) ?? { status: "pending", note: "", updatedAt: timestamp };
  const nextEntry: SignoffEntry = {
    status: patch.status ?? current.status,
    note: patch.note ?? current.note,
    updatedAt: timestamp,
  };
  const next: SignoffStore = {
    ...store,
    [languageId]: { ...(store[languageId] ?? {}), [path]: nextEntry },
  };
  writeStore(next);
  return next;
}

export interface SignoffProgress {
  total: number;
  approved: number;
  needsChange: number;
  pending: number;
}

export function computeProgress(
  store: SignoffStore,
  languageId: string,
  paths: readonly string[],
): SignoffProgress {
  let approved = 0;
  let needsChange = 0;
  for (const path of paths) {
    const status = getStatus(store, languageId, path);
    if (status === "approved") approved += 1;
    else if (status === "needs-change") needsChange += 1;
  }
  return {
    total: paths.length,
    approved,
    needsChange,
    pending: paths.length - approved - needsChange,
  };
}

function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Sign-off report for one language across the given key paths. */
export function buildSignoffCsv(
  store: SignoffStore,
  column: LanguageColumn,
  paths: readonly string[],
): string {
  const header = ["Key", "English", column.label, "Status", "Note", "Updated"];
  const lines = [header.map(escapeCsvCell).join(",")];
  for (const path of paths) {
    const entry = getEntry(store, column.id, path);
    const line = [
      path,
      getTranslationValue(column.country, "en", path) ?? "",
      getTranslationValue(column.country, column.language, path) ?? "",
      entry?.status ?? "pending",
      entry?.note ?? "",
      entry?.updatedAt ?? "",
    ];
    lines.push(line.map(escapeCsvCell).join(","));
  }
  return String.fromCharCode(0xfeff) + lines.join("\r\n");
}
