/**
 * Component translation tester.
 *
 * Pick a design-system component and a text slot, then stress it with custom
 * copy or with the real translations across all 14 language columns. Each
 * specimen is measured after layout: horizontal overflow and extra wrap height
 * are flagged so truncation problems are visible at a glance.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FieldLabel, SelectionChip, StatusBadge, ToolPanel } from "./toolsUi";
import {
  TESTABLE_COMPONENTS,
  type SpecimenContainer,
  type TestableComponentMeta,
} from "./testableComponents";
import {
  LANGUAGE_COLUMNS,
  findLongestValue,
  getAllLeafPaths,
  getTranslationValue,
} from "./translationCorpus";

interface SpecimenMetrics {
  height: number;
  hasOverflow: boolean;
}

const TEXT_PRESETS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Short", value: "OK" },
  { label: "Long", value: "Temporarily unavailable while we finish scheduled maintenance work" },
  {
    label: "Very long",
    value:
      "This label is intentionally far too long so you can immediately see how the component truncates, wraps or pushes its neighbouring elements out of alignment",
  },
];

function SpecimenSurface({ container, children }: { container: SpecimenContainer; children: ReactNode }) {
  if (container === "screen") {
    return <div className="w-[375px] overflow-hidden bg-[var(--uc-surface)]">{children}</div>;
  }
  if (container === "card") {
    return (
      <div className="w-[375px] bg-[var(--uc-app-bg)] px-[16px] py-[16px]">
        <div className="rounded-[8px] bg-[var(--uc-surface)] px-[16px] py-[8px] shadow-sm">{children}</div>
      </div>
    );
  }
  return <div className="w-[375px] bg-[var(--uc-app-bg)] px-[16px] py-[16px]">{children}</div>;
}

function MeasuredSpecimen({
  measureKey,
  signature,
  onMetrics,
  children,
}: {
  measureKey: string;
  /**
   * Content signature (component + slot + text). Measurement re-runs ONLY when
   * this changes — never on unrelated parent re-renders — so a metrics update
   * can never re-trigger measurement and loop.
   */
  signature: string;
  onMetrics: (key: string, metrics: SpecimenMetrics) => void;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      const root = rootRef.current;
      if (!root || cancelled) return;
      const nodes = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
      const hasOverflow = nodes.some((element) => element.scrollWidth - element.clientWidth > 1);
      onMetrics(measureKey, { height: root.getBoundingClientRect().height, hasOverflow });
    };

    measure();
    const frame = window.requestAnimationFrame(measure);
    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [measureKey, signature, onMetrics]);

  return <div ref={rootRef}>{children}</div>;
}

function specimenBadge(metrics: SpecimenMetrics | undefined, minHeight: number | null): ReactNode {
  if (!metrics) return null;
  if (metrics.hasOverflow) return <StatusBadge tone="risk">Overflow</StatusBadge>;
  if (minHeight !== null && metrics.height - minHeight > 2) {
    return <StatusBadge tone="warn">{`Wraps +${Math.round(metrics.height - minHeight)}px`}</StatusBadge>;
  }
  return <StatusBadge tone="ok">OK</StatusBadge>;
}

