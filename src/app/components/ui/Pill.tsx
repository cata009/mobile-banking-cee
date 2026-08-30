import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export type PillVariant = "primary" | "secondary" | "active-counter" | "loading-counter" | "activated";

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PillVariant;
  label?: string;
  counterText?: string;
};

function PillSuccessIcon() {
  return (
    <span
      className="flex size-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--uc-green-success)] text-[var(--uc-static-white)]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" className="size-[10px]" fill="none">
        <path
          d="M4.5 8.1 6.7 10.3 11.5 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function PillSpinner() {
  return (
    <span className="relative size-[16px] shrink-0" aria-hidden="true">
      <span className="absolute inset-[2px] rounded-full border-[2px] border-[var(--uc-neutral-300)]" />
      <span className="absolute inset-[2px] animate-spin rounded-full border-[2px] border-transparent border-t-[var(--uc-neutral-700)]" />
    </span>
  );
}

export default function Pill({
  variant = "primary",
  label,
  counterText = "0 From 30 Eur",
  className,
  type = "button",
  disabled,
  ...props
}: PillProps) {
  const isPrimary = variant === "primary";
  const isLoading = variant === "loading-counter";
  const isActivated = variant === "activated";
  const displayLabel =
    label ?? (variant === "secondary" ? "Secondary" : isLoading ? "Activate" : isActivated ? "Activated" : isPrimary ? "Primary" : counterText);

  return (
    <button
      className={cn(
        "uc-type-n5-strong flex h-[36px] w-[120px] items-center justify-center rounded-[18px] px-[8px] py-[10px] text-center leading-none tracking-[0]",
        "shadow-[0_2px_2px_rgba(0,0,0,0.2)] transition-[background-color,color,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
        "disabled:pointer-events-none disabled:opacity-50",
        isPrimary ? "bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]" : "bg-[var(--uc-surface)] text-[var(--uc-text)]",
        variant === "secondary" ? "text-[var(--uc-action)]" : null,
        className,
      )}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading || isActivated ? (
        <span className="flex min-w-0 items-center justify-center gap-[8px]">
          {isLoading ? <PillSpinner /> : <PillSuccessIcon />}
          <span className="truncate">{displayLabel}</span>
        </span>
      ) : (
        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
      )}
    </button>
  );
}
