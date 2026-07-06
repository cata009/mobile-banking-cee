/**
 * DemoTopBar Component
 * Two-line stakeholder header with platform navigation, context controls, and demo actions.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigationContext } from "@/app/contexts/NavigationContext";
import { COUNTRIES, COUNTRY_META, FEATURE_META } from "@/app/registry/demoConfig";
import { FLOW_PREVIEW_ORDER, type FlowPreviewId } from "@/app/registry/flowPreviewRegistry";
import { PRODUCT_ORDER } from "@/app/registry/projectModel";
import { getReleaseBundle } from "@/app/registry/releaseRegistry";
import { useDemo } from "@/app/state/demoStore";
import type { CountryId, DesignSystemId, ProductId, ReleaseId } from "@/app/state/demoTypes";
import { QRCodeSVG } from "qrcode.react";
import { AppIcon, type IconName } from "@/app/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { withFramelessParam, withShareAccessTokenParam } from "@/app/utils/deepLink";
import { DemoFeatureSidePanel } from "./DemoFeatureSidePanel";
import { PhoneScreenshotMenuItems } from "./PhoneScreenshotControl";
import svgPaths from "@/imports/svg-pn3y56bdut";

type PlatformTabId = "demo" | "flows" | "design-system";
type PlatformNavIcon = IconName | "demo-app";

interface DemoTopBarProps {
  onOpenFocusMode?: () => void;
}

const PRODUCT_SELECTOR_LABELS: Record<ProductId, string> = {
  PI: "PI App",
  SME: "SME App",
  KIDS_PI: "Kids App",
};

const PRODUCT_CONTEXT_LABELS: Record<ProductId, string> = {
  PI: "PI",
  SME: "SME",
  KIDS_PI: "Kids",
};

const FUTURE_RELEASE_ORDER: readonly ReleaseId[] = ["release-future-cz-coapping"] as const;

function getFutureReleaseOptions(
  product: ProductId,
  country: CountryId,
  designSystem: DesignSystemId
): ReleaseId[] {
  return FUTURE_RELEASE_ORDER.filter((releaseId) => {
    const bundle = getReleaseBundle(releaseId);

    return bundle.features.some((featureId) => {
      const feature = FEATURE_META[featureId];
      if (!feature) return false;
      if (feature.products && !feature.products.includes(product)) return false;
      if (feature.designSystems && !feature.designSystems.includes(designSystem)) return false;
      if (feature.scope === "countries" && !feature.countries?.includes(country)) return false;
      return true;
    });
  });
}

async function requestShareAccessToken() {
  const response = await fetch("/api/access?mode=share-token", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });

  if (!response.ok) return null;

  const data = (await response.json().catch(() => ({}))) as { token?: string };
  return typeof data.token === "string" && data.token.length > 0 ? data.token : null;
}

function getLocalShareAccessToken() {
  return import.meta.env.DEV ? "local-dev-share-access" : null;
}

export function DemoTopBar({ onOpenFocusMode }: DemoTopBarProps) {
  const {
    product,
    country,
    scenario,
    designSystem,
    release,
    themeMode,
    setProduct,
    setCountry,
    setScenario,
    setRelease,
    setThemeMode,
  } = useDemo();
  const { currentScreen, navigateToAndReset, setCoAppingActive } = useNavigationContext();

  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isReleaseDropdownOpen, setIsReleaseDropdownOpen] = useState(false);
  const [isFutureReleaseDropdownOpen, setIsFutureReleaseDropdownOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrls, setShareUrls] = useState({ framed: "", device: "" });
  const shareResetTimeoutRef = useRef<number | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  const productDropdownRef = useRef<HTMLDivElement>(null);
  const releaseDropdownRef = useRef<HTMLDivElement>(null);
  const futureReleaseDropdownRef = useRef<HTMLDivElement>(null);

  const selectedRelease = getReleaseBundle(release);
  const selectedCountryLabel = COUNTRY_META[country]?.nameEN || country;
  const selectedAppCountryLabel = `${PRODUCT_CONTEXT_LABELS[product]} - ${selectedCountryLabel}`;
  const futureReleaseOptions = getFutureReleaseOptions(product, country, designSystem);
  const isFutureReleaseSelected = futureReleaseOptions.includes(release);
  const selectedFutureRelease = isFutureReleaseSelected
    ? selectedRelease
    : futureReleaseOptions[0]
      ? getReleaseBundle(futureReleaseOptions[0])
      : null;
  const isDesignSystemSelected = currentScreen === "design-system";
  const isFlowLibrarySelected = currentScreen === "flow-library";
  const showContextControls = !isDesignSystemSelected && !isFlowLibrarySelected;
  const scenarioEntryScreen = scenario === "active" ? "homepage" : "prelogin-inactive";

  const activePlatformTab: PlatformTabId = isFlowLibrarySelected
    ? "flows"
    : isDesignSystemSelected
      ? "design-system"
      : "demo";

  useEffect(() => {
    if (release === "release-current") return;
    if (getFutureReleaseOptions(product, country, designSystem).includes(release)) return;
    setRelease("release-current");
  }, [country, designSystem, product, release, setRelease]);

  const closeAllDropdowns = () => {
    setIsProductDropdownOpen(false);
    setIsReleaseDropdownOpen(false);
    setIsFutureReleaseDropdownOpen(false);
  };

  const leavePlatformSurface = () => {
    if (currentScreen === "design-system" && window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  const handleCountrySelect = (countryCode: (typeof COUNTRIES)[number]) => {
    const shouldReturnToDemo = currentScreen === "design-system" || currentScreen === "flow-library";
    closeAllDropdowns();
    leavePlatformSurface();
    setCountry(countryCode);
    if (isFutureReleaseSelected && !getFutureReleaseOptions(product, countryCode, designSystem).includes(release)) {
      setRelease("release-current");
    }

    if (shouldReturnToDemo) {
      setCoAppingActive(false);
      window.requestAnimationFrame(() => navigateToAndReset(scenarioEntryScreen));
    }
  };

  const handleProductSelect = (productId: ProductId, options?: { keepDropdownOpen?: boolean }) => {
    if (options?.keepDropdownOpen) {
      setIsReleaseDropdownOpen(false);
      setIsFutureReleaseDropdownOpen(false);
    } else {
      closeAllDropdowns();
    }
    leavePlatformSurface();
    setProduct(productId);
    if (isFutureReleaseSelected && !getFutureReleaseOptions(productId, country, designSystem).includes(release)) {
      setRelease("release-current");
    }
    setCoAppingActive(false);
    window.requestAnimationFrame(() => navigateToAndReset(scenarioEntryScreen));
  };

  const handleDemoSelect = () => {
    closeAllDropdowns();
    leavePlatformSurface();
    setCoAppingActive(false);
    window.requestAnimationFrame(() => navigateToAndReset(scenarioEntryScreen));
  };

  const handleDesignSystemSelect = () => {
    closeAllDropdowns();
    setCoAppingActive(false);
    window.requestAnimationFrame(() => navigateToAndReset("design-system"));
  };

  const handleFlowLibrarySelect = () => {
    const firstFlow = FLOW_PREVIEW_ORDER[0];
    closeAllDropdowns();
    setCoAppingActive(false);
    if (firstFlow) {
      window.dispatchEvent(new CustomEvent<FlowPreviewId>("flow-preview-select", { detail: firstFlow }));
    }
    window.requestAnimationFrame(() => navigateToAndReset("flow-library"));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
      if (releaseDropdownRef.current && !releaseDropdownRef.current.contains(event.target as Node)) {
        setIsReleaseDropdownOpen(false);
      }
      if (futureReleaseDropdownRef.current && !futureReleaseDropdownRef.current.contains(event.target as Node)) {
        setIsFutureReleaseDropdownOpen(false);
      }
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReset = () => {
    setCoAppingActive(false);
    navigateToAndReset(scenarioEntryScreen);
  };

  const handleLogout = () => {
    closeAllDropdowns();
    leavePlatformSurface();
    setCoAppingActive(false);
    navigateToAndReset("prelogin-active");
  };

  const toggleShare = async () => {
    if (isShareOpen) {
      setIsShareOpen(false);
      return;
    }
    const framed = window.location.href;
    const device = withFramelessParam(framed);
    setShareUrls({ framed, device });
    setShareCopied(false);
    setIsShareOpen(true);

    try {
      const shareAccessToken = (await requestShareAccessToken()) ?? getLocalShareAccessToken();
      if (!shareAccessToken) return;
      setShareUrls((current) =>
        current.framed === framed
          ? { ...current, device: withShareAccessTokenParam(device, shareAccessToken) }
          : current
      );
    } catch {
      const localShareAccessToken = getLocalShareAccessToken();
      if (!localShareAccessToken) return;
      setShareUrls((current) =>
        current.framed === framed
          ? { ...current, device: withShareAccessTokenParam(device, localShareAccessToken) }
          : current
      );
    }
  };

  const handleCopyShareLink = async () => {
    const shareUrl = shareUrls.framed || window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch {
        // Clipboard unavailable; the URL is still in the address bar to copy manually.
      }
      document.body.removeChild(textarea);
    }

    setShareCopied(true);
    if (shareResetTimeoutRef.current) {
      window.clearTimeout(shareResetTimeoutRef.current);
    }
    shareResetTimeoutRef.current = window.setTimeout(() => setShareCopied(false), 1800);
  };

  const isLocalhostShare = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(window.location.host);

  useEffect(() => () => {
    if (shareResetTimeoutRef.current) {
      window.clearTimeout(shareResetTimeoutRef.current);
    }
  }, []);

  return (
    <>
      <header className="sticky top-0 z-[9999] overflow-visible border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface)] shadow-sm">
        <div className="grid min-h-[64px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-2 lg:px-10 xl:px-16">
          <div className="flex min-w-0 items-center gap-4 overflow-visible">
            <button
              type="button"
              className="h-[27px] w-[140px] shrink-0"
              onClick={handleDemoSelect}
              aria-label="Open demo"
              title="Open demo"
            >
              <UniCreditLogo />
            </button>

            <div className="relative shrink-0" ref={productDropdownRef}>
              <ContextDropdownButton
                label={selectedAppCountryLabel}
                expanded={isProductDropdownOpen}
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                maxWidthClassName="max-w-[260px]"
              />

              {isProductDropdownOpen && (
                <div className="absolute left-0 top-full z-[10000] mt-2 w-[256px] rounded-lg border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] py-2 shadow-lg">
                  <p className="px-4 pb-1 pt-1 font-['UniCredit:Bold',sans-serif] text-[11px] uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                    App
                  </p>
                  {PRODUCT_ORDER.map((productId) => (
                    <button
                      key={productId}
                      type="button"
                      onClick={() => handleProductSelect(productId, { keepDropdownOpen: true })}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--uc-surface-muted)] ${
                        product === productId
                          ? "bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-action)]"
                          : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                      }`}
                    >
                      {PRODUCT_SELECTOR_LABELS[productId]}
                    </button>
                  ))}

                  <div className="my-1 h-px bg-[var(--uc-border-muted)]" />
                  <p className="px-4 pb-1 pt-1 font-['UniCredit:Bold',sans-serif] text-[11px] uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                    Country
                  </p>
                  {COUNTRIES.map((countryCode) => (
                    <button
                      key={countryCode}
                      type="button"
                      onClick={() => handleCountrySelect(countryCode)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--uc-surface-muted)] ${
                        country === countryCode
                          ? "bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-action)]"
                          : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                      }`}
                    >
                      {COUNTRY_META[countryCode]?.nameEN || countryCode}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <nav className="flex min-w-0 items-stretch justify-center gap-2" aria-label="Platform navigation">
            <PlatformNavButton
              active={activePlatformTab === "demo"}
              icon="demo-app"
              label="Demo"
              onClick={handleDemoSelect}
            />
            <PlatformNavButton
              active={activePlatformTab === "flows"}
              icon="repeat"
              label="Flows"
              onClick={handleFlowLibrarySelect}
            />
            <PlatformNavButton
              active={activePlatformTab === "design-system"}
              icon="palette"
              label="Design system"
              onClick={handleDesignSystemSelect}
            />
          </nav>

          <div className="flex min-w-0 items-center justify-end gap-2">
            <button
              type="button"
              className="flex h-[44px] min-w-[56px] items-center justify-center gap-2 rounded-[6px] px-2 text-[var(--uc-text)] transition-colors hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-action)]"
              aria-label="Profile IM"
              title="Mihai Iacob"
            >
              <span className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-text)] font-['UniCredit:Bold',sans-serif] text-[12px] leading-none text-[var(--uc-surface)]">
                IM
              </span>
            </button>
            <HeaderIconButton icon="logout" label="Logout" onClick={handleLogout} />
          </div>
        </div>

        {showContextControls ? (
          <div className="grid min-h-[48px] grid-cols-[1fr_auto_1fr] items-center gap-4 overflow-visible border-t border-[var(--uc-border-muted)] px-6 py-1.5 lg:px-10 xl:px-16">
            <div className="flex min-w-0 items-center gap-3 overflow-visible">
              <div className="relative shrink-0" ref={releaseDropdownRef}>
                <ContextDropdownButton
                  label={isFutureReleaseSelected ? "Future App" : "Baseline App"}
                  expanded={isReleaseDropdownOpen}
                  onClick={() => setIsReleaseDropdownOpen(!isReleaseDropdownOpen)}
                />

                {isReleaseDropdownOpen && (
                  <div className="absolute left-0 top-full z-[10000] mt-2 min-w-[150px] rounded-lg border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setRelease("release-current");
                        setIsReleaseDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--uc-surface-muted)] ${
                        !isFutureReleaseSelected
                          ? "bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-action)]"
                          : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                      }`}
                    >
                      Baseline App
                    </button>
                    <button
                      type="button"
                      disabled={futureReleaseOptions.length === 0}
                      onClick={() => {
                        const firstFutureRelease = futureReleaseOptions[0];
                        if (!firstFutureRelease) return;
                        setRelease(firstFutureRelease);
                        setIsReleaseDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:text-[var(--uc-text-muted)] disabled:opacity-50 ${
                        isFutureReleaseSelected
                          ? "bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-action)]"
                          : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)] hover:bg-[var(--uc-surface-muted)]"
                      }`}
                    >
                      Future App
                    </button>
                  </div>
                )}
              </div>

              {isFutureReleaseSelected && selectedFutureRelease && (
                <div className="relative shrink-0" ref={futureReleaseDropdownRef}>
                  <ContextDropdownButton
                    label={selectedFutureRelease.label}
                    expanded={isFutureReleaseDropdownOpen}
                    onClick={() => setIsFutureReleaseDropdownOpen(!isFutureReleaseDropdownOpen)}
                  />

                  {isFutureReleaseDropdownOpen && (
                    <div className="absolute left-0 top-full z-[10000] mt-2 min-w-[220px] rounded-lg border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] py-1 shadow-lg">
                      {futureReleaseOptions.map((releaseId) => {
                        const futureRelease = getReleaseBundle(releaseId);

                        return (
                          <button
                            key={releaseId}
                            type="button"
                            onClick={() => {
                              setRelease(releaseId);
                              setIsFutureReleaseDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--uc-surface-muted)] ${
                              release === releaseId
                                ? "bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] font-['UniCredit:Bold',sans-serif] text-[var(--uc-action)]"
                                : "font-['UniCredit:Regular',sans-serif] text-[var(--uc-text)]"
                            }`}
                          >
                            {futureRelease.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <ScenarioModeSwitch value={scenario} onChange={setScenario} />

            <div className="flex min-w-0 items-center justify-end gap-2">
              <HeaderIconButton icon="demo-reset" label="Refresh" onClick={handleReset} />

              {onOpenFocusMode && (
                <HeaderIconButton icon="play" label="Open large demo" onClick={onOpenFocusMode} />
              )}

              <div className="relative" ref={shareRef}>
                <HeaderIconButton
                  icon="share-filled"
                  label="Share"
                  active={isShareOpen}
                  onClick={toggleShare}
                  expanded={isShareOpen}
                />

                {isShareOpen && (
                  <div className="absolute right-0 top-full z-[10000] mt-2 w-[264px] rounded-xl border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-4 shadow-xl">
                    <p className="font-['UniCredit:Bold',sans-serif] text-[14px] leading-none text-[var(--uc-text)]">
                      Share this state
                    </p>
                    <p className="mt-1.5 font-['UniCredit:Regular',sans-serif] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                      Same product, country, screen, language and theme you see now.
                    </p>

                    <div className="mt-3 flex flex-col items-center gap-2 rounded-lg bg-[var(--uc-surface-muted)] p-3">
                      <div className="rounded-md bg-white p-2">
                        <QRCodeSVG
                          value={shareUrls.device || window.location.href}
                          size={144}
                          level="M"
                          marginSize={2}
                          fgColor="#111111"
                          bgColor="#ffffff"
                        />
                      </div>
                      <p className="text-center font-['UniCredit:Regular',sans-serif] text-[11px] leading-[14px] text-[var(--uc-text-muted)]">
                        Scan to open on your phone, fullscreen, no frame
                      </p>
                    </div>

                    {isLocalhostShare && (
                      <p className="mt-2 font-['UniCredit:Regular',sans-serif] text-[11px] leading-[14px] text-[#B45309]">
                        On localhost the QR only resolves on this machine. Deploy the demo or use your LAN IP for real phones.
                      </p>
                    )}

                    <button
                      onClick={handleCopyShareLink}
                      className={`mt-3 flex h-[36px] w-full items-center justify-center gap-2 rounded-lg text-[13px] font-['UniCredit:Bold',sans-serif] transition-colors ${
                        shareCopied
                          ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                          : "bg-[var(--uc-surface-muted)] text-[var(--uc-text)] hover:bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface-muted))] hover:text-[var(--uc-action)]"
                      }`}
                    >
                      <span className="grid h-[18px] w-[18px] place-items-center">
                        <AppIcon name={shareCopied ? "prime-check" : "share-filled"} />
                      </span>
                      {shareCopied ? "Link copied" : "Copy desktop link"}
                    </button>
                  </div>
                )}
              </div>

              <HeaderMoreMenu
                active={isControlPanelOpen}
                themeMode={themeMode}
                onToggleThemeMode={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
                onOpenSettings={() => setIsControlPanelOpen(true)}
              />
            </div>
          </div>
        ) : null}
      </header>

      <DemoFeatureSidePanel
        isOpen={isControlPanelOpen}
        onClose={() => setIsControlPanelOpen(false)}
      />
    </>
  );
}

function HeaderMoreMenu({
  active,
  themeMode,
  onToggleThemeMode,
  onOpenSettings,
}: {
  active: boolean;
  themeMode: "light" | "dark";
  onToggleThemeMode: () => void;
  onOpenSettings: () => void;
}) {
  const itemClassName =
    "cursor-pointer rounded-[6px] px-3 py-2.5 font-['UniCredit:Bold',sans-serif] text-[14px] leading-none text-[var(--uc-text)] focus:bg-[var(--uc-surface-muted)] focus:text-[var(--uc-text)]";
  const iconSlotClassName = "grid size-[20px] shrink-0 place-items-center text-[var(--uc-text-muted)]";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="More actions"
          title="More actions"
          className={`grid size-[36px] place-items-center rounded-[6px] transition-colors ${
            active
              ? "bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))] text-[var(--uc-action)]"
              : "text-[var(--uc-text)] hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-action)]"
          }`}
        >
          <AppIcon name="more-horizontal" size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[10000] min-w-[220px] rounded-xl border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-1.5 text-[var(--uc-text)] shadow-xl"
        sideOffset={8}
      >
        <DropdownMenuItem className={itemClassName} onSelect={onOpenSettings}>
          <span className={iconSlotClassName}>
            <AppIcon name="demo-settings" size={18} />
          </span>
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={`${itemClassName} data-[state=open]:bg-[var(--uc-surface-muted)]`}>
            <span className={iconSlotClassName}>
              <AppIcon name="camera" size={18} />
            </span>
            <span>Screenshots</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="z-[10001] min-w-[218px] rounded-xl border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] p-1.5 text-[var(--uc-text)] shadow-xl">
            <PhoneScreenshotMenuItems itemClassName={itemClassName} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="mx-1 bg-[var(--uc-border-muted)]" />

        <DropdownMenuItem className={itemClassName} onSelect={onToggleThemeMode}>
          <span className={iconSlotClassName}>
            <ThemeModeIcon mode={themeMode} />
          </span>
          <span>{themeMode === "light" ? "Light mode" : "Dark mode"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UniCreditLogo() {
  return (
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
  );
}

function DemoPlatformIcon() {
  return (
    <svg
      aria-hidden="true"
      className="block"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <rect x="5.25" y="2.75" width="11.5" height="16.5" rx="2.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 6.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M9.35 14.65V10.9C9.35 10.34 9.96 10 10.43 10.3L13.4 12.18C13.84 12.46 13.84 13.09 13.4 13.37L10.43 15.25C9.96 15.55 9.35 15.21 9.35 14.65Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ThemeModeIcon({ mode }: { mode: "light" | "dark" }) {
  if (mode === "light") {
    return (
      <svg
        aria-hidden="true"
        className="block"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M10 4.375V1.875M10 18.125V15.625M4.375 10H1.875M18.125 10H15.625M5.15625 5.15625L3.4375 3.4375M16.5625 16.5625L14.8438 14.8438M14.8438 5.15625L16.5625 3.4375M3.4375 16.5625L5.15625 14.8438"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
        <path
          d="M10 13.125C11.7259 13.125 13.125 11.7259 13.125 10C13.125 8.27411 11.7259 6.875 10 6.875C8.27411 6.875 6.875 8.27411 6.875 10C6.875 11.7259 8.27411 13.125 10 13.125Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="block"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        clipRule="evenodd"
        d="M12.5485 2.25044C11.4726 3.02014 10.7708 4.27926 10.7708 5.70136C10.7708 8.04126 12.6675 9.93793 15.0074 9.93793C16.2221 9.93793 17.3167 9.42655 18.0892 8.60786C18.1152 8.83067 18.1286 9.05731 18.1286 9.28706C18.1286 12.6647 15.3907 15.4025 12.0131 15.4025C8.63546 15.4025 5.89758 12.6647 5.89758 9.28706C5.89758 6.36322 7.95028 3.91903 10.6928 3.31861C11.1895 3.20987 11.7092 3.14514 12.5485 2.25044Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function PlatformNavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: PlatformNavIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={`relative flex min-w-[92px] flex-col items-center justify-center gap-1 px-3 py-1.5 text-center transition-colors ${
        active ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]"
      }`}
    >
      {icon === "demo-app" ? <DemoPlatformIcon /> : <AppIcon name={icon} size={20} />}
      <span className="font-['UniCredit:Bold',sans-serif] text-[12px] leading-none">{label}</span>
      <span
        aria-hidden="true"
        className={`absolute bottom-[-9px] h-[3px] w-full max-w-[96px] rounded-t-[2px] ${
          active ? "bg-[var(--uc-action)]" : "bg-transparent"
        }`}
      />
    </button>
  );
}

function ThemeModeButton({
  mode,
  onClick,
}: {
  mode: "light" | "dark";
  onClick: () => void;
}) {
  const label = mode === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-[36px] place-items-center rounded-[6px] text-[var(--uc-text)] transition-colors hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-action)]"
    >
      <ThemeModeIcon mode={mode} />
    </button>
  );
}

function ContextDropdownButton({
  label,
  expanded,
  onClick,
  maxWidthClassName = "max-w-[220px]",
}: {
  label: string;
  expanded: boolean;
  onClick: () => void;
  maxWidthClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`flex h-[34px] ${maxWidthClassName} items-center gap-1 rounded-[6px] px-2 font-['UniCredit:Bold',sans-serif] text-[14px] leading-none text-[var(--uc-text)] transition-colors hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-action)]`}
    >
      <span className="truncate">{label}</span>
      <span className="grid size-[16px] shrink-0 place-items-center opacity-90">
        <AppIcon name="demo-chevron-down" color="currentColor" size={14} />
      </span>
    </button>
  );
}

function HeaderIconButton({
  icon,
  label,
  active = false,
  expanded,
  onClick,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={expanded}
      title={label}
      className={`grid size-[36px] place-items-center rounded-[6px] transition-colors ${
        active
          ? "bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))] text-[var(--uc-action)]"
          : "text-[var(--uc-text)] hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-action)]"
      }`}
    >
      <AppIcon name={icon} size={20} />
    </button>
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
      className="flex shrink-0 items-center rounded-[18px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]"
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
                : "text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]"
            }`}
          >
            {mode === "active" ? "Active" : "Inactive"}
          </button>
        );
      })}
    </div>
  );
}
