import type { CSSProperties } from "react";

import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export const GHOST_BANNER_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Banner",
  sourceNodeId: "9103:14301",
  width: 327,
  height: 92,
  cornerRadius: 8,
} as const;

export interface GhostBannerProps {
  title: string;
  description?: string;
  iconName?: IconName;
  iconColor?: string;
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Ghost Banner — dashed-border CTA/placeholder block extracted from the Figma
 * `Banner` component (node 9103:14301). A leading 32x32 system icon sits beside
 * a bold title and a regular multiline description. Renders as a button when
 * `onClick` is supplied, otherwise as a static region.
 */
export default function GhostBanner({
  title,
  description,
  iconName = "add-circle",
  iconColor = "var(--uc-action)",
  onClick,
  ariaLabel,
  className,
  style,
}: GhostBannerProps) {
  const interactive = typeof onClick === "function";
  const Root = interactive ? "button" : "div";

  return (
    <Root
      type={interactive ? "button" : undefined}
      onClick={onClick}
      aria-label={interactive ? (ariaLabel ?? title) : ariaLabel}
      className={cn(
        "flex w-[327px] max-w-full flex-col items-start gap-[10px] rounded-[8px] border border-dashed border-[var(--uc-text)] bg-transparent p-[16px] text-left",
        interactive && "cursor-pointer",
        className,
      )}
      data-component="GhostBanner"
      data-figma-schema={GHOST_BANNER_SOURCE.schema}
      style={style}
    >
      <div className="flex w-full items-start gap-[8px]">
        <span
          className="flex h-[32px] w-[32px] shrink-0 items-center justify-center"
          data-ds-label="GhostBanner icon 32x32"
        >
          <AppIcon name={iconName} color={iconColor} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <span className="uc-type-h2 leading-[20px] text-[var(--uc-text)]">
            {title}
          </span>
          {description && (
            <span className="uc-type-n4 whitespace-pre-line leading-[18px] text-[var(--uc-text)]">
              {description}
            </span>
          )}
        </div>
      </div>
    </Root>
  );
}
