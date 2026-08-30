/**
 * Localization sign-off workflow.
 *
 * A reviewer picks their language and a namespace, then walks the keys marking
 * each local translation approved or needs-change (with a note). Progress and
 * notes persist in localStorage and export to CSV for the release record.
 */

import { useMemo, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { FieldLabel, StatusBadge, ToolPanel, downloadTextFile } from "./toolsUi";
import {
  TRANSLATION_NAMESPACES,
  getNamespaceLeafPaths,
  getTranslationValue,
  isOverflowRisk,
} from "./translationCorpus";
import {
  SIGNOFF_COLUMNS,
  buildSignoffCsv,
  computeProgress,
  getEntry,
  loadSignoff,
  updateEntry,
  type SignoffStatus,
} from "./localizationSignoff";

const STATUS_FILTERS: ReadonlyArray<{ id: SignoffStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "needs-change", label: "Needs change" },
];

const STATUS_OPTIONS: ReadonlyArray<{ id: SignoffStatus; label: string; tone: "ok" | "warn" | "neutral" }> = [
  { id: "pending", label: "Pending", tone: "neutral" },
  { id: "approved", label: "Approve", tone: "ok" },
  { id: "needs-change", label: "Needs change", tone: "warn" },
];

function nowIso(): string {
  return new Date().toISOString();
}

