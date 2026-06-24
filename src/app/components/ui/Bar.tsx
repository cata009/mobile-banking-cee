import type { HTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export const BAR_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeId: "1058:22155",
  width: 375,
  height: 8,
  thinWidth: 279,
  thinHeight: 1,
} as const;

export type BarStatus = "empty" | "full" | "mid-1" | "mid-2" | "small" | "thin";

const STATUS_WIDTH: Record<Exclude<BarStatus, "empty" | "thin">, number> = {
  full: 327,
  "mid-1": 176,
  "mid-2": 64,
  small: 16,
};

type BarProps = HTMLAttributes<HTMLDivElement> & {
  status?: BarStatus;
};

export default function Bar({ status = "empty", className, ...props }: BarProps) {
  if (status === "thin") {
    return (
      <div
        className={cn("relative h-px w-[279px] shrink-0 bg-[var(--uc-neutral-300)]", className)}
        data-bar-status={status}
        role="presentation"
        {...props}
      >
        <span className="absolute inset-y-0 left-0 w-[109px] bg-[var(--uc-neutral-700)]" />
      </div>
    );
  }

  const value = status === "empty" ? 0 : STATUS_WIDTH[status];

  return (
    <div
      className={cn("relative h-[8px] w-[375px] shrink-0 bg-[var(--uc-static-white)]", className)}
      data-bar-status={status}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={327}
      aria-valuenow={value}
      {...props}
    >
      {value > 0 ? (
        <span
          className="absolute bottom-0 left-[24px] top-0 rounded-[4px] bg-[var(--uc-action)]"
          style={{ width: value }}
        />
      ) : null}
    </div>
  );
}
