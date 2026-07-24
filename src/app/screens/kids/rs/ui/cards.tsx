/**
 * RS Teens card vocabulary — a real component hierarchy instead of RO's single
 * `RoCard` white rectangle used for every surface (RO flaw #1).
 *
 * The hierarchy is tuned for visual rhythm on the Home and Payments screens:
 *  - HeroCard   : themed gradient surface for the balance hero (alive from boot)
 *  - GlassCard  : translucent card for hero-adjacent quick actions
 *  - ListCard   : solid, grouped card for lists (approvals, activity, goals)
 *  - StatTile   : compact metric tile (limit, spent this week)
 *  - Banner     : informational/explainer block with an icon
 *  - QuickActionTile : the 4-icon action grid entry, accent-tinted
 *
 * All surfaces read the shared --uc-* and --hu-theme-* tokens so they adapt to
 * the active theme and light/dark automatically.
 */
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/app/components/ui/utils";
import { AppIcon, type IconName } from "@/app/components/icons";

/* ----------------------------------------------------------------------- */
/* HeroCard — themed gradient, the alive-from-boot balance surface          */
/* ----------------------------------------------------------------------- */

export function HeroCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-[24px] p-5", className)}
      style={{
        background:
          "linear-gradient(160deg, var(--hu-theme-accent) 0%, var(--hu-theme-accent-2) 55%, var(--hu-theme-page-bg) 120%)",
        color: "var(--hu-theme-hero-fg)",
        boxShadow: "0 12px 32px -12px color-mix(in srgb, var(--hu-theme-accent) 55%, transparent)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* GlassCard — translucent, used inside the hero area                       */
/* ----------------------------------------------------------------------- */

export function GlassCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("rounded-[20px] p-4", className)}
      style={{
        background: "var(--hu-theme-glass-bg)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--hu-theme-hero-control-border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* ListCard — solid grouped card (default surface for lists)               */
/* ----------------------------------------------------------------------- */

export function ListCard({
  children,
  className,
  onClick,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[18px] p-4 transition",
        onClick && "cursor-pointer active:scale-[0.99]",
        className,
      )}
      style={{
        background: "var(--hu-theme-card-bg)",
        boxShadow: "0 1px 3px color-mix(in srgb, var(--uc-shadow) 60%, transparent)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* StatTile — compact metric (limit / spent)                                */
/* ----------------------------------------------------------------------- */

export function StatTile({
  icon,
  label,
  value,
  hint,
  accent = "var(--uc-product-blue)",
}: {
  icon: IconName;
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div
      className="flex flex-1 flex-col gap-1 rounded-[16px] p-3"
      style={{ background: "var(--hu-theme-card-bg)", boxShadow: "0 1px 2px color-mix(in srgb, var(--uc-shadow) 50%, transparent)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}
        >
          <AppIcon name={icon} size={15} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--uc-text-muted)" }}>
          {label}
        </span>
      </div>
      <span className="text-[18px] font-bold leading-tight" style={{ color: "var(--uc-text)" }}>
        {value}
      </span>
      {hint && <span className="text-[11px]" style={{ color: "var(--uc-text-muted)" }}>{hint}</span>}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Banner — explainer / info block                                          */
/* ----------------------------------------------------------------------- */

export function Banner({
  icon,
  title,
  body,
  accent = "var(--uc-product-blue)",
}: {
  icon: IconName;
  title: string;
  body: string;
  accent?: string;
}) {
  return (
    <div
      className="flex gap-3 rounded-[16px] p-4"
      style={{ background: `color-mix(in srgb, ${accent} 8%, var(--hu-theme-card-bg))` }}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}
      >
        <AppIcon name={icon} size={18} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-[14px] font-bold leading-tight" style={{ color: "var(--uc-text)" }}>
          {title}
        </span>
        <span className="mt-0.5 text-[13px] leading-snug" style={{ color: "var(--uc-text-muted)" }}>
          {body}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* QuickActionTile — accent-tinted action button (the 4-icon grid)          */
/* ----------------------------------------------------------------------- */

export function QuickActionTile({
  icon,
  label,
  onClick,
  accent = "var(--uc-product-blue)",
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 active:scale-95"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-[18px] transition"
        style={{
          background: `color-mix(in srgb, ${accent} 16%, var(--hu-theme-card-bg))`,
          color: accent,
          border: `1px solid color-mix(in srgb, ${accent} 24%, transparent)`,
        }}
      >
        <AppIcon name={icon} size={24} />
      </span>
      <span className="text-[12px] font-semibold leading-tight" style={{ color: "var(--uc-text)" }}>
        {label}
      </span>
    </button>
  );
}

/* ----------------------------------------------------------------------- */
/* Progress bar (for goals)                                                 */
/* ----------------------------------------------------------------------- */

export function ProgressBar({
  progress,
  accent = "var(--uc-product-blue)",
  height = 6,
}: {
  progress: number;
  accent?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{ background: "color-mix(in srgb, var(--uc-app-bg) 70%, var(--uc-product-slate))", height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${clamped}%`,
          background: accent,
          boxShadow: `0 0 8px color-mix(in srgb, ${accent} 50%, transparent)`,
        }}
      />
    </div>
  );
}
