import type { ReactNode } from "react";
import ToggleButton from "@/app/components/ToggleButton";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

export const NAVIGATION_ROW_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeIds: {
    menigaAdditionalCases: "1515:1995",
    iconTitle: "1515:2018",
    iconDescription: "1515:2029",
    iconCta: "1515:2037",
    iconReaded: "1515:2046",
    iconPrelogin: "1515:2024",
    noIconTitle: "1515:2063",
    noIconDescription: "1515:2068",
    noIconCta: "1515:2074",
    toggleTitle: "1515:2088",
    toggleDescription: "1515:2093",
    toggleCta: "1515:2081",
    toggleTitleLightRestyle: "1516:2186",
    toggleDescriptionLightRestyle: "1516:2219",
    toggleIconLightRestyle: "1566:321",
    specialCard: "1515:1996",
    specialTextMessage: "1515:2005",
    specialCta: "1515:2008",
    specialPaymentType: "1515:2011",
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
type NavigationRowHeight = 64 | 80;

export interface NavigationRowProps {
  title: string;
  description?: string;
  linkLabel?: string;
  leadingIconName?: IconName;
  leadingVisual?: ReactNode;
  trailingAccessory?: NavigationRowAccessory;
  chevronIconName?: IconName;
  toggleChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  onClick?: () => void;
  onLinkClick?: () => void;
  ariaLabel?: string;
  className?: string;
  trailing?: ReactNode;
  rowHeight?: NavigationRowHeight;
  centerContent?: boolean;
  titleTone?: "default" | "action";
  titleClassName?: string;
  descriptionClassName?: string;
}

function NavigationRowContent({
  title,
  description,
  linkLabel,
  leadingIconName,
  leadingVisual,
  trailingAccessory,
  chevronIconName,
  toggleChecked,
  onToggle,
  onLinkClick,
  trailing,
  centerContent,
  titleTone,
  titleClassName,
  descriptionClassName,
}: Omit<NavigationRowProps, "onClick" | "ariaLabel" | "className" | "rowHeight">) {
  const hasTrailing = trailingAccessory !== "none" || trailing;
  const titleColor = titleTone === "action" ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]";

  return (
    <>
      <div className={cn("flex min-w-0 flex-1 items-center gap-[16px]", centerContent ? "justify-center text-center" : null)}>
        {leadingVisual ? (
          <span className="flex shrink-0 items-center justify-center">
            {leadingVisual}
          </span>
        ) : leadingIconName ? (
          <span className="flex size-[32px] shrink-0 items-center justify-center">
            <AppIcon name={leadingIconName} color="var(--uc-text)" />
          </span>
        ) : null}

        <div className={cn("min-w-0", centerContent ? "flex-none" : "flex-1")}>
          <p className={cn("uc-type-n4-strong", titleColor, titleClassName)}>
            {title}
          </p>
          {description ? (
            <p className={cn("uc-type-n4 mt-[4px] text-[var(--uc-text)]", descriptionClassName)}>
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
  leadingVisual,
  trailingAccessory = "none",
  chevronIconName,
  toggleChecked = false,
  onToggle,
  onClick,
  onLinkClick,
  ariaLabel,
  className,
  trailing,
  rowHeight = 80,
  centerContent = false,
  titleTone = "default",
  titleClassName,
  descriptionClassName,
}: NavigationRowProps) {
  const hasLeadingIcon = Boolean(leadingIconName || leadingVisual);
  const rootClassName = cn(
    "flex w-full items-center gap-[16px] bg-[var(--uc-surface)]",
    centerContent ? "justify-center text-center" : "text-left",
    rowHeight === 64 ? "h-[64px]" : "h-[80px]",
    centerContent
      ? "px-[24px]"
      : rowHeight === 64
        ? "px-[16px]"
        : hasLeadingIcon
          ? "pl-[16px] pr-[12px]"
          : "pl-[24px] pr-[12px]",
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
          leadingVisual={leadingVisual}
          trailingAccessory={trailingAccessory}
          chevronIconName={chevronIconName}
          toggleChecked={toggleChecked}
          onToggle={onToggle}
          onLinkClick={onLinkClick}
          trailing={trailing}
          centerContent={centerContent}
          titleTone={titleTone}
          titleClassName={titleClassName}
          descriptionClassName={descriptionClassName}
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
        leadingVisual={leadingVisual}
        trailingAccessory={trailingAccessory}
        chevronIconName={chevronIconName}
        toggleChecked={toggleChecked}
        onToggle={onToggle}
        onLinkClick={onLinkClick}
        trailing={trailing}
        centerContent={centerContent}
        titleTone={titleTone}
        titleClassName={titleClassName}
        descriptionClassName={descriptionClassName}
      />
    </div>
  );
}
