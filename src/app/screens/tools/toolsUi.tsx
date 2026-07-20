/**
 * Shared UI primitives for the stakeholder Tools surface.
 * Mirrors the panel/chip idioms already used by FlowLibraryScreen and the
 * Design System page so the platform surfaces stay visually consistent.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

export function ToolPanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{title}</h2>
        {action ?? null}
      </div>
      <div className="mt-[16px]">{children}</div>
    </section>
  );
}

export function SelectionChip({
  active = false,
  disabled = false,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`rounded-[20px] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
          : "bg-[var(--uc-surface-muted)] text-[var(--uc-text)] hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
      }`}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-['UniCredit:Bold',sans-serif] text-[11px] uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
      {children}
    </p>
  );
}

export function StatusBadge({ tone, children }: { tone: "ok" | "warn" | "risk"; children: ReactNode }) {
  const toneClassName =
    tone === "ok"
      ? "bg-[color-mix(in_srgb,var(--uc-green-status)_14%,var(--uc-surface))] text-[var(--uc-green-status)]"
      : tone === "warn"
        ? "bg-[color-mix(in_srgb,var(--uc-orange-main)_14%,var(--uc-surface))] text-[var(--uc-orange-main)]"
        : "bg-[color-mix(in_srgb,var(--uc-red-main)_12%,var(--uc-surface))] text-[var(--uc-red-main)]";

  return (
    <span className={`whitespace-nowrap rounded-[10px] px-[8px] py-[3px] text-[11px] font-bold leading-[13px] ${toneClassName}`}>
      {children}
    </span>
  );
}

interface ToolErrorBoundaryProps {
  toolLabel: string;
  children: ReactNode;
}

interface ToolErrorBoundaryState {
  error: Error | null;
}

/**
 * Keeps one crashing tool from blanking the whole Tools surface: the failed
 * tool renders a readable error panel with a retry, the rest keeps working.
 */
export class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  state: ToolErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ToolErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Tools surface: "${this.props.toolLabel}" crashed`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <section
          role="alert"
          className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] shadow-sm"
          data-tool-error="true"
        >
          <h2 className="text-[16px] font-bold leading-[21px] text-[var(--uc-text)]">
            {this.props.toolLabel} could not render
          </h2>
          <p className="mt-[6px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">
            The rest of the Tools surface keeps working. Try again below; if it persists, reload the page and
            share the error with the team.
          </p>
          <pre className="mt-[12px] overflow-x-auto rounded-[6px] bg-[var(--uc-surface-muted)] px-[12px] py-[10px] text-[11px] leading-[16px] text-[var(--uc-red-main)]">
            {String(this.state.error)}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-[14px] rounded-[20px] bg-[var(--uc-surface-muted)] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
          >
            Try again
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
