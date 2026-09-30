import { useEffect, useState } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import BeneficiaryAvatar from "@/app/components/payments/BeneficiaryAvatar";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import InternalTransferScreen from "@/app/screens/payments/InternalTransferScreen";
import ScheduledPaymentDetailScreen from "@/app/screens/payments/ScheduledPaymentDetailScreen";
import ScheduledTransferSetupPage from "@/app/screens/payments/ScheduledTransferSetupPage";
import { useCountry } from "@/app/state/demoStore";
import { formatEvo2027Amount } from "@/app/utils/evo2027Formatting";
import { formatScheduleDateAbsolute, toIsoDateOnly } from "@/app/utils/scheduleFormatting";
import {
  createRecurrentPayment,
  deleteRecurrentPayment,
  getAllRecurrentPayments,
  updateRecurrentPayment,
  type RecurrentPayment,
} from "@/data/paymentsHub";
import type { ScheduleConfig } from "@/data/schedule";
import type { InternalTransferDraft } from "@/app/screens/payments/internalTransferState";

interface RecurrentPaymentsScreenProps {
  onBack: () => void;
  isEvo2027?: boolean;
}

/**
 * Standing orders and direct debits, as the bank lists them: one tab each, a
 * search over the list, and a single CREATE NEW anchored to the bottom so the
 * primary action never scrolls away from a long list.
 */
