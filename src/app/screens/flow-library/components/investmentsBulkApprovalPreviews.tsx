import { useMemo, useState, type ReactNode } from "react";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import ToggleButton from "@/app/components/ToggleButton";
import InvestmentDetailField from "@/app/components/investments/InvestmentDetailField";
import InvestmentOrderDocumentsAccordion from "@/app/screens/investments/InvestmentOrderDocumentsAccordion";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import { AppIcon } from "@/app/components/icons";
import { getCountryConfig } from "@/app/registry/countryConfig";
import { useDemo } from "@/app/state/demoStore";
import { getCountryCurrency } from "@/data/exchangeRates";

type DraftStatus = "available" | "rejected";
type SummaryOrderStatus = "Marked to sign" | "Not signed" | "Rejected";

type BulkDraft = {
  id: string;
  name: string;
  isin: string;
  orderType: "BUY" | "SELL" | "REGULAR INVESTMENT";
  amount: number;
  status: DraftStatus;
};

const BULK_DRAFTS: readonly BulkDraft[] = [
  { id: "draft-01", name: "UniCredit Balanced Income Fund", isin: "LU0243534567", orderType: "BUY", amount: 5000, status: "available" },
  { id: "draft-02", name: "onemarkets Climate Focus Fund", isin: "LU1953188835", orderType: "SELL", amount: -3200, status: "available" },
  { id: "draft-03", name: "Sustainable Future Mixed Fund", isin: "LU1829218742", orderType: "REGULAR INVESTMENT", amount: 750, status: "available" },
  { id: "draft-04", name: "Global Dividend Fund", isin: "LU0717821071", orderType: "BUY", amount: 2400, status: "available" },
  { id: "draft-05", name: "CEE Government Bond Fund", isin: "LU0866173890", orderType: "SELL", amount: -1650, status: "available" },
  { id: "draft-06", name: "Emerging Markets Equity Fund", isin: "LU0994726007", orderType: "BUY", amount: 1800, status: "available" },
  { id: "draft-07", name: "Euro Short Term Bond Fund", isin: "LU1681043596", orderType: "REGULAR INVESTMENT", amount: 300, status: "available" },
  { id: "draft-08", name: "European Small Cap Fund", isin: "LU0594300094", orderType: "BUY", amount: 1250, status: "available" },
  { id: "draft-09", name: "Strategic Income Fund", isin: "LU0957146375", orderType: "BUY", amount: 900, status: "available" },
  { id: "draft-10", name: "Balanced Allocation Fund", isin: "LU1181134408", orderType: "BUY", amount: 1100, status: "rejected" },
] as const;

const DEFAULT_SELECTED_IDS: readonly string[] = [];
const STATIC_REVIEW_SELECTED_IDS = ["draft-01", "draft-02", "draft-03"] as const;

function formatMoney(value: number, country: Parameters<typeof getCountryConfig>[0]) {
  const currency = getCountryCurrency(country);
  return `${new Intl.NumberFormat(getCountryConfig(country).locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value))} ${currency}`;
}

function getSummaryOrderStatus(draft: BulkDraft, selectedIds: readonly string[], rejectedIds: readonly string[]): SummaryOrderStatus {
  if (rejectedIds.includes(draft.id)) return "Rejected";
  return selectedIds.includes(draft.id) ? "Marked to sign" : "Not signed";
}

function getSummaryStatusLabel(status: SummaryOrderStatus) {
  return status === "Marked to sign" ? status : "Not selected to be signed";
}

function PrototypeShell({ children }: { children: ReactNode }) {
  return <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">{children}</div>;
}

function FlowBulkSelectionCheckmark() {
  return (
    <svg data-testid="flow-bulk-selection-checkmark" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.3181 3.76108C11.2141 2.82964 12.6664 2.82964 13.5625 3.76108L6.22952 11.375L0.875 5.81907C1.77066 4.88804 3.22338 4.88804 4.11943 5.81907L6.22952 8.00209L10.3181 3.76108Z" fill="var(--uc-action)" />
    </svg>
  );
}

function FlowBulkRejectIcon() {
  return (
    <svg data-testid="flow-bulk-reject-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.5 1H12.523C13.508 1 14 2 14 2.5V3H2V2.5C2 2 2.492 1 3.477 1H6.5L7 0H9L9.5 1ZM4.84017 16C4.32017 16 3.88667 15.6015 3.84367 15.083L2.92017 4H12.9202L11.9962 15.083C11.9532 15.6015 11.5202 16 11.0002 16H4.84017Z" fill="var(--uc-action)" />
    </svg>
  );
}

