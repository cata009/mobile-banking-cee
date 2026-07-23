import { useMemo, useState, type PointerEvent } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import { getDocumentsConfigForCountry, type DocumentListItem } from "@/app/config/documentsConfig";

interface DocumentsScreenProps {
  onBack: () => void;
  onHelpClick?: () => void;
}

function DocumentsSectionTitle({ children }: { children: string }) {
  return (
    <div className="mx-[24px] border-b border-[var(--uc-border-muted)] pb-[5px]">
      <h2 className="uc-type-h2 text-[var(--uc-text)]">
        {children}
      </h2>
    </div>
  );
}

function DocumentsAlertDialog({
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div className="absolute inset-0 z-[90] bg-[rgb(var(--uc-static-black-rgb)_/_0.5)] backdrop-blur-[5.9px]" onClick={onCancel ?? onConfirm} />
      <div className="absolute inset-0 z-[91] flex items-center justify-center px-[16px]">
        <div className="w-[270px] overflow-hidden rounded-[14px] bg-[var(--uc-surface-muted)] shadow-[0_2px_6px_rgb(var(--uc-shadow-rgb)_/_0.06),0_16px_24px_rgb(var(--uc-shadow-rgb)_/_0.08)]">
          <div className="px-[16px] pb-[18px] pt-[19px] text-center">
            <p className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] font-semibold leading-[22px] text-[var(--uc-primary-main)]">
              {title}
            </p>
            <p className="mt-[6px] whitespace-pre-line font-['UniCredit',sans-serif] text-[13px] font-normal leading-[16px] text-[var(--uc-primary-main)]">
              {body}
            </p>
          </div>
          <div className="h-[0.5px] bg-[var(--uc-border)]" />
          {cancelLabel ? (
            <div className="flex">
              <button
                type="button"
                onClick={onCancel}
                className="flex h-[44px] flex-1 items-center justify-center active:bg-[var(--uc-border-muted)]"
              >
                <span className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] leading-[22px] text-[var(--uc-action)]">
                  {cancelLabel}
                </span>
              </button>
              <div className="w-[0.5px] bg-[var(--uc-border)]" />
              <button
                type="button"
                onClick={onConfirm}
                className="flex h-[44px] flex-1 items-center justify-center active:bg-[var(--uc-border-muted)]"
              >
                <span className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] leading-[22px] text-[var(--uc-action)]">
                  {confirmLabel}
                </span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              className="flex h-[44px] w-full items-center justify-center active:bg-[var(--uc-border-muted)]"
            >
              <span className="font-['SF_Pro_Text','-apple-system','system-ui',sans-serif] text-[17px] leading-[22px] text-[var(--uc-action)]">
                {confirmLabel}
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function DocumentListRow({
  item,
  isActionsOpen,
  onOpenActions,
  onCloseActions,
  onRequestDelete,
}: {
  item: DocumentListItem;
  isActionsOpen: boolean;
  onOpenActions: () => void;
  onCloseActions: () => void;
  onRequestDelete: () => void;
}) {
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStartX === null) return;

    const deltaX = event.clientX - dragStartX;
    setDragStartX(null);

    if (deltaX < -32) {
      onOpenActions();
    } else if (deltaX > 32) {
      onCloseActions();
    }
  };

  return (
    <div
      className="relative h-[80px] overflow-hidden bg-[var(--uc-surface)]"
      onPointerDown={(event) => setDragStartX(event.clientX)}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDragStartX(null)}
    >
      <button
        type="button"
        aria-label={`Delete document ${item.id}`}
        aria-hidden={!isActionsOpen}
        tabIndex={isActionsOpen ? 0 : -1}
        onClick={onRequestDelete}
        className={`absolute inset-y-0 right-0 flex w-[80px] flex-col items-center justify-center bg-[var(--uc-status-red)] text-[var(--uc-static-white)] ${isActionsOpen ? "visible" : "invisible pointer-events-none"}`}
      >
        <span className="uc-type-n5-strong mt-[40px] leading-[15px]">
          DELETE
        </span>
      </button>
      <div
        className={`relative z-[1] grid h-[80px] grid-cols-[32px_1fr_48px_32px] items-center gap-[2px] bg-[var(--uc-surface)] px-[18px] transition-transform duration-200 ease-out ${isActionsOpen ? "-translate-x-[80px]" : "translate-x-0"}`}
      >
        <div className="text-center">
          <p className="uc-type-h2 leading-[20px] text-[var(--uc-text)]">
            {item.day}
          </p>
          <p className="uc-type-n5-strong leading-[16px] text-[var(--uc-text-muted)]">
            {item.month}
          </p>
        </div>
        <div className="min-w-0 pl-[6px]">
          <p className="uc-type-n4-strong truncate uppercase leading-[20px] text-[var(--uc-text)]">
            {item.title}
          </p>
          <p className="uc-type-n4 truncate leading-[22px] text-[var(--uc-text-muted)]">
            {item.description}
          </p>
        </div>
        {item.badge ? (
          <span className="justify-self-center rounded-full bg-[var(--uc-action-soft)] px-[7px] py-[2px] text-[11px] font-bold leading-[14px] text-[var(--uc-action)]">
            {item.badge}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          aria-label={`Document actions ${item.id}`}
          onClick={isActionsOpen ? onCloseActions : onOpenActions}
          className="grid size-[32px] place-items-center justify-self-end text-[var(--uc-text)]"
        >
          <AppIcon name="more-horizontal" color="currentColor" />
        </button>
      </div>
    </div>
  );
}

