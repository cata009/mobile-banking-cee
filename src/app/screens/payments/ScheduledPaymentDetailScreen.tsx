import { useState } from "react";
import BeneficiaryAvatar from "@/app/components/payments/BeneficiaryAvatar";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import { formatEvo2027Amount } from "@/app/utils/evo2027Formatting";
import { formatScheduleDateAbsolute, SCHEDULE_REPEAT_OPTIONS } from "@/app/utils/scheduleFormatting";
import type { RecurrentPayment } from "@/data/paymentsHub";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-[14px] py-[13px]">
      <span className="shrink-0 text-[13px] text-[var(--uc-text-muted)]">{label}</span>
      <span className="min-w-0 break-words text-right text-[13px] font-semibold text-[#111111]">{value}</span>
    </div>
  );
}

export default function ScheduledPaymentDetailScreen({
  payment,
  onBack,
  onEdit,
  onDelete,
}: {
  payment: RecurrentPayment;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const amount = formatEvo2027Amount(payment.amount, payment.currency);
  const amountSign = payment.kind === "internal-transfer" ? "" : "−";
  const repeatLabel = payment.schedule
    ? SCHEDULE_REPEAT_OPTIONS.find((option) => option.id === payment.schedule?.repeat)?.label
    : null;
  const nextPayment = payment.nextDate.toLowerCase() === "today" && payment.schedule
    ? formatScheduleDateAbsolute(payment.schedule.startDate)
    : payment.nextDate;
  const paymentType = payment.details
    ? "Move money"
    : payment.kind === "direct-debit"
      ? "Direct debit"
      : "Standing order";
  const actions: AccountActionBarItem[] = [
    { id: "edit", iconName: "edit-pencil", label: "Edit", onClick: onEdit },
    { id: "delete", iconName: "trash-2", label: "Delete", onClick: () => setDeleteConfirmOpen(true) },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader
          title={payment.name}
          onBack={onBack}
          includeSafeArea
          showHelp={false}
          variant="gray"
          renderLargeTitle={false}
        />

        <main className="px-[20px] pb-[34px]">
          <header className="flex flex-col items-center pt-[12px] text-center">
            <BeneficiaryAvatar name={payment.name} bank="unicredit" size={76} />
            <h1 className="mt-[12px] font-['UniCredit',sans-serif] text-[29px] font-bold leading-[34px]">
              {payment.name}
            </h1>
            {repeatLabel ? (
              <p className="mt-[4px] text-[14px] font-semibold leading-[18px] text-[var(--uc-text-muted)]">
                {repeatLabel}
              </p>
            ) : null}
            <p className="mt-[4px] text-[23px] font-semibold leading-[28px]">
              {amountSign}{amount.integer}{amount.decimals} {amount.currency}
            </p>
            <p className="mt-[8px] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
              {paymentType.toUpperCase()}
            </p>
          </header>

          <section className="mt-[12px]" aria-label="Payment actions">
            <AccountActionBar items={actions} align="between" />
          </section>

          <section className="mt-[16px] rounded-[18px] bg-[var(--uc-surface)] px-[16px]" aria-label="Payment schedule">
            {payment.schedule ? (
              <>
                <DetailRow label="Starts on" value={formatScheduleDateAbsolute(payment.schedule.startDate)} />
                <div className="border-t border-[var(--uc-border-muted)]">
                  <DetailRow label="Next payment" value={nextPayment} />
                </div>
                <div className="border-t border-[var(--uc-border-muted)]">
                  <DetailRow label="Repeat" value={repeatLabel ?? "Never"} />
                </div>
                {payment.schedule.repeat !== "never" ? (
                  <div className="border-t border-[var(--uc-border-muted)]">
                    <DetailRow
                      label="Ends on"
                      value={payment.schedule.endsOn.type === "on-date"
                      ? formatScheduleDateAbsolute(payment.schedule.endsOn.date)
                        : "Never"}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <DetailRow label="Next payment" value={nextPayment} />
            )}
            <div className="border-t border-[var(--uc-border-muted)]">
              <DetailRow label="Amount" value={`${amountSign}${amount.integer}${amount.decimals} ${amount.currency}`} />
            </div>
            <div className="border-t border-[var(--uc-border-muted)]">
              <DetailRow label="Payment type" value={paymentType} />
            </div>
            {payment.isLimit ? (
              <div className="border-t border-[var(--uc-border-muted)]">
                <DetailRow label="Limit" value={`${amountSign}${amount.integer}${amount.decimals} ${amount.currency}`} />
              </div>
            ) : null}
          </section>

          <section className="mt-[12px] rounded-[18px] bg-[var(--uc-surface)] px-[16px]" aria-label="Payment details">
            {payment.sourceAccountName ? (
              <DetailRow label="Payment from" value={`${payment.sourceAccountName} · ${payment.currency}`} />
            ) : null}
            <div className={payment.sourceAccountName ? "border-t border-[var(--uc-border-muted)]" : ""}>
              <DetailRow
                label={payment.destinationAccountName ? "Payment to" : "Payee"}
                value={payment.destinationAccountName ?? payment.name}
              />
            </div>
            {payment.note ? (
              <div className="border-t border-[var(--uc-border-muted)]">
                <DetailRow label="Note" value={payment.note} />
              </div>
            ) : null}
            {payment.details && !payment.sourceAccountName ? (
              <div className="border-t border-[var(--uc-border-muted)]">
                <DetailRow label="Details" value={payment.details} />
              </div>
            ) : null}
          </section>
        </main>
      </div>

      {deleteConfirmOpen ? (
        <BottomSheet
          title="Delete scheduled payment?"
          onClose={() => setDeleteConfirmOpen(false)}
          closeLabel="Close delete confirmation"
        >
          <div className="pb-[8px]">
            <p className="uc-type-n4 mb-[20px] text-[var(--uc-text-muted)]">
              {payment.name} will be removed from scheduled payments.
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