export function TranslationTesterTool() {
  const [componentId, setComponentId] = useState<string>(TESTABLE_COMPONENTS[0]?.id ?? "");
  const component: TestableComponentMeta | undefined = TESTABLE_COMPONENTS.find(
    (entry) => entry.id === componentId,
  );

  const [activeSlotId, setActiveSlotId] = useState<string>(component?.slots[0]?.id ?? "");
  const [mode, setMode] = useState<"custom" | "key">("custom");
  const [customText, setCustomText] = useState<string>(component?.slots[0]?.defaultText ?? "");
  const [keyQuery, setKeyQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [worstColumnId, setWorstColumnId] = useState<string | null>(null);
  const [metricsByKey, setMetricsByKey] = useState<Record<string, SpecimenMetrics>>({});

  const activeSlot = component?.slots.find((slot) => slot.id === activeSlotId) ?? component?.slots[0];

  // Realistic per-component character caps. Only applied to single-line button
  // labels (PrimaryButton) where long copy fundamentally breaks the layout;
  // multi-line components (NavigationRow, banners, SectionHeadingDivider) are
  // bounded visually via line-clamp in the components themselves, not here.
  const SLOT_MAX_LENGTH: Record<string, number> = {
    "primary-button": 40,
  };
  const slotMaxLength = component?.id ? SLOT_MAX_LENGTH[component.id] : undefined;

  const selectComponent = (id: string) => {
    const nextComponent = TESTABLE_COMPONENTS.find((entry) => entry.id === id);
    setComponentId(id);
    const nextSlot = nextComponent?.slots[0];
    setActiveSlotId(nextSlot?.id ?? "");
    setCustomText(nextSlot?.defaultText ?? "");
    setWorstColumnId(null);
  };

  const selectSlot = (slotId: string) => {
    setActiveSlotId(slotId);
    const slot = component?.slots.find((entry) => entry.id === slotId);
    if (mode === "custom") setCustomText(slot?.defaultText ?? "");
    setWorstColumnId(null);
  };

  useEffect(() => {
    setMetricsByKey({});
  }, [componentId, activeSlotId, mode, customText, selectedKey]);

  const handleMetrics = useCallback((key: string, metrics: SpecimenMetrics) => {
    setMetricsByKey((current) => {
      const existing = current[key];
      if (existing && existing.height === metrics.height && existing.hasOverflow === metrics.hasOverflow) {
        return current;
      }
      return { ...current, [key]: metrics };
    });
  }, []);

  const filteredKeys = useMemo(() => {
    const query = keyQuery.trim().toLowerCase();
    if (query.length < 2) return [];
    return getAllLeafPaths()
      .filter((path) => path.toLowerCase().includes(query))
      .slice(0, 30);
  }, [keyQuery]);

  const renderTexts = (slotValue: string): Record<string, string> => {
    const texts: Record<string, string> = {};
    for (const slot of component?.slots ?? []) {
      texts[slot.id] = slot.id === activeSlot?.id ? slotValue : slot.defaultText;
    }
    return texts;
  };

  const gridMetrics = LANGUAGE_COLUMNS.map((column) => metricsByKey[column.id]).filter(
    (metrics): metrics is SpecimenMetrics => Boolean(metrics),
  );
  const minGridHeight = gridMetrics.length > 0 ? Math.min(...gridMetrics.map((metrics) => metrics.height)) : null;

  const handleWorstCase = () => {
    if (!selectedKey) return;
    const worst = findLongestValue(selectedKey);
    if (!worst) return;
    setWorstColumnId(worst.column.id);
    document
      .getElementById(`translation-specimen-${worst.column.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const worstInfo = selectedKey ? findLongestValue(selectedKey) : null;

  if (!component || !activeSlot) return null;

  return (
    <div className="grid gap-[20px] xl:grid-cols-[320px_1fr]" data-tool-translation-tester="true">
      <div className="grid content-start gap-[20px]">
        <ToolPanel title="Component">
          <select
            value={componentId}
            onChange={(event) => selectComponent(event.target.value)}
            data-testable-component-select="true"
            className="uc-select w-full cursor-pointer rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] py-[8px] pl-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
          >
            {TESTABLE_COMPONENTS.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label}
              </option>
            ))}
          </select>
          <p className="mt-[8px] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
            {component?.description}
          </p>

          {component.slots.length > 1 ? (
            <div className="mt-[16px]">
              <FieldLabel>Text slot</FieldLabel>
              <div className="mt-[8px] flex flex-wrap gap-[8px]">
                {component.slots.map((slot) => (
                  <SelectionChip key={slot.id} active={slot.id === activeSlot.id} onClick={() => selectSlot(slot.id)}>
                    {slot.label}
                  </SelectionChip>
                ))}
              </div>
            </div>
          ) : null}
        </ToolPanel>

        <ToolPanel title="Text source">
          <div className="flex flex-wrap gap-[8px]">
            <SelectionChip active={mode === "custom"} onClick={() => setMode("custom")}>
              Custom text
            </SelectionChip>
            <SelectionChip active={mode === "key"} onClick={() => setMode("key")}>
              Translation key
            </SelectionChip>
          </div>

          {mode === "custom" ? (
            <div className="mt-[16px] grid gap-[10px]">
              <textarea
                value={customText}
                onChange={(event) => setCustomText(event.target.value)}
                rows={3}
                maxLength={slotMaxLength ?? undefined}
                data-tester-custom-text="true"
                className="w-full resize-y rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[12px] py-[10px] text-[14px] leading-[20px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
                placeholder={`Text for “${activeSlot.label}”`}
              />
              <div className="flex flex-wrap gap-[8px]">
                {TEXT_PRESETS.map((preset) => (
                  <SelectionChip key={preset.label} onClick={() => setCustomText(preset.value)}>
                    {preset.label}
                  </SelectionChip>
                ))}
              </div>
              <p className="text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
                {customText.length} characters{slotMaxLength ? ` · max ${slotMaxLength}` : ""}
              </p>
            </div>
          ) : (
            <div className="mt-[16px] grid gap-[10px]">
              <input
                value={keyQuery}
                onChange={(event) => setKeyQuery(event.target.value)}
                data-tester-key-search="true"
                className="w-full rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[12px] py-[10px] text-[13px] leading-[18px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
                placeholder="Search a translation key (min. 2 characters)…"
              />
              {selectedKey ? (
                <div className="rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[12px] py-[8px]">
                  <p className="break-all font-mono text-[11px] leading-[15px] text-[var(--uc-text)]">{selectedKey}</p>
                  {worstInfo ? (
                    <p className="mt-[4px] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                      Longest: {worstInfo.column.label} · {worstInfo.value.length} chars
                    </p>
                  ) : null}
                </div>
              ) : null}
              {filteredKeys.length > 0 ? (
                <div className="max-h-[240px] overflow-y-auto rounded-[6px] border border-[var(--uc-border)]">
                  {filteredKeys.map((path) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => {
                        setSelectedKey(path);
                        setKeyQuery(path);
                        setWorstColumnId(null);
                      }}
                      className="block w-full border-b border-[var(--uc-border-muted)] px-[12px] py-[8px] text-left last:border-b-0 hover:bg-[var(--uc-surface-muted)]"
                    >
                      <span className="block break-all font-mono text-[11px] leading-[15px] text-[var(--uc-text)]">
                        {path}
                      </span>
                      <span className="mt-[2px] block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                        {getTranslationValue("RO", "en", path) ?? ""}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
              <SelectionChip
                disabled={!selectedKey}
                onClick={handleWorstCase}
                title={selectedKey ? "Jump to the longest real translation" : "Pick a translation key first"}
              >
                Worst case
              </SelectionChip>
            </div>
          )}
        </ToolPanel>
      </div>

      <ToolPanel title={mode === "custom" ? "Preview · 375px" : "All languages · 375px"}>
        {mode === "custom" ? (
          <div className="inline-block overflow-hidden rounded-[8px] border border-[var(--uc-border)]">
            <div className="flex items-center justify-between gap-[12px] border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)] px-[12px] py-[8px]">
              <span className="text-[12px] font-bold leading-[16px] text-[var(--uc-text)]">
                Custom · {customText.length} chars
              </span>
              {specimenBadge(metricsByKey.custom, null)}
            </div>
            <MeasuredSpecimen
              measureKey="custom"
              signature={`${componentId}:${activeSlot.id}:${customText}`}
              onMetrics={handleMetrics}
            >
              <SpecimenSurface container={component.container}>
                {component.render(renderTexts(customText))}
              </SpecimenSurface>
            </MeasuredSpecimen>
          </div>
        ) : selectedKey ? (
          <div className="flex flex-wrap gap-[16px]">
            {LANGUAGE_COLUMNS.map((column) => {
              const value = getTranslationValue(column.country, column.language, selectedKey);
              const missing = value === undefined;
              const isWorst = worstColumnId === column.id;
              return (
                <div
                  key={column.id}
                  id={`translation-specimen-${column.id}`}
                  data-translation-specimen={column.id}
                  className={`overflow-hidden rounded-[8px] border transition-shadow ${
                    isWorst
                      ? "border-[var(--uc-action)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--uc-action)_30%,transparent)]"
                      : "border-[var(--uc-border)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-[12px] border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)] px-[12px] py-[8px]">
                    <span className="min-w-0 truncate text-[12px] font-bold leading-[16px] text-[var(--uc-text)]">
                      {column.label}
                      <span className="ml-[6px] font-normal text-[var(--uc-text-muted)]">
                        {missing ? "missing" : `${value.length} chars`}
                      </span>
                    </span>
                    {missing ? (
                      <StatusBadge tone="risk">Missing</StatusBadge>
                    ) : (
                      specimenBadge(metricsByKey[column.id], minGridHeight)
                    )}
                  </div>
                  <MeasuredSpecimen
                    measureKey={column.id}
                    signature={`${componentId}:${activeSlot.id}:${selectedKey}:${value ?? ""}`}
                    onMetrics={handleMetrics}
                  >
                    <SpecimenSurface container={component.container}>
                      {component.render(renderTexts(value ?? ""))}
                    </SpecimenSurface>
                  </MeasuredSpecimen>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[14px] leading-[20px] text-[var(--uc-text-muted)]">
            Search and select a translation key to render this component with the real copy of every language.
          </p>
        )}
      </ToolPanel>
    </div>
  );
}
