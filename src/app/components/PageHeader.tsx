import type { ReactNode } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import { pageHeaderWeb } from "./contracts/pageHeaderWeb";
import type { PageHeaderOptions } from "./contracts/pageHeader";

interface PageHeaderProps extends PageHeaderOptions {
  title: string;
  onBack: () => void;
  onHelpClick?: () => void;
  onRightActionClick?: () => void;
  rightActionIcon?: ReactNode;
  rightActionLabel?: string;
  rightActionPressed?: boolean;
  backIconName?: IconName;
  backLabel?: string;
  largeTitleAlign?: "left" | "center";
  largeTitleColor?: string;
  /** Sits before the large title, e.g. the category icon of the page being read. */
  leadingVisual?: ReactNode;
  /** Rendered under the large title — a total, a count, whatever names the page's figures. */
  subtitle?: ReactNode;
  headerSubtitle?: ReactNode;
}

export default function PageHeader({
  title,
  onBack,
  onHelpClick,
  onRightActionClick,
  variant = "light",
  showHelp = true,
  showBack = true,
  compact = false,
  renderLargeTitle = true,
  collapsedTitleProgress = 0,
  includeSafeArea = false,
  rightActionIcon,
  rightActionLabel = "Action",
  rightActionPressed,
  backIconName = "back-heavy",
  backLabel = "Back",
  largeTitleAlign = "left",
  largeTitleColor,
  hideCollapsedTitleWhenHidden = false,
  leadingVisual,
  subtitle,
  headerSubtitle,
}: PageHeaderProps) {
  const contract = pageHeaderWeb({ variant, showHelp, showBack, compact, renderLargeTitle, collapsedTitleProgress, includeSafeArea, hideCollapsedTitleWhenHidden });
  const { iconColor, textColor, bgColor, titleProgress, largeTitleOpacity, shouldRenderLargeTitle, stickyBgStyle } = contract;

  const largeTitle = (
    <h1
      className={cn("uc-type-h1", textColor)}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: largeTitleColor,
      }}
    >
      {title}
    </h1>
  );

  const rightAction = rightActionIcon ? (
    <button
      onClick={onRightActionClick}
      className={contract.actionClass}
      style={contract.actionStyle}
      aria-label={rightActionLabel}
      aria-pressed={rightActionPressed}
      title={rightActionLabel}
    >
      {rightActionIcon}
    </button>
  ) : showHelp ? (
    <button
      onClick={onHelpClick}
      className={contract.actionClass}
      style={contract.actionStyle}
      aria-label="Help"
    >
      <AppIcon name="help-circle" color={iconColor} />
    </button>
  ) : null;

  return (
    <>
      <div
        className={cn(
          "sticky z-10 w-full transition-shadow duration-200",
          "top-0",
          variant !== "dark" && variant !== "gray" ? bgColor : "",
          includeSafeArea ? "pt-[var(--uc-phone-top-reserve,54px)]" : ""
        )}
        style={stickyBgStyle}
      >
        <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
          {showBack ? (
            <button
              onClick={onBack}
              className={contract.actionClass}
              style={contract.actionStyle}
              aria-label={backLabel}
              title={backLabel}
            >
              <AppIcon name={backIconName} color={iconColor} />
            </button>
          ) : (
            <div className="h-[40px] w-[40px]" />
          )}

          <div
            className="pointer-events-none min-w-0 text-center"
            aria-hidden={contract.collapsedTitleHidden}
            style={{
              opacity: titleProgress,
              transform: `translateY(${contract.collapsedTitleTranslateY}px)`,
            }}
          >
            <h1 className={cn("uc-type-n4-strong truncate", textColor)}>{title}</h1>
            {headerSubtitle ? (
              <p className="mt-[2px] truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
                {headerSubtitle}
              </p>
            ) : null}
          </div>

          {rightAction}
        </div>
      </div>

      {shouldRenderLargeTitle ? (
        <div
          className={cn(
            "flex items-center gap-[12px]",
            largeTitleAlign === "center" ? "justify-center text-center" : "",
            bgColor
          )}
          style={{
            width: "100%",
            padding: "8px 16px",
            opacity: largeTitleOpacity,
          }}
        >
          {leadingVisual}
          {/* Only pages that pass a visual or a subtitle get the extra wrapper; the rest keep the bare title. */}
          {leadingVisual || subtitle ? (
            <div className="min-w-0 flex-1">
              {largeTitle}
              {subtitle}
            </div>
          ) : largeTitle}
        </div>
      ) : null}
    </>
  );
}