function BulkReviewSummaryIcon() {
  return (
    <svg data-testid="bulk-review-summary-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M18.875 13.0345H16.8125C16.0535 13.0345 15.4375 12.4166 15.4375 11.6552V9.58621H17.5C18.259 9.58621 18.875 10.2041 18.875 10.9655V13.0345ZM18.875 17.8621H16.8125C16.0535 17.8621 15.4375 17.2441 15.4375 16.4828V14.4138H17.5C18.259 14.4138 18.875 15.0317 18.875 15.7931V17.8621ZM14.0625 13.0345H12C11.241 13.0345 10.625 12.4166 10.625 11.6552V9.58621H12.6875C13.4465 9.58621 14.0625 10.2041 14.0625 10.9655V13.0345ZM14.0625 17.8621H12C11.241 17.8621 10.625 17.2441 10.625 16.4828V14.4138H12.6875C13.4465 14.4138 14.0625 15.0317 14.0625 15.7931V17.8621ZM9.25 13.0345H7.1875C6.4285 13.0345 5.8125 12.4166 5.8125 11.6552V9.58621H7.875C8.634 9.58621 9.25 10.2041 9.25 10.9655V13.0345ZM9.25 17.8621H7.1875C6.4285 17.8621 5.8125 17.2441 5.8125 16.4828V14.4138H7.875C8.634 14.4138 9.25 15.0317 9.25 15.7931V17.8621ZM20.25 5.44828H10.625L7.875 2H1V19.2414C1 20.7648 2.23131 22 3.75 22H23V8.2069C23 6.68345 21.7687 5.44828 20.25 5.44828Z" fill="var(--uc-text)" />
    </svg>
  );
}

/** Figma 13573 selection checkbox: 24px target, 22px white inner surface, 1px K10 border and T2 thick tick. */
function FlowBulkSelectionCheckbox({
  checked,
  disabled = false,
  onToggle,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      data-flow-bulk-checkbox="true"
      className="relative grid size-[24px] shrink-0 place-items-center rounded-[4px] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className="absolute inset-[1px] rounded-[4px] border border-[var(--uc-text)] bg-[var(--uc-surface)]" aria-hidden="true" />
      {checked ? <span className="relative"><FlowBulkSelectionCheckmark /></span> : null}
    </button>
  );
}

