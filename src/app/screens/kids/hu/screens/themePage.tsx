/**
 * HU Kids theme personalisation: the change-theme page, its phone preview, the
 * theme carousel, appearance persistence, and the ambient motion layer.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx.
 */
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AppIcon } from "@/app/components/icons";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import StatusBar from "@/app/components/StatusBar";
import { useDemo } from "@/app/state/demoStore";
import type { ThemeMode } from "@/app/state/demoTypes";
import PrimaryButton from "@/app/components/PrimaryButton";
import { cn } from "@/app/components/ui/utils";
import { type KidsMarketHomeConcept } from "@/data/kidsMarketHomeConcepts";
import { HU_THEME_PRESETS, type HuThemeId, type HuThemePreset } from "../theme";
import { HU_PENDING_ACTIONS } from "../data";
import { HuLightBottomNav, HuLightHeader, HuThemeShell } from "../chrome";
import { HuHomeContent } from "./homeContent";

export function HuThemeMotionLayer({
  fadeTo = "var(--uc-app-bg)",
  motionProgress = 0,
  preview = false,
  theme,
}: {
  fadeTo?: string;
  motionProgress?: number;
  preview?: boolean;
  theme?: HuThemePreset;
}) {
  const opacity = preview ? 0.9 : Math.max(0, 1 - motionProgress * 1.35);
  const translateY = preview ? 0 : motionProgress * -30;
  const scale = preview ? 1 : 1 + motionProgress * 0.025;
  const layers = theme?.motionLayers;

  if (layers && layers.length > 0) {
    const maskImage =
      theme.motionMask ?? "linear-gradient(180deg, var(--uc-static-black) 58%, transparent 97%)";

    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-28px] right-[-28px] top-0 z-0 overflow-hidden transition-opacity duration-200"
        style={{
          height: theme.motionHeight ?? 410,
          maskImage,
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          WebkitMaskImage: maskImage,
        }}
      >
        {layers.map((layer) => (
          <div
            key={layer.role}
            className={cn("absolute inset-[-12%]", layer.className)}
            style={{
              background: layer.background,
              mixBlendMode: layer.blendMode,
              opacity: layer.opacity,
            }}
          />
        ))}
        <div
          className="absolute inset-x-0 bottom-0 h-[150px]"
          style={{ background: `linear-gradient(180deg, transparent, ${fadeTo})` }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[410px] overflow-hidden transition-opacity duration-200"
      style={{ opacity, transform: `translateY(${translateY}px) scale(${scale})` }}
    >
      <div className="hu-theme-motion-field absolute inset-[-20%]" style={{ background: "var(--hu-theme-motion-bg)" }} />
      <div
        className="absolute inset-x-0 bottom-0 h-[150px]"
        style={{ background: `linear-gradient(180deg, transparent, ${fadeTo})` }}
      />
    </div>
  );
}

export function HuMoreOptionsSheet({
  onClose,
  onOpenThemes,
}: {
  onClose: () => void;
  onOpenThemes: () => void;
}) {
  return (
    <BottomSheet
      onClose={onClose}
      title="More options"
    >
      <div className="space-y-[10px]">
        <button
          aria-label="Change theme"
          className="flex w-full items-center gap-[14px] rounded-[12px] bg-[var(--hu-theme-card-bg)] p-[14px] text-left"
          onClick={onOpenThemes}
          type="button"
        >
          <span className="grid size-[44px] shrink-0 place-items-center rounded-full bg-[var(--hu-theme-control-bg)] text-[var(--hu-theme-accent-strong)]">
            <AppIcon name="palette" size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-bold leading-[21px] tracking-[0] text-[var(--uc-text)]">
              Themes
            </span>
            <span className="mt-[3px] block text-[13px] font-normal leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">
              Choose the home look, preview it live, then apply.
            </span>
          </span>
          <AppIcon color="var(--uc-icon-muted)" name="chevron-link" size={28} />
        </button>
      </div>
    </BottomSheet>
  );
}

export type HuKidsAppearanceMode = ThemeMode | "system";

export const HU_KIDS_APPEARANCE_STORAGE_KEY = "hu-kids-appearance-mode";

export function getSystemThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredHuKidsAppearanceMode(): HuKidsAppearanceMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(HU_KIDS_APPEARANCE_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function storeHuKidsAppearanceMode(mode: HuKidsAppearanceMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HU_KIDS_APPEARANCE_STORAGE_KEY, mode);
  }
}

export function resolveHuKidsAppearanceMode(mode: HuKidsAppearanceMode, systemThemeMode: ThemeMode): ThemeMode {
  return mode === "system" ? systemThemeMode : mode;
}

