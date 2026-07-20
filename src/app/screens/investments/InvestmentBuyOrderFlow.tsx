import { useMemo, useState, type ReactNode, type UIEvent } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import PageHeader from "@/app/components/PageHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import TextField from "@/app/components/TextField";
import ToggleButton from "@/app/components/ToggleButton";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import InvestmentDetailField from "@/app/components/investments/InvestmentDetailField";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import type { CurrentAccount } from "@/data/products";
import type { CoAppingInvestmentBuyDraft } from "../../../../package/mobile-pi-coapping-chat-package/src";
import {
  buildInvestmentBuyOrderQuote,
  getInvestmentBuyOrderValidation,
  parseInvestmentOrderQuantity,
} from "./investmentBuyOrderModel";

type InvestmentBuyOrderStep = "order-data" | "review" | "sign" | "success";

interface InvestmentBuyOrderFlowProps {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  country: CountryId;
  amountsHidden: boolean;
  initialDraft?: CoAppingInvestmentBuyDraft | null;
  onBack: () => void;
  onComplete: () => void;
}

function formatMoney(value: number, currency: string, country: CountryId, hidden: boolean) {
  const formatted = new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${hidden ? maskFormattedAmount(formatted, true) : formatted} ${currency}`;
}

function compactAccountNumber(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)} •••• ${value.slice(-4)}`;
}

function getValidatedInitialDraft(
  initialDraft: CoAppingInvestmentBuyDraft | null | undefined,
  security: InvestmentCatalogSecurity,
  accounts: readonly CurrentAccount[],
): CoAppingInvestmentBuyDraft | null {
  if (
    !initialDraft ||
    initialDraft.frequency !== "one-off" ||
    !["today", "next-business-day"].includes(initialDraft.executionTiming) ||
    !Number.isSafeInteger(initialDraft.quantity) ||
    initialDraft.quantity <= 0 ||
    security.status !== "active"
  ) {
    return null;
  }

  const account = accounts.find((candidate) => candidate.id === initialDraft.accountId);
  if (!account) return null;

  const quote = buildInvestmentBuyOrderQuote(security, account, initialDraft.quantity);
  return getInvestmentBuyOrderValidation(quote, account) ? null : initialDraft;
}

function formatExecutionTiming(value: CoAppingInvestmentBuyDraft["executionTiming"]) {
  return value === "next-business-day" ? "Next business day" : "Today";
}

/**
 * Small green dot bullet used in PRODUCT EVALUATION attributes.
 * Spec: 32×32 SVG viewBox, solid filled circle in --uc-green-olive.
 */
function ProductEvaluationBullet() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 16C20 18.2088 18.2084 20 16 20C13.7908 20 12 18.2088 12 16C12 13.7912 13.7908 12 16 12C18.2084 12 20 13.7912 20 16Z"
        fill="var(--uc-green-olive)"
      />
    </svg>
  );
}

function FlowFrame({
  title,
  onBack,
  children,
  actionLabel,
  actionDisabled = false,
  onAction,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction: () => void;
}) {
  const [headerProgress, setHeaderProgress] = useState(0);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll}>
        <PageHeader
          title={title}
          onBack={onBack}
          includeSafeArea
          showHelp={false}
          compact
          collapsedTitleProgress={headerProgress}
        />
        {children}
        <div className="h-[24px]" aria-hidden="true" />
      </div>
      <div className="bg-[var(--uc-surface)] px-[24px] pb-[34px] pt-[12px]">
        <PrimaryButton disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

