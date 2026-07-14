import { useState } from "react";
import type { ReactNode } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import { AppIcon } from "@/app/components/icons";
import PrimaryButton from "@/app/components/PrimaryButton";
import TextField from "@/app/components/TextField";

export type AccountTransactionDateFilter = "none" | "last-week" | "last-month" | "last-3-months" | "custom";

export interface AccountTransactionFilterState {
  keyword: string;
  accountNumber: string;
  variableCode: string;
  datePreset: AccountTransactionDateFilter;
  amountFrom: string;
  amountTo: string;
  status: "All transactions" | "Booked" | "Pending";
  transactionType: "All transactions" | "Incoming" | "Outgoing";
  category: string;
}

export const EMPTY_ACCOUNT_TRANSACTION_FILTERS: AccountTransactionFilterState = {
  keyword: "",
  accountNumber: "",
  variableCode: "",
  datePreset: "none",
  amountFrom: "",
  amountTo: "",
  status: "All transactions",
  transactionType: "All transactions",
  category: "All categories",
};

export function hasAccountTransactionFilters(filters: AccountTransactionFilterState) {
  return (
    filters.keyword.trim().length > 0 ||
    filters.accountNumber.trim().length > 0 ||
    filters.variableCode.trim().length > 0 ||
    filters.datePreset !== "none" ||
    filters.amountFrom.trim().length > 0 ||
    filters.amountTo.trim().length > 0 ||
    filters.status !== "All transactions" ||
    filters.transactionType !== "All transactions" ||
    filters.category !== "All categories"
  );
}

interface AccountTransactionFiltersSheetProps {
  currency: string;
  filters: AccountTransactionFilterState;
  onApply: (filters: AccountTransactionFilterState) => void;
  onClose: () => void;
}

const DATE_FILTER_OPTIONS: Array<{ id: AccountTransactionDateFilter; label: string }> = [
  { id: "last-week", label: "LAST WEEK" },
  { id: "last-month", label: "LAST MONTH" },
  { id: "last-3-months", label: "LAST 3 MONTHS" },
  { id: "custom", label: "SELECT CUSTOM PERIOD" },
];

export default function AccountTransactionFiltersSheet({
  currency,
  filters,
  onApply,
  onClose,
}: AccountTransactionFiltersSheetProps) {
  const [draftFilters, setDraftFilters] = useState(filters);

  const updateDraft = (patch: Partial<AccountTransactionFilterState>) => {
    setDraftFilters((current) => ({ ...current, ...patch }));
  };

  return (
    <BottomSheet
      title="Apply filters"
      maxHeightOffsetPx={54}
      className="flex max-h-none flex-col overflow-hidden px-0 pb-0 pt-[24px]"
      headerClassName="mb-[16px] px-[24px]"
      bodyClassName="flex min-h-0 flex-1 flex-col"
      onClose={onClose}
    >
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" data-account-transaction-filters="true">
        <div className="flex flex-col gap-[24px] pb-[24px]">
          <FilterSection title="SEARCH BY TRANSACTION DETAIL">
            <div className="flex flex-col bg-[var(--uc-surface)]">
              <FilterTextField
                label="Search by keyword"
                value={draftFilters.keyword}
                onChange={(keyword) => updateDraft({ keyword })}
              />
              <FilterTextField
                label="Search by account number"
                value={draftFilters.accountNumber}
                onChange={(accountNumber) => updateDraft({ accountNumber })}
              />
              <FilterTextField
                label="Search by variable code"
                value={draftFilters.variableCode}
                onChange={(variableCode) => updateDraft({ variableCode })}
              />
            </div>
          </FilterSection>

          <FilterSection title="SEARCH BY DATE">
            <div className="flex flex-col bg-[var(--uc-surface)]">
              {DATE_FILTER_OPTIONS.map((option) => (
                <DateFilterRow
                  key={option.id}
                  label={option.label}
                  selected={draftFilters.datePreset === option.id}
                  onClick={() => updateDraft({ datePreset: draftFilters.datePreset === option.id ? "none" : option.id })}
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection title="SEARCH BY AMOUNT">
            <div className="flex flex-col bg-[var(--uc-surface)]">
              <AmountFilterField
                label="From"
                value={draftFilters.amountFrom}
                currency={currency}
                onChange={(amountFrom) => updateDraft({ amountFrom })}
              />
              <AmountFilterField
                label="To"
                value={draftFilters.amountTo}
                currency={currency}
                onChange={(amountTo) => updateDraft({ amountTo })}
              />
            </div>
          </FilterSection>

          <FilterSection title="BY STATUS">
            <div className="flex flex-col bg-[var(--uc-surface)]">
              <SelectLikeField label="Select status" value={draftFilters.status} />
              <SelectLikeField label="Transaction type" value={draftFilters.transactionType} />
            </div>
          </FilterSection>

          <FilterSection title="SEARCH BY CATEGORY">
            <div className="bg-[var(--uc-surface)]">
              <SelectLikeField label="Select category" value={draftFilters.category} />
            </div>
          </FilterSection>
        </div>
      </div>

      <div className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[8px] pt-[8px]">
        <PrimaryButton
          disabled={!hasAccountTransactionFilters(draftFilters)}
          labelSize="18"
          onClick={() => onApply(draftFilters)}
        >
          Apply
        </PrimaryButton>
      </div>
      <div className="flex h-[34px] shrink-0 items-center justify-center bg-[var(--uc-surface)]">
        <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
      </div>
    </BottomSheet>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[16px]">
      <div className="relative flex h-[32px] items-center bg-[var(--uc-surface)] pl-[24px] pr-[16px] pt-[6px]">
        <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{title}</h2>
        <span aria-hidden="true" className="absolute bottom-0 left-[16px] h-px w-[343px] bg-[var(--uc-border)]" />
      </div>
      {children}
    </section>
  );
}

function FilterTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="h-[64px] px-[24px] pt-[4px]">
      <TextField label={label} value={value} onChange={onChange} />
    </div>
  );
}

function DateFilterRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[80px] w-full items-center gap-[8px] bg-[var(--uc-surface)] px-[16px] text-left"
      role="radio"
      aria-checked={selected}
    >
      <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
        <AppIcon name={selected ? "radio-selected" : "radio-unselected"} color="var(--uc-text)" />
      </span>
      <span className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{label}</span>
    </button>
  );
}

function AmountFilterField({
  label,
  value,
  currency,
  onChange,
}: {
  label: string;
  value: string;
  currency: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid h-[96px] grid-cols-[208px_66px] gap-[24px] bg-[var(--uc-surface)] px-[24px] pt-[14px]">
      <TextField label={label} value={value} onChange={onChange} />
      <div className="pt-[2px]">
        <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">Currency</p>
        <p className="text-[18px] font-normal leading-[22px] text-[var(--uc-text)]">{currency}</p>
      </div>
    </div>
  );
}

function SelectLikeField({ label, value }: { label: string; value: string }) {
  return (
    <button type="button" className="relative h-[96px] w-full bg-[var(--uc-surface)] text-left">
      <div className="absolute left-[24px] top-[14px] w-[295px]">
        <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{label}</p>
        <p className="mt-[4px] text-[18px] font-normal leading-[22px] text-[var(--uc-text)]">{value}</p>
        <div className="mt-[7px] h-px w-[295px] bg-[var(--uc-border)]" />
      </div>
      <span aria-hidden="true" className="absolute left-[331px] top-[20px] grid size-[32px] place-items-center">
        <AppIcon name="chevron-down" color="var(--uc-text)" />
      </span>
    </button>
  );
}
