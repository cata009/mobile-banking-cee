import { useMemo, useState, type UIEvent } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import PageHeader from "@/app/components/PageHeader";
import { useDemo } from "@/app/state/demoStore";
import { getDocumentsConfigForCountry, type DocumentListItem } from "@/app/config/documentsConfig";

interface DocumentsScreenProps {
  onBack: () => void;
}

function DocumentsSectionTitle({ children }: { children: string }) {
  return (
    <div className="mx-[24px] border-b border-[var(--uc-border-muted)] pb-[5px]">
      <h2 className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-normal text-[var(--uc-text)]">
        {children}
      </h2>
    </div>
  );
}

function DocumentListRow({ item }: { item: DocumentListItem }) {
  return (
    <div className="grid h-[80px] grid-cols-[32px_1fr_48px] items-center gap-[2px] px-[18px]">
      <div className="text-center">
        <p className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-[20px] text-[var(--uc-text)]">
          {item.day}
        </p>
        <p className="font-['UniCredit',sans-serif] text-[14px] font-bold leading-[16px] text-[var(--uc-text-muted)]">
          {item.month}
        </p>
      </div>
      <div className="min-w-0 pl-[6px]">
        <p className="truncate font-['UniCredit',sans-serif] text-[16px] font-bold uppercase leading-[20px] text-[var(--uc-text)]">
          {item.title}
        </p>
        <p className="truncate font-['UniCredit',sans-serif] text-[16px] font-normal leading-[22px] text-[var(--uc-text-muted)]">
          {item.description}
        </p>
      </div>
      {item.badge ? (
        <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] font-['UniCredit',sans-serif] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
          {item.badge}
        </span>
      ) : (
        <span />
      )}
    </div>
  );
}

export default function DocumentsScreen({ onBack }: DocumentsScreenProps) {
  const { country } = useDemo();
  const config = getDocumentsConfigForCountry(country);
  const [searchQuery, setSearchQuery] = useState("");
  const [headerProgress, setHeaderProgress] = useState(0);

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64));
    setHeaderProgress(progress);
  };

  const filteredGroups = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return config.groups;
    }

    return config.groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [group.year, item.day, item.month, item.title, item.description, item.badge ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [config.groups, searchQuery]);

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

      <div className="px-[16px] py-[26px]">
        <AccountSearchBar value={searchQuery} onValueChange={setSearchQuery} />
      </div>

      <div className="pb-[24px]">
        {filteredGroups.map((group) => (
          <section key={group.year} className="pb-[18px]">
            <DocumentsSectionTitle>{group.year}</DocumentsSectionTitle>
            <div className="pt-[20px]">
              {group.items.map((item) => (
                <DocumentListRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
