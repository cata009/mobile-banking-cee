/**
 * RS Teens UI atoms — the small reusable primitives.
 *
 * Includes the animated SpendRing (fix for RO flaw #4: RO's ring was a static SVG
 * with no arc animation) and the live DecisionBadge used by the pay flow.
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/app/components/ui/utils";
import { AppIcon, type IconName } from "@/app/components/icons";
import type { PaymentDecisionStatus } from "../types";
import { formatRsd } from "../money";
import { MerchantLogoMark } from "./merchantLogos";
import type { RsPayee } from "../types";

/* ----------------------------------------------------------------------- */
/* Status pill                                                              */
/* ----------------------------------------------------------------------- */

const STATUS_PILL_TONE: Record<string, { bg: string; fg: string }> = {
  instant: { bg: "color-mix(in srgb, var(--uc-green-main) 18%, transparent)", fg: "var(--uc-green-deep)" },
  pending: { bg: "color-mix(in srgb, var(--uc-product-blue) 18%, transparent)", fg: "var(--uc-product-blue-deep)" },
  approved: { bg: "color-mix(in srgb, var(--uc-green-main) 18%, transparent)", fg: "var(--uc-green-deep)" },
  declined: { bg: "color-mix(in srgb, var(--uc-red-main) 16%, transparent)", fg: "var(--uc-red-deep)" },
  blocked: { bg: "color-mix(in srgb, var(--uc-red-main) 16%, transparent)", fg: "var(--uc-red-deep)" },
};

export function StatusPill({
  children,
  tone = "pending",
}: {
  children: React.ReactNode;
  tone?: keyof typeof STATUS_PILL_TONE;
}) {
  const fallback = { bg: "transparent", fg: "var(--uc-text)" };
  const entry = STATUS_PILL_TONE[tone] ?? STATUS_PILL_TONE.pending ?? fallback;
  const bg = entry?.bg ?? fallback.bg;
  const fg = entry?.fg ?? fallback.fg;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold leading-none"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------------------- */
/* Payee avatar (merchant logo OR initials)                                 */
/* ----------------------------------------------------------------------- */

export function PayeeAvatar({
  payee,
  size = 44,
}: {
  payee: RsPayee;
  size?: number;
}) {
  if (payee.merchantLogo) {
    return <MerchantLogoMark logo={payee.merchantLogo} className="flex-shrink-0" />;
  }
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${payee.accent} 88%, #000)`,
        fontSize: size * 0.36,
      }}
    >
      {payee.initials ?? payee.name.slice(0, 1)}
    </span>
  );
}

/* ----------------------------------------------------------------------- */
/* Animated spend ring (fix for RO flaw #4)                                 */
/* ----------------------------------------------------------------------- */

export function SpendRing({
  progress,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  showAmounts = true,
  accent = "var(--uc-product-blue)",
}: {
  progress: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
  showAmounts?: boolean;
  accent?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Animate the arc from 0 → progress on mount and when progress changes.
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Math.max(0, Math.min(100, progress));
    const duration = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [progress]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, displayed));
  const dash = (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, var(--uc-app-bg) 60%, var(--uc-product-slate))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          style={{ filter: `drop-shadow(0 0 6px color-mix(in srgb, ${accent} 45%, transparent))` }}
        />
      </svg>
      <div className="-mt-[58%] flex flex-col items-center">
        <span className="text-[22px] font-bold leading-none" style={{ color: "var(--uc-text)" }}>
          {showAmounts ? label : "•••"}
        </span>
        {sublabel && showAmounts && (
          <span className="mt-1 text-[11px] font-medium" style={{ color: "var(--uc-text-muted)" }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Amount field (chips + numeric input)                                     */
/* ----------------------------------------------------------------------- */

export function AmountField({
  value,
  onChange,
  chips,
  onChip,
  suffix = "RSD",
  autoFocus = true,
}: {
  value: string;
  onChange: (next: string) => void;
  chips?: number[];
  onChip?: (amount: number) => void;
  suffix?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-baseline justify-center gap-2">
        <input
          inputMode="decimal"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, "").replace(/,/g, "."))}
          placeholder="0"
          aria-label="Iznos"
          className="w-[160px] bg-transparent text-center text-[44px] font-bold leading-none outline-none"
          style={{ color: "var(--uc-text)" }}
        />
        <span className="text-[16px] font-semibold" style={{ color: "var(--uc-text-muted)" }}>
          {suffix}
        </span>
      </div>
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChip?.(chip)}
              className="rounded-full border px-3 py-1.5 text-[13px] font-semibold transition active:scale-95"
              style={{
                borderColor: "color-mix(in srgb, var(--uc-product-blue) 35%, transparent)",
                color: "var(--uc-product-blue-deep)",
                background: "color-mix(in srgb, var(--uc-product-blue) 8%, transparent)",
              }}
            >
              {formatRsd(chip)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Decision badge (live pay-flow verdict)                                   */
/* ----------------------------------------------------------------------- */

const DECISION_META: Record<
  PaymentDecisionStatus,
  { icon: IconName; label: string; bg: string; fg: string }
> = {
  instant: {
    icon: "check",
    label: "Instant",
    bg: "color-mix(in srgb, var(--uc-green-main) 16%, transparent)",
    fg: "var(--uc-green-deep)",
  },
  "needs-approval": {
    icon: "shield-check",
    label: "Na Tatu",
    bg: "color-mix(in srgb, var(--uc-product-blue) 16%, transparent)",
    fg: "var(--uc-product-blue-deep)",
  },
  blocked: {
    icon: "lock",
    label: "Blokirano",
    bg: "color-mix(in srgb, var(--uc-red-main) 14%, transparent)",
    fg: "var(--uc-red-deep)",
  },
};

export function DecisionBadge({
  status,
  reason,
}: {
  status: PaymentDecisionStatus;
  reason?: string;
}) {
  const meta = DECISION_META[status];
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: meta.bg, color: meta.fg }}
    >
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/70">
        <AppIcon name={meta.icon} size={18} />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-[14px] font-bold leading-tight">{meta.label}</span>
        {reason && <span className="text-[12px] leading-snug opacity-90">{reason}</span>}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Section heading (lightweight, themed)                                    */
/* ----------------------------------------------------------------------- */

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn("px-[24px] pt-5 pb-2 text-[13px] font-bold uppercase tracking-wide", className)}
      style={{ color: "var(--uc-text-muted)" }}
    >
      {children}
    </h3>
  );
}
