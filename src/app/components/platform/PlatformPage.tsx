import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

/**
 * Shared page frame for the platform surfaces (Flows, Tools, Design system).
 * Same width, gutters, background and vertical rhythm everywhere, so moving
 * between them does not jump the content.
 */
export const PlatformPageShell = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PlatformPageShell(
  { className = "", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`h-full min-h-0 overflow-y-auto bg-[var(--uc-app-bg)] text-[var(--uc-text)] ${className}`}
      {...rest}
    >
      <div className="mx-auto flex w-full max-w-[1724px] flex-col gap-[20px] px-[24px] py-[32px] lg:px-[40px]">
        {children}
      </div>
    </div>
  );
});

/** Page title and one-line description, shared by every platform surface. */
export function PlatformPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-[16px]">
      <div>
        <h1 className="text-[24px] font-bold leading-[30px] tracking-[0] text-[var(--uc-text)]">{title}</h1>
        {description ? (
          <p className="mt-[6px] max-w-[860px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
