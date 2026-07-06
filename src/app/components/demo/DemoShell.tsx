/**
 * DemoShell Component
 * Layout shell for demo mode with controls panel and mobile preview.
 */

import { useEffect, useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import { DemoTopBar } from "./DemoTopBar";

interface DemoShellProps {
  children: ReactNode;
}

export function DemoShell({ children }: DemoShellProps) {
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);

  useEffect(() => {
    if (!isFocusModeOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFocusModeOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocusModeOpen]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--uc-app-bg)]">
      <DemoTopBar onOpenFocusMode={() => setIsFocusModeOpen(true)} />

      {isFocusModeOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[10000] bg-[rgb(var(--uc-static-black-rgb)_/_0.42)] backdrop-blur-[2px]"
        />
      )}

      <div
        role={isFocusModeOpen ? "dialog" : undefined}
        aria-modal={isFocusModeOpen ? true : undefined}
        aria-label={isFocusModeOpen ? "Large demo preview" : undefined}
        data-demo-focus-mode={isFocusModeOpen ? "true" : undefined}
        className={
          isFocusModeOpen
            ? "fixed inset-0 z-[10001] flex min-h-0 flex-col overflow-hidden bg-[var(--uc-app-bg)]"
            : "flex min-h-0 flex-1 flex-col overflow-hidden"
        }
      >
        {isFocusModeOpen && (
          <div className="flex h-[44px] shrink-0 items-center justify-between border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface)] px-5 shadow-sm">
            <div className="font-['UniCredit:Bold',sans-serif] text-[14px] leading-none text-[var(--uc-text)]">
              Demo preview
            </div>
            <button
              type="button"
              className="grid size-[32px] place-items-center rounded-[6px] text-[var(--uc-text)] transition-colors hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-action)]"
              aria-label="Close large demo"
              title="Close"
              onClick={() => setIsFocusModeOpen(false)}
            >
              <AppIcon name="close-x" size={18} />
            </button>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