function BulkSelectionScreen({
  selectedIds,
  rejectedIds,
  onToggle,
  onToggleAll,
  onSignOrders,
  onRejectSelected,
  staticPreview = false,
}: {
  selectedIds: readonly string[];
  rejectedIds: readonly string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onSignOrders: () => void;
  onRejectSelected: () => void;
  staticPreview?: boolean;
}) {
  const { country } = useDemo();
  const selectedCount = selectedIds.length;
  const selectableDrafts = BULK_DRAFTS.filter((draft) => !rejectedIds.includes(draft.id));
  const allSelected = selectableDrafts.length > 0 && selectableDrafts.every((draft) => selectedIds.includes(draft.id));
  const groups = [
    { title: "ADVISORY ORDERS", drafts: BULK_DRAFTS.slice(0, 5) },
    { title: "NON ADVISORY ORDERS", drafts: BULK_DRAFTS.slice(5) },
  ].map((group) => ({ ...group, drafts: group.drafts.filter((draft) => !rejectedIds.includes(draft.id)) })).filter((group) => group.drafts.length > 0);

  return (
    <PrototypeShell>
      <PageHeader title="Orders to approve" onBack={() => undefined} includeSafeArea showHelp={false} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[16px] scrollbar-hide">
        <p className="pt-[10px] uc-type-n4 text-[var(--uc-text)]">These investment order drafts were prepared by your advisor and are awaiting for your approval. Once approved, the orders will be processed.</p>
        <div className="mt-[18px] flex min-h-[24px] items-center justify-between">
          <p className="uc-type-n4 text-[var(--uc-text)]">Total orders: <span className="font-bold">{selectableDrafts.length}</span></p>
          {selectedCount > 0 ? (
            <button type="button" onClick={onRejectSelected} data-flow-bulk-reject-action="true" className="inline-flex h-[24px] items-center gap-[5px] whitespace-nowrap text-[14px] font-bold leading-[normal] text-[var(--uc-action)]" aria-label="REJECT">
              <FlowBulkRejectIcon />
              REJECT
            </button>
          ) : null}
        </div>
        {groups.map((group) => (
          <section key={group.title} className="pt-[16px]">
            <SectionHeadingDivider title={group.title} className="px-[8px]" />
            {group.drafts.map((draft, index) => {
              const selected = selectedIds.includes(draft.id);
              return (
                <div key={draft.id} className={`flex min-h-[96px] items-center gap-[10px] py-[12px] ${index < group.drafts.length - 1 ? "border-b border-[var(--uc-border)]" : ""}`}>
                  <FlowBulkSelectionCheckbox
                    checked={selected}
                    onToggle={() => onToggle(draft.id)}
                    label={`Select ${draft.name}`}
                  />
                  <BrandLogo logoId="unicredit" size={32} label={`${draft.name} product`} />
                  <span className="min-w-0 flex-1 text-right">
                    <span className="block text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{draft.orderType}</span>
                    <span className="block truncate text-[15px] font-bold leading-[18px] tracking-[0.3px] text-[var(--uc-text)]">{draft.name}</span>
                    <span className="block truncate text-[14px] leading-[18px] tracking-[0.28px] text-[var(--uc-text)]">{draft.isin}</span>
                    <span className={`block text-[16px] font-bold leading-[20px] ${draft.amount > 0 ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-text)]"}`}>
                      {formatMoney(draft.amount, country)}
                    </span>
                  </span>
                </div>
              );
            })}
          </section>
        ))}
      </div>
      <div className="border-t border-[var(--uc-border)] bg-[var(--uc-surface)] px-[16px] pb-[28px] pt-[16px]">
        <div className="flex items-center gap-[10px]">
          <FlowBulkSelectionCheckbox checked={allSelected} onToggle={onToggleAll} label="Select all orders" />
          <p className="w-[112px] shrink-0 text-[18px] leading-[24px] text-[var(--uc-text)]" data-testid="bulk-selected-count" aria-live="polite">Selected <span className="font-bold">{selectedCount}</span></p>
          <PrimaryButton className="!h-[48px] !min-w-0 !flex-1 !w-auto" disabled={selectedCount === 0} onClick={onSignOrders}>
            Sign orders
        </PrimaryButton>
        </div>
      </div>
      {staticPreview ? <span className="sr-only">Static Flow Library selection preview</span> : null}
    </PrototypeShell>
  );
}

