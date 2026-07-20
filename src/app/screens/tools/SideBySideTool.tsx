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
        return current.length > 1 ? current.filter((entry) => entry !== country) : current;
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

          <div>
            <FieldLabel>Screen</FieldLabel>
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              {screenOptions.map((option) => (
                <SelectionChip
                  key={option.screen}
                  active={selectedScreen === option.screen}
                  onClick={() => setSelectedScreen(option.screen)}
                >
                  {option.label}
                </SelectionChip>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Language</FieldLabel>
            <div className="mt-[8px] flex flex-wrap gap-[8px]">
              <SelectionChip active={languageMode === "local"} onClick={() => setLanguageMode("local")}>
                Local language
              </SelectionChip>
              <SelectionChip active={languageMode === "en"} onClick={() => setLanguageMode("en")}>
                English
              </SelectionChip>
            </div>
          </div>

          <p className="text-[13px] leading-[18px] text-[var(--uc-text-muted)]">
            Every phone below is the live application — click inside any frame to navigate deeper, then use
            “Reload frames” to bring all countries back to the selected screen.
          </p>
        </div>
      </ToolPanel>

      <div className="flex flex-wrap items-start gap-[24px]">
        {orderedSelection.map((country) => {
          const url = buildFrameUrl(country);
          return (
            <div key={country} className="min-w-0" data-side-by-side-frame={country}>
              <div className="flex items-center justify-between gap-[8px] pb-[8px]" style={{ width: FRAME_WIDTH * scale }}>
                <div className="min-w-0">
                  <span className="block truncate text-[13px] font-bold leading-[16px] text-[var(--uc-text)]">
                    {COUNTRY_META[country].name}
                  </span>
                  <span className="text-[11px] font-bold uppercase leading-[13px] text-[var(--uc-text-muted)]">
                    {frameLanguage(country)}
                  </span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  title={`Open ${COUNTRY_META[country].name} in a new tab`}
                  className="grid size-[28px] shrink-0 place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] transition-colors hover:border-[var(--uc-action)] hover:text-[var(--uc-action)]"
                >
                  <AppIcon name="arrow-right" size={14} color="currentColor" />
                </a>
              </div>
              <div
                className="overflow-hidden rounded-[18px] border border-[var(--uc-border)] bg-[var(--uc-surface)] shadow-lg"
                style={{ width: FRAME_WIDTH * scale, height: FRAME_HEIGHT * scale }}
              >
                <iframe
                  key={`${country}-${frameNonce}`}
                  title={`${COUNTRY_META[country].name} preview`}
                  src={url}
                  className="origin-top-left border-0"
                  style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, transform: `scale(${scale})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
