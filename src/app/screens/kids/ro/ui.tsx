/**
 * Small, reusable RO Teens UI atoms shared across the app surfaces.
 * All colours come from design tokens or per-item accents (never hardcoded hex).
 */
import type { CSSProperties, ReactNode } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { formatRon } from "./money";
import type { PaymentDecision, PaymentDecisionStatus, RoApprovalStatus, RoPayee } from "./types";

/** Circular payee avatar — initials on a soft tint of the payee accent, or an icon. */
export function RoPayeeAvatar({
  payee,
  size = 48,
}: {
  payee: Pick<RoPayee, "accent" | "initials" | "icon" | "name">;
  size?: number;
}) {
  const style = {
    width: size,
    height: size,
    background: `color-mix(in srgb, ${payee.accent} 16%, var(--uc-surface))`,
    color: payee.accent,
  } as CSSProperties;

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-bold"
      style={style}
    >
      {payee.initials ? (
        <span style={{ fontSize: Math.round(size * 0.36) }}>{payee.initials}</span>
      ) : (
        <AppIcon name={payee.icon} size={Math.round(size * 0.46)} />
      )}
    </span>
  );
}

const APPROVAL_STATUS_STYLE: Record<
  RoApprovalStatus,
  { label: string; bg: string; fg: string }
> = {
  pending: {
    label: "În așteptare",
    bg: "color-mix(in srgb, var(--uc-yellow-gold) 18%, var(--uc-surface))",
    fg: "color-mix(in srgb, var(--uc-yellow-gold) 72%, var(--uc-text))",
  },
  approved: {
    label: "Aprobat",
    bg: "color-mix(in srgb, var(--uc-green-success) 16%, var(--uc-surface))",
    fg: "var(--uc-green-success)",
  },
  completed: {
    label: "Trimis",
    bg: "color-mix(in srgb, var(--uc-product-blue) 16%, var(--uc-surface))",
    fg: "var(--uc-product-blue)",
  },
  declined: {
    label: "Refuzat",
    bg: "color-mix(in srgb, var(--uc-red-main) 16%, var(--uc-surface))",
    fg: "var(--uc-red-main)",
  },
};

export function RoStatusPill({ status }: { status: RoApprovalStatus }) {
  const tone = APPROVAL_STATUS_STYLE[status];
  return (
    <span
      className="inline-flex h-[24px] items-center rounded-full px-[10px] text-[12px] font-bold leading-none"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {tone.label}
    </span>
  );
}

/** SVG ring showing weekly spend vs. limit. */
export function RoSpendRing({
  spent,
  limit,
  size = 120,
  stroke = 12,
  children,
}: {
  spent: number;
  limit: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = limit > 0 ? Math.min(1, spent / limit) : 0;
  const dash = circumference * ratio;
  const overHalf = ratio > 0.85;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--hu-theme-progress-bg)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={overHalf ? "var(--uc-red-main)" : "var(--hu-theme-accent-strong)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

const DECISION_STYLE: Record<
  PaymentDecisionStatus,
  { icon: IconName; label: string; bg: string; fg: string }
> = {
  instant: {
    icon: "check",
    label: "Instant",
    bg: "color-mix(in srgb, var(--uc-green-success) 14%, var(--uc-surface))",
    fg: "var(--uc-green-success)",
  },
  "needs-approval": {
    icon: "shield-check",
    label: "Cere aprobarea Mamei",
    bg: "color-mix(in srgb, var(--uc-yellow-gold) 18%, var(--uc-surface))",
    fg: "color-mix(in srgb, var(--uc-yellow-gold) 74%, var(--uc-text))",
  },
  blocked: {
    icon: "alert-triangle",
    label: "Nu se poate trimite",
    bg: "color-mix(in srgb, var(--uc-red-main) 14%, var(--uc-surface))",
    fg: "var(--uc-red-main)",
  },
};

/** Big review banner that explains the parent-approval outcome of a payment. */
export function RoDecisionBanner({ decision }: { decision: PaymentDecision }) {
  const tone = DECISION_STYLE[decision.status];
  return (
    <div
      className="flex items-start gap-[12px] rounded-[16px] p-[16px]"
      style={{ background: tone.bg }}
    >
      <span
        className="grid size-[40px] shrink-0 place-items-center rounded-full"
        style={{ background: `color-mix(in srgb, ${tone.fg} 18%, transparent)`, color: tone.fg }}
      >
        <AppIcon name={tone.icon} size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-[16px] font-bold leading-[20px]" style={{ color: tone.fg }}>
          {tone.label}
        </p>
        <p className="mt-[4px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {decision.reason}
        </p>
      </div>
    </div>
  );
}

/** Large amount entry with RON suffix and quick-amount chips. */
export function RoAmountField({
  value,
  onChange,
  chips = [10, 20, 50],
  autoFocusHint,
}: {
  value: string;
  onChange: (next: string) => void;
  chips?: number[];
  autoFocusHint?: string;
}) {
  return (
    <div>
      <div className="flex h-[64px] items-center rounded-[14px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-[16px] focus-within:ring-2 focus-within:ring-[var(--hu-theme-accent-strong)]">
        <input
          aria-label="Sumă"
          className="min-w-0 flex-1 bg-transparent text-[32px] font-bold leading-[36px] text-[var(--uc-text)] outline-none"
          inputMode="numeric"
          placeholder="0"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
        />
        <span className="text-[18px] font-bold text-[var(--uc-text-muted)]">RON</span>
      </div>
      <div className="mt-[12px] flex gap-[8px]">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className={cn(
              "h-[38px] flex-1 rounded-full text-[14px] font-bold transition",
              String(chip) === value
                ? "bg-[var(--hu-theme-accent-strong)] text-[var(--uc-text-inverse)]"
                : "bg-[var(--hu-theme-control-bg)] text-[var(--uc-text)]",
            )}
            onClick={() => onChange(String(chip))}
          >
            {formatRon(chip)}
          </button>
        ))}
      </div>
      {autoFocusHint ? (
        <p className="mt-[8px] text-[13px] leading-[17px] text-[var(--uc-text-muted)]">{autoFocusHint}</p>
      ) : null}
    </div>
  );
}

/** Section card wrapper used across the teen surfaces. */
export function RoCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-[16px] bg-[var(--hu-theme-card-bg)] shadow-sm",
        padded ? "p-[16px]" : undefined,
        className,
      )}
    >
      {children}
    </section>
  );
}