export default function RecurrentPaymentsScreen({ onBack, isEvo2027 = false }: RecurrentPaymentsScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const [kind, setKind] = useState<"standing-order" | "direct-debit">("standing-order");
  const [searchValue, setSearchValue] = useState("");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [createFlow, setCreateFlow] = useState<"schedule" | "transfer" | "edit-schedule" | "edit-transfer" | "details" | null>(null);
  const [scheduleReturnStep, setScheduleReturnStep] = useState<"create-options" | "transfer" | "edit-transfer">("create-options");
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null);
  const [isCreatingScheduledTransfer, setIsCreatingScheduledTransfer] = useState(false);
  const [payments, setPayments] = useState<RecurrentPayment[]>(() => getAllRecurrentPayments(country));
  const [selectedPayment, setSelectedPayment] = useState<RecurrentPayment | null>(null);
  const [transferDraft, setTransferDraft] = useState<InternalTransferDraft | null>(null);

  useEffect(() => {
    setPayments(getAllRecurrentPayments(country));
  }, [country]);

  const normalizedSearch = searchValue.trim().toLocaleLowerCase();
  const matchesSearch = (row: RecurrentPayment) =>
    !normalizedSearch || [row.name, row.details, row.sourceAccountName, row.destinationAccountName]
      .some((value) => Boolean(value?.toLocaleLowerCase().includes(normalizedSearch)));
  const internalTransfers = payments.filter((row) => row.kind === "internal-transfer").filter(matchesSearch);
  const standingOrders = payments.filter((row) => row.kind === "standing-order").filter(matchesSearch);
  const directDebits = payments.filter((row) => row.kind === "direct-debit").filter(matchesSearch);
  const rows = kind === "standing-order" ? standingOrders : directDebits;

  const tabs: ReadonlyArray<{ id: "standing-order" | "direct-debit"; label: string }> = [
    { id: "standing-order", label: t("runtime.payments.recurrent.standingOrders", "Standing Orders") },
    { id: "direct-debit", label: t("runtime.payments.recurrent.directDebits", "Direct Debit") },
  ];
  const openPaymentDetails = (payment: RecurrentPayment) => {
    setIsCreatingScheduledTransfer(false);
    setSelectedPayment(payment);
    setCreateFlow("details");
  };

  if (isEvo2027 && createFlow === "schedule") {
    return (
      <ScheduledTransferSetupPage
        initialSchedule={scheduleConfig}
        onBack={() => {
          if (scheduleReturnStep === "transfer") {
            setCreateFlow("transfer");
          } else if (scheduleReturnStep === "edit-transfer") {
            setCreateFlow("edit-transfer");
          } else {
            setCreateFlow(null);
            setCreateSheetOpen(true);
          }
        }}
        onConfirm={(nextSchedule) => {
          setScheduleConfig(nextSchedule);
          setCreateFlow(scheduleReturnStep === "edit-transfer" ? "edit-transfer" : "transfer");
        }}
      />
    );
  }

  if (
    isEvo2027
    && (createFlow === "transfer" || createFlow === "edit-transfer")
    && (scheduleConfig || isCreatingScheduledTransfer)
  ) {
    const editingPayment = createFlow === "edit-transfer" ? selectedPayment : null;
    const initialDraft = transferDraft ?? (editingPayment ? transferDraftFromPayment(editingPayment) : undefined);
    return (
      <InternalTransferScreen
        initialSchedule={scheduleConfig}
        initialDraft={initialDraft}
        requireSchedule={isCreatingScheduledTransfer}
        isEditing={Boolean(editingPayment)}
        submitLabel={editingPayment ? "Save changes" : undefined}
        onBack={(draft) => {
          if (editingPayment) {
            setTransferDraft(null);
            setCreateFlow("details");
          } else {
            setTransferDraft(draft ?? null);
            setIsCreatingScheduledTransfer(false);
            setCreateFlow(null);
            setCreateSheetOpen(true);
          }
        }}
        onEditSchedule={(draft) => {
          if (!editingPayment) return;
          setTransferDraft(draft);
          setScheduleReturnStep("edit-transfer");
          setCreateFlow("schedule");
        }}
        onDone={() => {
            setTransferDraft(null);
            setIsCreatingScheduledTransfer(false);
            if (editingPayment) {
            setCreateFlow("details");
          } else {
            setScheduleConfig(null);
            setScheduleReturnStep("create-options");
            setCreateFlow(null);
          }
        }}
        onComplete={({
          sourceAccountId,
          destinationAccountId,
          sourceAccountName,
          destinationAccountName,
          amount,
          currency,
          note,
          schedule,
        }) => {
          if (!schedule) return;
          const updates: Partial<RecurrentPayment> = {
            nextDate: formatScheduleDateAbsolute(schedule.startDate),
            amount,
            currency,
            schedule,
            details: `${sourceAccountName} → ${destinationAccountName}`,
            sourceAccountId,
            destinationAccountId,
            sourceAccountName,
            destinationAccountName,
            note,
          };
          if (editingPayment) {
            const updatedPayment = { ...editingPayment, ...updates };
            updateRecurrentPayment(country, editingPayment.id, updates);
            setPayments((current) => current.map((payment) => (
              payment.id === editingPayment.id ? updatedPayment : payment
            )));
            setSelectedPayment(updatedPayment);
          } else {
            const payment: RecurrentPayment = {
              ...updates,
              id: `internal-transfer-${crypto.randomUUID()}`,
              kind: "internal-transfer",
              name: `To ${destinationAccountName}`,
              nextDate: formatScheduleDateAbsolute(schedule.startDate),
              amount,
              currency,
              schedule,
              details: `${sourceAccountName} → ${destinationAccountName}`,
              sourceAccountId,
              destinationAccountId,
              sourceAccountName,
              destinationAccountName,
              note,
            };
            createRecurrentPayment(country, payment);
            setPayments((current) => [...current, payment]);
          }
        }}
      />
    );
  }

  if (isEvo2027 && createFlow === "details" && selectedPayment) {
    return (
      <ScheduledPaymentDetailScreen
        payment={selectedPayment}
        onBack={() => {
          setCreateFlow(null);
          setSelectedPayment(null);
          setScheduleConfig(null);
          setTransferDraft(null);
        }}
        onEdit={() => {
          const initialSchedule = selectedPayment.schedule ?? scheduleFromPayment(selectedPayment);
          setScheduleConfig(initialSchedule);
          if (selectedPayment.sourceAccountId && selectedPayment.destinationAccountId) {
            setTransferDraft(transferDraftFromPayment(selectedPayment));
            setCreateFlow("edit-transfer");
          } else {
            setTransferDraft(null);
            setCreateFlow("edit-schedule");
          }
        }}
        onDelete={() => {
          deleteRecurrentPayment(country, selectedPayment.id);
          setPayments((current) => current.filter((payment) => payment.id !== selectedPayment.id));
          setSelectedPayment(null);
          setScheduleConfig(null);
          setCreateFlow(null);
        }}
      />
    );
  }

  if (isEvo2027 && createFlow === "edit-schedule" && selectedPayment) {
    const initialSchedule = scheduleConfig ?? scheduleFromPayment(selectedPayment);
    return (
      <ScheduledTransferSetupPage
        title="Edit schedule"
        confirmLabel="Save changes"
        initialSchedule={initialSchedule}
        onBack={() => {
          setCreateFlow("details");
        }}
        onConfirm={(nextSchedule) => {
          const updates = {
            schedule: nextSchedule,
            nextDate: formatScheduleDateAbsolute(nextSchedule.startDate),
          };
          updateRecurrentPayment(country, selectedPayment.id, updates);
          setPayments((current) => current.map((payment) => (
            payment.id === selectedPayment.id ? { ...payment, ...updates } : payment
          )));
          setSelectedPayment((current) => current ? { ...current, ...updates } : current);
          setScheduleConfig(nextSchedule);
          setCreateFlow("details");
        }}
      />
    );
  }

  if (isEvo2027) {
    return (
      <div className="relative flex h-full w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide pb-[112px]">
          <PageHeader
            title={t("runtime.payments.recurrent.scheduledTitle", "Scheduled payments")}
            onBack={onBack}
            includeSafeArea
            variant="gray"
          />

          <div className="px-[20px] pb-[24px] pt-[12px]">
            <div className="sticky top-[calc(var(--uc-phone-top-reserve,54px)_+_48px)] z-[9] -mx-[20px] bg-[var(--uc-app-bg)] px-[20px] pb-[24px]">
              <div
                className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px]"
                style={{ ['--uc-app-bg' as string]: 'var(--uc-surface)' }}
              >
                <AccountSearchBar
                  value={searchValue}
                  onValueChange={setSearchValue}
                  placeholder={t("runtime.payments.recurrent.search", "Search")}
                  showTrailingAction={false}
                />
              </div>
            </div>

            {internalTransfers.length === 0 && standingOrders.length === 0 && directDebits.length === 0 ? (
              <p className="uc-type-n4 py-[40px] text-center text-[var(--uc-text-muted)]">
                {t("runtime.payments.recurrent.noResults", "Nothing matches this search")}
              </p>
            ) : (
              <div className="flex flex-col gap-[24px]">
                {internalTransfers.length > 0 ? (
                  <section aria-label={t("runtime.payments.recurrent.internalTransfers", "Move money between accounts")}>
                    <h2 className="mb-[10px] text-[16px] font-semibold leading-[22px] text-[var(--uc-text)]">
                      {t("runtime.payments.recurrent.internalTransfers", "Move money between accounts")}
                    </h2>
                    <div className="overflow-hidden rounded-[16px] bg-[var(--uc-surface)] divide-y divide-[var(--uc-border-muted)]">
                      {internalTransfers.map((row) => (
                        <Evo2027RecurrentPaymentRow key={row.id} row={row} onSelect={openPaymentDetails} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {standingOrders.length > 0 ? (
                  <section aria-label={t("runtime.payments.recurrent.standingOrders", "Standing Orders")}>
                    <h2 className="mb-[10px] text-[16px] font-semibold leading-[22px] text-[var(--uc-text)]">
                      {t("runtime.payments.recurrent.standingOrders", "Standing Orders")}
                    </h2>
                    <div className="overflow-hidden rounded-[16px] bg-[var(--uc-surface)] divide-y divide-[var(--uc-border-muted)]">
                      {standingOrders.map((row) => (
                        <Evo2027RecurrentPaymentRow key={row.id} row={row} onSelect={openPaymentDetails} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {directDebits.length > 0 ? (
                  <section aria-label={t("runtime.payments.recurrent.directDebits", "Direct Debit")}>
                    <h2 className="mb-[10px] text-[16px] font-semibold leading-[22px] text-[var(--uc-text)]">
                      {t("runtime.payments.recurrent.directDebits", "Direct Debit")}
                    </h2>
                    <div className="overflow-hidden rounded-[16px] bg-[var(--uc-surface)] divide-y divide-[var(--uc-border-muted)]">
                      {directDebits.map((row) => (
                        <Evo2027RecurrentPaymentRow key={row.id} row={row} onSelect={openPaymentDetails} />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-[var(--uc-app-bg)] px-[20px] pb-[24px] pt-[12px]">
          <PrimaryButton onClick={() => setCreateSheetOpen(true)}>
            {t("runtime.payments.recurrent.createNew", "Add new")}
          </PrimaryButton>
        </div>

        {createSheetOpen ? (
          <BottomSheet
            title={t("runtime.payments.recurrent.createTitle", "Create scheduled payment")}
            onClose={() => setCreateSheetOpen(false)}
          >
            <div className="flex flex-col pb-[12px]">
              <RecurrentCreateOption
                icon="standing-order"
                title={t("runtime.payments.recurrent.createStandingOrder", "Standing order")}
                description={t("runtime.payments.recurrent.createStandingOrderDescription", "Schedule a regular transfer to a beneficiary.")}
                withDivider
              />
              <RecurrentCreateOption
                icon="currency-exchange"
                title={t("runtime.payments.recurrent.createBetweenAccounts", "Move money between accounts")}
                description={t("runtime.payments.recurrent.createBetweenAccountsDescription", "Transfer money between your own accounts.")}
                withDivider
                onClick={() => {
                  setCreateSheetOpen(false);
                  setScheduleConfig(null);
                  setTransferDraft(null);
                  setIsCreatingScheduledTransfer(true);
                  setCreateFlow("transfer");
                }}
              />
              <RecurrentCreateOption
                icon="payment-recurrent"
                title={t("runtime.payments.recurrent.createDirectDebit", "Direct debit")}
                description={t("runtime.payments.recurrent.createDirectDebitDescription", "Set up recurring payments collected by a company.")}
              />
            </div>
          </BottomSheet>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide pb-[112px]">
        <PageHeader
          title={t("runtime.payments.recurrent.title", "Recurrent payments")}
          onBack={onBack}
          includeSafeArea
        />

        <div role="tablist" aria-label={t("runtime.payments.recurrent.title", "Recurrent payments")} className="grid grid-cols-2">
          {tabs.map((tab) => {
            const active = tab.id === kind;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(tab.id)}
                className={`uc-type-n2-strong flex h-[48px] items-center justify-center border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)] ${
                  active
                    ? "border-b-[3px] border-[var(--uc-text)] text-[var(--uc-text)]"
                    : "border-[var(--uc-border-muted)] text-[var(--uc-text-muted)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="px-[16px] pt-[18px]">
          <AccountSearchBar value={searchValue} onValueChange={setSearchValue} showTrailingAction={false} />
        </div>

        <SectionHeadingDivider
          title={
            kind === "standing-order"
              ? t("runtime.payments.recurrent.selectStandingOrder", "SELECT A STANDING ORDER")
              : t("runtime.payments.recurrent.selectDirectDebit", "SELECT A DIRECT DEBIT")
          }
          variant="light-title"
          className="mt-[24px] px-[16px]"
        />

        {rows.length === 0 ? (
          <p className="uc-type-n4 px-[24px] py-[40px] text-center text-[var(--uc-text-muted)]">
            {t("runtime.payments.recurrent.noResults", "Nothing matches this search")}
          </p>
        ) : (
          <div className="px-[16px] pt-[12px]">
            {rows.map((row) => (
              <RecurrentPaymentRow key={row.id} row={row} />
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-[var(--uc-surface)] px-[16px] pb-[24px] pt-[12px]">
        <PrimaryButton onClick={() => {}}>
          {t("runtime.payments.recurrent.createNew", "Add new")}
        </PrimaryButton>
      </div>
    </div>
  );
}

function scheduleFromPayment(payment: RecurrentPayment): ScheduleConfig {
  if (payment.schedule) return payment.schedule;

  const [dayText, monthName, yearText] = payment.nextDate.split("-");
  const month = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ].indexOf(monthName ?? "");
  const day = Number(dayText);
  const year = Number(yearText);
  const validDate = month >= 0 && Number.isInteger(day) && day >= 1 && day <= 31 && Number.isInteger(year);

  return {
    startDate: validDate
      ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : toIsoDateOnly(new Date()),
    repeat: "monthly",
    endsOn: { type: "never" },
  };
}

function transferDraftFromPayment(payment: RecurrentPayment): InternalTransferDraft {
  return {
    sourceAccountId: payment.sourceAccountId ?? "",
    destinationAccountId: payment.destinationAccountId ?? "",
    amountText: String(payment.amount),
    note: payment.note ?? "",
  };
}

function Evo2027RecurrentPaymentRow({ row, onSelect }: {
  row: RecurrentPayment;
  onSelect: (payment: RecurrentPayment) => void;
}) {
  const { t } = useLanguage();
  const amount = formatEvo2027Amount(row.amount, row.currency);
  const amountSign = row.kind === "internal-transfer" ? "" : "−";
  const rowTitle = row.kind === "internal-transfer" && row.destinationAccountName
    ? `To ${row.destinationAccountName}`
    : row.name;
  const rowDetails = row.sourceAccountName && row.destinationAccountName
    ? `${row.sourceAccountName.replace(/\s+account$/i, "")} → ${row.destinationAccountName.replace(/\s+account$/i, "")}`
    : row.details;

  return (
    <button
      type="button"
      aria-label={`View scheduled payment details for ${rowTitle}`}
      onClick={() => onSelect(row)}
      className="grid min-h-[82px] w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-[12px] px-[14px] py-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)]"
    >
      <BeneficiaryAvatar name={rowTitle} bank="unicredit" size={40} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold leading-[18px] text-[var(--uc-text)]">
          {rowTitle}
        </span>
        {rowDetails ? (
          <span className="mt-[2px] block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
            {rowDetails}
          </span>
        ) : null}
        <span className="mt-[2px] block truncate text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
          {row.nextDate}
        </span>
      </span>
      <span className="flex min-w-0 flex-col items-end">
        {row.isLimit ? (
          <span className="text-[11px] leading-[14px] text-[var(--uc-text-muted)]">
            {t("runtime.payments.recurrent.limit", "Limit")}
          </span>
        ) : null}
        <span className="whitespace-nowrap text-[14px] font-semibold tabular-nums text-[var(--uc-text)]">
          {amountSign}{amount.integer}{amount.decimals} {amount.currency}
        </span>
      </span>
    </button>
  );
}

function RecurrentCreateOption({
  icon,
  title,
  description,
  withDivider = false,
  onClick,
}: {
  icon: "standing-order" | "payment-recurrent" | "currency-exchange";
  title: string;
  description: string;
  withDivider?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center" aria-hidden="true">
        <AppIcon name={icon} color="var(--uc-icon)" />
      </span>
      <span className="min-w-0">
        <span className="uc-type-h2 block text-[var(--uc-text)]">{title}</span>
        <span className="uc-type-n5 mt-[2px] block text-[var(--uc-text)]">{description}</span>
      </span>
      <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center" aria-hidden="true">
        <AppIcon name="chevron-link" color="var(--uc-icon)" />
      </span>
    </>
  );
  const className = `grid h-[80px] w-full grid-cols-[32px_1fr_32px] items-center gap-[16px] text-left ${withDivider ? "border-b border-[var(--uc-border-muted)]" : ""}`;

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`${className} cursor-pointer appearance-none bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]`}
    >
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

function RecurrentPaymentRow({ row }: { row: RecurrentPayment }) {
  const { t } = useLanguage();
  const amount = formatEvo2027Amount(row.amount, row.currency);
  const amountSign = row.kind === "internal-transfer" ? "" : "−";

  return (
    <div className="flex items-start gap-[12px] border-b border-[var(--uc-border-muted)] py-[16px] last:border-b-0">
      <span className="mt-[2px] grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
        <AppIcon name="payment-templates" color="var(--uc-icon)" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="uc-type-n4-strong truncate text-[var(--uc-text)]">{row.name}</p>
        <p className="uc-type-n5 mt-[2px] text-[var(--uc-text-muted)]">{row.nextDate}</p>
        <p className="mt-[2px] flex items-baseline gap-[2px] whitespace-nowrap">
          {row.isLimit ? (
            <span className="uc-type-n5 mr-[4px] text-[var(--uc-text-muted)]">
              {t("runtime.payments.recurrent.limit", "Limit")}
            </span>
          ) : null}
          <span className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">{amountSign}{amount.integer}</span>
          <span className="text-[14px] font-bold leading-[18px]">
            {amount.decimals} {amount.currency}
          </span>
        </p>
      </div>

      <button
        type="button"
        aria-label={t("runtime.payments.recurrent.options", "Options")}
        className="grid size-[32px] shrink-0 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      >
        <AppIcon name="more-horizontal" color="var(--uc-icon)" />
      </button>
    </div>
  );
}
