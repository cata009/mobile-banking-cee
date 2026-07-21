import { useMemo, useState } from "react";
import type { UIEvent } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import PageHeader from "@/app/components/PageHeader";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import {
  getMessagesConfigForCountry,
  type MessageListItem,
  type MessageMailbox,
} from "@/app/config/messagesConfig";

interface MessagesScreenProps {
  onBack: () => void;
}

function MessagesSectionTitle({ children }: { children: string }) {
  return (
    <div className="mx-[24px] border-b border-[var(--uc-border-muted)] pb-[5px]">
      <h2 className="uc-type-h2 text-[var(--uc-text)]">
        {children}
      </h2>
    </div>
  );
}

function DotMenuButton() {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      className="flex size-[32px] flex-col items-center justify-center gap-[3px]"
      aria-label={t("runtime.actions.moreActions", "More actions")}
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
        <p className="uc-type-h2 leading-[20px] text-[var(--uc-text)]">
          {message.day}
        </p>
        <p className="uc-type-n5-strong leading-[16px] text-[var(--uc-text-muted)]">
          {message.month}
        </p>
      </div>
      <div className="min-w-0 pl-[6px]">
        <p className="uc-type-n4-strong truncate leading-[20px] text-[var(--uc-text)]">
          {message.title}
        </p>
        <p className="uc-type-n4 truncate leading-[22px] text-[var(--uc-text-muted)]">
          {message.description}
        </p>
      </div>
      {message.badge ? (
        <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
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
  const country = useCountry();
  const { t } = useLanguage();
  const config = getMessagesConfigForCountry(country);
  const [activeMailbox, setActiveMailbox] = useState<MessageMailbox>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [headerProgress, setHeaderProgress] = useState(0);
  const messages = activeMailbox === "inbox" ? config.inbox : config.outbox;
  const mailboxTabs = [
      { id: "inbox" as MessageMailbox, label: t("runtime.messages.inbox", config.tabs.inbox), hasNewItems: true },
      { id: "outbox" as MessageMailbox, label: t("runtime.messages.outbox", config.tabs.outbox) },
    ] as const;
  const localizeMessage = (message: MessageListItem): MessageListItem => {
    const keyBase = `runtime.messages.rows.${message.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    return {
      ...message,
      title: t(`${keyBase}.title`, message.title),
      description: t(`${keyBase}.description`, message.description),
      badge: message.badge ? t("runtime.messages.newBadge", message.badge) : message.badge,
    };
  };

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64));
    setHeaderProgress(progress);
  };

  const filteredMessages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const localizedMessages = messages.map(localizeMessage);
    if (!normalizedQuery) return localizedMessages;

    return localizedMessages.filter((message) =>
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
  }, [config.sectionTitle, messages, searchQuery, t]);

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <PageHeader
        title={t("runtime.messages.title", config.title)}
        onBack={onBack}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />
      <div className="sticky z-20 bg-[var(--uc-surface)]" style={{ top: "calc(var(--uc-phone-top-reserve, 54px) + 48px)" }}>
        <MessagesMailboxTabs tabs={mailboxTabs} activeTabId={activeMailbox} onChange={(tabId) => setActiveMailbox(tabId as MessageMailbox)} />
        <div className="px-[16px] pt-[8px] pb-[8px]">
          <AccountSearchBar value={searchQuery} onValueChange={setSearchQuery} />
        </div>
      </div>
      <MessagesSectionTitle>{t("runtime.messages.sectionTitle", config.sectionTitle)}</MessagesSectionTitle>
      <div className="pt-[20px] pb-[24px]">
        {filteredMessages.map((message) => (
          <MessageListRow key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
