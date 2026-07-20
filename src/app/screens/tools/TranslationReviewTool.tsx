/**
 * Translation review table.
 *
 * One translation namespace at a time, every key across all 14 language
 * columns. Localized strings that are much longer than the same country's
 * English baseline are flagged as overflow risks, and the whole namespace can
 * be exported as CSV for local-market review.
 */

import { useMemo, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { FieldLabel, SelectionChip, StatusBadge, ToolPanel, downloadTextFile } from "./toolsUi";
import {
  LANGUAGE_COLUMNS,
  TRANSLATION_NAMESPACES,
  buildTranslationCsv,
  getNamespaceLeafPaths,
  getTranslationValue,
  isOverflowRisk,
} from "./translationCorpus";

interface ReviewCell {
  columnId: string;
  value: string | undefined;
  risk: boolean;
}

interface ReviewRow {
  path: string;
  cells: ReviewCell[];
  hasRisk: boolean;
  hasMissing: boolean;
}

export function TranslationReviewTool() {
  const [namespace, setNamespace] = useState<string>(TRANSLATION_NAMESPACES[0] ?? "");
  const [query, setQuery] = useState("");
  const [risksOnly, setRisksOnly] = useState(false);

  const rows = useMemo<ReviewRow[]>(() => {
    return getNamespaceLeafPaths(namespace).map((path) => {
      const cells = LANGUAGE_COLUMNS.map<ReviewCell>((column) => {
        const value = getTranslationValue(column.country, column.language, path);
        const englishBaseline = getTranslationValue(column.country, "en", path);
        return {
          columnId: column.id,
          value,
          risk: !column.isEnglish && isOverflowRisk(value, englishBaseline),
        };
      });
      return {
        path,
        cells,
        hasRisk: cells.some((cell) => cell.risk),
        hasMissing: cells.some((cell) => cell.value === undefined),
      };
    });
  }, [namespace]);

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (risksOnly && !row.hasRisk && !row.hasMissing) return false;
      if (!normalizedQuery) return true;
      if (row.path.toLowerCase().includes(normalizedQuery)) return true;
      return row.cells.some((cell) => cell.value?.toLowerCase().includes(normalizedQuery));
    });
  }, [rows, query, risksOnly]);

  const riskCount = rows.filter((row) => row.hasRisk).length;
  const missingCount = rows.filter((row) => row.hasMissing).length;

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(
      `translations-${namespace}-${date}.csv`,
      buildTranslationCsv(namespace),
      "text/csv;charset=utf-8",
    );
  };

  return (
    <div className="grid gap-[20px]" data-tool-translation-review="true">
      <ToolPanel
        title="Namespace"
        action={
          <button
            type="button"
            onClick={handleExport}
            data-translation-review-export="true"
            className="flex items-center gap-[8px] rounded-[20px] bg-[var(--uc-surface-muted)] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
          >
            <AppIcon name="download" size={15} color="currentColor" />
            Export CSV
          </button>
        }
      >
        <div className="grid gap-[16px] lg:grid-cols-[260px_1fr_auto]">
          <div>
            <FieldLabel>Namespace</FieldLabel>
            <select
              value={namespace}
              onChange={(event) => setNamespace(event.target.value)}
              data-translation-review-namespace="true"
              className="uc-select mt-[8px] w-full rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] py-[9px] pl-[12px] text-[14px] leading-[18px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
            >
              {TRANSLATION_NAMESPACES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Filter</FieldLabel>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="uc-select mt-[8px] w-full rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] py-[9px] pl-[12px] text-[14px] leading-[18px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
              placeholder="Search key or text in any language…"
            />
          </div>

          <div>
            <FieldLabel>Show</FieldLabel>
            <div className="mt-[8px] flex gap-[8px]">
              <SelectionChip active={!risksOnly} onClick={() => setRisksOnly(false)}>
                All strings
              </SelectionChip>
              <SelectionChip active={risksOnly} onClick={() => setRisksOnly(true)}>
                Only risks
              </SelectionChip>
            </div>
          </div>
        </div>

        <div className="mt-[14px] flex flex-wrap items-center gap-[10px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">
          <span>
            {rows.length} keys · {visibleRows.length} shown
          </span>
          {riskCount > 0 ? <StatusBadge tone="warn">{`${riskCount} overflow risks`}</StatusBadge> : null}
          {missingCount > 0 ? <StatusBadge tone="risk">{`${missingCount} keys with missing values`}</StatusBadge> : null}
          {riskCount === 0 && missingCount === 0 ? <StatusBadge tone="ok">No risks detected</StatusBadge> : null}
        </div>
      </ToolPanel>

      <div className="max-h-[68vh] overflow-auto rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] shadow-sm">
        <table className="w-full min-w-max border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--uc-surface)] shadow-[inset_0_-1px_0_var(--uc-border)]">
              <th className="sticky left-0 z-20 min-w-[260px] bg-[var(--uc-surface)] px-[12px] py-[10px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)] shadow-[inset_-1px_0_0_var(--uc-border)]">
                Key
              </th>
              {LANGUAGE_COLUMNS.map((column) => (
                <th
                  key={column.id}
                  title={column.languageName}
                  className={`min-w-[170px] max-w-[260px] px-[12px] py-[10px] text-[11px] font-bold uppercase tracking-[0.04em] ${
                    column.isEnglish ? "text-[var(--uc-text-muted)]" : "text-[var(--uc-text)]"
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.path} className="border-b border-[var(--uc-border-muted)] last:border-b-0 hover:bg-[var(--uc-surface-muted)]">
                <td className="sticky left-0 z-10 min-w-[260px] max-w-[340px] break-all bg-[var(--uc-surface)] px-[12px] py-[8px] font-mono text-[11px] leading-[15px] text-[var(--uc-text)] shadow-[inset_-1px_0_0_var(--uc-border)]">
                  {row.path}
                </td>
                {row.cells.map((cell) => (
                  <td
                    key={cell.columnId}
                    title={cell.value}
                    className={`min-w-[170px] max-w-[260px] px-[12px] py-[8px] align-top text-[12px] leading-[17px] ${
                      cell.value === undefined
                        ? "font-bold text-[var(--uc-red-main)]"
                        : cell.risk
                          ? "bg-[color-mix(in_srgb,var(--uc-orange-main)_12%,var(--uc-surface))] text-[var(--uc-text)]"
                          : "text-[var(--uc-text)]"
                    }`}
                  >
                    {cell.value ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={LANGUAGE_COLUMNS.length + 1}
                  className="px-[12px] py-[24px] text-center text-[14px] text-[var(--uc-text-muted)]"
                >
                  No strings match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
