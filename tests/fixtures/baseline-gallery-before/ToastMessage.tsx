import type { HTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";

export type ToastMessageVariant = "action-required" | "aware" | "google-pay";

export const TOAST_MESSAGE_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Toast message",
  sourceNodeId: "178:15386",
  sourceNodeIds: {
    awareDark: "297:18333",
    googlePayDark: "297:18334",
    actionRequiredLight: "303:23659",
  },
  width: {
    default: 327,
    googlePay: 174,
  },
  height: {
    default: 32,
    googlePay: 35,
  },
  cornerRadius: 16,
} as const;

const DEFAULT_MESSAGES: Record<ToastMessageVariant, string> = {
  "action-required": "Amount exceeds balance in your account",
  aware: "You have pending payments",
  "google-pay": "Added to Google Pay",
};

export interface ToastMessageProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastMessageVariant;
  message?: string;
  dark?: boolean;
}

export default function ToastMessage({
  variant = "action-required",
  message,
  dark,
  className,
  role = "status",
  ...props
}: ToastMessageProps) {
  const isGooglePay = variant === "google-pay";
  const isDark = dark ?? variant !== "action-required";
  const displayMessage = message ?? DEFAULT_MESSAGES[variant];

  return (
    <div
      aria-live="polite"
      className={cn(
        "uc-type-n5-strong inline-flex items-center rounded-[16px] py-[10px] text-[14px] tracking-[0]",
        "shadow-none",
        isGooglePay ? "h-[35px] w-[174px] justify-center px-[27px]" : "h-[32px] w-[327px] gap-[20px] pr-[8px]",
        isDark
          ? "bg-[rgb(var(--uc-static-white-rgb)_/_0.2)] text-[var(--uc-static-white)]"
          : "bg-[rgb(var(--uc-static-black-rgb)_/_0.06)] text-[var(--uc-primary-k0,var(--uc-static-black))]",
        className,
      )}
      data-component="ToastMessage"
      data-figma-schema={TOAST_MESSAGE_SOURCE.schema}
      data-toast-message-variant={variant}
      role={role}
      {...props}
    >
      {!isGooglePay && (
        <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
          <span className="size-[8px] rounded-full bg-[var(--uc-status-red)]" />
        </span>
      )}
      <span className={cn("min-w-0 truncate [line-height:normal]", isGooglePay ? "whitespace-nowrap" : "flex-1")}>
        {displayMessage}
      </span>
    </div>
  );
}