export default function InvestmentBuyOrderFlow({
  security,
  accounts,
  country,
  amountsHidden,
  initialDraft,
  onBack,
  onComplete,
}: InvestmentBuyOrderFlowProps) {
  const validatedInitialDraft = getValidatedInitialDraft(initialDraft, security, accounts);
  const [step, setStep] = useState<InvestmentBuyOrderStep>(validatedInitialDraft ? "review" : "order-data");
  const [quantityValue, setQuantityValue] = useState(String(validatedInitialDraft?.quantity ?? 1));
  const [selectedAccountId, setSelectedAccountId] = useState(validatedInitialDraft?.accountId ?? accounts[0]?.id ?? "");
  const [executionTiming] = useState<CoAppingInvestmentBuyDraft["executionTiming"]>(
    validatedInitialDraft?.executionTiming ?? "today",
  );
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? accounts[0] ?? null;
  const quantity = parseInvestmentOrderQuantity(quantityValue);
  // The displayed buy-order price is always "yesterday's" price snapshot,
  // formatted consistently as DD.MM.YYYY across all countries.
  const priceUpdatedAt = useMemo(() => {
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    const dd = String(yesterday.getDate()).padStart(2, "0");
    const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
    const yyyy = yesterday.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }, []);
  const quote = useMemo(
    () => (selectedAccount && quantity ? buildInvestmentBuyOrderQuote(security, selectedAccount, quantity) : null),
    [quantity, security, selectedAccount],
  );
  const balanceValidation = quote && selectedAccount ? getInvestmentBuyOrderValidation(quote, selectedAccount) : null;
  const quantityValidation = quantityValue.length > 0 && quantity === null ? "Enter a positive whole number." : null;
  const canReview = Boolean(
    security.status === "active" && selectedAccount && quote && !balanceValidation && !quantityValidation,
  );

  if (step === "sign") {
    return (
      <StandardSignScreen
        title="Sign order"
        pinLabel="Enter PIN to sign the order"
        pinHelper="Authorize your one-off investment order"
        actionLabel="Sign order"
        onBack={() => setStep("review")}
        onSign={() => setStep("success")}
      />
    );
  }

  if (step === "success") {
    return (
      <StandardSuccessScreen
        title="Order accepted"
        body={`Your order to buy ${security.title} has been accepted. You can review its status in Investments History.`}
        actionLabel="Back to investments"
        onDone={onComplete}
      />
    );
  }

  if (step === "review" && selectedAccount && quote) {
    return (
      <FlowFrame
        title="Review Data"
        onBack={() => setStep("order-data")}
        actionLabel="Buy"
        actionDisabled={!termsAccepted}
        onAction={() => setStep("sign")}
      >
        <section className="pt-[16px]">
          <SectionHeadingDivider title="ORDER SUMMARY" className="px-[24px]" />
          <InvestmentDetailField label="Product" value={security.title} />
          <InvestmentDetailField label="Product ID" value={security.productId} />
          <InvestmentDetailField label="Order type" value="One off BUY" />
          <InvestmentDetailField label="Quantity" value={`${quote.quantity} PCS`} />
          <InvestmentDetailField label="Execution" value={formatExecutionTiming(executionTiming)} />
          <InvestmentDetailField label="Market price" value={formatMoney(quote.marketPrice, quote.productCurrency, country, amountsHidden)} />
          <InvestmentDetailField label="Estimated amount" value={formatMoney(quote.productAmount, quote.productCurrency, country, amountsHidden)} />
        </section>

        <section className="pt-[24px]">
          <SectionHeadingDivider title="ACCOUNTS" className="px-[24px]" />
          <InvestmentDetailField label="Security account" value={security.securityAccountName} />
          <InvestmentDetailField label="Cash account" value={`${selectedAccount.name} · ${compactAccountNumber(selectedAccount.accountNumber)}`} />
          {quote.accountCurrency !== quote.productCurrency ? (
            <InvestmentDetailField label="Estimated debit" value={formatMoney(quote.debitAmount, quote.accountCurrency, country, amountsHidden)} />
          ) : null}
        </section>

        <section className="pt-[24px]">
          <SectionHeadingDivider title="DOCUMENTS AND TERMS" className="px-[24px]" />
          <div className="space-y-[1px] bg-[var(--uc-border)]">
            {[
              "Ex-Ante cost information",
              "Product documents",
              "Important information",
              "Investment disclaimer",
            ].map((item) => (
              <button key={item} type="button" className="flex min-h-[56px] w-full items-center justify-between bg-[var(--uc-surface)] px-[24px] text-left uc-type-n4-strong">
                <span>{item}</span>
                <span aria-hidden="true" className="text-[var(--uc-action)]">›</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-[20px] px-[24px] py-[20px]">
            <p className="uc-type-n4 flex-1">I have read and accept the terms and conditions.</p>
            <ToggleButton
              ariaLabel="Accept terms and conditions"
              checked={termsAccepted}
              onToggle={setTermsAccepted}
            />
          </div>
        </section>
      </FlowFrame>
    );
  }

  return (
    <FlowFrame
      title="One off BUY Order"
      onBack={onBack}
      actionLabel="Next"
      actionDisabled={!canReview}
      onAction={() => setStep("review")}
    >
      <section className="pt-[16px]">
        <SectionHeadingDivider title="PRODUCT EVALUATION" className="px-[24px]" />
        <InvestmentDetailField label="Product" value={security.title} />
        {security.riskLevel ? (
          <div className="flex items-center px-[24px] py-[8px]">
            <ProductEvaluationBullet />
            <span className="ml-[8px] text-[14px] font-normal leading-[20px] text-[var(--uc-text)]">
              Risk level: {security.riskLevel}
            </span>
          </div>
        ) : null}
        {security.liquidity ? (
          <div className="flex items-center px-[24px] py-[8px]">
            <ProductEvaluationBullet />
            <span className="ml-[8px] text-[14px] font-normal leading-[20px] text-[var(--uc-text)]">
              Liquidity: {security.liquidity}
            </span>
          </div>
        ) : null}
      </section>

      <section className="pt-[24px]">
        <SectionHeadingDivider title="PRODUCT DETAIL" className="px-[24px]" />
        <InvestmentDetailField label="Product ID" value={security.productId} />
        <InvestmentDetailField label="Product type" value={security.productType} />
        <InvestmentDetailField label="Asset class" value={security.assetClass} />
        <InvestmentDetailField label="Market price" value={formatMoney(security.marketPrice, security.instrumentCurrency, country, amountsHidden)} />
        <InvestmentDetailField label="Price updated at" value={priceUpdatedAt} />
      </section>

      <section className="pt-[24px]">
        <SectionHeadingDivider title="ORDER DATA" className="px-[24px]" />
        <div className="min-h-[96px] px-[24px] py-[16px]">
          <TextField
            label="Security account"
            ariaLabel="Security account"
            value={security.securityAccountName}
            onChange={() => undefined}
            helperText={`${security.quantity.toFixed(0)} PCS`}
            readOnly
            trailingIconName="chevron-down-wide"
          />
        </div>
        {selectedAccount ? (
          <div className="min-h-[112px] cursor-pointer px-[24px] py-[16px]">
            <TextField
              label="Cash account"
              ariaLabel={`Cash account, ${selectedAccount.name}`}
              value={selectedAccount.accountNumber}
              onChange={() => undefined}
              helperText={selectedAccount.name}
              helperText2={`Available balance ${formatMoney(selectedAccount.balance, selectedAccount.currency, country, amountsHidden)}`}
              readOnly
              trailingIconName="chevron-down-wide"
              onActivate={() => setAccountSheetOpen(true)}
            />
          </div>
        ) : (
          <p className="px-[24px] py-[18px] uc-type-n4 text-[var(--uc-status-red)]">No current account is available.</p>
        )}
        <div className="min-h-[96px] px-[24px] py-[16px]">
          <TextField
            label="Quantity"
            ariaLabel="Quantity"
            value={quantityValue}
            onChange={setQuantityValue}
            inputMode="numeric"
            suffix="PCS"
            helperText="Minimum 1 PCS"
            errorText={quantityValidation ?? undefined}
          />
        </div>
        <InvestmentDetailField label="Frequency" value="One off" />
        <InvestmentDetailField label="Execution" value={formatExecutionTiming(executionTiming)} />
        {balanceValidation ? <p className="px-[24px] py-[12px] uc-type-n5 text-[var(--uc-status-red)]">{balanceValidation}</p> : null}
      </section>

      {accountSheetOpen ? (
        <BottomSheet title="Select cash account" onClose={() => setAccountSheetOpen(false)}>
          <div className="space-y-[1px] bg-[var(--uc-border)]">
            {accounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className="flex min-h-[72px] w-full items-center justify-between gap-[16px] bg-[var(--uc-sheet-bg)] px-[8px] py-[12px] text-left"
                onClick={() => {
                  setSelectedAccountId(account.id);
                  setAccountSheetOpen(false);
                }}
              >
                <span>
                  <span className="block uc-type-n4-strong">{account.name}</span>
                  <span className="block uc-type-n5 text-[var(--uc-text-muted)]">{compactAccountNumber(account.accountNumber)}</span>
                </span>
                <span className="shrink-0 uc-type-n4-strong">{formatMoney(account.balance, account.currency, country, amountsHidden)}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </FlowFrame>
  );
}