export function HuThemeChangePage({
  appliedThemeId,
  concept,
  draftTheme,
  draftThemeId,
  onApply,
  onBack,
  onSelectTheme,
  showAmounts,
}: {
  appliedThemeId: HuThemeId;
  concept: KidsMarketHomeConcept;
  draftTheme: HuThemePreset;
  draftThemeId: HuThemeId;
  onApply: () => void;
  onBack: () => void;
  onSelectTheme: (themeId: HuThemeId) => void;
  showAmounts: boolean;
}) {
  const isApplied = appliedThemeId === draftThemeId;
  const { themeMode, setThemeMode } = useDemo();

  const [selectedAppearance, setSelectedAppearance] = useState<HuKidsAppearanceMode>(getStoredHuKidsAppearanceMode);
  const [systemThemeMode, setSystemThemeMode] = useState<ThemeMode>(getSystemThemeMode);
  const internalThemeModeRequestRef = useRef<ThemeMode | null>(null);
  const latestThemeModeRef = useRef(themeMode);
  const skipSystemSyncRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setSystemThemeMode(event.matches ? "dark" : "light");
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const requestedMode = internalThemeModeRequestRef.current;

    if (requestedMode === themeMode) {
      internalThemeModeRequestRef.current = null;
      latestThemeModeRef.current = themeMode;
      return;
    }

    if (themeMode !== latestThemeModeRef.current) {
      skipSystemSyncRef.current = true;
      setSelectedAppearance(themeMode);
      storeHuKidsAppearanceMode(themeMode);
      latestThemeModeRef.current = themeMode;
    }
  }, [themeMode]);

  useEffect(() => {
    if (selectedAppearance !== "system") {
      return;
    }

    if (skipSystemSyncRef.current) {
      skipSystemSyncRef.current = false;
      return;
    }

    if (themeMode !== systemThemeMode) {
      internalThemeModeRequestRef.current = systemThemeMode;
      setThemeMode(systemThemeMode);
    }
  }, [selectedAppearance, setThemeMode, systemThemeMode, themeMode]);

  const handleAppearanceSelect = (mode: HuKidsAppearanceMode) => {
    setSelectedAppearance(mode);
    storeHuKidsAppearanceMode(mode);

    const targetMode = resolveHuKidsAppearanceMode(mode, systemThemeMode);
    if (themeMode !== targetMode) {
      internalThemeModeRequestRef.current = targetMode;
      setThemeMode(targetMode);
    }
  };

  return (
    <>
      <div className="relative z-[3] flex-shrink-0">
        <PageHeader
          collapsedTitleProgress={1}
          compact
          includeSafeArea
          onBack={onBack}
          showHelp={false}
          title="Change theme"
          variant="gray"
        />
      </div>

      <main className="relative z-[2] flex min-h-0 flex-1 flex-col items-center overflow-hidden px-[24px] pb-[24px]">
        <div className="mt-[12px] flex w-full justify-center">
          <HuHomePreview concept={concept} showAmounts={showAmounts} theme={draftTheme} />
        </div>

        <div className="mt-[28px] w-full">
          <HuThemeCarousel
            appliedThemeId={appliedThemeId}
            selectedThemeId={draftThemeId}
            onSelectTheme={onSelectTheme}
          />
        </div>

        {/* Appearance Control (Light, Dark, System) */}
        <div className="mt-[16px] flex justify-center w-full">
          <div className="flex items-center gap-[2px] rounded-full p-[4px] bg-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] border border-[color-mix(in_srgb,var(--uc-text)_4%,transparent)] backdrop-blur-sm">
            {(["light", "dark", "system"] as const).map((mode) => {
              const isSelected = selectedAppearance === mode;
              return (
                <button
                  key={mode}
                  aria-pressed={isSelected}
                  type="button"
                  onClick={() => handleAppearanceSelect(mode)}
                  className={cn(
                    "rounded-full px-[16px] py-[7px] text-[13px] font-bold leading-[16px] capitalize transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
                    isSelected
                      ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                      : "text-[color-mix(in_srgb,var(--uc-text)_50%,transparent)] hover:text-[var(--uc-text)] font-medium"
                  )}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto w-full px-[6px] pt-[14px]">
          <PrimaryButton
            className="!w-full shadow-[0_12px_32px_color-mix(in_srgb,var(--uc-static-black)_28%,transparent)]"
            onClick={onApply}
          >
            {isApplied ? "Apply current theme" : "Apply"}
          </PrimaryButton>
        </div>
      </main>
    </>
  );
}

export function HuHomePreview({
  concept,
  showAmounts,
  theme,
}: {
  concept: KidsMarketHomeConcept;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const { themeMode } = useDemo();
  const isDark = themeMode === "dark";

  const phoneChromeUsesLightForeground =
    theme.id === "nordlys" ||
    theme.id === "blue-lines" ||
    (theme.id === "bubbles" && themeMode === "dark") ||
    (theme.id === "aurora" && themeMode === "dark") ||
    (theme.id === "garden" && themeMode === "dark") ||
    (theme.id === "solar" && themeMode === "dark");

  return (
    <div
      className={cn(
        "relative flex h-auto w-full items-center justify-center rounded-[24px] py-[12px] transition-colors duration-200",
        isDark
          ? "bg-[var(--uc-surface)] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
          : "bg-[var(--uc-surface)] border border-[color-mix(in_srgb,var(--uc-text)_6%,transparent)] shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Phone frame bezel */}
      <div className="relative overflow-hidden rounded-[24px] border-[5px] border-[#151515] bg-[#151515] shadow-[0_16px_40px_rgba(0,0,0,0.4)] w-[162px] h-[339px] flex items-center justify-center">
        {/* Dynamic Island inside preview */}
        <div className="absolute top-[8px] z-[50] h-[8px] w-[38px] rounded-full bg-[#151515]" />

        {/* Screen container with isolation and translateZ to ensure perfect round corner clipping */}
        <div
          className="relative h-[329px] w-[152px] overflow-hidden rounded-[19px] bg-[var(--uc-app-bg)] isolate"
          style={{ transform: "translateZ(0)" }}
        >
          <div className="h-[812px] w-[375px] origin-top-left scale-[0.40533] rounded-[47px] overflow-hidden">
            <HuThemeShell theme={theme} themeScope="home">
              <HuThemeMotionLayer motionProgress={0.04} preview theme={theme} />
              <StatusBar variant={phoneChromeUsesLightForeground ? "dark" : "light"} />
              <div className="relative z-[1] h-[54px] flex-shrink-0" />
              <div className="relative z-[2] flex-shrink-0">
                <HuLightHeader
                  title="Home"
                  showAmounts={showAmounts}
                  onMessages={() => undefined}
                  onToggleAmounts={() => undefined}
                  preview
                />
              </div>
              <div className="scrollbar-hide relative z-[1] flex-1 overflow-hidden pb-[104px]">
                <HuHomeContent
                  concept={concept}
                  onCardDetails={() => undefined}
                  onMoreOptions={() => undefined}
                  onRequestMoney={() => undefined}
                  onSendMoney={() => undefined}
                  pendingActions={HU_PENDING_ACTIONS}
                  preview
                  showAmounts={showAmounts}
                />
              </div>
              <HuLightBottomNav activeNav="home" onChange={() => undefined} />
              {/* Home indicator bar */}
              <div className="absolute inset-x-0 bottom-[8px] z-[40] flex justify-center">
                <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-text)] opacity-[0.3]" />
              </div>
            </HuThemeShell>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HuThemeCarousel({
  appliedThemeId,
  onSelectTheme,
  selectedThemeId,
}: {
  appliedThemeId: HuThemeId;
  onSelectTheme: (themeId: HuThemeId) => void;
  selectedThemeId: HuThemeId;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isActive: false,
    scrollLeft: 0,
    startX: 0,
  });
  const suppressClickRef = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      isActive: true,
      scrollLeft: carouselRef.current?.scrollLeft ?? 0,
      startX: event.clientX,
    };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const carousel = carouselRef.current;

    if (!dragStateRef.current.isActive || !carousel) {
      return;
    }

    const dragDelta = event.clientX - dragStateRef.current.startX;

    if (Math.abs(dragDelta) > 12) {
      suppressClickRef.current = true;
    }

    carousel.scrollLeft = dragStateRef.current.scrollLeft - dragDelta;
  };

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const hadDragged = suppressClickRef.current;

    dragStateRef.current.isActive = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (hadDragged) {
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 160);
    }
  };

  const handleThemeClick = (themeId: HuThemeId) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onSelectTheme(themeId);
  };

  return (
    <div
      ref={carouselRef}
      className="scrollbar-hide flex w-full cursor-grab touch-pan-x select-none gap-[16px] overflow-x-auto px-[6px] py-[8px] active:cursor-grabbing"
      onPointerCancel={finishPointerDrag}
      onPointerDown={handlePointerDown}
      onPointerLeave={finishPointerDrag}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
    >
      {HU_THEME_PRESETS.map((theme) => {
        const isSelected = theme.id === selectedThemeId;
        const isApplied = theme.id === appliedThemeId;

        return (
          <button
            key={theme.id}
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={isSelected}
            className="flex w-[78px] shrink-0 flex-col items-center text-center"
            draggable={false}
            onClick={() => handleThemeClick(theme.id)}
            onDragStart={(event) => event.preventDefault()}
            type="button"
          >
            <span
              className={cn(
                "relative grid size-[64px] place-items-center rounded-full border transition-transform duration-200",
                isSelected
                  ? "scale-[1.04] border-[var(--uc-text)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--uc-text)_18%,transparent)]"
                  : "border-[color-mix(in_srgb,var(--uc-text)_18%,transparent)]",
              )}
              style={{ background: theme.swatchBackground }}
            >
              {isSelected ? (
                <span className="grid size-[34px] place-items-center rounded-full bg-[color-mix(in_srgb,var(--uc-app-bg)_62%,transparent)] text-[var(--uc-text)]">
                  <AppIcon name="prime-check" size={18} />
                </span>
              ) : null}
              {!isSelected && isApplied ? (
                <span className="absolute bottom-[-3px] right-[-3px] grid size-[22px] place-items-center rounded-full bg-[var(--uc-text)] text-[var(--uc-app-bg)] shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
                  <AppIcon name="prime-check" size={13} />
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "mt-[8px] max-w-full truncate text-[14px] leading-[18px] tracking-[0]",
                isSelected ? "font-bold text-[var(--uc-text)]" : "font-normal text-[color-mix(in_srgb,var(--uc-text)_68%,transparent)]",
              )}
            >
              {theme.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
