/**
 * Side-by-side country comparison.
 *
 * Renders the same demo screen for 2–3 countries as live, independent app
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

const MAX_COUNTRIES = 3;
const FRAME_WIDTH = 375;
const FRAME_HEIGHT = 812;
const FOCUS_SCALE = 0.88;

interface ScreenOption {
  screen: Screen;
  label: string;
}

type ComparisonRelease = "release-current" | "release-future-evo-2027";

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
  const [selectedRelease, setSelectedRelease] = useState<ComparisonRelease>(() =>
    new URL(window.location.href).searchParams.get("release") === "release-future-evo-2027"
      ? "release-future-evo-2027"
      : "release-current",
  );
  const [selectedCountries, setSelectedCountries] = useState<CountryId[]>(() => {
    const second = COUNTRIES.find((country) => country !== activeCountry);
    return second ? [activeCountry, second] : [activeCountry];
  });
  const [languageMode, setLanguageMode] = useState<"local" | "en">("local");
  const [frameNonce, setFrameNonce] = useState(0);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

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
  const scale = orderedSelection.length === 3 ? 0.58 : orderedSelection.length === 2 ? 0.84 : 0.9;

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
    params.set("release", selectedRelease);
    params.delete("account");
    params.delete("card");
    params.delete("flow");
    params.delete("access_token");
    return url.toString();
  };

  return (
    <>
    <div className="grid gap-[20px]" data-tool-side-by-side="true">
      <ToolPanel
        title="Comparison setup"
        action={
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => setIsFocusModeOpen(true)}
              disabled={orderedSelection.length !== 2}
              title="Open the two selected countries in focus mode"
              aria-label="Open focused comparison"
              className="grid size-[36px] shrink-0 place-items-center rounded-full bg-[var(--uc-action)] text-[var(--uc-static-white)] shadow-sm transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <AppIcon name="play" size={16} color="currentColor" />
            </button>
            <button
              type="button"
              onClick={() => setFrameNonce((nonce) => nonce + 1)}
              title="Reset every frame to the selected screen"
              aria-label="Reload frames"
              className="grid size-[32px] shrink-0 place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] transition-colors hover:border-[var(--uc-action)] hover:text-[var(--uc-action)]"
            >
              <AppIcon name="refresh" size={16} color="currentColor" />
            </button>
          </div>
        }
      >
        <div className="grid gap-[16px]">
          <div>
            <div className="flex flex-wrap gap-[8px]">
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

          <div className="grid gap-[16px] sm:grid-cols-3">
            <div>
              <FieldLabel>App version</FieldLabel>
              <select
                aria-label="App version"
                value={selectedRelease}
                onChange={(event) => setSelectedRelease(event.target.value as ComparisonRelease)}
                className="uc-select mt-[8px] w-full cursor-pointer rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] py-[8px] pl-[12px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
              >
                <option value="release-current">Baseline App</option>
                <option value="release-future-evo-2027">Future App · Evo 2027</option>
              </select>
            </div>

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
                  <div className="flex items-center justify-between gap-[8px] pb-[8px]" style={{ width: FRAME_WIDTH * scale + 8, height: 36 }}>
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

          </div>
        </div>
      </ToolPanel>
    </div>

    {isFocusModeOpen && orderedSelection.length === 2 ? (
      <div
        className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-[16px] backdrop-blur-sm"
        onClick={() => setIsFocusModeOpen(false)}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Focused country comparison"
          data-focused-side-by-side="true"
          className="max-h-[calc(100vh-32px)] max-w-full overflow-auto rounded-[20px] bg-[var(--uc-surface)] p-[16px] shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 mb-[12px] flex items-center justify-between gap-[16px] rounded-[12px] bg-[var(--uc-surface)] px-[4px] py-[4px]">
            <div>
              <h2 className="text-[18px] font-bold text-[var(--uc-text)]">Focused comparison</h2>
              <p className="text-[12px] text-[var(--uc-text-muted)]">Two live screens, one shared setup</p>
            </div>
            <button
              type="button"
              aria-label="Close focused comparison"
              onClick={() => setIsFocusModeOpen(false)}
              className="grid size-[36px] shrink-0 place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] text-[var(--uc-text)]"
            >
              <AppIcon name="close-x" size={16} color="currentColor" />
            </button>
          </div>

          <div className="flex min-w-max items-start justify-center gap-[20px]">
            {orderedSelection.map((country) => (
              <div key={`focused-${country}`}>
                <div className="pb-[8px] text-[13px] font-bold text-[var(--uc-text)]">
                  {COUNTRY_META[country].name}
                </div>
                <div
                  className="overflow-hidden rounded-[30px] bg-[var(--uc-static-black)] p-[4px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]"
                  style={{ width: FRAME_WIDTH * FOCUS_SCALE + 8, height: FRAME_HEIGHT * FOCUS_SCALE + 8 }}
                >
                  <div
                    className="overflow-hidden rounded-[26px]"
                    style={{ width: FRAME_WIDTH * FOCUS_SCALE, height: FRAME_HEIGHT * FOCUS_SCALE }}
                  >
                    <iframe
                      key={`focused-${country}-${frameNonce}`}
                      title={`${COUNTRY_META[country].name} focused preview`}
                      src={buildFrameUrl(country)}
                      scrolling="no"
                      className="origin-top-left border-0"
                      style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, transform: `scale(${FOCUS_SCALE})` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    ) : null}
    </>
  );
}
