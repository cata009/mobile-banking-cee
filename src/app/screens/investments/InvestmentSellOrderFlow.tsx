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
import { convertCurrency, roundMoney } from "@/data/exchangeRates";
import type { CurrentAccount } from "@/data/products";
import InvestmentOrderDocumentsAccordion from "./InvestmentOrderDocumentsAccordion";
import { ProductEvaluationBullet } from "./InvestmentBuyOrderFlow";

type InvestmentSellOrderStep = "order-data" | "review" | "sign" | "success";
type InvestmentSellMode = "units" | "amount";

interface InvestmentSellOrderFlowProps {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  country: CountryId;
  amountsHidden: boolean;
  onBack: () => void;
  onComplete: () => void;
}

interface SellQuote {
  quantity: number;
  productAmount: number;
  accountAmount: number;
}

const CTS_AMOUNT_ERROR = "The amount exceeds the maximum allowed for this instrument. Enter a lower amount.";
const CTS_UNITS_ONLY_MESSAGE = "Selling by amount is not available for this instrument. You can still sell by units.";

function parsePositiveDecimal(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(?:\.\d{0,6})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function trimNumber(value: number, maximumFractionDigits = 6) {
  return value.toFixed(maximumFractionDigits).replace(/\.?0+$/, "");
}

function formatMoney(value: number, currency: string, country: CountryId, hidden: boolean) {
  const formatted = new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${hidden ? maskFormattedAmount(formatted, true) : formatted} ${currency}`;
}

function formatQuantity(value: number, country: CountryId, hidden = false) {
  if (hidden) return "*,***";
  return new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(value);
}

function compactAccountNumber(value: string) {
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)} •••• ${value.slice(-4)}`;
}

function FlowFrame({
  title,
  onBack,
  children,
  actionLabel,
  actionDisabled = false,
  actionHint,
  onAction,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
  actionLabel: string;
  actionDisabled?: boolean;
  actionHint?: string;
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
      <div className="bg-[var(--uc-surface)] px-[24px] pb-[34px] pt-[8px]">
        {actionHint ? <p className="mb-[12px] text-center uc-type-n5 text-[var(--uc-text-muted)]">{actionHint}</p> : null}
        <PrimaryButton disabled={actionDisabled} onClick={onAction}>
          {actionLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

function SellModeButton({ selected, children, onClick }: { selected: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-[24px] min-w-[68px] items-center justify-center rounded-[4px] px-[10px] text-[14px] font-bold uppercase leading-[16px] ${
        selected
          ? "border border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-static-white)]"
          : "border border-[var(--uc-text)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function InvestmentSellOrderFlow({
  security,
  accounts,
  country,
  amountsHidden,
  onBack,
  onComplete,
}: InvestmentSellOrderFlowProps) {
  const amountSellingAvailable = security.sellOrderMode !== "units-only";
  const [step, setStep] = useState<InvestmentSellOrderStep>("order-data");
  const [mode, setMode] = useState<InvestmentSellMode>("units");
  const [unitsValue, setUnitsValue] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [sellAll, setSellAll] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id ?? "");
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? accounts[0] ?? null;
  const units = parsePositiveDecimal(unitsValue);
  const amount = parsePositiveDecimal(amountValue);
  const maximumAmount = security.sellAmountLimit ?? roundMoney(security.marketPrice * security.quantity);

  const quote = useMemo<SellQuote | null>(() => {
    if (!selectedAccount) return null;
    const quantity = mode === "units" ? units : amount ? amount / security.marketPrice : null;
    if (!quantity) return null;
    const productAmount = mode === "amount" && amount ? amount : roundMoney(quantity * security.marketPrice);
    return {
      quantity,
      productAmount,
      accountAmount: roundMoney(convertCurrency(productAmount, security.instrumentCurrency, selectedAccount.currency)),
    };
  }, [amount, mode, security.instrumentCurrency, security.marketPrice, selectedAccount, units]);

  const unitsError = unitsValue.length > 0 && units === null
    ? "Enter a positive number of units."
    : units && units > security.quantity
      ? `You can sell up to ${trimNumber(security.quantity)} PCS.`
      : null;
  const amountError = amountValue.length > 0 && amount === null
    ? "Enter a positive amount."
    : amount && (amount > maximumAmount || amount / security.marketPrice > security.quantity)
      ? CTS_AMOUNT_ERROR
      : null;
  const currentError = mode === "units" ? unitsError : amountError;
  const canReview = Boolean(
    security.owned
      && security.status === "active"
      && selectedAccount
      && quote
      && !currentError
      && (mode === "units" || amountSellingAvailable),
  );

  const selectMode = (nextMode: InvestmentSellMode) => {
    if (nextMode === "amount" && !amountSellingAvailable) return;
    setMode(nextMode);
    setSellAll(false);
  };

  const handleSellAll = (checked: boolean) => {
    setSellAll(checked);
    if (checked) {
      setMode("units");
      setUnitsValue(trimNumber(security.quantity));
    } else {
      setUnitsValue("");
    }
  };

  if (step === "sign") {
    return (
      <StandardSignScreen
        title="Sign order"
        pinLabel="Enter PIN to sign the order"
        pinHelper="Authorize your sell order securely"
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
        body={`Your order to sell ${security.title} has been accepted. You can follow its status in Investments History.`}
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
        actionLabel="Sell"
        actionDisabled={!termsAccepted}
        onAction={() => setStep("sign")}
      >
        <section className="pt-[16px]">
          <SectionHeadingDivider title="ORDER SUMMARY" className="px-[24px]" />
          <InvestmentDetailField label="Product" value={security.title} />
          <InvestmentDetailField label="Product ID" value={security.productId} />
          <InvestmentDetailField label="Order type" value="One off SELL" />
          <InvestmentDetailField label="Sell by" value={mode === "units" ? "Units" : "Amount"} />
          <InvestmentDetailField label="Quantity" value={`${formatQuantity(quote.quantity, country)} PCS`} />
          <InvestmentDetailField
            label="Estimated proceeds"
            value={formatMoney(quote.productAmount, security.instrumentCurrency, country, amountsHidden)}
          />
        </section>

        <section className="pt-[24px]">
          <SectionHeadingDivider title="ACCOUNTS" className="px-[24px]" />
          <InvestmentDetailField label="Portfolio account" value={security.securityAccountName} />
          <InvestmentDetailField
            label="Cash account"
            value={`${selectedAccount.name} · ${compactAccountNumber(selectedAccount.accountNumber)}`}
          />
          {selectedAccount.currency !== security.instrumentCurrency ? (
            <InvestmentDetailField
              label="Estimated credit"
              value={formatMoney(quote.accountAmount, selectedAccount.currency, country, amountsHidden)}
            />
          ) : null}
        </section>

        <section className="pt-[24px]">
          <SectionHeadingDivider title="DOCUMENTS AND TERMS" className="px-[24px]" />
          <InvestmentOrderDocumentsAccordion currency={security.instrumentCurrency} />
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
      title="Sell Order"
      onBack={onBack}
      actionLabel="Next"
      actionDisabled={!canReview}
      actionHint="You can view the final recap on the next screen"
      onAction={() => setStep("review")}
    >
      <section className="pt-[16px]">
        <SectionHeadingDivider title="PRODUCT EVALUATION" className="px-[24px]" />
        <InvestmentDetailField label="Product" value={security.title} />
        <div className="px-[16px] pb-[8px]">
          <div className="flex items-center">
            <ProductEvaluationBullet />
            <span className="text-[14px] leading-[20px]">Product is in client's target market</span>
          </div>
          <div className="flex items-center">
            <ProductEvaluationBullet />
            <span className="text-[14px] leading-[20px]">Product is appropriate</span>
          </div>
        </div>
      </section>

      <section className="pt-[24px]">
        <SectionHeadingDivider title="PRODUCT DETAIL" className="px-[24px]" />
        <InvestmentDetailField label="Product ID" value={security.productId} />
        <InvestmentDetailField label="Product type" value={security.productType} />
        <InvestmentDetailField
          label="Price of instrument"
          value={formatMoney(security.marketPrice, security.instrumentCurrency, country, amountsHidden)}
          secondaryValue={security.lastUpdate}
        />
        <InvestmentDetailField
          label="Product value in portfolio"
          value={formatMoney(security.value, security.instrumentCurrency, country, amountsHidden)}
          secondaryValue={security.lastUpdate}
        />
        <InvestmentDetailField
          label="Disposable quantity"
          value={`${formatQuantity(security.quantity, country, amountsHidden)} PCS`}
        />
      </section>

      <section className="pt-[24px]">
        <SectionHeadingDivider title="ORDER DATA" className="px-[24px]" />
        <div className="min-h-[96px] px-[24px] py-[16px]">
          <TextField
            label="Portfolio account"
            ariaLabel="Portfolio account"
            value={security.securityAccountName}
            onChange={() => undefined}
            helperText={`You own ${formatQuantity(security.quantity, country, amountsHidden)} PCS`}
            readOnly
          />
        </div>

        <div className="flex items-center gap-[16px] px-[24px] py-[20px]">
          <div className="min-w-0 flex-1">
            <p className="text-[18px] font-bold leading-[20px]">SELL BY</p>
            <p className="mt-[4px] text-[14px] leading-[16px] text-[var(--uc-text-muted)]">How to sell order</p>
          </div>
          <SellModeButton selected={mode === "units"} onClick={() => selectMode("units")}>Units</SellModeButton>
          {amountSellingAvailable ? (
            <SellModeButton selected={mode === "amount"} onClick={() => selectMode("amount")}>Amount</SellModeButton>
          ) : null}
        </div>

        {!amountSellingAvailable ? (
          <p className="mx-[24px] mb-[12px] rounded-[4px] bg-[var(--uc-app-bg)] px-[16px] py-[12px] text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {CTS_UNITS_ONLY_MESSAGE}
          </p>
        ) : null}

        {mode === "units" ? (
          <>
            <div className="min-h-[96px] px-[24px] py-[16px]">
              <TextField
                label="Number of units you want to sell"
                ariaLabel="Number of units you want to sell"
                value={unitsValue}
                onChange={(value) => {
                  setUnitsValue(value);
                  setSellAll(parsePositiveDecimal(value) === security.quantity);
                }}
                inputMode="decimal"
                suffix="PCS"
                helperText={units ? `Equivalent to approximately ${formatMoney(units * security.marketPrice, security.instrumentCurrency, country, false)}` : `Equivalent to approximately ${formatMoney(0, security.instrumentCurrency, country, false)}`}
                errorText={unitsError ?? undefined}
              />
            </div>
            <div className="flex min-h-[80px] items-center justify-between gap-[20px] px-[24px] py-[16px]">
              <div>
                <p className="text-[18px] font-bold leading-[20px]">SELL ALL</p>
                <p className="mt-[4px] text-[14px] leading-[16px] text-[var(--uc-text-muted)]">Sell all units in this portfolio</p>
              </div>
              <ToggleButton ariaLabel="Sell all units" checked={sellAll} onToggle={handleSellAll} />
            </div>
          </>
        ) : (
          <>
            <div className="min-h-[96px] px-[24px] py-[16px]">
              <TextField
                label="Amount you want to receive"
                ariaLabel="Amount you want to receive"
                value={amountValue}
                onChange={setAmountValue}
                inputMode="decimal"
                suffix={security.instrumentCurrency}
                helperText={amount ? `Equivalent to approximately ${formatQuantity(amount / security.marketPrice, country)} PCS` : "Equivalent to approximately 0 PCS"}
                errorText={amountError ?? undefined}
              />
            </div>
            <p className="px-[24px] py-[12px] text-[14px] leading-[18px]">
              The amount shown is an estimate. The final amount may be higher or lower depending on the execution price. Any applicable fees will be deducted from the final amount received.
            </p>
          </>
        )}

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
                <span className="shrink-0 uc-type-n4-strong">
                  {formatMoney(account.balance, account.currency, country, amountsHidden)}
                </span>
              </button>
            ))}
          </div>
        </BottomSheet>
      ) : null}
    </FlowFrame>
  );
}
