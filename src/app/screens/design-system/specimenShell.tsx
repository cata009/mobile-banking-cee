/**
 * The frame every Design System specimen sits in: section wrappers, the search
 * field, the stat grid, the light/dark specimen surface, and the variant picker.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { useState } from "react";
import ThemeModeSegment from "@/app/components/ThemeModeSegment";
import { AppIcon } from "@/app/components/icons";
import { MeasurementSurface } from "./inspect/MeasurementSurface";

export type SelectorOption<Value extends string = string> = {
  id: Value;
  label: string;
};

export type ProductCardEvolutionVariant = "pi-default" | "pi-accordion" | "pi-open" | "sme-default" | "sme-accordion" | "sme-open";

export function Section({ id, title, description, children }: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 pb-8 pt-0">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="font-['UniCredit:Bold',sans-serif] text-[28px] text-[var(--uc-text)]">{title}</h2>
        <p className="max-w-[860px] font-['UniCredit:Regular',sans-serif] text-[15px] leading-6 text-[var(--uc-text-muted)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

export function InventorySearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="mb-4 flex h-[44px] items-center gap-2 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-3">
      <AppIcon name="search" color="var(--uc-text-muted)" />
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent font-['UniCredit:Regular',sans-serif] text-[14px] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="grid size-[28px] place-items-center text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <AppIcon name="clear-results" color="currentColor" />
        </button>
      ) : null}
    </label>
  );
}

export function InventoryStatGrid({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <div className="mb-5 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
          <p className="text-[12px] uppercase text-[var(--uc-text-muted)]">{label}</p>
          <p className="mt-1 font-['UniCredit:Bold',sans-serif] text-[26px] leading-none text-[var(--uc-text)]">{value}</p>
        </div>
      ))}
    </div>
  );
}

export type ThemeMode = "light" | "dark";

export function Specimen({ name, children, tone = "light", showThemeControl = true }: {
  name: string;
  source?: string;
  note?: string;
  children: React.ReactNode | ((themeMode: ThemeMode) => React.ReactNode);
  tone?: "light" | "dark" | "gray";
  specs?: string[];
  headerControl?: React.ReactNode;
  showThemeControl?: boolean;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const isDark = themeMode === "dark";
  const bg = tone === "dark" ? "bg-[var(--uc-static-black)]" : "bg-transparent";
  const renderedChildren = typeof children === "function" ? children(themeMode) : children;

  return (
      <div className="overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
        <div className="border-b border-[var(--uc-border-muted)] px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="uc-type-n4-strong text-[var(--uc-text)]">{name}</h3>
            {showThemeControl && (
              <ThemeModeSegment value={themeMode} onChange={setThemeMode} ariaLabel={`${name} theme mode`} />
            )}
          </div>
        </div>
        <div className={`${isDark ? "dark" : ""} ${bg} relative p-5`}>
          <MeasurementSurface>
            {renderedChildren}
        </MeasurementSurface>
      </div>
    </div>
  );
}

export function VariantSelector<Value extends string>({
  id,
  label = "Variant",
  value,
  options,
  onChange,
  extras,
}: {
  id: string;
  label?: string;
  value: Value;
  options: readonly SelectorOption<Value>[];
  onChange: (value: Value) => void;
  extras?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => {
          const selectedOption = options.find((option) => option.id === event.target.value);
          if (selectedOption) onChange(selectedOption.id);
        }}
        className="uc-select h-[36px] min-w-[210px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] pl-3 text-[14px] text-[var(--uc-text)]"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {extras}
    </div>
  );
}
