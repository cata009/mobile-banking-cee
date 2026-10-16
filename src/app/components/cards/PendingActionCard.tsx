import { bannerWeb } from "../contracts/bannerWeb";
import type { CSSProperties } from "react";

import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export const PENDING_ACTION_CARD_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Cards",
  sourceNodeId: "9104:14611",
  width: 327,
  height: 157,
  cornerRadius: 8,
} as const;


export interface PendingActionCardProps {
  title: string;
  description?: string;
  /** Optional white pill with a warning glyph and teal label (e.g. "EXPIRING ON 12.04.25"). */
  tagLabel?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Pending Action Card — 327x157 teal-gradient promo card extracted from the
 * Figma `Cards` component (node 9104:14611). A 24px bold white title and an
 * 18px regular white body sit on a left-to-right teal gradient, with an
 * optional white tag pill carrying a teal warning glyph and an uppercase teal
 * label. Renders as a button when `onClick` is supplied.
 */
export default function PendingActionCard({
  title,
  description,
  tagLabel,
  onClick,
  ariaLabel,
  className,
  style,
}: PendingActionCardProps) {
  const interactive = typeof onClick === "function";
  const Root = interactive ? "button" : "div";

  const contract = bannerWeb({ variant: "pending", interactive });

  return (
    <Root
      type={interactive ? "button" : undefined}
      onClick={onClick}
      aria-label={interactive ? (ariaLabel ?? title) : ariaLabel}
      className={cn(
        contract.rootClass,
        interactive && "cursor-pointer",
        className,
      )}
      data-component="PendingActionCard"
      data-figma-schema={PENDING_ACTION_CARD_SOURCE.schema}
      style={{ background: contract.pendingGradient, ...style }}
    >
      <span className="uc-type-l1 leading-[26px] text-[var(--uc-static-white)]">
        {title}
      </span>
      {description && (
        <span className="uc-type-p1 flex-1 whitespace-pre-line leading-[22px] text-[var(--uc-static-white)]">
          {description}
        </span>
      )}
      {tagLabel && (
        <span className="mt-auto inline-flex w-fit items-center gap-[4px] rounded-[4px] bg-[var(--uc-static-white)] px-[8px] py-[4px]">
          <AppIcon name="warning-small" size={15} color="var(--uc-action)" />
          <span className="font-['UniCredit',sans-serif] text-[12px] font-bold uppercase leading-[16px] text-[var(--uc-action)]">
            {tagLabel}
          </span>
        </span>
      )}
    </Root>
  );
}
