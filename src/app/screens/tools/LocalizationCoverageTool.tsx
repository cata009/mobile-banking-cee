/**
 * Localization coverage dashboard.
 *
 * Honest per-language completeness: every key is translated, inherited from
 * English, or missing. A reviewer picks a language to see the per-namespace
 * breakdown, so gaps are located rather than hidden behind one percentage.
 */

import { useMemo, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { ToolPanel, downloadTextFile } from "./toolsUi";
import {
  LOCAL_COLUMNS,
  buildCoverageCsv,
  languageCoverage,
  namespaceRowsForLanguage,
  translatedPct,
  type CoverageCounts,
} from "./localizationCoverage";

function CoverageBar({ counts, height = 8 }: { counts: CoverageCounts; height?: number }) {
  const total = Math.max(counts.total, 1);
  const translated = (counts.translated / total) * 100;
  const inherited = (counts.inherited / total) * 100;
  const missing = (counts.missing / total) * 100;
  return (
    <div className="flex w-full overflow-hidden rounded-full bg-[var(--uc-surface-muted)]" style={{ height }}>
      <div className="h-full bg-[var(--uc-green-status)]" style={{ width: `${translated}%` }} />
      <div className="h-full bg-[var(--uc-orange-main)]" style={{ width: `${inherited}%` }} />
      <div className="h-full bg-[var(--uc-red-main)]" style={{ width: `${missing}%` }} />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-[6px] text-[12px] leading-[15px] text-[var(--uc-text-muted)]">
      <span className="size-[10px] rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

export function LocalizationCoverageTool() {
  const summaries = useMemo(
    () => LOCAL_COLUMNS.map((column) => ({ column, counts: languageCoverage(column) })),
    [],
  );
  const [selectedId, setSelectedId] = useState<string>(LOCAL_COLUMNS[0]?.id ?? "");

  const selected = summaries.find((entry) => entry.column.id === selectedId) ?? summaries[0];
  const namespaceRows = useMemo(
    () => (selected ? namespaceRowsForLanguage(selected.column) : []),
    [selected],
  );

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`localization-coverage-${date}.csv`, buildCoverageCsv(), "text/csv;charset=utf-8");
  };

  if (!selected) return null;

  return (
    <div className="grid gap-[20px]" data-tool-localization-coverage="true">
      <ToolPanel
        title="Languages"
        action={
          <button
            type="button"
            onClick={handleExport}
            data-coverage-export="true"
            className="flex items-center gap-[8px] rounded-[20px] bg-[var(--uc-surface-muted)] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
          >
            <AppIcon name="download" size={15} color="currentColor" />
            Export CSV
          </button>
        }
      >
        <div className="mb-[14px] flex flex-wrap gap-[16px]">
          <LegendDot color="var(--uc-green-status)" label="Translated" />
          <LegendDot color="var(--uc-orange-main)" label="Inherited from English" />
          <LegendDot color="var(--uc-red-main)" label="Missing" />
        </div>

        <div className="grid gap-[8px]">
          {summaries.map(({ column, counts }) => {
            const active = column.id === selectedId;
            return (
              <button
                key={column.id}
                type="button"
                onClick={() => setSelectedId(column.id)}
                data-coverage-language={column.id}
                className={`grid grid-cols-[150px_1fr_auto] items-center gap-[12px] rounded-[8px] border px-[14px] py-[10px] text-left transition-colors ${
                  active
                    ? "border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_8%,var(--uc-surface))]"
                    : "border-[var(--uc-border)] bg-[var(--uc-surface)] hover:border-[var(--uc-action)]"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">
                    {column.languageName}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                    {column.label}
                  </span>
                </span>
                <CoverageBar counts={counts} />
                <span className="w-[54px] text-right text-[15px] font-bold leading-[18px] text-[var(--uc-text)]">
                  {translatedPct(counts)}%
                </span>
              </button>
            );
          })}
        </div>
      </ToolPanel>

      <ToolPanel title={`${selected.column.languageName} · by namespace`}>
        <div className="mb-[12px] flex flex-wrap gap-[16px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">
          <span>
            <span className="font-bold text-[var(--uc-text)]">{selected.counts.total}</span> keys
          </span>
          <span>
            <span className="font-bold text-[var(--uc-green-status)]">{selected.counts.translated}</span> translated
          </span>
          <span>
            <span className="font-bold text-[var(--uc-orange-main)]">{selected.counts.inherited}</span> inherited
          </span>
          <span>
            <span className="font-bold text-[var(--uc-red-main)]">{selected.counts.missing}</span> missing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left">
            <thead>
              <tr className="shadow-[inset_0_-1px_0_var(--uc-border)]">
                <th className="min-w-[160px] px-[10px] py-[8px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                  Namespace
                </th>
                <th className="min-w-[200px] px-[10px] py-[8px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                  Coverage
                </th>
                <th className="px-[10px] py-[8px] text-right text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                  Translated
                </th>
                <th className="px-[10px] py-[8px] text-right text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                  Inherited
                </th>
                <th className="px-[10px] py-[8px] text-right text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                  Missing
                </th>
                <th className="px-[10px] py-[8px] text-right text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {namespaceRows.map(({ namespace, counts }) => (
                <tr
                  key={namespace}
                  className="border-b border-[var(--uc-border-muted)] last:border-b-0 hover:bg-[var(--uc-surface-muted)]"
                >
                  <td className="px-[10px] py-[8px] font-mono text-[12px] leading-[16px] text-[var(--uc-text)]">
                    {namespace}
                  </td>
                  <td className="px-[10px] py-[8px]">
                    <CoverageBar counts={counts} height={6} />
                  </td>
                  <td className="px-[10px] py-[8px] text-right text-[12px] text-[var(--uc-text)]">{counts.translated}</td>
                  <td className="px-[10px] py-[8px] text-right text-[12px] text-[var(--uc-text)]">{counts.inherited}</td>
                  <td
                    className={`px-[10px] py-[8px] text-right text-[12px] ${
                      counts.missing > 0 ? "font-bold text-[var(--uc-red-main)]" : "text-[var(--uc-text)]"
                    }`}
                  >
                    {counts.missing}
                  </td>
                  <td className="px-[10px] py-[8px] text-right text-[12px] font-bold text-[var(--uc-text)]">
                    {translatedPct(counts)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ToolPanel>

      <p className="text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
        “Inherited from English” means the local value equals the English text — often a shared brand term, code, or a
        string not yet localized. It is a place to look, not automatically a defect. Use the sign-off tool to record a
        decision per string.
      </p>
    </div>
  );
}
