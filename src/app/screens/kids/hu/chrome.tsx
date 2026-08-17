/**
 * HU Kids app chrome: the themed shell, the Home header, the shared PI-menu
 * frame used by sub-pages, and the bottom navigation.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import type { CSSProperties, ReactNode, UIEvent } from "react";
import App2027PrimaryNavigation from "@/app/components/navigation/App2027PrimaryNavigation";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import womanProfileSrc from "@/assets/kids/woman-profile.png";
import { getHuThemeStyle, type HuThemePreset } from "./theme";
import type { HuLightNavId } from "./types";

function HuKidsPiMenuHeader({
  onMessages,
  onToggleAmounts,
  showAmounts = true,
  title,
}: {
  onMessages?: () => void;
  onToggleAmounts?: () => void;
  showAmounts?: boolean;
  title: string;
}) {
  return (
    <div className="w-full pb-[22px]">
      <HuLightHeader
        title={title}
        onMessages={onMessages}
        onToggleAmounts={onToggleAmounts ?? (() => undefined)}
        showAmounts={showAmounts}
      />
    </div>
  );
}

export function HuKidsPiMenuFrame({
  bottomPadding = 104,
  children,
  header,
  onMessages,
  onToggleAmounts,
  onScroll,
  showAmounts,
  theme,
  title,
}: {
  bottomPadding?: number;
  children: ReactNode;
  header?: ReactNode;
  onMessages?: () => void;
  onToggleAmounts?: () => void;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  showAmounts?: boolean;
  theme: HuThemePreset;
  title: string;
}) {
  const isThemed = theme.id !== "default";
  // Pi-menu pages need a fully opaque tinted background + white cards that pop.
  // The dark HuThemeShell page-bg must NOT bleed through anywhere.
  const frameStyle = {
    "--hu-kids-menu-bg": isThemed ? "var(--hu-theme-subpage-bg)" : "var(--uc-app-bg)",
    "--hu-kids-menu-header-bg": isThemed ? "var(--hu-theme-subpage-header-bg)" : "var(--uc-app-bg)",
    "--hu-kids-menu-title-fg": "var(--uc-text)",
    ...(isThemed ? { "--uc-action": "var(--hu-theme-accent-strong)" } : {}),
  } as CSSProperties;
  // When themed: ALL card backgrounds → clean white so they pop off the tinted page.
  // When default: keep native PI gray gradients (existing behavior).
  const contentStyle = {
    "--pi-payment-hero-bg": isThemed ? "var(--uc-surface)" : "var(--hu-theme-native-card-bg)",
    "--pi-payment-hero-shadow": isThemed ? "var(--hu-theme-pi-card-shadow)" : "var(--hu-theme-native-card-shadow)",
    "--pi-menu-card-bg": isThemed ? "var(--uc-surface)" : "var(--hu-theme-native-card-bg)",
    "--pi-menu-card-shadow": isThemed ? "var(--hu-theme-pi-card-shadow)" : "var(--hu-theme-native-card-shadow)",
    "--pi-offer-card-bg": isThemed ? "var(--uc-surface)" : "var(--uc-surface)",
    "--pi-shortcut-icon-fg": "var(--uc-text-inverse)",
    ...(isThemed
      ? {
          "--uc-action": "var(--hu-theme-accent-strong)",
          "--pi-shortcut-icon-bg": "var(--hu-theme-accent-strong)",
        }
      : {}),
  } as CSSProperties;

  return (
    <div
      className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--hu-kids-menu-bg)] text-[var(--uc-text)]"
      data-hu-kids-themed-section={theme.id}
      style={frameStyle}
    >
      {/* Header zone (status-bar spacer + title) and the scroll area are all
          transparent so the single frame gradient flows continuously from the
          status bar through the title into the content — no flat header band,
          no color step/kink. The menu header never overlaps scrolled content
          (scroll is confined to the inner area below the title), so it does
          NOT need an opaque backing. */}
      <div className="relative z-[1] h-[54px] flex-shrink-0" />
      <div
        className="relative z-[1]"
        style={isThemed ? ({ "--uc-text": "var(--hu-kids-menu-title-fg)" } as CSSProperties) : undefined}
      >
        {header ?? (
          <HuKidsPiMenuHeader
            onMessages={onMessages}
            onToggleAmounts={onToggleAmounts}
            showAmounts={showAmounts}
            title={title}
          />
        )}
      </div>
      <div
        className="scrollbar-hide relative z-[1] min-h-0 flex-1 overflow-y-auto"
        onScroll={onScroll}
        style={{ paddingBottom: `${bottomPadding}px` }}
      >
        <div className="min-h-full" style={contentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function HuThemeShell({
  children,
  className,
  shellBackground = "var(--hu-theme-page-bg)",
  theme,
  themeScope,
}: {
  children: ReactNode;
  className?: string;
  shellBackground?: string;
  theme: HuThemePreset;
  themeScope?: string;
}) {
  // Only the L1 hero pages (Home / Analytics) float translucent glass cards
  // over the live atmosphere. Detail and menu views keep solid clean surfaces
  // so the dark/colored page top never leaks behind their content.
  const usesGlassSurfaces =
    theme.id !== "default" && (themeScope === "home" || themeScope === "analytics");
  const shellStyle = {
    ...getHuThemeStyle(theme),
    ...(usesGlassSurfaces
      ? {
          "--hu-theme-card-bg": "var(--hu-theme-glass-bg)",
          "--hu-theme-card-strong-bg": "var(--hu-theme-glass-strong-bg)",
        }
      : {}),
    "--hu-theme-shell-bg": shellBackground,
    background: "var(--hu-theme-shell-bg)",
  } as CSSProperties;

  return (
    <div
      className={cn("relative flex h-full w-full flex-col overflow-hidden text-[var(--uc-text)]", className)}
      data-hu-theme={theme.id}
      data-hu-kids-theme-scope={themeScope}
      style={shellStyle}
    >
      <div className="absolute inset-0" style={{ background: "var(--hu-theme-shell-bg)" }} />
      {children}
    </div>
  );
}

export function HuLightHeader({
  onMessages,
  preview = false,
  showAmounts,
  onToggleAmounts,
  title,
}: {
  onMessages?: () => void;
  preview?: boolean;
  showAmounts: boolean;
  onToggleAmounts: () => void;
  title: string;
}) {
  return (
    <header className="relative z-[2] flex h-[40px] items-center justify-between px-[24px]">
      <h1 className="min-w-0 truncate text-[26px] font-bold leading-[31px] tracking-[0] text-[var(--hu-theme-hero-fg)]">
        {title}
      </h1>

      <div className="flex items-center gap-[10px]">
        <button
          aria-label={showAmounts ? "Hide amounts" : "Show amounts"}
          className="grid size-[26px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]"
          disabled={preview}
          onClick={onToggleAmounts}
          type="button"
        >
          <AppIcon name={showAmounts ? "amount-hide" : "amount-show"} size={15} />
        </button>
        <button
          aria-label="Messages"
          className="grid size-[26px] place-items-center rounded-full border border-[color-mix(in_srgb,var(--hu-theme-hero-control-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--hu-theme-hero-control-bg)_72%,transparent)] text-[var(--hu-theme-hero-control-fg)] backdrop-blur-[10px]"
          disabled={preview}
          onClick={onMessages}
          type="button"
        >
          <AppIcon name="header-messages" size={17} />
        </button>
        <button aria-label="Profile" className="grid size-[34px] place-items-center rounded-full" type="button">
          <ProfileAvatar
            imageAlt="Alexandra profile"
            imageSrc={womanProfileSrc}
            size={34}
            variant="photo"
          />
        </button>
      </div>
    </header>
  );
}

export function HuLightBottomNav({
  activeNav,
  onChange,
}: {
  activeNav: HuLightNavId;
  onChange: (tab: HuLightNavId) => void;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-center pb-[8px]"
      data-app-2027-navigation-dock
      style={
        {
          "--uc-bottom-bar-bg": "var(--hu-theme-nav-bg)",
        } as CSSProperties
      }
    >
      <App2027PrimaryNavigation
        activeTab={activeNav}
        ariaLabel="Kids primary navigation"
        className="pointer-events-auto"
        iconOverrides={{ analytics: "hu-kids-learn", products: "hu-kids-saving" }}
        labels={{ analytics: "Earning", products: "Saving" }}
        onTabChange={onChange}
      />
    </div>
  );
}
