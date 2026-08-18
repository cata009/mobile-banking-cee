import { useEffect, useRef } from "react";

export interface TransactionMonthRailItem {
  /** `YYYY-MM`, matching the transaction month key. */
  key: string;
  /** Short month name, for example `Apr`. */
  label: string;
  /** Four-digit year; the rail only spells it out when it differs from the active one. */
  year: string;
}

/**
 * Month jumper for a long transaction list. It keeps the reader oriented while
 * they scroll and lets them land on a month directly instead of dragging
 * through the months in between. Only months that actually hold transactions
 * appear, so an empty month never looks like a gap in the data.
 */
export default function TransactionMonthRail({
  months,
  activeMonthKey,
  onMonthSelect,
}: {
  months: readonly TransactionMonthRailItem[];
  activeMonthKey: string;
  onMonthSelect: (monthKey: string) => void;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const activeMonth = months.find((month) => month.key === activeMonthKey);

  useEffect(() => {
    const active = activeRef.current;
    const rail = active?.parentElement;
    if (!active || !rail) return;

    // Scroll only the month rail. scrollIntoView would also scroll any
    // horizontal ancestors, including the device preview viewport.
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    const visibleLeft = rail.scrollLeft;
    const visibleRight = visibleLeft + rail.clientWidth;

    if (left < visibleLeft) {
      rail.scrollTo?.({ left, behavior: "smooth" });
    } else if (right > visibleRight) {
      rail.scrollTo?.({ left: right - rail.clientWidth, behavior: "smooth" });
    }
  }, [activeMonthKey]);

  if (months.length === 0) return null;

  return (
    <div
      aria-label="Jump to month"
      className="flex gap-[5px] overflow-x-auto overscroll-x-contain scrollbar-hide"
      data-transaction-month-rail
      role="tablist"
    >
      {months.map((month) => {
        const active = month.key === activeMonthKey;

        return (
          <button
            key={month.key}
            ref={active ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={active}
            data-transaction-month={month.key}
            onClick={() => onMonthSelect(month.key)}
            className={`flex h-[38px] shrink-0 items-center justify-center rounded-full px-[14px] text-[16px] leading-[20px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${
              active
                ? "bg-[var(--uc-action)] font-medium text-[var(--uc-static-white)]"
                : "bg-[var(--uc-surface-subtle)] font-normal text-[var(--uc-text-muted)]"
            }`}
          >
            {month.year === activeMonth?.year ? month.label : `${month.label} ${month.year.slice(2)}`}
          </button>
        );
      })}
    </div>
  );
}
