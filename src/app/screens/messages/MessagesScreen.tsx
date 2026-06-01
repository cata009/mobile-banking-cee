import { useMemo, useState } from "react";
import type { UIEvent } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import PageHeader from "@/app/components/PageHeader";
import { useDemo } from "@/app/state/demoStore";
import {
  getMessagesConfigForCountry,
  type MessageListItem,
  type MessageMailbox,
} from "@/app/config/messagesConfig";

interface MessagesScreenProps {
  onBack: () => void;
}

function MessagesTabs({
  activeMailbox,
  inboxLabel,
  outboxLabel,
  onChange,
}: {
  activeMailbox: MessageMailbox;
  inboxLabel: string;
  outboxLabel: string;
  onChange: (mailbox: MessageMailbox) => void;
}) {
  const tabs: Array<{ id: MessageMailbox; label: string }> = [
    { id: "inbox", label: inboxLabel },
    { id: "outbox", label: outboxLabel },
  ];

  return (
    <div className="mt-[22px] grid h-[48px] shrink-0 grid-cols-2 border-b border-[var(--uc-border)]">
      {tabs.map((tab) => {
        const isActive = tab.id === activeMailbox;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            className="relative flex items-center justify-center font-['UniCredit',sans-serif] text-[16px] font-bold text-[var(--uc-text)]"
          >
            {isActive && <span className="mr-[8px] size-[12px] rounded-full bg-[var(--uc-action)]" aria-hidden="true" />}
            <span className={isActive ? "" : "text-[var(--uc-text-muted)]"}>{tab.label}</span>
            {isActive && <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-[var(--uc-text)]" aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

function MessagesSectionTitle({ children }: { children: string }) {
  return (
    <div className="mx-[24px] border-b border-[var(--uc-border-muted)] pb-[5px]">
      <h2 className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-normal text-[var(--uc-text)]">
        {children}
      </h2>
    </div>
  );
}

function DotMenuButton() {
  return (
    <button
      type="button"
      className="flex size-[32px] flex-col items-center justify-center gap-[3px]"
      aria-label="More actions"
    >
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
    </button>
  );
}

function MessageListRow({ message }: { message: MessageListItem }) {
  return (
    <div className="grid h-[80px] grid-cols-[32px_1fr_48px_32px] items-center gap-[2px] px-[18px]">
      <div className="text-center">
        <p className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-[20px] text-[var(--uc-text)]">
          {message.day}
        </p>
        <p className="font-['UniCredit',sans-serif] text-[14px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
          {message.month}
        </p>
      </div>
      <div className="min-w-0 pl-[6px]">
        <p className="truncate font-['UniCredit',sans-serif] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
          {message.title}
        </p>
        <p className="truncate font-['UniCredit',sans-serif] text-[16px] font-normal leading-[22px] text-[var(--uc-text-muted)]">
          {message.description}
        </p>
      </div>
      {message.badge ? (
        <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] font-['UniCredit',sans-serif] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
          {message.badge}
        </span>
      ) : (
        <span />
      )}
      <DotMenuButton />
    </div>
  );
}

export default function MessagesScreen({ onBack }: MessagesScreenProps) {
  const { country } = useDemo();
  const config = getMessagesConfigForCountry(country);
  const [activeMailbox, setActiveMailbox] = useState<MessageMailbox>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [headerProgress, setHeaderProgress] = useState(0);
  const messages = activeMailbox === "inbox" ? config.inbox : config.outbox;

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64));
    setHeaderProgress(progress);
  };

  const filteredMessages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return messages;

    return messages.filter((message) =>
      [
        message.day,
        message.month,
        message.title,
        message.description,
        message.badge ?? "",
        config.sectionTitle,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [config.sectionTitle, messages, searchQuery]);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <PageHeader
        title={config.title}
        onBack={onBack}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />
      <MessagesTabs
        activeMailbox={activeMailbox}
        inboxLabel={config.tabs.inbox}
        outboxLabel={config.tabs.outbox}
        onChange={setActiveMailbox}
      />
      <div className="px-[16px] py-[26px]">
        <AccountSearchBar value={searchQuery} onValueChange={setSearchQuery} />
      </div>
      <MessagesSectionTitle>{config.sectionTitle}</MessagesSectionTitle>
      <div className="pt-[20px] pb-[24px]">
        {filteredMessages.map((message) => (
          <MessageListRow key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
