import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AppIcon } from "@/app/components/icons";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import type { AccountTransaction } from "@/data/accountDetails";
import type { Product } from "@/data/products";
import {
  createTransactionDetailData,
  formatDraftAmount,
  type DomesticPaymentDraft,
} from "@/data/paymentFlow";
import type { CountryId } from "@/app/state/demoTypes";

function HomeIndicator() {
  return (
    <div className="flex h-[34px] shrink-0 items-center justify-center bg-[var(--uc-surface)]">
      <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
    </div>
  );
}

function FlowHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="shrink-0 bg-[var(--uc-surface)] pt-[54px]">
      <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]">
        {onBack ? (
          <button type="button" onClick={onBack} className="grid size-[40px] place-items-center" aria-label="Back">
            <AppIcon name="back-heavy" color="var(--uc-text)" />
          </button>
        ) : (
          <div className="size-[40px]" />
        )}
        <div />
        <div className="size-[40px]" />
      </div>
      <div className="px-[24px] pt-[8px]">
        <h1 className="font-['UniCredit',sans-serif] text-[27px] font-bold leading-normal text-[var(--uc-text)]">
          {title}
        </h1>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="pt-[30px]">
      <h2 className="font-['UniCredit',sans-serif] text-[16px] font-bold leading-normal text-[var(--uc-text)]">
        {children}
      </h2>
      <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
    </div>
  );
}

function DetailRow({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy?: boolean;
}) {
  return (
    <div className="flex items-start gap-[12px] py-[17px]">
      <div className="min-w-0 flex-1">
        <p className="font-['UniCredit',sans-serif] text-[14px] font-normal leading-normal text-[var(--uc-text-muted)]">
          {label}
        </p>
        <p className="mt-[3px] whitespace-pre-line break-words font-['UniCredit',sans-serif] text-[16px] font-bold leading-[20px] text-[var(--uc-text)]">
          {value}
        </p>
      </div>
      {copy && (
        <button type="button" className="mt-[8px] grid size-[32px] place-items-center" aria-label={`Copy ${label}`}>
          <AppIcon name="copy-documents" size={24} color="var(--uc-text)" />
        </button>
      )}
    </div>
  );
}

