/**
 * RO Teens app chrome: the hero header and the payments-forward bottom nav.
 *
 * The theming shell + ambient motion layer are reused from the HU Kids modules
 * (generic, string-free infrastructure) — see RoTeensApp. This file owns only
 * the Romanian, teen-branded header and navigation.
 */
import type { CSSProperties } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { cn } from "@/app/components/ui/utils";
import { RO_TEEN_PROFILE } from "./data";
import type { RoTeenNavId } from "./types";

export function RoTeenHeader({
  title,
  showAmounts,
  onToggleAmounts,
  onNotifications,
  notificationCount = 0,
}: {
  title: string;
  showAmounts: boolean;
  onToggleAmounts: () => void;
  onNotifications: () => void;
  notificationCount?: number;
}) {
  return (
    <header className="relative z-[2] flex h-[40px] items-center justify-between px-[24px]">
      <h1 className="min-w-0 truncate text-[26px] font-bold leading-[31px] text-[var(--hu-theme-hero-fg)]">
        {title}
      </h1>

      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          aria-label={showAmounts ? "Ascunde sumele" : "Arată sumele"}
          className="grid size-[26px] place-items-center rounded-full border border-[var(--hu-theme-hero-control-border)] bg-[var(--hu-theme-hero-control-bg)] text-[var(--hu-theme-hero-control-fg)] shadow-sm backdrop-blur-[10px]"
          onClick={onToggleAmounts}
        >
          <AppIcon name={showAmounts ? "amount-hide" : "amount-show"} size={15} />
        </button>
        <button
          type="button"
          aria-label="Notificări"
          className="relative grid size-[26px] place-items-center rounded-full border border-[color-mix(in_srgb,var(--hu-theme-hero-control-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--hu-theme-hero-control-bg)_72%,transparent)] text-[var(--hu-theme-hero-control-fg)] backdrop-blur-[10px]"
          onClick={onNotifications}
        >
          <AppIcon name="header-messages" size={17} />
          {notificationCount > 0 ? (
            <span className="absolute -right-[3px] -top-[3px] grid min-h-[16px] min-w-[16px] place-items-center rounded-full bg-[var(--uc-red-main)] px-[4px] text-[10px] font-bold leading-none text-[var(--uc-static-white)]">
              {notificationCount}
            </span>
          ) : null}
        </button>
        <span className="grid size-[34px] place-items-center rounded-full">
          <ProfileAvatar initials={RO_TEEN_PROFILE.initials} size={34} variant="initials" />
        </span>
      </div>
    </header>
  );
}

type RoNavItem = { id: RoTeenNavId; label: string; icon: IconName };

const RO_NAV_ITEMS: readonly RoNavItem[] = [
  { id: "home", label: "Acasă", icon: "nav-home" },
  { id: "goals", label: "Obiective", icon: "piggy-bank" },
  { id: "payments", label: "Plăți", icon: "nav-payments" },
  { id: "card", label: "Card", icon: "credit-card" },
  { id: "profile", label: "Profil", icon: "user-round" },
];

export function RoTeenBottomNav({
  activeNav,
  onChange,
  pendingCount = 0,
}: {
  activeNav: RoTeenNavId;
  onChange: (tab: RoTeenNavId) => void;
  pendingCount?: number;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 border-t border-[var(--uc-border-muted)] bg-[var(--hu-theme-nav-bg)] shadow-[0_-10px_28px_color-mix(in_srgb,var(--uc-static-black)_12%,transparent)] backdrop-blur-md"
      style={{ "--uc-action": "var(--hu-theme-accent-strong)" } as CSSProperties}
    >
      <nav className="mx-auto flex h-[64px] max-w-[420px] items-stretch justify-between px-[12px] pb-[env(safe-area-inset-bottom)]">
        {RO_NAV_ITEMS.map((item) => {
          const active = activeNav === item.id;
          const isHero = item.id === "payments";

          if (isHero) {
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className="flex w-[64px] flex-col items-center justify-start"
                onClick={() => onChange(item.id)}
              >
                <span
                  className={cn(
                    "-mt-[18px] grid size-[54px] place-items-center rounded-full text-[var(--uc-text-inverse)] shadow-lg transition-transform active:scale-95",
                    "bg-[var(--hu-theme-accent-strong)]",
                    active ? "ring-4 ring-[color-mix(in_srgb,var(--hu-theme-accent-strong)_28%,transparent)]" : undefined,
                  )}
                >
                  <AppIcon name={item.icon} size={24} />
                </span>
                <span className="mt-[3px] text-[11px] font-bold leading-none text-[var(--hu-theme-accent-strong)]">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center justify-center gap-[4px]"
              onClick={() => onChange(item.id)}
            >
              <span
                className={cn(
                  "grid size-[26px] place-items-center transition-colors",
                  active ? "text-[var(--hu-theme-accent-strong)]" : "text-[var(--uc-text-muted)]",
                )}
              >
                <AppIcon name={item.icon} size={23} />
                {item.id === "profile" && pendingCount > 0 ? (
                  <span className="absolute right-[14px] top-[2px] grid min-h-[15px] min-w-[15px] place-items-center rounded-full bg-[var(--uc-red-main)] px-[3px] text-[9px] font-bold leading-none text-[var(--uc-static-white)]">
                    {pendingCount}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold leading-none",
                  active ? "text-[var(--hu-theme-accent-strong)]" : "text-[var(--uc-text-muted)]",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
