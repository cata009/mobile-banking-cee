import BeneficiaryAvatar from "@/app/components/payments/BeneficiaryAvatar";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import type { PaymentTemplateSelection } from "@/data/paymentTemplates";
import { useState } from "react";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-[14px] py-[13px]">
      <span className="shrink-0 text-[13px] text-[var(--uc-text-muted)]">{label}</span>
      <span className="min-w-0 break-all text-right text-[13px] font-semibold text-[var(--uc-text)]">{value}</span>
    </div>
  );
}

function sentenceCase(value: string) {
  const lower = value.toLocaleLowerCase();
  return `${lower.slice(0, 1).toLocaleUpperCase()}${lower.slice(1)}`;
}

export default function PaymentSelectionDetailScreen({
  selection,
  onBack,
  onUse,
  onEdit,
  onDelete,
  useLabel,
}: {
  selection: PaymentTemplateSelection;
  onBack: () => void;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
  useLabel: string;
}) {
  const isTemplate = selection.kind === "template";
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const actions: AccountActionBarItem[] = [
    { id: "edit", iconName: "edit-pencil", label: "Edit", onClick: onEdit },
    { id: "delete", iconName: "trash-2", label: "Delete", onClick: () => setDeleteConfirmOpen(true) },
  ];
  const savedAccountNumber = [
    selection.paymentAccountPrefix && `${selection.paymentAccountPrefix}-`,
    selection.paymentAccountNumber,
    selection.bankCode && `/${selection.bankCode}`,
  ].filter(Boolean).join("");

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader
          title={selection.beneficiaryName}
          onBack={onBack}
          includeSafeArea
          showHelp={false}
          variant="gray"
          renderLargeTitle={false}
        />

        <main className="px-[20px] pb-[24px]">
          <header className="flex flex-col items-center pt-[12px] text-center">
            <BeneficiaryAvatar name={selection.beneficiaryName} bank={selection.bank ?? "unicredit"} size={76} />
            <h1 className="mt-[12px] font-['UniCredit',sans-serif] text-[29px] font-bold leading-[34px]">
              {selection.beneficiaryName}
            </h1>
            {isTemplate ? (
              <>
                <p className="mt-[6px] text-[14px] font-semibold leading-[18px] text-[var(--uc-text-muted)]">
                  {sentenceCase(selection.title)}
                </p>
                <p className="mt-[8px] text-[23px] font-semibold leading-[28px]">
                  {selection.amount} {selection.currency}
                </p>
                <p className="mt-[8px] text-[13px] font-bold uppercase leading-normal text-[var(--uc-text-muted)]">
                  Payment template
                </p>
              </>
            ) : (
              <p className="mt-[8px] text-[13px] font-bold uppercase leading-normal text-[var(--uc-text-muted)]">
                Saved recipient
              </p>
            )}
          </header>

          <section className="mt-[12px]" aria-label="Recipient actions">
            <AccountActionBar items={actions} align="between" />
          </section>

          <section
            className="mt-[8px] rounded-[18px] bg-[var(--uc-surface)] px-[16px]"
            aria-label={isTemplate ? "Payment template details" : "Saved recipient details"}
          >
            <DetailRow label="Beneficiary" value={selection.beneficiaryName} />
            <div className="border-t border-[var(--uc-border-muted)]">
              <DetailRow label={isTemplate ? "IBAN" : "Account"} value={isTemplate ? selection.accountNumber : savedAccountNumber} />
            </div>
            <div className="border-t border-[var(--uc-border-muted)]">
              <DetailRow label="BIC / SWIFT" value={selection.bankCode} />
            </div>
            <div className="border-t border-[var(--uc-border-muted)]">
              <DetailRow label="Bank" value={selection.bankName} />
            </div>
            {isTemplate ? (
              <>
                <div className="border-t border-[var(--uc-border-muted)]">
                  <DetailRow label="Amount" value={`${selection.amount} ${selection.currency}`} />
                </div>
                <div className="border-t border-[var(--uc-border-muted)]">
                  <DetailRow label="Payment note" value={selection.paymentNote} />
                </div>
              </>
            ) : null}
          </section>
        </main>
      </div>

      <div className="shrink-0 bg-[var(--uc-app-bg)] px-[24px] pb-[28px] pt-[10px]">
        <PrimaryButton onClick={onUse}>{useLabel}</PrimaryButton>
      </div>

      {deleteConfirmOpen ? (
        <BottomSheet
          title={isTemplate ? "Delete payment template?" : "Delete saved recipient?"}
          onClose={() => setDeleteConfirmOpen(false)}
          closeLabel="Close delete confirmation"
        >
          <div className="pb-[8px]">
            <p className="uc-type-n4 mb-[20px] text-[var(--uc-text-muted)]">
              {selection.beneficiaryName} will be removed from {isTemplate ? "payment templates" : "saved recipients and Payments Home"}.
            </p>
            <div className="flex flex-col gap-[10px]">
              <button
                type="button"
                onClick={onDelete}
                className="h-[48px] w-full rounded-[12px] bg-[var(--uc-action-strong)] text-[15px] font-semibold text-[var(--uc-static-white)]"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="h-[48px] w-full rounded-[12px] border border-[var(--uc-border)] text-[15px] font-semibold text-[var(--uc-text)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}
