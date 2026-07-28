import { useMemo, useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import { SelectionChip } from "@/app/screens/tools/toolsUi";
import { FLOW_DEFINITIONS, FLOW_ORDER } from "../flows";
import type { FlowDefinition, FlowPreviewId } from "../flows/types";

function stepCount(flow: FlowDefinition): number {
  const screens = new Set(flow.scenarios.flatMap((scenario) => scenario.steps.map((step) => step.screen)));
  return screens.size;
}

export default function FlowLibraryIndex({ onOpenFlow }: { onOpenFlow: (flowId: FlowPreviewId) => void }) {
  const [query, setQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  const flows = useMemo(() => FLOW_ORDER.map((id) => FLOW_DEFINITIONS[id]), []);

  const countries = useMemo(
    () => Array.from(new Set(flows.flatMap((flow) => flow.countryScope))),
    [flows],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return flows.filter((flow) => {
      if (countryFilter !== "all" && !flow.countryScope.includes(countryFilter as never)) return false;
      if (!normalizedQuery) return true;
      return [flow.title, flow.label, flow.summary, flow.domain, flow.countryScope.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [flows, query, countryFilter]);

  const groupedByDomain = useMemo(() => {
    const groups = new Map<string, FlowDefinition[]>();
    for (const flow of filtered) {
      const existing = groups.get(flow.domain) ?? [];
      existing.push(flow);
      groups.set(flow.domain, existing);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  return (
    <div className="grid gap-[24px]">
      <header className="max-w-[760px]">
        <h1 className="text-[34px] font-bold leading-[40px] text-[var(--uc-text)]">Future flows, spec-ready</h1>
        <p className="mt-[12px] uc-type-n4 text-[var(--uc-text-muted)]">
          Explore each journey visually, then use its clear screen-by-screen notes to align product, design and delivery.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-[12px]">
        <div className="flex h-[44px] min-w-[260px] flex-1 items-center gap-[10px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] shadow-sm focus-within:border-[var(--uc-action)]">
          <AppIcon name="search" size={18} color="var(--uc-text-muted)" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search flows"
            aria-label="Search flows"
            className="min-w-0 flex-1 bg-transparent uc-type-n4 text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-[16px]">
        {countries.length > 1 ? (
          <FacetGroup label="Country">
            <SelectionChip active={countryFilter === "all"} onClick={() => setCountryFilter("all")}>
              All
            </SelectionChip>
            {countries.map((country) => (
              <SelectionChip key={country} active={countryFilter === country} onClick={() => setCountryFilter(country)}>
                {country}
              </SelectionChip>
            ))}
          </FacetGroup>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[24px] py-[48px] text-center">
          <p className="uc-type-n4-strong text-[var(--uc-text)]">No flows match these filters</p>
          <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">Clear the search or filters to see every flow.</p>
        </div>
      ) : (
        groupedByDomain.map(([domain, domainFlows]) => (
          <section key={domain} className="grid gap-[12px]">
            <h2 className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{domain}</h2>
            <div className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-3">
              {domainFlows.map((flow) => (
                <FlowCard key={flow.id} flow={flow} onOpen={() => onOpenFlow(flow.id)} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function FacetGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <span className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{label}</span>
      {children}
    </div>
  );
}

function FlowCard({ flow, onOpen }: { flow: FlowDefinition; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] text-left shadow-sm transition-colors hover:border-[var(--uc-action)]"
    >
      <h3 className="uc-type-h2 text-[var(--uc-text)]">{flow.title}</h3>
      <p className="mt-[10px] flex-1 uc-type-n5 text-[var(--uc-text-muted)]">{flow.summary}</p>
      <div className="mt-[16px] flex flex-wrap items-center gap-[8px]">
        {flow.countryScope.map((country) => (
          <span key={country} className="rounded-[14px] bg-[var(--uc-surface-muted)] px-[10px] py-[4px] uc-type-n5-strong text-[var(--uc-text)]">
            {country}
          </span>
        ))}
        <span className="uc-type-n5 text-[var(--uc-text-muted)]">
          {flow.scenarios.length} scenarios · {stepCount(flow)} screens
        </span>
        <span className="ml-auto flex items-center gap-[4px] uc-type-n5-strong text-[var(--uc-action)]">
          Open
          <AppIcon name="chevron-link" size={18} color="currentColor" />
        </span>
      </div>
    </button>
  );
}
