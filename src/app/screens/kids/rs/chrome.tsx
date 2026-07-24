/**
 * RS Teens chrome — hero header + bottom navigation with a raised "Plaćanja"
 * centre button. The raised centre tab is the visual signal that payments is
 * the hero surface, mirroring the RO design intent but with cleaner geometry.
 */
import { cn } from "@/app/components/ui/utils";
import { AppIcon, type IconName } from "@/app/components/icons";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import womanProfileSrc from "@/assets/kids/woman-profile.png";
import { RS_TEEN_PROFILE } from "./data";
import type { RsTeenNavId } from "./types";

/* ----------------------------------------------------------------------- */
/* Header                                                                   */
/* ----------------------------------------------------------------------- */

export function RsTeenHeader({
  title,
  showAmounts,
  notificationCount,
  onToggleAmounts,
  onNotifications,
}: {
  title: string;
  showAmounts: boolean;
  notificationCount: number;
  onToggleAmounts: () => void;
  onNotifications: () => void;
}) {
  return (
    <div className="flex h-[54px] items-center justify-between px-[20px]">
      <h1
        className="text-[18px] font-bold leading-none"
        style={{ color: "var(--hu-theme-hero-fg)" }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={showAmounts ? "Sakri iznose" : "Prikaži iznose"}
          onClick={onToggleAmounts}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: "var(--hu-theme-hero-control-bg)",
            color: "var(--hu-theme-hero-control-fg)",
            border: "1px solid var(--hu-theme-hero-control-border)",
          }}
        >
          <AppIcon name={showAmounts ? "amount-hide" : "amount-show"} size={18} />
        </button>
        <button
          type="button"
          aria-label="Obaveštenja"
          onClick={onNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: "var(--hu-theme-hero-control-bg)",
            color: "var(--hu-theme-hero-control-fg)",
            border: "1px solid var(--hu-theme-hero-control-border)",
          }}
        >
          <AppIcon name="header-messages" size={18} />
          {notificationCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ background: "var(--uc-red-main)" }}
            >
              {notificationCount}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label="Profil"
          className="grid place-items-center rounded-full"
        >
          <ProfileAvatar
            imageAlt={`${RS_TEEN_PROFILE.name} profil`}
            imageSrc={womanProfileSrc}
            size={36}
            variant="photo"
          />
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Bottom navigation — raised centre "Plaćanja" hero button                 */
/* ----------------------------------------------------------------------- */

type NavItem = { id: RsTeenNavId; label: string; icon: IconName; hero?: boolean };

const NAV_ITEMS: readonly [NavItem, NavItem, NavItem, NavItem, NavItem] = [
  { id: "home", label: "Početak", icon: "nav-home" },
  { id: "learn", label: "Uči", icon: "hu-kids-learn" },
  { id: "payments", label: "Plaćanja", icon: "nav-payments", hero: true },
  { id: "card", label: "Kartica", icon: "credit-card" },
  { id: "profile", label: "Profil", icon: "user-round" },
];

export function RsTeenBottomNav({
  activeNav,
  onChange,
  pendingCount,
}: {
  activeNav: RsTeenNavId;
  onChange: (nav: RsTeenNavId) => void;
  pendingCount: number;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[20] h-[88px]"
      style={{ background: "var(--hu-theme-nav-bg)", backdropFilter: "blur(10px)" }}
    >
      <div className="relative flex h-full items-end justify-around px-2 pb-4">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          if (item.hero) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className="relative -mt-6 flex flex-col items-center gap-1"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white transition active:scale-90"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--hu-theme-accent-strong), var(--hu-theme-accent))",
                    boxShadow:
                      "0 10px 22px -6px color-mix(in srgb, var(--hu-theme-accent) 60%, transparent)",
                    border: "3px solid var(--hu-theme-nav-bg)",
                  }}
                >
                  <AppIcon name={item.icon} size={24} />
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: isActive ? "var(--hu-theme-accent-strong)" : "var(--uc-text-muted)" }}
                >
                  {item.label}
                </span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className="relative flex w-12 flex-col items-center gap-1 pb-1"
            >
              <span className="relative">
                <AppIcon
                  name={item.icon}
                  size={22}
                  className={cn("transition", isActive ? "scale-105" : "opacity-60")}
                />
                {item.id === "home" && pendingCount > 0 && (
                  <span
                    className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full"
                    style={{ background: "var(--uc-red-main)" }}
                  />
                )}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? "var(--hu-theme-accent-strong)" : "var(--uc-text-muted)" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
