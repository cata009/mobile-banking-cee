import type { CSSProperties } from "react";

import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export const HELPER_CARD_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Helpers",
  sourceNodeIds: { plain: "9104:14526", withLink: "9104:14570" },
  width: 343,
  cornerRadius: 4,
} as const;

export interface HelperCardProps {
  title: string;
  description?: string;
  /** Optional teal-on-white text link rendered below the message (e.g. "SEE DETAILS"). */
  actionLabel?: string;
  onActionClick?: () => void;
  /** Show the trailing close control. */
  dismissible?: boolean;
  onClose?: () => void;
  closeAriaLabel?: string;
  iconName?: IconName;
  className?: string;
  style?: CSSProperties;
}

/**
 * Helper Card — solid teal informational helper extracted from the Figma
 * `Helpers` component. A leading 32x32 white info icon sits beside a bold white
 * title and a regular white multiline body, with an optional white text link
 * and an optional close control. Two Figma variants map through props: plain
 * (node 9104:14526) and with link (node 9104:14570).
 */
export default function HelperCard({
  title,
  description,
  actionLabel,
  onActionClick,
  dismissible = false,
  onClose,
  closeAriaLabel = "Close",
  iconName = "info-circle",
  className,
  style,
}: HelperCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-[343px] max-w-full items-center gap-[8px] rounded-[4px] bg-[var(--uc-action)] p-[16px]",
        className,
      )}
      data-component="HelperCard"
      data-figma-schema={HELPER_CARD_SOURCE.schema}
      style={style}
    >
      <span
        className="flex h-[32px] w-[32px] shrink-0 items-center justify-center"
        data-ds-label="HelperCard icon 32x32"
      >
        <AppIcon name={iconName} color="var(--uc-static-white)" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[8px] pr-[24px]">
        <div className="flex flex-col gap-[4px]">
          <span className="uc-type-h2 leading-[20px] text-[var(--uc-static-white)]">
            {title}
          </span>
          {description && (
            <span className="uc-type-p1 whitespace-pre-line leading-[20px] text-[var(--uc-static-white)]">
              {description}
            </span>
          )}
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={onActionClick}
            className="uc-type-n5-strong self-start leading-[15px] text-[var(--uc-static-white)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeAriaLabel}
          className="absolute right-[12px] top-[9px] flex h-[24px] w-[24px] items-center justify-center"
          data-ds-label="HelperCard close"
        >
          <AppIcon name="close-x" size={12} color="var(--uc-static-white)" />
        </button>
      )}
    </div>
  );
}
