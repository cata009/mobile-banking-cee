/**
 * The frame every Design System specimen sits in: section wrappers, the search
 * field, the stat grid, the light/dark specimen surface, and the variant picker.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { useState } from "react";
import ThemeModeSegment from "@/app/components/ThemeModeSegment";
import { AppIcon } from "@/app/components/icons";
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview';
import { NativeDesignSystemPreview } from './NativeDesignSystemPreview';
import { getComponentMeta } from '@/app/registry/componentRegistry';
import type { ComponentId } from '@/app/state/demoTypes';

export type SelectorOption<Value extends string = string> = {
  id: Value;
  label: string;
};

export type ProductCardEvolutionVariant = "pi-default" | "pi-account-actions" | "pi-accordion" | "pi-open" | "sme-default" | "sme-accordion" | "sme-open";

export function Section({ id, title, description, children }: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="ds-section">
      <div className="ds-section-heading">
        <h2>{title}</h2>
        <p>
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
    <label className="mb-4 flex h-[48px] items-center gap-3 rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-4 focus-within:border-[var(--uc-action)]">
      <AppIcon name="search" color="var(--uc-text-muted)" />
      <span className="sr-only">{label}</span>
      <input
        aria-label={label}
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

export function Specimen({ name, source, children, tone = "light", showThemeControl = false, detailsHref, previewNote }: {
  name: string;
  source?: string;
  note?: string;
  children: React.ReactNode | ((themeMode: ThemeMode) => React.ReactNode);
  tone?: "light" | "dark" | "gray";
  specs?: string[];
  headerControl?: React.ReactNode;
  showThemeControl?: boolean;
  /**
   * When set, renders a "Details" link in the specimen header that deep-links
   * to the component detail page (hash: `#component/<id>`).
   */
  detailsHref?: string;
  previewNote?: string;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const isDark = themeMode === "dark";
  const bg = tone === "dark" ? "bg-[var(--uc-static-black)]" : "bg-transparent";
  const componentId = detailsHref?.startsWith('#component/') ? detailsHref.slice('#component/'.length) : undefined;
  const nativeDefinition = componentId ? getNativeDesignSystemPreview(componentId) : undefined;
  const meta = componentId ? getComponentMeta(componentId as ComponentId) : undefined;
  const renderedChildren = componentId && getNativeDesignSystemPreview(componentId)
    ? <NativeDesignSystemPreview componentId={componentId} themeMode={themeMode} />
    : typeof children === "function" ? children(themeMode) : children;

  return (
      <div
        className="ds-specimen"
        data-ds-specimen={name}
        data-ds-search={[name, componentId, source, meta?.componentPath].filter(Boolean).join(' ')}
      >
        <div className="ds-specimen-header">
            <div className="min-w-0">
              <h3>{name}</h3>
              <code className="ds-specimen-meta">{meta?.componentPath.split('/').pop() ?? source ?? 'Interactive specimen'}</code>
            </div>
              {detailsHref ? (
                <a
                  href={detailsHref}
                  className="ds-text-link shrink-0"
                >
                  Details
                  <AppIcon name="arrow-right" size={12} color="currentColor" />
                </a>
              ) : null}
            {showThemeControl && (
              <ThemeModeSegment value={themeMode} onChange={setThemeMode} ariaLabel={`${name} theme mode`} />
            )}
        </div>
        <div className={`${isDark ? "dark" : ""} ${bg} ds-specimen-body`}>
          {previewNote ? <p className="mb-5 text-[12px] leading-5 text-[var(--uc-text-muted)]">{previewNote}</p> : null}
          {renderedChildren}
      </div>
      <div className="ds-specimen-footer"><span className="ds-platform-label">{nativeDefinition ? 'React Native' : 'Web component'}</span><span>{nativeDefinition ? `${nativeDefinition.variants.length} variants · source mapped` : 'Live preview'}</span></div>
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
