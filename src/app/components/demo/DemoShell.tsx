/**
 * DemoShell Component
 * Layout shell for demo mode with controls panel and mobile preview
 */

import { DemoTopBar } from "./DemoTopBar";

interface DemoShellProps {
  children: React.ReactNode;
}

/**
 * Demo shell with simplified layout:
 * - Top: Sticky demo controls bar (with Features button)
 * - Center: Mobile phone frame with app content
 */
export function DemoShell({ children }: DemoShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-[var(--uc-app-bg)] flex flex-col">
      {/* ─── STICKY TOP BAR ───────────────────────────────────── */}
      <DemoTopBar />

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      {/* Folosește flex-1 pentru a ocupa tot spațiul rămas */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
