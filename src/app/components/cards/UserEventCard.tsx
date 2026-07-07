import type { CSSProperties, ReactNode } from "react";

import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export const USER_EVENT_CARD_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "User events",
  sourceNodeIds: { full: "9104:14482", compact: "9104:14438" },
  width: 343,
  cornerRadius: 8,
} as const;

export interface UserEventCardProps {
  title: string;
  description?: string;
  /** Avatar glyph rendered white inside the 48x48 teal circle. */
  iconName?: IconName;
  /** Optional custom avatar glyph rendered inside the same 48x48 teal circle. */
  iconNode?: ReactNode;
  /** Optional teal text link (e.g. "FIND OUT MORE"). */
  actionLabel?: string;
  onActionClick?: () => void;
  /** Show the trailing 32x32 overflow/options control. */
  showOptions?: boolean;
  onOptionsClick?: () => void;
  optionsIconName?: IconName;
  optionsIconColor?: string;
  optionsAriaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * User Event Card — white shadowed card extracted from the Figma `User events`
 * component. A 48x48 teal avatar circle with a white glyph sits beside a 14px
 * bold title and a 14px regular multiline description. Two faithful layouts are
 * expressed through props: the full variant (node 9104:14482) adds a teal text
 * link and a trailing overflow control, the compact variant (node 9104:14438)
 * omits both.
 */
export default function UserEventCard({
  title,
  description,
  iconName = "user-event-badge",
  iconNode,
  actionLabel,
  onActionClick,
  showOptions = false,
  onOptionsClick,
  optionsIconName = "more-horizontal",
  optionsIconColor = "var(--uc-action)",
  optionsAriaLabel = "More options",
  className,
  style,
}: UserEventCardProps) {
  const hasAction = Boolean(actionLabel);

  return (
    <div
      className={cn(
        "flex w-[343px] max-w-full gap-[8px] rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
        hasAction ? "items-start" : "items-center",
        className,
      )}
      data-component="UserEventCard"
      data-figma-schema={USER_EVENT_CARD_SOURCE.schema}
      style={style}
    >
      <span
        className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[var(--uc-action)]"
        data-ds-label="UserEventCard avatar 48x48"
      >
        {iconNode ?? <AppIcon name={iconName} size={24} color="var(--uc-static-white)" />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
        <div className="flex flex-col">
          <span className="uc-type-n5-strong leading-[15px] text-[var(--uc-text)]">
            {title}
          </span>
          {description && (
            <span className="uc-type-n5 whitespace-pre-line leading-[15px] text-[var(--uc-text)]">
              {description}
            </span>
          )}
        </div>
        {hasAction && (
          <button
            type="button"
            onClick={onActionClick}
            className="uc-type-n5-strong self-start leading-[15px] text-[var(--uc-action)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {showOptions && (
        <button
          type="button"
          onClick={onOptionsClick}
          aria-label={optionsAriaLabel}
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center"
          data-ds-label="UserEventCard options 32x32"
        >
          <AppIcon name={optionsIconName} color={optionsIconColor} />
        </button>
      )}
    </div>
  );
}
