import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import { AppIcon } from "@/app/components/icons";
import AmountField from "@/app/components/AmountField";
import ToggleButton from "@/app/components/ToggleButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import PageHeader from "@/app/components/PageHeader";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import TextField from "@/app/components/TextField";
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

function SectionTitle({ children }: { children: string }) {
  return <SectionHeadingDivider title={children} className="pt-[30px]" />;
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
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">
          {label}
        </p>
        <p className="uc-type-n4-strong mt-[3px] whitespace-pre-line break-words leading-[20px] text-[var(--uc-text)]">
          {value}
        </p>
      </div>
      {copy && (
        <button type="button" className="mt-[8px] grid size-[32px] place-items-center" aria-label={`Copy ${label}`}>
          <AppIcon name="copy-documents" color="var(--uc-text)" />
        </button>
      )}
    </div>
  );
}

function FlowField({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="pt-[22px]">
      {children}
    </div>
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
  const { t } = useLanguage();
  const detail = useMemo(
    () => createTransactionDetailData(transaction, country, product),
    [country, product, transaction],
  );
  const currencyLabel = detail.amount.split(" ").slice(-1)[0];
  const transactionActionItems: AccountActionBarItem[] = [
    { id: "change-category", iconName: "grid-2x2", label: t("runtime.transactionDetail.actions.changeCategory", "Change\ncategory") },
    { id: "standing-order", iconName: "landmark", label: t("runtime.transactionDetail.actions.createStandingOrder", "Create\nStanding order") },
    { id: "redo-payment", iconName: "repeat", label: t("runtime.transactionDetail.actions.redoPayment", "Redo\npayment"), onClick: onRedoPayment },
    { id: "send-payment", iconName: "account-option-statement", label: t("runtime.transactionDetail.actions.sendPayment", "Send\npayment") },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <div className="pt-[54px]">
          <button type="button" onClick={onBack} className="ml-[4px] grid size-[40px] place-items-center" aria-label={t("runtime.actions.back", "Back")}>
            <AppIcon name="back-heavy" color="var(--uc-text)" />
          </button>
        </div>

        <section className="px-[24px] pt-[8px] text-center">
          <h1 className="uc-type-h1 text-[var(--uc-text)]">
            {detail.title}
          </h1>
          <p className="uc-type-n5-strong mt-[16px] text-[var(--uc-text-muted)]">
            {detail.bookingDate}
          </p>
          <p className="mt-[8px] font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            {detail.amount}
          </p>
          <p className="mt-[18px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
            {t("runtime.transactionDetail.pfmCategory", "PFM CATEGORY")}
          </p>
          <div
            className="mt-[8px] inline-flex min-h-[32px] items-center gap-[8px] rounded-full border px-[14px] py-[4px]"
            style={{
              borderColor: `var(${detail.pfmCategoryColorVar})`,
              color: `var(${detail.pfmCategoryColorVar})`,
            }}
            data-transaction-pfm-category={detail.pfmCategory}
            data-transaction-pfm-subcategory={detail.pfmSubcategoryLabel}
          >
            <PfmCategoryIcon category={detail.pfmCategory} size={32} />
            <span className="text-[12px] font-bold leading-normal">
              {detail.pfmCategoryLabel.toUpperCase()}
            </span>
          </div>
        </section>

        <section className="mt-[31px] bg-[var(--uc-app-bg)]">
          <AccountActionBar items={transactionActionItems} />
        </section>

        <section className="px-[22px] pt-[23px]">
          <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            {t("runtime.transactionDetail.spendingInsight", "Spending Insight")}
          </h2>
          <SectionTitle>{t("runtime.payments.domesticFlow.overviewFor2026", "OVERVIEW FOR 2026")}</SectionTitle>
          <div className="pt-[28px]">
            <p className="font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
              {detail.categoryGroup}
            </p>
            <p className="uc-type-h2 text-[var(--uc-text)]">
              26,341.33 {currencyLabel}
            </p>
            <div className="mt-[10px] h-[16px] w-full rounded-full bg-[var(--uc-action)]" />
            <div className="mt-[18px] h-[16px] w-[166px] rounded-full bg-[var(--uc-action)]" />
            <p className="mt-[9px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
              {detail.categoryTag}
            </p>
            <p className="uc-type-h2 text-[var(--uc-text)]">
              10,334.22 {currencyLabel}
            </p>
          </div>
          <SectionTitle>{t("runtime.transactionDetail.breakdownFor", "BREAKDOWN FOR")} {detail.categoryTag}</SectionTitle>
          <div className="mt-[34px] h-[150px] border-b border-[var(--uc-border)]">
            <div className="flex h-full items-end justify-between px-[18px]">
              {[118, 74, 47, 86, 69, 51, 82].map((height, index) => (
                <div key={index} className="flex flex-col items-center gap-[14px]">
                  <div className="w-[16px] rounded-t-full bg-[var(--uc-action)]" style={{ height }} />
                  <span className="text-[11px] font-bold text-[var(--uc-text-muted)]">
                    {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-[24px] pt-[30px]">
          <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            {t("runtime.transactionDetail.title", "Transaction details")}
          </h2>
          <div className="pt-[20px]">
            <DetailRow label={t("runtime.accounts.detailsInfo.accountNumber", "Account number")} value={detail.accountNumber} copy />
            <DetailRow label={t("runtime.accounts.detailsInfo.accountTitle", "Account title")} value={detail.accountTitle} />
            <DetailRow label={t("runtime.transactionDetail.accountOwner", "Account owner")} value={detail.accountOwner} />
            <DetailRow label={t("runtime.transactionDetail.bookingDate", "Booking date")} value={detail.bookingDate} />
            <DetailRow label={t("runtime.transactionDetail.beneficiaryName", "Beneficiary Name")} value={detail.beneficiaryName} />
            <DetailRow label={t("runtime.transactionDetail.beneficiaryBankName", "Beneficiary Bank Name")} value={detail.beneficiaryBankName} />
            <DetailRow label={t("runtime.transactionDetail.beneficiaryAccountNumber", "Beneficiary account number")} value={detail.beneficiaryAccountNumber} copy />
            <DetailRow label={t("runtime.transactionDetail.amount", "Amount")} value={detail.amount} />
            <DetailRow label={t("runtime.payments.domesticFlow.paymentDetails", "Payment details")} value={detail.paymentDetails} />
            <DetailRow label={t("runtime.transactionDetail.referenceNumber", "Reference number")} value={detail.referenceNumber} />
          </div>
          <button
            type="button"
            className="mx-auto mt-[18px] block pb-[18px] text-[12px] font-bold leading-normal text-[var(--uc-action)]"
          >
            {t("runtime.actions.showLess", "SHOW LESS")}
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
  const { t } = useLanguage();
  const [form, setForm] = useState(draft);
  const update = (key: keyof DomesticPaymentDraft, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <PageHeader title={t("runtime.payments.newPayment.actions.domestic-payment.title", "Domestic payment")} onBack={onBack} includeSafeArea showHelp={false} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[18px] scrollbar-hide">
        <SectionTitle>{t("runtime.payments.domesticFlow.fromAccount", "FROM ACCOUNT")}</SectionTitle>
        <FlowField>
          <TextField
            label={t("runtime.accounts.detailsInfo.accountNumber", "Account number")}
            value={form.payerAccountNumber}
            onChange={(value) => update("payerAccountNumber", value)}
            helperText={form.payerAccountName}
            helperText2={form.payerBalance}
            trailingIconName="chevron-down-wide"
          />
        </FlowField>

        <SectionTitle>{t("runtime.payments.domesticFlow.beneficiary", "BENEFICIARY")}</SectionTitle>
        <FlowField>
          <TextField label={t("runtime.transactionDetail.beneficiaryName", "Beneficiary")} value={form.beneficiaryName} onChange={(value) => update("beneficiaryName", value)} />
        </FlowField>
        <FlowField>
          <TextField label={t("runtime.payments.domesticFlow.prefix", "Prefix")} value={form.prefix} onChange={(value) => update("prefix", value)} />
        </FlowField>
        <FlowField>
          <TextField
            label={t("runtime.payments.domesticFlow.accountNumberMandatory", "Account number (mandatory)")}
            value={form.accountNumber}
            onChange={(value) => update("accountNumber", value)}
            trailingIconName="camera"
          />
        </FlowField>
        <FlowField>
          <TextField
            label={t("runtime.payments.domesticFlow.bankCodeMandatory", "Bank code (mandatory)")}
            value={form.bankCode}
            onChange={(value) => update("bankCode", value)}
            helperText={form.bankName}
            trailingIconName="camera"
          />
        </FlowField>

        <SectionTitle>{t("runtime.payments.domesticFlow.paymentDetails", "PAYMENT DETAILS")}</SectionTitle>
        <FlowField>
          <AmountField
            label={t("runtime.payments.domesticFlow.amountLimit", "Amount limit")}
            value={form.amount}
            onChange={(value) => update("amount", formatAmountInput(value))}
            currency={form.currency}
          />
        </FlowField>

        <div className="flex items-center justify-between pt-[34px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">
            {t("runtime.payments.domesticFlow.instantPayment", "INSTANT PAYMENT")}
          </p>
          <ToggleButton
            checked={form.instantPayment}
            onToggle={(checked) => update("instantPayment", checked)}
            ariaLabel={t("runtime.payments.domesticFlow.instantPayment", "Instant payment")}
          />
        </div>

        <div className="flex items-center justify-between pt-[32px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">
            {t("runtime.payments.domesticFlow.addVariableSymbolAndMore", "ADD VARIABLE SYMBOL AND MORE")}
          </p>
          <span className="grid h-[32px] w-[32px] place-items-center">
            <AppIcon name="chevron-down" color="var(--uc-text)" />
          </span>
        </div>

        <FlowField>
          <TextField
            label={t("runtime.payments.domesticFlow.informationForBeneficiary", "Information for beneficiary")}
            value={form.informationForBeneficiary}
            onChange={(value) => update("informationForBeneficiary", value)}
          />
        </FlowField>
        <FlowField>
          <TextField
            label={t("runtime.payments.domesticFlow.informationForMe", "Information for me")}
            value={form.informationForMe}
            onChange={(value) => update("informationForMe", value)}
          />
        </FlowField>
        <p className="uc-type-n5 px-[8px] pt-[44px] text-center leading-[18px] text-[var(--uc-text)]">
          {t("runtime.payments.domesticFlow.reviewAndSignHint", "You can review and sign your payment in the next step")}
        </p>
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={() => onNext(form)}>{t("runtime.actions.next", "Next")}</PrimaryButton>
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
  const { t } = useLanguage();
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const beneficiaryAccount = [draft.prefix, draft.accountNumber, draft.bankCode].filter(Boolean).join("-");

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <PageHeader title={t("runtime.payments.domesticFlow.reviewData", "Review data")} onBack={onBack} includeSafeArea showHelp={false} />
      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[18px] scrollbar-hide">
        <SectionTitle>{t("runtime.payments.domesticFlow.paymentOrder", "PAYMENT ORDER")}</SectionTitle>
        <div className="pt-[22px]">
          <DetailRow label={t("runtime.payments.domesticFlow.payerAccount", "Payer account")} value={draft.payerAccountName || t("runtime.payments.domesticFlow.primaryAccountName", "Primary Account name")} />
          <DetailRow label={t("runtime.payments.domesticFlow.payerAccountNumber", "Payer account number")} value={draft.payerAccountNumber} />
          <DetailRow label={t("runtime.transactionDetail.beneficiaryName", "Beneficiary name")} value={draft.beneficiaryName || t("runtime.transactionDetail.beneficiaryName", "Beneficiary")} />
          <DetailRow label={t("runtime.transactionDetail.beneficiaryAccountNumber", "Beneficiary account number")} value={beneficiaryAccount || "-"} />
          <DetailRow label={t("runtime.transactionDetail.amount", "Amount")} value={formatDraftAmount(draft)} />
          <DetailRow label={t("runtime.payments.domesticFlow.instantPayment", "Instant Payment")} value={draft.instantPayment ? t("runtime.common.yes", "Yes") : t("runtime.common.no", "No")} />
          <DetailRow label={t("runtime.payments.domesticFlow.dueDate", "Due date")} value={draft.dueDate} />
          <DetailRow label={t("runtime.payments.domesticFlow.expressPayment", "Express Payment (a fee is charged)")} value={draft.expressPayment ? t("runtime.common.yes", "Yes") : t("runtime.common.no", "No")} />
          <DetailRow label={t("runtime.payments.domesticFlow.informationForBeneficiary", "Information for beneficiary")} value={draft.informationForBeneficiary || "-"} />
        </div>
        <div className="flex items-center justify-between py-[16px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">
            {t("runtime.payments.domesticFlow.saveAsTemplate", "SAVE AS TEMPLATE")}
          </p>
          <ToggleButton
            checked={saveAsTemplate}
            onToggle={setSaveAsTemplate}
            ariaLabel={t("runtime.payments.domesticFlow.saveAsTemplate", "Save as template")}
          />
        </div>
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={onSign}>{t("runtime.actions.sign", "Sign")}</PrimaryButton>
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
  const { t } = useLanguage();
  const [pin, setPin] = useState("******");

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <PageHeader title={t("runtime.actions.sign", "Sign")} onBack={onBack} includeSafeArea showHelp={false} />
      <div className="min-h-0 flex-1 px-[24px] pt-[150px]">
        <TextField
          label={t("runtime.payments.domesticFlow.enterPinCode", "Enter pin code")}
          value={pin}
          onChange={setPin}
          helperText={t("runtime.payments.domesticFlow.pinPrivacyHint", "Be sure that nobody is watching you")}
          visualState="on-focus"
        />
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={onSign}>{t("runtime.actions.sign", "Sign")}</PrimaryButton>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function PaymentSuccessScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="px-[24px] pt-[84px]">
        <h1 className="uc-type-h1 text-[var(--uc-text)]">
          {t("runtime.payments.domesticFlow.successfulPayment", "Successful payment")}
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-[24px]">
        <div className="flex justify-center pt-[58px]">
          <div className="grid size-[100px] place-items-center rounded-full border-[6px] border-[var(--uc-green-olive)]">
            <AppIcon name="prime-check" size={64} color="var(--uc-green-olive)" />
          </div>
        </div>
        <p className="uc-type-n4 pt-[58px] leading-[22px] text-[var(--uc-text)]">
          {t("runtime.payments.domesticFlow.paymentSentToBank", "Your payment has been successfully sent to the bank")}
        </p>
      </div>
      <div className="px-[24px] pb-[8px]">
        <PrimaryButton onClick={onDone}>{t("runtime.actions.okGotIt", "Ok, got it")}</PrimaryButton>
      </div>
      <HomeIndicator />
    </div>
  );
}
