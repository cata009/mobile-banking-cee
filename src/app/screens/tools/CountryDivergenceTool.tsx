/**
 * Country divergence explorer.
 *
 * A matrix of every dimension that varies across the 8 CEE countries, with
 * divergent cells highlighted against either the majority value or a chosen
 * reference country. "Only differences" hides the rows where every country
 * agrees, so what is left is exactly what makes each market special.
 */

import { Fragment, useMemo, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { COUNTRIES, COUNTRY_META } from "@/app/registry/demoConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { FieldLabel, SelectionChip, StatusBadge, ToolPanel, downloadTextFile } from "./toolsUi";
import {
  buildDivergenceCsv,
  computeDivergenceRows,
  divergenceCountByCountry,
  isCellDivergent,
  rowHasDivergence,
  type DivergenceCell,
  type DivergenceRow,
} from "./countryDivergence";

function CellContent({ cell }: { cell: DivergenceCell }) {
  if (cell.kind === "yes") {
    return <span className="font-bold text-[var(--uc-green-status)]">Yes</span>;
  }
  if (cell.kind === "no") {
    return <span className="text-[var(--uc-text-muted)]">—</span>;
  }
  return <span className="text-[var(--uc-text)]">{cell.display}</span>;
}

export function CountryDivergenceTool() {
  const rows = useMemo(() => computeDivergenceRows(), []);
  const [differencesOnly, setDifferencesOnly] = useState(true);
  const [reference, setReference] = useState<CountryId | "">("");

  const referenceCountry = reference === "" ? null : reference;

  const visibleRows = useMemo(
    () => rows.filter((row) => !differencesOnly || rowHasDivergence(row, referenceCountry)),
    [rows, differencesOnly, referenceCountry],
  );

  const divergenceCounts = useMemo(
    () => divergenceCountByCountry(rows, referenceCountry),
    [rows, referenceCountry],
  );

  const groupedRows = useMemo(() => {
    const groups: Array<{ category: string; rows: DivergenceRow[] }> = [];
    for (const row of visibleRows) {
      const last = groups[groups.length - 1];
      if (last && last.category === row.category) last.rows.push(row);
      else groups.push({ category: row.category, rows: [row] });
    }
    return groups;
  }, [visibleRows]);

  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadTextFile(`country-divergence-${date}.csv`, buildDivergenceCsv(rows), "text/csv;charset=utf-8");
  };

  const columnCount = COUNTRIES.length + 1;

  return (
    <div className="grid gap-[20px]" data-tool-country-divergence="true">
      <ToolPanel
        title="Comparison setup"
        action={
          <button
            type="button"
            onClick={handleExport}
            data-divergence-export="true"
            className="flex items-center gap-[8px] rounded-[20px] bg-[var(--uc-surface-muted)] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
          >
            <AppIcon name="download" size={15} color="currentColor" />
            Export CSV
          </button>
        }
      >
        <div className="grid gap-[16px] sm:grid-cols-[260px_1fr]">
          <div>
            <FieldLabel>Compare against</FieldLabel>
            <select
              value={reference}
              onChange={(event) => setReference(event.target.value as CountryId | "")}
              data-divergence-reference="true"
              className="uc-select mt-[8px] w-full cursor-pointer rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] py-[8px] pl-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
            >
              <option value="">Majority value</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {COUNTRY_META[country].name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>Rows</FieldLabel>
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              <SelectionChip active={differencesOnly} onClick={() => setDifferencesOnly(true)}>
                Only differences
              </SelectionChip>
              <SelectionChip active={!differencesOnly} onClick={() => setDifferencesOnly(false)}>
                All dimensions
              </SelectionChip>
            </div>
          </div>
        </div>

        <div className="mt-[16px]">
          <FieldLabel>{referenceCountry ? `Divergences vs ${COUNTRY_META[referenceCountry].name}` : "Divergences vs majority"}</FieldLabel>
          <div className="mt-[8px] flex flex-wrap gap-[8px]">
            {COUNTRIES.map((country) => {
              const count = divergenceCounts[country];
              const isReference = country === referenceCountry;
              return (
                <span
                  key={country}
                  className={`flex items-center gap-[6px] rounded-[10px] border px-[10px] py-[6px] text-[12px] leading-[15px] ${
                    isReference
                      ? "border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] text-[var(--uc-action)]"
                      : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
                  }`}
                >
                  <span className="font-bold">{country}</span>
                  {isReference ? (
                    <StatusBadge tone="ok">reference</StatusBadge>
                  ) : (
                    <span className="text-[var(--uc-text-muted)]">{count}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </ToolPanel>

      <div className="overflow-x-auto rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] shadow-sm">
        <table className="w-full min-w-max border-collapse text-left">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--uc-surface)] shadow-[inset_0_-1px_0_var(--uc-border)]">
              <th className="sticky left-0 z-20 min-w-[220px] bg-[var(--uc-surface)] px-[12px] py-[10px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)] shadow-[inset_-1px_0_0_var(--uc-border)]">
                Dimension
              </th>
              {COUNTRIES.map((country) => (
                <th
                  key={country}
                  title={COUNTRY_META[country].name}
                  className={`min-w-[92px] px-[12px] py-[10px] text-center text-[11px] font-bold uppercase tracking-[0.04em] ${
                    country === referenceCountry ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]"
                  }`}
                >
                  {country}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedRows.map((group) => (
              <Fragment key={group.category}>
                <tr className="bg-[var(--uc-surface-muted)]">
                  <td
                    colSpan={columnCount}
                    className="sticky left-0 px-[12px] py-[6px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]"
                  >
                    {group.category}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--uc-border-muted)] last:border-b-0 hover:bg-[var(--uc-surface-muted)]"
                  >
                    <td
                      title={row.hint}
                      className="sticky left-0 z-[1] min-w-[220px] max-w-[300px] bg-[var(--uc-surface)] px-[12px] py-[9px] text-[13px] leading-[17px] text-[var(--uc-text)] shadow-[inset_-1px_0_0_var(--uc-border)]"
                    >
                      {row.label}
                    </td>
                    {COUNTRIES.map((country) => {
                      const divergent = isCellDivergent(row, country, referenceCountry);
                      return (
                        <td
                          key={country}
                          className={`px-[12px] py-[9px] text-center text-[12px] leading-[16px] ${
                            divergent
                              ? "bg-[color-mix(in_srgb,var(--uc-orange-main)_14%,var(--uc-surface))]"
                              : ""
                          }`}
                        >
                          <CellContent cell={row.values[country]} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-[12px] py-[24px] text-center text-[14px] text-[var(--uc-text-muted)]">
                  Every dimension is identical across all countries.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
        Feature rows show country <em>scope</em> for PI on the current design system — a feature also needs its
        matching release and an active scenario to actually render. Highlighted cells differ from the
        {referenceCountry ? ` ${COUNTRY_META[referenceCountry].name}` : " majority"} value.
      </p>
    </div>
  );
}
