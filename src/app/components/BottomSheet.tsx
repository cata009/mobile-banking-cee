import { ReactNode, useEffect, useId, useRef } from "react";
import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";

interface BottomSheetProps {
  title?: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  maxHeightOffsetPx?: number;
  fillHeight?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClose: () => void;
}

export function BottomSheet({
  title,
  subtitle,
  meta,
  children,
  maxHeightOffsetPx = 54,
  fillHeight = false,
  className,
  headerClassName,
  bodyClassName,
  onClose,
}: BottomSheetProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const getFocusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");

    const focusTimer = window.setTimeout(() => {
      (getFocusableElements()[0] ?? dialog)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-[var(--uc-overlay)]">
      <button
        aria-label="Close sheet"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={cn(
          "relative w-full overflow-y-auto rounded-t-[12px] bg-[var(--uc-sheet-bg)] p-[16px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          fillHeight && "flex flex-col overflow-hidden",
          className,
        )}
        ref={dialogRef}
        role="dialog"
        style={{ [fillHeight ? "height" : "maxHeight"]: `calc(100% - ${maxHeightOffsetPx}px)` }}
        tabIndex={-1}
      >
        <div className={cn("mb-[24px] flex items-start justify-between gap-[16px]", headerClassName)}>
          <div className="min-w-0">
            {title ? (
              <h1
                id={titleId}
                className="uc-type-h1 text-[var(--uc-text)]"
              >
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <div className="uc-type-n5 mt-[4px] text-[var(--uc-text)]">
                {subtitle}
              </div>
            ) : null}
            {meta ? <div className="mt-[4px]">{meta}</div> : null}
          </div>
          <button
            aria-label="Close"
            className="grid size-[32px] shrink-0 place-items-center bg-transparent text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-sheet-bg)]"
            onClick={onClose}
            type="button"
          >
            <AppIcon name="close-x" color="var(--uc-icon)" />
          </button>
        </div>
        <div className={bodyClassName}>{children}</div>
      </section>
    </div>
  );
}
