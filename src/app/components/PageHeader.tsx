import type { ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

interface PageHeaderProps {
  title: string;
  onBack: () => void;
  onHelpClick?: () => void;
  onRightActionClick?: () => void;
  variant?: "light" | "dark" | "transparent" | "gray";
  showHelp?: boolean;
  showBack?: boolean;
  compact?: boolean;
  collapsedTitleProgress?: number;
  includeSafeArea?: boolean;
  rightActionIcon?: ReactNode;
  rightActionLabel?: string;
  largeTitleAlign?: "left" | "center";
  largeTitleColor?: string;
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
  collapsedTitleProgress = 0,
  includeSafeArea = false,
  rightActionIcon,
  rightActionLabel = "Action",
  largeTitleAlign = "left",
  largeTitleColor,
}: PageHeaderProps) {
  const iconColor = variant === "dark" ? "white" : "var(--uc-text)";
  const textColor = variant === "dark" ? "text-[var(--uc-static-white)]" : "text-[var(--uc-text)]";
  const bgColor =
    variant === "dark" || variant === "transparent"
      ? "bg-transparent"
      : variant === "gray"
      ? "bg-[var(--uc-app-bg)]"
      : "bg-[var(--uc-surface)]";
  const titleProgress = Math.min(1, Math.max(0, collapsedTitleProgress));
  const largeTitleOpacity = 1 - titleProgress;

  const stickyBgStyle = variant === "dark"
    ? {
        backgroundColor: `rgba(26, 26, 26, ${titleProgress * 0.95})`,
        backdropFilter: titleProgress > 0 ? "blur(8px)" : "none",
        WebkitBackdropFilter: titleProgress > 0 ? "blur(8px)" : "none",
      }
    : variant === "gray"
    ? {
        backgroundColor: "var(--uc-app-bg)",
      }
    : undefined;

  const rightAction = rightActionIcon ? (
    <button
      onClick={onRightActionClick}
      className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center"
      style={{ padding: "8px 7.998px 7.997px 7.998px" }}
      aria-label={rightActionLabel}
    >
      {rightActionIcon}
    </button>
  ) : showHelp ? (
    <button
      onClick={onHelpClick}
      className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center"
      style={{ padding: "8px 7.998px 7.997px 7.998px" }}
      aria-label="Help"
    >
      <AppIcon name="help-circle" color={iconColor} />
    </button>
  ) : (
    <div className="h-[40px] w-[40px]" />
  );

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-10 w-full transition-shadow duration-200",
          variant !== "dark" && variant !== "gray" ? bgColor : "",
          includeSafeArea ? "pt-[54px]" : ""
        )}
        style={stickyBgStyle}
      >
        <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
          {showBack ? (
            <button
              onClick={onBack}
              className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center"
              style={{ padding: "8px 7.998px 7.997px 7.998px" }}
              aria-label="Back"
            >
              <AppIcon name="back-heavy" color={iconColor} />
            </button>
          ) : (
            <div className="h-[40px] w-[40px]" />
          )}

          <h1
            className={cn("uc-type-n4-strong pointer-events-none truncate text-center", textColor)}
            style={{
              opacity: titleProgress,
              transform: `translateY(${(1 - titleProgress) * 6}px)`,
            }}
          >
            {title}
          </h1>

          {rightAction}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center",
          largeTitleAlign === "center" ? "justify-center text-center" : "",
          bgColor
        )}
        style={{
          width: "375px",
          padding: compact ? "0 24px" : "8px 16px",
          opacity: largeTitleOpacity,
        }}
      >
        <h1
          className={cn(compact ? "uc-type-l1" : "uc-type-h1", textColor)}
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
      </div>
    </>
  );
}
