import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import PrimaryButton from "@/app/components/PrimaryButton";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import { AppIcon } from "@/app/components/icons";
import AmountField from "@/app/components/AmountField";
import ToggleButton from "@/app/components/ToggleButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import PageHeader from "@/app/components/PageHeader";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import PfmCategoryChangeSheet from "@/app/components/pfm/PfmCategoryChangeSheet";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import TextField from "@/app/components/TextField";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import type { AccountTransaction } from "@/data/accountDetails";
import { getPfmCategorySelection, type PfmCategorySelection } from "@/data/pfmCategories";
import type { Product } from "@/data/products";
import {
  createTransactionDetailData,
  formatDraftAmount,
  type DomesticPaymentDraft,
} from "@/data/paymentFlow";
import type { CountryId } from "@/app/state/demoTypes";

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
    <div className="flex min-h-[80px] flex-col justify-center">
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
  onCategoryChange,
}: {
  country: CountryId;
  product?: Product | null;
  transaction: AccountTransaction;
  onBack: () => void;
  onRedoPayment: () => void;
  onCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void;
}) {
  const { t } = useLanguage();
  const [headerProgress, setHeaderProgress] = useState(0);
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  const handlePageScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 48));
    setHeaderProgress(progress);
  };

  const detail = useMemo(
    () => createTransactionDetailData(transaction, country, product),
    [country, product, transaction],
  );
  const currencyLabel = detail.amount.split(" ").slice(-1)[0];
  const transactionActionItems: AccountActionBarItem[] = [
    {
      id: "change-category",
      iconName: "grid-2x2",
      label: t("runtime.transactionDetail.actions.changeCategory", "Change\ncategory"),
      onClick: onCategoryChange ? () => setCategorySheetOpen(true) : undefined,
    },
    { id: "standing-order", iconName: "standing-order", label: t("runtime.transactionDetail.actions.createStandingOrder", "Create\nStanding order") },
    { id: "redo-payment", iconName: "redo-payment", label: t("runtime.transactionDetail.actions.redoPayment", "Redo\npayment"), onClick: onRedoPayment },
    { id: "send-payment", iconName: "send-payment", label: t("runtime.transactionDetail.actions.sendPayment", "Send\npayment") },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={detail.title}
          onBack={onBack}
          variant="gray"
          largeTitleAlign="center"
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          showHelp={false}
        />

        <div className="bg-[var(--uc-app-bg)] pb-[8px]">
          <section className="px-[24px] pt-[8px] text-center" style={{ opacity: 1 - headerProgress }}>
            <p className="uc-type-n5-strong mt-[8px] text-[var(--uc-text-muted)]">
              {detail.bookingDate}
            </p>
            <p className="mt-[8px] font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
              {detail.amount}
            </p>
            <p className="mt-[18px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
              {detail.pfmCategoryLabel.toUpperCase()}
            </p>
            <div
              className="mt-[8px] inline-flex items-center justify-center gap-[8px] rounded-full border px-[16px] py-[4px]"
              style={{
                borderColor: `var(${detail.pfmCategoryColorVar})`,
                color: `var(${detail.pfmCategoryColorVar})`,
              }}
              data-transaction-pfm-category={detail.pfmCategory}
              data-transaction-pfm-subcategory={detail.pfmSubcategoryLabel}
            >
              <PfmCategoryIcon category={detail.pfmCategory} size={20} />
              <span className="text-[12px] font-bold leading-normal">
                {detail.pfmSubcategoryLabel.toUpperCase()}
              </span>
            </div>
          </section>

          <section className="mt-[31px]">
            <AccountActionBar items={transactionActionItems} />
          </section>
        </div>

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
          <SectionTitle>{`${t("runtime.transactionDetail.breakdownFor", "BREAKDOWN FOR")} ${detail.categoryTag}`}</SectionTitle>
          <div className="mt-[34px]">
            <div className="flex h-[120px] items-end justify-between px-[18px]">
              {[118, 74, 47, 86, 69, 51, 82].map((height, index) => (
                <div key={index} className="w-[16px] rounded-t-full bg-[var(--uc-action)]" style={{ height }} />
              ))}
            </div>
            <div className="h-px w-full bg-[var(--uc-border)]" />
            <div className="flex justify-between px-[18px] pt-[14px]">
              {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"].map((label) => (
                <span key={label} className="text-[11px] font-bold text-[var(--uc-text-muted)]">
                  {label}
                </span>
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
            <AnimatePresence initial={false}>
              {areDetailsExpanded ? (
                <motion.div
                  key="extra-transaction-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <DetailRow label={t("runtime.transactionDetail.bookingDate", "Booking date")} value={detail.bookingDate} />
                  <DetailRow label={t("runtime.transactionDetail.beneficiaryName", "Beneficiary Name")} value={detail.beneficiaryName} />
                  <DetailRow label={t("runtime.transactionDetail.beneficiaryBankName", "Beneficiary Bank Name")} value={detail.beneficiaryBankName} />
                  <DetailRow label={t("runtime.transactionDetail.beneficiaryAccountNumber", "Beneficiary account number")} value={detail.beneficiaryAccountNumber} copy />
                  <DetailRow label={t("runtime.transactionDetail.amount", "Amount")} value={detail.amount} />
                  <DetailRow label={t("runtime.payments.domesticFlow.paymentDetails", "Payment details")} value={detail.paymentDetails} />
                  <DetailRow label={t("runtime.transactionDetail.referenceNumber", "Reference number")} value={detail.referenceNumber} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => setAreDetailsExpanded((current) => !current)}
            aria-expanded={areDetailsExpanded}
            className="mx-auto mt-[18px] block pb-[18px] text-center font-['UniCredit',sans-serif] text-[14px] font-bold leading-normal text-[var(--uc-action)]"
          >
            {areDetailsExpanded
              ? t("runtime.actions.showLess", "Show less")
              : t("runtime.actions.showMore", "Show more")}
          </button>
        </section>
      </div>
      {categorySheetOpen ? (
        <PfmCategoryChangeSheet
          currentSelection={getPfmCategorySelection(transaction.pfmCategory, transaction.pfmSubcategory)}
          onClose={() => setCategorySheetOpen(false)}
          onConfirm={(selection) => {
            onCategoryChange?.(transaction, selection);
            setCategorySheetOpen(false);
          }}
        />
      ) : null}
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
  const [headerProgress, setHeaderProgress] = useState(0);
  const update = (key: keyof DomesticPaymentDraft, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const isFormValid =
    form.beneficiaryName.trim().length > 0 &&
    form.prefix.trim().length > 0 &&
    form.accountNumber.trim().length > 0 &&
    form.bankCode.trim().length > 0 &&
    form.amount.trim().length > 0;

  const handlePageScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 48));
    setHeaderProgress(progress);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={t("runtime.payments.domesticFlow.domesticPaymentTitle", "Domestic payment")}
          onBack={onBack}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          showHelp={false}
        />
        <div className="px-[24px] pb-[18px]">
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
            hideCurrencySelector
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
      </div>
      <div className="px-[24px] pb-[42px]">
        <PrimaryButton disabled={!isFormValid} onClick={() => onNext(form)}>{t("runtime.actions.next", "Next")}</PrimaryButton>
      </div>
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
  const [headerProgress, setHeaderProgress] = useState(0);
  const beneficiaryAccount = [draft.prefix, draft.accountNumber, draft.bankCode].filter(Boolean).join("-");

  const handlePageScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const progress = Math.min(1, Math.max(0, event.currentTarget.scrollTop / 48));
    setHeaderProgress(progress);
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={t("runtime.payments.domesticFlow.reviewData", "Review data")}
          onBack={onBack}
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          showHelp={false}
        />
        <div className="px-[24px] pb-[18px]">
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
      </div>
      <div className="px-[24px] pb-[42px]">
        <PrimaryButton onClick={onSign}>{t("runtime.actions.sign", "Sign")}</PrimaryButton>
      </div>
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
  return (
    <StandardSignScreen
      title={t("runtime.actions.sign", "Sign")}
      pinLabel={t("runtime.payments.domesticFlow.enterPinCode", "Enter pin code")}
      pinHelper={t("runtime.payments.domesticFlow.pinPrivacyHint", "Be sure that nobody is watching you")}
      actionLabel={t("runtime.actions.sign", "Sign")}
      onBack={onBack}
      onSign={onSign}
    />
  );
}

export function PaymentSuccessScreen({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  return (
    <StandardSuccessScreen
      title={t("runtime.payments.domesticFlow.successfulPayment", "Successful payment")}
      body={t("runtime.payments.domesticFlow.paymentSentToBank", "Your payment has been successfully sent to the bank")}
      actionLabel={t("runtime.actions.okGotIt", "Ok, got it")}
      onDone={onDone}
    />
  );
}
