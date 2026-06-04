import type { CSSProperties } from "react";

import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export const INFO_BANNER_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Banner",
  sourceNodeId: "9104:14329",
  width: 327,
  height: 153,
  cornerRadius: 8,
} as const;

export interface InfoBannerProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  iconName?: IconName;
  iconColor?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Info Banner — solid-border informational block extracted from the Figma
 * `Banner` component (node 9104:14329). A leading 32x32 info icon sits beside a
 * bold title, a regular multiline description, and an optional teal text action
 * (e.g. "EDIT"). Use it for status / informational messaging, not as a primary
 * CTA — the optional inline action is the only interactive element.
 */
export default function InfoBanner({
  title,
  description,
  actionLabel,
  onActionClick,
  iconName = "info-circle",
  iconColor = "var(--uc-text)",
  className,
  style,
}: InfoBannerProps) {
  return (
    <div
      className={cn(
        "flex w-[327px] max-w-full items-start gap-[8px] rounded-[8px] border border-solid border-[var(--uc-text)] bg-transparent p-[16px]",
        className,
      )}
      data-component="InfoBanner"
      data-figma-schema={INFO_BANNER_SOURCE.schema}
      style={style}
    >
      <span
        className="flex h-[32px] w-[32px] shrink-0 items-center justify-center"
        data-ds-label="InfoBanner icon 32x32"
      >
        <AppIcon name={iconName} color={iconColor} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex flex-col gap-[4px]">
          <span className="uc-type-h2 leading-[20px] text-[var(--uc-text)]">
            {title}
          </span>
          {description && (
            <span className="uc-type-n4 whitespace-pre-line leading-[18px] text-[var(--uc-text)]">
              {description}
            </span>
          )}
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={onActionClick}
            className="uc-type-n5-strong self-start leading-[15px] text-[var(--uc-action)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
