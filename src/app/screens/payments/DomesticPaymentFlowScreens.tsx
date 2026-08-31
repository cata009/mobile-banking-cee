import { useMemo, useState } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import PrimaryButton from "@/app/components/PrimaryButton";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import CardNavigationRow from "@/app/components/cards/CardNavigationRow";
import { AppIcon } from "@/app/components/icons";
import AmountField from "@/app/components/AmountField";
import ToggleButton from "@/app/components/ToggleButton";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import PageHeader from "@/app/components/PageHeader";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import TransactionAvatar from "@/app/components/transactions/TransactionAvatar";
import PfmCategoryChangeSheet from "@/app/components/pfm/PfmCategoryChangeSheet";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import TextField from "@/app/components/TextField";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import type { AccountTransaction } from "@/data/accountDetails";
import { getPfmCategorySelection, type PfmCategorySelection } from "@/data/pfmCategories";
import type { CreditCard, DebitCard, Product } from "@/data/products";
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

export interface CardTransactionMerchantEnrichment {
  cleanMerchantName: string;
  /** A trusted merchant-logo node supplied by the caller; absent means no logo is rendered. */
  merchantLogo?: ReactNode;
  location?: {
    label: string;
    address: string;
  };
  mcc?: string;
}

function MerchantLocationDetail({ location }: { location: NonNullable<CardTransactionMerchantEnrichment["location"]> }) {
  return (
    <section
      className="mb-[8px] w-full overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] text-left"
      aria-label={`${location.label}: ${location.address}`}
    >
      <div
        className="relative h-[118px] overflow-hidden bg-[#e7ebe5]"
        data-testid="merchant-location-static-map"
        role="img"
        aria-label={`Map showing ${location.address}`}
      >
        <svg className="h-full w-full" viewBox="0 0 340 118" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="340" height="118" fill="#E8ECE6" />
          <path d="M-12 104C38 81 70 72 114 77C160 82 189 102 229 94C269 86 292 60 356 54V132H-12Z" fill="#DDE7D8" />
          <path d="M257 -8C250 20 257 42 276 61C291 76 298 97 306 126" fill="none" stroke="#ACD3E6" strokeWidth="12" />
          <path d="M257 -8C250 20 257 42 276 61C291 76 298 97 306 126" fill="none" stroke="#D4EEF8" strokeWidth="5" />
          <path d="M-18 26C40 29 67 46 105 57C156 72 204 67 249 37C282 15 314 12 358 19" fill="none" stroke="#FFFDF8" strokeWidth="20" />
          <path d="M-18 26C40 29 67 46 105 57C156 72 204 67 249 37C282 15 314 12 358 19" fill="none" stroke="#D4D4CE" strokeWidth="2" />
          <path d="M11 129C32 92 64 80 102 64C151 44 182 19 208 -12" fill="none" stroke="#FFFDF8" strokeWidth="15" />
          <path d="M11 129C32 92 64 80 102 64C151 44 182 19 208 -12" fill="none" stroke="#D4D4CE" strokeWidth="2" />
          <path d="M66 -6C78 29 91 49 125 75C149 93 178 104 221 122" fill="none" stroke="#FFFDF8" strokeWidth="10" />
          <path d="M66 -6C78 29 91 49 125 75C149 93 178 104 221 122" fill="none" stroke="#D4D4CE" strokeWidth="1.5" />
          <g fill="#D4D1C7">
            <rect x="22" y="41" width="25" height="13" rx="2" transform="rotate(12 22 41)" />
            <rect x="47" y="62" width="23" height="12" rx="2" transform="rotate(12 47 62)" />
            <rect x="108" y="24" width="25" height="14" rx="2" transform="rotate(-18 108 24)" />
            <rect x="138" y="39" width="20" height="12" rx="2" transform="rotate(-18 138 39)" />
            <rect x="175" y="73" width="23" height="13" rx="2" transform="rotate(8 175 73)" />
            <rect x="206" y="76" width="27" height="15" rx="2" transform="rotate(8 206 76)" />
            <rect x="287" y="35" width="23" height="13" rx="2" transform="rotate(16 287 35)" />
            <rect x="313" y="47" width="20" height="12" rx="2" transform="rotate(16 313 47)" />
          </g>
        </svg>
      </div>
      <div className="flex items-center gap-[10px] px-[12px] py-[11px]">
        <span data-testid="merchant-location-pin" data-icon-color="standard">
          <AppIcon name="contact-location" size={20} color="var(--uc-text)" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{location.label}</p>
          <p className="mt-[2px] truncate uc-type-n5 text-[var(--uc-text)]">{location.address}</p>
        </div>
      </div>
    </section>
  );
}

