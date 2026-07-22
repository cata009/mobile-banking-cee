/**
 * Shared overview sections rendered under the "View" tab of a component detail
 * page. Currently holds the States (behavior) section, with the light/dark theme
 * control aligned top-right of the section header; state cards follow the chosen
 * theme.
 */
import ThemeModeSegment from "@/app/components/ThemeModeSegment";
import type { ComponentImplementationPackage as ImplementationPackageData } from "@/app/registry/componentImplementationPackages";
import { getComponentStatePreview } from "./componentStatePreviews";

type ThemeMode = "light" | "dark";

function ComponentStates({ componentId, data, themeMode }: { componentId: string; data: ImplementationPackageData; themeMode: ThemeMode }) {
  return (
    <div className="grid gap-3">
      {data.states.map((state) => {
        const preview = getComponentStatePreview(componentId, state.id);
        return (
          <article
            key={state.id}
            className="flex min-h-[148px] flex-col rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-4"
          >
            <div>
              <h3 className="text-[14px] font-bold text-[var(--uc-text)]">{state.label}</h3>
              <p className="mt-1 min-h-[36px] text-[12px] leading-[18px] text-[var(--uc-text-muted)]">{state.description}</p>
            </div>
            <div className="mt-auto pt-4">
              {preview ? (
                <div className={`${themeMode === "dark" ? "dark bg-[var(--uc-static-black)]" : "bg-[var(--uc-app-bg)]"} rounded-[8px] p-3`}>
                  {preview}
                </div>
              ) : (
                <div className="flex h-[48px] items-center justify-center rounded-[4px] border border-dashed border-[var(--uc-border)] px-4 text-center text-[12px] text-[var(--uc-text-muted)]">
                  Not part of the current public component contract.
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function ComponentOverviewSections({
  componentId,
  data,
  themeMode,
  onThemeModeChange,
}: {
  componentId: string;
  data: ImplementationPackageData;
  themeMode: ThemeMode;
  onThemeModeChange: (value: ThemeMode) => void;
}) {
  return (
    <div className="space-y-5" data-component-overview-sections="true">
      <section className="rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--uc-action)]">03 / Behavior</p>
            <h2 className="mt-1 text-[20px] font-bold leading-[26px] text-[var(--uc-text)]">States</h2>
          </div>
          <ThemeModeSegment value={themeMode} onChange={onThemeModeChange} ariaLabel={`${data.summary ? "Component" : "Component"} preview theme`} />
        </div>
        <div className="mt-4">
          <ComponentStates componentId={componentId} data={data} themeMode={themeMode} />
        </div>
      </section>
    </div>
  );
}
