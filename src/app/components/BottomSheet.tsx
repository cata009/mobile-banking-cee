import { ReactNode, useEffect, useId } from "react";
import { AppIcon } from "@/app/components/icons";

interface BottomSheetProps {
  title?: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}

export function BottomSheet({ title, subtitle, meta, children, onClose }: BottomSheetProps) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        className="relative max-h-[calc(100%-54px)] w-full overflow-y-auto rounded-t-[12px] bg-[var(--uc-sheet-bg)] p-[16px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)]"
        role="dialog"
      >
        <div className="mb-[24px] flex items-start justify-between gap-[16px]">
          <div className="min-w-0">
            {title ? (
              <h2
                id={titleId}
                className="uc-type-n1 leading-[34px] text-[var(--uc-text)]"
              >
                {title}
              </h2>
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
            className="grid size-[32px] shrink-0 place-items-center bg-transparent text-[var(--uc-text)]"
            onClick={onClose}
            type="button"
          >
            <AppIcon name="close-x" color="var(--uc-icon)" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
