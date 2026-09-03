import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import { FLOW_DEFINITIONS, FLOW_ORDER } from "../flows";
import type { FlowDefinition, FlowPreviewId } from "../flows/types";

type ViewMode = "grid" | "table";

/** How many country chips are shown inline before collapsing into a "+N" pill. */
const VISIBLE_COUNTRIES = 4;

function stepCount(flow: FlowDefinition): number {
  const screens = new Set(flow.scenarios.flatMap((scenario) => scenario.steps.map((step) => step.screen)));
  return screens.size;
}

function scopeSummary(flow: FlowDefinition): string {
  return `${flow.scenarios.length} scenarios · ${stepCount(flow)} screens`;
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export default function FlowLibraryIndex({ onOpenFlow }: { onOpenFlow: (flowId: FlowPreviewId) => void }) {
  const [query, setQuery] = useState("");
  // Empty selection means "no filter applied" for both facets.
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [view, setView] = useState<ViewMode>("grid");

  const flows = useMemo(() => FLOW_ORDER.map((id) => FLOW_DEFINITIONS[id]), []);

  const countries = useMemo(
    () => Array.from(new Set(flows.flatMap((flow) => flow.countryScope))),
    [flows],
  );

  const domains = useMemo(() => Array.from(new Set(flows.map((flow) => flow.domain))), [flows]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return flows.filter((flow) => {
      if (selectedCountries.length > 0 && !selectedCountries.some((country) => flow.countryScope.includes(country as never)))
        return false;
      if (selectedDomains.length > 0 && !selectedDomains.includes(flow.domain)) return false;
      if (!normalizedQuery) return true;
      return [flow.title, flow.label, flow.summary, flow.domain, flow.countryScope.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [flows, query, selectedCountries, selectedDomains]);

  const hasFilters = query.trim().length > 0 || selectedCountries.length > 0 || selectedDomains.length > 0;

  return (
    <div className="grid gap-[24px]">
      <header className="max-w-[760px]">
        <h1 className="text-[34px] font-bold leading-[40px] text-[var(--uc-text)]">Future flows, spec-ready</h1>
        <p className="mt-[12px] uc-type-n4 text-[var(--uc-text-muted)]">
          Explore each journey visually, then use its clear screen-by-screen notes to align product, design and delivery.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-[10px]">
        <div className="flex h-[44px] min-w-[240px] flex-1 items-center gap-[10px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] shadow-sm focus-within:border-[var(--uc-action)]">
          <AppIcon name="search" size={18} color="var(--uc-text-muted)" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search flows"
            aria-label="Search flows"
            className="min-w-0 flex-1 bg-transparent uc-type-n4 text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)]"
          />
        </div>

        <MultiSelectFilter
          label="Category"
          allLabel="All categories"
          options={domains}
          selected={selectedDomains}
          onToggle={(value) => setSelectedDomains((current) => toggleValue(current, value))}
          onClear={() => setSelectedDomains([])}
        />
        <MultiSelectFilter
          label="Country"
          allLabel="All countries"
          options={countries}
          selected={selectedCountries}
          onToggle={(value) => setSelectedCountries((current) => toggleValue(current, value))}
          onClear={() => setSelectedCountries([])}
        />

        <ViewToggle view={view} onChange={setView} />
      </div>

      <div className="flex flex-wrap items-center gap-[10px]">
        <span className="uc-type-n5 text-[var(--uc-text-muted)]">
          {filtered.length} of {flows.length} flows
        </span>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCountries([]);
              setSelectedDomains([]);
            }}
            className="uc-type-n5-strong text-[var(--uc-action)] underline-offset-[3px] hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[24px] py-[48px] text-center">
          <p className="uc-type-n4-strong text-[var(--uc-text)]">No flows match these filters</p>
          <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">Clear the search or filters to see every flow.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((flow) => (
            <FlowCard key={flow.id} flow={flow} onOpen={() => onOpenFlow(flow.id)} />
          ))}
        </div>
      ) : (
        <FlowTable flows={filtered} onOpenFlow={onOpenFlow} />
      )}
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (next: ViewMode) => void }) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="flex h-[44px] items-center gap-[4px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[4px] shadow-sm"
    >
      {(["grid", "table"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          aria-pressed={view === mode}
          onClick={() => onChange(mode)}
          className={`h-[34px] rounded-[6px] px-[14px] uc-type-n5-strong capitalize transition-colors ${
            view === mode
              ? "bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
              : "text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface-muted)]"
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

/**
 * Compact dropdown facet: keeps the filter bar on a single row and lets several
 * values be active at once (empty selection = no filter).
 */
function MultiSelectFilter({
  label,
  allLabel,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  allLabel: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (options.length <= 1) return null;

  const summary =
    selected.length === 0 ? allLabel : selected.length === 1 ? selected[0] : `${selected.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-[44px] items-center gap-[8px] rounded-[8px] border bg-[var(--uc-surface)] px-[14px] shadow-sm transition-colors ${
          selected.length > 0 || open ? "border-[var(--uc-action)]" : "border-[var(--uc-border)]"
        }`}
      >
        <span className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{label}</span>
        <span className="uc-type-n5-strong text-[var(--uc-text)]">{summary}</span>
        <AppIcon name="chevron-down" size={16} color="var(--uc-text-muted)" />
      </button>

      {open ? (
        <div className="absolute left-0 top-[48px] z-20 min-w-[220px] rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[6px] shadow-lg">
          <button
            type="button"
            onClick={onClear}
            className="flex w-full items-center justify-between gap-[10px] rounded-[6px] px-[10px] py-[8px] text-left uc-type-n5-strong text-[var(--uc-text)] hover:bg-[var(--uc-surface-muted)]"
          >
            {allLabel}
            {selected.length === 0 ? <AppIcon name="check" size={16} color="var(--uc-action)" /> : null}
          </button>
          <div className="my-[4px] h-px bg-[var(--uc-border)]" />
          {options.map((option) => {
            const active = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => onToggle(option)}
                className="flex w-full items-center justify-between gap-[10px] rounded-[6px] px-[10px] py-[8px] text-left uc-type-n5 text-[var(--uc-text)] hover:bg-[var(--uc-surface-muted)]"
              >
                {option}
                {active ? <AppIcon name="check" size={16} color="var(--uc-action)" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function CategoryChip({ domain }: { domain: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-[6px] bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))] px-[8px] py-[3px] uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-action-strong)]">
      {domain}
    </span>
  );
}

function CountryChips({ countries }: { countries: readonly string[] }) {
  const visible = countries.slice(0, VISIBLE_COUNTRIES);
  const overflow = countries.length - visible.length;
  return (
    <span className="flex flex-wrap items-center gap-[6px]">
      {visible.map((country) => (
        <span
          key={country}
          className="rounded-[14px] bg-[var(--uc-surface-muted)] px-[8px] py-[3px] uc-type-n5-strong text-[var(--uc-text)]"
        >
          {country}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          title={countries.join(", ")}
          className="rounded-[14px] bg-[var(--uc-surface-muted)] px-[8px] py-[3px] uc-type-n5-strong text-[var(--uc-text-muted)]"
        >
          +{overflow}
        </span>
      ) : null}
    </span>
  );
}

function FlowCard({ flow, onOpen }: { flow: FlowDefinition; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] text-left shadow-sm transition-colors hover:border-[var(--uc-action)]"
    >
      <div className="flex items-center justify-between gap-[8px]">
        <CategoryChip domain={flow.domain} />
        <span className="uc-type-n5 text-[var(--uc-text-muted)]">{scopeSummary(flow)}</span>
      </div>
      <h3 className="mt-[12px] uc-type-h2 text-[var(--uc-text)]">{flow.title}</h3>
      <p className="mt-[10px] flex-1 uc-type-n5 text-[var(--uc-text-muted)]">{flow.summary}</p>
      <div className="mt-[16px] border-t border-[var(--uc-border)] pt-[12px]">
        <CountryChips countries={flow.countryScope} />
      </div>
    </button>
  );
}

function FlowTable({
  flows,
  onOpenFlow,
}: {
  flows: FlowDefinition[];
  onOpenFlow: (flowId: FlowPreviewId) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--uc-border)] bg-[var(--uc-surface-muted)]">
            <Th>Flow</Th>
            <Th>Category</Th>
            <Th>Countries</Th>
            <Th>Scope</Th>
          </tr>
        </thead>
        <tbody>
          {flows.map((flow) => (
            <tr
              key={flow.id}
              tabIndex={0}
              role="button"
              onClick={() => onOpenFlow(flow.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenFlow(flow.id);
                }
              }}
              className="cursor-pointer border-b border-[var(--uc-border)] transition-colors last:border-b-0 hover:bg-[var(--uc-surface-muted)] focus-visible:bg-[var(--uc-surface-muted)] focus-visible:outline-none"
            >
              <td className="px-[16px] py-[14px] align-top">
                <span className="block uc-type-n4-strong text-[var(--uc-text)]">{flow.title}</span>
                <span className="mt-[4px] block max-w-[520px] uc-type-n5 text-[var(--uc-text-muted)]">{flow.summary}</span>
              </td>
              <td className="px-[16px] py-[14px] align-top">
                <CategoryChip domain={flow.domain} />
              </td>
              <td className="min-w-[230px] px-[16px] py-[14px] align-top">
                <CountryChips countries={flow.countryScope} />
              </td>
              <td className="whitespace-nowrap px-[16px] py-[14px] align-top uc-type-n5 text-[var(--uc-text-muted)]">
                {scopeSummary(flow)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="px-[16px] py-[10px] uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
      {children}
    </th>
  );
}
