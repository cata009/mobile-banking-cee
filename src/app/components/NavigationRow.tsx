import type { ReactNode } from "react";
import ToggleButton from "@/app/components/ToggleButton";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export const NAVIGATION_ROW_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeIds: {
    textDescriptionToggle: "9106:1711",
    textLinkToggle: "9106:1807",
    iconDescriptionChevron: "9106:1777",
  },
  dimensions: {
    width: 375,
    minHeight: 80,
    gap: 16,
    padding: {
      top: 24,
      right: 12,
      bottom: 24,
      left: 16,
    },
  },
} as const;

type NavigationRowAccessory = "none" | "chevron" | "toggle";

export interface NavigationRowProps {
  title: string;
  description?: string;
  linkLabel?: string;
  leadingIconName?: IconName;
  trailingAccessory?: NavigationRowAccessory;
  chevronIconName?: IconName;
  toggleChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  onClick?: () => void;
  onLinkClick?: () => void;
  ariaLabel?: string;
  className?: string;
  trailing?: ReactNode;
}

function NavigationRowContent({
  title,
  description,
  linkLabel,
  leadingIconName,
  trailingAccessory,
  chevronIconName,
  toggleChecked,
  onToggle,
  onLinkClick,
  trailing,
}: Omit<NavigationRowProps, "onClick" | "ariaLabel" | "className">) {
  const hasTrailing = trailingAccessory !== "none" || trailing;

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-[16px]">
        {leadingIconName ? (
          <span className="flex size-[32px] shrink-0 items-center justify-center">
            <AppIcon name={leadingIconName} color="var(--uc-text)" />
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="uc-type-n4-strong text-[var(--uc-text)]">
            {title}
          </p>
          {description ? (
            <p className="uc-type-n4 mt-[4px] text-[var(--uc-text)]">
              {description}
            </p>
          ) : null}
          {linkLabel ? (
            onLinkClick ? (
              <button
                type="button"
                className="uc-type-n5-strong mt-[4px] text-[var(--uc-action)]"
                onClick={onLinkClick}
              >
                {linkLabel}
              </button>
            ) : (
              <p className="uc-type-n5-strong mt-[4px] text-[var(--uc-action)]">
                {linkLabel}
              </p>
            )
          ) : null}
        </div>
      </div>

      {trailing ? (
        trailing
      ) : trailingAccessory === "toggle" ? (
        <ToggleButton
          ariaLabel={title}
          checked={Boolean(toggleChecked)}
          onToggle={onToggle}
        />
      ) : trailingAccessory === "chevron" ? (
        <span className="flex size-[32px] shrink-0 items-center justify-center">
          <AppIcon name={chevronIconName ?? "chevron-link"} color="var(--uc-text)" />
        </span>
      ) : hasTrailing ? (
        <span className="shrink-0" />
      ) : null}
    </>
  );
}

export default function NavigationRow({
  title,
  description,
  linkLabel,
  leadingIconName,
  trailingAccessory = "none",
  chevronIconName,
  toggleChecked = false,
  onToggle,
  onClick,
  onLinkClick,
  ariaLabel,
  className,
  trailing,
}: NavigationRowProps) {
  const rootClassName = cn(
    "flex min-h-[80px] w-full items-center gap-[16px] bg-[var(--uc-surface)] px-[16px] py-[24px] text-left",
    className,
  );

  if (onClick && !onLinkClick && trailingAccessory !== "toggle" && !trailing) {
    return (
      <button
        type="button"
        className={cn(
          rootClassName,
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2",
        )}
        onClick={onClick}
        aria-label={ariaLabel ?? title}
        data-component="NavigationRow"
      >
        <NavigationRowContent
          title={title}
          description={description}
          linkLabel={linkLabel}
          leadingIconName={leadingIconName}
          trailingAccessory={trailingAccessory}
          chevronIconName={chevronIconName}
          toggleChecked={toggleChecked}
          onToggle={onToggle}
          onLinkClick={onLinkClick}
          trailing={trailing}
        />
      </button>
    );
  }

  return (
    <div className={rootClassName} aria-label={ariaLabel} data-component="NavigationRow">
      <NavigationRowContent
        title={title}
        description={description}
        linkLabel={linkLabel}
        leadingIconName={leadingIconName}
        trailingAccessory={trailingAccessory}
        chevronIconName={chevronIconName}
        toggleChecked={toggleChecked}
        onToggle={onToggle}
        onLinkClick={onLinkClick}
        trailing={trailing}
      />
    </div>
  );
}
