export type MessagesMailboxTabId = string;

export interface MessagesMailboxTab {
  id: MessagesMailboxTabId;
  label: string;
  hasNewItems?: boolean;
}

interface MessagesMailboxTabsProps {
  tabs: readonly MessagesMailboxTab[];
  activeTabId: MessagesMailboxTabId;
  onChange: (tabId: MessagesMailboxTabId) => void;
  layout?: "equal" | "scrollable";
  minTabWidth?: number;
  ariaLabel?: string;
  withTopMargin?: boolean;
  className?: string;
}

export default function MessagesMailboxTabs({
  tabs,
  activeTabId,
  onChange,
  layout = "equal",
  minTabWidth = 0,
  ariaLabel = "Mailbox tabs",
  withTopMargin = true,
  className = "",
}: MessagesMailboxTabsProps) {
  const isScrollable = layout === "scrollable";

  return (
    <div
      className={`${withTopMargin ? "mt-[22px]" : "mt-0"} h-[48px] shrink-0 border-b border-[var(--uc-border)] ${
        isScrollable ? "flex overflow-x-auto scrollbar-hide" : "grid grid-cols-2"
      } ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            role="tab"
            aria-selected={isActive}
            className="uc-type-n4-strong relative flex h-full shrink-0 items-center justify-center px-[16px] text-[var(--uc-text)]"
            style={isScrollable ? { minWidth: minTabWidth } : undefined}
          >
            {tab.hasNewItems ? (
              <span className="mr-[8px] size-[12px] rounded-full bg-[var(--uc-action)]" aria-hidden="true" />
            ) : null}
            <span className={isActive ? "" : "text-[var(--uc-text-muted)]"}>{tab.label}</span>
            {isActive ? (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[var(--uc-text)]" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
