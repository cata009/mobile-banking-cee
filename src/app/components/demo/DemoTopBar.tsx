/**
 * DemoTopBar Component
 * Professional demo header with product, country, scenario, release, and control panel access.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigationContext } from "@/app/contexts/NavigationContext";
import { COUNTRIES, COUNTRY_META } from "@/app/registry/demoConfig";
import { PRODUCT_ORDER, PRODUCTS } from "@/app/registry/projectModel";
import { getReleaseBundle, RELEASE_ORDER } from "@/app/registry/releaseRegistry";
import { useDemo } from "@/app/state/demoStore";
import { AppIcon } from "@/app/components/icons";
import { DemoFeatureSidePanel } from "./DemoFeatureSidePanel";
import svgPaths from "@/imports/svg-pn3y56bdut";

export function DemoTopBar() {
  const {
    product,
    country,
    scenario,
    release,
    themeMode,
    setProduct,
    setCountry,
    setScenario,
    setRelease,
    setThemeMode,
  } = useDemo();
  const { currentScreen, navigateTo, setCoAppingActive } = useNavigationContext();

  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isReleaseDropdownOpen, setIsReleaseDropdownOpen] = useState(false);

  const productDropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const releaseDropdownRef = useRef<HTMLDivElement>(null);

  const selectedRelease = getReleaseBundle(release);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (releaseDropdownRef.current && !releaseDropdownRef.current.contains(event.target as Node)) {
        setIsReleaseDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReset = () => {
    setCoAppingActive(false);
    const targetScreen = scenario === "active" ? "prelogin-active" : "prelogin-inactive";
    navigateTo(targetScreen);
  };

  return (
    <>
      <div className="sticky top-0 z-[9999] border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface)] shadow-sm">
        <div className="flex items-center justify-between px-20 py-4">
          <div className="flex items-center gap-6">
            <div className="h-[27px] w-[140px] shrink-0">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 139.508 26.7899">
                <g>
                  <path clipRule="evenodd" d={svgPaths.p2cef6600} fill="var(--uc-brand)" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p27e9da00} fill="var(--uc-brand)" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p2e662b0} fill="var(--uc-static-white)" fillRule="evenodd" />
                  <path d={svgPaths.p3d56e1f0} fill="var(--uc-text)" />
                  <path d={svgPaths.p18a76220} fill="var(--uc-text)" />
                  <path d={svgPaths.p2205fa00} fill="var(--uc-text)" />
                  <path d={svgPaths.p4138200} fill="var(--uc-text)" />
                  <path d={svgPaths.p120fd332} fill="var(--uc-text)" />
                  <path d={svgPaths.p3558cb00} fill="var(--uc-text)" />
                  <path d={svgPaths.p29646d00} fill="var(--uc-text)" />
                  <path d={svgPaths.p3ed7ba20} fill="var(--uc-text)" />
                  <path d={svgPaths.p4240280} fill="var(--uc-text)" />
                </g>
              </svg>
            </div>

            <div className="relative" ref={productDropdownRef}>
              <button
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text)] leading-normal">
                  {PRODUCTS[product].label}
                </p>
                <AppIcon name="demo-chevron-down" color="var(--uc-text)" className="w-6 h-6 shrink-0" />
              </button>

              {isProductDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-[var(--uc-surface)] border border-[var(--uc-border-muted)] rounded-lg shadow-lg z-[10000] min-w-[190px] py-1">
                  {PRODUCT_ORDER.map((productId) => (
                    <button
                      key={productId}
                      aria-label={`${PRODUCTS[productId].label}${PRODUCTS[productId].status === "planned" ? " planned" : ""}`}
                      onClick={() => {
                        setProduct(productId);
                        setIsProductDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-[var(--uc-surface-muted)] transition-colors ${
                        product === productId
                          ? "bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-brand)]"
                          : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                      }`}
                    >
                      {PRODUCTS[productId].label}
                      {PRODUCTS[productId].status === "planned" && (
                        <span className="ml-2 text-xs text-[var(--uc-text-subtle)]">planned</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={countryDropdownRef}>
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text)] leading-normal">
                  {COUNTRY_META[country]?.nameEN || country}
                </p>
                <AppIcon name="demo-chevron-down" color="var(--uc-text)" className="w-6 h-6 shrink-0" />
              </button>

              {isCountryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-[var(--uc-surface)] border border-[var(--uc-border-muted)] rounded-lg shadow-lg z-[10000] min-w-[180px] py-1">
                  {COUNTRIES.map((countryCode) => (
                    <button
                      key={countryCode}
                      onClick={() => {
                        setCountry(countryCode);
                        setIsCountryDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-[var(--uc-surface-muted)] transition-colors ${
                        country === countryCode
                          ? "bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-brand)]"
                          : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                      }`}
                    >
                      {COUNTRY_META[countryCode]?.nameEN || countryCode}
                    </button>
                  ))}
                  <div className="my-1 border-t border-[var(--uc-border-muted)]" />
                  <button
                    onClick={() => {
                      navigateTo("design-system");
                      setIsCountryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-[var(--uc-surface-muted)] transition-colors ${
                      currentScreen === "design-system"
                        ? "bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-brand)]"
                        : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                    }`}
                  >
                    Design system inventory
                  </button>
                </div>
              )}
            </div>
          </div>

          <ScenarioModeSwitch value={scenario} onChange={setScenario} />

          <div className="flex items-center gap-6">
            <div className="relative" ref={releaseDropdownRef}>
              <button
                onClick={() => setIsReleaseDropdownOpen(!isReleaseDropdownOpen)}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              >
                <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text)] leading-normal">
                  {selectedRelease.label}
                </p>
                <AppIcon name="demo-chevron-down" color="var(--uc-text)" className="w-6 h-6 shrink-0" />
              </button>

              {isReleaseDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[var(--uc-surface)] border border-[var(--uc-border-muted)] rounded-lg shadow-lg z-[10000] min-w-[170px] py-1">
                  {RELEASE_ORDER.map((releaseId) => (
                    <button
                      key={releaseId}
                      onClick={() => {
                        setRelease(releaseId);
                        setIsReleaseDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-[var(--uc-surface-muted)] transition-colors ${
                        release === releaseId
                          ? "bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-brand)]"
                          : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                      }`}
                    >
                      {getReleaseBundle(releaseId).label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
              className={`w-6 h-6 transition-colors ${
                isControlPanelOpen ? "text-[var(--uc-brand)]" : "text-[var(--uc-text)] hover:text-[var(--uc-brand)]"
              }`}
              title="Control Panel"
            >
              <AppIcon name="demo-settings" className="block size-full" />
            </button>

            <ThemeModeSwitch value={themeMode} onChange={setThemeMode} />

            <button
              onClick={handleReset}
              className="w-6 h-6 text-[var(--uc-text)] hover:text-[var(--uc-brand)] transition-colors"
              title="Reset to Prelogin"
            >
              <AppIcon name="demo-reset" className="block size-full" />
            </button>
          </div>
        </div>
      </div>

      <DemoFeatureSidePanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
      />
    </>
  );
}

function ThemeModeSwitch({
  value,
  onChange,
}: {
  value: "light" | "dark";
  onChange: (value: "light" | "dark") => void;
}) {
  return (
    <div
      className="flex items-center rounded-[18px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]"
      aria-label="Theme mode"
    >
      {(["light", "dark"] as const).map((mode) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(mode)}
            className={`rounded-[16px] px-3 py-1 font-['UniCredit:Bold',sans-serif] text-[12px] leading-none transition-colors ${
              isActive
                ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
            }`}
          >
            {mode === "light" ? "Light" : "Dark"}
          </button>
        );
      })}
    </div>
  );
}

function ScenarioModeSwitch({
  value,
  onChange,
}: {
  value: "active" | "inactive";
  onChange: (value: "active" | "inactive") => void;
}) {
  return (
    <div
      className="flex items-center rounded-[18px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]"
      aria-label="Scenario mode"
    >
      {(["active", "inactive"] as const).map((mode) => {
        const isActive = value === mode;

        return (
          <button
            key={mode}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(mode)}
            className={`rounded-[16px] px-3 py-1 font-['UniCredit:Bold',sans-serif] text-[12px] leading-none transition-colors ${
              isActive
                ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
            }`}
          >
            {mode === "active" ? "Active" : "Inactive"}
          </button>
        );
      })}
    </div>
  );
}
