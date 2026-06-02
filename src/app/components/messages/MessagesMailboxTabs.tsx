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
}

export default function MessagesMailboxTabs({
  tabs,
  activeTabId,
  onChange,
}: MessagesMailboxTabsProps) {
  return (
    <div className="mt-[22px] grid h-[48px] shrink-0 grid-cols-2 border-b border-[var(--uc-border)]">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            className="relative flex items-center justify-center font-['UniCredit',sans-serif] text-[16px] font-bold text-[var(--uc-text)]"
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
