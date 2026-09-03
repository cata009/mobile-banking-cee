import { useState } from "react";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCountry } from "@/app/state/demoStore";
import { formatEvo2027Amount } from "@/app/utils/evo2027Formatting";
import { getRecurrentPayments, type RecurrentPayment, type RecurrentPaymentKind } from "@/data/paymentsHub";

interface RecurrentPaymentsScreenProps {
  onBack: () => void;
}

/**
 * Standing orders and direct debits, as the bank lists them: one tab each, a
 * search over the list, and a single CREATE NEW anchored to the bottom so the
 * primary action never scrolls away from a long list.
 */
export default function RecurrentPaymentsScreen({ onBack }: RecurrentPaymentsScreenProps) {
  const country = useCountry();
  const { t } = useLanguage();
  const [kind, setKind] = useState<RecurrentPaymentKind>("standing-order");
  const [searchValue, setSearchValue] = useState("");

  const normalizedSearch = searchValue.trim().toLocaleLowerCase();
  const rows = getRecurrentPayments(country, kind).filter((row) => (
    !normalizedSearch || row.name.toLocaleLowerCase().includes(normalizedSearch)
  ));

  const tabs: ReadonlyArray<{ id: RecurrentPaymentKind; label: string }> = [
    { id: "standing-order", label: t("runtime.payments.recurrent.standingOrders", "Standing Orders") },
    { id: "direct-debit", label: t("runtime.payments.recurrent.directDebits", "Direct Debit") },
  ];

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
          {t("runtime.payments.recurrent.createNew", "CREATE NEW")}
        </PrimaryButton>
      </div>
    </div>
  );
}

function RecurrentPaymentRow({ row }: { row: RecurrentPayment }) {
  const { t } = useLanguage();
  const amount = formatEvo2027Amount(row.amount, row.currency);

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
          <span className="text-[20px] font-bold leading-[24px] tracking-[-0.02em]">{amount.integer}</span>
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