function BulkRejectConfirmationSheet({ selectedCount, onClose, onConfirm }: { selectedCount: number; onClose: () => void; onConfirm: () => void }) {
  const plural = selectedCount !== 1;
  const noun = plural ? "orders" : "order";
  const subject = plural ? "they" : "it";

  return (
    <BottomSheet
      onClose={onClose}
      closeLabel="Close rejection confirmation"
      className="!max-h-none !p-0"
      headerClassName="mb-0 px-[24px] pt-[24px]"
      bodyClassName="pb-[24px]"
      footer={
        <div className="pb-[34px]">
          <button type="button" onClick={onConfirm} className="flex h-[48px] w-full items-center justify-center px-[16px] text-[18px] font-bold leading-[normal] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]">
            Yes, reject the {noun}
          </button>
          <div className="px-[16px] py-[8px]">
            <PrimaryButton className="!h-[48px] !w-full" onClick={onClose}>No, I changed my mind</PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-[24px] px-[24px] text-center">
        <img src="/assets/investments/reject-warning.svg" width="80" height="80" alt="" aria-hidden="true" />
        <h2 className="max-w-[287px] text-[28px] font-bold leading-[32px] tracking-[0.3px] text-[var(--uc-text)]">Are you sure you want to reject the {noun}?</h2>
        <p className="text-[18px] leading-[24px] text-[var(--uc-text)]">By rejecting the {noun}, {subject} will be canceled and cannot be retrieved afterwards.</p>
      </div>
    </BottomSheet>
  );
}

function BulkReviewScreen({
  drafts,
  index,
  readDraftIds,
  termsAccepted,
  onPrevious,
  onNext,
  onSummary,
  onBackToSelection,
  onDeselect,
  onReadCurrent,
  onTermsToggle,
  staticPreview = false,
}: {
  drafts: readonly BulkDraft[];
  index: number;
  readDraftIds: readonly string[];
  termsAccepted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSummary: () => void;
  onBackToSelection: () => void;
  onDeselect: () => void;
  onReadCurrent: () => void;
  onTermsToggle: () => void;
  staticPreview?: boolean;
}) {
  const { country } = useDemo();
  const draft = drafts[index] ?? drafts[0];
  const last = index === drafts.length - 1;
  const isRead = draft ? readDraftIds.includes(draft.id) : false;
  if (!draft) return null;

  return (
    <PrototypeShell>
      <PageHeader
        title="Review selected orders"
        onBack={onBackToSelection}
        includeSafeArea
        showHelp={false}
        rightActionIcon={<span data-testid="bulk-review-summary-icon-slot" className="flex size-[24px] self-center items-center justify-center"><BulkReviewSummaryIcon /></span>}
        rightActionLabel="View summary"
        onRightActionClick={onSummary}
      />
      <div
        key={draft.id}
        data-testid="bulk-review-content"
        className="min-h-0 flex-1 overflow-y-auto pb-[8px] scrollbar-hide"
        tabIndex={0}
        aria-label="Selected order review"
        onScroll={(event) => {
          const content = event.currentTarget;
          if (content.scrollTop + content.clientHeight >= content.scrollHeight - 12) onReadCurrent();
        }}
        onKeyDown={(event) => {
        if (event.key === "ArrowLeft" && index > 0) onPrevious();
        if (event.key === "ArrowRight") {
          if (!last) onNext();
          else if (termsAccepted) onSummary();
        }
        }}
      >
        <section className="pt-[16px]">
          <SectionHeadingDivider title="ORDER DETAILS" className="px-[24px]" />
          <InvestmentDetailField label="Product" value={draft.name} />
          <InvestmentDetailField label="Amount" value={formatMoney(draft.amount, country)} />
          <InvestmentDetailField label="ISIN" value={draft.isin} />
          <InvestmentDetailField label="Order type" value={draft.orderType === "REGULAR INVESTMENT" ? "Regular investment" : `One off ${draft.orderType}`} />
        </section>
        <section className="pt-[16px]" data-testid="bulk-ex-ante-costs">
          <SectionHeadingDivider title="DISCLOSURES" className="px-[24px]" />
          <InvestmentOrderDocumentsAccordion currency={getCountryCurrency(country)} initialOpenSection="ex-ante" />
        </section>
      </div>
      <div data-testid="bulk-review-fixed-bottom-area" className="relative z-10 shrink-0 bg-[var(--uc-surface)] shadow-[0_-2px_8px_rgba(38,38,38,0.12)]">
      <div data-testid="bulk-review-current-draft-row" className="border-t border-[var(--uc-border)] px-[16px] py-[12px]">
        <div className="flex min-h-[32px] items-center gap-[10px]">
          <FlowBulkSelectionCheckbox
            checked
            onToggle={onDeselect}
            label={`Selected: ${draft.name}. Activate to deselect.`}
          />
          <div className="min-w-0">
            <p className="truncate uc-type-n5-strong text-[var(--uc-text)]">{draft.name}</p>
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{draft.orderType === "REGULAR INVESTMENT" ? "Regular investment" : `One off ${draft.orderType}`}</p>
          </div>
        </div>
      </div>
      {last ? (
        <div data-testid="bulk-review-terms-row" className="flex items-center justify-between gap-[16px] border-t border-[var(--uc-border)] px-[16px] py-[8px]">
          <p className="flex-1 uc-type-n5 text-[var(--uc-text)]">I have read and accept the terms and conditions for the marked orders.</p>
          <ToggleButton ariaLabel="Accept terms and conditions" checked={termsAccepted} onToggle={onTermsToggle} />
        </div>
      ) : null}
      <div data-testid="bulk-review-bottom-navigation" className={`shrink-0 bg-[var(--uc-surface)] ${last ? "" : "border-t border-[var(--uc-border)]"}`}>
        <div className={`relative flex items-center justify-between px-[16px] pb-0 ${last ? "pt-[12px]" : "pt-[8px]"}`}>
          {index === 0 ? (
            <span data-testid="bulk-review-back-spacer" className="size-[32px]" aria-hidden="true" />
          ) : (
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Previous draft"
              className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-action)] pr-[2px] text-[var(--uc-text-inverse)] transition-colors hover:bg-[var(--uc-action-hover)]"
            >
              <AppIcon name="back-heavy" size={16} color="currentColor" />
            </button>
          )}
          <p data-testid="bulk-review-progress" className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap uc-type-n4-strong text-[var(--uc-text)]">Order {index + 1} of {drafts.length}</p>
          {last ? (
            <PrimaryButton
              onClick={onSummary}
              disabled={!termsAccepted}
              className="!ml-auto !h-[32px] !w-auto !min-w-[80px] !gap-0 !px-[10px] !py-0"
            >
              Summary
            </PrimaryButton>
          ) : (
            <button
              type="button"
              onClick={onNext}
              aria-label="Next draft"
              className="grid size-[32px] place-items-center rounded-full bg-[var(--uc-action)] pl-[2px] text-[var(--uc-text-inverse)] transition-colors hover:bg-[var(--uc-action-hover)]"
            >
              <span className="rotate-180"><AppIcon name="back-heavy" size={16} color="currentColor" /></span>
            </button>
          )}
        </div>
        <div data-testid="bulk-review-read-status" data-read={isRead ? "true" : "false"} role="status" aria-live="polite" className={`flex items-center justify-center px-[16px] ${last ? "pb-[16px] pt-[2px]" : "pb-[8px] pt-0"}`}>
          <span className="flex h-[24px] items-center justify-center gap-[6px] uc-type-p2 text-[var(--uc-text-muted)]">
            {isRead ? <span className="grid size-[16px] place-items-center rounded-full bg-[var(--uc-green-olive)]"><AppIcon name="check" size={11} color="var(--uc-text-inverse)" /></span> : <span className="size-[12px] rounded-full border border-[var(--uc-text-muted)]" aria-hidden="true" />}
            {isRead ? "You're all caught up" : "Scroll down for all the details"}
          </span>
        </div>
      </div>
      </div>
      {staticPreview ? <span className="sr-only">Static Flow Library review preview</span> : null}
    </PrototypeShell>
  );
}