export function LocalizationSignoffTool() {
  const [columnId, setColumnId] = useState<string>(SIGNOFF_COLUMNS[0]?.id ?? "");
  const [namespace, setNamespace] = useState<string>(TRANSLATION_NAMESPACES[0] ?? "");
  const [statusFilter, setStatusFilter] = useState<SignoffStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [store, setStore] = useState(loadSignoff);

  const column = SIGNOFF_COLUMNS.find((entry) => entry.id === columnId) ?? SIGNOFF_COLUMNS[0];
  const paths = useMemo(() => getNamespaceLeafPaths(namespace), [namespace]);
  const progress = useMemo(
    () => (column ? computeProgress(store, column.id, paths) : null),
    [store, column, paths],
  );

  const visiblePaths = useMemo(() => {
    if (!column) return [];
    const normalizedQuery = query.trim().toLowerCase();
    return paths.filter((path) => {
      const status = getEntry(store, column.id, path)?.status ?? "pending";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!normalizedQuery) return true;
      if (path.toLowerCase().includes(normalizedQuery)) return true;
      const local = getTranslationValue(column.country, column.language, path);
      return Boolean(local?.toLowerCase().includes(normalizedQuery));
    });
  }, [paths, column, store, statusFilter, query]);

  if (!column) return null;

  const setStatus = (path: string, status: SignoffStatus) => {
    setStore((current) => updateEntry(current, column.id, path, { status }, nowIso()));
  };

  const setNote = (path: string, note: string) => {
    setStore((current) => updateEntry(current, column.id, path, { note }, nowIso()));
  };

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `signoff-${column.id.replace(":", "-")}-${namespace}-${date}.csv`,
      buildSignoffCsv(store, column, paths),
      "text/csv;charset=utf-8",
    );
  };

  const approvedPct = progress && progress.total > 0 ? Math.round((progress.approved / progress.total) * 100) : 0;

  return (
    <div className="grid gap-[20px]" data-tool-localization-signoff="true">
      <ToolPanel
        title="Review setup"
        action={
          <button
            type="button"
            onClick={handleExport}
            data-signoff-export="true"
            className="flex items-center gap-[8px] rounded-[20px] bg-[var(--uc-surface-muted)] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
          >
            <AppIcon name="download" size={15} color="currentColor" />
            Export CSV
          </button>
        }
      >
        <div className="grid gap-[16px] lg:grid-cols-[240px_240px_1fr]">
          <div>
            <FieldLabel>Language</FieldLabel>
            <select
              value={columnId}
              onChange={(event) => setColumnId(event.target.value)}
              data-signoff-language="true"
              className="uc-select mt-[8px] w-full cursor-pointer rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] py-[8px] pl-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
            >
              {SIGNOFF_COLUMNS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} · {entry.languageName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Namespace</FieldLabel>
            <select
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
              data-signoff-namespace="true"
              className="uc-select mt-[8px] w-full cursor-pointer rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] py-[8px] pl-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
            >
              {TRANSLATION_NAMESPACES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Search</FieldLabel>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="uc-select mt-[8px] w-full rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] py-[8px] pl-[12px] text-[13px] leading-[16px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
              placeholder="Search key or local text…"
            />
          </div>
        </div>

        {progress ? (
          <div className="mt-[16px]">
            <div className="flex flex-wrap items-center gap-[10px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">
              <span className="font-bold text-[var(--uc-text)]">{namespace}</span>
              <span>·</span>
              <span>{progress.total} keys</span>
              <StatusBadge tone="ok">{`${progress.approved} approved`}</StatusBadge>
              {progress.needsChange > 0 ? <StatusBadge tone="warn">{`${progress.needsChange} needs change`}</StatusBadge> : null}
              {progress.pending > 0 ? <StatusBadge tone="risk">{`${progress.pending} pending`}</StatusBadge> : null}
            </div>
            <div className="mt-[8px] h-[8px] w-full overflow-hidden rounded-full bg-[var(--uc-surface-muted)]">
              <div className="h-full rounded-full bg-[var(--uc-green-status)]" style={{ width: `${approvedPct}%` }} />
            </div>
          </div>
        ) : null}

        <div className="mt-[16px]">
          <FieldLabel>Show</FieldLabel>
          <div className="mt-[8px] flex flex-wrap gap-[8px]">
            {STATUS_FILTERS.map((filter) => {
              const active = statusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={`rounded-[20px] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] transition-colors ${
                    active
                      ? "bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                      : "bg-[var(--uc-surface-muted)] text-[var(--uc-text)] hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </ToolPanel>

      <div className="grid gap-[12px]">
        {visiblePaths.map((path) => {
          const english = getTranslationValue(column.country, "en", path);
          const local = getTranslationValue(column.country, column.language, path);
          const entry = getEntry(store, column.id, path);
          const status: SignoffStatus = entry?.status ?? "pending";
          const missing = local === undefined;
          const overflowRisk = isOverflowRisk(local, english);

          return (
            <div
              key={path}
              data-signoff-row={path}
              className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[16px] shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-[8px]">
                <span className="break-all font-mono text-[11px] leading-[15px] text-[var(--uc-text-muted)]">{path}</span>
                <div className="flex flex-wrap items-center gap-[6px]">
                  {missing ? <StatusBadge tone="risk">Missing</StatusBadge> : null}
                  {overflowRisk ? <StatusBadge tone="warn">Overflow risk</StatusBadge> : null}
                </div>
              </div>

              <div className="mt-[10px] grid gap-[8px] sm:grid-cols-2">
                <div className="rounded-[6px] bg-[var(--uc-surface-muted)] px-[12px] py-[8px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">English</p>
                  <p className="mt-[2px] text-[13px] leading-[18px] text-[var(--uc-text)]">{english ?? "—"}</p>
                </div>
                <div className="rounded-[6px] bg-[var(--uc-surface-muted)] px-[12px] py-[8px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                    {column.languageName}
                  </p>
                  <p className={`mt-[2px] text-[13px] leading-[18px] ${missing ? "text-[var(--uc-red-main)]" : "text-[var(--uc-text)]"}`}>
                    {local ?? "missing"}
                  </p>
                </div>
              </div>

              <div className="mt-[12px] flex flex-wrap items-center gap-[8px]">
                {STATUS_OPTIONS.map((option) => {
                  const active = status === option.id;
                  const activeClass =
                    option.tone === "ok"
                      ? "bg-[var(--uc-green-status)] text-[var(--uc-static-white)]"
                      : option.tone === "warn"
                        ? "bg-[var(--uc-orange-main)] text-[var(--uc-static-white)]"
                        : "bg-[var(--uc-text-muted)] text-[var(--uc-static-white)]";
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setStatus(path, option.id)}
                      data-signoff-status={active ? option.id : undefined}
                      className={`rounded-[16px] px-[12px] py-[6px] text-[12px] font-bold leading-[15px] transition-colors ${
                        active
                          ? activeClass
                          : "bg-[var(--uc-surface-muted)] text-[var(--uc-text)] hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
                {entry?.updatedAt ? (
                  <span className="ml-auto text-[11px] leading-[15px] text-[var(--uc-text-muted)]">
                    {new Date(entry.updatedAt).toLocaleDateString("en-GB")}
                  </span>
                ) : null}
              </div>

              {status === "needs-change" ? (
                <input
                  value={entry?.note ?? ""}
                  onChange={(event) => setNote(path, event.target.value)}
                  data-signoff-note={path}
                  className="mt-[10px] w-full rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[12px] py-[8px] text-[13px] leading-[18px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
                  placeholder="What needs to change? (visible in the export)"
                />
              ) : null}
            </div>
          );
        })}
        {visiblePaths.length === 0 ? (
          <p className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[16px] py-[24px] text-center text-[14px] text-[var(--uc-text-muted)]">
            No strings match the current filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}
