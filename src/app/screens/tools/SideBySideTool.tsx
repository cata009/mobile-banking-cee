/**
 * Side-by-side country comparison.
 *
 * Renders the same demo screen for 2–4 countries as live, independent app
 * frames. Each frame is the real application loaded through the existing
 * deep-link system in frameless device mode (`frame=0`), so every screen,
 * theme, release and banking scenario behaves exactly like the main demo.
 */

import { useMemo, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import { COUNTRIES, COUNTRY_META } from "@/app/registry/demoConfig";
import { LOCAL_LANGUAGE_BY_COUNTRY } from "@/app/registry/languageByCountry";
import { ROUTE_POLICY, type RoutePolicy } from "@/app/navigation/routePolicy";
import { SCREEN_REGISTRY } from "@/app/registry/screenRegistry";
import type { Screen } from "@/app/contexts/NavigationContext";
import type { CountryId } from "@/app/state/demoTypes";
import { useDemo } from "@/app/state/demoStore";
import { FieldLabel, SelectionChip, ToolPanel } from "./toolsUi";

const MAX_COUNTRIES = 4;
const FRAME_WIDTH = 375;
const FRAME_HEIGHT = 812;

interface ScreenOption {
  screen: Screen;
  label: string;
}

function buildScreenOptions(): ScreenOption[] {
  const labelByRuntimeScreen = new Map<string, string>();
  for (const meta of Object.values(SCREEN_REGISTRY)) {
    if (meta.id.startsWith("pi.") && !labelByRuntimeScreen.has(meta.runtimeScreen)) {
      labelByRuntimeScreen.set(meta.runtimeScreen, meta.label);
    }
  }

  const options: ScreenOption[] = [];
  for (const [screen, policy] of Object.entries(ROUTE_POLICY) as Array<[Screen, RoutePolicy]>) {
    if (policy.surface === "platform") continue;
    if (!policy.deepLink.restorable) continue;
    // Screens that need an account/card payload are reachable by tapping
    // inside a frame; the selector only offers directly-restorable screens.
    if (policy.deepLink.payload !== "none") continue;
    options.push({ screen, label: labelByRuntimeScreen.get(screen) ?? screen });
  }
  return options;
}

export function SideBySideTool() {
  const { country: activeCountry } = useDemo();
  const screenOptions = useMemo(buildScreenOptions, []);

  const [selectedScreen, setSelectedScreen] = useState<Screen>("homepage");
  const [selectedCountries, setSelectedCountries] = useState<CountryId[]>(() => {
    const second = COUNTRIES.find((country) => country !== activeCountry);
    return second ? [activeCountry, second] : [activeCountry];
  });
  const [languageMode, setLanguageMode] = useState<"local" | "en">("local");
  const [frameNonce, setFrameNonce] = useState(0);

  const toggleCountry = (country: CountryId) => {
    setSelectedCountries((current) => {
      if (current.includes(country)) {
        // Allow removing any country, including the last one, so users can
        // rebuild the comparison in their preferred order.
        return current.filter((entry) => entry !== country);
      }
      return current.length >= MAX_COUNTRIES ? current : [...current, country];
    });
  };

  const orderedSelection = COUNTRIES.filter((country) => selectedCountries.includes(country));
  const scale = orderedSelection.length >= 4 ? 0.5 : orderedSelection.length === 3 ? 0.58 : 0.68;

  const frameLanguage = (country: CountryId) =>
    languageMode === "en" ? "en" : LOCAL_LANGUAGE_BY_COUNTRY[country];

  const buildFrameUrl = (country: CountryId) => {
    const url = new URL(window.location.href);
    url.hash = "";
    const params = url.searchParams;
    params.set("country", country);
    params.set("screen", selectedScreen);
    params.set("scenario", selectedScreen === "prelogin-inactive" ? "inactive" : "active");
    params.set("lang", frameLanguage(country));
    params.set("frame", "0");
    params.delete("account");
    params.delete("card");
    params.delete("flow");
    params.delete("access_token");
    return url.toString();
  };

  return (
    <div className="grid gap-[20px]" data-tool-side-by-side="true">
      <ToolPanel
        title="Comparison setup"
        action={
          <SelectionChip onClick={() => setFrameNonce((nonce) => nonce + 1)} title="Reset every frame to the selected screen">
            Reload frames
          </SelectionChip>
        }
      >
        <div className="grid gap-[16px]">
          <div>
            <FieldLabel>Countries (2–4)</FieldLabel>
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              {COUNTRIES.map((country) => {
                const active = selectedCountries.includes(country);
                const atCapacity = !active && selectedCountries.length >= MAX_COUNTRIES;
                return (
                  <SelectionChip
                    key={country}
                    active={active}
                    disabled={atCapacity}
                    onClick={() => toggleCountry(country)}
                    title={COUNTRY_META[country].name}
                  >
                    {COUNTRY_META[country].name}
                  </SelectionChip>
                );
              })}
            </div>
          </div>

          <div className="grid gap-[16px] sm:grid-cols-2">
            <div>
              <FieldLabel>Screen</FieldLabel>
              <select
                value={selectedScreen}
                onChange={(event) => setSelectedScreen(event.target.value as Screen)}
                className="uc-select mt-[8px] w-full cursor-pointer rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] py-[8px] pl-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
              >
                {screenOptions.map((option) => (
                  <option key={option.screen} value={option.screen}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Language</FieldLabel>
              <select
                value={languageMode}
                onChange={(event) => setLanguageMode(event.target.value as "local" | "en")}
                className="uc-select mt-[8px] w-full cursor-pointer rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] py-[8px] pl-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
              >
                <option value="local">Local language</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="mt-[8px] flex flex-wrap items-start justify-center gap-[24px]">
            {orderedSelection.map((country) => {
              const url = buildFrameUrl(country);
              return (
                <div key={country} className="min-w-0" data-side-by-side-frame={country}>
                  <div className="flex items-center justify-between gap-[8px] pb-[8px]" style={{ width: FRAME_WIDTH * scale + 8 }}>
                    <div className="min-w-0">
                      <span className="block truncate text-[13px] font-bold leading-[16px] text-[var(--uc-text)]">
                        {COUNTRY_META[country].name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCountry(country)}
                      title={`Remove ${COUNTRY_META[country].name} from comparison`}
                      aria-label={`Remove ${COUNTRY_META[country].name} from comparison`}
                      className="grid size-[28px] shrink-0 place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] transition-colors hover:border-[var(--uc-status-red)] hover:text-[var(--uc-status-red)]"
                    >
                      <AppIcon name="close-x" size={14} color="currentColor" />
                    </button>
                  </div>
                  <div
                    className="scrollbar-hide overflow-hidden rounded-[28px] bg-[var(--uc-static-black)] p-[4px] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35)]"
                    style={{ width: FRAME_WIDTH * scale + 8, height: FRAME_HEIGHT * scale + 8 }}
                  >
                    <div
                      className="scrollbar-hide overflow-hidden rounded-[24px]"
                      style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}
                    >
                      <iframe
                        key={`${country}-${frameNonce}`}
                        title={`${COUNTRY_META[country].name} preview`}
                        src={url}
                        scrolling="no"
                        className="scrollbar-hide origin-top-left border-0"
                        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, transform: `scale(${scale})` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {Array.from({ length: Math.max(0, MAX_COUNTRIES - orderedSelection.length) }).map((_, index) => {
              const nextCountry = COUNTRIES.find((country) => !orderedSelection.includes(country));
              if (!nextCountry) return null;
              return (
                <div key={`empty-slot-${index}`} className="min-w-0" data-side-by-side-empty-slot={index}>
                  <div
                    className="flex items-center justify-between gap-[8px] pb-[8px]"
                    style={{ width: FRAME_WIDTH * scale + 8 }}
                    aria-hidden="true"
                  >
                    <span className="text-[13px] font-bold leading-[16px] text-transparent">Empty slot</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCountry(nextCountry)}
                    title={`Add ${COUNTRY_META[nextCountry].name} to comparison`}
                    className="flex flex-col items-center justify-center rounded-[28px] border-[2px] border-dashed border-[var(--uc-border-strong,var(--uc-border))] bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)] transition-colors hover:border-[var(--uc-action)] hover:text-[var(--uc-action)]"
                    style={{ width: FRAME_WIDTH * scale + 8, height: FRAME_HEIGHT * scale + 8, paddingTop: 40, paddingBottom: 40 }}
                  >
                    <span className="grid size-[40px] place-items-center rounded-full border-[2px] border-dashed border-current">
                      <AppIcon name="add-circle" size={20} color="currentColor" />
                    </span>
                    <span className="mt-[10px] text-[12px] font-bold uppercase tracking-[0.04em]">
                      Add country
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </ToolPanel>
    </div>
  );
}