function isPhysicalCard(product?: Product | null): product is DebitCard | CreditCard {
  return product?.type === "debit_card" || product?.type === "credit_card";
}

export function TransactionDetailScreen({
  country,
  product,
  transaction,
  onBack,
  onRedoPayment,
  onCategoryChange,
  merchantEnrichment,
  cardUsedContent,
}: {
  country: CountryId;
  product?: Product | null;
  transaction: AccountTransaction;
  onBack: () => void;
  onRedoPayment: () => void;
  onCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void;
  /** Optional ETHOCA-style enrichment; omitted in the current baseline runtime. */
  merchantEnrichment?: CardTransactionMerchantEnrichment;
  /** Optional market-specific representation for the linked physical card. */
  cardUsedContent?: ReactNode;
}) {
  const { t } = useLanguage();
  const { categories } = useProducts();
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(48);
  const [areDetailsExpanded, setAreDetailsExpanded] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);


  const detail = useMemo(
    () => createTransactionDetailData(transaction, country, product),
    [country, product, transaction],
  );
  const currencyLabel = detail.amount.split(" ").slice(-1)[0];
  const isPending = transaction.status === "Pending";
  const cardUsed = isPhysicalCard(product)
    ? product
    : product?.type === "current_account" && transaction.source === "card"
      ? categories
          .flatMap((category) => category.products)
          .find((candidate): candidate is DebitCard => candidate.type === "debit_card" && candidate.linkedAccountId === product.id) ?? null
      : null;
  const isCardTransaction = cardUsed !== null;
  const transactionActionItems: AccountActionBarItem[] = isPending ? [] : [
    {
      id: "change-category",
      iconName: "grid-2x2",
      label: t("runtime.transactionDetail.actions.changeCategory", "Change\ncategory"),
      onClick: onCategoryChange ? () => setCategorySheetOpen(true) : undefined,
    },
    isCardTransaction
      ? { id: "standing-order-slot", iconName: "standing-order", label: "Create\nStanding order", hidden: true }
      : { id: "standing-order", iconName: "standing-order", label: t("runtime.transactionDetail.actions.createStandingOrder", "Create\nStanding order") },
    isCardTransaction
      ? { id: "request-chargeback", iconName: "request-chargeback", label: "Request\nchargeback" }
      : { id: "redo-payment", iconName: "redo-payment", label: t("runtime.transactionDetail.actions.redoPayment", "Redo\npayment"), onClick: onRedoPayment },
    { id: "send-payment", iconName: "send-payment", label: t("runtime.transactionDetail.actions.sendPayment", "Send\npayment") },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handlePageScroll}>
        <PageHeader
          title={merchantEnrichment?.cleanMerchantName ?? detail.title}
          onBack={onBack}
          variant="gray"
          largeTitleAlign="center"
          collapsedTitleProgress={headerProgress}
          includeSafeArea
          showHelp={false}
          /* The name is not the first thing here any more — the mark is, and the
             name sits under it. The bar still takes the name over on scroll. */
          renderLargeTitle={false}
        />

        <div className="bg-[var(--uc-app-bg)] pb-[8px]">
          <section className="px-[24px] pt-[8px] text-center" style={{ opacity: 1 - headerProgress }}>
            {/* The block leads with who the transaction was with — the merchant
                mark when there is one, otherwise the account pair or the
                counterparty resolved from the row itself — and names them
                underneath it. */}
            <div className="mx-auto flex w-fit items-center justify-center">
              {merchantEnrichment?.merchantLogo ?? <TransactionAvatar transaction={transaction} size={64} />}
            </div>
            <h1
              data-transaction-detail-title
              className="mt-[12px] font-['UniCredit',sans-serif] text-[28px] font-bold leading-[32px] tracking-[-0.02em] text-[var(--uc-text)]"
            >
              {merchantEnrichment?.cleanMerchantName ?? detail.title}
            </h1>
            <p className="uc-type-n5-strong mt-[8px] text-[var(--uc-text-muted)]">
              {detail.bookingDate}
            </p>
            <p className="mt-[8px] font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
              {detail.amount}
            </p>
            {isPending ? (
              <p className="mt-[18px] inline-flex items-center gap-[7px] uc-type-n5-strong uppercase text-[var(--uc-text-muted)]" data-pending-status>
                <span className="size-[8px] rounded-full bg-[var(--uc-orange-status)]" aria-hidden="true" />
                Pending
              </p>
            ) : (
              <>
                <p className="mt-[18px] font-['UniCredit',sans-serif] text-[13px] font-bold leading-normal text-[var(--uc-text-muted)]">
                  {detail.pfmCategoryLabel.toUpperCase()}
                </p>
                <div
                  className="mt-[8px] inline-flex items-center justify-center gap-[8px] rounded-full border px-[16px] py-[4px]"
                  style={{
                    borderColor: `var(${detail.pfmCategoryColorVar})`,
                    color: `var(${detail.pfmCategoryColorVar})`,
                  }}
                  data-testid="transaction-pfm-summary"
                  data-transaction-pfm-category={detail.pfmCategory}
                  data-transaction-pfm-subcategory={detail.pfmSubcategoryLabel}
                >
                  <PfmCategoryIcon category={detail.pfmCategory} size={20} />
                  <span className="text-[12px] font-bold leading-normal">
                    {detail.pfmSubcategoryLabel.toUpperCase()}
                  </span>
                </div>
              </>
            )}
          </section>

          {!isPending ? <section className="mt-[31px]">
            <AccountActionBar items={transactionActionItems} />
          </section> : null}
        </div>

        {!isPending ? <section className="px-[22px] pt-[23px]">
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
        </section> : null}

        <section className="px-[24px] pt-[30px]">
          <h2 className="font-['UniCredit',sans-serif] text-[22px] font-bold leading-normal text-[var(--uc-text)]">
            {t("runtime.transactionDetail.title", "Transaction details")}
          </h2>
          <div className="pt-[20px]">
            {isCardTransaction ? (
              <>
                {merchantEnrichment?.location ? <MerchantLocationDetail location={merchantEnrichment.location} /> : null}
                <DetailRow
                  label={t("runtime.cardTransactionDetail.description", "Transaction description")}
                  value={merchantEnrichment?.cleanMerchantName ?? transaction.label}
                />
                <DetailRow label={t("runtime.transactionDetail.amount", "Amount")} value={detail.amount} />
                <DetailRow
                  label={t("runtime.cardTransactionDetail.postingDate", "Posting date")}
                  value={detail.bookingDate}
                />
                <AnimatePresence initial={false}>
                  {areDetailsExpanded ? (
                    <motion.div
                      key="card-transaction-date"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <DetailRow
                        label={t("runtime.cardTransactionDetail.transactionDate", "Transaction date")}
                        value={detail.bookingDate}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {merchantEnrichment?.mcc ? <DetailRow label="Merchant Category Code (MCC)" value={merchantEnrichment.mcc} /> : null}
              </>
            ) : (
              <>
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
              </>
            )}
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
          {cardUsed ? (
            <section className="pt-[14px]" data-card-used>
              <SectionHeadingDivider title={t("runtime.cardTransactionDetail.cardUsed", "Card used")} />
              {cardUsedContent ?? <CardNavigationRow card={cardUsed} />}
            </section>
          ) : null}
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
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(48);
  const update = (key: keyof DomesticPaymentDraft, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const isFormValid =
    form.beneficiaryName.trim().length > 0 &&
    form.prefix.trim().length > 0 &&
    form.accountNumber.trim().length > 0 &&
    form.bankCode.trim().length > 0 &&
    form.amount.trim().length > 0;


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
      <div className="w-full px-[24px] pb-[42px]" data-domestic-payment-footer>
        <PrimaryButton className="!w-full" disabled={!isFormValid} onClick={() => onNext(form)}>{t("runtime.actions.next", "Next")}</PrimaryButton>
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
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(48);
  const beneficiaryAccount = [draft.prefix, draft.accountNumber, draft.bankCode].filter(Boolean).join("-");


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
      <div className="w-full px-[24px] pb-[42px]" data-domestic-payment-footer>
        <PrimaryButton className="!w-full" onClick={onSign}>{t("runtime.actions.sign", "Sign")}</PrimaryButton>
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
