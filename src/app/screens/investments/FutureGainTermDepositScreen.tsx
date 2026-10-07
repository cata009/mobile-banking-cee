import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import AutoGrowTextArea from "@/app/components/AutoGrowTextArea";
import { AmountSuggestionChip } from "@/app/components/AmountSuggestionChip";
import AmountField from "@/app/components/AmountField";
import PrimaryButton from "@/app/components/PrimaryButton";
import PageHeader from "@/app/components/PageHeader";
import TextField from "@/app/components/TextField";
import UniCreditLogo from "@/app/components/UniCreditLogo";
import { AppIcon } from "@/app/components/icons";
import { PrimeContactActionFlow } from "@/app/screens/prime/PrimeContactActionFlow";
import { AppointmentPage } from "@/app/screens/appointments/AppointmentScreen";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { formatMoneyNumber, splitMoneyAmount } from "@/app/registry/countryConfig";
import { useDemo } from "@/app/state/demoStore";
import { convertCurrency, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import { useProducts } from "@/hooks/useProducts";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import currentBankIcon from "@/assets/investments/term-deposit/current-bank.svg";
import externalBankIcon from "@/assets/investments/term-deposit/external-bank.svg";
import requestContactIcon from "@/assets/investments/term-deposit/request-contact-icon.svg";

type DepositCurrency = "EUR" | "RSD" | "USD";
type FundingSource = "current" | "external";
type TenorMonths = 3 | 6 | 12;
type SelectionType = "currency" | "tenor" | null;
type InfoType = "simulator" | "opportunity" | "nks" | "eks" | null;
type RequestStep = "calculator" | "contact" | "callback" | "success";

const DEPOSIT_CURRENCIES: readonly DepositCurrency[] = ["EUR", "RSD", "USD"];
const TENOR_OPTIONS: readonly TenorMonths[] = [12, 6, 3];
const EXTERNAL_LIMITS: Record<DepositCurrency, number> = {
  EUR: 100_000,
  RSD: 1_000_000,
  USD: 100_000,
};

// Illustrative RS average of funds left uninvested after monthly expenses; this is not the customer's current account balance.
const AVERAGE_UNINVESTED_FUNDS_RSD = 1_500_000;

const RATES: Record<FundingSource, Record<DepositCurrency, { nominal: number; effective: number; tax: number }>> = {
  current: {
    EUR: { nominal: 2.3, effective: 1.98, tax: 15 },
    RSD: { nominal: 3.6, effective: 3.65, tax: 0 },
    USD: { nominal: 2.3, effective: 1.98, tax: 15 },
  },
  external: {
    EUR: { nominal: 3.2, effective: 2.72, tax: 15 },
    RSD: { nominal: 4.5, effective: 4.5, tax: 0 },
    USD: { nominal: 4, effective: 4, tax: 15 },
  },
};

const TERM_DEPOSIT_DISCLAIMER =
  "The information presented is for informational purposes and does not take into account your individual financial needs, circumstances, or investment experience. The displayed interest rates and expected returns are indicative in nature and do not constitute a binding offer. The final terms and conditions of a term deposit, as well as the applicable interest rates, shall be defined in the agreement concluded between the Bank and the client. The Bank reserves the right to amend the terms and conditions in accordance with its business policy and prevailing market conditions. The Bank participates in the mandatory deposit insurance scheme established in the Republic of Serbia.";

const SIMULATOR_STEPS = [
  {
    title: "CHOOSE YOUR FUNDS",
    description: "Select whether you want to use money from your UniCredit account or funds from another bank.",
  },
  {
    title: "ADJUST YOUR DEPOSIT",
    description: "Change the amount, currency and term to compare different scenarios.",
  },
  {
    title: "SEE YOUR ESTIMATE",
    description: "The calculation updates automatically to show the applicable interest rate and estimated return.",
  },
  {
    title: "REQUEST AN OFFER",
    description: "If you find an option that suits you, you can submit a request to the bank. The simulation itself does not open a deposit.",
  },
] as const;

function parseAmount(value: string): number {
  const normalized = value.trim().replace(/\s/g, "");
  const decimalNormalized = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;
  const amount = Number(decimalNormalized);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

function formatInputAmount(amount: number, country: ReturnType<typeof useDemo>["country"]): string {
  return formatMoneyNumber(roundMoney(amount), country);
}

function formatDepositAmount(
  amount: number,
  currency: DepositCurrency,
  country: ReturnType<typeof useDemo>["country"],
): string {
  return `${formatMoneyNumber(roundMoney(amount), country)} ${currency}`;
}

function getOpportunityAmountFontSize(amounts: readonly number[], country: ReturnType<typeof useDemo>["country"]): number {
  const longestInteger = Math.max(...amounts.map((amount) => splitMoneyAmount(amount, country).integer.length));
  return Math.max(16, 24 - Math.max(0, longestInteger - 8) * 1.5);
}

function OpportunityAmount({
  amount,
  currency,
  country,
  color,
  hidden,
  fontSize,
  prefix = "",
  align = "left",
}: {
  amount: number;
  currency: DepositCurrency;
  country: ReturnType<typeof useDemo>["country"];
  color: string;
  hidden: boolean;
  fontSize: number;
  prefix?: string;
  align?: "left" | "right";
}) {
  const formatted = formatMoneyNumber(amount, country);
  const { integer, decimal } = splitMoneyAmount(amount, country);
  const decimalSeparator = formatted.slice(integer.length, integer.length + 1);

  return (
    <p
      className={`mt-[2px] flex min-w-0 items-baseline whitespace-nowrap font-bold ${align === "right" ? "justify-end" : "justify-start"}`}
      style={{ color, fontSize }}
    >
      <span>{hidden ? "••••••" : `${prefix}${integer}`}</span>
      <span className="uc-type-n5 ml-[2px] shrink-0">
        {hidden ? null : `${decimalSeparator}${decimal}`}
        <span className="ml-[2px]">{currency}</span>
      </span>
    </p>
  );
}

function formatSuggestionAmount(amount: number, country: ReturnType<typeof useDemo>["country"]): string {
  return formatMoneyNumber(amount, country).replace(/[,.]00$/, "");
}

function getQuickAmounts(maximum: number, currency: DepositCurrency, source: FundingSource): number[] {
  const ratios = source === "current" ? [0.25, 0.5, 0.75, 1] : [0.2, 0.5, 0.7, 1];
  const roundingStep = currency === "RSD" ? 1_000 : 100;
  const suggestions = ratios.map((ratio) => {
    if (ratio === 1) return roundMoney(maximum);
    return Math.min(maximum, Math.floor((maximum * ratio) / roundingStep) * roundingStep);
  });
  return [...new Set(suggestions.filter((amount) => amount > 0))];
}

function DepositSourceCard({
  source,
  selected,
  onSelect,
}: {
  source: FundingSource;
  selected: boolean;
  onSelect: () => void;
}) {
  const isCurrent = source === "current";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex flex-col items-start rounded-[4px] border bg-[var(--uc-surface)] p-[16px] text-left transition-colors duration-200 ease-in-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
        selected ? "border-[var(--uc-action)]" : "border-[var(--uc-border-muted)]"
      }`}
    >
      <span className="grid size-[32px] shrink-0 place-items-center">
        <img
          src={isCurrent ? currentBankIcon : externalBankIcon}
          alt=""
          width={20}
          height={20}
          className="block shrink-0"
          draggable={false}
        />
      </span>
      <span className={`mt-[8px] min-h-[36px] uc-type-n5-strong transition-colors duration-200 ease-in-out motion-reduce:transition-none ${selected ? "text-[var(--uc-action)]" : "text-[var(--uc-text)]"}`}>
        <span className="block">{isCurrent ? "Current bank" : "External bank"}</span>
        <span className="block">account</span>
      </span>
      <span className="mt-[4px] min-h-[30px] text-[12px] leading-[15px] text-[var(--uc-text)]">
        {isCurrent ? "Use your UniCredit account" : "Use an account at another bank"}
      </span>
    </button>
  );
}

function DepositSelectionSheet({
  type,
  selected,
  onSelect,
  onConfirm,
  onClose,
}: {
  type: Exclude<SelectionType, null>;
  selected: DepositCurrency | TenorMonths;
  onSelect: (value: DepositCurrency | TenorMonths) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const isCurrency = type === "currency";
  const options: readonly (DepositCurrency | TenorMonths)[] = isCurrency ? DEPOSIT_CURRENCIES : TENOR_OPTIONS;
  const title = isCurrency ? "Select currency" : "Select tenor";
  const headingId = isCurrency ? "term-deposit-currency-options" : "term-deposit-tenor-options";

  return (
    <BottomSheet
      title={title}
      onClose={onClose}
      closeLabel={`Close ${title.toLowerCase()}`}
      animated
      fillHeight
      maxHeightOffsetPx={54}
      className="px-[16px] pb-[16px] pt-[16px]"
      bodyClassName="min-h-0 flex-1 overflow-y-auto scrollbar-hide"
      footer={(requestClose) => (
        <div className="px-[8px]">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              requestClose();
            }}
            className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
          >
            OK
          </button>
        </div>
      )}
    >
      <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
        <h2 id={headingId} className="uc-type-n4-strong uppercase text-[var(--uc-text)]">
          Select from the available options
        </h2>
      </div>
      <div role="radiogroup" aria-labelledby={headingId} className="pt-[8px]">
        {options.map((option) => {
          const value = isCurrency ? (option as DepositCurrency) : (option as TenorMonths);
          const label = isCurrency ? String(value) : `${value} months`;
          return (
            <label key={String(option)} className="flex h-[80px] cursor-pointer items-center gap-[12px] px-[4px] text-[var(--uc-text)]">
              <input
                type="radio"
                name={isCurrency ? "term-deposit-currency" : "term-deposit-tenor"}
                value={String(value)}
                checked={selected === value}
                onChange={() => onSelect(value)}
                className="size-[22px] accent-[var(--uc-action)]"
              />
              <span className="uc-type-n4-strong">{label}</span>
            </label>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function DepositInfoSheet({ type, onClose }: { type: Exclude<InfoType, "simulator" | null>; onClose: () => void }) {
  const content = {
    opportunity: {
      title: "Missed investment opportunity",
      description:
        "This is an estimate of the potential return if some of your available funds were placed in a term deposit. It uses the current indicative rate and selected term. The result is not an actual loss or a guaranteed return.",
    },
    nks: {
      title: "NKS - Nominal Interest Rate",
      description: "The annual interest rate applied to your deposit before considering taxes or other applicable costs.",
    },
    eks: {
      title: "EKS - Effective Interest Rate",
      description: "The effective annual rate showing the estimated return on your deposit, including the applicable calculation method, taxes and costs.",
    },
  }[type];

  return (
    <BottomSheet
      title={content.title}
      onClose={onClose}
      closeLabel={`Close ${content.title}`}
      animated
      className="p-[24px]"
      headerClassName="mb-[24px] items-start"
      footer={(requestClose) => (
        <button
          type="button"
          onClick={requestClose}
          className="mt-[24px] h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          OK
        </button>
      )}
    >
      <section aria-labelledby="term-deposit-info-how-it-works">
        <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
          <h2 id="term-deposit-info-how-it-works" className="uc-type-n4-strong text-[var(--uc-text)]">
            How it works
          </h2>
        </div>
        <p className="uc-type-n4 mt-[24px] text-[var(--uc-text)]">{content.description}</p>
      </section>
    </BottomSheet>
  );
}

function RepresentativeExampleRow({
  label,
  value,
  highlighted = false,
  infoLabel,
  onInfoClick,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  infoLabel?: string;
  onInfoClick?: () => void;
}) {
  return (
    <div className={`flex h-[80px] flex-col justify-center gap-[4px] px-[24px] py-[16px] ${highlighted ? "bg-[#f5f5f5]" : "bg-white"}`}>
      <dt className={`flex items-center gap-[4px] ${highlighted ? "uc-type-n4-strong" : "uc-type-n4"} text-[var(--uc-text)]`}>
        {label}
        {infoLabel && onInfoClick ? (
          <button type="button" onClick={onInfoClick} aria-label={infoLabel} className="grid size-[24px] shrink-0 place-items-center">
            <AppIcon name="info-circle" size={20} color="var(--uc-text)" />
          </button>
        ) : null}
      </dt>
      <dd className="uc-type-l2 text-[var(--uc-text)]">{value}</dd>
    </div>
  );
}

function SimulatorInfoSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet
      title="About the Term Deposit Simulator"
      titleClassName="sr-only"
      onClose={onClose}
      closeLabel="Close simulator information"
      closeButtonPosition="left"
      animated
      fillHeight
      maxHeightOffsetPx={54}
      className="p-0"
      headerClassName="mb-0 h-[44px] shrink-0 items-center border-b border-[rgba(153,153,153,0.35)] px-[8px] py-[6px]"
      bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      footer={
        <div className="flex h-[50px] shrink-0 items-center justify-between border-t border-[rgba(153,153,153,0.35)] bg-[var(--uc-surface)] px-[12px]">
          <button type="button" disabled aria-label="Previous page" className="grid size-[24px] place-items-center opacity-10">
            <AppIcon name="chevron-left" size={24} color="var(--uc-text)" />
          </button>
          <button type="button" disabled aria-label="Next page" className="grid size-[24px] place-items-center opacity-10">
            <AppIcon name="chevron-right" size={24} color="var(--uc-text)" />
          </button>
        </div>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-[24px] pb-[28px] scrollbar-hide">
        <div className="flex flex-col gap-[24px] pt-[32px]">
          <h2 className="uc-type-h1 text-[var(--uc-text)]">About the Term Deposit Simulator</h2>
          <div className="uc-type-p1 text-[var(--uc-text)]">
            <p>Use this simulator to explore how a term deposit could work for you.</p>
            <p className="mt-[16px]">Choose the amount, currency and term to see an estimated interest rate and the potential amount at maturity.</p>
          </div>
          <section aria-labelledby="term-deposit-simulator-how-it-works">
            <div className="border-b border-[var(--uc-border-muted)] px-[8px] pb-[8px]">
              <h3 id="term-deposit-simulator-how-it-works" className="uc-type-h2 text-[var(--uc-text)]">How it works</h3>
            </div>
            <div>
              {SIMULATOR_STEPS.map((step) => (
                <div key={step.title} className="flex items-center gap-[16px] px-[8px] py-[16px]">
                  <span className="grid size-[32px] shrink-0 place-items-center text-[var(--uc-text)]">
                    <AppIcon name="check" size={24} color="var(--uc-text)" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-[4px] text-[var(--uc-text)]">
                    <p className="uc-type-n4-strong uppercase">{step.title}</p>
                    <p className="uc-type-n4">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="uc-type-n4 text-[var(--uc-text)]">
            <p>The results are indicative and provided for informational purposes only.</p>
            <p className="mt-[16px]">Final rates, conditions and amounts may differ and will be confirmed by the bank when the deposit is opened.</p>
          </div>
          <div className="flex justify-center pb-[8px]">
            <UniCreditLogo className="h-[24px] w-[174px]" textColor="var(--uc-text)" />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

export function RequestContactScreen({
  onBack,
  onCallback,
  backLabel = "Back to term deposit",
}: {
  onBack: () => void;
  onCallback: () => void;
  backLabel?: string;
}) {
  const [callConfirmationOpen, setCallConfirmationOpen] = useState(false);

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-term-deposit-request-step="contact">
      <div className="shrink-0">
        <PageHeader
          title=""
          onBack={onBack}
          backLabel={backLabel}
          includeSafeArea
          showHelp={false}
          renderLargeTitle={false}
        />
      </div>
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-[24px] pb-[24px] text-center">
        <span className="grid size-[100px] place-items-center rounded-full border-[6px] border-[var(--uc-text)]">
          <img src={requestContactIcon} alt="" width={48} height={48} className="block" draggable={false} />
        </span>
        <h1 className="uc-type-h1 mt-[24px] max-w-[310px] text-[24px] leading-[31px] text-[var(--uc-text)]">
          Let’s talk about your request
        </h1>
        <p className="uc-type-p1 mt-[24px] max-w-[300px] text-[var(--uc-text)]">
          One of our specialists can contact you and help you find the right solution.
        </p>
      </main>
      <footer className="flex shrink-0 flex-col gap-[12px] px-[24px] pb-[var(--uc-phone-bottom-reserve,34px)] pt-[8px]">
        <button
          type="button"
          onClick={() => setCallConfirmationOpen(true)}
          className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          Call us
        </button>
        <button type="button" onClick={onCallback} className="h-[32px] w-full uc-type-n4-strong text-[var(--uc-action)]">
          Request a callback
        </button>
      </footer>
      {callConfirmationOpen ? (
        <PrimeContactActionFlow
          key="future-gain-support-call"
          initialAction="call"
          advisorName="UniCredit Support"
          phoneNumber="+381 11 3777 888"
          callIdentity="support"
          emailAddress=""
          mailPreferences={{ askEveryTime: true, preferredApp: null }}
          onMailPreferencesChange={() => undefined}
          onClose={() => setCallConfirmationOpen(false)}
          text={(_key, fallback) => fallback}
        />
      ) : null}
    </div>
  );
}

export function CallbackNotesScreen({
  note,
  onNoteChange,
  onBack,
  onContinue,
}: {
  note: string;
  onNoteChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <AppointmentPage
      title="Do you want to send a specific message?"
      onBack={onBack}
      footer={(
        <PrimaryButton labelSize="18" onClick={onContinue}>
          Continue
        </PrimaryButton>
      )}
    >
      <div className="px-[24px] pt-[24px]" data-term-deposit-request-step="callback">
        <label htmlFor="future-gain-callback-note" className="block uc-type-n4 text-[var(--uc-text)]">
          Additional notes (optional)
        </label>
        <AutoGrowTextArea
          id="future-gain-callback-note"
          value={note}
          onChange={onNoteChange}
          maxLength={500}
          ariaLabel="Additional notes"
          className="mt-[4px] w-full resize-none border-0 border-b border-[var(--uc-border)] bg-transparent px-0 py-[4px] uc-type-n4 leading-[20px] text-[var(--uc-text)] outline-none focus:border-[var(--uc-action)]"
        />
        <p className="mt-[6px] uc-type-n5 text-[var(--uc-text-muted)]">
          Our colleagues will take care of your notes and get prepared with all the requested answers
        </p>
      </div>
    </AppointmentPage>
  );
}

export function RequestSuccessScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-term-deposit-request-step="success">
      <div className="shrink-0 px-[8px] pt-[var(--uc-phone-top-reserve,54px)]">
        <div className="h-[48px]" aria-hidden="true" />
        <h1 className="uc-type-h1 px-[16px] pt-[8px] text-[var(--uc-text)]">Request received</h1>
      </div>
      <main className="flex min-h-0 flex-1 flex-col px-[24px] pt-[56px]">
        <div className="mx-auto grid size-[96px] place-items-center rounded-full border-[6px] border-[#3d7d43] text-[#3d7d43]">
          <AppIcon name="check" size={64} color="#3d7d43" />
        </div>
        <h2 className="uc-type-n4-strong mt-[48px] text-[var(--uc-text)]">Thank you!</h2>
        <p className="uc-type-p1 mt-[16px] text-[var(--uc-text)]">
          One of our specialists will contact you soon to help with your request.
        </p>
      </main>
      <footer className="shrink-0 px-[24px] pb-[var(--uc-phone-bottom-reserve,34px)] pt-[8px]">
        <button
          type="button"
          onClick={onDone}
          className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          Ok, got it
        </button>
      </footer>
    </div>
  );
}

export default function FutureGainTermDepositScreen({ onBack }: { onBack: () => void }) {
  const { amountsHidden, country } = useDemo();
  const { calculateTotalAvailableAmount } = useProducts();
  const { progress: headerProgress, onScroll: handleScroll, setProgress: setHeaderProgress } = useCollapsingHeader(64);
  const sourceCurrency = getCountryCurrency(country);
  const totalAvailable = calculateTotalAvailableAmount();
  const [currency, setCurrency] = useState<DepositCurrency>("EUR");
  const availableBalance = roundMoney(convertCurrency(totalAvailable, sourceCurrency, currency));
  const averageUninvestedFunds = roundMoney(convertCurrency(AVERAGE_UNINVESTED_FUNDS_RSD, "RSD", currency));
  const initialAmount = Math.min(5_000, availableBalance);
  const [fundingSource, setFundingSource] = useState<FundingSource>("current");
  const [amountInput, setAmountInput] = useState(() => formatInputAmount(initialAmount, country));
  const [tenor, setTenor] = useState<TenorMonths>(12);
  const [selectionType, setSelectionType] = useState<SelectionType>(null);
  const [pendingCurrency, setPendingCurrency] = useState<DepositCurrency>("EUR");
  const [pendingTenor, setPendingTenor] = useState<TenorMonths>(12);
  const [infoType, setInfoType] = useState<InfoType>(null);
  const [requestStep, setRequestStep] = useState<RequestStep>("calculator");
  const [callbackNote, setCallbackNote] = useState("");

  const externalMaximum = EXTERNAL_LIMITS[currency];
  const suggestionBaseAmount = fundingSource === "current" ? availableBalance : externalMaximum;
  const amount = parseAmount(amountInput);
  const rates = RATES[fundingSource][currency];
  const opportunityRates = RATES.current[currency];
  const isAmountValid = amount > 0;
  const amountError = amount <= 0 ? "Enter an amount to continue." : "";
  const quickAmounts = getQuickAmounts(suggestionBaseAmount, currency, fundingSource);
  const annualizedDayFactor = fundingSource === "external" && currency === "RSD" ? 1 : 365 / 360;
  const grossInterest = isAmountValid
    ? roundMoney(amount * (rates.nominal / 100) * (tenor / 12) * annualizedDayFactor)
    : 0;
  const grossMaturity = roundMoney(amount + grossInterest);
  const tax = roundMoney(grossInterest * (rates.tax / 100));
  const netMaturity = roundMoney(grossMaturity - tax);
  const potentialYield = roundMoney(averageUninvestedFunds * (opportunityRates.nominal / 100) * (365 / 360));
  const opportunityAmountFontSize = getOpportunityAmountFontSize([averageUninvestedFunds, potentialYield], country);

  const handleCurrencyConfirm = () => {
    const enteredAmount = parseAmount(amountInput);
    const convertedAmount = roundMoney(convertCurrency(enteredAmount, currency, pendingCurrency));
    const newAvailable = roundMoney(convertCurrency(totalAvailable, sourceCurrency, pendingCurrency));
    const newSuggestionBase = fundingSource === "current" ? newAvailable : EXTERNAL_LIMITS[pendingCurrency];
    setCurrency(pendingCurrency);
    const fallbackAmount = Math.min(5_000, newSuggestionBase);
    setAmountInput(formatInputAmount(convertedAmount > 0 ? convertedAmount : fallbackAmount, country));
  };

  const handleSelectionConfirm = () => {
    if (selectionType === "currency") handleCurrencyConfirm();
    if (selectionType === "tenor") setTenor(pendingTenor);
  };

  const showSimulatorInfo = () => setInfoType("simulator");

  if (requestStep === "contact") {
    return (
      <>
        <RequestContactScreen
          onBack={() => {
            setHeaderProgress(0);
            setRequestStep("calculator");
          }}
          onCallback={() => setRequestStep("callback")}
        />
        {infoType === "simulator" ? <SimulatorInfoSheet onClose={() => setInfoType(null)} /> : null}
      </>
    );
  }

  if (requestStep === "callback") {
    return (
      <CallbackNotesScreen
        note={callbackNote}
        onNoteChange={setCallbackNote}
        onBack={() => setRequestStep("contact")}
        onContinue={() => setRequestStep("success")}
      />
    );
  }

  if (requestStep === "success") {
    return (
      <>
        <RequestSuccessScreen onDone={onBack} />
        {infoType === "simulator" ? <SimulatorInfoSheet onClose={() => setInfoType(null)} /> : null}
      </>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-term-deposit-simulator="true">
      <div className="shrink-0">
        <PageHeader
          title="Term deposit"
          onBack={onBack}
          onHelpClick={showSimulatorInfo}
          includeSafeArea
          compact
          renderLargeTitle={false}
          collapsedTitleProgress={headerProgress}
          hideCollapsedTitleWhenHidden
        />
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto pb-[24px] scrollbar-hide" onScroll={handleScroll}>
        <h1 className="uc-type-h1 px-[24px] pt-[8px] text-[var(--uc-text)]">Term deposit</h1>
        <div className="px-[24px] pt-[16px]">
          <section className="rounded-[8px] bg-[#f5f5f5] p-[16px]" aria-labelledby="missed-opportunity-title">
            <div className="flex items-center gap-[4px]">
              <h2 id="missed-opportunity-title" className="uc-type-h2 flex-1 text-[var(--uc-text)]">
                Missed investment opportunity
              </h2>
              <button
                type="button"
                onClick={() => setInfoType("opportunity")}
                aria-label="About the missed investment opportunity estimate"
                className="grid size-[28px] shrink-0 place-items-center"
              >
                <AppIcon name="help-circle" size={20} color="var(--uc-text)" />
              </button>
            </div>
            <div className="mt-[8px] grid grid-cols-[1fr_1px_1fr] items-start gap-[12px]">
              <div className="min-w-0">
                <p className="uc-type-n5 text-[var(--uc-text)]">Average funds</p>
                <OpportunityAmount
                  amount={averageUninvestedFunds}
                  currency={currency}
                  country={country}
                  color="var(--uc-text)"
                  hidden={amountsHidden}
                  fontSize={opportunityAmountFontSize}
                />
                <p className="uc-type-n5 text-[var(--uc-text-muted)]">left uninvested after monthly expenses</p>
              </div>
              <span className="h-[48px] self-center bg-[var(--uc-border-muted)]" />
              <div className="min-w-0 text-right">
                <p className="uc-type-n5 text-[var(--uc-text)]">Potential yield</p>
                <OpportunityAmount
                  amount={potentialYield}
                  currency={currency}
                  country={country}
                  color="#3d7d43"
                  hidden={amountsHidden}
                  fontSize={opportunityAmountFontSize}
                  prefix="+"
                  align="right"
                />
                <p className="uc-type-n5 text-[var(--uc-text-muted)]">for a 12M deposit</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-[24px]" aria-label="Deposit calculation">
          <SectionHeadingDivider title="DEPOSIT CALCULATION" className="px-[24px]" />
          <p className="uc-type-n5 px-[24px] pt-[16px] text-[var(--uc-text)]">
            Choose your deposit type, currency, amount, and term to see the expected interest and return.
          </p>
          <div className="mt-[16px] grid grid-cols-2 gap-[8px] px-[24px]" role="radiogroup" aria-label="Choose your deposit type">
            <DepositSourceCard source="current" selected={fundingSource === "current"} onSelect={() => setFundingSource("current")} />
            <DepositSourceCard source="external" selected={fundingSource === "external"} onSelect={() => setFundingSource("external")} />
          </div>
        </section>

        <section className="mt-[20px]" aria-label="Deposit amount and currency">
          <div className="px-[24px]">
            <AmountField
              label="Amount to deposit"
              value={amountInput}
              onChange={setAmountInput}
              currency={currency}
              currencyLabel="Currency"
              currencyAriaLabel={`Change currency, currently ${currency}`}
              currencyIconName="chevron-down-wide"
              onCurrencyClick={() => {
                setPendingCurrency(currency);
                setSelectionType("currency");
              }}
              onBlur={() => {
                if (amount > 0) setAmountInput(formatInputAmount(amount, country));
              }}
              inputMode="decimal"
              ariaLabel={`Amount to deposit in ${currency}`}
              ariaInvalid={Boolean(amountError)}
              helperText={!amountError
                ? fundingSource === "current"
                  ? "Available balance"
                  : "Enter the amount you want to simulate."
                : undefined}
              helperText2={!amountError && fundingSource === "current"
                ? formatDepositAmount(availableBalance, currency, country)
                : undefined}
              errorText={amountError || undefined}
            />
          </div>
          <div className="mt-[12px] flex flex-nowrap gap-[8px] overflow-x-auto px-[24px] scrollbar-hide">
            {quickAmounts.map((quickAmount, index) => {
              const isAllAvailable = index === quickAmounts.length - 1;
              return (
                <AmountSuggestionChip
                  key={`${quickAmount}-${index}`}
                  aria-label={isAllAvailable ? `Use all available, ${formatDepositAmount(quickAmount, currency, country)}` : `Use ${formatDepositAmount(quickAmount, currency, country)}`}
                  selected={roundMoney(amount) === quickAmount}
                  onSelect={() => setAmountInput(formatInputAmount(quickAmount, country))}
                  className="shrink-0"
                >
                  {isAllAvailable ? "ALL AVAILABLE" : formatSuggestionAmount(quickAmount, country)}
                </AmountSuggestionChip>
              );
            })}
          </div>
        </section>

        <section className="mt-[20px] px-[24px]" aria-label="Deposit term">
          <TextField
            label="Tenor"
            value={`${tenor} months`}
            onChange={() => undefined}
            readOnly
            ariaLabel={`Tenor, ${tenor} months`}
            trailingIconName="chevron-down-wide"
            trailingIconAction={{
              ariaLabel: `Change tenor, currently ${tenor} months`,
              onClick: () => {
                setPendingTenor(tenor);
                setSelectionType("tenor");
              },
            }}
            onActivate={() => {
              setPendingTenor(tenor);
              setSelectionType("tenor");
            }}
            helperText="Select one of offered options"
          />
        </section>

        <section className="mt-[24px]" aria-label="Representative example">
          <SectionHeadingDivider title="REPRESENTATIVE EXAMPLE" className="px-[24px]" />
          <dl>
            <RepresentativeExampleRow label="Amount" value={isAmountValid ? formatDepositAmount(amount, currency, country) : "—"} />
            <RepresentativeExampleRow label="Tenor" value={`${tenor} months`} />
            <RepresentativeExampleRow
              label="Fixed NKS (Nominal interest rate)"
              value={`${rates.nominal.toLocaleString("sr-RS", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`}
              infoLabel="What is NKS?"
              onInfoClick={() => setInfoType("nks")}
            />
            <RepresentativeExampleRow
              label="EKS (Effective interest rate)"
              value={`${((rates.effective * tenor) / 12).toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
              highlighted
              infoLabel="What is EKS?"
              onInfoClick={() => setInfoType("eks")}
            />
            <RepresentativeExampleRow
              label="Total deposit amount and gross interest at maturity"
              value={isAmountValid ? formatDepositAmount(grossMaturity, currency, country) : "—"}
            />
            <RepresentativeExampleRow
              label="Tax"
              value={tax === 0 ? `0 ${currency}` : formatDepositAmount(tax, currency, country)}
            />
            <RepresentativeExampleRow
              label="Net deposit amount and interest at maturity"
              value={isAmountValid ? formatDepositAmount(netMaturity, currency, country) : "—"}
            />
            <RepresentativeExampleRow label="Criteria for index deposit" value="0" />
            <RepresentativeExampleRow label="Cost payable by the Client" value="0" />
            <RepresentativeExampleRow label="Price updated at" value="03.01.2026" />
          </dl>
        </section>

        <p className="uc-type-n5 mt-[16px] px-[24px] pb-[24px] text-center text-[var(--uc-text-muted)]">
          {TERM_DEPOSIT_DISCLAIMER}
        </p>
      </main>

      <footer className="shrink-0 bg-[var(--uc-surface)] px-[24px] pb-[var(--uc-phone-bottom-reserve,34px)] pt-[8px]">
        <button
          type="button"
          disabled={!isAmountValid}
          onClick={() => setRequestStep("contact")}
          className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] uc-type-l2 text-[var(--uc-static-white)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          Request offer
        </button>
      </footer>

      {selectionType ? (
        <DepositSelectionSheet
          type={selectionType}
          selected={selectionType === "currency" ? pendingCurrency : pendingTenor}
          onSelect={(value) => {
            if (selectionType === "currency") setPendingCurrency(value as DepositCurrency);
            else setPendingTenor(value as TenorMonths);
          }}
          onConfirm={handleSelectionConfirm}
          onClose={() => setSelectionType(null)}
        />
      ) : null}
      {infoType === "simulator" ? <SimulatorInfoSheet onClose={() => setInfoType(null)} /> : null}
      {infoType && infoType !== "simulator" ? <DepositInfoSheet type={infoType} onClose={() => setInfoType(null)} /> : null}
    </div>
  );
}