export default function DocumentsScreen({ onBack, onHelpClick }: DocumentsScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const config = getDocumentsConfigForCountry(country);
  const [searchQuery, setSearchQuery] = useState("");
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [deletedDocumentIds, setDeletedDocumentIds] = useState<ReadonlySet<string>>(() => new Set());
  const [pendingDeleteItem, setPendingDeleteItem] = useState<DocumentListItem | null>(null);
  const [isLegalInfoOpen, setIsLegalInfoOpen] = useState(false);

  const getDocumentStateKey = (item: DocumentListItem) => `${country}:${item.id}`;

  const handleCancelDelete = () => {
    setPendingDeleteItem(null);
    setOpenActionId(null);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteItem) return;

    if (pendingDeleteItem.isLegal) {
      setPendingDeleteItem(null);
      setOpenActionId(null);
      setIsLegalInfoOpen(true);
      return;
    }

    const deletedStateKey = getDocumentStateKey(pendingDeleteItem);
    setDeletedDocumentIds((current) => {
      const next = new Set(current);
      next.add(deletedStateKey);
      return next;
    });
    setPendingDeleteItem(null);
    setOpenActionId(null);
  };

  const filteredGroups = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const localizeItem = (item: DocumentListItem): DocumentListItem => {
      const keyBase = `runtime.documents.rows.${item.description.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      const localizedDescription = t(`${keyBase}.description`, item.description);
      return {
        ...item,
        title: t(`${keyBase}.title`, item.title),
        description: item.isLegal ? t("runtime.documents.legalLabel", "Legal") : localizedDescription,
        badge: item.badge ? t("runtime.documents.newBadge", item.badge) : item.badge,
      };
    };
    const localizedGroups = config.groups.map((group) => ({
      ...group,
      items: group.items
        .filter((item) => !deletedDocumentIds.has(getDocumentStateKey(item)))
        .map(localizeItem),
    }));

    const nonEmptyGroups = localizedGroups.filter((group) => group.items.length > 0);

    if (!normalizedQuery) return nonEmptyGroups;

    return nonEmptyGroups
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
  }, [config.groups, deletedDocumentIds, searchQuery, t]);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-[var(--uc-surface)] text-[var(--uc-text)]"
    >
      <div
        className="h-full w-full overflow-y-auto scrollbar-hide"
        onScroll={handlePageScroll}
      >
        <PageHeader
          title={t("runtime.documents.title", config.title)}
          onBack={onBack}
          onHelpClick={onHelpClick}
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
                  <DocumentListRow
                    key={item.id}
                    item={item}
                    isActionsOpen={openActionId === item.id}
                    onOpenActions={() => setOpenActionId(item.id)}
                    onCloseActions={() => setOpenActionId(null)}
                    onRequestDelete={() => setPendingDeleteItem(item)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {pendingDeleteItem ? (
        <DocumentsAlertDialog
          title={t("runtime.documents.deleteDialog.title", "Delete document")}
          body={t("runtime.documents.deleteDialog.body", "Are you sure you want to delete this document?")}
          cancelLabel={t("runtime.dialogs.cancel", "Cancel")}
          confirmLabel={t("runtime.documents.deleteDialog.confirm", "Delete")}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      {isLegalInfoOpen ? (
        <DocumentsAlertDialog
          title={t("runtime.documents.legalDeleteDialog.title", "Info")}
          body={t("runtime.documents.legalDeleteDialog.body", "The selected file is marked as legal and cannot be deleted.")}
          confirmLabel={t("runtime.documents.legalDeleteDialog.confirm", "OK")}
          onConfirm={() => setIsLegalInfoOpen(false)}
        />
      ) : null}
    </div>
  );
}