function BulkSummaryScreen({
  selectedIds,
  rejectedIds,
  reviewedIds,
  termsAccepted,
  onBack,
  onConfirm,
  onViewDraft,
  staticPreview = false,
}: {
  selectedIds: readonly string[];
  rejectedIds: readonly string[];
  reviewedIds: readonly string[];
  termsAccepted: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onViewDraft: (draft: BulkDraft, status: SummaryOrderStatus) => void;
  staticPreview?: boolean;
}) {
  const { country } = useDemo();
  const eligible = selectedIds.length > 0 && selectedIds.every((id) => reviewedIds.includes(id)) && termsAccepted;
  return (
    <PrototypeShell>
      <PageHeader title="Orders summary" onBack={onBack} includeSafeArea showHelp={false} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[16px] pb-[16px] scrollbar-hide">
        <p className="pt-[10px] uc-type-n4 text-[var(--uc-text)]">{selectedIds.length} marked orders. This is a read-only summary; return to review to change selection.</p>
        <div className="mt-[16px] space-y-[8px]" role="list" aria-label="Pending draft summary">
          {BULK_DRAFTS.map((draft) => {
            const status = getSummaryOrderStatus(draft, selectedIds, rejectedIds);
            const statusLabel = getSummaryStatusLabel(status);
            return (
              <li key={draft.id} role="listitem" className="list-none">
                <button type="button" data-testid={`bulk-summary-draft-${draft.id}`} onClick={() => onViewDraft(draft, status)} aria-label={`View ${draft.name} order details`} className="block w-full rounded-[8px] border border-[var(--uc-border)] px-[12px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]">
                  <div className="flex items-start gap-[10px]">
                    <BrandLogo logoId="unicredit" size={32} label={`${draft.name} product`} />
                    <div className="min-w-0 flex-1">
                      <p className="break-words uc-type-n4-strong text-[var(--uc-text)]">{draft.name}</p>
                      <p className="mt-[6px] break-words uc-type-p2 text-[var(--uc-text-muted)]">{draft.orderType} · {draft.isin}</p>
                      <p className="mt-[2px] uc-type-n5-strong text-[var(--uc-text)]">{formatMoney(draft.amount, country)}</p>
                      <div className="mt-[6px] flex items-center gap-[6px]">
                        <span data-testid={`bulk-summary-status-marker-${draft.id}`} className={`grid size-[14px] shrink-0 place-items-center rounded-full ${status === "Marked to sign" ? "bg-[var(--uc-green-olive)]" : "bg-[var(--uc-border-muted)]"}`} aria-hidden="true">
                          {status === "Marked to sign" ? <AppIcon name="check" size={10} color="var(--uc-static-white)" /> : null}
                        </span>
                        <p className="uc-type-n5-strong text-[var(--uc-text)]">{statusLabel}</p>
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </div>
        {!eligible ? <p role="status" className="mt-[12px] uc-type-n5 text-[var(--uc-text-muted)]">Signing remains unavailable until every marked order has been presented and the final terms acknowledgement is set.</p> : null}
      </div>
      <div className="border-t border-[var(--uc-border)] bg-[var(--uc-surface)] px-[24px] pb-[28px] pt-[12px]">
        <div data-testid="bulk-summary-action-group" className="flex flex-col items-center gap-[8px]">
          <button type="button" onClick={onBack} className="h-[44px] px-[12px] text-[18px] font-bold leading-normal text-[var(--uc-action)]">Back to review</button>
          <PrimaryButton className="!w-full" disabled={!eligible} onClick={onConfirm}>Confirm and sign ALL marked ORDERS</PrimaryButton>
        </div>
      </div>
      {staticPreview ? <span className="sr-only">Static Flow Library summary preview</span> : null}
    </PrototypeShell>
  );
}

function BulkSummaryOrderDetailScreen({
  draft,
  status,
  onBack,
}: {
  draft: BulkDraft;
  status: SummaryOrderStatus;
  onBack: () => void;
}) {
  const { country } = useDemo();
  return (
    <PrototypeShell>
      <PageHeader title="Order details" onBack={onBack} includeSafeArea showHelp={false} />
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <div className="border-b border-[var(--uc-border)] px-[24px] py-[14px]">
          <p className="uc-type-p2 text-[var(--uc-text-muted)]">Order status</p>
          <p className={`mt-[2px] uc-type-n4-strong ${status === "Rejected" ? "text-[var(--uc-red-main)]" : "text-[var(--uc-text)]"}`}>{status}</p>
        </div>
        <section className="pt-[16px]">
          <SectionHeadingDivider title="ORDER DETAILS" className="px-[24px]" />
          <InvestmentDetailField label="Product" value={draft.name} />
          <InvestmentDetailField label="Amount" value={formatMoney(draft.amount, country)} />
          <InvestmentDetailField label="ISIN" value={draft.isin} />
          <InvestmentDetailField label="Order type" value={draft.orderType === "REGULAR INVESTMENT" ? "Regular investment" : `One off ${draft.orderType}`} />
        </section>
        <section className="pt-[16px]">
          <SectionHeadingDivider title="DISCLOSURES" className="px-[24px]" />
          <InvestmentOrderDocumentsAccordion currency={getCountryCurrency(country)} initialOpenSection="ex-ante" />
        </section>
      </div>
    </PrototypeShell>
  );
}

function BulkSignScreen({ onBack, onSigned }: { onBack: () => void; onSigned: () => void }) {
  return <StandardSignScreen title="Sign all marked orders" pinLabel="Enter PIN to sign the marked orders" pinHelper="One authorization for this prototype batch" actionLabel="Sign order" onBack={onBack} onSign={onSigned} />;
}

function BulkConfirmationScreen({ onOrdersToApprove }: { onOrdersToApprove: () => void }) {
  return (
    <PrototypeShell>
      <div className="flex min-h-0 flex-1 flex-col px-[24px] pt-[84px]">
        <section data-testid="bulk-signing-success-tile" className="bg-[var(--uc-surface)] px-[24px] py-[32px] text-center">
          <span className="mx-auto grid size-[64px] place-items-center rounded-full bg-[var(--uc-green-olive)]">
            <AppIcon name="prime-check" size={40} color="var(--uc-static-white)" />
          </span>
          <h1 className="mt-[20px] uc-type-h2 text-[var(--uc-text)]">Signing successful</h1>
          <p className="mt-[12px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">Your signing step is complete in this prototype.</p>
        </section>
      </div>
      <div className="px-[24px] pb-[42px]">
        <PrimaryButton onClick={onOrdersToApprove}>Back to Orders to approve</PrimaryButton>
      </div>
    </PrototypeShell>
  );
}

function BulkFailureScreen({ onBack }: { onBack: () => void }) {
  return (
    <PrototypeShell>
      <PageHeader title="Signing result" onBack={onBack} includeSafeArea showHelp={false} />
      <div className="px-[24px] pt-[28px]">
        <p className="uc-type-h2 text-[var(--uc-red-main)]">Failed to send</p>
        <p className="mt-[12px] uc-type-n4 text-[var(--uc-text)]">onemarkets Climate Focus Fund · LU1953188835</p>
        <p className="mt-[8px] uc-type-n5 text-[var(--uc-text-muted)]">Prototype error representation only. No backend result or order status was changed.</p>
      </div>
    </PrototypeShell>
  );
}

/**
 * Stateful Flow Library-only prototype. It deliberately does not connect to the
 * runtime Investments screens or an API; all decisions live for this preview
 * mount and reset when the prototype is reopened.
 */
function BulkApprovalPrototype() {
  const [view, setView] = useState<"selection" | "review" | "summary" | "summary-detail" | "sign" | "confirmation" | "failure">("selection");
  const [selectedIds, setSelectedIds] = useState<string[]>([...DEFAULT_SELECTED_IDS]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [readDraftIds, setReadDraftIds] = useState<string[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [summaryInspectionId, setSummaryInspectionId] = useState<string | null>(null);
  const [rejectSheetOpen, setRejectSheetOpen] = useState(false);
  const selectedDrafts = useMemo(
    () => BULK_DRAFTS.filter((draft) => selectedIds.includes(draft.id) && !rejectedIds.includes(draft.id)),
    [rejectedIds, selectedIds],
  );
  const selectableDraftIds = useMemo(() => BULK_DRAFTS.filter((draft) => !rejectedIds.includes(draft.id)).map((draft) => draft.id), [rejectedIds]);

  const toggleSelection = (id: string) => {
    const draft = BULK_DRAFTS.find((candidate) => candidate.id === id);
    if (!draft || rejectedIds.includes(draft.id)) return;
    setSelectedIds((current) => current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]);
    setReviewedIds((current) => current.filter((candidate) => candidate !== id));
    setReadDraftIds((current) => current.filter((candidate) => candidate !== id));
    setTermsAccepted(false);
  };

  const toggleAll = () => {
    setSelectedIds((current) => current.length === selectableDraftIds.length ? [] : [...selectableDraftIds]);
    setReviewedIds([]);
    setReadDraftIds([]);
    setTermsAccepted(false);
  };

  const rejectSelected = () => {
    if (selectedIds.length === 0) return;
    setRejectedIds((current) => [...new Set([...current, ...selectedIds])]);
    setSelectedIds([]);
    setReviewedIds([]);
    setReadDraftIds([]);
    setTermsAccepted(false);
    setRejectSheetOpen(false);
  };

  const startReview = () => {
    if (selectedDrafts.length === 0) return;
    setReviewIndex(0);
    setReviewedIds([selectedDrafts[0]!.id]);
    setReadDraftIds([]);
    setTermsAccepted(false);
    setView("review");
  };

  const moveTo = (nextIndex: number) => {
    const next = selectedDrafts[nextIndex];
    if (!next) return;
    setReviewIndex(nextIndex);
    setReviewedIds((current) => current.includes(next.id) ? current : [...current, next.id]);
  };

  const deselectCurrent = () => {
    const current = selectedDrafts[reviewIndex];
    if (!current) return;
    const nextIds = selectedIds.filter((id) => id !== current.id);
    const remainingDrafts = selectedDrafts.filter((draft) => draft.id !== current.id);
    const replacement = remainingDrafts[Math.min(reviewIndex, remainingDrafts.length - 1)];
    setSelectedIds(nextIds);
    setReviewedIds((ids) => {
      const withoutCurrent = ids.filter((id) => id !== current.id);
      return replacement && !withoutCurrent.includes(replacement.id)
        ? [...withoutCurrent, replacement.id]
        : withoutCurrent;
    });
    setReadDraftIds((ids) => ids.filter((id) => id !== current.id));
    setTermsAccepted(false);
    if (nextIds.length === 0) {
      setView("selection");
      return;
    }
    setReviewIndex((currentIndex) => Math.min(currentIndex, nextIds.length - 1));
  };

  if (view === "selection") return <><BulkSelectionScreen selectedIds={selectedIds} rejectedIds={rejectedIds} onToggle={toggleSelection} onToggleAll={toggleAll} onSignOrders={startReview} onRejectSelected={() => setRejectSheetOpen(true)} />{rejectSheetOpen ? <BulkRejectConfirmationSheet selectedCount={selectedIds.length} onClose={() => setRejectSheetOpen(false)} onConfirm={rejectSelected} /> : null}</>;
  if (view === "review") return <BulkReviewScreen drafts={selectedDrafts} index={reviewIndex} readDraftIds={readDraftIds} termsAccepted={termsAccepted} onPrevious={() => moveTo(reviewIndex - 1)} onNext={() => moveTo(reviewIndex + 1)} onSummary={() => setView("summary")} onBackToSelection={() => setView("selection")} onDeselect={deselectCurrent} onReadCurrent={() => setReadDraftIds((current) => current.includes(selectedDrafts[reviewIndex]!.id) ? current : [...current, selectedDrafts[reviewIndex]!.id])} onTermsToggle={() => setTermsAccepted((current) => !current)} />;
  if (view === "summary") return <BulkSummaryScreen selectedIds={selectedIds} rejectedIds={rejectedIds} reviewedIds={reviewedIds} termsAccepted={termsAccepted} onBack={() => setView("review")} onConfirm={() => setView("sign")} onViewDraft={(draft) => { setSummaryInspectionId(draft.id); setView("summary-detail"); }} />;
  if (view === "summary-detail") {
    const draft = BULK_DRAFTS.find((candidate) => candidate.id === summaryInspectionId) ?? BULK_DRAFTS[0]!;
    return <BulkSummaryOrderDetailScreen draft={draft} status={getSummaryOrderStatus(draft, selectedIds, rejectedIds)} onBack={() => setView("summary")} />;
  }
  if (view === "sign") return <BulkSignScreen onBack={() => setView("summary")} onSigned={() => setView("confirmation")} />;
  if (view === "confirmation") return <BulkConfirmationScreen onOrdersToApprove={() => setView("selection")} />;
  return <BulkFailureScreen onBack={() => setView("summary")} />;
}

export function renderInvestmentsBulkApprovalPreview(kind: string) {
  const staticSelected: readonly string[] = [];
  const staticReviewSelected: readonly string[] = STATIC_REVIEW_SELECTED_IDS;
  const staticReviewDrafts = BULK_DRAFTS.filter((draft) => staticReviewSelected.includes(draft.id));
  const staticRejected: readonly string[] = ["draft-10"];
  const noop = () => undefined;

  switch (kind) {
    case "investments-bulk-prototype":
      return <BulkApprovalPrototype />;
    case "investments-bulk-selection":
      return <BulkSelectionScreen selectedIds={staticSelected} rejectedIds={[]} onToggle={noop} onToggleAll={noop} onSignOrders={noop} onRejectSelected={noop} staticPreview />;
    case "investments-bulk-review-first":
      return <BulkReviewScreen drafts={staticReviewDrafts} index={0} readDraftIds={[]} termsAccepted={false} onPrevious={noop} onNext={noop} onSummary={noop} onBackToSelection={noop} onDeselect={noop} onReadCurrent={noop} onTermsToggle={noop} staticPreview />;
    case "investments-bulk-review-last":
      return <BulkReviewScreen drafts={staticReviewDrafts} index={staticReviewDrafts.length - 1} readDraftIds={STATIC_REVIEW_SELECTED_IDS} termsAccepted={false} onPrevious={noop} onNext={noop} onSummary={noop} onBackToSelection={noop} onDeselect={noop} onReadCurrent={noop} onTermsToggle={noop} staticPreview />;
    case "investments-bulk-summary-blocked":
      return <BulkSummaryScreen selectedIds={STATIC_REVIEW_SELECTED_IDS} rejectedIds={staticRejected} reviewedIds={[STATIC_REVIEW_SELECTED_IDS[0]!]} termsAccepted={false} onBack={noop} onConfirm={noop} onViewDraft={noop} staticPreview />;
    case "investments-bulk-summary-ready":
      return <BulkSummaryScreen selectedIds={STATIC_REVIEW_SELECTED_IDS} rejectedIds={staticRejected} reviewedIds={STATIC_REVIEW_SELECTED_IDS} termsAccepted onBack={noop} onConfirm={noop} onViewDraft={noop} staticPreview />;
    case "investments-bulk-sign":
      return <BulkSignScreen onBack={noop} onSigned={noop} />;
    case "investments-bulk-confirmation":
      return <BulkConfirmationScreen onOrdersToApprove={noop} />;
    case "investments-bulk-failure":
      return <BulkFailureScreen onBack={noop} />;
    default:
      return null;
  }
}