function FlowTextField({
  label,
  value,
  onChange,
  helper,
  right,
  readonly,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  helper?: string;
  right?: ReactNode;
  readonly?: boolean;
}) {
  return (
    <label className="block pt-[22px]">
      <span className="block font-['UniCredit',sans-serif] text-[12px] font-normal leading-normal text-[var(--uc-text-subtle)]">
        {label}
      </span>
      <span className="flex items-end gap-[12px] border-b border-[var(--uc-text-subtle)] pb-[3px]">
        <input
          readOnly={readonly}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="min-w-0 flex-1 bg-transparent font-['UniCredit',sans-serif] text-[18px] font-normal leading-normal text-[var(--uc-text)] outline-none"
        />
        {right}
      </span>
      {helper && (
        <span className="mt-[5px] block whitespace-pre-line font-['UniCredit',sans-serif] text-[12px] font-normal leading-normal text-[var(--uc-text-subtle)]">
          {helper}
        </span>
      )}
    </label>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-[30px] w-[60px] rounded-full border-[2px] transition ${
        checked ? "border-[var(--uc-action)] bg-[var(--uc-surface)]" : "border-[var(--uc-text-muted)] bg-[var(--uc-surface)]"
      }`}
    >
      <span
        className={`absolute top-1/2 grid size-[24px] -translate-y-1/2 place-items-center rounded-full transition ${
          checked ? "right-[2px] bg-[var(--uc-action)]" : "left-[2px] bg-[var(--uc-text-muted)]"
        }`}
      >
        {checked && <AppIcon name="prime-check" size={16} color="var(--uc-static-white)" />}
      </span>
    </button>
  );
}

function formatAmountInput(value: string) {
  return value.replace(/\s/g, "");
}

export function TransactionDetailScreen({
  country,
  product,
  transaction,
  onBack,
  onRedoPayment,
}: {
  country: CountryId;
  product?: Product | null;
  transaction: AccountTransaction;
  onBack: () => void;
  onRedoPayment: () => void;
}) {
  const detail = useMemo(
    () => createTransactionDetailData(transaction, country, product),
    [country, product, transaction],
  );
  const currencyLabel = detail.amount.split(" ").slice(-1)[0];

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <div className="pt-[54px]">
          <button type="button" onClick={onBack} className="ml-[4px] grid size-[40px] place-items-center" aria-label="Back">
            <AppIcon name="back-heavy" color="var(--uc-text)" />
          </button>
        </div>

        <section className="px-[24px] pt-[8px] text-center">
          <h1 className="font-['UniCredit',sans-serif] text-[27px] font-bold leading-normal text-[var(--uc-text)]">
            {detail.title}
          </h1>
          <p className="mt-[16px] font-['UniCredit',sans-serif] text-[14px] font-bold leading-normal text-[var(--uc-text-muted)]">
            {detail.bookingDate}
          </p>
          <p className="mt-[8px] font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            {detail.amount}
          </p>
          <p className="mt-[18px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
            PFM CATEGORY
          </p>
          <div
            className="mt-[8px] inline-flex h-[30px] items-center gap-[8px] rounded-full border px-[14px]"
            style={{
              borderColor: `var(${detail.pfmCategoryColorVar})`,
              color: `var(${detail.pfmCategoryColorVar})`,
            }}
            data-transaction-pfm-category={detail.pfmCategory}
            data-transaction-pfm-subcategory={detail.pfmSubcategoryLabel}
          >
            <PfmCategoryIcon category={detail.pfmCategory} size={20} />
            <span className="font-['UniCredit',sans-serif] text-[12px] font-bold leading-normal">
              {detail.pfmCategoryLabel.toUpperCase()}
            </span>
          </div>
        </section>

        <section className="mt-[31px] grid grid-cols-4 gap-[4px] bg-[var(--uc-app-bg)] px-[18px] py-[16px]">
          {[
            { label: "Change\ncategory", icon: <AppIcon name="grid-2x2" size={25} strokeWidth={3} color="var(--uc-text)" /> },
            { label: "Create\nStanding order", icon: <AppIcon name="landmark" size={25} strokeWidth={3} color="var(--uc-text)" /> },
            { label: "Redo\npayment", icon: <AppIcon name="repeat" size={26} strokeWidth={3} color="var(--uc-text)" />, onClick: onRedoPayment },
            { label: "Send\npayment", icon: <AppIcon name="account-option-statement" size={24} color="var(--uc-text)" /> },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex flex-col items-center gap-[7px] text-center"
            >
              <span className="grid size-[28px] place-items-center">{item.icon}</span>
              <span className="whitespace-pre-line font-['UniCredit',sans-serif] text-[12px] font-normal leading-[14px] text-[var(--uc-text)]">
                {item.label}
              </span>
            </button>
          ))}
        </section>

        <section className="px-[22px] pt-[23px]">
          <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            Spending Insight
          </h2>
          <SectionTitle>OVERVIEW FOR 2026</SectionTitle>
          <div className="pt-[28px]">
            <p className="font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
              {detail.categoryGroup}
            </p>
            <p className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-normal text-[var(--uc-text)]">
              26,341.33 {currencyLabel}
            </p>
            <div className="mt-[10px] h-[16px] w-full rounded-full bg-[var(--uc-action)]" />
            <div className="mt-[18px] h-[16px] w-[166px] rounded-full bg-[var(--uc-action)]" />
            <p className="mt-[9px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
              {detail.categoryTag}
            </p>
            <p className="font-['UniCredit',sans-serif] text-[18px] font-bold leading-normal text-[var(--uc-text)]">
              10,334.22 {currencyLabel}
            </p>
          </div>
          <SectionTitle>BREAKDOWN FOR {detail.categoryTag}</SectionTitle>
          <div className="mt-[34px] h-[150px] border-b border-[var(--uc-border)]">
            <div className="flex h-full items-end justify-between px-[18px]">
              {[118, 74, 47, 86, 69, 51, 82].map((height, index) => (
                <div key={index} className="flex flex-col items-center gap-[14px]">
                  <div className="w-[16px] rounded-t-full bg-[var(--uc-action)]" style={{ height }} />
                  <span className="font-['UniCredit',sans-serif] text-[11px] font-bold text-[var(--uc-text-muted)]">
                    {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-[24px] pt-[30px]">
          <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            Transaction details
          </h2>
          <div className="pt-[20px]">
            <DetailRow label="Account number" value={detail.accountNumber} copy />
            <DetailRow label="Account title" value={detail.accountTitle} />
            <DetailRow label="Account owner" value={detail.accountOwner} />
            <DetailRow label="Booking date" value={detail.bookingDate} />
            <DetailRow label="Beneficiary Name" value={detail.beneficiaryName} />
            <DetailRow label="Beneficiary Bank Name" value={detail.beneficiaryBankName} />
            <DetailRow label="Beneficiary account number" value={detail.beneficiaryAccountNumber} copy />
            <DetailRow label="Amount" value={detail.amount} />
            <DetailRow label="Payment details" value={detail.paymentDetails} />
            <DetailRow label="Reference number" value={detail.referenceNumber} />
          </div>
          <button
            type="button"
            className="mx-auto mt-[18px] block pb-[18px] font-['UniCredit',sans-serif] text-[12px] font-bold leading-normal text-[var(--uc-action)]"
          >
            SHOW LESS
          </button>
        </section>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function DomesticPaymentCreateScreen({
  draft,
  onBack,
  onNext,
}: {
  draft: DomesticPaymentDraft;
  onBack: () => void;
  onNext: (draft: DomesticPaymentDraft) => void;
}) {
  const [form, setForm] = useState(draft);
  const update = (key: keyof DomesticPaymentDraft, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <FlowHeader title="Domestic payment" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[18px] scrollbar-hide">
        <SectionTitle>FROM ACCOUNT</SectionTitle>
        <FlowTextField
          label="Account number"
          value={form.payerAccountNumber}
          onChange={(value) => update("payerAccountNumber", value)}
          helper={`${form.payerAccountName}\n${form.payerBalance}`}
          right={<AppIcon name="chevron-down" size={26} color="var(--uc-text)" />}
        />

        <SectionTitle>BENEFICIARY</SectionTitle>
        <FlowTextField label="Beneficiary" value={form.beneficiaryName} onChange={(value) => update("beneficiaryName", value)} />
        <FlowTextField label="Prefix" value={form.prefix} onChange={(value) => update("prefix", value)} />
        <FlowTextField
          label="Account number (mandatory)"
          value={form.accountNumber}
          onChange={(value) => update("accountNumber", value)}
          right={<AppIcon name="camera" size={24} strokeWidth={3} color="var(--uc-text)" />}
        />
        <FlowTextField
          label="Bank code (mandatory)"
          value={form.bankCode}
          onChange={(value) => update("bankCode", value)}
          helper={form.bankName}
          right={<AppIcon name="camera" size={24} strokeWidth={3} color="var(--uc-text)" />}
        />

        <SectionTitle>PAYMENT DETAILS</SectionTitle>
        <div className="grid grid-cols-[1fr_94px] gap-[24px]">
          <FlowTextField
            label="Amount limit"
            value={form.amount}
            onChange={(value) => update("amount", formatAmountInput(value))}
          />
          <FlowTextField label="Currency" value={form.currency} readonly />
        </div>

        <div className="flex items-center justify-between pt-[34px]">
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold leading-normal text-[var(--uc-text)]">
            INSTANT PAYMENT
          </p>
          <ToggleSwitch
            checked={form.instantPayment}
            onChange={(checked) => update("instantPayment", checked)}
            ariaLabel="Instant payment"
          />
        </div>

        <div className="flex items-center justify-between pt-[32px]">
          <p className="font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text)]">
            ADD VARIABLE SYMBOL AND MORE
          </p>
          <AppIcon name="chevron-down" size={28} color="var(--uc-text)" />
        </div>

        <FlowTextField
          label="Information for beneficiary"
          value={form.informationForBeneficiary}
          onChange={(value) => update("informationForBeneficiary", value)}
        />
        <FlowTextField
          label="Information for me"
          value={form.informationForMe}
          onChange={(value) => update("informationForMe", value)}
        />
        <p className="px-[8px] pt-[44px] text-center font-['UniCredit',sans-serif] text-[14px] font-normal leading-[18px] text-[var(--uc-text)]">
          You can review and sign your payment in the next step
        </p>
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={() => onNext(form)}>Next</PrimaryButton>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function PaymentReviewScreen({
  draft,
  onBack,
  onSign,
}: {
  draft: DomesticPaymentDraft;
  onBack: () => void;
  onSign: () => void;
}) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const beneficiaryAccount = [draft.prefix, draft.accountNumber, draft.bankCode].filter(Boolean).join("-");

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <FlowHeader title="Review data" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[18px] scrollbar-hide">
        <SectionTitle>PAYMENT ORDER</SectionTitle>
        <div className="pt-[22px]">
          <DetailRow label="Payer account" value={draft.payerAccountName || "Primary Account name"} />
          <DetailRow label="Payer account number" value={draft.payerAccountNumber} />
          <DetailRow label="Beneficiary name" value={draft.beneficiaryName || "Beneficiary"} />
          <DetailRow label="Beneficiary account number" value={beneficiaryAccount || "-"} />
          <DetailRow label="Amount" value={formatDraftAmount(draft)} />
          <DetailRow label="Instant Payment" value={draft.instantPayment ? "Yes" : "No"} />
          <DetailRow label="Due date" value={draft.dueDate} />
          <DetailRow label="Express Payment (a fee is charged)" value={draft.expressPayment ? "Yes" : "No"} />
          <DetailRow label="Information for beneficiary" value={draft.informationForBeneficiary || "-"} />
        </div>
        <div className="flex items-center justify-between py-[16px]">
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold leading-normal text-[var(--uc-text)]">
            SAVE AS TEMPLATE
          </p>
          <ToggleSwitch
            checked={saveAsTemplate}
            onChange={setSaveAsTemplate}
            ariaLabel="Save as template"
          />
        </div>
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={onSign}>Sign</PrimaryButton>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function PaymentSignScreen({
  onBack,
  onSign,
}: {
  onBack: () => void;
  onSign: () => void;
}) {
  const [pin, setPin] = useState("******");

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <FlowHeader title="Sign" onBack={onBack} />
      <div className="min-h-0 flex-1 px-[24px] pt-[150px]">
        <label className="block">
          <span className="block font-['UniCredit',sans-serif] text-[12px] font-normal leading-normal text-[var(--uc-action)]">
            Enter pin code
          </span>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            className="w-full border-b border-[var(--uc-action)] bg-transparent pb-[5px] font-['UniCredit',sans-serif] text-[18px] font-normal leading-normal text-[var(--uc-text)] outline-none"
          />
          <span className="mt-[6px] block font-['UniCredit',sans-serif] text-[12px] font-normal leading-normal text-[var(--uc-text-subtle)]">
            Be sure that nobody is watching you
          </span>
        </label>
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={onSign}>Sign</PrimaryButton>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function PaymentSuccessScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="px-[24px] pt-[84px]">
        <h1 className="font-['UniCredit',sans-serif] text-[27px] font-bold leading-normal text-[var(--uc-text)]">
          Successful payment
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-[24px]">
        <div className="flex justify-center pt-[58px]">
          <div className="grid size-[100px] place-items-center rounded-full border-[6px] border-[var(--uc-green-olive)]">
            <AppIcon name="prime-check" size={64} color="var(--uc-green-olive)" />
          </div>
        </div>
        <p className="pt-[58px] font-['UniCredit',sans-serif] text-[16px] font-normal leading-[22px] text-[var(--uc-text)]">
          Your payment has been successfully sent to the bank
        </p>
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={onDone}>Ok, got it</PrimaryButton>
      </div>
      <HomeIndicator />
    </div>
  );
}
